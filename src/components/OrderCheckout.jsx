import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, User, Phone, Mail } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

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
  const [pickupTime, setPickupTime] = useState('');

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

    if (!pickupTime) {
      toast({
        title: "Ошибка", 
        description: "Выберите время получения заказа",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await createPreOrder({
        customer: customerData,
        pickupTime: new Date(pickupTime).toISOString()
      });

      if (result.success) {
        toast({
          title: "Заказ создан!",
          description: `Код заказа: ${result.orderCode}`,
          duration: 5000
        });
        
        // Reset form
        setCustomerData({ name: '', phone: '', email: '' });
        setPickupTime('');
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

  // Generate minimum time (30 minutes from now)
  const getMinimumDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Оформление заказа
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Информация о точке получения */}
          {selectedPointInfo && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-medium mb-2">Точка получения:</h3>
                <p className="text-sm text-muted-foreground">{selectedPointInfo.pointName}</p>
                <p className="text-sm text-muted-foreground">{selectedPointInfo.address}</p>
              </CardContent>
            </Card>
          )}

          {/* Список товаров */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-medium mb-4">Состав заказа:</h3>
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div key={item.productId || index} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.price} MDL/{item.unit || 'шт'} × {item.qty}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {(item.price * item.qty).toFixed(2)} MDL
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 mt-4">
                <div className="flex justify-between items-center font-bold">
                  <span>Итого:</span>
                  <span>{totalAmount.toFixed(2)} MDL</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Форма заказа */}
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

            <Card>
              <CardContent className="pt-4">
                <h3 className="font-medium mb-4">Время получения:</h3>
                <div>
                  <Label htmlFor="pickupTime" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Выберите время получения *
                  </Label>
                  <Input
                    id="pickupTime"
                    type="datetime-local"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    min={getMinimumDateTime()}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Минимальное время: через 30 минут от текущего времени
                  </p>
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
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Создание заказа...' : 'Оформить заказ'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderCheckout;