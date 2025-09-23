import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PickupPointSelector = ({ producerId }) => {
  const [pickupPoints, setPickupPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedPickupPoint, selectPickupPoint } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (producerId) {
      fetchPickupPoints();
    }
  }, [producerId]);

  const fetchPickupPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('pickup_points')
        .select('*')
        .eq('producer_id', producerId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      const points = data || [];
      setPickupPoints(points);
      
      // Если только одна точка, выбираем её автоматически
      if (points.length === 1 && !selectedPickupPoint) {
        handleSelectPoint(points[0]);
      }
    } catch (error) {
      console.error('Error fetching pickup points:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить точки получения",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Integrate with cart rules
  const handleSelectPoint = async (point) => {
    selectPickupPoint(point);
    
    // Get producer data for slug
    const { data: producer } = await supabase
      .from('producer_profiles')
      .select('slug')
      .eq('id', producerId)
      .single();
    
    // Also set in cart rules for global state
    const selectedPointData = {
      producerSlug: producer?.slug || 'unknown',
      pointId: point.id,
      pointName: point.name
    };
    
    // Import and use cartRules functions
    const { setSelectedPoint } = await import('../modules/cart/cartRules.js');
    setSelectedPoint(selectedPointData);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // Remove seconds
  };

  const isWithinWorkingHours = (point) => {
    if (!point.working_hours_from || !point.working_hours_to) return true;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [fromHour, fromMin] = point.working_hours_from.split(':').map(Number);
    const [toHour, toMin] = point.working_hours_to.split(':').map(Number);
    
    const fromTime = fromHour * 60 + fromMin;
    const toTime = toHour * 60 + toMin;
    
    return currentTime >= fromTime && currentTime <= toTime;
  };

  const isWithinDiscountTime = (point) => {
    if (!point.discount_available_from || !point.discount_available_to) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [fromHour, fromMin] = point.discount_available_from.split(':').map(Number);
    const [toHour, toMin] = point.discount_available_to.split(':').map(Number);
    
    const fromTime = fromHour * 60 + fromMin;
    const toTime = toHour * 60 + toMin;
    
    return currentTime >= fromTime && currentTime <= toTime;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Выберите точку получения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Загрузка...</div>
        </CardContent>
      </Card>
    );
  }

  if (pickupPoints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Точки получения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            У данного производителя нет активных точек получения
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Выберите точку получения</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pickupPoints.map((point) => {
          const isSelected = selectedPickupPoint?.id === point.id;
          const isOpen = isWithinWorkingHours(point);
          const hasDiscount = isWithinDiscountTime(point);

          return (
            <div 
              key={point.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              } ${!isOpen ? 'opacity-60' : ''}`}
              onClick={() => handleSelectPoint(point)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{point.name}</h3>
                    {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                    {hasDiscount && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Скидка активна
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3" />
                    {point.address}
                  </div>

                  {point.working_hours_from && point.working_hours_to && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      Работает: {formatTime(point.working_hours_from)} - {formatTime(point.working_hours_to)}
                      {!isOpen && <span className="text-red-500 ml-1">(Закрыто)</span>}
                    </div>
                  )}

                  {point.discount_available_from && point.discount_available_to && (
                    <div className="text-sm text-green-600">
                      Скидка: {formatTime(point.discount_available_from)} - {formatTime(point.discount_available_to)}
                    </div>
                  )}
                </div>

                {!isSelected && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!isOpen}
                  >
                    Выбрать
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PickupPointSelector;