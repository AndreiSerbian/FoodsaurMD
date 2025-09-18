import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Package, Clock, User, Phone } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const OrderManagement = ({ producerProfile }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    if (producerProfile?.id) {
      fetchOrders();
    }
  }, [producerProfile, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          pickup_points!orders_point_id_fkey(name, address),
          order_items(
            qty,
            price,
            subtotal,
            product_snapshot
          )
        `)
        .eq('producer_id', producerProfile.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заказы",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Статус заказа обновлен"
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      preorder: { label: 'Предзаказ', variant: 'secondary' },
      confirmed: { label: 'Подтвержден', variant: 'default' },
      ready: { label: 'Готов', variant: 'outline' },
      completed: { label: 'Выдан', variant: 'default' },
      cancelled: { label: 'Отменен', variant: 'destructive' },
      rejected: { label: 'Отклонен', variant: 'destructive' }
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getStatusActions = (order) => {
    const { status } = order;
    const actions = [];

    if (status === 'confirmed') {
      actions.push(
        <Button
          key="ready"
          size="sm"
          variant="outline"
          onClick={() => updateOrderStatus(order.id, 'ready')}
        >
          Готов
        </Button>
      );
    } else if (status === 'ready') {
      actions.push(
        <Button
          key="complete"
          size="sm"
          onClick={() => updateOrderStatus(order.id, 'completed')}
        >
          Выдан
        </Button>
      );
    }

    return actions;
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!producerProfile?.id) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-muted-foreground text-center">
            Сначала заполните профиль производителя
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Управление заказами
          </CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-40">
              <SelectValue placeholder="Фильтр" />
            </SelectTrigger>
            <SelectContent className="w-40">
              <SelectItem value="all">Все заказы</SelectItem>
              <SelectItem value="preorder">Предзаказы</SelectItem>
              <SelectItem value="confirmed">Подтвержденные</SelectItem>
              <SelectItem value="ready">Готовые</SelectItem>
              <SelectItem value="completed">Выданные</SelectItem>
              <SelectItem value="cancelled">Отмененные</SelectItem>
              <SelectItem value="rejected">Отклоненные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Загрузка заказов...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {statusFilter === 'all' ? 'У вас пока нет заказов' : 'Нет заказов с выбранным статусом'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">
                      Заказ #{order.meta?.order_code || order.id.slice(0, 8)}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {order.pickup_points?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Клиент: {order.customer_name}
                    </p>
                    {order.customer_phone && (
                      <p className="text-sm text-muted-foreground">
                        Тел: {order.customer_phone}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Время получения</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(order.pickup_time)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Сумма заказа</p>
                    <p className="text-lg font-bold">{order.total_amount} {order.currency}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="font-medium mb-2">Состав заказа:</h5>
                  <div className="space-y-1">
                    {order.order_items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.product_snapshot?.name || 'Товар'} × {item.qty}
                        </span>
                        <span>{item.subtotal} {order.currency}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  {getStatusActions(order)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderManagement;