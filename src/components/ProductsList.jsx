
import React, { useState, useEffect } from 'react';
import { usePointProducts } from '../hooks/usePointProducts';
import { useGlobalCatalog } from '../hooks/useGlobalCatalog';
import ProductCardWithPricing from './ProductCardWithPricing';
import PickupPointSelector from './PickupPointSelector';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '@/integrations/supabase/client';

const ProductsList = ({ producerSlug, selectedCategory }) => {
  const [producerProfile, setProducerProfile] = useState(null);
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get global catalog (no prices)
  const { products: catalogProducts, loading: catalogLoading } = useGlobalCatalog(producerProfile?.id);
  
  // Get point-specific products with pricing
  const { pointProducts, loading: pointLoading } = usePointProducts(selectedPointId);

  useEffect(() => {
    const fetchProducerProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('producer_profiles')
          .select('*')
          .eq('slug', producerSlug)
          .single();

        if (error) throw error;
        setProducerProfile(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching producer profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (producerSlug) {
      fetchProducerProfile();
    }
  }, [producerSlug]);

  // Filter products by category if specified
  const filteredCatalogProducts = selectedCategory 
    ? catalogProducts.filter(product => {
        // Check if product has categories array or single category field
        if (Array.isArray(product.categories)) {
          return product.categories.includes(selectedCategory);
        }
        return product.category === selectedCategory;
      })
    : catalogProducts;

  if (loading || catalogLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !producerProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Производитель не найден'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{producerProfile.producer_name}</h1>
        <PickupPointSelector 
          producerId={producerProfile.id}
          selectedPointId={selectedPointId}
          onPointChange={setSelectedPointId}
        />
      </div>

      {!selectedPointId ? (
        <div className="space-y-6">
          <Alert>
            <AlertDescription>
              Выберите точку выдачи для просмотра цен и добавления товаров в корзину
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalogProducts.map((product) => (
              <ProductCardWithPricing 
                key={product.id} 
                product={product}
                selectedPointId={null}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {pointLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : pointProducts.length === 0 ? (
            <Alert>
              <AlertDescription>
                В данной точке нет доступных товаров
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pointProducts
                .filter(product => {
                  if (!selectedCategory) return true;
                  // Check if product has categories array or single category field
                  if (Array.isArray(product.categories)) {
                    return product.categories.includes(selectedCategory);
                  }
                  return product.category === selectedCategory;
                })
                .map((product) => (
                  <ProductCardWithPricing 
                    key={product.id} 
                    product={product}
                    selectedPointId={selectedPointId}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsList;
