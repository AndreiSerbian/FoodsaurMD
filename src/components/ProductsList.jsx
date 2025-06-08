
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';
import ProducerMap from './ProducerMap';

const ProductsList = ({ producer }) => {
  const { t } = useTranslation();
  
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
  const calculateDiscount = (regular, discounted) => {
    if (!discounted || discounted >= regular) return 0;
    return Math.round((1 - discounted / regular) * 100);
  };

  console.log('ProductsList received producer:', producer);
  
  if (!producer) {
    console.log('No producer data provided');
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{t('products.notFoundMessage')}</p>
      </div>
    );
  }
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-2 text-center text-green-900">{producer.producer_name}</h2>
          <p className="text-gray-600 text-center">{producer.address}</p>
          <p className="text-gray-500 text-center mt-2">
            {t('producers.discountsAvailable')} {producer.discount_available_time || t('producers.clarifyTime')}
          </p>
        </motion.div>
        
        <ProducerMap producer={producer} />
        
        {!producer.products || producer.products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('products.noProducts')}</p>
            <p className="text-gray-400 mt-2">{t('products.noProductsMessage')}</p>
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
                      alt={product.name || t('products.noName')} 
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
                    <h3 className="text-xl font-semibold mb-2">{product.name || t('products.noName')}</h3>
                    <p className="text-gray-600 text-sm mb-4 h-20 overflow-hidden">
                      {product.description || t('products.noDescription')}
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
                    
                    <motion.button 
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center"
                      onClick={() => console.log('Add to cart:', product.name)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ShoppingCart size={20} className="mr-2" />
                      {t('common.addToCart')}
                    </motion.button>
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
