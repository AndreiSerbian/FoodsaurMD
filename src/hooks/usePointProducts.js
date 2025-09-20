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
        // Fetch products with their pricing info from point_products table
        const { data, error } = await supabase
          .from('point_products')
          .select(`
            id,
            stock,
            price_regular,
            price_discount,
            discount_start,
            discount_end,
            is_active,
            products (
              id,
              name,
              description,
              unit_type,
              ingredients,
              allergen_info,
              images,
              sku
            )
          `)
          .eq('point_id', pointId)
          .eq('is_active', true);

        if (error) throw error;
        
        // Transform data to match expected format
        const transformedData = (data || []).map(item => ({
          ...item.products,
          point: {
            point_product_id: item.id,
            stock: item.stock,
            price_regular: item.price_regular,
            price_discount: item.price_discount,
            discount_start: item.discount_start,
            discount_end: item.discount_end,
            is_active: item.is_active
          }
        }));

        setPointProducts(transformedData);
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
    if (!pointProduct.point?.price_discount || !pointProduct.point?.discount_start || !pointProduct.point?.discount_end) {
      return false;
    }

    const now = new Date();
    const discountStart = new Date(pointProduct.point.discount_start);
    const discountEnd = new Date(pointProduct.point.discount_end);

    return now >= discountStart && now <= discountEnd;
  };

  // Helper function to get current price
  const getCurrentPrice = (pointProduct) => {
    return isDiscountActive(pointProduct) ? pointProduct.point.price_discount : pointProduct.point.price_regular;
  };

  // Helper function to calculate discount percentage
  const getDiscountPercentage = (pointProduct) => {
    if (!isDiscountActive(pointProduct)) return 0;
    return Math.round(((pointProduct.point.price_regular - pointProduct.point.price_discount) / pointProduct.point.price_regular) * 100);
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