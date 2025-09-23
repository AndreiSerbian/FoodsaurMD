import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '../hooks/use-toast';
import CartCalculator from './CartCalculator';
import StockAwareQuantityInput from './StockAwareQuantityInput';
import OrderCheckout from './OrderCheckout';
import { validateCart } from '../modules/cart/inventorySync';

const Cart = () => {
  const {
    cartItems, 
    cartTotal, 
    discountTotal,
    removeFromCart, 
    updateQuantity, 
    clearCart,
    selectedPointInfo
  } = useCart();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showOrderAlert, setShowOrderAlert] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cartValid, setCartValid] = useState(true);
  const [validationErrors, setValidationErrors] = useState([]);

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  // Проверка остатков при изменении корзины
  useEffect(() => {
    const checkCartValidity = async () => {
      if (cartItems.length > 0 && selectedPointInfo?.pointId) {
        const validation = await validateCart(
          selectedPointInfo.pointId,
          cartItems.map(item => ({ productId: item.productId, qty: item.qty }))
        );
        
        setCartValid(validation.valid);
        setValidationErrors(validation.errors);
        
        if (!validation.valid) {
          toast({
            title: "Внимание",
            description: `${validation.errors.length} товар(ов) превышают доступные остатки`,
            variant: "destructive"
          });
        }
      }
    };
    
    checkCartValidity();
  }, [cartItems, selectedPointInfo]);

  const handleQuantityChange = (productId, newQuantity) => {
    const qty = Number(newQuantity);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    
    updateQuantity(productId, qty);
  };

  const handleCheckout = async () => {
    // Финальная проверка остатков перед оформлением заказа
    if (!cartValid) {
      toast({
        title: "Невозможно оформить заказ",
        description: "Некоторые товары превышают доступные остатки",
        variant: "destructive"
      });
      return;
    }

    // Открываем окно оформления заказа
    setShowCheckout(true);
  };

  const cartVariants = {
    hidden: { opacity: 0, x: '100%' },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  const alertVariants = {
    hidden: { opacity: 0, x: '-100%' },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, x: '-100%', transition: { duration: 0.3 } }
  };

  return (
    <>
      {/* Order Success Alert */}
      <AnimatePresence>
        {showOrderAlert && (
          <motion.div
            className="fixed left-8 top-8 z-alert max-w-xs"
            variants={alertVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Alert className="bg-green-50 border-green-600 text-green-900">
              <AlertTitle className="text-green-800">Заказ оформлен!</AlertTitle>
              <AlertDescription className="text-green-700">
                Ваш заказ успешно оформлен и будет доставлен в ближайшее время.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Button */}
      <button 
        onClick={toggleCart}
        className="fixed bottom-8 right-8 bg-green-900 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center btn-hover z-cart"
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cartItems.reduce((acc, item) => acc + item.qty, 0)}
            </span>
          )}
        </div>
      </button>

      {/* Cart Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 z-cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
          />
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-cart flex flex-col"
            variants={cartVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Корзина</h2>
                <button onClick={toggleCart} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {selectedPointInfo && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">Точка получения:</p>
                  <p className="text-sm text-green-700">{selectedPointInfo.pointName}</p>
                </div>
              )}

              {validationErrors.length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Проблемы с остатками</AlertTitle>
                  <AlertDescription>
                    {validationErrors.map(error => (
                      <div key={error.productId} className="text-xs">
                        Товар: {error.message}
                      </div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}
              
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-4 text-gray-500">Ваша корзина пуста</p>
                  {!selectedPointInfo && (
                    <p className="mt-2 text-sm text-gray-400">Выберите точку получения для начала покупок</p>
                  )}
                </div>
              ) : (
                <ul className="space-y-4">
                  {cartItems.map((item, index) => (
                    <li key={item.productId || index} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                           <h3 className="font-medium">{item.name || item.product?.name || `Товар #${item.productId}`}</h3>
                           <p className="text-sm text-gray-500">{item.producerSlug}</p>
                            <div className="mt-1">
                              <span className="font-semibold">
                                {item.price} MDL/{item.unit || item.product?.price_unit || 'шт'}
                              </span>
                            </div>
                         </div>
                         <div className="ml-4">
                           <StockAwareQuantityInput
                             productId={item.productId}
                             value={item.qty}
                             unit={item.unit || item.product?.price_unit || 'шт'}
                             onChange={(newQty) => handleQuantityChange(item.productId, newQty)}
                             className="w-32"
                           />
                         </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.productId)}
                        className="text-sm text-red-500 mt-2 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Удалить
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t">
                <CartCalculator 
                  cartItems={cartItems}
                  onValidationChange={(valid, errors) => {
                    setCartValid(valid);
                    setValidationErrors(errors);
                  }}
                />
                
                <button 
                  onClick={handleCheckout}
                  disabled={!selectedPointInfo || !cartValid}
                  className={`w-full bg-green-900 text-white py-3 rounded-lg mt-4 ${
                    !selectedPointInfo || !cartValid 
                      ? 'opacity-75 cursor-not-allowed' 
                      : 'hover:bg-green-800'
                  } transition duration-300 mb-2 flex items-center justify-center`}
                >
                  {!selectedPointInfo ? 'Выберите точку получения' :
                   !cartValid ? 'Превышен лимит товара' :
                   'Оформить заказ'}
                </button>
                <button 
                  onClick={clearCart}
                  className="w-full text-red-500 py-2 rounded-lg border border-red-500 hover:bg-red-50 transition duration-300 flex items-center justify-center"
                >
                  Очистить корзину
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Checkout Modal */}
      <OrderCheckout 
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
      />
    </>
  );
};

export default Cart;
