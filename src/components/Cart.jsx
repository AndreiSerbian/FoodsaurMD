import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { useInventorySync } from '../hooks/useInventorySync';
import InventorySync from './InventorySync';
import QuantityInput from './QuantityInput';

const Cart = () => {
  const {
    cartItems, 
    cartTotal, 
    discountTotal,
    removeFromCart, 
    updateQuantity, 
    clearCart,
    selectedPointInfo,
    createPreOrder
  } = useCart();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showOrderAlert, setShowOrderAlert] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inventoryErrors, setInventoryErrors] = useState([]);

  // Синхронизация остатков для товаров в корзине
  const productIds = cartItems.map(item => item.productId);
  const { validateCartItems, checkAvailability, getStock } = useInventorySync(
    selectedPointInfo?.pointId, 
    productIds
  );

  const toggleCart = () => {
    console.log('Cart toggle clicked, current state:', isOpen);
    setIsOpen(!isOpen);
    console.log('Cart toggle new state:', !isOpen);
  };

  // Проверка остатков при изменении корзины
  useEffect(() => {
    if (cartItems.length > 0 && selectedPointInfo?.pointId) {
      const errors = validateCartItems(cartItems);
      setInventoryErrors(errors);
      
      if (errors.length > 0) {
        toast({
          title: "Внимание",
          description: `${errors.length} товар(ов) превышают доступные остатки`,
          variant: "destructive"
        });
      }
    }
  }, [cartItems, selectedPointInfo, validateCartItems]);

  const handleQuantityChange = async (productId, newQuantity) => {
    const qty = Number(newQuantity);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    
    // Проверяем доступность с помощью хука синхронизации
    if (selectedPointInfo?.pointId) {
      const availability = checkAvailability(productId, qty);
      
      if (!availability.available) {
        toast({
          title: "Недостаточно товара",
          description: `Доступно только ${availability.stock} шт.`,
          variant: "destructive"
        });
        return;
      }
    }
    
    updateQuantity(productId, qty);
  };

  const handleCheckout = async () => {
    // Финальная проверка остатков перед оформлением заказа
    const errors = validateCartItems(cartItems);
    if (errors.length > 0) {
      toast({
        title: "Невозможно оформить заказ",
        description: "Некоторые товары превышают доступные остатки",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const order = await createPreOrder();
      if (order) {
        setIsProcessing(false);
        setShowOrderAlert(true);
        setIsOpen(false);
        
        // Auto-hide the alert after 5 seconds
        setTimeout(() => {
          setShowOrderAlert(false);
        }, 5000);
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setIsProcessing(false);
    }
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
            className="fixed left-8 top-8 z-50 max-w-xs"
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
        className="fixed bottom-8 right-8 bg-green-900 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center btn-hover z-50"
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
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
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
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col"
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

              {inventoryErrors.length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Проблемы с остатками</AlertTitle>
                  <AlertDescription>
                    {inventoryErrors.map(error => (
                      <div key={error.productId} className="text-xs">
                        {error.name}: {error.message}
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
                          <h3 className="font-medium">{item.product?.name || item.name || 'Товар без названия'}</h3>
                          <p className="text-sm text-gray-500">{item.producerSlug}</p>
                           <div className="mt-1">
                             <span className="font-semibold">
                               {item.price} MDL/{item.unit || item.product?.price_unit || 'шт'}
                             </span>
                           </div>
                           
                           {/* Компонент синхронизации остатков */}
                           <div className="mt-2">
                             <InventorySync 
                               pointId={selectedPointInfo?.pointId}
                               productId={item.productId}
                               currentQty={item.qty}
                             />
                           </div>
                        </div>
                        <div className="ml-4">
                          <QuantityInput
                            value={item.qty}
                            unit={item.unit || item.product?.price_unit || 'шт'}
                            onChange={(newQty) => handleQuantityChange(item.productId, newQty)}
                            max={getStock ? getStock(item.productId) : 999}
                            className="w-32"
                            showButtons={true}
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
                {discountTotal > 0 && (
                  <div className="mb-3 p-2 bg-green-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Обычная цена:</span>
                      <span className="line-through text-gray-500">{cartTotal + discountTotal} MDL</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-green-600">
                      <span>Скидка:</span>
                      <span>-{discountTotal} MDL</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Итого к оплате:</span>
                  <span className="font-bold text-lg">{cartTotal} MDL</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing || !selectedPointInfo || inventoryErrors.length > 0}
                  className={`w-full bg-green-900 text-white py-3 rounded-lg ${
                    isProcessing || !selectedPointInfo || inventoryErrors.length > 0 
                      ? 'opacity-75 cursor-not-allowed' 
                      : 'hover:bg-green-800'
                  } transition duration-300 mb-2 flex items-center justify-center`}
                >
                  {isProcessing ? 'Обработка...' : 
                   !selectedPointInfo ? 'Выберите точку получения' :
                   inventoryErrors.length > 0 ? 'Проверьте остатки' :
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
    </>
  );
};

export default Cart;
