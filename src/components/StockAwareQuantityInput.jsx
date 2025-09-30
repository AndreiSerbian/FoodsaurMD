import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Minus } from 'lucide-react';
import { getSelectedPoint } from '@/modules/cart/cartState';
import { getPointStock } from '@/modules/cart/inventoryApi';
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
  const [maxAvailable, setMaxAvailable] = useState(Infinity);
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
        const stock = await getPointStock(selectedPoint.pointId, productId);
        setMaxAvailable(stock);
      } catch (error) {
        console.error('Error checking availability:', error);
        setMaxAvailable(Infinity);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, [productId]);

  const handleInputChange = (e) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);

    const numVal = parseFloat(inputVal) || 0;
    const normalized = normalizeQty(numVal, unit);
    
    onChange?.(normalized);
  };

  const handleBlur = () => {
    setInputValue(formatQty(value, unit));
  };

  const increment = () => {
    const newValue = value + step;
    onChange?.(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(0, value - step);
    onChange?.(newValue);
  };

  const canIncrement = !disabled && !isLoading;
  const canDecrement = value >= step && !disabled && !isLoading;

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