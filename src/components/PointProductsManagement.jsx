import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Edit } from 'lucide-react';
import { format } from 'date-fns';

const PointProductsManagement = ({ producerProfile }) => {
  const [products, setProducts] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState('');
  const [pointProducts, setPointProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (producerProfile?.id) {
      loadProducts();
      loadPickupPoints();
    }
  }, [producerProfile]);

  useEffect(() => {
    if (selectedPoint) {
      loadPointProducts();
    }
  }, [selectedPoint]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('producer_id', producerProfile.id)
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить товары",
        variant: "destructive"
      });
    }
  };

  const loadPickupPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('pickup_points')
        .select('*')
        .eq('producer_id', producerProfile.id)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setPickupPoints(data || []);
    } catch (error) {
      console.error('Error loading pickup points:', error);
    }
  };

  const loadPointProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('point_products')
        .select(`
          *,
          products (
            id,
            name,
            unit_type
          )
        `)
        .eq('point_id', selectedPoint);
      
      if (error) throw error;
      setPointProducts(data || []);
    } catch (error) {
      console.error('Error loading point products:', error);
    }
  };

  const addProductToPoint = async (productId) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('point_products')
        .insert({
          point_id: selectedPoint,
          product_id: productId,
          stock: 0,
          price_regular: 10.00, // Default price
          is_active: true
        });

      if (error) throw error;
      
      toast({
        title: "Успешно",
        description: "Товар добавлен в точку"
      });
      
      loadPointProducts();
    } catch (error) {
      console.error('Error adding product to point:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар в точку",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePointProduct = async (pointProductId, updates) => {
    setLoading(true);
    try {
      // Validate discount dates
      if (updates.discount_start && updates.discount_end) {
        const start = new Date(updates.discount_start);
        const end = new Date(updates.discount_end);
        if (start >= end) {
          throw new Error('Дата начала скидки должна быть раньше даты окончания');
        }
      }

      // Validate prices
      if (updates.price_regular <= 0) {
        throw new Error('Обычная цена должна быть больше 0');
      }

      if (updates.price_discount && updates.price_discount >= updates.price_regular) {
        throw new Error('Цена со скидкой должна быть меньше обычной цены');
      }

      const { error } = await supabase
        .from('point_products')
        .update(updates)
        .eq('id', pointProductId);

      if (error) throw error;
      
      toast({
        title: "Успешно",
        description: "Товар обновлен"
      });
      
      loadPointProducts();
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating point product:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить товар",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromPoint = async (pointProductId) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('point_products')
        .delete()
        .eq('id', pointProductId);

      if (error) throw error;
      
      toast({
        title: "Успешно",
        description: "Товар удален из точки"
      });
      
      loadPointProducts();
    } catch (error) {
      console.error('Error removing from point:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const availableProducts = products.filter(product => 
    !pointProducts.some(pp => pp.product_id === product.id)
  );

  const EditProductForm = ({ pointProduct, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      stock: pointProduct.stock,
      price_regular: pointProduct.price_regular,
      price_discount: pointProduct.price_discount || '',
      discount_start: pointProduct.discount_start ? format(new Date(pointProduct.discount_start), 'yyyy-MM-dd\'T\'HH:mm') : '',
      discount_end: pointProduct.discount_end ? format(new Date(pointProduct.discount_end), 'yyyy-MM-dd\'T\'HH:mm') : '',
      is_active: pointProduct.is_active
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const updates = {
        ...formData,
        price_discount: formData.price_discount ? parseFloat(formData.price_discount) : null,
        discount_start: formData.discount_start ? new Date(formData.discount_start).toISOString() : null,
        discount_end: formData.discount_end ? new Date(formData.discount_end).toISOString() : null
      };
      onSave(pointProduct.id, updates);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/50">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stock">Остаток</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <Label htmlFor="price_regular">Обычная цена</Label>
            <Input
              id="price_regular"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.price_regular}
              onChange={(e) => setFormData(prev => ({ ...prev, price_regular: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price_discount">Цена со скидкой</Label>
            <Input
              id="price_discount"
              type="number"
              step="0.01"
              min="0"
              value={formData.price_discount}
              onChange={(e) => setFormData(prev => ({ ...prev, price_discount: e.target.value }))}
              placeholder="Оставьте пустым, если нет скидки"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label>Активен</Label>
          </div>
        </div>

        {formData.price_discount && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount_start">Начало скидки</Label>
              <Input
                id="discount_start"
                type="datetime-local"
                value={formData.discount_start}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="discount_end">Окончание скидки</Label>
              <Input
                id="discount_end"
                type="datetime-local"
                value={formData.discount_end}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_end: e.target.value }))}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            Сохранить
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Управление товарами в точках</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pickup-point">Выберите точку выдачи</Label>
              <Select value={selectedPoint} onValueChange={setSelectedPoint}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите точку выдачи" />
                </SelectTrigger>
                <SelectContent>
                  {pickupPoints.map(point => (
                    <SelectItem key={point.id} value={point.id}>
                      {point.name} - {point.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPoint && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Товары в точке</h3>
                  {pointProducts.length === 0 ? (
                    <p className="text-muted-foreground">Товары не добавлены в эту точку</p>
                  ) : (
                    <div className="space-y-3">
                      {pointProducts.map(item => (
                        <div key={item.id}>
                          {editingProduct === item.id ? (
                            <EditProductForm
                              pointProduct={item}
                              onSave={updatePointProduct}
                              onCancel={() => setEditingProduct(null)}
                            />
                          ) : (
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium">{item.products.name}</h4>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <span>Остаток: {item.stock} {item.products.unit_type}</span>
                                  <span>Цена: {item.price_regular} лей/{item.products.unit_type}</span>
                                  {item.price_discount && (
                                    <span className="text-green-600">
                                      Скидка: {item.price_discount} лей/{item.products.unit_type}
                                    </span>
                                  )}
                                  <Badge variant={item.is_active ? "default" : "secondary"}>
                                    {item.is_active ? "Активен" : "Неактивен"}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingProduct(item.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFromPoint(item.id)}
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Добавить товары в точку</h3>
                  {availableProducts.length === 0 ? (
                    <p className="text-muted-foreground">Все товары уже добавлены в эту точку</p>
                  ) : (
                    <div className="space-y-2">
                      {availableProducts.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <div className="text-sm text-muted-foreground">
                              Фасовка: {product.unit_type}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addProductToPoint(product.id)}
                            disabled={loading}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Добавить
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PointProductsManagement;