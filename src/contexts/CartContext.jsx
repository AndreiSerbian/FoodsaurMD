
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  getCart, 
  setCart, 
  clearCart as clearCartState,
  getSelectedPoint, 
  setSelectedPoint, 
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  getCartTotals,
  onCartChange,
  onSelectedPointChange
} from '../modules/cart/cartState.js';
import { addItemWithRules } from '../modules/cart/cartRules.js';
import { createPreorder } from '../modules/cart/checkout.js';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [selectedPickupTime, setSelectedPickupTime] = useState(null);
  const [selectedPointInfo, setSelectedPointInfo] = useState(null);
  const { toast } = useToast();

  // Синхронизация с localStorage
  useEffect(() => {
    // Initial load
    const currentCart = getCart();
    const currentPoint = getSelectedPoint();
    setCartItems(currentCart);
    setSelectedPointInfo(currentPoint);

    // Listen to changes
    const unsubscribeCart = onCartChange((cart) => {
      setCartItems(cart);
    });

    const unsubscribePoint = onSelectedPointChange((point) => {
      setSelectedPointInfo(point);
      if (!point) {
        setSelectedPickupTime(null);
      }
    });

    return () => {
      unsubscribeCart();
      unsubscribePoint();
    };
  }, []);

  useEffect(() => {
    // Calculate totals whenever cart items change
    const { total } = getCartTotals();
    setCartTotal(total);
  }, [cartItems]);

  const handleAddToCart = async (product, producerSlug, pointId, pointName) => {
    try {
      const item = {
        productId: product.id,
        producerSlug,
        pointId,
        qty: 1,
        price: product.priceDiscount || product.priceRegular,
        product: product
      };

      const result = await addItemWithRules({
        item,
        resolveConflict: async (conflictType, conflictData) => {
          // For now, just show error - UI will handle conflict resolution
          return false;
        }
      });

      if (result.ok) {
        // Set selected point if not set
        if (!selectedPointInfo) {
          setSelectedPoint({ producerSlug, pointId, pointName });
        }
        
        addItemToCart(item);
        
        toast({
          title: "Товар добавлен",
          description: `${product.name} добавлен в корзину`
        });
      } else {
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар в корзину",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFromCart = (productId) => {
    removeItemFromCart(productId);
    toast({
      title: "Товар удален",
      description: "Товар удален из корзины"
    });
  };

  const handleUpdateQuantity = (productId, qty) => {
    updateItemQuantity(productId, qty);
  };

  const handleClearCart = () => {
    clearCartState();
    setSelectedPickupTime(null);
    toast({
      title: "Корзина очищена",
      description: "Все товары удалены из корзины"
    });
  };

  const handleCreatePreOrder = async (customerInfo) => {
    try {
      const result = await createPreorder({
        customer: customerInfo,
        pickupTime: selectedPickupTime
      });

      if (result.success) {
        toast({
          title: "Заказ создан!",
          description: result.message
        });
        return result;
      } else {
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.error('Error creating pre-order:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать заказ",
        variant: "destructive"
      });
      return null;
    }
  };

  const isWithinDiscountTime = () => {
    return false; // Simplified for now
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartTotal,
      selectedPickupTime,
      selectedPointInfo,
      setSelectedPickupTime,
      addToCart: handleAddToCart,
      removeFromCart: handleRemoveFromCart,
      updateQuantity: handleUpdateQuantity,
      clearCart: handleClearCart,
      createPreOrder: handleCreatePreOrder,
      isWithinDiscountTime
    }}>
      {children}
    </CartContext.Provider>
  );
};
