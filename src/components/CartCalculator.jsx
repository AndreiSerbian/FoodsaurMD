import React, { useState, useEffect } from 'react';
import { formatPrice, formatQuantity } from '@/utils/unitUtils';
import { getInventoryData } from '@/modules/cart/inventorySync';
import { getSelectedPoint } from '@/modules/cart/cartState';
import { Badge } from '@/components/ui/badge';

/**
 * Компонент для расчета корзины с учетом единиц измерения
 * Показывает итоговую сумму и количество по каждому товару
 */
const CartCalculator = ({ cartItems, onValidationChange }) => {
  const [inventory, setInventory] = useState(new Map());
  const [validationErrors, setValidationErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const validateAndCalculate = async () => {
      if (!cartItems || cartItems.length === 0) {
        onValidationChange?.(true, []);
        return;
      }

      const selectedPoint = getSelectedPoint();
      if (!selectedPoint) return;

      setIsLoading(true);
      try {
        const productIds = cartItems.map(item => item.productId);
        const inventoryData = await getInventoryData(selectedPoint.pointId, productIds);
        setInventory(inventoryData);

        // Проверка доступности
        const errors = [];
        cartItems.forEach(item => {
          const productData = inventoryData.get(item.productId);
          if (!productData || item.qty > productData.stock) {
            errors.push({
              productId: item.productId,
              message: `Превышен остаток товара (доступно: ${productData?.stock || 0} ${productData?.unit || 'шт'})`
            });
          }
        });

        setValidationErrors(errors);
        onValidationChange?.(errors.length === 0, errors);
      } catch (error) {
        console.error('Error validating cart:', error);
        onValidationChange?.(false, []);
      } finally {
        setIsLoading(false);
      }
    };

    validateAndCalculate();
  }, [cartItems, onValidationChange]);

  // Расчет итогов с учетом скидок из point_variants
  const calculateTotals = () => {
    let totalAmount = 0;
    let originalAmount = 0;
    let totalItems = 0;

    cartItems.forEach(item => {
      // Используем цены из item (из point_variants с учетом времени)
      const regularPrice = item.regularPrice || item.price || 0;
      const currentPrice = (item.isDiscountActive && item.discountPrice) ? item.discountPrice : regularPrice;
      
      originalAmount += regularPrice * item.qty;
      totalAmount += currentPrice * item.qty;
      totalItems += item.qty;
    });

    return { totalAmount, originalAmount, totalItems, hasSavings: originalAmount > totalAmount };
  };

  const { totalAmount, originalAmount, totalItems, hasSavings } = calculateTotals();

  if (isLoading) {
    return (
      <div className="bg-card p-4 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-muted rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-4 rounded-lg space-y-4">
      {/* Список товаров с расчетами */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Состав заказа:</h3>
        {cartItems.map(item => {
          const unit = item.unit || 'шт';
          const regularPrice = item.regularPrice || item.price || 0;
          const hasActiveDiscount = item.isDiscountActive && item.discountPrice;
          const currentPrice = hasActiveDiscount ? item.discountPrice : regularPrice;
          const subtotal = currentPrice * item.qty;
          const originalSubtotal = regularPrice * item.qty;

          return (
            <div key={item.productId} className="flex justify-between text-sm gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-foreground">{item.name || item.product?.name || 'Товар'}</span>
                  {hasActiveDiscount && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      Скидка
                    </Badge>
                  )}
                </div>
                <div className="text-muted-foreground">
                  {formatQuantity(item.qty, unit)} × {hasActiveDiscount ? (
                    <>
                      <span className="line-through mr-1">{formatPrice(regularPrice, unit)}</span>
                      <span className="text-green-600 font-medium">{formatPrice(currentPrice, unit)}</span>
                    </>
                  ) : (
                    formatPrice(currentPrice, unit)
                  )}
                </div>
              </div>
              <div className="text-right">
                {hasActiveDiscount && (
                  <div className="text-xs text-muted-foreground line-through">
                    {(originalSubtotal || 0).toFixed(2)} лей
                  </div>
                )}
                <span className={`font-medium ${hasActiveDiscount ? 'text-green-600' : ''}`}>
                  {(subtotal || 0).toFixed(2)} лей
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ошибки валидации */}
      {validationErrors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 p-3 rounded">
          <h4 className="text-destructive font-medium mb-2 text-sm">⚠️ Превышен доступный остаток:</h4>
          {validationErrors.map(error => (
            <div key={error.productId} className="text-sm text-destructive">
              {error.message}
            </div>
          ))}
        </div>
      )}

      {/* Итоги */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Количество товаров:</span>
          <span className="text-foreground">{totalItems}</span>
        </div>
        {hasSavings && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Сумма без скидки:</span>
              <span className="text-muted-foreground line-through">{(originalAmount || 0).toFixed(2)} лей</span>
            </div>
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>Экономия:</span>
              <span>-{((originalAmount - totalAmount) || 0).toFixed(2)} лей</span>
            </div>
          </>
        )}
        <div className="flex justify-between text-lg font-semibold">
          <span className="text-foreground">Итого:</span>
          <span className={hasSavings ? 'text-green-600' : 'text-primary'}>{(totalAmount || 0).toFixed(2)} лей</span>
        </div>
      </div>
    </div>
  );
};

export default CartCalculator;