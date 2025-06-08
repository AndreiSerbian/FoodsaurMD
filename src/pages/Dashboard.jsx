
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../integrations/supabase/client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import ProductManagement from '../components/ProductManagement'

const Dashboard = () => {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    brand_name: '',
    phone: '',
    address: '',
    description: ''
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
          brand_name: data.brand_name || '',
          phone: data.phone || '',
          address: data.address || '',
          description: data.description || ''
        })
      } else if (error && error.code === 'PGRST116') {
        // Профиль не найден, создаем новый
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
          brand_name: user.user_metadata?.brand_name || '',
          phone: user.user_metadata?.phone || '',
          email_verified: true
        }])
        .select()
        .single()

      if (data) {
        setProfile(data)
        setFormData({
          brand_name: data.brand_name || '',
          phone: data.phone || '',
          address: data.address || '',
          description: data.description || ''
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Панель управления производителя
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.email}</span>
              <Button onClick={signOut} variant="outline">
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </nav>

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
                        <Label htmlFor="brand_name">Название</Label>
                        <Input
                          id="brand_name"
                          name="brand_name"
                          value={formData.brand_name}
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
                        <p className="text-sm text-gray-900">{profile?.brand_name || 'Не указано'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Телефон</p>
                        <p className="text-sm text-gray-900">{profile?.phone || 'Не указан'}</p>
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
              <ProductManagement profile={profile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
