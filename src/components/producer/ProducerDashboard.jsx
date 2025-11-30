import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Package, MapPin, ShoppingBag, Clock, TrendingUp, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import ProducerOrdersChart from './ProducerOrdersChart';

export default function ProducerDashboard({ producerId }) {
  const [metrics, setMetrics] = useState({
    ordersTotal: 0,
    ordersWeek: 0,
    pointsActive: 0,
    productsTotal: 0,
    revenueTotal: 0,
    averageOrder: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (producerId) {
      fetchDashboardData();
    }
  }, [producerId]);

  const fetchDashboardData = async () => {
    try {
      // Fetch metrics
      const [ordersRes, pointsRes, productsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, created_at, total_amount, currency')
          .eq('producer_id', producerId),
        supabase
          .from('pickup_points')
          .select('id, is_active')
          .eq('producer_id', producerId)
          .eq('is_active', true),
        supabase
          .from('products')
          .select('id')
          .eq('producer_id', producerId)
      ]);

      // Calculate orders this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const ordersWeek = ordersRes.data?.filter(o => new Date(o.created_at) > weekAgo).length || 0;

      // Calculate revenue
      const revenueTotal = ordersRes.data?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
      const averageOrder = ordersRes.data?.length > 0 ? revenueTotal / ordersRes.data.length : 0;

      setMetrics({
        ordersTotal: ordersRes.data?.length || 0,
        ordersWeek,
        pointsActive: pointsRes.data?.length || 0,
        productsTotal: productsRes.data?.length || 0,
        revenueTotal: Math.round(revenueTotal),
        averageOrder: Math.round(averageOrder)
      });

      // Fetch recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          currency,
          status,
          created_at,
          pickup_points!orders_point_id_fkey(name, city)
        `)
        .eq('producer_id', producerId)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <CardTitle className="text-sm font-medium">Выручка</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.revenueTotal}</div>
            <p className="text-xs text-muted-foreground">
              MDL за всё время
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средний чек</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageOrder}</div>
            <p className="text-xs text-muted-foreground">
              MDL на заказ
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
      <ProducerOrdersChart producerId={producerId} />

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Последние заказы</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Заказов пока нет
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
