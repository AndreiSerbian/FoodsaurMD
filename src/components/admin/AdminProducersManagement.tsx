import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, Edit, Key, CheckCircle, XCircle, Package, MapPin, ShoppingCart } from 'lucide-react'

interface Producer {
  id: string
  producer_name: string
  phone: string | null
  telegram_handle: string | null
  address: string | null
  is_approved: boolean | null
  is_verified: boolean | null
  currency: string
  created_at: string
  products_count?: number
  points_count?: number
  orders_count?: number
}

export default function AdminProducersManagement() {
  const [producers, setProducers] = useState<Producer[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    producer_name: '',
    phone: '',
    telegram_handle: '',
    address: '',
  })
  
  // Фильтры
  const [approvalFilter, setApprovalFilter] = useState<string>('all')
  const [verificationFilter, setVerificationFilter] = useState<string>('all')
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')

  useEffect(() => {
    fetchProducers()
  }, [])

  const fetchProducers = async () => {
    try {
      setLoading(true)
      
      // Fetch producers with counts
      const { data: producersData, error: producersError } = await supabase
        .from('producer_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (producersError) throw producersError

      // Fetch counts for each producer
      const producersWithCounts = await Promise.all(
        (producersData || []).map(async (producer) => {
          const [products, points, orders] = await Promise.all([
            supabase.from('products').select('id', { count: 'exact', head: true }).eq('producer_id', producer.id),
            supabase.from('pickup_points').select('id', { count: 'exact', head: true }).eq('producer_id', producer.id),
            supabase.from('orders').select('id', { count: 'exact', head: true }).eq('producer_id', producer.id),
          ])

          return {
            ...producer,
            products_count: products.count || 0,
            points_count: points.count || 0,
            orders_count: orders.count || 0,
          }
        })
      )

      setProducers(producersWithCounts)
    } catch (error) {
      console.error('Error fetching producers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string, approved: boolean) => {
    const { error } = await supabase
      .from('producer_profiles')
      .update({ is_approved: approved })
      .eq('id', id)

    if (!error) {
      setProducers(producers.map(p => p.id === id ? { ...p, is_approved: approved } : p))
    }
  }

  const handleVerify = async (id: string, verified: boolean) => {
    const { error } = await supabase
      .from('producer_profiles')
      .update({ is_verified: verified })
      .eq('id', id)

    if (!error) {
      setProducers(producers.map(p => p.id === id ? { ...p, is_verified: verified } : p))
    }
  }

  const handleEdit = (producer: Producer) => {
    setEditingId(producer.id)
    setFormData({
      producer_name: producer.producer_name,
      phone: producer.phone || '',
      telegram_handle: producer.telegram_handle || '',
      address: producer.address || '',
    })
  }

  const handleUpdate = async (id: string) => {
    const { error } = await supabase
      .from('producer_profiles')
      .update(formData)
      .eq('id', id)

    if (!error) {
      setProducers(producers.map(p => p.id === id ? { ...p, ...formData } : p))
      setEditingId(null)
    }
  }

  const filteredProducers = producers.filter(p => {
    if (approvalFilter !== 'all' && String(p.is_approved) !== approvalFilter) return false
    if (verificationFilter !== 'all' && String(p.is_verified) !== verificationFilter) return false
    if (currencyFilter !== 'all' && p.currency !== currencyFilter) return false
    return true
  })

  if (loading) {
    return <div className="flex justify-center py-8">Загрузка...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управление производителями</h2>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Label>Статус одобрения</Label>
            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="true">Одобрены</SelectItem>
                <SelectItem value="false">На рассмотрении</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Label>Верификация</Label>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="true">Верифицированы</SelectItem>
                <SelectItem value="false">Не верифицированы</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Label>Валюта</Label>
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="MDL">MDL</SelectItem>
                <SelectItem value="RUP">RUP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Список производителей */}
      <div className="space-y-3">
        {filteredProducers.map((producer) => (
          <Card key={producer.id}>
            <CardContent className="pt-6">
              {editingId === producer.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Название</Label>
                      <Input
                        value={formData.producer_name}
                        onChange={(e) => setFormData({ ...formData, producer_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Телефон</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Telegram</Label>
                      <Input
                        value={formData.telegram_handle}
                        onChange={(e) => setFormData({ ...formData, telegram_handle: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Адрес</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdate(producer.id)} size="sm">Сохранить</Button>
                    <Button onClick={() => setEditingId(null)} variant="outline" size="sm">Отмена</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{producer.producer_name}</h3>
                      {producer.is_approved && <Badge variant="default">Одобрен</Badge>}
                      {producer.is_verified && <Badge variant="secondary">Верифицирован</Badge>}
                      <Badge variant="outline">{producer.currency}</Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      {producer.phone && <div>📞 {producer.phone}</div>}
                      {producer.telegram_handle && <div>📱 {producer.telegram_handle}</div>}
                      {producer.address && <div>📍 {producer.address}</div>}
                    </div>

                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>{producer.products_count} товаров</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{producer.points_count} точек</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="h-4 w-4" />
                        <span>{producer.orders_count} заказов</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Регистрация: {new Date(producer.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button onClick={() => handleEdit(producer)} variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Редактировать
                    </Button>
                    
                    {producer.is_approved ? (
                      <Button onClick={() => handleApprove(producer.id, false)} variant="destructive" size="sm">
                        <XCircle className="h-4 w-4 mr-1" />
                        Отклонить
                      </Button>
                    ) : (
                      <Button onClick={() => handleApprove(producer.id, true)} size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Одобрить
                      </Button>
                    )}

                    {producer.is_verified ? (
                      <Button onClick={() => handleVerify(producer.id, false)} variant="outline" size="sm">
                        Снять верификацию
                      </Button>
                    ) : (
                      <Button onClick={() => handleVerify(producer.id, true)} variant="outline" size="sm">
                        Верифицировать
                      </Button>
                    )}
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
