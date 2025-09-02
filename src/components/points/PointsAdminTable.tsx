import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Plus, Search, MapPin } from 'lucide-react';
import { listPoints, deletePoint, getCities } from '@/modules/points/pointsApi.js';
import { isOpenNow, getTodayHours, formatDayHours, getPointStatus } from '@/modules/points/workHoursUtil.js';
import { useToast } from '@/hooks/use-toast';
import type { PickupPoint } from '@/types/supabase-points';

interface PointsAdminTableProps {
  producerId?: string;
  onAddPoint: () => void;
  onEditPoint: (point: PickupPoint) => void;
}

export default function PointsAdminTable({ producerId, onAddPoint, onEditPoint }: PointsAdminTableProps) {
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPoints();
    loadCities();
  }, [producerId, search, cityFilter, statusFilter]);

  const loadPoints = async () => {
    try {
      setLoading(true);
      const data = await listPoints({
        producerId,
        search: search || undefined,
        city: cityFilter || undefined,
        activeOnly: statusFilter === 'active' ? true : undefined
      });
      setPoints(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить точки выдачи',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      const data = await getCities();
      setCities(data);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deletePoint(deleteId);
      await loadPoints();
      toast({
        title: 'Успешно',
        description: 'Точка выдачи удалена',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить точку выдачи',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const filteredPoints = points.filter(point => {
    if (statusFilter === 'active' && !point.is_active) return false;
    if (statusFilter === 'inactive' && point.is_active) return false;
    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Точки выдачи</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Точки выдачи ({filteredPoints.length})</CardTitle>
            <Button onClick={onAddPoint} className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить точку
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Фильтры */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию, адресу..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Все города" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все города</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="inactive">Неактивные</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Таблица точек */}
          {filteredPoints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Точки выдачи не найдены</p>
              <Button onClick={onAddPoint} variant="outline" className="mt-4">
                Добавить первую точку
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPoints.map((point) => {
                const status = getPointStatus(point.work_hours);
                const todayHours = getTodayHours(point.work_hours);
                
                return (
                  <div key={point.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">
                            {point.title || point.name}
                          </h3>
                          <Badge variant={point.is_active ? 'default' : 'secondary'}>
                            {point.is_active ? 'Активна' : 'Неактивна'}
                          </Badge>
                          <Badge 
                            variant={status.status === 'open' ? 'default' : 'outline'}
                            className={
                              status.status === 'open' ? 'bg-green-500' :
                              status.status === 'opening_soon' ? 'bg-yellow-500' :
                              status.status === 'closing_soon' ? 'bg-orange-500' : ''
                            }
                          >
                            {status.message}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Город:</strong> {point.city}</p>
                          <p><strong>Адрес:</strong> {point.address}</p>
                          <p><strong>Часы сегодня:</strong> {formatDayHours(todayHours)}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditPoint(point)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(point.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить точку выдачи?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Точка выдачи будет удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}