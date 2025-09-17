import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Minus } from 'lucide-react';
import { checkProductAvailability } from '@/modules/cart/inventorySync';
import { getSelectedPoint, getCart } from '@/modules/cart/cartState';
import { formatQty, normalizeQty, getStep } from '@/modules/cart/quantity';

/**
 * Компонент ввода количества с учетом остатков на складе
 * Работает "в фоне" - пользователь не видит остатки напрямую
 */
const StockAwareQuantityInput = ({ 
  productId, 
  unit = 'шт', 
  value = 0, 
  onChange, 
  disabled = false,
  className = "" 
}) => {
  const [inputValue, setInputValue] = useState(formatQty(value, unit));
  const [maxAvailable, setMaxAvailable] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const step = getStep(unit);

  useEffect(() => {
    setInputValue(formatQty(value, unit));
  }, [value, unit]);

  useEffect(() => {
    // Проверяем доступное количество при изменении товара
    const checkAvailability = async () => {
      const selectedPoint = getSelectedPoint();
      if (!selectedPoint || !productId) return;

      setIsLoading(true);
      try {
        const cart = getCart();
        const currentInCart = cart.items?.find(item => item.productId === productId)?.qty || 0;
        
        const availability = await checkProductAvailability(
          selectedPoint.pointId,
          productId,
          value,
          currentInCart - value // исключаем текущее значение из расчета
        );
        
        setMaxAvailable(availability.maxQty);
      } catch (error) {
        console.error('Error checking availability:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, [productId, value]);

  const handleInputChange = (e) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);

    const numVal = parseFloat(inputVal) || 0;
    const normalized = normalizeQty(numVal, unit);
    
    // Ограничиваем значение доступным количеством
    const finalValue = Math.min(normalized, maxAvailable);
    
    if (finalValue !== normalized && maxAvailable > 0) {
      // Показываем пользователю, что количество ограничено
      setInputValue(formatQty(finalValue, unit));
    }
    
    onChange?.(finalValue);
  };

  const handleBlur = () => {
    setInputValue(formatQty(value, unit));
  };

  const increment = () => {
    const newValue = Math.min(value + step, maxAvailable);
    onChange?.(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(0, value - step);
    onChange?.(newValue);
  };

  const canIncrement = value + step <= maxAvailable && !disabled;
  const canDecrement = value >= step && !disabled;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={decrement}
        disabled={!canDecrement || isLoading}
        className="h-8 w-8 p-0"
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <Input
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={disabled || isLoading}
        className="w-20 text-center h-8"
        step={step}
        min="0"
        max={maxAvailable}
      />
      
      <Button
        variant="outline"
        size="sm"
        onClick={increment}
        disabled={!canIncrement || isLoading}
        className="h-8 w-8 p-0"
      >
        <Plus className="h-3 w-3" />
      </Button>
      
    </div>
  );
};

export default StockAwareQuantityInput;