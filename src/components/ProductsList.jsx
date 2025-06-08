
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ProducerMap from './ProducerMap';
import ProductCard from './ProductCard';

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
            {producer.products.map((product, index) => (
              <ProductCard 
                key={`${product.name}-${index}`}
                product={product}
                index={index}
                item={item}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProductsList;
