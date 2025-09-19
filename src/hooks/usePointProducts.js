import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePointProducts(pointId) {
  const [pointProducts, setPointProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pointId) {
      setPointProducts([]);
      return;
    }

    const fetchPointProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('point_products')
          .select(`
            *,
            products (
              id,
              name,
              description,
              unit_type,
              ingredients,
              allergen_info
            )
          `)
          .eq('point_id', pointId)
          .eq('is_active', true);

        if (error) throw error;
        setPointProducts(data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching point products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPointProducts();
  }, [pointId]);

  // Helper function to check if discount is active
  const isDiscountActive = (pointProduct) => {
    if (!pointProduct.price_discount || !pointProduct.discount_start || !pointProduct.discount_end) {
      return false;
    }

    const now = new Date();
    const discountStart = new Date(pointProduct.discount_start);
    const discountEnd = new Date(pointProduct.discount_end);

    return now >= discountStart && now <= discountEnd;
  };

  // Helper function to get current price
  const getCurrentPrice = (pointProduct) => {
    return isDiscountActive(pointProduct) ? pointProduct.price_discount : pointProduct.price_regular;
  };

  // Helper function to calculate discount percentage
  const getDiscountPercentage = (pointProduct) => {
    if (!isDiscountActive(pointProduct)) return 0;
    return Math.round(((pointProduct.price_regular - pointProduct.price_discount) / pointProduct.price_regular) * 100);
  };

  return { 
    pointProducts, 
    loading, 
    error,
    isDiscountActive,
    getCurrentPrice,
    getDiscountPercentage
  };
}