import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for fetching producer gallery images
 * @param {string} producerId - Producer UUID
 * @returns {Object} { images: Array, loading: boolean, error: Error|null }
 */
export const useProducerGallery = (producerId) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!producerId) {
      setLoading(false);
      return;
    }

    fetchGallery();
  }, [producerId]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('producer_gallery')
        .select('*')
        .eq('producer_id', producerId)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setImages(data || []);
    } catch (err) {
      console.error('Error fetching producer gallery:', err);
      setError(err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  return { images, loading, error, refetch: fetchGallery };
};
