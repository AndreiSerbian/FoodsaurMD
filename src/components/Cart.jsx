import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useToast } from '../hooks/use-toast';
import CartCalculator from './CartCalculator';
import StockAwareQuantityInput from './StockAwareQuantityInput';
import { getCurrencySymbol } from '@/utils/unitUtils';

const Cart = () => {
  const navigate = useNavigate();
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
  
  const currency = selectedPointInfo?.currency || 'MDL';
  const currencySymbol = getCurrencySymbol(currency);

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    const qty = Number(newQuantity);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    
    // Проверяем доступность перед обновлением
    if (selectedPointInfo?.pointId) {
      const { getPointStock } = await import('../modules/cart/inventoryApi');
      const availableStock = await getPointStock(selectedPointInfo.pointId, productId);
      
      if (qty > availableStock) {
        toast({
          title: "Превышен остаток",
          description: `Доступно только ${availableStock} единиц товара в этой точке`,
          variant: "destructive"
        });
        return;
      }
    }
    
    updateQuantity(productId, qty);
  };

  const handleCheckout = () => {
    // Переходим на страницу оформления заказа
    setIsOpen(false);
    navigate('/checkout');
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
                  {cartItems.map((item, index) => {
                    // Используем цены из item, которые уже учитывают point_variants
                    const hasActiveDiscount = item.isDiscountActive && item.discountPrice;
                    const regularPrice = item.regularPrice || item.price || 0;
                    const currentPrice = hasActiveDiscount ? item.discountPrice : regularPrice;
                    
                    return (
                      <li key={item.productId || index} className="border-b pb-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                             <h3 className="font-medium">{item.name || item.product?.name || `Товар #${item.productId}`}</h3>
                             <p className="text-sm text-gray-500">{item.producerSlug}</p>
                              <div className="mt-1 space-y-1">
                                {hasActiveDiscount ? (
                                  <>
                                     <div className="flex items-center gap-2">
                                      <span className="text-sm line-through text-muted-foreground">
                                        {regularPrice.toFixed(2)} {currencySymbol}/{item.unit || 'шт'}
                                      </span>
                                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                        Скидка
                                      </Badge>
                                    </div>
                                    <div className="font-semibold text-green-600">
                                      {currentPrice.toFixed(2)} {currencySymbol}/{item.unit || 'шт'}
                                    </div>
                                    <div className="text-xs text-green-600">
                                      Экономия: {(regularPrice - currentPrice).toFixed(2)} {currencySymbol}
                                    </div>
                                  </>
                                ) : (
                                  <div>
                                    <span className="font-semibold">
                                      {currentPrice.toFixed(2)} {currencySymbol}/{item.unit || 'шт'}
                                    </span>
                                    {item.discountPrice && (
                                      <div className="text-xs text-amber-600 mt-1">
                                        Доступна скидка в определенные часы
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                           </div>
                           <div className="ml-4">
                             <StockAwareQuantityInput
                               productId={item.productId}
                               value={item.qty}
                               unit={item.unit || 'шт'}
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
                    );
                  })}
                </ul>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t">
                <CartCalculator 
                  cartItems={cartItems}
                  currency={selectedPointInfo?.currency || 'MDL'}
                />
                
                <button 
                  onClick={handleCheckout}
                  disabled={!selectedPointInfo}
                  className={`w-full bg-green-900 text-white py-3 rounded-lg mt-4 ${
                    !selectedPointInfo 
                      ? 'opacity-75 cursor-not-allowed' 
                      : 'hover:bg-green-800'
                  } transition duration-300 mb-2 flex items-center justify-center`}
                >
                  {!selectedPointInfo ? 'Выберите точку получения' : 'Оформить заказ'}
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
