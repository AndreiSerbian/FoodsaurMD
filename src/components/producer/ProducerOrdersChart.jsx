import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export default function ProducerOrdersChart({ producerId }) {
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState('7');
  const [metric, setMetric] = useState('count');
  const [stats, setStats] = useState({ total: 0, average: 0, trend: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (producerId) {
      fetchChartData();
    }
  }, [producerId, period, metric]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - parseInt(period));
      fromDate.setHours(0, 0, 0, 0);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, total_amount, currency')
        .eq('producer_id', producerId)
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const grouped = {};
      const days = parseInt(period);
      
      // Initialize all dates
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        date.setHours(0, 0, 0, 0);
        const dateKey = date.toISOString().split('T')[0];
        grouped[dateKey] = { count: 0, amount: 0 };
      }

      // Fill with actual data
      orders?.forEach(order => {
        const dateKey = order.created_at.split('T')[0];
        if (grouped[dateKey]) {
          grouped[dateKey].count += 1;
          grouped[dateKey].amount += parseFloat(order.total_amount);
        }
      });

      // Convert to array
      const chartArray = Object.entries(grouped).map(([date, values]) => ({
        date: new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        value: metric === 'count' ? values.count : Math.round(values.amount),
        fullDate: date
      }));

      setChartData(chartArray);

      // Calculate stats
      const totalValue = chartArray.reduce((sum, item) => sum + item.value, 0);
      const avgValue = totalValue / chartArray.length;
      
      // Calculate trend (compare first half vs second half)
      const midpoint = Math.floor(chartArray.length / 2);
      const firstHalf = chartArray.slice(0, midpoint).reduce((sum, item) => sum + item.value, 0) / midpoint;
      const secondHalf = chartArray.slice(midpoint).reduce((sum, item) => sum + item.value, 0) / (chartArray.length - midpoint);
      const trendPercent = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

      setStats({
        total: Math.round(totalValue),
        average: Math.round(avgValue * 10) / 10,
        trend: Math.round(trendPercent * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      toast.error('Ошибка загрузки графика');
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{payload[0].payload.fullDate}</p>
          <p className="text-sm text-muted-foreground">
            {metric === 'count' ? 'Заказов' : 'Сумма'}: <span className="font-medium text-foreground">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <div className="text-muted-foreground">Загрузка графика...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>Динамика заказов</CardTitle>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={period === '7' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setPeriod('7')}
              >
                7 дней
              </Button>
              <Button
                variant={period === '14' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setPeriod('14')}
              >
                14 дней
              </Button>
              <Button
                variant={period === '30' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setPeriod('30')}
              >
                30 дней
              </Button>
            </div>
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={metric === 'count' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setMetric('count')}
              >
                Количество
              </Button>
              <Button
                variant={metric === 'amount' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setMetric('amount')}
              >
                Сумма
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs text-muted-foreground"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs text-muted-foreground"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Всего за период</div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">
                {metric === 'count' ? 'заказов' : 'MDL'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Среднее в день</div>
              <div className="text-2xl font-bold">{stats.average}</div>
              <div className="text-xs text-muted-foreground">
                {metric === 'count' ? 'заказов' : 'MDL'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Тренд</div>
              <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${stats.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.trend >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                {Math.abs(stats.trend)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.trend >= 0 ? 'рост' : 'снижение'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
