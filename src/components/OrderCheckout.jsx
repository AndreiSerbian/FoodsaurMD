import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock, MapPin, Calendar, Percent, CheckCircle2, Copy } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { usePickupPoints } from '../hooks/usePickupPoints';
import { useTimeSlots } from '../hooks/useTimeSlots';
import { supabase } from '@/integrations/supabase/client';
import { getCurrencySymbol } from '@/utils/unitUtils';

const OrderCheckout = ({ isOpen, onClose }) => {
  const {
    cartItems,
    cartTotal,
    selectedPointInfo,
    createPreOrder,
    clearCart
  } = useCart();
  
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [producerId, setProducerId] = useState(null);
  const [producerSlug, setProducerSlug] = useState(null);
  const [orderCode, setOrderCode] = useState(null);
  const [orderId, setOrderId] = useState(null);
  
  const currency = selectedPointInfo?.currency || 'MDL';
  const currencySymbol = getCurrencySymbol(currency);

  // Get first item's producer info
  useEffect(() => {
    if (cartItems.length > 0) {
      const firstItem = cartItems[0];
      setProducerSlug(firstItem.producerSlug);
      
      // Fetch producer ID
      const fetchProducerId = async () => {
        const { data } = await supabase
          .from('producer_profiles')
          .select('id')
          .eq('slug', firstItem.producerSlug)
          .single();
        
        if (data) {
          setProducerId(data.id);
        }
      };
      
      fetchProducerId();
    }
  }, [cartItems]);

  // Hooks for data fetching
  const { points: pickupPoints } = usePickupPoints(producerSlug);
  const { timeSlots } = useTimeSlots(producerId);

  // Calculate totals from cart items
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

  // Generate time options for selected date
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !timeSlots.length) return [];
    
    const selectedDateObj = new Date(selectedDate);
    const dayOfWeek = selectedDateObj.getDay(); // 0 = Sunday, 6 = Saturday
    
    return timeSlots
      .filter(slot => slot.day_of_week === dayOfWeek)
      .map(slot => ({
        ...slot,
        timeString: `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`,
        isDiscountTime: slot.is_discount_time
      }));
  }, [selectedDate, timeSlots]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPickupPoint || !selectedDate || !selectedTime) {
      toast({
        title: "Ошибка", 
        description: "Выберите точку получения, дату и время",
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
        pointId: selectedPickupPoint
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

  const handleClose = () => {
    setOrderCode(null);
    setOrderId(null);
    setSelectedPickupPoint('');
    setSelectedDate('');
    setSelectedTime('');
    onClose();
  };

  // Generate minimum date (today)
  const getMinimumDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  // If order is created, show success screen
  if (orderCode) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md z-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              Заказ успешно создан!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Код заказа:</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-3xl font-bold text-green-700">{orderCode}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCode}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Сохраните этот код для получения заказа
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h3 className="font-medium mb-2">Детали заказа:</h3>
                <div className="space-y-2 text-sm">
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
                    <span className="font-bold text-lg">{discountedTotal.toFixed(2)} {currencySymbol}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Экономия:</span>
                      <span className="font-semibold">-{totalSavings.toFixed(2)} {currencySymbol}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleClose} className="w-full">
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Оформление заказа
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Место получения */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Место получения *
              </h3>
              <Select value={selectedPickupPoint} onValueChange={setSelectedPickupPoint}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите точку получения" />
                </SelectTrigger>
                <SelectContent>
                  {pickupPoints.map(point => (
                    <SelectItem key={point.id} value={point.id}>
                      <div>
                        <div className="font-medium">{point.name}</div>
                        <div className="text-sm text-muted-foreground">{point.address}, {point.city}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Дата и время выдачи */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Дата и время выдачи *
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupDate">Дата получения</Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinimumDate()}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="pickupTime">Время получения</Label>
                  <Select 
                    value={selectedTime} 
                    onValueChange={setSelectedTime}
                    disabled={!selectedDate}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите время" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimeSlots.map((slot, index) => (
                        <SelectItem key={index} value={slot.start_time}>
                          <div className={`flex items-center gap-2 ${slot.isDiscountTime ? 'text-green-600' : ''}`}>
                            <span>{slot.timeString}</span>
                            {slot.isDiscountTime && (
                              <Badge variant="secondary" className="discount-highlight">
                                <Percent className="h-3 w-3 mr-1" />
                                Скидка
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Список товаров из корзины */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-medium mb-4">Состав заказа:</h3>
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div key={item.productId || index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Количество: {item.qty} {item.unit || 'шт'}
                        </p>
                        
                        {/* Цены */}
                        <div className="mt-2 space-y-1">
                          {item.isDiscountActive ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="price-original">
                                  {(item.regularPrice || 0).toFixed(2)} {currencySymbol}/{item.unit || 'шт'}
                                </span>
                                <Badge variant="secondary" className="discount-highlight">
                                  Скидка
                                </Badge>
                              </div>
                              <div className="price-discount">
                                {(item.discountPrice || 0).toFixed(2)} {currencySymbol}/{item.unit || 'шт'}
                              </div>
                            </>
                          ) : (
                            <div className="font-semibold">
                              {(item.price || 0).toFixed(2)} {currencySymbol}/{item.unit || 'шт'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {item.isDiscountActive ? (
                          <>
                            <div className="price-original text-sm">
                              {((item.regularPrice || 0) * (item.qty || 0)).toFixed(2)} {currencySymbol}
                            </div>
                            <div className="price-discount font-bold">
                              {((item.discountPrice || 0) * (item.qty || 0)).toFixed(2)} {currencySymbol}
                            </div>
                          </>
                        ) : (
                          <div className="font-bold">
                            {((item.price || 0) * (item.qty || 0)).toFixed(2)} {currencySymbol}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Сумма заказа */}
              <div className="border-t pt-4 mt-4 space-y-2">
                {totalSavings > 0 && (
                  <>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Сумма без скидки:</span>
                      <span className="price-original">{(originalTotal || 0).toFixed(2)} {currencySymbol}</span>
                    </div>
                    <div className="flex justify-between items-center text-green-600">
                      <span>Экономия:</span>
                      <span>-{(totalSavings || 0).toFixed(2)} {currencySymbol}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Итого к оплате:</span>
                  <span className="price-discount">{(discountedTotal || 0).toFixed(2)} {currencySymbol}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Кнопки действий */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isProcessing || !selectedPickupPoint || !selectedDate || !selectedTime}
                className="flex-1"
              >
                {isProcessing ? 'Создание заказа...' : `Оформить заказ на ${(discountedTotal || 0).toFixed(2)} ${currencySymbol}`}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderCheckout;