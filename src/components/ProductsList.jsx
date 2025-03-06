
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MinusCircle, PlusCircle, ShoppingCart } from 'lucide-react';
import { getProductImage } from '../utils/imageUtils';

const ProductsList = ({ products, producer }) => {
  const [cartItems, setCartItems] = useState({});
  
  const addToCart = (productName) => {
    setCartItems(prev => ({
      ...prev,
      [productName]: (prev[productName] || 0) + 1
    }));
  };
  
  const removeFromCart = (productName) => {
    setCartItems(prev => {
      const updatedCart = { ...prev };
      if (updatedCart[productName] > 0) {
        updatedCart[productName] -= 1;
      }
      if (updatedCart[productName] === 0) {
        delete updatedCart[productName];
      }
      return updatedCart;
    });
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  // Функция для получения изображения продукта
  const getProductImagePath = (product) => {
    return product.image
      ? getProductImage(product.image)
      : "/placeholder.svg";
  };

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Меню</h2>
        <p className="text-gray-600">
          Товары со скидкой доступны {producer.discountAvailableTime}
        </p>
      </div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {products.map((product, index) => (
          <motion.div 
            key={index}
            variants={item}
            className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row"
          >
            <div className="md:w-1/3 h-48 md:h-auto overflow-hidden relative">
              <img 
                src={getProductImagePath(product)} 
                alt={product.productName} 
                className="w-full h-full object-cover"
                onError={(e) => {e.target.src = "/placeholder.svg"}} 
              />
              
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-sm font-medium">
                -{Math.round((1 - product.priceDiscount / product.priceRegular) * 100)}%
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-2">{product.productName}</h3>
              
              <p className="text-gray-600 mb-4 flex-grow">{product.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 line-through">{product.priceRegular} MDL</span>
                  <span className="text-xl font-bold text-green-600">{product.priceDiscount} MDL</span>
                </div>
                
                <div className="flex items-center">
                  {cartItems[product.productName] ? (
                    <>
                      <button 
                        onClick={() => removeFromCart(product.productName)}
                        className="text-gray-600 hover:text-red-500 transition-colors"
                        aria-label="Убрать из корзины"
                      >
                        <MinusCircle size={20} />
                      </button>
                      
                      <span className="mx-2 font-medium">{cartItems[product.productName]}</span>
                      
                      <button 
                        onClick={() => addToCart(product.productName)}
                        className="text-gray-600 hover:text-green-500 transition-colors"
                        aria-label="Добавить в корзину"
                      >
                        <PlusCircle size={20} />
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => addToCart(product.productName)}
                      className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center text-sm hover:bg-green-600 transition-colors"
                    >
                      <ShoppingCart size={16} className="mr-1" />
                      В корзину
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default ProductsList;
