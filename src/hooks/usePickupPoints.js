import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePickupPoints(producerSlug) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!producerSlug) return;

    const fetchPoints = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('pickup_points')
          .select(`
            id,
            name,
            address,
            city,
            working_hours_from,
            working_hours_to,
            work_hours,
            producer_profiles!inner(slug)
          `)
          .eq('producer_profiles.slug', producerSlug)
          .eq('is_active', true);

        if (error) throw error;
        setPoints(data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching pickup points:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [producerSlug]);

  return { points, loading, error };
}