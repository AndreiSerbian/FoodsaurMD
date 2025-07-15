import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle } from 'lucide-react';

const TimeSlotPicker = () => {
  const { selectedPickupPoint, selectedPickupTime, setSelectedPickupTime, isWithinDiscountTime } = useCart();
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    if (selectedPickupPoint) {
      generateTimeSlots();
    }
  }, [selectedPickupPoint]);

  const generateTimeSlots = () => {
    if (!selectedPickupPoint?.discount_available_from || !selectedPickupPoint?.discount_available_to) {
      setAvailableSlots([]);
      return;
    }

    const slots = [];
    const now = new Date();
    const today = new Date();
    
    // Parse discount time range
    const [fromHour, fromMin] = selectedPickupPoint.discount_available_from.split(':').map(Number);
    const [toHour, toMin] = selectedPickupPoint.discount_available_to.split(':').map(Number);

    // Generate slots for today (if still within discount period)
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const discountStart = fromHour * 60 + fromMin;
    const discountEnd = toHour * 60 + toMin;

    if (currentTime < discountEnd) {
      const startTime = Math.max(currentTime + 15, discountStart); // At least 15 mins from now
      const endTime = discountEnd;

      for (let time = startTime; time <= endTime; time += 15) { // 15-minute intervals
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
        
        if (hours <= 23) { // Don't go past midnight
          const slotTime = new Date(today);
          slotTime.setHours(hours, minutes, 0, 0);
          
          if (slotTime > now) { // Only future times
            slots.push({
              time: slotTime,
              label: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
              isToday: true
            });
          }
        }
      }
    }

    // Generate slots for tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (let time = discountStart; time <= discountEnd; time += 15) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      
      const slotTime = new Date(tomorrow);
      slotTime.setHours(hours, minutes, 0, 0);
      
      slots.push({
        time: slotTime,
        label: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        isToday: false
      });
    }

    setAvailableSlots(slots.slice(0, 20)); // Limit to 20 slots
  };

  const formatSlotDisplay = (slot) => {
    const dateStr = slot.isToday ? 'Сегодня' : 'Завтра';
    return `${dateStr}, ${slot.label}`;
  };

  if (!selectedPickupPoint) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Выберите время получения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Сначала выберите точку получения
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedPickupPoint.discount_available_from || !selectedPickupPoint.discount_available_to) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Выберите время получения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Время скидки не настроено для данной точки
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
          Выберите время получения
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Скидка доступна: {selectedPickupPoint.discount_available_from?.slice(0, 5)} - {selectedPickupPoint.discount_available_to?.slice(0, 5)}
        </div>
      </CardHeader>
      <CardContent>
        {availableSlots.length === 0 ? (
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-muted-foreground">
              Нет доступных временных слотов
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Время скидки закончилось на сегодня
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {availableSlots.map((slot, index) => (
              <Button
                key={index}
                variant={selectedPickupTime?.getTime() === slot.time.getTime() ? "default" : "outline"}
                size="sm"
                className="justify-start"
                onClick={() => setSelectedPickupTime(slot.time)}
              >
                {formatSlotDisplay(slot)}
              </Button>
            ))}
          </div>
        )}

        {selectedPickupTime && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Выбранное время:</span>
            </div>
            <div className="text-green-700 mt-1">
              {formatSlotDisplay(availableSlots.find(slot => 
                slot.time.getTime() === selectedPickupTime.getTime()
              ))}
            </div>
            <div className="text-xs text-green-600 mt-1">
              * Скидка будет действительна в течение 30 минут после выбранного времени
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeSlotPicker;