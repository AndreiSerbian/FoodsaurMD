import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const ProductCardWithPricing = ({ product, selectedPointId }) => {
  const { cartItems, handleAddToCart, handleUpdateQuantity } = useCart();
  const { toast } = useToast();
  
  // Guard: only show pricing if pickup point is selected and product has point data
  if (!selectedPointId || !product.point) {
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

          <div className="mt-4 text-center text-muted-foreground text-sm">
            Выберите точку выдачи для просмотра цен
          </div>
        </CardContent>
      </Card>
    );
  }
  const cartItem = cartItems.find(item => item.id === product.id);
  const cartQuantity = cartItem?.qty || 0;

  // Check if discount is active
  const isDiscountActive = () => {
    if (!product.point.price_discount || !product.point.discount_start || !product.point.discount_end) {
      return false;
    }

    const now = new Date();
    const discountStart = new Date(product.point.discount_start);
    const discountEnd = new Date(product.point.discount_end);

    return now >= discountStart && now <= discountEnd;
  };

  const getCurrentPrice = () => {
    return isDiscountActive() ? product.point.price_discount : product.point.price_regular;
  };

  const getDiscountPercentage = () => {
    if (!isDiscountActive()) return 0;
    return Math.round(((product.point.price_regular - product.point.price_discount) / product.point.price_regular) * 100);
  };

  const handleAddToCartClick = () => {
    if (cartQuantity >= product.point.stock) {
      toast({
        title: "Недостаточно товара",
        description: `Доступно только ${product.point.stock} ${product.unit_type}`,
        variant: "destructive"
      });
      return;
    }

    handleAddToCart({
      id: product.id,
      name: product.name,
      price: getCurrentPrice(),
      unit_type: product.unit_type,
      description: product.description,
      ingredients: product.ingredients,
      allergen_info: product.allergen_info,
      point_product_id: product.point.point_product_id,
      stock: product.point.stock
    }, selectedPointId);
  };

  const handleUpdateQuantityClick = (newQty) => {
    if (newQty > product.point.stock) {
      toast({
        title: "Недостаточно товара", 
        description: `Доступно только ${product.point.stock} ${product.unit_type}`,
        variant: "destructive"
      });
      return;
    }

    handleUpdateQuantity(product.id, newQty);
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
                    {Number(product.point.price_discount).toFixed(2)} лей/{product.unit_type}
                  </span>
                  <Badge variant="destructive">-{discountPercentage}%</Badge>
                </div>
                <div className="text-sm line-through text-muted-foreground">
                  {Number(product.point.price_regular).toFixed(2)} лей/{product.unit_type}
                </div>
              </div>
            ) : (
              <div className="text-2xl font-bold">
                {Number(product.point.price_regular).toFixed(2)} лей/{product.unit_type}
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
              onClick={handleAddToCartClick}
              className="w-full"
              disabled={product.point.stock === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.point.stock === 0 ? 'Нет в наличии' : 'В корзину'}
            </Button>
          ) : (
            <div className="flex items-center justify-between bg-muted rounded-lg p-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateQuantityClick(cartQuantity - 1)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <span className="font-medium px-4">
                {cartQuantity} {product.unit_type}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateQuantityClick(cartQuantity + 1)}
                disabled={cartQuantity >= product.point.stock}
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