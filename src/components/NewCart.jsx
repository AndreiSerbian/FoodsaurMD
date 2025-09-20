import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useNewCart } from '@/contexts/NewCartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

const NewCart = () => {
  const {
    cartItems,
    selectedPointId,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
    processOrder
  } = useNewCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleCheckout = async () => {
    if (!orderData.customerName || !orderData.customerPhone) {
      return;
    }

    setLoading(true);
    try {
      await processOrder(orderData);
      setIsCheckoutOpen(false);
      setOrderData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        notes: ''
      });
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `${Number(price).toFixed(2)} лей`;
  };

  const getVariantDescription = (item) => {
    switch (item.saleMode) {
      case 'per_pack':
        return `${item.quantity} пачек`;
      case 'per_weight':
        return item.quantity >= 1000 
          ? `${(item.quantity / 1000).toFixed(1)} кг` 
          : `${item.quantity} г`;
      case 'per_unit':
        return `${item.quantity} шт`;
      default:
        return `${item.quantity}`;
    }
  };

  if (cartItems.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Корзина
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Корзина пуста
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Корзина
          </span>
          <Badge variant="outline">
            {getTotalItems()} товаров
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex-1 space-y-1">
                <h4 className="font-medium text-sm">{item.productName}</h4>
                <p className="text-xs text-muted-foreground">{item.variantName}</p>
                <p className="text-xs font-medium">{getVariantDescription(item)}</p>
                <p className="text-sm font-semibold">{formatPrice(item.totalPrice)}</p>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  
                  <span className="text-xs w-8 text-center">{item.quantity}</span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center font-semibold">
            <span>Итого:</span>
            <span>{formatPrice(getTotalPrice())}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                Оформить заказ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Оформление заказа</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Имя *</Label>
                  <Input
                    id="customerName"
                    value={orderData.customerName}
                    onChange={(e) => setOrderData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Введите ваше имя"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Телефон *</Label>
                  <Input
                    id="customerPhone"
                    value={orderData.customerPhone}
                    onChange={(e) => setOrderData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="+373 XX XXX XXX"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={orderData.customerEmail}
                    onChange={(e) => setOrderData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Комментарий</Label>
                  <Textarea
                    id="notes"
                    value={orderData.notes}
                    onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Дополнительные пожелания..."
                    rows={3}
                  />
                </div>

                <Alert>
                  <AlertDescription>
                    Итого к оплате: <strong>{formatPrice(getTotalPrice())}</strong>
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={handleCheckout}
                  disabled={!orderData.customerName || !orderData.customerPhone || loading}
                  className="w-full"
                >
                  {loading ? 'Оформление...' : 'Подтвердить заказ'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            onClick={clearCart}
            className="w-full"
          >
            Очистить корзину
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewCart;