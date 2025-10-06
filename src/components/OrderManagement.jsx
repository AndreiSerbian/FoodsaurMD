import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Package, Clock, Search, X, Edit } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

const OrderManagement = ({ producerProfile }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchCode, setSearchCode] = useState('');
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (producerProfile?.id) {
      fetchOrders();
    }
  }, [producerProfile, statusFilter, searchCode]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Получаем producer_id через pickup_points
      const { data: pickupPoints, error: pointsError } = await supabase
        .from('pickup_points')
        .select('id')
        .eq('producer_id', producerProfile.id);

      if (pointsError) throw pointsError;
      
      if (!pickupPoints || pickupPoints.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const pointIds = pickupPoints.map(p => p.id);

      let query = supabase
        .from('pre_orders')
        .select(`
          *,
          pickup_points(name, address, city),
          pre_order_items(
            quantity,
            price_regular,
            price_discount,
            product_id,
            products(name, price_unit)
          )
        `)
        .in('pickup_point_id', pointIds)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchCode.trim()) {
        query = query.ilike('order_code', `%${searchCode.trim()}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Query error details:', error);
        throw error;
      }
      
      console.log('Fetched orders:', data);
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
        .from('pre_orders')
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

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;
    
    try {
      const { data, error } = await supabase.rpc('rpc_cancel_preorder', {
        order_id_param: cancelOrderId
      });

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Заказ отменен, остатки восстановлены"
      });
      
      setCancelOrderId(null);
      fetchOrders();
    } catch (error) {
      console.error('Error canceling order:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отменить заказ",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      created: { label: 'Создан', variant: 'secondary' },
      confirmed: { label: 'Подтвержден', variant: 'default' },
      ready: { label: 'Готов', variant: 'outline' },
      completed: { label: 'Выдан', variant: 'default' },
      cancelled: { label: 'Отменен', variant: 'destructive' }
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getStatusActions = (order) => {
    const { status } = order;
    const actions = [];

    if (status === 'created') {
      actions.push(
        <Button
          key="confirm"
          size="sm"
          onClick={() => updateOrderStatus(order.id, 'confirmed')}
        >
          Подтвердить
        </Button>
      );
    } else if (status === 'confirmed') {
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

    if (status !== 'cancelled' && status !== 'completed') {
      actions.push(
        <Button
          key="cancel"
          size="sm"
          variant="destructive"
          onClick={() => setCancelOrderId(order.id)}
        >
          <X className="h-4 w-4 mr-1" />
          Отменить
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
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
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
                  <SelectItem value="created">Новые</SelectItem>
                  <SelectItem value="confirmed">Подтвержденные</SelectItem>
                  <SelectItem value="ready">Готовые</SelectItem>
                  <SelectItem value="completed">Выданные</SelectItem>
                  <SelectItem value="cancelled">Отмененные</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по коду заказа..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={fetchOrders} variant="outline">
                Найти
              </Button>
            </div>
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
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold font-mono">
                        {order.order_code}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      📍 {order.pickup_points?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.pickup_points?.address}, {order.pickup_points?.city}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Дата создания</p>
                    <p className="text-sm font-medium">
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Время получения</p>
                      <p className="text-sm font-medium">
                        {formatDateTime(order.pickup_time)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Сумма заказа</p>
                    <p className="text-lg font-bold">{order.total_amount} MDL</p>
                    {order.discount_amount > 0 && (
                      <p className="text-xs text-green-600">
                        Скидка: -{order.discount_amount} MDL
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="font-medium mb-2">Состав заказа:</h5>
                  <div className="space-y-1">
                    {order.pre_order_items?.map((item, index) => {
                      const price = item.price_discount || item.price_regular;
                      const subtotal = price * item.quantity;
                      return (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {item.products?.name || 'Товар'} × {item.quantity} {item.products?.price_unit || 'шт'}
                          </span>
                          <span className="font-medium">{subtotal.toFixed(2)} MDL</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {getStatusActions(order)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <AlertDialog open={!!cancelOrderId} onOpenChange={() => setCancelOrderId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Отменить заказ?</AlertDialogTitle>
          <AlertDialogDescription>
            Заказ будет отменен, а остатки товаров будут возвращены на склад точки выдачи.
            Это действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancelOrder}>
            Подтвердить отмену
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default OrderManagement;