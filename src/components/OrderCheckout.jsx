import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock, User, Phone, Mail, MapPin, Calendar, Percent } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { usePickupPoints } from '../hooks/usePickupPoints';
import { useTimeSlots } from '../hooks/useTimeSlots';
import { useDiscounts, isDiscountActive, calculateDiscountedPrice } from '../hooks/useDiscounts';
import { supabase } from '@/integrations/supabase/client';

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
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [selectedPickupPoint, setSelectedPickupPoint] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [producerId, setProducerId] = useState(null);
  const [producerSlug, setProducerSlug] = useState(null);

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
  const { discounts } = useDiscounts(cartItems.map(item => item.productId));

  // Calculate discounted prices for cart items
  const cartItemsWithDiscounts = useMemo(() => {
    const now = new Date();
    const currentTimeStr = now.toTimeString().slice(0, 8);
    
    return cartItems.map(item => {
      const discount = discounts.find(d => d.product_id === item.productId);
      const isDiscountTime = discount && isDiscountActive(discount, now);
      
      let finalPrice = item.price;
      let discountPercent = 0;
      
      if (isDiscountTime) {
        finalPrice = calculateDiscountedPrice(item.price, discount);
        if (discount.discount_percent) {
          discountPercent = discount.discount_percent;
        } else if (discount.discount_amount) {
          discountPercent = Math.round((discount.discount_amount / item.price) * 100);
        }
      }
      
      return {
        ...item,
        originalPrice: item.price,
        finalPrice,
        discountPercent,
        hasDiscount: isDiscountTime
      };
    });
  }, [cartItems, discounts]);

  // Calculate totals
  const { originalTotal, discountedTotal, totalSavings } = useMemo(() => {
    const original = cartItemsWithDiscounts.reduce((sum, item) => sum + (item.originalPrice * item.qty), 0);
    const discounted = cartItemsWithDiscounts.reduce((sum, item) => sum + (item.finalPrice * item.qty), 0);
    
    return {
      originalTotal: original,
      discountedTotal: discounted,
      totalSavings: original - discounted
    };
  }, [cartItemsWithDiscounts]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerData.name || !customerData.phone) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля: имя и телефон",
        variant: "destructive"
      });
      return;
    }

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
        customer: customerData,
        pickupTime: pickupDateTime.toISOString(),
        pointId: selectedPickupPoint
      });

      if (result.success) {
        toast({
          title: "Заказ создан!",
          description: `Код заказа: ${result.orderCode}`,
          duration: 5000
        });
        
        // Reset form
        setCustomerData({ name: '', phone: '', email: '' });
        setSelectedPickupPoint('');
        setSelectedDate('');
        setSelectedTime('');
        onClose();
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

  // Generate minimum date (today)
  const getMinimumDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                {cartItemsWithDiscounts.map((item, index) => (
                  <div key={item.productId || index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Количество: {item.qty} {item.unit || 'шт'}
                        </p>
                        
                        {/* Цены */}
                        <div className="mt-2 space-y-1">
                          {item.hasDiscount ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="price-original">
                                  {item.originalPrice.toFixed(2)} MDL/{item.unit || 'шт'}
                                </span>
                                <Badge variant="secondary" className="discount-highlight">
                                  -{item.discountPercent}%
                                </Badge>
                              </div>
                              <div className="price-discount">
                                {item.finalPrice.toFixed(2)} MDL/{item.unit || 'шт'}
                              </div>
                            </>
                          ) : (
                            <div className="font-semibold">
                              {item.finalPrice.toFixed(2)} MDL/{item.unit || 'шт'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {item.hasDiscount ? (
                          <>
                            <div className="price-original text-sm">
                              {(item.originalPrice * item.qty).toFixed(2)} MDL
                            </div>
                            <div className="price-discount font-bold">
                              {(item.finalPrice * item.qty).toFixed(2)} MDL
                            </div>
                          </>
                        ) : (
                          <div className="font-bold">
                            {(item.finalPrice * item.qty).toFixed(2)} MDL
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
                      <span className="price-original">{originalTotal.toFixed(2)} MDL</span>
                    </div>
                    <div className="flex justify-between items-center text-green-600">
                      <span>Экономия:</span>
                      <span>-{totalSavings.toFixed(2)} MDL</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Итого к оплате:</span>
                  <span className="price-discount">{discountedTotal.toFixed(2)} MDL</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Контактная информация */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-medium mb-4">Контактная информация:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Имя *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={customerData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Ваше имя"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Телефон *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={customerData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+373 XX XXX XXX"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email (необязательно)
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={customerData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isProcessing || !selectedPickupPoint || !selectedDate || !selectedTime}
                className="flex-1"
              >
                {isProcessing ? 'Создание заказа...' : `Оформить заказ на ${discountedTotal.toFixed(2)} MDL`}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderCheckout;