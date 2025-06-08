
import React, { useState, useEffect } from 'react'
import { supabase } from '../integrations/supabase/client'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

const ProductManagement = ({ profile }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_regular: '',
    price_discount: '',
    price_unit: 'шт',
    quantity: ''
  })

  useEffect(() => {
    if (profile?.id) {
      fetchProducts()
    }
  }, [profile])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('producer_id', profile.id)
        .order('created_at', { ascending: false })

      if (data) {
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          producer_id: profile.id,
          name: formData.name,
          description: formData.description,
          price_regular: parseFloat(formData.price_regular),
          price_discount: formData.price_discount ? parseFloat(formData.price_discount) : null,
          price_unit: formData.price_unit,
          quantity: parseInt(formData.quantity) || 0,
          in_stock: true
        }])
        .select()
        .single()

      if (data) {
        setProducts([data, ...products])
        setFormData({
          name: '',
          description: '',
          price_regular: '',
          price_discount: '',
          price_unit: 'шт',
          quantity: ''
        })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error adding product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Удалить товар?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (!error) {
        setProducts(products.filter(p => p.id !== productId))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading && !products.length) {
    return <div>Загрузка товаров...</div>
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Управление товарами
          </h3>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
          >
            {showAddForm ? 'Отмена' : 'Добавить товар'}
          </Button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddProduct} className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Название товара</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="price_regular">Обычная цена</Label>
                <Input
                  id="price_regular"
                  name="price_regular"
                  type="number"
                  step="0.01"
                  required
                  value={formData.price_regular}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="price_discount">Цена со скидкой</Label>
                <Input
                  id="price_discount"
                  name="price_discount"
                  type="number"
                  step="0.01"
                  value={formData.price_discount}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="price_unit">Единица измерения</Label>
                <select
                  id="price_unit"
                  name="price_unit"
                  value={formData.price_unit}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="шт">шт</option>
                  <option value="кг">кг</option>
                  <option value="л">л</option>
                  <option value="порция">порция</option>
                </select>
              </div>

              <div>
                <Label htmlFor="quantity">Количество</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Описание</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button type="submit" className="mt-4">
              Добавить товар
            </Button>
          </form>
        )}

        <div className="space-y-4">
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              У вас пока нет товаров. Добавьте первый товар!
            </p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm">
                      <span className="text-green-600 font-medium">
                        {product.price_discount || product.price_regular} MDL/{product.price_unit}
                      </span>
                      {product.price_discount && (
                        <span className="text-gray-500 line-through">
                          {product.price_regular} MDL
                        </span>
                      )}
                      <span className="text-gray-500">
                        Количество: {product.quantity}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductManagement
