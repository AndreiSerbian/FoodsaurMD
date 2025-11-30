import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function AdminOrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [producers, setProducers] = useState([]);
  const [points, setPoints] = useState([]);
  const [allPoints, setAllPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  const [filters, setFilters] = useState({
    status: 'all',
    producerId: 'all',
    pointId: 'all',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchProducers();
    fetchPoints();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  useEffect(() => {
    if (filters.producerId === 'all') {
      setPoints(allPoints);
    } else {
      setPoints(allPoints.filter(p => p.producer_id === filters.producerId));
    }
  }, [filters.producerId, allPoints]);

  const fetchProducers = async () => {
    const { data } = await supabase
      .from('producer_profiles')
      .select('id, producer_name')
      .order('producer_name');
    setProducers(data || []);
  };

  const fetchPoints = async () => {
    const { data } = await supabase
      .from('pickup_points')
      .select('id, name, city, producer_id')
      .order('city, name');
    setAllPoints(data || []);
    setPoints(data || []);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          producer_profiles!orders_producer_id_fkey(producer_name),
          pickup_points!orders_point_id_fkey(name, city),
          order_items!fk_order_items_order_id(
            id,
            qty,
            price,
            subtotal,
            product_snapshot
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.producerId !== 'all') {
        query = query.eq('producer_id', filters.producerId);
      }
      if (filters.pointId !== 'all') {
        query = query.eq('point_id', filters.pointId);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', new Date(filters.dateFrom).toISOString());
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      toast.success('Статус заказа обновлен');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Ошибка обновления статуса');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'preorder': { label: 'Предзаказ', variant: 'default' },
      'confirmed': { label: 'Подтвержден', variant: 'secondary' },
      'ready': { label: 'Готов', variant: 'default' },
      'completed': { label: 'Завершен', variant: 'outline' },
      'cancelled': { label: 'Отменен', variant: 'destructive' }
    };
    const config = statusMap[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      producerId: 'all',
      pointId: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Загрузка заказов...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Фильтры</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Сбросить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={filters.status} onValueChange={(val) => setFilters(f => ({...f, status: val}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="preorder">Предзаказ</SelectItem>
                  <SelectItem value="confirmed">Подтвержден</SelectItem>
                  <SelectItem value="ready">Готов</SelectItem>
                  <SelectItem value="completed">Завершен</SelectItem>
                  <SelectItem value="cancelled">Отменен</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Производитель</Label>
              <Select value={filters.producerId} onValueChange={(val) => setFilters(f => ({...f, producerId: val, pointId: 'all'}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  {producers.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.producer_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Точка выдачи</Label>
              <Select value={filters.pointId} onValueChange={(val) => setFilters(f => ({...f, pointId: val}))} disabled={points.length === 0}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  {points.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.city} - {p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Дата от</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(f => ({...f, dateFrom: e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label>Дата до</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(f => ({...f, dateTo: e.target.value}))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <CardTitle>Заказы ({orders.length})</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Заказы не найдены
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Производитель</TableHead>
                      <TableHead>Точка</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Создан</TableHead>
                      <TableHead>Получение</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <React.Fragment key={order.id}>
                        <TableRow>
                          <TableCell className="font-mono text-xs">
                            {order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>{order.producer_profiles?.producer_name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{order.pickup_points?.city}</div>
                              <div className="text-muted-foreground text-xs">{order.pickup_points?.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{order.customer_name || '-'}</div>
                              <div className="text-muted-foreground text-xs">{order.customer_phone || '-'}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {order.total_amount} {order.currency}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                            >
                              <SelectTrigger className="w-[140px]">
                                {getStatusBadge(order.status)}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="preorder">Предзаказ</SelectItem>
                                <SelectItem value="confirmed">Подтвержден</SelectItem>
                                <SelectItem value="ready">Готов</SelectItem>
                                <SelectItem value="completed">Завершен</SelectItem>
                                <SelectItem value="cancelled">Отменен</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {order.pickup_time ? new Date(order.pickup_time).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell>
                            <Collapsible open={expandedOrder === order.id}>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                >
                                  {expandedOrder === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                              </CollapsibleTrigger>
                            </Collapsible>
                          </TableCell>
                        </TableRow>
                        {expandedOrder === order.id && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-muted/50">
                              <div className="p-4">
                                <h4 className="font-semibold mb-2">Товары в заказе:</h4>
                                <div className="space-y-2">
                                  {order.order_items?.map((item) => {
                                    const product = item.product_snapshot;
                                    return (
                                      <div key={item.id} className="flex justify-between items-center border-b pb-2">
                                        <div>
                                          <div className="font-medium">{product?.name || 'Товар'}</div>
                                          <div className="text-sm text-muted-foreground">
                                            {item.qty} × {item.price} {order.currency}
                                          </div>
                                        </div>
                                        <div className="font-medium">
                                          {item.subtotal} {order.currency}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                {order.customer_email && (
                                  <div className="mt-4 text-sm text-muted-foreground">
                                    Email: {order.customer_email}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
