
import React from 'react';
import { motion } from 'framer-motion';
import ProducerMap from './ProducerMap';
import type { ProducerWithProducts } from '../hooks/useProducersWithProducts';

interface ProductsListProps {
  producer: ProducerWithProducts;
}

const ProductsList: React.FC<ProductsListProps> = ({ producer }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Calculate discount percentage safely
  const calculateDiscount = (regular: number, discounted: number | null) => {
    if (!discounted || discounted >= regular) return 0;
    return Math.round((1 - discounted / regular) * 100);
  };

  console.log('ProductsList received producer:', producer);
  
  if (!producer) {
    console.log('No producer data provided');
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Данные производителя не найдены</p>
      </div>
    );
  }
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-center text-green-900">{producer.producer_name}</h2>
          <p className="text-gray-600 text-center">{producer.address}</p>
          <p className="text-gray-500 text-center mt-2">
            Скидки доступны {producer.discount_available_time || 'уточните время'}
          </p>
        </div>
        
        <ProducerMap producer={producer} />
        
        {!producer.products || producer.products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Товары пока не добавлены</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
            variants={container} 
            initial="hidden" 
            animate="show"
          >
            {producer.products.map((product, index) => {
              console.log('Rendering product:', product);
              
              // Безопасно получаем цены
              const regularPrice = Number(product.price_regular) || 0;
              const discountPrice = product.price_discount ? Number(product.price_discount) : null;
              const hasDiscount = discountPrice !== null && discountPrice > 0 && discountPrice < regularPrice;
              const displayPrice = hasDiscount ? discountPrice : regularPrice;
              
              return (
                <motion.div 
                  key={`${product.name}-${index}`} 
                  variants={item} 
                  className="product-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative">
                    <img 
                      src={product.image_url || "/placeholder.svg"} 
                      alt={product.name || 'Продукт'} 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        console.log('Image error for product:', product.name);
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    {hasDiscount && discountPrice && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                        -{calculateDiscount(regularPrice, discountPrice)}%
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{product.name || 'Без названия'}</h3>
                    <p className="text-gray-600 text-sm mb-4 h-20 overflow-hidden">
                      {product.description || 'Описание отсутствует'}
                    </p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-lg font-bold text-green-600">
                          {displayPrice} MDL
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {regularPrice} MDL
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center"
                      onClick={() => console.log('Add to cart:', product.name)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Добавить в корзину
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProductsList;
