
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    // Calculate total whenever cart items change
    const total = cartItems.reduce((sum, item) => sum + (item.priceDiscount * item.quantity), 0);
    setCartTotal(total);
  }, [cartItems]);

  const addToCart = (product, producerName) => {
    setCartItems(prevItems => {
      // Check if item is already in cart
      const existingItemIndex = prevItems.findIndex(
        item => item.productName === product.productName && item.producerName === producerName
      );

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        return [...prevItems, { ...product, producerName, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productName, producerName) => {
    setCartItems(prevItems => 
      prevItems.filter(item => 
        !(item.productName === productName && item.producerName === producerName)
      )
    );
  };

  const updateQuantity = (productName, producerName, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productName, producerName);
      return;
    }

    setCartItems(prevItems => 
      prevItems.map(item => 
        (item.productName === productName && item.producerName === producerName)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
