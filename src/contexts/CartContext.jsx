
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  getSelectedPoint, 
  setSelectedPoint, 
  clearSelectedPoint, 
  canAddItemToCart, 
  onSelectedPointChange 
} from '../modules/cart/cartRules.js';

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
  const [selectedPickupPoint, setSelectedPickupPoint] = useState(null);
  const [selectedPickupTime, setSelectedPickupTime] = useState(null);
  const [discountTotal, setDiscountTotal] = useState(0);
  const [selectedPointInfo, setSelectedPointInfo] = useState(null); // Из cartRules
  const { toast } = useToast();

  // Синхронизация с localStorage точками
  useEffect(() => {
    const currentPoint = getSelectedPoint();
    setSelectedPointInfo(currentPoint);

    // Слушаем изменения выбранной точки
    const unsubscribe = onSelectedPointChange((point) => {
      setSelectedPointInfo(point);
      if (!point) {
        // Если точка очищена, очищаем корзину
        setCartItems([]);
        setSelectedPickupPoint(null);
        setSelectedPickupTime(null);
      }
    });

    // Слушаем событие очистки корзины
    const handleClearCart = () => {
      setCartItems([]);
      clearSelectedPoint();
    };

    window.addEventListener('clearCart', handleClearCart);

    return () => {
      unsubscribe();
      window.removeEventListener('clearCart', handleClearCart);
    };
  }, []);

  useEffect(() => {
    // Calculate totals whenever cart items change
    const regularTotal = cartItems.reduce((sum, item) => sum + (item.priceRegular * item.quantity), 0);
    const discountedTotal = cartItems.reduce((sum, item) => sum + ((item.priceDiscount || item.priceRegular) * item.quantity), 0);
    
    setCartTotal(discountedTotal);
    setDiscountTotal(regularTotal - discountedTotal);
  }, [cartItems]);

  const selectPickupPoint = (pickupPoint) => {
    if (cartItems.length > 0 && selectedPickupPoint?.id !== pickupPoint.id) {
      // Clear cart if switching to different pickup point
      setCartItems([]);
      toast({
        title: "Корзина очищена",
        description: "Товары из другой точки были удалены из корзины."
      });
    }
    setSelectedPickupPoint(pickupPoint);
  };

  // Проверка возможности добавления товара с учетом правил точек
  const canAddToCart = (producerSlug, pointId) => {
    return canAddItemToCart(producerSlug, pointId);
  };

  const addToCart = async (product, pickupPointId) => {
    if (!selectedPointInfo) {
      toast({
        title: "Ошибка",
        description: "Сначала выберите точку получения",
        variant: "destructive"
      });
      return;
    }

    if (selectedPointInfo.pointId !== pickupPointId) {
      toast({
        title: "Ошибка", 
        description: "Товар доступен только в выбранной точке получения",
        variant: "destructive"
      });
      return;
    }

    // Check availability at pickup point
    try {
      const { data: availability, error } = await supabase
        .from('pickup_point_products')
        .select('quantity_available, is_available')
        .eq('pickup_point_id', pickupPointId)
        .eq('product_id', product.id)
        .single();

      let availableQuantity = product.quantity;
      let isAvailable = product.in_stock;

      // If product is explicitly linked to pickup point, use those values
      if (!error && availability) {
        availableQuantity = availability.quantity_available;
        isAvailable = availability.is_available;
      }

      if (!isAvailable || availableQuantity <= 0) {
        toast({
          title: "Товар недоступен",
          description: "Товар закончился в выбранной точке",
          variant: "destructive"
        });
        return;
      }

      // Check if adding one more item would exceed available quantity
      const currentQuantity = cartItems.find(item => item.id === product.id)?.quantity || 0;
      if (currentQuantity >= availableQuantity) {
        toast({
          title: "Недостаточно товара",
          description: `Доступно только ${availableQuantity} единиц`,
          variant: "destructive"
        });
        return;
      }

    } catch (error) {
      console.error('Error checking availability:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось проверить наличие товара",
        variant: "destructive"
      });
      return;
    }

    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Check availability for new quantity
    const product = cartItems.find(item => item.id === productId);
    if (!product || !selectedPointInfo) return;

    try {
      const { data: availability, error } = await supabase
        .from('pickup_point_products')
        .select('quantity_available')
        .eq('pickup_point_id', selectedPointInfo.pointId)
        .eq('product_id', productId)
        .single();

      let availableQuantity = product.quantity;
      
      // If product is explicitly linked to pickup point, use those values
      if (!error && availability) {
        availableQuantity = availability.quantity_available;
      }

      if (quantity > availableQuantity) {
        toast({
          title: "Недостаточно товара",
          description: `Доступно только ${availableQuantity} единиц`,
          variant: "destructive"
        });
        return;
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      return;
    }

    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedPickupPoint(null);
    setSelectedPickupTime(null);
    clearSelectedPoint();
  };

  const createPreOrder = async () => {
    // Capture current cart state
    const currentCartItems = [...cartItems];
    const currentCartTotal = cartTotal;
    const currentDiscountTotal = discountTotal;
    const currentPointInfo = selectedPointInfo;
    const currentPickupTime = selectedPickupTime;

    if (!currentPointInfo || !currentPickupTime || currentCartItems.length === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите точку получения, время и добавьте товары",
        variant: "destructive"
      });
      return null;
    }

    try {
      // Create pre-order
      const { data: preOrder, error: orderError } = await supabase
        .from('pre_orders')
        .insert({
          order_code: await generateOrderCode(),
          pickup_point_id: currentPointInfo.pointId,
          total_amount: currentCartTotal,
          discount_amount: currentDiscountTotal,
          pickup_time: currentPickupTime,
          status: 'created'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = currentCartItems.map(item => ({
        pre_order_id: preOrder.id,
        product_id: item.id,
        quantity: item.quantity,
        price_regular: item.priceRegular,
        price_discount: item.priceDiscount || item.priceRegular
      }));

      const { error: itemsError } = await supabase
        .from('pre_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update product quantities at pickup point (only if explicitly linked)
      for (const item of currentCartItems) {
        const { data: pickupPointProduct } = await supabase
          .from('pickup_point_products')
          .select('id')
          .eq('pickup_point_id', currentPointInfo.pointId)
          .eq('product_id', item.id)
          .single();

        // Only update if product is explicitly linked to pickup point
        if (pickupPointProduct) {
          const { error: updateError } = await supabase
            .from('pickup_point_products')
            .update({
              quantity_available: supabase.raw(`quantity_available - ${item.quantity}`)
            })
            .eq('pickup_point_id', currentPointInfo.pointId)
            .eq('product_id', item.id);

          if (updateError) console.error('Error updating quantity:', updateError);
        }
      }

      // Send notification to producer
      await supabase.functions.invoke('create-pre-order-notification', {
        body: {
          preOrderId: preOrder.id,
          orderCode: preOrder.order_code,
          pickupPointId: currentPointInfo.pointId,
          totalAmount: currentCartTotal,
          itemsCount: currentCartItems.length
        }
      });

      clearCart();
      
      toast({
        title: "Заказ создан!",
        description: `Код заказа: ${preOrder.order_code}`
      });

      return preOrder;

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

  const generateOrderCode = async () => {
    const { data, error } = await supabase.rpc('generate_order_code');
    if (error) {
      console.error('Error generating code:', error);
      return Math.floor(Math.random() * 90000000) + 10000000; // Fallback 8-digit code
    }
    return data;
  };

  const isWithinDiscountTime = () => {
    if (!selectedPointInfo) return false;
    
    // Нужно будет получить данные о скидочном времени из точки выдачи
    // Пока возвращаем false, так как selectedPointInfo не содержит времени скидок
    return false;
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartTotal,
      discountTotal,
      selectedPickupPoint,
      selectedPickupTime,
      selectedPointInfo,
      selectPickupPoint,
      setSelectedPickupTime,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      createPreOrder,
      isWithinDiscountTime,
      canAddToCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
