import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useInventoryManagement() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deductInventory = async (pointId, productId, amount) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('atomic_inventory_deduction', {
        p_point_id: pointId,
        p_product_id: productId,
        p_deduct_amount: amount
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.message || 'Failed to deduct inventory');
      }

      return data;
    } catch (error) {
      console.error('Error deducting inventory:', error);
      toast({
        title: 'Ошибка списания',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = async (pointId, productId, newQuantity) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('point_inventory')
        .upsert({
          point_id: pointId,
          product_id: productId,
          bulk_qty: newQuantity
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Успешно',
        description: 'Остаток обновлен'
      });

      return data;
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getInventory = async (pointId, productId) => {
    try {
      const { data, error } = await supabase
        .from('point_inventory')
        .select('*')
        .eq('point_id', pointId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return null;
    }
  };

  return {
    loading,
    deductInventory,
    updateInventory,
    getInventory
  };
}