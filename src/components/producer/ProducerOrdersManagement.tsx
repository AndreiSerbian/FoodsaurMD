import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Order {
  id: string
  created_at: string
  pickup_time: string | null
  total_amount: number
  currency: string
  status: string
  customer_name: string | null
  customer_phone: string | null
  pickup_points: {
    name: string
  }
  order_items: Array<{
    id: string
    qty: number
    price: number
    subtotal: number
    product_snapshot: any
  }>
}

interface ProducerOrdersManagementProps {
  producerId: string
}

export default function ProducerOrdersManagement({ producerId }: ProducerOrdersManagementProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  
  // Фильтры
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [producerId])

  const fetchOrders = async () => {
    setLoading(true)
    
    try {
      console.log('Fetching orders for producer:', producerId)
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          pickup_points!fk_orders_point_id(name),
          order_items!fk_order_items_order_id(
            id,
            qty,
            price,
            subtotal,
            product_snapshot
          )
        `)
        .eq('producer_id', producerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        throw error
      }

      console.log('Orders loaded successfully:', data?.length || 0)
      
      if (data) {
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      preorder: 'default',
      confirmed: 'default',
      ready: 'secondary',
      completed: 'outline',
      cancelled: 'destructive',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    if (dateFrom && new Date(order.created_at) < new Date(dateFrom)) return false
    if (dateTo && new Date(order.created_at) > new Date(dateTo)) return false
    return true
  })

  if (loading) {
    return <div className="flex justify-center py-8">Загрузка...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Фильтры заказов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Статус</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="preorder">Предзаказ</SelectItem>
                  <SelectItem value="confirmed">Подтвержден</SelectItem>
                  <SelectItem value="ready">Готов</SelectItem>
                  <SelectItem value="completed">Завершен</SelectItem>
                  <SelectItem value="cancelled">Отменен</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Дата от</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <Label>Дата до</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Заказ #{order.id.slice(0, 8)}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Точка выдачи: {order.pickup_points.name}</div>
                      <div>Дата создания: {new Date(order.created_at).toLocaleString()}</div>
                      {order.pickup_time && (
                        <div>Время получения: {new Date(order.pickup_time).toLocaleString()}</div>
                      )}
                      {order.customer_name && (
                        <div>Клиент: {order.customer_name}</div>
                      )}
                      {order.customer_phone && (
                        <div>Телефон: {order.customer_phone}</div>
                      )}
                      <div className="font-semibold">
                        Сумма: {order.total_amount} {order.currency}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preorder">Предзаказ</SelectItem>
                        <SelectItem value="confirmed">Подтвержден</SelectItem>
                        <SelectItem value="ready">Готов</SelectItem>
                        <SelectItem value="completed">Завершен</SelectItem>
                        <SelectItem value="cancelled">Отменен</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      variant="outline"
                      size="sm"
                    >
                      {expandedOrder === order.id ? (
                        <>Скрыть <ChevronUp className="ml-1 h-4 w-4" /></>
                      ) : (
                        <>Товары <ChevronDown className="ml-1 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Состав заказа:</h4>
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.product_snapshot.name} x {item.qty}
                          </span>
                          <span className="font-medium">
                            {item.subtotal} {order.currency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
