import React, { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { RefreshCw, AlertTriangle } from 'lucide-react';

const InventorySync = ({ pointId, productId, currentQty = 0 }) => {
  const [stock, setStock] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { toast } = useToast();

  const fetchStock = async () => {
    if (!pointId || !productId) return;
    
    setIsLoading(true);
    try {
      // Проверяем актуальные остатки
      const { data: pointProduct } = await supabase
        .from('pickup_point_products')
        .select('quantity_available, updated_at')
        .eq('pickup_point_id', pointId)
        .eq('product_id', productId)
        .eq('is_available', true)
        .maybeSingle();

      if (pointProduct) {
        setStock(pointProduct.quantity_available);
        setLastUpdate(new Date(pointProduct.updated_at));
      } else {
        // Fallback на point_inventory
        const { data: inventory } = await supabase
          .from('point_inventory')
          .select('stock, updated_at')
          .eq('point_id', pointId)
          .eq('product_id', productId)
          .eq('is_listed', true)
          .maybeSingle();

        if (inventory) {
          setStock(inventory.stock);
          setLastUpdate(new Date(inventory.updated_at));
        }
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      toast({
        title: "Ошибка синхронизации",
        description: "Не удалось получить актуальные остатки",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();

    if (!pointId || !productId) return;

    // Подписка на изменения остатков в реальном времени с уникальным именем канала
    const channelName = `inventory-sync-${pointId}-${productId}`;
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
          if (payload.new?.product_id === productId) {
            setStock(payload.new.quantity_available);
            setLastUpdate(new Date(payload.new.updated_at));
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
          if (payload.new?.product_id === productId) {
            setStock(payload.new.stock);
            setLastUpdate(new Date(payload.new.updated_at));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pointId, productId]);

  const getStockStatus = () => {
    if (stock === null) return { color: 'secondary', text: 'Загрузка...' };
    if (stock === 0) return { color: 'destructive', text: 'Нет в наличии' };
    if (stock <= 5) return { color: 'secondary', text: `Мало: ${stock} шт` };
    if (currentQty > stock) return { color: 'destructive', text: 'Превышен лимит' };
    return { color: 'default', text: `В наличии: ${stock} шт` };
  };

  const status = getStockStatus();
  const isOverLimit = currentQty > stock;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Badge variant={status.color} className="text-xs">
          {status.text}
        </Badge>
        <button
          onClick={fetchStock}
          disabled={isLoading}
          className="p-1 hover:bg-gray-100 rounded"
          title="Обновить остатки"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isOverLimit && (
        <Alert variant="destructive" className="p-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Запрашиваемое количество ({currentQty}) превышает доступные остатки ({stock})
          </AlertDescription>
        </Alert>
      )}

      {lastUpdate && (
        <p className="text-xs text-muted-foreground">
          Обновлено: {lastUpdate.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default InventorySync;