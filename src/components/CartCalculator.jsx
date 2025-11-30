import React from 'react';
import { formatPrice, formatQuantity, getCurrencySymbol } from '@/utils/unitUtils';
import { Badge } from '@/components/ui/badge';

/**
 * Компонент для расчета корзины с учетом единиц измерения
 * Показывает итоговую сумму и количество по каждому товару
 */
const CartCalculator = ({ cartItems, currency = 'MDL' }) => {
  if (!cartItems || cartItems.length === 0) {
    return null;
  }

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
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="bg-card p-4 rounded-lg space-y-4">
      {/* Итоги */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Количество товаров:</span>
          <span className="text-foreground">{totalItems}</span>
        </div>
        {hasSavings && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Сумма без скидки:</span>
              <span className="text-muted-foreground line-through">{(originalAmount || 0).toFixed(2)} {currencySymbol}</span>
            </div>
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>Экономия:</span>
              <span>-{((originalAmount - totalAmount) || 0).toFixed(2)} {currencySymbol}</span>
            </div>
          </>
        )}
        <div className="flex justify-between text-lg font-semibold">
          <span className="text-foreground">Итого:</span>
          <span className={hasSavings ? 'text-green-600' : 'text-primary'}>{(totalAmount || 0).toFixed(2)} {currencySymbol}</span>
        </div>
      </div>
    </div>
  );
};

export default CartCalculator;