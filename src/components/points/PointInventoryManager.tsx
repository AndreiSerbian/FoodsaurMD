import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Package, Copy, Plus, Search, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getPointInventory, updatePointStock, syncProductsToPoint } from '@/modules/inventory/inventorySync.js';
import { formatPrice, formatQuantity } from '@/utils/unitUtils.js';
import { useToast } from '@/hooks/use-toast';
import QuantityInput from '@/components/QuantityInput';
import type { PickupPoint } from '@/types/supabase-points';

interface PointInventoryManagerProps {
  pointId: string;
  producerId: string;
  isNewPoint?: boolean;
}

interface InventoryItem {
  point_id: string;
  product_id: string;
  stock: number;
  is_listed: boolean;
  products: {
    id: string;
    name: string;
    price_regular: number;
    price_unit: string;
  };
}

interface Product {
  id: string;
  name: string;
  price_regular: number;
  price_unit: string;
  quantity: number;
}

export default function PointInventoryManager({ pointId, producerId, isNewPoint = false }: PointInventoryManagerProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [otherPoints, setOtherPoints] = useState<PickupPoint[]>([]);
  const [selectedSourcePoint, setSelectedSourcePoint] = useState<string>('');
  const [sourcePointInventory, setSourcePointInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isNewPoint && pointId) {
      loadInventory();
    }
    loadAllProducts();
    loadOtherPoints();
  }, [pointId, producerId, isNewPoint]);

  useEffect(() => {
    if (selectedSourcePoint) {
      loadSourcePointInventory();
    }
  }, [selectedSourcePoint]);

  const loadInventory = async () => {
    try {
      const data = await getPointInventory(pointId);
      setInventory(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить остатки',
        variant: 'destructive',
      });
    }
  };

  const loadAllProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price_regular, price_unit, quantity')
        .eq('producer_id', producerId);

      if (error) throw error;
      setAllProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOtherPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('pickup_points')
        .select('*')
        .eq('producer_id', producerId)
        .neq('id', pointId || 'dummy')
        .eq('is_active', true);

      if (error) throw error;
      setOtherPoints((data || []) as PickupPoint[]);
    } catch (error) {
      console.error('Error loading other points:', error);
    }
  };

  const loadSourcePointInventory = async () => {
    try {
      const data = await getPointInventory(selectedSourcePoint);
      setSourcePointInventory(data);
    } catch (error) {
      console.error('Error loading source point inventory:', error);
    }
  };

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      await updatePointStock(pointId, productId, newStock);
      await loadInventory();
      toast({
        title: 'Успешно',
        description: 'Остатки обновлены',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить остатки',
        variant: 'destructive',
      });
    }
  };

  const handleAddProduct = async (productId: string, stock: number = 0) => {
    try {
      await updatePointStock(pointId, productId, stock);
      await loadInventory();
      toast({
        title: 'Успешно',
        description: 'Товар добавлен в точку',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить товар',
        variant: 'destructive',
      });
    }
  };

  const handleSyncFromMainStock = async () => {
    try {
      setLoading(true);
      await syncProductsToPoint(pointId, producerId);
      await loadInventory();
      toast({
        title: 'Успешно',
        description: 'Товары синхронизированы с основными остатками',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось синхронизировать товары',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFromPoint = async (sourceProductId: string, targetStock: number) => {
    try {
      await handleAddProduct(sourceProductId, targetStock);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось скопировать товар',
        variant: 'destructive',
      });
    }
  };

  const getProductsNotInPoint = () => {
    const inventoryProductIds = new Set(inventory.map(item => item.product_id));
    return allProducts.filter(product => !inventoryProductIds.has(product.id));
  };

  const filteredInventory = inventory.filter(item =>
    item.products.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableProducts = getProductsNotInPoint().filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSourceInventory = sourcePointInventory.filter(item =>
    item.products.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isNewPoint) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Управление товарами
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Сначала сохраните точку, затем вы сможете управлять товарами
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Управление товарами в точке
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Текущие товары</TabsTrigger>
            <TabsTrigger value="add">Добавить товары</TabsTrigger>
            <TabsTrigger value="copy">Скопировать из другой точки</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск товаров..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSyncFromMainStock} disabled={loading} className="gap-2">
                <Copy className="h-4 w-4" />
                Синхронизировать с основными остатками
              </Button>
            </div>

            {filteredInventory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>В этой точке пока нет товаров</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredInventory.map((item) => (
                  <div key={item.product_id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.products.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.products.price_regular)} / {item.products.price_unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label>Остаток:</Label>
                          <QuantityInput
                            value={item.stock}
                            unit={item.products.price_unit}
                            onChange={(value) => handleStockUpdate(item.product_id, value)}
                            className="w-24"
                            showButtons={true}
                          />
                        </div>
                        <Badge variant={item.is_listed ? 'default' : 'secondary'}>
                          {item.is_listed ? 'Активен' : 'Скрыт'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск товаров..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredAvailableProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Все товары уже добавлены в эту точку</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAvailableProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(product.price_regular)} / {product.price_unit}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Основной остаток: {formatQuantity(product.quantity, product.price_unit)}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleAddProduct(product.id, Math.min(product.quantity, 10))}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Добавить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="copy" className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Выберите точку-источник</Label>
                <Select value={selectedSourcePoint} onValueChange={setSelectedSourcePoint}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите точку для копирования товаров" />
                  </SelectTrigger>
                  <SelectContent>
                    {otherPoints.map(point => (
                      <SelectItem key={point.id} value={point.id}>
                        {point.title || point.name} - {point.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedSourcePoint && (
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск товаров..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
            </div>

            {selectedSourcePoint ? (
              filteredSourceInventory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>В выбранной точке нет товаров для копирования</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSourceInventory.map((item) => {
                    const isAlreadyInPoint = inventory.some(inv => inv.product_id === item.product_id);
                    
                    return (
                      <div key={item.product_id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.products.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(item.products.price_regular)} / {item.products.price_unit}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Остаток в источнике: {formatQuantity(item.stock, item.products.price_unit)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isAlreadyInPoint && (
                              <Badge variant="secondary">Уже добавлен</Badge>
                            )}
                            <Button 
                              onClick={() => handleCopyFromPoint(item.product_id, item.stock)}
                              disabled={isAlreadyInPoint}
                              variant={isAlreadyInPoint ? "outline" : "default"}
                              className="gap-2"
                            >
                              <ArrowRight className="h-4 w-4" />
                              {isAlreadyInPoint ? 'Обновить остаток' : 'Скопировать'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Выберите точку-источник для копирования товаров</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}