
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '../components/ui/use-toast';

const Cart = () => {
  const {
    cartItems,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const handleQuantityChange = (productName, producerName, newQuantity) => {
    updateQuantity(productName, producerName, Number(newQuantity));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    // Блокируем кнопку
    setIsProcessing(true);
    
    // Показываем уведомление об успешном заказе
    toast({
      title: "Успешно!",
      description: "Ваш заказ успешно отправлен!",
      variant: "default",
      duration: 4000,
    });
    
    // Очищаем корзину
    clearCart();
    
    // Разблокируем кнопку через 1.5 секунды
    setTimeout(() => {
      setIsProcessing(false);
    }, 1500);
  };

  const cartVariants = {
    hidden: {
      opacity: 0,
      x: '100%'
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  return <>
      {/* Cart Button */}
      <button onClick={toggleCart} className="fixed bottom-8 right-8 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center btn-hover z-50 bg-green-900 hover:bg-green-800">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cartItems.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </span>}
        </div>
      </button>

      {/* Cart Overlay */}
      <AnimatePresence>
        {isOpen && <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-40" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={toggleCart} />}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isOpen && <motion.div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col" variants={cartVariants} initial="hidden" animate="visible" exit="hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-green-900">Корзина</h2>
                <button onClick={toggleCart} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-4 text-gray-500">Ваша корзина пуста</p>
                </div> : <ul className="space-y-4">
                  {cartItems.map((item, index) => <li key={index} className="border-b pb-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-green-900">{item.productName}</h3>
                          <p className="text-sm text-gray-500">{item.producerName}</p>
                          <p className="mt-1 font-semibold text-green-600">{item.priceDiscount} MDL</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleQuantityChange(item.productName, item.producerName, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <input type="number" value={item.quantity} onChange={e => handleQuantityChange(item.productName, item.producerName, e.target.value)} min="1" className="w-12 text-center border border-gray-300 rounded p-1" />
                          <button onClick={() => handleQuantityChange(item.productName, item.producerName, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.productName, item.producerName)} className="text-sm text-red-500 mt-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Удалить
                      </button>
                    </li>)}
                </ul>}
            </div>

            {cartItems.length > 0 && <div className="p-6 border-t">
                <div className="flex justify-between mb-4">
                  <span className="font-medium text-green-900">Итого:</span>
                  <span className="font-bold text-green-900">{cartTotal} MDL</span>
                </div>
                <button 
                  onClick={handleCheckout} 
                  disabled={isProcessing || cartItems.length === 0} 
                  className={`w-full bg-green-900 text-white py-3 rounded-lg transition duration-300 mb-2 flex items-center justify-center ${
                    isProcessing || cartItems.length === 0 ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-800'
                  }`}
                >
                  {isProcessing ? 'Обработка...' : 'Оформить заказ'}
                </button>
                <button onClick={clearCart} className="w-full text-red-500 py-2 rounded-lg border border-red-500 hover:bg-red-50 transition duration-300 flex items-center justify-center">
                  Очистить корзину
                </button>
              </div>}
          </motion.div>}
      </AnimatePresence>
    </>;
};
export default Cart;
