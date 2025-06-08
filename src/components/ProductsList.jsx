import React from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';

const ProductsList = ({
  products,
  producer
}) => {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  
  const container = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0
    }
  };
  
  const handleAddToCart = product => {
    addToCart(product, producer.producerName);
  };

  // Calculate discount percentage
  const calculateDiscount = (regular, discounted) => {
    return Math.round((1 - discounted / regular) * 100);
  };

  // Format discount time with proper translation
  const formatDiscountTime = (timeString) => {
    if (!timeString) return '';
    
    // Assuming timeString is in format "HH:MM - HH:MM" (e.g., "10:00 - 18:00")
    const parts = timeString.split(' - ');
    if (parts.length === 2) {
      return `${t('discountPrefix')} ${t('discountFrom')} ${parts[0]} ${t('discountTo')} ${parts[1]}`;
    }
    
    // Fallback to original format if parsing fails
    return timeString;
  };
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-center text-green-900">{producer.producerName}</h2>
          <p className="text-gray-600 text-center">{producer.address}</p>
          <p className="text-gray-500 text-center mt-2">{formatDiscountTime(producer.discountAvailableTime)}</p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
          variants={container} 
          initial="hidden" 
          animate="show"
        >
          {products.map((product, index) => (
            <motion.div 
              key={index} 
              variants={item} 
              className="product-card"
            >
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.productName} 
                  className="w-full h-48 object-cover rounded-t-2xl"
                  onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                />
                {product.priceDiscount < product.priceRegular && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                    -{calculateDiscount(product.priceRegular, product.priceDiscount)}%
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{product.productName}</h3>
                <p className="text-gray-600 text-sm mb-4 h-20 overflow-hidden">{product.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-lg font-bold text-green-600">{product.priceDiscount} MDL</span>
                    {product.priceDiscount < product.priceRegular && (
                      <span className="text-sm text-green-900 line-through ml-2">{product.priceRegular} MDL</span>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleAddToCart(product)} 
                  className="w-full text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition duration-300 flex items-center justify-center btn-hover bg-green-900 hover:bg-green-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {t('addToCart')}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductsList;
