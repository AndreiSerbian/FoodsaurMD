
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Alert, AlertDescription } from './ui/alert';
import PickupPointSelector from './PickupPointSelector';
import ProductCardWithPricing from './ProductCardWithPricing';
import { usePointProducts } from '../hooks/usePointProducts';

const ProductsList = ({ producerSlug, selectedCategory }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [producerProfile, setProducerProfile] = useState(null);
  const [selectedPointId, setSelectedPointId] = useState('');

  const { pointProducts, loading: pointProductsLoading } = usePointProducts(selectedPointId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get the producer profile by slug
        const { data: profileData, error: profileError } = await supabase
          .from('producer_profiles')
          .select('id, producer_name, category_name')
          .eq('slug', producerSlug)
          .single();

        if (profileError) {
          throw profileError;
        }

        setProducerProfile(profileData);

        // Get products for this producer (without prices)
        let query = supabase
          .from('products')
          .select(`
            *,
            product_images (
              image_url,
              is_primary
            )
          `)
          .eq('producer_id', profileData.id)
          .eq('in_stock', true);

        // Apply category filter if selected
        if (selectedCategory) {
          query = query.eq('category', selectedCategory);
        }

        const { data: productsData, error: productsError } = await query
          .order('name');

        if (productsError) throw productsError;

        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (producerSlug) {
      fetchData();
    }
  }, [producerSlug, selectedCategory]);

  // Merge products with point products
  const getProductsWithPricing = () => {
    if (!selectedPointId) return [];
    
    return products.map(product => {
      const pointProduct = pointProducts.find(pp => pp.product_id === product.id);
      return pointProduct ? { ...pointProduct, products: product } : null;
    }).filter(Boolean);
  };

  const productsWithPricing = getProductsWithPricing();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!producerProfile) {
    return (
      <Alert>
        <AlertDescription>
          Производитель не найден
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pickup Point Selector */}
      <PickupPointSelector
        producerId={producerProfile.id}
        onPointChange={setSelectedPointId}
        selectedPointId={selectedPointId}
      />

      {/* Products Display */}
      {!selectedPointId ? (
        <Alert>
          <AlertDescription>
            Выберите точку выдачи для просмотра товаров и цен
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {pointProductsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : productsWithPricing.length === 0 ? (
            <Alert>
              <AlertDescription>
                В выбранной точке выдачи пока нет доступных товаров
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsWithPricing.map((pointProduct) => (
                <ProductCardWithPricing
                  key={pointProduct.id}
                  pointProduct={pointProduct}
                  selectedPointId={selectedPointId}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsList;
