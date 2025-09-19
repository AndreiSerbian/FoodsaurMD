import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDiscounts(productIds = []) {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productIds.length) return;

    const fetchDiscounts = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('discounts')
          .select('*')
          .in('product_id', productIds)
          .eq('is_active', true);

        if (error) throw error;
        setDiscounts(data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching discounts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, [productIds.join(',')]);

  return { discounts, loading, error };
}

// Helper function to check if current time is within discount period
export function isDiscountActive(discount, currentTime = new Date()) {
  const now = currentTime;
  const currentTimeStr = now.toTimeString().slice(0, 8); // HH:MM:SS format
  
  return currentTimeStr >= discount.start_time && currentTimeStr <= discount.end_time;
}

// Helper function to calculate discounted price
export function calculateDiscountedPrice(originalPrice, discount) {
  if (!discount) return originalPrice;
  
  if (discount.discount_percent) {
    return originalPrice * (1 - discount.discount_percent / 100);
  }
  
  if (discount.discount_amount) {
    return Math.max(0, originalPrice - discount.discount_amount);
  }
  
  return originalPrice;
}