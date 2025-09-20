import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';

const NewCartContext = createContext();

export const useNewCart = () => {
  const context = useContext(NewCartContext);
  if (!context) {
    throw new Error('useNewCart must be used within a NewCartProvider');
  }
  return context;
};

export const NewCartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedPointId, setSelectedPointId] = useState(null);
  const { toast } = useToast();
  const { deductInventory } = useInventoryManagement();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('newCart');
    const savedPointId = localStorage.getItem('selectedPointId');
    
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
    
    if (savedPointId) {
      setSelectedPointId(savedPointId);
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('newCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save selected point to localStorage when it changes
  useEffect(() => {
    if (selectedPointId) {
      localStorage.setItem('selectedPointId', selectedPointId);
    } else {
      localStorage.removeItem('selectedPointId');
    }
  }, [selectedPointId]);

  const addToCart = (item) => {
    // Check if changing pickup point
    if (selectedPointId && selectedPointId !== item.pointId) {
      toast({
        title: 'Изменение точки выдачи',
        description: 'Корзина будет очищена при смене точки выдачи',
        variant: 'destructive'
      });
      clearCart();
    }

    setSelectedPointId(item.pointId);

    const existingItem = cartItems.find(cartItem => 
      cartItem.variantId === item.variantId
    );

    if (existingItem) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.variantId === item.variantId
          ? {
              ...cartItem,
              quantity: cartItem.quantity + item.quantity,
              totalPrice: cartItem.totalPrice + item.totalPrice,
              deductAmount: cartItem.deductAmount + item.deductAmount
            }
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, { ...item, id: Date.now() }]);
    }

    toast({
      title: 'Добавлено в корзину',
      description: `${item.productName} - ${item.variantName}`
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(cartItems.map(item => {
      if (item.id === itemId) {
        const quantityRatio = newQuantity / item.quantity;
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.totalPrice * quantityRatio,
          deductAmount: Math.round(item.deductAmount * quantityRatio)
        };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
    
    toast({
      title: 'Удалено из корзины',
      description: 'Товар удален из корзины'
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('newCart');
    
    toast({
      title: 'Корзина очищена',
      description: 'Все товары удалены из корзины'
    });
  };

  const changePickupPoint = (newPointId) => {
    if (cartItems.length > 0 && selectedPointId && selectedPointId !== newPointId) {
      toast({
        title: 'Смена точки выдачи',
        description: 'Корзина была очищена',
        variant: 'destructive'
      });
      clearCart();
    }
    setSelectedPointId(newPointId);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const processOrder = async (orderData) => {
    try {
      // Validate cart items and deduct inventory
      for (const item of cartItems) {
        await deductInventory(selectedPointId, item.productId, item.deductAmount);
      }

      // Here you would create the order in the database
      // For now, just clear the cart
      clearCart();
      setSelectedPointId(null);

      toast({
        title: 'Заказ оформлен',
        description: 'Ваш заказ успешно создан',
        variant: 'default'
      });

      return { success: true };
    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        title: 'Ошибка заказа',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  return (
    <NewCartContext.Provider value={{
      cartItems,
      selectedPointId,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      changePickupPoint,
      getTotalPrice,
      getTotalItems,
      processOrder
    }}>
      {children}
    </NewCartContext.Provider>
  );
};