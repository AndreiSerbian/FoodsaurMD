import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, MapPin, Clock, Percent, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PreOrderForm = () => {
  const {
    cartItems,
    cartTotal,
    discountTotal,
    selectedPickupPoint,
    selectedPickupTime,
    createPreOrder,
    isWithinDiscountTime
  } = useCart();
  
  const [isCreating, setIsCreating] = useState(false);
  const [orderCode, setOrderCode] = useState(null);
  const { toast } = useToast();

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Корзина пуста",
        description: "Добавьте товары в корзину",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPickupPoint) {
      toast({
        title: "Точка не выбрана",
        description: "Выберите точку получения",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPickupTime) {
      toast({
        title: "Время не выбрано",
        description: "Выберите время получения",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const order = await createPreOrder();
      if (order) {
        setOrderCode(order.order_code);
      }
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatPrice = (price) => {
    return `${price.toFixed(2)} лей`;
  };

  if (orderCode) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="text-green-800 flex items-center justify-center gap-2">
            <Receipt className="h-6 w-6" />
            Заказ успешно создан!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-4xl font-bold text-green-700 tracking-wider">
            {orderCode}
          </div>
          <div className="text-sm text-green-600">
            Код заказа для получения
          </div>
          
          <Separator />
          
          <div className="text-left space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Точка получения:</span>
            </div>
            <div className="text-sm text-muted-foreground ml-6">
              {selectedPickupPoint?.name}
            </div>
            <div className="text-sm text-muted-foreground ml-6">
              {selectedPickupPoint?.address}
            </div>
            
            <div className="flex items-center gap-2 text-sm pt-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Время получения:</span>
            </div>
            <div className="text-sm text-muted-foreground ml-6">
              {selectedPickupTime && formatTime(selectedPickupTime)}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
            <div className="text-sm font-medium text-yellow-800 mb-1">
              Важная информация:
            </div>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Сохраните код заказа</li>
              <li>• Предъявите код при получении</li>
              <li>• Скидка действует +30 мин после времени</li>
              <li>• При опоздании производитель может реализовать товар</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Оформление предзаказа
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Summary */}
        <div className="space-y-3">
          <h3 className="font-medium">Состав заказа:</h3>
          {cartItems.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Корзина пуста
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2">
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatPrice(item.priceDiscount || item.priceRegular)} × {item.quantity}
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {formatPrice((item.priceDiscount || item.priceRegular) * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        <Separator />

        {/* Price Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Обычная цена:</span>
            <span>{formatPrice(cartTotal + discountTotal)}</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span className="flex items-center gap-1">
                <Percent className="h-3 w-3" />
                Скидка:
              </span>
              <span>-{formatPrice(discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium">
            <span>Итого к оплате:</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
        </div>

        <Separator />

        {/* Pickup Details */}
        {selectedPickupPoint && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              Точка получения:
            </div>
            <div className="text-sm text-muted-foreground ml-6">
              {selectedPickupPoint.name}
            </div>
            <div className="text-sm text-muted-foreground ml-6">
              {selectedPickupPoint.address}
            </div>
          </div>
        )}

        {selectedPickupTime && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Время получения:
            </div>
            <div className="text-sm text-muted-foreground ml-6">
              {formatTime(selectedPickupTime)}
            </div>
          </div>
        )}

        {/* Discount Status */}
        {selectedPickupPoint && (
          <div className={`p-3 rounded-lg border ${
            isWithinDiscountTime() 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <div className="text-sm font-medium">
              {isWithinDiscountTime() ? '✓ Скидка активна' : '⚠ Скидка неактивна'}
            </div>
            <div className="text-xs mt-1">
              {isWithinDiscountTime() 
                ? 'Скидка будет зафиксирована в заказе'
                : 'Скидка будет применена при оформлении в скидочное время'
              }
            </div>
          </div>
        )}

        {/* Create Order Button */}
        <Button 
          onClick={handleCreateOrder}
          disabled={isCreating || cartItems.length === 0 || !selectedPickupPoint || !selectedPickupTime}
          className="w-full"
          size="lg"
        >
          {isCreating ? 'Создание заказа...' : 'Создать предзаказ'}
        </Button>

        {/* Info */}
        <div className="text-xs text-muted-foreground text-center">
          После создания заказа вы получите код для получения товара
        </div>
      </CardContent>
    </Card>
  );
};

export default PreOrderForm;