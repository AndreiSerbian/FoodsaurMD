
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { getCurrencySymbol } from '@/utils/unitUtils';
import ProductDetailModal from './ProductDetailModal';
import { AlertTriangle } from 'lucide-react';

const ProductsList = ({
  products,
  producer
}) => {
  const {
    addToCart
  } = useCart();
  
  const currency = producer?.currency || 'MDL';
  const currencySymbol = getCurrencySymbol(currency);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenProductDetail = (product) => {
    console.log('Opening product detail for:', product);
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  
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
    // Pass the producer object which should include slug
    addToCart(product, producer.slug || producer.producerName);
  };

  // Calculate discount percentage
  const calculateDiscount = (regular, discounted) => {
    return Math.round((1 - discounted / regular) * 100);
  };
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-center text-green-900">{producer.producerName}</h2>
          <p className="text-gray-600 text-center">{producer.address}</p>
          <p className="text-gray-500 text-center mt-2">Скидки доступны {producer.discountAvailableTime}</p>
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
                   alt={product.productName || product.name} 
                   className="w-full h-48 object-cover rounded-t-2xl"
                   onError={(e) => {
                     console.error('Failed to load image:', product.image, 'for product:', product.productName || product.name);
                     e.currentTarget.src = "/placeholder.svg";
                   }}
                 />
                 {product.price_discount && product.price_discount < product.price_regular && (
                   <div className="absolute top-3 right-3 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                     -{calculateDiscount(product.price_regular, product.price_discount)}%
                   </div>
                 )}
               </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold">{product.productName || product.name}</h3>
                  {product.allergen_info && (
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" title="Содержит аллергены" />
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
                
                {console.log('Product in list:', product)}
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    {product.price_discount && product.price_discount < product.price_regular ? (
                      <>
                        <span className="text-lg font-bold text-green-600">
                          {product.price_discount} {currencySymbol}/{product.price_unit || 'шт'}
                        </span>
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {product.price_regular} {currencySymbol}/{product.price_unit || 'шт'}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-green-600">
                        {product.price_regular} {currencySymbol}/{product.price_unit || 'шт'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleOpenProductDetail(product)} 
                    className="text-green-900 border border-green-900 py-2 px-4 rounded-lg hover:bg-green-50 transition duration-300 flex items-center justify-center"
                  >
                    Подробнее
                  </button>
                  <button 
                    onClick={() => handleAddToCart(product)} 
                    className="text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition duration-300 flex items-center justify-center btn-hover bg-green-900 hover:bg-green-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    В корзину
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <ProductDetailModal 
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddToCart={handleAddToCart}
          currencySymbol={currencySymbol}
        />
      </div>
    </section>
  );
};

export default ProductsList;
