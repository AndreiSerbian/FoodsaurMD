import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Copy } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useCart } from '../contexts/CartContext';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { clearCart } = useCart();
  
  const orderCode = location.state?.orderCode;
  const pointDetails = location.state?.pointDetails;
  const selectedTime = location.state?.selectedTime;
  const discountedTotal = location.state?.discountedTotal;
  const totalSavings = location.state?.totalSavings;

  // Clear cart on mount and redirect if no order code
  React.useEffect(() => {
    if (!orderCode) {
      navigate('/');
    } else {
      clearCart();
    }
  }, [orderCode, navigate, clearCart]);

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
    navigate('/');
  };

  const getTodayDate = () => {
    const now = new Date();
    const utc3Now = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    return utc3Now.toISOString().slice(0, 10);
  };

  if (!orderCode) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center">
          <CheckCircle2 className="h-20 w-20 text-green-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Заказ успешно создан!
          </h1>

          <div className="mb-8">
            <p className="text-muted-foreground mb-4">Ваш код заказа:</p>
            <div className="flex items-center justify-center gap-3 mb-2">
              <p className="text-6xl font-bold text-primary tracking-wider">{orderCode}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                className="h-12 w-12 p-0"
              >
                <Copy className="h-6 w-6" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Код отправлен производителю в Telegram
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Детали заказа:</h3>
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
                  <span className="font-bold text-lg">{discountedTotal?.toFixed(2)} MDL</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Экономия:</span>
                    <span className="font-semibold">-{totalSavings?.toFixed(2)} MDL</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleFinish} className="w-full" size="lg">
            Вернуться на главную
          </Button>
        </div>
      </div>

      {/* Warning at the bottom */}
      <div className="bg-amber-50 border-t border-amber-200 px-4 py-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-base font-semibold text-amber-900 mb-2">
            ⚠️ Важно: Сохраните этот код!
          </p>
          <p className="text-sm text-amber-800">
            Сделайте скриншот или запишите код. Предъявите его производителю при получении заказа.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
