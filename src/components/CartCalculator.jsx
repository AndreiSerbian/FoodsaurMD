import React, { useState, useEffect } from 'react';
import { formatPrice, formatQuantity } from '@/utils/unitUtils';
import { getInventoryData } from '@/modules/cart/inventorySync';
import { getSelectedPoint } from '@/modules/cart/cartState';

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
              productName: item.product?.name || 'Товар',
              requested: item.qty,
              available: productData?.stock || 0,
              unit: productData?.unit || 'шт'
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

  // Расчет итогов
  const calculateTotals = () => {
    let totalAmount = 0;
    let totalItems = 0;

    cartItems.forEach(item => {
      const productData = inventory.get(item.productId);
      const price = productData?.price || item.price || 0;
      totalAmount += price * item.qty;
      totalItems += item.qty;
    });

    return { totalAmount, totalItems };
  };

  const { totalAmount, totalItems } = calculateTotals();

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
          const productData = inventory.get(item.productId);
          const price = productData?.price || item.price || 0;
          const unit = productData?.unit || 'шт';
          const subtotal = price * item.qty;

          return (
            <div key={item.productId} className="flex justify-between text-sm">
              <div className="flex-1">
                <span className="text-foreground">{item.product?.name || 'Товар'}</span>
                <div className="text-muted-foreground">
                  {formatQuantity(item.qty, unit)} × {formatPrice(price, unit)}
                </div>
              </div>
              <div className="text-right">
                <span className="font-medium">{(subtotal || 0).toFixed(2)} лей</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ошибки валидации */}
      {validationErrors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 p-3 rounded">
          <h4 className="text-destructive font-medium mb-2">Превышен лимит товара:</h4>
          {validationErrors.map(error => (
            <div key={error.productId} className="text-sm text-destructive">
              {error.productName}: запрошено {error.requested}, доступно {error.available} {error.unit}
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
        <div className="flex justify-between text-lg font-semibold">
          <span className="text-foreground">Итого:</span>
          <span className="text-primary">{(totalAmount || 0).toFixed(2)} лей</span>
        </div>
      </div>
    </div>
  );
};

export default CartCalculator;