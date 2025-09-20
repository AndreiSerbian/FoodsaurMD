import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useGlobalCatalog(producerId = null) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        if (producerId) {
          query = query.eq('producer_id', producerId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching global catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [producerId]);

  return { products, loading, error };
}