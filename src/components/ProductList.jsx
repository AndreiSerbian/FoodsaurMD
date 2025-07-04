
import React, { useState, useEffect } from 'react'
import { supabase } from '../integrations/supabase/client'
import { Button } from './ui/button'
import { Edit, Trash2, Package } from 'lucide-react'

const ProductList = ({ producerProfile, onEditProduct, onDeleteProduct }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (producerProfile?.id) {
      fetchProducts()
    }
  }, [producerProfile])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            image_url,
            is_primary
          )
        `)
        .eq('producer_id', producerProfile.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return

    try {
      // Удаляем изображения из storage
      const product = products.find(p => p.id === productId)
      if (product?.product_images) {
        for (const image of product.product_images) {
          const path = image.image_url.split('/').pop()
          await supabase.storage
            .from('product-images')
            .remove([`producers/${producerProfile.producer_name}/${path}`])
        }
      }

      // Удаляем товар
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (!error) {
        setProducts(products.filter(p => p.id !== productId))
        onDeleteProduct && onDeleteProduct()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const getPrimaryImage = (productImages) => {
    if (!productImages || productImages.length === 0) return null
    return productImages.find(img => img.is_primary) || productImages[0]
  }

  if (loading) {
    return <div className="text-center py-8">Загрузка товаров...</div>
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Товары не найдены</h3>
        <p className="text-gray-500">Добавьте свой первый товар для продажи</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const primaryImage = getPrimaryImage(product.product_images)
        return (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {primaryImage ? (
                  <img
                    src={primaryImage.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-green-600">
                      {product.price_discount || product.price_regular} lei
                    </span>
                    {product.price_discount && (
                      <span className="text-sm text-gray-500 line-through">
                        {product.price_regular} lei
                      </span>
                    )}
                    <span className="text-sm text-gray-500">/ {product.price_unit}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Остаток: {product.quantity} {product.price_unit}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    product.in_stock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.in_stock ? 'В наличии' : 'Нет в наличии'}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditProduct(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ProductList
