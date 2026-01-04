import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, ChevronLeft, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import PublicPointsMap from '@/components/maps/PublicPointsMap';
import { formatDayHours, WEEKDAYS } from '@/modules/points/workHoursUtil';

interface PointData {
  id: string;
  name: string;
  title: string | null;
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  work_hours: Record<string, Array<{open: string; close: string}>> | null;
  is_active: boolean;
  producer_id: string;
  discount_available_from: string | null;
  discount_available_to: string | null;
  producer_profiles: {
    producer_name: string;
    slug: string;
    logo_url: string | null;
  } | null;
}

const PointDetail = () => {
  const { pointId } = useParams<{ pointId: string }>();
  const navigate = useNavigate();
  const [point, setPoint] = useState<PointData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pointId) {
      fetchPointData();
    }
  }, [pointId]);

  const fetchPointData = async () => {
    try {
      const { data, error } = await supabase
        .from('pickup_points')
        .select(`
          id,
          name,
          title,
          address,
          city,
          lat,
          lng,
          work_hours,
          is_active,
          producer_id,
          discount_available_from,
          discount_available_to,
          producer_profiles!fk_pickup_points_producer_id (
            producer_name,
            slug,
            logo_url
          )
        `)
        .eq('id', pointId)
        .single();

      if (error) throw error;
      setPoint(data as unknown as PointData);
    } catch (error) {
      console.error('Error fetching point:', error);
      setPoint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProducts = () => {
    if (point?.producer_profiles?.slug) {
      navigate(`/producer/${point.producer_profiles.slug}/products?pointId=${point.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!point) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Точка не найдена</h2>
        <p className="text-muted-foreground mb-8">К сожалению, такой точки выдачи нет в нашей базе.</p>
        <Link to="/" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  const displayName = point.title || point.name;
  const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link 
            to={point.producer_profiles?.slug ? `/producer/${point.producer_profiles.slug}` : '/'}
            className="inline-flex items-center text-primary hover:text-primary/80 transition"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            {point.producer_profiles?.producer_name || 'Назад'}
          </Link>
        </motion.div>

        {/* Point header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{point.address}, {point.city}</span>
              </div>
            </div>
            {!point.is_active && (
              <Badge variant="secondary">Неактивна</Badge>
            )}
          </div>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <PublicPointsMap
            mode="single"
            pointId={point.id}
            showCityFilter={false}
            height="300px"
          />
        </motion.div>

        {/* Info cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* Producer card */}
          {point.producer_profiles && (
            <Card className="p-6">
              <div className="flex items-center gap-4">
                {point.producer_profiles.logo_url ? (
                  <img 
                    src={point.producer_profiles.logo_url} 
                    alt={point.producer_profiles.producer_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Store className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{point.producer_profiles.producer_name}</h3>
                  <Link 
                    to={`/producer/${point.producer_profiles.slug}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Перейти к производителю →
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Work hours card */}
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Часы работы</h3>
                {point.work_hours ? (
                  <div className="text-sm text-muted-foreground space-y-1">
                    {dayOrder.map((dayKey) => (
                      <div key={dayKey} className="flex justify-between gap-4">
                        <span>{WEEKDAYS[dayKey]}:</span>
                        <span>{formatDayHours(point.work_hours?.[dayKey] || [])}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Не указаны</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Discount info */}
        {(point.discount_available_from || point.discount_available_to) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-5 w-5" />
                <span className="font-medium">
                  Время скидок: {point.discount_available_from || '—'} – {point.discount_available_to || '—'}
                </span>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Action button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Button 
            size="lg" 
            className="w-full sm:w-auto"
            onClick={handleViewProducts}
          >
            Смотреть товары
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default PointDetail;
