import React, { useState } from 'react';
import ProductVariantsList from './variants/ProductVariantsList';
import CategorySelector from './CategorySelector';
import PickupPointSelector from './PickupPointSelector';
import { useNewCart } from '@/contexts/NewCartContext';
import { Alert, AlertDescription } from './ui/alert';
import { Skeleton } from './ui/skeleton';

const ProductsList = ({ producerId }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { selectedPointId, addToCart } = useNewCart();

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  return (
    <div className="space-y-6">
      <PickupPointSelector 
        producerId={producerId}
      />
      
      <CategorySelector 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        producerId={producerId}
      />
      
      <ProductVariantsList
        selectedPointId={selectedPointId}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default ProductsList;