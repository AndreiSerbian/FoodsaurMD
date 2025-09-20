import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function GlobalCatalogManagement({ producerProfile }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit_type: 'pcs',
    ingredients: '',
    allergen_info: '',
    sku: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    if (producerProfile?.id) {
      loadProducts();
    }
  }, [producerProfile]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('producer_id', producerProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить каталог товаров",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        
        toast({
          title: "Товар обновлен",
          description: "Товар успешно обновлен в каталоге",
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{
            ...formData,
            producer_id: producerProfile.id
          }]);

        if (error) throw error;
        
        toast({
          title: "Товар добавлен",
          description: "Новый товар добавлен в каталог",
        });
      }

      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      unit_type: product.unit_type,
      ingredients: product.ingredients || '',
      allergen_info: product.allergen_info || '',
      sku: product.sku || '',
      is_active: product.is_active
    });
  };

  const handleDelete = async (productId) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      toast({
        title: "Товар удален",
        description: "Товар удален из каталога",
      });
      
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      unit_type: 'pcs',
      ingredients: '',
      allergen_info: '',
      sku: '',
      is_active: true
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingProduct ? 'Редактировать товар' : 'Добавить товар в каталог'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название товара *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Единица измерения</label>
                <Select
                  value={formData.unit_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, unit_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Штука</SelectItem>
                    <SelectItem value="g">Грамм</SelectItem>
                    <SelectItem value="kg">Килограмм</SelectItem>
                    <SelectItem value="pack">Упаковка</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Описание *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ингредиенты</label>
                <Textarea
                  value={formData.ingredients}
                  onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Информация об аллергенах</label>
                <Textarea
                  value={formData.allergen_info}
                  onChange={(e) => setFormData(prev => ({ ...prev, allergen_info: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Артикул товара"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingProduct ? 'Обновить' : 'Добавить'} товар
              </Button>
              {editingProduct && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Отмена
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Каталог товаров</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Загрузка...</div>
          ) : products.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Каталог товаров пуст
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{product.name}</h4>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? 'Активен' : 'Неактивен'}
                      </Badge>
                      {product.sku && (
                        <Badge variant="outline">SKU: {product.sku}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{product.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Единица: {product.unit_type === 'pcs' ? 'шт' : product.unit_type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}