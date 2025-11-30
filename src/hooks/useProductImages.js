import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for fetching product images from product_images table
 * @param {string} productId - Product UUID
 * @returns {Object} { images: Array, loading: boolean, error: Error|null }
 */
export const useProductImages = (productId) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    fetchImages();
  }, [productId]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('is_primary', { ascending: false });

      if (fetchError) throw fetchError;

      setImages(data || []);
    } catch (err) {
      console.error('Error fetching product images:', err);
      setError(err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  return { images, loading, error, refetch: fetchImages };
};
