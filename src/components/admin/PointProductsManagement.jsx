import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Edit3 } from 'lucide-react';

export default function PointProductsManagement({ producerProfile }) {
  const [products, setProducts] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState('');
  const [pointProducts, setPointProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    stock: 0,
    price_regular: '',
    price_discount: '',
    discount_start: '',
    discount_end: ''
  });
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
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить товары",
        variant: "destructive",
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
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить точки выдачи",
        variant: "destructive",
      });
    }
  };

  const loadPointProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('point_products')
        .select(`
          *,
          products (
            id,
            name,
            description,
            unit_type
          )
        `)
        .eq('point_id', selectedPoint)
        .order('created_at');

      if (error) throw error;
      setPointProducts(data || []);
    } catch (error) {
      console.error('Error loading point products:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить товары точки",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addProductToPoint = async (productId) => {
    try {
      const { error } = await supabase
        .from('point_products')
        .insert([{
          point_id: selectedPoint,
          product_id: productId,
          stock: 0,
          price_regular: 10.00,
          is_active: true
        }]);

      if (error) throw error;
      
      toast({
        title: "Товар добавлен",
        description: "Товар добавлен в точку выдачи",
      });
      
      loadPointProducts();
    } catch (error) {
      console.error('Error adding product to point:', error);
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updatePointProduct = async (pointProductId, updates) => {
    try {
      const { error } = await supabase
        .from('point_products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', pointProductId);

      if (error) throw error;
      
      toast({
        title: "Товар обновлен",
        description: "Параметры товара обновлены",
      });
      
      loadPointProducts();
      setEditingProduct(null);
      setFormData({
        stock: 0,
        price_regular: '',
        price_discount: '',
        discount_start: '',
        discount_end: ''
      });
    } catch (error) {
      console.error('Error updating point product:', error);
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeFromPoint = async (pointProductId) => {
    if (!confirm('Вы уверены, что хотите удалить товар из этой точки?')) return;

    try {
      const { error } = await supabase
        .from('point_products')
        .delete()
        .eq('id', pointProductId);

      if (error) throw error;
      
      toast({
        title: "Товар удален",
        description: "Товар удален из точки выдачи",
      });
      
      loadPointProducts();
    } catch (error) {
      console.error('Error removing product from point:', error);
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (pointProduct) => {
    setEditingProduct(pointProduct);
    setFormData({
      stock: pointProduct.stock,
      price_regular: pointProduct.price_regular,
      price_discount: pointProduct.price_discount || '',
      discount_start: pointProduct.discount_start ? pointProduct.discount_start.slice(0, 16) : '',
      discount_end: pointProduct.discount_end ? pointProduct.discount_end.slice(0, 16) : ''
    });
  };

  const handleSaveEdit = () => {
    const updates = {
      stock: parseInt(formData.stock),
      price_regular: parseFloat(formData.price_regular)
    };

    if (formData.price_discount) {
      updates.price_discount = parseFloat(formData.price_discount);
    }

    if (formData.discount_start && formData.discount_end) {
      updates.discount_start = formData.discount_start;
      updates.discount_end = formData.discount_end;
    }

    updatePointProduct(editingProduct.id, updates);
  };

  const availableProducts = products.filter(product => 
    !pointProducts.some(pp => pp.product_id === product.id)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Управление товарами в точках выдачи</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Выберите точку выдачи</label>
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
            <div className="space-y-6">
              {/* Available products to add */}
              {availableProducts.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Доступные товары для добавления</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableProducts.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addProductToPoint(product.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Добавить
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current point products */}
              <div>
                <h3 className="text-lg font-medium mb-3">Товары в точке выдачи</h3>
                {loading ? (
                  <div>Загрузка...</div>
                ) : pointProducts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    В этой точке выдачи нет товаров
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pointProducts.map(pointProduct => (
                      <div key={pointProduct.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{pointProduct.products.name}</h4>
                          <div className="flex gap-2">
                            <Badge variant={pointProduct.is_active ? "default" : "secondary"}>
                              {pointProduct.is_active ? 'Активен' : 'Неактивен'}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(pointProduct)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromPoint(pointProduct.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Остаток:</span> {pointProduct.stock}
                          </div>
                          <div>
                            <span className="font-medium">Цена:</span> {pointProduct.price_regular} лей
                          </div>
                          {pointProduct.price_discount && (
                            <div>
                              <span className="font-medium">Скидка:</span> {pointProduct.price_discount} лей
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Единица:</span> {pointProduct.products.unit_type}
                          </div>
                        </div>

                        {editingProduct?.id === pointProduct.id && (
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                            <h5 className="font-medium mb-3">Редактировать товар</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Остаток</label>
                                <Input
                                  type="number"
                                  value={formData.stock}
                                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Цена (лей)</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={formData.price_regular}
                                  onChange={(e) => setFormData(prev => ({ ...prev, price_regular: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Цена со скидкой (лей)</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={formData.price_discount}
                                  onChange={(e) => setFormData(prev => ({ ...prev, price_discount: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Начало скидки</label>
                                <Input
                                  type="datetime-local"
                                  value={formData.discount_start}
                                  onChange={(e) => setFormData(prev => ({ ...prev, discount_start: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Конец скидки</label>
                                <Input
                                  type="datetime-local"
                                  value={formData.discount_end}
                                  onChange={(e) => setFormData(prev => ({ ...prev, discount_end: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button onClick={handleSaveEdit}>
                                Сохранить
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setEditingProduct(null)}
                              >
                                Отмена
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}