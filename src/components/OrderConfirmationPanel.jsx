import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Check, X, Clock, Package } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { confirmOrder, rejectOrder } from '../modules/cart/orderConfirmation';
import { useToast } from '../hooks/use-toast';

/**
 * Панель подтверждения заказов для производителей
 * При подтверждении заказа остатки автоматически обновляются
 */
const OrderConfirmationPanel = ({ producerId }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Загрузка заказов со статусом 'preorder'
  useEffect(() => {
    if (producerId) {
      fetchPendingOrders();
    }
  }, [producerId]);

  const fetchPendingOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_id,
            qty,
            price,
            subtotal,
            product_snapshot
          ),
          pickup_points (
            name,
            address
          )
        `)
        .eq('producer_id', producerId)
        .eq('status', 'preorder')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить заказы",
          variant: "destructive"
        });
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error in fetchPendingOrders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    const result = await confirmOrder(orderId);
    
    if (result.success) {
      toast({
        title: "Заказ подтвержден",
        description: "Остатки товаров обновлены",
        variant: "default"
      });
      
      // Обновляем список заказов
      fetchPendingOrders();
    } else {
      toast({
        title: "Ошибка",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleRejectOrder = async (orderId) => {
    const reason = prompt("Укажите причину отклонения (необязательно):");
    const result = await rejectOrder(orderId, reason);
    
    if (result.success) {
      toast({
        title: "Заказ отклонен",
        description: "Остатки товаров не изменились",
        variant: "default"
      });
      
      // Обновляем список заказов
      fetchPendingOrders();
    } else {
      toast({
        title: "Ошибка",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Ожидающие подтверждения заказы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Ожидающие подтверждения заказы ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Нет ожидающих заказов</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold">
                        Заказ #{order.meta?.order_code || order.id.slice(0, 8)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(order.created_at)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Точка: {order.pickup_points?.name}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {order.total_amount} лей
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <h5 className="font-medium">Состав заказа:</h5>
                    {order.order_items.map((item, index) => (
                      <div key={index} className="text-sm flex justify-between">
                        <span>
                          {item.product_snapshot?.name || 'Товар'} × {item.qty}
                        </span>
                        <span>{item.subtotal} лей</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4">
                    <h5 className="font-medium">Контакты покупателя:</h5>
                    <p className="text-sm">{order.customer_name}</p>
                    <p className="text-sm">{order.customer_phone}</p>
                    {order.customer_email && (
                      <p className="text-sm">{order.customer_email}</p>
                    )}
                    {order.pickup_time && (
                      <p className="text-sm">
                        Время получения: {formatDateTime(order.pickup_time)}
                      </p>
                    )}
                  </div>

                  <Alert className="mb-4">
                    <AlertDescription>
                      При подтверждении заказа остатки товаров будут автоматически обновлены в системе.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleConfirmOrder(order.id)}
                      className="flex-1"
                      variant="default"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Подтвердить заказ
                    </Button>
                    <Button
                      onClick={() => handleRejectOrder(order.id)}
                      className="flex-1"
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Отклонить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderConfirmationPanel;