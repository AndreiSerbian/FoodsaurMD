import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle, List, ShoppingCart } from 'lucide-react';

const ProductDetailModal = ({ product, isOpen, onClose, onAddToCart, currencySymbol }) => {
  if (!product) return null;

  const calculateDiscount = (regular, discounted) => {
    return Math.round((1 - discounted / regular) * 100);
  };

  const hasDiscount = product.price_discount && product.price_discount < product.price_regular;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Product Image */}
        <div className="relative">
          <img 
            src={product.image} 
            alt={product.productName || product.name} 
            className="w-full h-64 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          {hasDiscount && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              -{calculateDiscount(product.price_regular, product.price_discount)}%
            </div>
          )}
        </div>
        
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.productName || product.name}</DialogTitle>
        </DialogHeader>
        
        {/* Description */}
        <div>
          <p className="text-muted-foreground">{product.description}</p>
        </div>
        
        {/* Ingredients */}
        {product.ingredients && (
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <List className="h-4 w-4" /> Состав
            </h4>
            <p className="text-sm text-muted-foreground">{product.ingredients}</p>
          </div>
        )}
        
        {/* Allergens */}
        {product.allergen_info && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <h4 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4" /> Аллергены
            </h4>
            <p className="text-sm text-amber-700">{product.allergen_info}</p>
          </div>
        )}
        
        {/* Price and Add to Cart */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            {hasDiscount ? (
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-green-600">
                  {product.price_discount} {currencySymbol}/{product.price_unit || 'шт'}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {product.price_regular} {currencySymbol}/{product.price_unit || 'шт'}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-green-600">
                {product.price_regular} {currencySymbol}/{product.price_unit || 'шт'}
              </span>
            )}
          </div>
          <Button 
            onClick={() => { 
              onAddToCart(product); 
              onClose(); 
            }}
            className="bg-green-900 hover:bg-green-800"
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Добавить в корзину
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
