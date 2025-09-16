import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Minus, Plus } from 'lucide-react';
import { 
  getStep, 
  getMinStep, 
  normalizeQty, 
  formatQty, 
  validateQty, 
  clampQty 
} from '../modules/cart/quantity';

const QuantityInput = ({ 
  value = 0, 
  unit = 'шт', 
  max = Infinity, 
  min, 
  onChange, 
  disabled = false,
  showButtons = true,
  className = '' 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const actualMin = min !== undefined ? min : getMinStep(unit);
  const step = getStep(unit);

  // Синхронизируем внутреннее состояние с внешним значением
  useEffect(() => {
    setInputValue(formatQty(value || 0, unit));
  }, [value, unit]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue === '' || newValue === '0') {
      setError('');
      onChange && onChange(0);
      return;
    }

    const numValue = parseFloat(newValue);
    if (isNaN(numValue)) return;

    const validation = validateQty(numValue, unit);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    const clamped = clampQty(numValue, { unit, min: actualMin, max });
    const normalized = normalizeQty(clamped, unit);
    
    setError('');
    onChange && onChange(normalized);
  };

  const handleBlur = () => {
    // При потере фокуса форматируем значение
    if (value !== undefined) {
      setInputValue(formatQty(value, unit));
    }
  };

  const increment = () => {
    const currentValue = value || 0;
    const newValue = currentValue + step;
    const clamped = clampQty(newValue, { unit, min: actualMin, max });
    onChange && onChange(clamped);
  };

  const decrement = () => {
    const currentValue = value || 0;
    const newValue = Math.max(0, currentValue - step);
    const clamped = clampQty(newValue, { unit, min: actualMin, max });
    onChange && onChange(clamped);
  };

  const canIncrement = !disabled && (value || 0) + step <= max;
  const canDecrement = !disabled && (value || 0) > 0;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {showButtons && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={decrement}
          disabled={!canDecrement}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-3 w-3" />
        </Button>
      )}
      
      <div className="relative flex-1">
        <Input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          min={actualMin}
          max={max}
          step={step}
          className={`text-center ${error ? 'border-red-500' : ''}`}
        />
        {error && (
          <div className="absolute top-full left-0 right-0 text-xs text-red-500 mt-1">
            {error}
          </div>
        )}
      </div>

      {showButtons && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={increment}
          disabled={!canIncrement}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default QuantityInput;