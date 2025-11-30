import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  description: string
  price_regular: number | null
  price_discount: number | null
  quantity: number
  is_active: boolean | null
  unit_type: string
}

interface ProducerProductsManagementProps {
  producerId: string
}

export default function ProducerProductsManagement({ producerId }: ProducerProductsManagementProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    price_regular: '',
    price_discount: '',
    quantity: '',
    is_active: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [producerId])

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('producer_id', producerId)
      .order('name')

    if (data) setProducts(data)
    setLoading(false)
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setFormData({
      price_regular: String(product.price_regular || ''),
      price_discount: String(product.price_discount || ''),
      quantity: String(product.quantity),
      is_active: product.is_active ?? true,
    })
  }

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          price_regular: parseFloat(formData.price_regular) || null,
          price_discount: formData.price_discount ? parseFloat(formData.price_discount) : null,
          quantity: parseInt(formData.quantity),
          is_active: formData.is_active,
        })
        .eq('id', id)

      if (error) throw error

      setProducts(products.map(p => 
        p.id === id 
          ? { 
              ...p, 
              price_regular: parseFloat(formData.price_regular) || null,
              price_discount: formData.price_discount ? parseFloat(formData.price_discount) : null,
              quantity: parseInt(formData.quantity),
              is_active: formData.is_active,
            } 
          : p
      ))
      
      setEditingId(null)
      toast({ title: 'Товар обновлен' })
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось обновить товар',
        variant: 'destructive' 
      })
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean | null) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (!error) {
      setProducts(products.map(p => 
        p.id === id ? { ...p, is_active: !currentStatus } : p
      ))
      toast({ title: currentStatus ? 'Товар скрыт' : 'Товар активирован' })
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Загрузка...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управление товарами</h2>
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="pt-6">
              {editingId === product.id ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Обычная цена</Label>
                      <Input
                        type="number"
                        value={formData.price_regular}
                        onChange={(e) => setFormData({ ...formData, price_regular: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Цена со скидкой</Label>
                      <Input
                        type="number"
                        value={formData.price_discount}
                        onChange={(e) => setFormData({ ...formData, price_discount: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Остаток</Label>
                      <Input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      id="is_active"
                    />
                    <Label htmlFor="is_active">Активен</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave(product.id)} size="sm">
                      Сохранить
                    </Button>
                    <Button onClick={() => setEditingId(null)} variant="outline" size="sm">
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      {product.is_active ? (
                        <Badge variant="default">Активен</Badge>
                      ) : (
                        <Badge variant="secondary">Скрыт</Badge>
                      )}
                      {product.price_discount && (
                        <Badge variant="destructive">Скидка</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                    
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">
                          Цена: {product.price_discount || product.price_regular} {product.unit_type}
                        </span>
                        {product.price_discount && (
                          <span className="line-through text-muted-foreground">
                            {product.price_regular} {product.unit_type}
                          </span>
                        )}
                      </div>
                      <div>Остаток: {product.quantity}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(product)} variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Изменить
                    </Button>
                    <Button
                      onClick={() => handleToggleActive(product.id, product.is_active)}
                      variant={product.is_active ? "secondary" : "default"}
                      size="sm"
                    >
                      {product.is_active ? (
                        <><EyeOff className="h-4 w-4 mr-1" />Скрыть</>
                      ) : (
                        <><Eye className="h-4 w-4 mr-1" />Показать</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
