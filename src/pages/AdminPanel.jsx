
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../integrations/supabase/client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import AdminDashboard from '../components/admin/AdminDashboard'

const AdminPanel = () => {
  const { user, signOut } = useAuth()
  const [producers, setProducers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProducer, setEditingProducer] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchProducers()
  }, [])

  const fetchProducers = async () => {
    try {
      const { data, error } = await supabase
        .from('producer_profiles')
        .select(`
          *,
          user_roles!inner(role)
        `)
        .order('created_at', { ascending: false })

      if (data) {
        setProducers(data)
      }
    } catch (error) {
      console.error('Error fetching producers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveProducer = async (producerId, approved) => {
    try {
      const { error } = await supabase
        .from('producer_profiles')
        .update({ is_approved: approved })
        .eq('id', producerId)

      if (!error) {
        setProducers(producers.map(p => 
          p.id === producerId ? { ...p, is_approved: approved } : p
        ))
      }
    } catch (error) {
      console.error('Error updating producer approval:', error)
    }
  }

  const handleEditProducer = (producer) => {
    setEditingProducer(producer.id)
    setFormData({
      producer_name: producer.producer_name,
      phone: producer.phone,
      telegram_handle: producer.telegram_handle || '',
      address: producer.address || '',
      description: producer.description || ''
    })
  }

  const handleUpdateProducer = async (producerId) => {
    try {
      const { error } = await supabase
        .from('producer_profiles')
        .update(formData)
        .eq('id', producerId)

      if (!error) {
        setProducers(producers.map(p => 
          p.id === producerId ? { ...p, ...formData } : p
        ))
        setEditingProducer(null)
        setFormData({})
      }
    } catch (error) {
      console.error('Error updating producer:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8)
  }

  const resetProducerPassword = async (producer) => {
    const tempPassword = generateTempPassword()
    
    // В реальном приложении здесь должна быть отправка email
    alert(`Временный пароль для ${producer.producer_name}: ${tempPassword}`)
    
    // Здесь можно добавить логику для сброса пароля через Supabase Admin API
    console.log('Reset password for producer:', producer.id, 'New password:', tempPassword)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-bold mb-6">
            Админ-панель
          </h2>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
              <TabsTrigger value="producers">Производители</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <AdminDashboard />
            </TabsContent>

            <TabsContent value="producers">
              <div className="bg-card shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-border">
                  {producers.map((producer) => (
                <li key={producer.id} className="px-6 py-4">
                  {editingProducer === producer.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleUpdateProducer(producer.id)}
                          size="sm"
                        >
                          Сохранить
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProducer(null)}
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              producer.is_approved 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {producer.is_approved ? 'Одобрен' : 'На рассмотрении'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {producer.producer_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {producer.phone} • {producer.telegram_handle} • {producer.address || 'Адрес не указан'}
                            </p>
                            {producer.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {producer.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Регистрация: {new Date(producer.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProducer(producer)}
                        >
                          Редактировать
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetProducerPassword(producer)}
                        >
                          Сбросить пароль
                        </Button>
                        
                        {producer.is_approved ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleApproveProducer(producer.id, false)}
                          >
                            Отклонить
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleApproveProducer(producer.id, true)}
                          >
                            Одобрить
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
