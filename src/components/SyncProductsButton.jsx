import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const SyncProductsButton = ({ producerId }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const syncProductsToAllPoints = async () => {
    setLoading(true);
    try {
      // Получаем все точки выдачи производителя
      const { data: points, error: pointsError } = await supabase
        .from('pickup_points')
        .select('id')
        .eq('producer_id', producerId)
        .eq('is_active', true);

      if (pointsError) throw pointsError;

      if (!points || points.length === 0) {
        toast({
          title: "Информация",
          description: "У вас нет активных точек выдачи",
          variant: "default"
        });
        return;
      }

      // Получаем все товары производителя
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, quantity, in_stock')
        .eq('producer_id', producerId);

      if (productsError) throw productsError;

      if (!products || products.length === 0) {
        toast({
          title: "Информация", 
          description: "У вас нет товаров для синхронизации",
          variant: "default"
        });
        return;
      }

      let totalAdded = 0;

      // Для каждой точки выдачи
      for (const point of points) {
        // Получаем существующие привязки товаров
        const { data: existingProducts, error: existingError } = await supabase
          .from('pickup_point_products')
          .select('product_id')
          .eq('pickup_point_id', point.id);

        if (existingError) throw existingError;

        const existingProductIds = existingProducts?.map(p => p.product_id) || [];

        // Находим товары, которых нет в точке выдачи
        const newProducts = products.filter(p => !existingProductIds.includes(p.id));

        if (newProducts.length > 0) {
          // Добавляем недостающие товары
          const pickupPointProducts = newProducts.map(product => ({
            pickup_point_id: point.id,
            product_id: product.id,
            quantity_available: product.quantity,
            is_available: product.in_stock
          }));

          const { error: insertError } = await supabase
            .from('pickup_point_products')
            .insert(pickupPointProducts);

          if (insertError) throw insertError;

          totalAdded += newProducts.length;
        }
      }

      toast({
        title: "Синхронизация завершена",
        description: `Добавлено ${totalAdded} товаров в точки выдачи`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error syncing products:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось синхронизировать товары",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={syncProductsToAllPoints}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Синхронизация...' : 'Синхронизировать товары'}
    </Button>
  );
};

export default SyncProductsButton;