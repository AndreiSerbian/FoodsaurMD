
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../integrations/supabase/client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Plus } from 'lucide-react'
import ProductForm from '../components/ProductForm'
import ProductList from '../components/ProductList'
import CategorySelector from '../components/CategorySelector'

const Dashboard = () => {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    producer_name: '',
    phone: '',
    address: '',
    description: '',
    telegram_handle: '',
    categories: []
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('producer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setFormData({
          producer_name: data.producer_name || '',
          phone: data.phone || '',
          address: data.address || '',
          description: data.description || '',
          telegram_handle: data.telegram_handle || '',
          categories: data.categories || []
        })
      } else if (error && error.code === 'PGRST116') {
        await createProfile()
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('producer_profiles')
        .insert([{
          user_id: user.id,
          producer_name: user.user_metadata?.brand_name || '',
          phone: user.user_metadata?.phone || '',
          telegram_handle: user.user_metadata?.telegram_handle || '',
          categories: user.user_metadata?.categories || [],
          email_verified: true
        }])
        .select()
        .single()

      if (data) {
        setProfile(data)
        setFormData({
          producer_name: data.producer_name || '',
          phone: data.phone || '',
          address: data.address || '',
          description: data.description || '',
          telegram_handle: data.telegram_handle || '',
          categories: data.categories || []
        })
      }
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('producer_profiles')
        .update(formData)
        .eq('user_id', user.id)
        .select()
        .single()

      if (data) {
        setProfile(data)
        setEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCategoriesChange = (categories) => {
    setFormData({
      ...formData,
      categories
    })
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowProductForm(true)
  }

  const handleProductSave = () => {
    setShowProductForm(false)
    setEditingProduct(null)
    // Обновление списка товаров произойдет автоматически
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Профиль компании */}
            <div className="lg:col-span-1">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Профиль компании
                  </h3>
                  
                  {editing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <Label htmlFor="producer_name">Название</Label>
                        <Input
                          id="producer_name"
                          name="producer_name"
                          value={formData.producer_name}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Телефон</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <Label htmlFor="telegram_handle">Telegram</Label>
                        <Input
                          id="telegram_handle"
                          name="telegram_handle"
                          value={formData.telegram_handle}
                          onChange={handleChange}
                          placeholder="@username"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="address">Адрес</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
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

                      <CategorySelector
                        selectedCategories={formData.categories}
                        onCategoriesChange={handleCategoriesChange}
                      />
                      
                      <div className="flex space-x-2">
                        <Button type="submit" size="sm">
                          Сохранить
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditing(false)}
                        >
                          Отмена
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Название</p>
                        <p className="text-sm text-gray-900">{profile?.producer_name || 'Не указано'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Телефон</p>
                        <p className="text-sm text-gray-900">{profile?.phone || 'Не указан'}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">Telegram</p>
                        <p className="text-sm text-gray-900">{profile?.telegram_handle || 'Не указан'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Адрес</p>
                        <p className="text-sm text-gray-900">{profile?.address || 'Не указан'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Описание</p>
                        <p className="text-sm text-gray-900">{profile?.description || 'Не указано'}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">Категории</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {profile?.categories && profile.categories.length > 0 ? (
                            profile.categories.map((category) => (
                              <span
                                key={category}
                                className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                              >
                                {category}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-900">Не указаны</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Статус</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          profile?.is_approved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {profile?.is_approved ? 'Одобрен' : 'На рассмотрении'}
                        </span>
                      </div>
                      
                      <Button 
                        onClick={() => setEditing(true)}
                        size="sm"
                        className="mt-4"
                      >
                        Редактировать
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Управление товарами */}
            <div className="lg:col-span-2">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Управление товарами
                    </h3>
                    <Button 
                      onClick={() => setShowProductForm(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить товар
                    </Button>
                  </div>
                  
                  <ProductList 
                    producerProfile={profile}
                    onEditProduct={handleEditProduct}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          producerProfile={profile}
          onSave={handleProductSave}
          onCancel={() => {
            setShowProductForm(false)
            setEditingProduct(null)
          }}
        />
      )}
    </div>
  )
}

export default Dashboard
