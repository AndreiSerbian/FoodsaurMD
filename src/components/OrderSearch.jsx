import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Search, Package, Clock, MapPin } from 'lucide-react';
const OrderSearch = () => {
  const [orderCode, setOrderCode] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchOrder = async () => {
    if (!orderCode.trim()) {
      setError('Введите код заказа');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const {
        data,
        error: searchError
      } = await supabase.from('orders').select(`
          *,
          pickup_points(name, address),
          producer_profiles!orders_producer_id_fkey(producer_name),
          order_items(
            qty,
            price,
            subtotal,
            product_snapshot
          )
        `).filter('meta->>order_code', 'eq', orderCode.trim()).maybeSingle();
      if (searchError) {
        throw searchError;
      }
      if (!data) {
        setError('Заказ с таким кодом не найден');
        return;
      }
      setOrder(data);
    } catch (err) {
      console.error('Error searching order:', err);
      setError('Ошибка при поиске заказа');
    } finally {
      setLoading(false);
    }
  };
  const getStatusBadge = status => {
    const statusMap = {
      created: {
        label: 'Создан',
        variant: 'secondary'
      },
      confirmed: {
        label: 'Подтвержден',
        variant: 'default'
      },
      ready: {
        label: 'Готов',
        variant: 'outline'
      },
      completed: {
        label: 'Выдан',
        variant: 'default'
      },
      cancelled: {
        label: 'Отменен',
        variant: 'destructive'
      }
    };
    const statusInfo = statusMap[status] || {
      label: status,
      variant: 'secondary'
    };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };
  const formatDateTime = dateTime => {
    return new Date(dateTime).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const calculateTotal = items => {
    return items.reduce((total, item) => {
      return total + item.subtotal;
    }, 0);
  };
  return <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Поиск заказа по коду
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input placeholder="Введите код заказа (6-8 цифр)" value={orderCode} onChange={e => setOrderCode(e.target.value)} maxLength={8} onKeyPress={e => e.key === 'Enter' && searchOrder()} />
            <Button onClick={searchOrder} disabled={loading} className="text-gray-50 bg-green-900 hover:bg-green-800">
              {loading ? 'Поиск...' : 'Найти'}
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardContent>
      </Card>

      {order && <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Заказ #{order.meta?.order_code || 'N/A'}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {order.producer_profiles?.producer_name || 'Неизвестно'}
                </p>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Время получения</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(order.pickup_time)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Точка выдачи</p>
                  <p className="text-sm text-muted-foreground">
                    {order.pickup_points.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.pickup_points.address}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Состав заказа</h4>
              <div className="space-y-2">
                {order.order_items.map((item, index) => <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.product_snapshot?.name || 'Товар'}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.product_snapshot?.description || ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.qty} шт × {item.price} MDL
                      </p>
                      <p className="text-sm text-muted-foreground">
                        = {item.subtotal} MDL
                      </p>
                    </div>
                  </div>)}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Итого:</span>
                <div className="text-right">
                  <p className="text-lg font-bold">{order.total_amount} MDL</p>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Заказ создан: {formatDateTime(order.created_at)}</p>
              <p>Последнее обновление: {formatDateTime(order.updated_at)}</p>
            </div>
          </CardContent>
        </Card>}
    </div>;
};
export default OrderSearch;