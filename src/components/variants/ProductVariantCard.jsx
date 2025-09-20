import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

const ProductVariantCard = ({ 
  variant, 
  availability, 
  currentPrice, 
  isDiscountActive, 
  discountPercentage,
  onAddToCart,
  selectedPointId
}) => {
  const [quantity, setQuantity] = useState('');
  const [selectedWeight, setSelectedWeight] = useState('');

  const weightOptions = [50, 100, 250, 500, 1000]; // in grams

  const handleAddToCart = () => {
    let finalQuantity = 0;
    let deductAmount = 0;

    switch (variant.sale_mode) {
      case 'per_pack':
        finalQuantity = parseInt(quantity) || 0;
        deductAmount = finalQuantity * variant.pack_size_base;
        break;
      case 'per_weight':
        finalQuantity = parseInt(selectedWeight) || 0;
        deductAmount = finalQuantity;
        break;
      case 'per_unit':
        finalQuantity = parseInt(quantity) || 0;
        deductAmount = finalQuantity;
        break;
    }

    if (finalQuantity <= 0) return;

    // Check availability
    if (deductAmount > availability) {
      return;
    }

    onAddToCart({
      variantId: variant.id,
      productId: variant.products.id,
      productName: variant.products.name,
      variantName: variant.variant_name,
      saleMode: variant.sale_mode,
      quantity: finalQuantity,
      deductAmount,
      price: currentPrice,
      totalPrice: calculateTotalPrice(finalQuantity),
      pointId: selectedPointId
    });

    // Reset form
    setQuantity('');
    setSelectedWeight('');
  };

  const calculateTotalPrice = (qty) => {
    switch (variant.sale_mode) {
      case 'per_pack':
        return currentPrice * qty;
      case 'per_weight':
        return currentPrice * (qty / 1000);
      case 'per_unit':
        return currentPrice * qty;
      default:
        return 0;
    }
  };

  const formatPrice = (price) => {
    return `${Number(price).toFixed(2)} лей`;
  };

  const getUnitLabel = () => {
    switch (variant.sale_mode) {
      case 'per_pack':
        return `пачка (${variant.pack_size_base}${variant.products.base_unit})`;
      case 'per_weight':
        return 'кг';
      case 'per_unit':
        return 'шт';
      default:
        return '';
    }
  };

  const renderQuantityInput = () => {
    switch (variant.sale_mode) {
      case 'per_pack':
        return (
          <div className="space-y-2">
            <Label htmlFor={`quantity-${variant.id}`}>Количество пачек</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(0, (parseInt(quantity) || 0) - 1).toString())}
                disabled={!quantity || parseInt(quantity) <= 0}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                id={`quantity-${variant.id}`}
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-20 text-center"
                min="0"
                max={availability}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.min(availability, (parseInt(quantity) || 0) + 1).toString())}
                disabled={parseInt(quantity) >= availability}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Доступно: {availability} пачек
            </p>
          </div>
        );

      case 'per_weight':
        return (
          <div className="space-y-2">
            <Label htmlFor={`weight-${variant.id}`}>Выберите вес</Label>
            <Select value={selectedWeight} onValueChange={setSelectedWeight}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите вес" />
              </SelectTrigger>
              <SelectContent>
                {weightOptions
                  .filter(weight => weight <= availability)
                  .map(weight => (
                    <SelectItem key={weight} value={weight.toString()}>
                      {weight >= 1000 ? `${weight / 1000} кг` : `${weight} г`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Максимум: {availability >= 1000 ? `${(availability / 1000).toFixed(1)} кг` : `${availability} г`}
            </p>
          </div>
        );

      case 'per_unit':
        return (
          <div className="space-y-2">
            <Label htmlFor={`quantity-${variant.id}`}>Количество штук</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(0, (parseInt(quantity) || 0) - 1).toString())}
                disabled={!quantity || parseInt(quantity) <= 0}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                id={`quantity-${variant.id}`}
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-20 text-center"
                min="0"
                max={availability}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.min(availability, (parseInt(quantity) || 0) + 1).toString())}
                disabled={parseInt(quantity) >= availability}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Доступно: {availability} шт
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const canAddToCart = () => {
    switch (variant.sale_mode) {
      case 'per_pack':
      case 'per_unit':
        return quantity && parseInt(quantity) > 0 && parseInt(quantity) <= availability;
      case 'per_weight':
        return selectedWeight && parseInt(selectedWeight) <= availability;
      default:
        return false;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{variant.products.name}</CardTitle>
          {availability === 0 && (
            <Badge variant="destructive">Нет в наличии</Badge>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">{variant.variant_name}</p>
          {variant.products.description && (
            <p className="text-sm text-muted-foreground">{variant.products.description}</p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Price Display */}
          <div className="space-y-1">
            {isDiscountActive ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(currentPrice)}/{getUnitLabel()}
                  </span>
                  <Badge variant="destructive">-{discountPercentage}%</Badge>
                </div>
                <div className="text-sm line-through text-muted-foreground">
                  {formatPrice((() => {
                    switch (variant.sale_mode) {
                      case 'per_pack': return variant.price_per_pack;
                      case 'per_weight': return variant.price_per_kg;
                      case 'per_unit': return variant.price_per_unit;
                      default: return 0;
                    }
                  })())}/{getUnitLabel()}
                </div>
              </div>
            ) : (
              <div className="text-xl font-bold">
                {formatPrice(currentPrice)}/{getUnitLabel()}
              </div>
            )}
          </div>

          {/* Product Details */}
          {variant.products.ingredients && (
            <div className="text-xs">
              <span className="font-medium">Состав:</span> {variant.products.ingredients}
            </div>
          )}
          
          {variant.products.allergen_info && (
            <Alert className="py-2">
              <AlertDescription className="text-xs">
                <span className="font-medium">Аллергены:</span> {variant.products.allergen_info}
              </AlertDescription>
            </Alert>
          )}

          {/* Quantity Input */}
          {availability > 0 && renderQuantityInput()}
        </div>

        {/* Add to Cart Button */}
        <div className="mt-4">
          <Button 
            onClick={handleAddToCart}
            className="w-full"
            disabled={availability === 0 || !canAddToCart()}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {availability === 0 ? 'Нет в наличии' : 'В корзину'}
          </Button>
          
          {canAddToCart() && (
            <p className="text-sm text-center text-muted-foreground mt-2">
              Итого: {formatPrice(calculateTotalPrice(
                variant.sale_mode === 'per_weight' ? parseInt(selectedWeight) || 0 : parseInt(quantity) || 0
              ))}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductVariantCard;