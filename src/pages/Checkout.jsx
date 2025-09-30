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
  const [selectedDate, setSelectedDate] = useState('');
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

  // Generate time slots based on point's work hours
  useEffect(() => {
    if (!selectedDate || !pointDetails?.work_hours) return;

    const selectedDateObj = new Date(selectedDate);
    const dayOfWeek = selectedDateObj.getDay(); // 0 = Sunday, 6 = Saturday
    
    // work_hours format: { "0": { "start": "09:00", "end": "18:00" }, ... }
    const daySchedule = pointDetails.work_hours[dayOfWeek];
    
    if (!daySchedule || !daySchedule.start || !daySchedule.end) {
      setAvailableTimeSlots([]);
      toast({
        title: "Точка закрыта",
        description: "Выбранная точка не работает в этот день",
        variant: "destructive"
      });
      return;
    }

    // Generate hourly slots between start and end time
    const slots = [];
    const [startHour] = daySchedule.start.split(':').map(Number);
    const [endHour] = daySchedule.end.split(':').map(Number);

    for (let hour = startHour; hour < endHour; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({
        time: timeString,
        display: `${timeString} - ${(hour + 1).toString().padStart(2, '0')}:00`
      });
    }

    setAvailableTimeSlots(slots);
  }, [selectedDate, pointDetails, toast]);

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

    if (!selectedDate || !selectedTime) {
      toast({
        title: "Ошибка", 
        description: "Выберите дату и время получения",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Combine date and time
      const pickupDateTime = new Date(`${selectedDate}T${selectedTime}`);
      
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

  // Get minimum date (today)
  const getMinimumDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
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
                  <p className="text-sm text-muted-foreground">
                    Предъявите этот код при получении заказа
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
                      <span className="font-medium">{selectedDate}</span>
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
                <Calendar className="h-5 w-5 text-primary" />
                Дата и время получения
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupDate">Дата получения *</Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime(''); // Reset time when date changes
                    }}
                    min={getMinimumDate()}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="pickupTime">Время получения *</Label>
                  <Select 
                    value={selectedTime} 
                    onValueChange={setSelectedTime}
                    disabled={!selectedDate || availableTimeSlots.length === 0}
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
                  {selectedDate && availableTimeSlots.length === 0 && (
                    <p className="text-sm text-destructive mt-1">Точка не работает в этот день</p>
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
              disabled={isProcessing || !selectedDate || !selectedTime}
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
