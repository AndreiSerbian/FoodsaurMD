
import React, { useState, useEffect } from 'react'
import { supabase } from '../integrations/supabase/client'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { X, Upload, Trash2 } from 'lucide-react'

const ProductForm = ({ product, onSave, onCancel, producerProfile }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_regular: '',
    price_discount: '',
    quantity: '',
    price_unit: 'шт',
    in_stock: true
  })
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price_regular: product.price_regular || '',
        price_discount: product.price_discount || '',
        quantity: product.quantity || '',
        price_unit: product.price_unit || 'шт',
        in_stock: product.in_stock
      })
      fetchProductImages()
    }
  }, [product])

  const fetchProductImages = async () => {
    if (!product?.id) return

    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .order('is_primary', { ascending: false })

      if (!error && data) {
        setImages(data)
      }
    } catch (error) {
      console.error('Error fetching product images:', error)
    }
  }

  const handleImageUpload = async (files) => {
    if (!files.length) return

    setUploading(true)
    const uploadedImages = []

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
        const filePath = `producers/${producerProfile?.producer_name || 'unknown'}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        uploadedImages.push({
          image_url: publicUrl,
          is_primary: images.length === 0 && uploadedImages.length === 0
        })
      } catch (error) {
        console.error('Error uploading image:', error)
      }
    }

    setImages([...images, ...uploadedImages])
    setUploading(false)
  }

  const removeImage = async (imageIndex) => {
    const imageToRemove = images[imageIndex]
    
    if (imageToRemove.id) {
      try {
        await supabase
          .from('product_images')
          .delete()
          .eq('id', imageToRemove.id)
      } catch (error) {
        console.error('Error removing image from database:', error)
      }
    }

    const newImages = images.filter((_, index) => index !== imageIndex)
    if (newImages.length > 0 && imageToRemove.is_primary) {
      newImages[0].is_primary = true
    }
    setImages(newImages)
  }

  const setPrimaryImage = (imageIndex) => {
    const newImages = images.map((img, index) => ({
      ...img,
      is_primary: index === imageIndex
    }))
    setImages(newImages)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        ...formData,
        producer_id: producerProfile.id,
        price_regular: parseFloat(formData.price_regular),
        price_discount: formData.price_discount ? parseFloat(formData.price_discount) : null,
        quantity: parseInt(formData.quantity)
      }

      let savedProduct
      if (product?.id) {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)
          .select()
          .single()

        if (error) throw error
        savedProduct = data
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        if (error) throw error
        savedProduct = data
      }

      // Сохраняем изображения
      for (const image of images) {
        if (!image.id) {
          await supabase
            .from('product_images')
            .insert({
              product_id: savedProduct.id,
              image_url: image.image_url,
              is_primary: image.is_primary
            })
        } else {
          await supabase
            .from('product_images')
            .update({ is_primary: image.is_primary })
            .eq('id', image.id)
        }
      }

      onSave()
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {product ? 'Редактировать товар' : 'Добавить товар'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название товара</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_regular">Обычная цена</Label>
              <Input
                id="price_regular"
                name="price_regular"
                type="number"
                step="0.01"
                value={formData.price_regular}
                onChange={handleChange}
                required
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Остаток</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="price_unit">Единица измерения</Label>
              <Select value={formData.price_unit} onValueChange={(value) => setFormData({...formData, price_unit: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="шт">шт</SelectItem>
                  <SelectItem value="кг">кг</SelectItem>
                  <SelectItem value="г">г</SelectItem>
                  <SelectItem value="л">л</SelectItem>
                  <SelectItem value="мл">мл</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="in_stock"
              name="in_stock"
              checked={formData.in_stock}
              onChange={handleChange}
              className="rounded"
            />
            <Label htmlFor="in_stock">В наличии</Label>
          </div>

          <div>
            <Label>Фотографии товара</Label>
            <div className="mt-2">
              <div className="grid grid-cols-3 gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.image_url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    {image.is_primary && (
                      <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                        Главная
                      </div>
                    )}
                    {!image.is_primary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(index)}
                        className="absolute bottom-1 left-1 bg-gray-500 text-white text-xs px-1 rounded hover:bg-green-500"
                      >
                        Сделать главной
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(Array.from(e.target.files))}
                className="hidden"
                id="image-upload"
              />
              <Label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Загрузка...' : 'Добавить фото'}
              </Label>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="submit"
              disabled={loading || uploading || images.length === 0}
              className="flex-1"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm
