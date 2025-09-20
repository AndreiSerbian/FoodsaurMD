import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useProductVariants(pointId) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pointId) {
      setVariants([]);
      return;
    }

    const fetchVariants = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('point_variants')
          .select(`
            *,
            products (
              id,
              name,
              description,
              images,
              measure_kind,
              base_unit,
              ingredients,
              allergen_info
            ),
            point_inventory!inner (
              bulk_qty
            )
          `)
          .eq('point_id', pointId)
          .eq('is_active', true);

        if (error) throw error;
        setVariants(data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching variants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [pointId]);

  // Helper functions for pricing and availability
  const isDiscountActive = (variant) => {
    if (!variant.price_discount || !variant.discount_start || !variant.discount_end) {
      return false;
    }

    const now = new Date();
    const discountStart = new Date(variant.discount_start);
    const discountEnd = new Date(variant.discount_end);

    return now >= discountStart && now <= discountEnd;
  };

  const getCurrentPrice = (variant) => {
    const { sale_mode } = variant;
    
    if (isDiscountActive(variant)) {
      return variant.price_discount;
    }

    switch (sale_mode) {
      case 'per_pack':
        return variant.price_per_pack;
      case 'per_weight':
        return variant.price_per_kg;
      case 'per_unit':
        return variant.price_per_unit;
      default:
        return 0;
    }
  };

  const getAvailability = (variant) => {
    const bulkQty = variant.point_inventory[0]?.bulk_qty || 0;
    
    switch (variant.sale_mode) {
      case 'per_pack':
        return Math.floor(bulkQty / variant.pack_size_base);
      case 'per_weight':
        return bulkQty; // in grams
      case 'per_unit':
        return bulkQty; // in pieces
      default:
        return 0;
    }
  };

  const calculatePrice = (variant, quantity) => {
    const currentPrice = getCurrentPrice(variant);
    
    switch (variant.sale_mode) {
      case 'per_pack':
        return currentPrice * quantity;
      case 'per_weight':
        return currentPrice * (quantity / 1000); // price per kg, quantity in grams
      case 'per_unit':
        return currentPrice * quantity;
      default:
        return 0;
    }
  };

  const getDiscountPercentage = (variant) => {
    if (!isDiscountActive(variant)) return 0;
    
    const originalPrice = (() => {
      switch (variant.sale_mode) {
        case 'per_pack': return variant.price_per_pack;
        case 'per_weight': return variant.price_per_kg;
        case 'per_unit': return variant.price_per_unit;
        default: return 0;
      }
    })();

    if (originalPrice === 0) return 0;
    
    return Math.round(((originalPrice - variant.price_discount) / originalPrice) * 100);
  };

  return {
    variants,
    loading,
    error,
    isDiscountActive,
    getCurrentPrice,
    getAvailability,
    calculatePrice,
    getDiscountPercentage
  };
}