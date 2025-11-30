import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit, Eye, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  price_regular: number | null
  price_discount: number | null
  is_active: boolean | null
  quantity: number
  producer_id: string
  producer_profiles?: {
    producer_name: string
    currency: string
  }
}

interface Producer {
  id: string
  producer_name: string
}

export default function AdminProductsManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [producers, setProducers] = useState<Producer[]>([])
  const [loading, setLoading] = useState(true)
  const [producerFilter, setProducerFilter] = useState('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [editDiscount, setEditDiscount] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    const [productsRes, producersRes] = await Promise.all([
      supabase
        .from('products')
        .select(`
          *,
          producer_profiles!fk_products_producer_id(producer_name, currency)
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('producer_profiles')
        .select('id, producer_name')
        .order('producer_name')
    ])

    if (productsRes.data) setProducts(productsRes.data)
    if (producersRes.data) setProducers(producersRes.data)
    
    setLoading(false)
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
    }
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setEditPrice(String(product.price_regular || ''))
    setEditDiscount(String(product.price_discount || ''))
  }

  const handleSave = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .update({
        price_regular: parseFloat(editPrice) || null,
        price_discount: editDiscount ? parseFloat(editDiscount) : null,
      })
      .eq('id', id)

    if (!error) {
      setProducts(products.map(p => 
        p.id === id 
          ? { 
              ...p, 
              price_regular: parseFloat(editPrice) || null,
              price_discount: editDiscount ? parseFloat(editDiscount) : null,
            } 
          : p
      ))
      setEditingId(null)
    }
  }

  const filteredProducts = products.filter(p => 
    producerFilter === 'all' || p.producer_id === producerFilter
  )

  if (loading) {
    return <div className="flex justify-center py-8">Загрузка...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управление товарами</h2>
      </div>

      {/* Фильтр по производителю */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label className="min-w-fit">Производитель:</Label>
            <Select value={producerFilter} onValueChange={setProducerFilter}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все производители</SelectItem>
                {producers.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.producer_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Список товаров */}
      <div className="space-y-3">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardContent className="pt-6">
              {editingId === product.id ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">{product.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Обычная цена</Label>
                      <Input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Цена со скидкой</Label>
                      <Input
                        type="number"
                        value={editDiscount}
                        onChange={(e) => setEditDiscount(e.target.value)}
                      />
                    </div>
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
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      {product.is_active ? (
                        <Badge variant="default">Активен</Badge>
                      ) : (
                        <Badge variant="secondary">Неактивен</Badge>
                      )}
                      {product.price_discount && (
                        <Badge variant="destructive">Скидка</Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div>Производитель: {product.producer_profiles?.producer_name}</div>
                      <div className="flex items-center gap-4">
                        <span>
                          Цена: {product.price_discount || product.price_regular} {product.producer_profiles?.currency}
                        </span>
                        {product.price_discount && (
                          <span className="line-through text-muted-foreground">
                            {product.price_regular} {product.producer_profiles?.currency}
                          </span>
                        )}
                        <span>Остаток: {product.quantity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(product)} variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Изменить цену
                    </Button>
                    <Button
                      onClick={() => handleToggleActive(product.id, product.is_active)}
                      variant={product.is_active ? "destructive" : "default"}
                      size="sm"
                    >
                      {product.is_active ? 'Деактивировать' : 'Активировать'}
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
