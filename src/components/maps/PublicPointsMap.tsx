import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Loader2, MapPin, AlertCircle, Map, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PickupPoint {
  id: string;
  name: string;
  title?: string | null;
  address: string;
  city: string;
  lat?: number | null;
  lng?: number | null;
  is_active: boolean;
  producer_id: string;
  slug?: string | null;
  producer?: {
    producer_name: string;
    slug: string;
  };
}

type MapMode = 'all' | 'category' | 'producer' | 'single';
type ViewMode = 'map' | 'list';

interface PublicPointsMapProps {
  mode: MapMode;
  categoryId?: string;
  categorySlug?: string;
  producerId?: string;
  producerSlug?: string;
  pointId?: string;
  showCityFilter?: boolean;
  showPointsList?: boolean;
  showViewToggle?: boolean;
  height?: string;
  className?: string;
}

// Component to fit bounds to markers
function FitBounds({ points }: { points: PickupPoint[] }) {
  const map = useMap();

  useEffect(() => {
    const validPoints = points.filter(p => p.lat && p.lng);
    if (validPoints.length === 0) return;

    if (validPoints.length === 1) {
      map.setView([validPoints[0].lat!, validPoints[0].lng!], 15);
    } else {
      const bounds = L.latLngBounds(
        validPoints.map(p => [p.lat!, p.lng!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return null;
}

// Animation variants for scroll reveal
const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function PublicPointsMap({
  mode,
  categoryId,
  categorySlug,
  producerId,
  producerSlug,
  pointId,
  showCityFilter = true,
  showPointsList = false,
  showViewToggle = true,
  height = '400px',
  className = '',
}: PublicPointsMapProps) {
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('map');

  // Fetch points based on mode
  useEffect(() => {
    const fetchPoints = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('pickup_points')
          .select(`
            id,
            name,
            title,
            address,
            city,
            lat,
            lng,
            is_active,
            producer_id,
            slug,
            producer_profiles!fk_pickup_points_producer_id (
              producer_name,
              slug
            )
          `)
          .eq('is_active', true);

        if (mode === 'single' && pointId) {
          query = query.eq('id', pointId);
        } else if (mode === 'producer') {
          if (producerId) {
            query = query.eq('producer_id', producerId);
          } else if (producerSlug) {
            // Get producer ID first
            const { data: producer } = await supabase
              .from('producer_profiles')
              .select('id')
              .eq('slug', producerSlug)
              .single();
            
            if (producer) {
              query = query.eq('producer_id', producer.id);
            } else {
              setPoints([]);
              setLoading(false);
              return;
            }
          }
        } else if (mode === 'category') {
          // Get producers in this category
          let categoryFilter = categoryId;
          
          if (!categoryFilter && categorySlug) {
            const { data: cat } = await supabase
              .from('categories')
              .select('id')
              .eq('slug', categorySlug)
              .single();
            categoryFilter = cat?.id;
          }
          
          if (categoryFilter) {
            const { data: producerCategories } = await supabase
              .from('producer_categories')
              .select('producer_id')
              .eq('category_id', categoryFilter);
            
            const producerIds = producerCategories?.map(pc => pc.producer_id).filter(Boolean) || [];
            
            if (producerIds.length > 0) {
              query = query.in('producer_id', producerIds);
            } else {
              setPoints([]);
              setLoading(false);
              return;
            }
          }
        }

        const { data, error: queryError } = await query;

        if (queryError) {
          throw queryError;
        }

        // Transform data to include producer info
        const transformedPoints = (data || []).map(point => ({
          ...point,
          producer: point.producer_profiles ? {
            producer_name: (point.producer_profiles as any).producer_name,
            slug: (point.producer_profiles as any).slug,
          } : undefined,
        }));

        setPoints(transformedPoints);
      } catch (err) {
        console.error('Error fetching points:', err);
        setError('Ошибка при загрузке точек');
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [mode, categoryId, categorySlug, producerId, producerSlug, pointId]);

  // Get unique cities from loaded points
  const cities = useMemo(() => {
    const citySet = new Set(points.map(p => p.city).filter(Boolean));
    return Array.from(citySet).sort();
  }, [points]);

  // Filter points by selected city
  const filteredPoints = useMemo(() => {
    if (selectedCity === 'all') return points;
    return points.filter(p => p.city === selectedCity);
  }, [points, selectedCity]);

  // Points with valid coordinates
  const validPoints = useMemo(() => {
    return filteredPoints.filter(p => p.lat != null && p.lng != null);
  }, [filteredPoints]);

  // Default center (Moldova/Chisinau)
  const defaultCenter: [number, number] = [47.0105, 28.8638];
  const defaultZoom = mode === 'single' ? 15 : 12;

  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Загрузка карты...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-destructive/10 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-2 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const center: [number, number] = validPoints.length > 0 
    ? [validPoints[0].lat!, validPoints[0].lng!]
    : defaultCenter;

  return (
    <motion.div
      className={`space-y-4 ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      {/* Controls row: City filter + View toggle */}
      <motion.div 
        className="flex flex-wrap items-center justify-between gap-3"
        variants={itemVariants}
      >
        {/* City filter */}
        {showCityFilter && mode !== 'single' && cities.length > 1 ? (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Выберите город" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все города</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div />
        )}

        {/* View toggle */}
        {showViewToggle && mode !== 'single' && filteredPoints.length > 0 && (
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-9">
              <TabsTrigger value="map" className="gap-1.5 px-3">
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline">Карта</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5 px-3">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Список</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </motion.div>

      {/* Map View */}
      {viewMode === 'map' && (
        <motion.div variants={itemVariants}>
          {validPoints.length === 0 ? (
            <div 
              className="flex items-center justify-center bg-muted rounded-lg"
              style={{ height }}
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                <MapPin className="h-8 w-8" />
                <span>
                  {selectedCity !== 'all' 
                    ? `В городе "${selectedCity}" пока нет точек`
                    : 'Нет точек для отображения на карте'
                  }
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden shadow-md" style={{ height }}>
              <MapContainer
                center={center}
                zoom={defaultZoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds points={validPoints} />
                
                {validPoints.map((point) => (
                  <Marker
                    key={point.id}
                    position={[point.lat!, point.lng!]}
                  >
                    <Popup>
                      <div className="min-w-[200px] space-y-2">
                        <h3 className="font-semibold text-sm">
                          {point.title || point.name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {point.address}, {point.city}
                        </p>
                        {point.producer && (
                          <p className="text-xs text-primary">
                            {point.producer.producer_name}
                          </p>
                        )}
                        <Link 
                          to={`/point/${point.id}`}
                          className="inline-block text-xs text-white bg-primary hover:bg-primary/90 px-3 py-1 rounded mt-2"
                        >
                          Открыть точку
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </motion.div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredPoints.map((point) => (
            <motion.div key={point.id} variants={itemVariants}>
              <Card className="p-4 h-full hover:shadow-lg transition-shadow duration-200">
                <h4 className="font-semibold text-base mb-2">
                  {point.title || point.name}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {point.address}, {point.city}
                </p>
                {point.producer && (
                  <p className="text-xs text-primary mb-3">
                    {point.producer.producer_name}
                  </p>
                )}
                <Link 
                  to={`/point/${point.id}`}
                  className="inline-block text-sm text-primary hover:underline font-medium"
                >
                  Подробнее →
                </Link>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Points list (optional - always visible below) */}
      {showPointsList && viewMode === 'map' && filteredPoints.length > 0 && (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4"
          variants={containerVariants}
        >
          {filteredPoints.slice(0, 6).map((point) => (
            <motion.div key={point.id} variants={itemVariants}>
              <Card className="p-3">
                <h4 className="font-medium text-sm truncate">
                  {point.title || point.name}
                </h4>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {point.address}, {point.city}
                </p>
                <Link 
                  to={`/point/${point.id}`}
                  className="text-xs text-primary hover:underline mt-2 inline-block"
                >
                  Подробнее →
                </Link>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
