import { useState, useEffect } from 'react';
import { listPoints, getPointsByProducerSlug } from '@/modules/points/pointsApi.js';
import type { PickupPoint } from '@/types/supabase-points';

interface UsePointsOptions {
  producerId?: string;
  producerSlug?: string;
  activeOnly?: boolean;
  autoFetch?: boolean;
}

export function usePoints(options: UsePointsOptions = {}) {
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = async () => {
    if (!options.autoFetch && !options.producerId && !options.producerSlug) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data: PickupPoint[];
      
      if (options.producerSlug) {
        data = await getPointsByProducerSlug(options.producerSlug);
      } else {
        data = await listPoints({
          producerId: options.producerId,
          activeOnly: options.activeOnly
        });
      }
      
      setPoints(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке точек';
      setError(errorMessage);
      console.error('Error fetching points:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchPoints();
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchPoints();
    }
  }, [options.producerId, options.producerSlug, options.activeOnly]);

  return {
    points,
    loading,
    error,
    refetch,
    fetchPoints
  };
}

export function useActivePoints(producerSlug?: string) {
  return usePoints({
    producerSlug,
    activeOnly: true,
    autoFetch: !!producerSlug
  });
}