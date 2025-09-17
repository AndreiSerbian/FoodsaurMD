
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
    setCartItems(currentCart.items || []); // Extract items array
    setSelectedPointInfo(currentPoint);

    // Listen to changes
    const unsubscribeCart = onCartChange((cart) => {
      setCartItems(cart.items || []); // Extract items array
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
      // If no pointId provided, try to get it automatically
      let actualPointId = pointId;
      let actualPointName = pointName;
      let actualProducerSlug = producerSlug;
      
      // If missing parameters, try to get them from product context
      if (!actualPointId || !actualProducerSlug || !actualPointName) {
        // This should be handled by the calling component
        toast({
          title: "Ошибка",
          description: "Недостаточно данных для добавления товара",
          variant: "destructive"
        });
        return;
      }

      const item = {
        productId: product.id,
        producerSlug: actualProducerSlug,
        pointId: actualPointId,
        qty: product.min_order_qty || 1,
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
          setSelectedPoint({ 
            producerSlug: actualProducerSlug, 
            pointId: actualPointId, 
            pointName: actualPointName 
          });
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

  // Legacy function for backward compatibility
  const legacyAddToCart = async (product, producerInfo) => {
    try {
      // Get producer slug from producer info
      let producerSlug;
      if (typeof producerInfo === 'string') {
        // Convert producer name to slug
        producerSlug = producerInfo.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      } else if (producerInfo?.slug) {
        producerSlug = producerInfo.slug;
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось определить производителя",
          variant: "destructive"
        });
        return;
      }

      // Try to get producer's pickup points
      const { data: producerData, error: producerError } = await supabase
        .from('producer_profiles')
        .select('id, slug')
        .eq('slug', producerSlug)
        .single();

      let selectedProducer = producerData;

      if (producerError || !producerData) {
        // Try by producer name
        const { data: producerByName, error: nameError } = await supabase
          .from('producer_profiles')
          .select('id, slug')
          .eq('producer_name', producerInfo)
          .single();

        if (nameError || !producerByName) {
          toast({
            title: "Ошибка",
            description: "Не удалось найти производителя",
            variant: "destructive"
          });
          return;
        }
        
        selectedProducer = producerByName;
        producerSlug = producerByName.slug;
      }

      // Get pickup points for this producer
      const producerId = selectedProducer.id;
      if (!producerId) {
        toast({
          title: "Ошибка", 
          description: "Не удалось определить ID производителя",
          variant: "destructive"
        });
        return;
      }
      
      const { data: points, error: pointsError } = await supabase
        .from('pickup_points')
        .select('id, name, address')
        .eq('producer_id', producerId)
        .eq('is_active', true);

      if (pointsError || !points || points.length === 0) {
        toast({
          title: "Ошибка",
          description: "У производителя нет доступных точек выдачи",
          variant: "destructive"
        });
        return;
      }

      // If only one point, select it automatically
      if (points.length === 1) {
        const point = points[0];
        await handleAddToCart(product, producerSlug, point.id, point.name);
      } else {
        // Multiple points - for now just use the first one
        // In a real app, you'd show a point selection modal
        const point = points[0];
        await handleAddToCart(product, producerSlug, point.id, point.name);
      }
    } catch (error) {
      console.error('Error in legacyAddToCart:', error);
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
      cartItems: cartItems || [],
      cartTotal,
      selectedPickupTime,
      selectedPointInfo,
      setSelectedPickupTime,
      addToCart: legacyAddToCart, // Use legacy function for backward compatibility
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
