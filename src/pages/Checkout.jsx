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
  const [orderCode, setOrderCode] = useState(null);
  const [orderId, setOrderId] = useState(null);
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

  // Generate 6-digit random code
  const generateOrderCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

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

      if (result.success) {
        setOrderCode(result.orderCode);
        setOrderId(result.orderId);
        
        // Send Telegram notification
        try {
          const itemsCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
          await supabase.functions.invoke('create-pre-order-notification', {
            body: {
              preOrderId: result.orderId,
              orderCode: result.orderCode,
              pickupPointId: selectedPointInfo.pointId,
              totalAmount: discountedTotal.toFixed(2),
              itemsCount
            }
          });
          console.log('Telegram notification sent');
        } catch (notifError) {
          console.error('Error sending Telegram notification:', notifError);
          // Don't fail the order if notification fails
        }
        
        toast({
          title: "Заказ создан!",
          description: `Код заказа: ${result.orderCode}`,
          duration: 5000
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

  const handleCopyCode = () => {
    if (orderCode) {
      navigator.clipboard.writeText(orderCode);
      toast({
        title: "Скопировано",
        description: "Код заказа скопирован в буфер обмена"
      });
    }
  };

  const handleFinish = () => {
    clearCart();
    navigate('/');
  };

  // Get today's date in UTC+3 (Moldova timezone)
  const getTodayDate = () => {
    const now = new Date();
    const utc3Now = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    return utc3Now.toISOString().slice(0, 10);
  };

  // If order is created, show success screen
  if (orderCode) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-green-800 mb-2">
                  Заказ успешно создан!
                </h1>
              </div>

              <Card className="bg-white border-green-300 mb-6">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Ваш код заказа:</p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <p className="text-4xl font-bold text-green-700 tracking-wider">{orderCode}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyCode}
                      className="h-10 w-10 p-0"
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-2">
                    <p className="text-sm font-semibold text-amber-900 mb-1">
                      ⚠️ Важно: Сохраните этот код!
                    </p>
                    <p className="text-sm text-amber-800">
                      Сделайте скриншот или запишите код. Предъявите его производителю при получении заказа.
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Код также отправлен производителю в Telegram
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardContent className="pt-4">
                  <h3 className="font-medium mb-3">Детали заказа:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Точка получения:</span>
                      <span className="font-medium">{pointDetails?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Адрес:</span>
                      <span className="font-medium">{pointDetails?.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Дата получения:</span>
                      <span className="font-medium">{getTodayDate()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Время:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2 mt-2">
                      <span className="text-muted-foreground">Сумма заказа:</span>
                      <span className="font-bold text-lg">{discountedTotal.toFixed(2)} MDL</span>
                    </div>
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Экономия:</span>
                        <span className="font-semibold">-{totalSavings.toFixed(2)} MDL</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleFinish} className="w-full" size="lg">
                Вернуться на главную
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
