import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { RefreshCw, Package, AlertTriangle, CheckCircle, Sync } from 'lucide-react';

const ProducerInventorySync = ({ producerId }) => {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [lastSync, setLastSync] = useState(null);
  const [syncStats, setSyncStats] = useState({ total: 0, synced: 0, errors: 0 });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);
  const { toast } = useToast();

  const fetchLowStockProducts = async () => {
    try {
      const { data: products } = await supabase
        .from('products')
        .select(`
          id, name, quantity,
          pickup_point_products!inner(
            pickup_point_id,
            quantity_available,
            pickup_points!inner(name)
          )
        `)
        .eq('producer_id', producerId)
        .lte('pickup_point_products.quantity_available', 5);

      setLowStockProducts(products || []);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    }
  };

  const syncAllProductsToAllPoints = async () => {
    setSyncStatus('syncing');
    setSyncStats({ total: 0, synced: 0, errors: 0 });

    try {
      // Получаем все точки выдачи производителя
      const { data: points, error: pointsError } = await supabase
        .from('pickup_points')
        .select('id, name')
        .eq('producer_id', producerId)
        .eq('is_active', true);

      if (pointsError) throw pointsError;

      if (!points || points.length === 0) {
        toast({
          title: "Информация",
          description: "У вас нет активных точек выдачи",
          variant: "default"
        });
        setSyncStatus('idle');
        return;
      }

      // Получаем все товары производителя
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, quantity, in_stock')
        .eq('producer_id', producerId);

      if (productsError) throw productsError;

      if (!products || products.length === 0) {
        toast({
          title: "Информация", 
          description: "У вас нет товаров для синхронизации",
          variant: "default"
        });
        setSyncStatus('idle');
        return;
      }

      let totalOperations = points.length * products.length;
      let successfulOperations = 0;
      let errorCount = 0;

      setSyncStats({ total: totalOperations, synced: 0, errors: 0 });

      // Для каждой точки выдачи
      for (const point of points) {
        // Получаем существующие привязки товаров
        const { data: existingProducts, error: existingError } = await supabase
          .from('pickup_point_products')
          .select('product_id, quantity_available')
          .eq('pickup_point_id', point.id);

        if (existingError) {
          console.error('Error fetching existing products:', existingError);
          errorCount += products.length;
          continue;
        }

        const existingProductMap = new Map(
          existingProducts?.map(p => [p.product_id, p.quantity_available]) || []
        );

        // Обрабатываем каждый товар
        for (const product of products) {
          try {
            if (existingProductMap.has(product.id)) {
              // Обновляем существующий товар
              const { error: updateError } = await supabase
                .from('pickup_point_products')
                .update({
                  quantity_available: product.quantity,
                  is_available: product.in_stock,
                  updated_at: new Date().toISOString()
                })
                .eq('pickup_point_id', point.id)
                .eq('product_id', product.id);

              if (updateError) throw updateError;
            } else {
              // Добавляем новый товар
              const { error: insertError } = await supabase
                .from('pickup_point_products')
                .insert({
                  pickup_point_id: point.id,
                  product_id: product.id,
                  quantity_available: product.quantity,
                  is_available: product.in_stock
                });

              if (insertError) throw insertError;
            }

            successfulOperations++;
            setSyncStats(prev => ({ ...prev, synced: successfulOperations }));
          } catch (error) {
            console.error(`Error syncing product ${product.name} to point ${point.name}:`, error);
            errorCount++;
            setSyncStats(prev => ({ ...prev, errors: prev.errors + 1 }));
          }
        }
      }

      setSyncStatus('success');
      setLastSync(new Date());
      
      toast({
        title: "Синхронизация завершена",
        description: `Успешно: ${successfulOperations}, Ошибок: ${errorCount}`,
        variant: errorCount > 0 ? "destructive" : "default"
      });

      // Обновляем данные о товарах с низкими остатками
      await fetchLowStockProducts();

    } catch (error) {
      console.error('Error syncing products:', error);
      setSyncStatus('error');
      toast({
        title: "Ошибка",
        description: "Не удалось синхронизировать товары",
        variant: "destructive"
      });
    }
  };

  const enableAutoSync = async () => {
    try {
      // Создаем триггер для автоматической синхронизации
      const { data, error } = await supabase.rpc('setup_auto_sync_trigger', {
        producer_id: producerId
      });

      if (error) throw error;

      setIsAutoSyncEnabled(true);
      toast({
        title: "Автосинхронизация включена",
        description: "Остатки будут обновляться автоматически при изменении товаров"
      });
    } catch (error) {
      console.error('Error enabling auto sync:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось включить автосинхронизацию",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchLowStockProducts();

    if (!producerId) return;

    // Подписка на изменения товаров для отслеживания синхронизации с уникальным каналом
    const channelId = Math.random().toString(36).substring(7);
    const channelName = `producer-inventory-sync-${producerId}-${channelId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `producer_id=eq.${producerId}`
        },
        () => {
          if (isAutoSyncEnabled) {
            // Автоматическая синхронизация при изменении товаров
            setTimeout(() => syncAllProductsToAllPoints(), 1000);
          }
        }
      );

    // Подписываемся на канал
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to producer inventory sync channel: ${channelName}`);
      }
    });

    return () => {
      console.log(`Cleaning up channel: ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [producerId, isAutoSyncEnabled]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sync className="h-5 w-5" />
            Синхронизация остатков
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={syncAllProductsToAllPoints}
              disabled={syncStatus === 'syncing'}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              {syncStatus === 'syncing' ? 'Синхронизация...' : 'Синхронизировать все'}
            </Button>

            <Button
              variant="outline"
              onClick={enableAutoSync}
              disabled={isAutoSyncEnabled}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {isAutoSyncEnabled ? 'Автосинхронизация включена' : 'Включить автосинхронизацию'}
            </Button>
          </div>

          {syncStatus === 'syncing' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Прогресс синхронизации:</span>
                <span>{syncStats.synced}/{syncStats.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(syncStats.synced / syncStats.total) * 100}%` }}
                />
              </div>
              {syncStats.errors > 0 && (
                <p className="text-sm text-destructive">Ошибок: {syncStats.errors}</p>
              )}
            </div>
          )}

          {lastSync && (
            <p className="text-sm text-muted-foreground">
              Последняя синхронизация: {lastSync.toLocaleString()}
            </p>
          )}

          <div className="flex gap-2">
            <Badge variant={syncStatus === 'success' ? 'default' : 
                            syncStatus === 'error' ? 'destructive' : 'secondary'}>
              {syncStatus === 'success' ? 'Синхронизировано' :
               syncStatus === 'error' ? 'Ошибка' :
               syncStatus === 'syncing' ? 'Синхронизация' : 'Готово к синхронизации'}
            </Badge>
            
            {isAutoSyncEnabled && (
              <Badge variant="outline">Автосинхронизация</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Товары с низким остатком
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map(product => (
                <Alert key={product.id} variant="destructive">
                  <Package className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{product.name}</strong> - остаток: {product.quantity} шт.
                    {product.pickup_point_products.map(pp => (
                      <div key={pp.pickup_point_id} className="text-xs">
                        {pp.pickup_points.name}: {pp.quantity_available} шт.
                      </div>
                    ))}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProducerInventorySync;