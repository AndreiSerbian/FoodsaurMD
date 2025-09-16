import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from './use-toast';

/**
 * Хук для синхронизации остатков товаров в реальном времени
 * @param {string} pointId - ID точки выдачи
 * @param {Array} productIds - массив ID товаров для отслеживания
 */
export const useInventorySync = (pointId, productIds = []) => {
  const [inventory, setInventory] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchInventory = useCallback(async () => {
    if (!pointId || productIds.length === 0) return;
    
    setIsLoading(true);
    try {
      // Получаем остатки для всех товаров
      const { data: pointProducts } = await supabase
        .from('pickup_point_products')
        .select('product_id, quantity_available, updated_at')
        .eq('pickup_point_id', pointId)
        .in('product_id', productIds)
        .eq('is_available', true);

      const { data: pointInventory } = await supabase
        .from('point_inventory')
        .select('product_id, stock, updated_at')
        .eq('point_id', pointId)
        .in('product_id', productIds)
        .eq('is_listed', true);

      // Создаем карту остатков
      const newInventory = new Map();
      
      // Приоритет pickup_point_products
      pointProducts?.forEach(item => {
        newInventory.set(item.product_id, {
          stock: item.quantity_available,
          updatedAt: new Date(item.updated_at),
          source: 'pickup_point_products'
        });
      });

      // Fallback на point_inventory для товаров, которых нет в pickup_point_products
      pointInventory?.forEach(item => {
        if (!newInventory.has(item.product_id)) {
          newInventory.set(item.product_id, {
            stock: item.stock,
            updatedAt: new Date(item.updated_at),
            source: 'point_inventory'
          });
        }
      });

      setInventory(newInventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось синхронизировать остатки",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [pointId, productIds, toast]);

  useEffect(() => {
    fetchInventory();

    if (!pointId || productIds.length === 0) return;

    // Подписка на изменения в реальном времени с уникальным именем канала
    const channelName = `inventory-sync-${pointId}-${productIds.join('-')}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pickup_point_products',
          filter: `pickup_point_id=eq.${pointId}`
        },
        (payload) => {
          const productId = payload.new?.product_id || payload.old?.product_id;
          if (productIds.includes(productId)) {
            setInventory(prev => {
              const newMap = new Map(prev);
              if (payload.eventType === 'DELETE') {
                newMap.delete(productId);
              } else {
                newMap.set(productId, {
                  stock: payload.new?.quantity_available || 0,
                  updatedAt: new Date(payload.new?.updated_at || Date.now()),
                  source: 'pickup_point_products'
                });
              }
              return newMap;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'point_inventory',
          filter: `point_id=eq.${pointId}`
        },
        (payload) => {
          const productId = payload.new?.product_id || payload.old?.product_id;
          if (productIds.includes(productId)) {
            setInventory(prev => {
              const newMap = new Map(prev);
              // Только обновляем если нет записи в pickup_point_products
              if (!newMap.has(productId) || newMap.get(productId)?.source !== 'pickup_point_products') {
                if (payload.eventType === 'DELETE') {
                  newMap.delete(productId);
                } else {
                  newMap.set(productId, {
                    stock: payload.new?.stock || 0,
                    updatedAt: new Date(payload.new?.updated_at || Date.now()),
                    source: 'point_inventory'
                  });
                }
              }
              return newMap;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pointId, JSON.stringify(productIds), fetchInventory]);

  const getStock = useCallback((productId) => {
    return inventory.get(productId)?.stock || 0;
  }, [inventory]);

  const checkAvailability = useCallback((productId, requestedQty) => {
    const stock = getStock(productId);
    return {
      available: stock >= requestedQty,
      stock,
      canAdd: Math.max(0, stock)
    };
  }, [getStock]);

  const validateCartItems = useCallback((cartItems) => {
    const results = [];
    cartItems.forEach(item => {
      const check = checkAvailability(item.productId, item.qty);
      if (!check.available) {
        results.push({
          productId: item.productId,
          name: item.product?.name,
          requested: item.qty,
          available: check.stock,
          message: `Доступно только ${check.stock} шт.`
        });
      }
    });
    return results;
  }, [checkAvailability]);

  return {
    inventory,
    isLoading,
    fetchInventory,
    getStock,
    checkAvailability,
    validateCartItems
  };
};