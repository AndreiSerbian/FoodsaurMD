import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const ProductCardWithPricing = ({ pointProduct, selectedPointId }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { toast } = useToast();
  
  if (!pointProduct || !selectedPointId) {
    return null;
  }

  const { products: product } = pointProduct;
  const cartItem = cart.find(item => item.productId === product.id);
  const cartQuantity = cartItem?.qty || 0;

  // Check if discount is active
  const isDiscountActive = () => {
    if (!pointProduct.price_discount || !pointProduct.discount_start || !pointProduct.discount_end) {
      return false;
    }

    const now = new Date();
    const discountStart = new Date(pointProduct.discount_start);
    const discountEnd = new Date(pointProduct.discount_end);

    return now >= discountStart && now <= discountEnd;
  };

  const getCurrentPrice = () => {
    return isDiscountActive() ? pointProduct.price_discount : pointProduct.price_regular;
  };

  const getDiscountPercentage = () => {
    if (!isDiscountActive()) return 0;
    return Math.round(((pointProduct.price_regular - pointProduct.price_discount) / pointProduct.price_regular) * 100);
  };

  const handleAddToCart = () => {
    if (cartQuantity >= pointProduct.stock) {
      toast({
        title: "Недостаточно товара",
        description: `Доступно только ${pointProduct.stock} ${product.unit_type}`,
        variant: "destructive"
      });
      return;
    }

    addToCart({
      productId: product.id,
      product: product,
      qty: 1,
      price: getCurrentPrice(),
      pointId: selectedPointId,
      unit_type: product.unit_type
    });
  };

  const handleUpdateQuantity = (newQty) => {
    if (newQty > pointProduct.stock) {
      toast({
        title: "Недостаточно товара", 
        description: `Доступно только ${pointProduct.stock} ${product.unit_type}`,
        variant: "destructive"
      });
      return;
    }

    if (newQty <= 0) {
      updateQuantity(product.id, 0);
    } else {
      updateQuantity(product.id, newQty);
    }
  };

  const discountActive = isDiscountActive();
  const discountPercentage = getDiscountPercentage();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Price Display */}
          <div className="space-y-1">
            {discountActive ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {pointProduct.price_discount} лей/{product.unit_type}
                  </span>
                  <Badge variant="destructive">-{discountPercentage}%</Badge>
                </div>
                <div className="text-sm line-through text-muted-foreground">
                  {pointProduct.price_regular} лей/{product.unit_type}
                </div>
              </div>
            ) : (
              <div className="text-2xl font-bold">
                {pointProduct.price_regular} лей/{product.unit_type}
              </div>
            )}
          </div>

          {/* Product Details */}
          {product.ingredients && (
            <div className="text-xs">
              <span className="font-medium">Состав:</span> {product.ingredients}
            </div>
          )}
          
          {product.allergen_info && (
            <Alert className="py-2">
              <AlertDescription className="text-xs">
                <span className="font-medium">Аллергены:</span> {product.allergen_info}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Add to Cart Controls */}
        <div className="mt-4">
          {cartQuantity === 0 ? (
            <Button 
              onClick={handleAddToCart}
              className="w-full"
              disabled={pointProduct.stock === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {pointProduct.stock === 0 ? 'Нет в наличии' : 'В корзину'}
            </Button>
          ) : (
            <div className="flex items-center justify-between bg-muted rounded-lg p-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateQuantity(cartQuantity - 1)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <span className="font-medium px-4">
                {cartQuantity} {product.unit_type}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateQuantity(cartQuantity + 1)}
                disabled={cartQuantity >= pointProduct.stock}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCardWithPricing;