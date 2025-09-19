// @ts-check

import { supabase } from '@/integrations/supabase/client';
import { getCart, getSelectedPoint, clearCart } from './cartState.js';
import { checkMultipleStock } from './inventoryApi.js';

/**
 * @typedef {Object} CustomerInfo
 * @property {string} name
 * @property {string} phone
 * @property {string} [email]
 */

/**
 * @typedef {Object} PreorderParams
 * @property {CustomerInfo} customer
 * @property {string} [pickupTime] - ISO string
 */

/**
 * @typedef {Object} PreorderResult
 * @property {boolean} success
 * @property {string} [orderCode]
 * @property {string} [orderId]
 * @property {string} [message]
 * @property {string[]} [errors]
 */

/**
 * Create a pre-order from current cart
 * @param {PreorderParams} params
 * @returns {Promise<PreorderResult>}
 */
export async function createPreorder({ customer, pickupTime, pointId }) {
  try {
    const cart = getCart();
    let selectedPoint = getSelectedPoint();
    
    // Use provided pointId or fall back to selected point
    if (pointId) {
      selectedPoint = { pointId };
    }
    
    if (!cart.items || cart.items.length === 0) {
      return {
        success: false,
        message: 'Корзина пуста'
      };
    }
    
    if (!selectedPoint || !selectedPoint.pointId) {
      return {
        success: false,
        message: 'Не выбрана точка получения'
      };
    }
    
    // Повторная проверка остатков перед созданием заказа
    const { validateCart } = await import('./inventorySync.js');
    const validation = await validateCart(
      selectedPoint.pointId,
      cart.items.map(item => ({ productId: item.productId, qty: item.qty }))
    );
    
    if (!validation.valid) {
      const errorMessages = validation.errors.map(err => err.message).join('; ');
      return { 
        success: false, 
        message: `Превышен лимит доступного товара: ${errorMessages}`,
        errors: validation.errors
      };
    }

    // Get producer ID from the first item
    const firstItem = cart.items[0];
    const { data: producerData, error: producerError } = await supabase
      .from('producer_profiles')
      .select('id')
      .eq('slug', firstItem.producerSlug)
      .single();

    if (producerError || !producerData) {
      return {
        success: false,
        message: 'Не удалось найти производителя'
      };
    }

    // Calculate total
    const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Generate order code
    const orderCode = await generateOrderCode();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        producer_id: producerData.id,
        point_id: selectedPoint.pointId,
        status: 'preorder',
        total_amount: totalAmount,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        pickup_time: pickupTime,
        meta: {
          order_code: orderCode,
          created_via: 'web_cart'
        }
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return {
        success: false,
        message: 'Не удалось создать заказ'
      };
    }

    // Create order items
    const orderItems = cart.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      qty: item.qty,
      price: item.price,
      subtotal: item.price * item.qty,
      product_snapshot: {
        name: item.name,
        price: item.price,
        unit: item.unit || 'шт',
        producerSlug: item.producerSlug
      }
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Try to rollback order
      await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);
      
      return {
        success: false,
        message: 'Не удалось создать позиции заказа'
      };
    }

    // Обновление остатков происходит только при подтверждении заказа производителем
    // Здесь создаем заказ со статусом 'preorder' без списания остатков
    console.log('Order created with status: preorder. Stock will be updated when producer confirms.');
    
    // TODO: При подтверждении заказа производителем нужно будет обновить остатки
    // Это будет происходить через отдельную функцию confirmOrder

    // Clear cart on successful order
    clearCart();

    return {
      success: true,
      orderCode,
      orderId: order.id,
      message: `Заказ создан! Код заказа: ${orderCode}`
    };

  } catch (error) {
    console.error('Error in createPreorder:', error);
    return {
      success: false,
      message: 'Произошла ошибка при создании заказа'
    };
  }
}

/**
 * Generate unique order code
 * @returns {Promise<string>}
 */
async function generateOrderCode() {
  try {
    const { data, error } = await supabase.rpc('generate_order_code');
    if (error) {
      console.error('Error generating order code:', error);
      // Fallback to random 8-digit code
      return Math.floor(Math.random() * 90000000 + 10000000).toString();
    }
    return data;
  } catch (error) {
    console.error('Error calling generate_order_code:', error);
    // Fallback to random 8-digit code
    return Math.floor(Math.random() * 90000000 + 10000000).toString();
  }
}

/**
 * Get order details by order code
 * @param {string} orderCode
 * @returns {Promise<Object|null>}
 */
export async function getOrderByCode(orderCode) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, description)
        ),
        producer_profiles (producer_name),
        pickup_points (name, address)
      `)
      .eq('meta->>order_code', orderCode)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getOrderByCode:', error);
    return null;
  }
}