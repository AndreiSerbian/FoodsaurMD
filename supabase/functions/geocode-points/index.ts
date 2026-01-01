import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

async function geocodeAddress(address: string, city?: string): Promise<GeocodingResult | null> {
  try {
    const query = city ? `${address}, ${city}` : address;
    const encodedQuery = encodeURIComponent(query);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`,
      {
        headers: {
          'User-Agent': 'LovableApp/1.0 (contact@lovable.dev)'
        }
      }
    );

    if (!response.ok) {
      console.error('Geocoding request failed:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Rate limiting: wait between requests to respect Nominatim's 1 req/sec limit
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { producerId, dryRun = false } = await req.json();

    console.log('Starting geocoding process', { producerId, dryRun });

    // Build query for points without coordinates
    let query = supabase
      .from('pickup_points')
      .select('id, name, address, city, lat, lng')
      .or('lat.is.null,lng.is.null');

    if (producerId) {
      query = query.eq('producer_id', producerId);
    }

    const { data: points, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching points:', fetchError);
      throw fetchError;
    }

    if (!points || points.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No points without coordinates found',
          processed: 0,
          updated: 0,
          failed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${points.length} points without coordinates`);

    const results = {
      processed: 0,
      updated: 0,
      failed: 0,
      details: [] as Array<{
        id: string;
        name: string;
        status: 'success' | 'not_found' | 'error';
        lat?: number;
        lng?: number;
        error?: string;
      }>
    };

    for (const point of points) {
      results.processed++;
      
      console.log(`Processing point ${results.processed}/${points.length}: ${point.name}`);
      
      try {
        const geocoded = await geocodeAddress(point.address, point.city);
        
        if (geocoded) {
          if (!dryRun) {
            const { error: updateError } = await supabase
              .from('pickup_points')
              .update({ 
                lat: geocoded.lat, 
                lng: geocoded.lng 
              })
              .eq('id', point.id);

            if (updateError) {
              console.error(`Error updating point ${point.id}:`, updateError);
              results.failed++;
              results.details.push({
                id: point.id,
                name: point.name,
                status: 'error',
                error: updateError.message
              });
            } else {
              results.updated++;
              results.details.push({
                id: point.id,
                name: point.name,
                status: 'success',
                lat: geocoded.lat,
                lng: geocoded.lng
              });
            }
          } else {
            // Dry run - just report what would happen
            results.updated++;
            results.details.push({
              id: point.id,
              name: point.name,
              status: 'success',
              lat: geocoded.lat,
              lng: geocoded.lng
            });
          }
        } else {
          results.failed++;
          results.details.push({
            id: point.id,
            name: point.name,
            status: 'not_found',
            error: 'Address not found in geocoding service'
          });
        }
      } catch (error) {
        console.error(`Error processing point ${point.id}:`, error);
        results.failed++;
        results.details.push({
          id: point.id,
          name: point.name,
          status: 'error',
          error: error.message
        });
      }

      // Respect Nominatim rate limit: 1 request per second
      if (results.processed < points.length) {
        await delay(1100);
      }
    }

    console.log('Geocoding complete:', results);

    return new Response(
      JSON.stringify({ 
        success: true,
        dryRun,
        message: dryRun 
          ? `Dry run complete. Would update ${results.updated} of ${results.processed} points.`
          : `Geocoding complete. Updated ${results.updated} of ${results.processed} points.`,
        ...results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in geocode-points:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
