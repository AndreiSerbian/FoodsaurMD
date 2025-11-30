import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Package, Store, MapPin, ShoppingBag, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import OrdersChart from './OrdersChart';
import OrdersChart from './OrdersChart';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    ordersTotal: 0,
    ordersWeek: 0,
    producersTotal: 0,
    producersPending: 0,
    pointsActive: 0,
    productsTotal: 0
  });
  const [pendingProducers, setPendingProducers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch metrics
      const [ordersRes, producersRes, pointsRes, productsRes] = await Promise.all([
        supabase.from('orders').select('id, created_at'),
        supabase.from('producer_profiles').select('id, is_approved'),
        supabase.from('pickup_points').select('id, is_active').eq('is_active', true),
        supabase.from('products').select('id')
      ]);

      // Calculate orders this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const ordersWeek = ordersRes.data?.filter(o => new Date(o.created_at) > weekAgo).length || 0;

      setMetrics({
        ordersTotal: ordersRes.data?.length || 0,
        ordersWeek,
        producersTotal: producersRes.data?.length || 0,
        producersPending: producersRes.data?.filter(p => !p.is_approved).length || 0,
        pointsActive: pointsRes.data?.length || 0,
        productsTotal: productsRes.data?.length || 0
      });

      // Fetch pending producers
      const { data: pending } = await supabase
        .from('producer_profiles')
        .select('id, producer_name, phone, created_at')
        .eq('is_approved', false)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setPendingProducers(pending || []);

      // Fetch recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          currency,
          status,
          created_at,
          producer_profiles!orders_producer_id_fkey(producer_name),
          pickup_points!orders_point_id_fkey(name, city)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentOrders(orders || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProducer = async (producerId) => {
    try {
      const { error } = await supabase
        .from('producer_profiles')
        .update({ is_approved: true })
        .eq('id', producerId);

      if (!error) {
        toast.success('Производитель одобрен');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error approving producer:', error);
      toast.error('Ошибка при одобрении');
    }
  };

  const handleDeclineProducer = async (producerId) => {
    try {
      const { error } = await supabase
        .from('producer_profiles')
        .update({ is_approved: false })
        .eq('id', producerId);

      if (!error) {
        toast.success('Производитель отклонен');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error declining producer:', error);
      toast.error('Ошибка при отклонении');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'preorder': { label: 'Предзаказ', variant: 'default' },
      'confirmed': { label: 'Подтвержден', variant: 'secondary' },
      'completed': { label: 'Завершен', variant: 'outline' },
      'cancelled': { label: 'Отменен', variant: 'destructive' }
    };
    const config = statusMap[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заказов</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.ordersTotal}</div>
            <p className="text-xs text-muted-foreground">
              За неделю: {metrics.ordersWeek}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Производителей</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.producersTotal}</div>
            <p className="text-xs text-muted-foreground">
              Ожидают: {metrics.producersPending}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Точек выдачи</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pointsActive}</div>
            <p className="text-xs text-muted-foreground">
              Активных
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Товаров</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.productsTotal}</div>
            <p className="text-xs text-muted-foreground">
              В каталоге
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Chart */}
      <OrdersChart />

      {/* Pending Producers */}
      {pendingProducers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle>Ожидают одобрения ({pendingProducers.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingProducers.map((producer) => (
                <div key={producer.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{producer.producer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {producer.phone} • {new Date(producer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveProducer(producer.id)}
                    >
                      Одобрить
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeclineProducer(producer.id)}
                    >
                      Отклонить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Последние заказы</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Производитель</TableHead>
                <TableHead>Точка</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 6)}...
                  </TableCell>
                  <TableCell>{order.producer_profiles?.producer_name}</TableCell>
                  <TableCell>
                    {order.pickup_points?.city}
                  </TableCell>
                  <TableCell>
                    {order.total_amount} {order.currency}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
