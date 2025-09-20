import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';

const InventoryManagement = ({ producerPointId }) => {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [bulkQty, setBulkQty] = useState('');
  const { toast } = useToast();
  const { updateInventory } = useInventoryManagement();

  useEffect(() => {
    if (producerPointId) {
      fetchData();
    }
  }, [producerPointId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch products for this producer
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch current inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('point_inventory')
        .select(`
          *,
          products (
            id,
            name,
            measure_kind,
            base_unit
          )
        `)
        .eq('point_id', producerPointId);

      if (inventoryError) throw inventoryError;
      setInventory(inventoryData || []);

      // Fetch variants
      const { data: variantsData, error: variantsError } = await supabase
        .from('point_variants')
        .select(`
          *,
          products (
            name
          )
        `)
        .eq('point_id', producerPointId);

      if (variantsError) throw variantsError;
      setVariants(variantsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async () => {
    if (!selectedProduct || !bulkQty) {
      toast({
        title: 'Ошибка',
        description: 'Выберите товар и укажите количество',
        variant: 'destructive'
      });
      return;
    }

    try {
      await updateInventory(producerPointId, selectedProduct, parseInt(bulkQty));
      fetchData(); // Refresh data
      setSelectedProduct('');
      setBulkQty('');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const createVariant = async (variantData) => {
    try {
      const { data, error } = await supabase
        .from('point_variants')
        .insert({
          point_id: producerPointId,
          ...variantData
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Успешно',
        description: 'Вариант продажи создан'
      });

      fetchData(); // Refresh data
      return data;
    } catch (error) {
      console.error('Error creating variant:', error);
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const formatQuantity = (qty, unit) => {
    if (unit === 'g') {
      return qty >= 1000 ? `${(qty / 1000).toFixed(1)} кг` : `${qty} г`;
    }
    return `${qty} шт`;
  };

  if (!producerPointId) {
    return (
      <Alert>
        <AlertDescription>
          Выберите точку выдачи для управления остатками
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Inventory Management */}
      <Card>
        <CardHeader>
          <CardTitle>Управление остатками</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-select">Товар</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите товар" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-qty">Количество в базовой единице</Label>
              <Input
                id="bulk-qty"
                type="number"
                value={bulkQty}
                onChange={(e) => setBulkQty(e.target.value)}
                placeholder="Введите количество"
                min="0"
              />
              {selectedProduct && (
                <p className="text-xs text-muted-foreground">
                  В {products.find(p => p.id === selectedProduct)?.base_unit === 'g' ? 'граммах' : 'штуках'}
                </p>
              )}
            </div>

            <div className="flex items-end">
              <Button onClick={handleUpdateInventory} disabled={loading}>
                Обновить остаток
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Текущие остатки</CardTitle>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <p className="text-muted-foreground">Остатки не найдены</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-medium">{item.products.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Остаток:</span>
                    <Badge variant="outline">
                      {formatQuantity(item.bulk_qty, item.products.base_unit)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Обновлено: {new Date(item.updated_at).toLocaleString('ru')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variants Management */}
      <Card>
        <CardHeader>
          <CardTitle>Варианты продаж</CardTitle>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <p className="text-muted-foreground">
              Варианты продаж не настроены. 
              <Button variant="link" className="p-0 h-auto ml-1">
                Создать первый вариант
              </Button>
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {variants.map((variant) => (
                <div key={variant.id} className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-medium">{variant.products.name}</h4>
                  <Badge variant="secondary">{variant.variant_name}</Badge>
                  <div className="space-y-1 text-sm">
                    <p>Режим: {variant.sale_mode}</p>
                    {variant.price_per_pack && (
                      <p>Цена за пачку: {variant.price_per_pack} лей</p>
                    )}
                    {variant.price_per_kg && (
                      <p>Цена за кг: {variant.price_per_kg} лей</p>
                    )}
                    {variant.price_per_unit && (
                      <p>Цена за шт: {variant.price_per_unit} лей</p>
                    )}
                    {variant.pack_size_base && (
                      <p>Размер пачки: {variant.pack_size_base} {variant.products.base_unit}</p>
                    )}
                  </div>
                  <Badge variant={variant.is_active ? "default" : "secondary"}>
                    {variant.is_active ? "Активен" : "Неактивен"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;