import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import { Trash2, Edit, Plus } from 'lucide-react';
import PointProductModal from './PointProductModal';

const ProductInventoryManager = ({ producerProfile }) => {
  const [products, setProducts] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState('');
  const [pointInventory, setPointInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalVariant, setModalVariant] = useState(null);
  const [modalInventory, setModalInventory] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (producerProfile?.id) {
      loadProducts();
      loadPickupPoints();
    }
  }, [producerProfile]);

  useEffect(() => {
    if (selectedPoint) {
      loadPointInventory();
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

  const loadPointInventory = async () => {
    try {
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('point_inventory')
        .select(`
          *,
          products (
            id,
            name,
            description,
            product_images (
              image_url,
              is_primary
            )
          )
        `)
        .eq('point_id', selectedPoint)
        .eq('is_listed', true);
      
      if (inventoryError) throw inventoryError;

      // Fetch variants for each product
      const productIds = inventoryData.map(inv => inv.product_id);
      const { data: variantsData, error: variantsError } = await supabase
        .from('point_variants')
        .select('*')
        .eq('point_id', selectedPoint)
        .in('product_id', productIds)
        .eq('is_active', true);

      if (variantsError) throw variantsError;

      // Merge inventory with variants
      const mergedData = inventoryData.map(inv => {
        const variant = variantsData.find(v => v.product_id === inv.product_id);
        return {
          ...inv,
          variant: variant || null
        };
      });

      setPointInventory(mergedData || []);
    } catch (error) {
      console.error('Error loading point inventory:', error);
    }
  };

  const updateStock = async (productId, newStock) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('point_inventory')
        .upsert({
          point_id: selectedPoint,
          product_id: productId,
          bulk_qty: newStock,
          is_listed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'point_id,product_id'
        });

      if (error) throw error;
      
      toast({
        title: "Успешно",
        description: "Остаток обновлен"
      });
      
      loadPointInventory();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить остаток",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (product) => {
    setModalProduct(product);
    setModalVariant(null);
    setModalInventory(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    const product = products.find(p => p.id === item.product_id);
    setModalProduct(product || item.products);
    setModalVariant(item.variant);
    setModalInventory(item);
    setShowModal(true);
  };

  const handleModalSave = () => {
    setShowModal(false);
    setModalProduct(null);
    setModalVariant(null);
    setModalInventory(null);
    loadPointInventory();
  };

  const removeFromPoint = async (productId) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('point_inventory')
        .update({ is_listed: false })
        .eq('point_id', selectedPoint)
        .eq('product_id', productId);

      if (error) throw error;
      
      toast({
        title: "Успешно",
        description: "Товар удален из точки"
      });
      
      loadPointInventory();
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
    !pointInventory.some(inv => inv.product_id === product.id)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Управление остатками по точкам</CardTitle>
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
                  {pointInventory.length === 0 ? (
                    <p className="text-gray-500">Товары не добавлены в эту точку</p>
                  ) : (
                    <div className="space-y-3">
                      {pointInventory.map(item => {
                        const variant = item.variant;
                        const price = variant ? (variant.price_per_unit || variant.price_per_kg || variant.price_per_pack) : null;
                        const priceDiscount = variant?.price_discount;
                        const unit = variant ? (variant.sale_mode === 'unit' ? 'шт' : variant.sale_mode === 'weight' ? 'кг' : 'упак') : '';
                        
                        return (
                          <div key={item.product_id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.products.name}</h4>
                              {variant && (
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-sm text-gray-600">
                                    Обычная цена: {price} лей/{unit}
                                  </span>
                                  {priceDiscount && (
                                    <span className="text-sm text-green-600">
                                      Цена со скидкой: {priceDiscount} лей/{unit}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`stock-${item.product_id}`} className="text-sm">Остаток:</Label>
                                <Input
                                  id={`stock-${item.product_id}`}
                                  type="number"
                                  min="0"
                                  value={item.bulk_qty}
                                  onChange={(e) => updateStock(item.product_id, parseInt(e.target.value) || 0)}
                                  className="w-20"
                                  disabled={loading}
                                />
                                {variant && <span className="text-sm text-gray-500">{unit}</span>}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(item)}
                                disabled={loading}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromPoint(item.product_id)}
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Добавить товары в точку</h3>
                  {availableProducts.length === 0 ? (
                    <p className="text-gray-500">Все товары уже добавлены в эту точку</p>
                  ) : (
                    <div className="space-y-2">
                      {availableProducts.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            {product.description && (
                              <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAddModal(product)}
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

      {showModal && modalProduct && (
        <PointProductModal
          product={modalProduct}
          pointId={selectedPoint}
          existingVariant={modalVariant}
          existingInventory={modalInventory}
          onSave={handleModalSave}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ProductInventoryManager;
