import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, MapPin, Calendar, Percent, CheckCircle2, Copy } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    selectedPointInfo,
    createPreOrder,
    clearCart
  } = useCart();
  
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [pointDetails, setPointDetails] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Redirect if no cart items or no point selected
  useEffect(() => {
    if (!cartItems.length || !selectedPointInfo?.pointId) {
      navigate('/');
    }
  }, [cartItems, selectedPointInfo, navigate]);

  // Fetch pickup point details
  useEffect(() => {
    const fetchPointDetails = async () => {
      if (!selectedPointInfo?.pointId) return;

      const { data, error } = await supabase
        .from('pickup_points')
        .select('id, name, address, city, work_hours')
        .eq('id', selectedPointInfo.pointId)
        .single();

      if (error) {
        console.error('Error fetching point details:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить информацию о точке",
          variant: "destructive"
        });
        return;
      }

      setPointDetails(data);
    };

    fetchPointDetails();
  }, [selectedPointInfo, toast]);

  // Generate time slots based on point's work hours and current time (UTC+3)
  useEffect(() => {
    if (!pointDetails?.work_hours) return;

    // Get current time in UTC+3 (Moldova timezone)
    const now = new Date();
    const utc3Now = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const currentHour = utc3Now.getUTCHours();
    const currentMinute = utc3Now.getUTCMinutes();
    
    // Get today's day of week
    const dayOfWeek = utc3Now.getUTCDay();
    
    // Map day number to day name
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayName = dayNames[dayOfWeek];
    
    // Get today's schedule - work_hours format: { "mon": [{"open": "07:30", "close": "19:30"}], ... }
    const daySchedule = pointDetails.work_hours[dayName];
    
    if (!daySchedule || !Array.isArray(daySchedule) || daySchedule.length === 0) {
      setAvailableTimeSlots([]);
      toast({
        title: "Точка закрыта",
        description: "Точка не работает сегодня. Пожалуйста, попробуйте в другой день.",
        variant: "destructive"
      });
      return;
    }

    // Get first time slot (assuming single shift per day)
    const schedule = daySchedule[0];
    if (!schedule.open || !schedule.close) {
      setAvailableTimeSlots([]);
      toast({
        title: "Точка закрыта",
        description: "Не указано время работы на сегодня.",
        variant: "destructive"
      });
      return;
    }

    // Parse work hours (format: "HH:MM")
    const [startHour, startMinute] = schedule.open.split(':').map(Number);
    const [endHour, endMinute] = schedule.close.split(':').map(Number);

    // Check if point is already closed for today
    if (currentHour > endHour || (currentHour === endHour && currentMinute >= endMinute)) {
      setAvailableTimeSlots([]);
      toast({
        title: "Точка закрыта",
        description: "Точка уже закрыта на сегодня. Пожалуйста, вернитесь завтра.",
        variant: "destructive"
      });
      return;
    }

    // Check if point hasn't opened yet today
    if (currentHour < startHour || (currentHour === startHour && currentMinute < startMinute)) {
      // Point will open later today - show all slots from opening time
      const slots = [];
      for (let hour = startHour; hour < endHour; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        slots.push({
          time: timeString,
          display: `${timeString} - ${(hour + 1).toString().padStart(2, '0')}:00`
        });
      }
      setAvailableTimeSlots(slots);
      toast({
        title: "Точка откроется позже",
        description: `Точка откроется в ${schedule.open}. Выберите время получения.`,
      });
      return;
    }

    // Point is open now - generate slots starting from next full hour
    const slots = [];
    const nextAvailableHour = currentMinute < 30 ? currentHour + 1 : currentHour + 2;
    
    for (let hour = nextAvailableHour; hour < endHour; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({
        time: timeString,
        display: `${timeString} - ${(hour + 1).toString().padStart(2, '0')}:00`
      });
    }

    if (slots.length === 0) {
      toast({
        title: "Нет доступных временных слотов",
        description: "Точка скоро закроется. Пожалуйста, вернитесь завтра.",
        variant: "destructive"
      });
    }

    setAvailableTimeSlots(slots);
  }, [pointDetails, toast]);

  // Calculate totals
  const { originalTotal, discountedTotal, totalSavings } = useMemo(() => {
    const original = cartItems.reduce((sum, item) => sum + ((item.regularPrice || item.price || 0) * item.qty), 0);
    const discounted = cartItems.reduce((sum, item) => {
      const price = item.isDiscountActive ? (item.discountPrice || item.price || 0) : (item.price || 0);
      return sum + (price * item.qty);
    }, 0);
    
    return {
      originalTotal: original,
      discountedTotal: discounted,
      totalSavings: original - discounted
    };
  }, [cartItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTime) {
      toast({
        title: "Ошибка", 
        description: "Выберите время получения",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get today's date in UTC+3 and combine with selected time
      const now = new Date();
      const utc3Now = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      const todayDate = utc3Now.toISOString().slice(0, 10);
      const pickupDateTime = new Date(`${todayDate}T${selectedTime}`);
      
      const result = await createPreOrder({
        customer: {
          name: 'Гость',
          phone: 'N/A'
        },
        pickupTime: pickupDateTime.toISOString(),
        pointId: selectedPointInfo.pointId
      });

      console.log('Pre-order result:', result);
      
      if (!result) {
        toast({
          title: "Ошибка",
          description: "Не удалось получить ответ от сервера",
          variant: "destructive"
        });
        return;
      }
      
      if (result.success) {
        // Send Telegram notification
        try {
          await supabase.functions.invoke('create-pre-order-notification', {
            body: {
              orderId: result.orderId,
              orderCode: result.orderCode,
              pickupPointId: selectedPointInfo.pointId,
              pickupTime: selectedTime,
              totalAmount: discountedTotal.toFixed(2),
              totalSavings: totalSavings.toFixed(2),
              items: cartItems.map(item => ({
                name: item.name,
                quantity: item.qty,
                price: item.price,
                unit: item.unit || 'шт'
              }))
            }
          });
          console.log('Telegram notification sent');
        } catch (notifError) {
          console.error('Error sending Telegram notification:', notifError);
          // Don't fail the order if notification fails
        }
        
        // Navigate to success page with order details
        navigate('/order-success', {
          state: {
            orderCode: result.orderCode,
            pointDetails,
            selectedTime,
            discountedTotal,
            totalSavings
          }
        });
      } else {
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при создании заказа",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Get today's date in UTC+3 (Moldova timezone)
  const getTodayDate = () => {
    const now = new Date();
    const utc3Now = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    return utc3Now.toISOString().slice(0, 10);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            ← Назад
          </Button>
          <h1 className="text-3xl font-bold mb-2">Оформление заказа</h1>
          <p className="text-muted-foreground">Выберите дату и время получения заказа</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pickup Point Info */}
          {pointDetails && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Место получения
                </h3>
                <div className="space-y-2">
                  <p className="font-semibold">{pointDetails.name}</p>
                  <p className="text-sm text-muted-foreground">{pointDetails.address}, {pointDetails.city}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Date and Time Selection */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Время получения
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pickupDate">Дата получения</Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    value={getTodayDate()}
                    disabled
                    className="mt-1 bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Заказы принимаются только на сегодня
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="pickupTime">Время получения *</Label>
                  <Select 
                    value={selectedTime} 
                    onValueChange={setSelectedTime}
                    disabled={availableTimeSlots.length === 0}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите время" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimeSlots.map((slot, index) => (
                        <SelectItem key={index} value={slot.time}>
                          {slot.display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableTimeSlots.length === 0 && (
                    <p className="text-sm text-destructive mt-1">
                      Нет доступных временных слотов
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Состав заказа</h3>
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div key={item.productId || index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Количество: {item.qty} {item.unit || 'шт'}
                        </p>
                        
                        <div className="mt-2 space-y-1">
                          {item.isDiscountActive ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="text-sm line-through text-muted-foreground">
                                  {(item.regularPrice || 0).toFixed(2)} MDL/{item.unit || 'шт'}
                                </span>
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                  Скидка
                                </Badge>
                              </div>
                              <div className="font-semibold text-green-600">
                                {(item.discountPrice || 0).toFixed(2)} MDL/{item.unit || 'шт'}
                              </div>
                            </>
                          ) : (
                            <div className="font-semibold">
                              {(item.price || 0).toFixed(2)} MDL/{item.unit || 'шт'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {item.isDiscountActive ? (
                          <>
                            <div className="text-sm line-through text-muted-foreground">
                              {((item.regularPrice || 0) * (item.qty || 0)).toFixed(2)} MDL
                            </div>
                            <div className="font-bold text-green-600">
                              {((item.discountPrice || 0) * (item.qty || 0)).toFixed(2)} MDL
                            </div>
                          </>
                        ) : (
                          <div className="font-bold">
                            {((item.price || 0) * (item.qty || 0)).toFixed(2)} MDL
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total */}
              <div className="border-t pt-4 mt-4 space-y-2">
                {totalSavings > 0 && (
                  <>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Сумма без скидки:</span>
                      <span className="line-through">{(originalTotal || 0).toFixed(2)} MDL</span>
                    </div>
                    <div className="flex justify-between items-center text-green-600">
                      <span>Экономия:</span>
                      <span>-{(totalSavings || 0).toFixed(2)} MDL</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Итого к оплате:</span>
                  <span className="text-primary">{(discountedTotal || 0).toFixed(2)} MDL</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isProcessing || !selectedTime || availableTimeSlots.length === 0}
              className="flex-1"
              size="lg"
            >
              {isProcessing ? 'Создание заказа...' : `Оформить заказ на ${(discountedTotal || 0).toFixed(2)} MDL`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
