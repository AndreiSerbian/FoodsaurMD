import React from 'react';
import { useProductVariants } from '@/hooks/useProductVariants';
import ProductVariantCard from './ProductVariantCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const ProductVariantsList = ({ selectedPointId, onAddToCart }) => {
  const {
    variants,
    loading,
    error,
    isDiscountActive,
    getCurrentPrice,
    getAvailability,
    getDiscountPercentage
  } = useProductVariants(selectedPointId);

  if (!selectedPointId) {
    return (
      <div className="text-center py-8">
        <Alert>
          <AlertDescription>
            Выберите точку выдачи для просмотра товаров
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Ошибка загрузки товаров: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="text-center py-8">
        <Alert>
          <AlertDescription>
            Товары не найдены для выбранной точки выдачи
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Group variants by product
  const groupedVariants = variants.reduce((acc, variant) => {
    const productId = variant.products.id;
    if (!acc[productId]) {
      acc[productId] = {
        product: variant.products,
        variants: []
      };
    }
    acc[productId].variants.push(variant);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.values(groupedVariants).map(({ product, variants: productVariants }) => (
        <div key={product.id} className="space-y-4">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productVariants.map((variant) => (
              <ProductVariantCard
                key={variant.id}
                variant={variant}
                availability={getAvailability(variant)}
                currentPrice={getCurrentPrice(variant)}
                isDiscountActive={isDiscountActive(variant)}
                discountPercentage={getDiscountPercentage(variant)}
                onAddToCart={onAddToCart}
                selectedPointId={selectedPointId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductVariantsList;