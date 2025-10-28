import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X } from 'lucide-react';
import { useToast } from './ui/use-toast';

const PointProductModal = ({ 
  product, 
  pointId, 
  existingVariant, 
  existingInventory, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    bulk_qty: 0,
    price_regular: '',
    price_discount: '',
    price_unit: 'шт',
    sale_mode: 'unit'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (existingVariant && existingInventory) {
      setFormData({
        bulk_qty: existingInventory.bulk_qty || 0,
        price_regular: existingVariant.price_per_unit || existingVariant.price_per_kg || existingVariant.price_per_pack || '',
        price_discount: existingVariant.price_discount || '',
        price_unit: getPriceUnitFromVariant(existingVariant),
        sale_mode: existingVariant.sale_mode || 'unit'
      });
    }
  }, [existingVariant, existingInventory]);

  const getPriceUnitFromVariant = (variant) => {
    if (variant.sale_mode === 'unit') return 'шт';
    if (variant.sale_mode === 'weight') return 'кг';
    if (variant.sale_mode === 'pack') return 'упак';
    return 'шт';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create/update point_inventory
      const { error: inventoryError } = await supabase
        .from('point_inventory')
        .upsert({
          point_id: pointId,
          product_id: product.id,
          bulk_qty: parseInt(formData.bulk_qty),
          is_listed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'point_id,product_id'
        });

      if (inventoryError) throw inventoryError;

      // 2. Create/update point_variants
      const priceField = formData.sale_mode === 'unit' ? 'price_per_unit' :
                         formData.sale_mode === 'weight' ? 'price_per_kg' : 
                         'price_per_pack';

      const variantData = {
        point_id: pointId,
        product_id: product.id,
        variant_name: 'Основной',
        sale_mode: formData.sale_mode,
        price_per_unit: formData.sale_mode === 'unit' ? parseFloat(formData.price_regular) : null,
        price_per_kg: formData.sale_mode === 'weight' ? parseFloat(formData.price_regular) : null,
        price_per_pack: formData.sale_mode === 'pack' ? parseFloat(formData.price_regular) : null,
        price_discount: formData.price_discount ? parseFloat(formData.price_discount) : null,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      const { error: variantError } = await supabase
        .from('point_variants')
        .upsert(variantData, {
          onConflict: 'point_id,product_id,variant_name'
        });

      if (variantError) throw variantError;

      toast({
        title: "Успешно",
        description: existingVariant ? "Товар обновлен в точке" : "Товар добавлен в точку"
      });

      onSave();
    } catch (error) {
      console.error('Error saving product to point:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить товар",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {existingVariant ? 'Редактировать товар в точке' : 'Добавить товар в точку'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h3 className="font-medium">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-gray-600 mt-1">{product.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bulk_qty">Количество остатков</Label>
            <Input
              id="bulk_qty"
              name="bulk_qty"
              type="number"
              min="0"
              value={formData.bulk_qty}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="sale_mode">Режим продажи</Label>
            <Select 
              value={formData.sale_mode} 
              onValueChange={(value) => setFormData({ ...formData, sale_mode: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unit">Штучный</SelectItem>
                <SelectItem value="weight">Весовой</SelectItem>
                <SelectItem value="pack">Упаковкой</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="price_unit">Единица измерения</Label>
            <Select 
              value={formData.price_unit} 
              onValueChange={(value) => setFormData({ ...formData, price_unit: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="шт">шт</SelectItem>
                <SelectItem value="кг">кг</SelectItem>
                <SelectItem value="г">г</SelectItem>
                <SelectItem value="л">л</SelectItem>
                <SelectItem value="мл">мл</SelectItem>
                <SelectItem value="упак">упак</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="price_regular">Обычная цена</Label>
            <Input
              id="price_regular"
              name="price_regular"
              type="number"
              step="0.01"
              min="0"
              value={formData.price_regular}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="price_discount">Цена со скидкой (опционально)</Label>
            <Input
              id="price_discount"
              name="price_discount"
              type="number"
              step="0.01"
              min="0"
              value={formData.price_discount}
              onChange={handleChange}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PointProductModal;
