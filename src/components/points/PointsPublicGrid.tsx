import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MapPin, Clock, ArrowRight, Map, List } from 'lucide-react';
import { getPointsByProducerSlug } from '@/modules/points/pointsApi.js';
import { getPointStatus, getTodayHours, formatDayHours } from '@/modules/points/workHoursUtil.js';
import { getCart, setSelectedPoint, clearCart } from '@/modules/cart/cartState.js';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import PickupPointsMap from '@/components/maps/PickupPointsMap';
import type { PickupPoint } from '@/types/supabase-points';

interface PointsPublicGridProps {
  producerSlug: string;
  onPointSelected?: (point: PickupPoint) => void;
}

export default function PointsPublicGrid({ producerSlug, onPointSelected }: PointsPublicGridProps) {
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [conflictDialog, setConflictDialog] = useState<{
    isOpen: boolean;
    point?: PickupPoint;
    conflictType?: 'producer' | 'point';
  }>({ isOpen: false });
  const { toast } = useToast();

  useEffect(() => {
    loadPoints();
  }, [producerSlug]);

  const loadPoints = async () => {
    try {
      setLoading(true);
      const data = await getPointsByProducerSlug(producerSlug);
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

  const checkCartConflict = (producerSlug: string, pointId: string) => {
    const cart = getCart();
    const items = cart.items || [];
    
    if (items.length === 0) {
      return { canAdd: true };
    }
    
    const firstItem = items[0];
    
    if (firstItem.producerSlug !== producerSlug) {
      return { 
        canAdd: false, 
        conflictType: 'producer' as const,
        currentProducer: firstItem.producerSlug 
      };
    }
    
    if (firstItem.pointId !== pointId) {
      return { 
        canAdd: false, 
        conflictType: 'point' as const,
        currentPointId: firstItem.pointId 
      };
    }
    
    return { canAdd: true };
  };

  const getConflictMessage = (conflictType: 'producer' | 'point') => {
    if (conflictType === 'producer') {
      return 'В корзине уже есть товары от другого производителя. Хотите очистить корзину и продолжить?';
    } else {
      return 'В корзине уже есть товары из другой точки выдачи. Хотите очистить корзину и продолжить?';
    }
  };

  const handleSelectPoint = (point: PickupPoint) => {
    const result = checkCartConflict(producerSlug, point.id);
    
    if (result.canAdd) {
      selectPoint(point);
    } else {
      setConflictDialog({
        isOpen: true,
        point,
        conflictType: result.conflictType
      });
    }
  };

  const selectPoint = (point: PickupPoint) => {
    setSelectedPoint({
      producerSlug,
      pointId: point.id,
      pointName: point.title || point.name
    });

    // Navigate first before showing toast to prevent navigation issues
    if (onPointSelected) {
      onPointSelected(point);
    }

    toast({
      title: 'Точка выбрана',
      description: `Теперь вы можете заказывать товары из точки "${point.title || point.name}"`,
    });
  };

  const handleConflictConfirm = () => {
    if (conflictDialog.point) {
      // Clear the cart using the proper function
      clearCart();
      
      selectPoint(conflictDialog.point);
    }
    setConflictDialog({ isOpen: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">У этого производителя пока нет активных точек выдачи</p>
        </CardContent>
      </Card>
    );
  }

  const hasPointsWithCoords = points.some(p => p.lat && p.lng);

  return (
    <>
      <Tabs defaultValue={hasPointsWithCoords ? "map" : "list"} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="map" className="gap-2" disabled={!hasPointsWithCoords}>
            <Map className="h-4 w-4" />
            Карта
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            Список
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          {hasPointsWithCoords ? (
            <div className="space-y-4">
              <PickupPointsMap 
                points={points}
                onPointClick={handleSelectPoint}
                height="400px"
              />
              <p className="text-sm text-muted-foreground text-center">
                Нажмите на маркер, чтобы выбрать точку выдачи
              </p>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">У точек выдачи не указаны координаты</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="list">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {points.map((point) => {
              const status = getPointStatus(point.work_hours);
              const todayHours = getTodayHours(point.work_hours);
              
              return (
                <Card key={point.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {point.title || point.name}
                      </CardTitle>
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
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{point.city}, {point.address}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Сегодня: {formatDayHours(todayHours)}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleSelectPoint(point)}
                      className="w-full gap-2"
                      disabled={status.status === 'closed' && todayHours.length === 0}
                    >
                      Выбрать эту точку
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Диалог конфликта корзины */}
      <AlertDialog open={conflictDialog.isOpen} onOpenChange={() => setConflictDialog({ isOpen: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Очистить корзину?</AlertDialogTitle>
            <AlertDialogDescription>
              {conflictDialog.conflictType && 
                getConflictMessage(conflictDialog.conflictType)
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConflictConfirm}>
              Очистить и продолжить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}