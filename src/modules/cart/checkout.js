// @ts-check

import { supabase } from '@/integrations/supabase/client';
import { getCart, getSelectedPoint, clearCart } from './cartState.js';
import { checkMultipleStock } from './inventoryApi.js';

/**
 * @typedef {Object} CustomerInfo
 * @property {string} [name]
 * @property {string} [phone]
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
    console.log('createPreorder called with:', { customer, pickupTime, pointId });
    
    const cart = getCart();
    let selectedPoint = getSelectedPoint();
    
    // Use provided pointId or fall back to selected point
    if (pointId) {
      selectedPoint = { pointId };
    }
    
    if (!pickupTime) {
      return {
        success: false,
        message: 'Не указано время получения'
      };
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

    // Calculate total and discount
    const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmount = 0; // TODO: Calculate discount if applicable

    // Generate order code
    const orderCode = await generateOrderCode();
    
    console.log('Creating pre-order with:', {
      pickup_point_id: selectedPoint.pointId,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      pickup_time: pickupTime,
      order_code: orderCode,
      status: 'created'
    });

    // Create pre-order
    const { data: order, error: orderError } = await supabase
      .from('pre_orders')
      .insert({
        pickup_point_id: selectedPoint.pointId,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        pickup_time: pickupTime,
        order_code: orderCode,
        status: 'created'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating pre-order:', orderError);
      console.error('Error details:', JSON.stringify(orderError, null, 2));
      return {
        success: false,
        message: orderError.message || 'Не удалось создать заказ'
      };
    }

    // Create pre-order items
    const orderItems = cart.items.map(item => ({
      pre_order_id: order.id,
      product_id: item.productId,
      quantity: item.qty,
      price_regular: item.price,
      price_discount: null // TODO: Add discount price if applicable
    }));

    const { error: itemsError } = await supabase
      .from('pre_order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating pre-order items:', itemsError);
      // Try to rollback order
      await supabase
        .from('pre_orders')
        .delete()
        .eq('id', order.id);
      
      return {
        success: false,
        message: 'Не удалось создать позиции заказа'
      };
    }

    console.log('Pre-order created with status: created. Waiting for producer confirmation.');
    
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
    console.error('Error stack:', error.stack);
    return {
      success: false,
      message: error.message || 'Произошла ошибка при создании заказа'
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
      .from('pre_orders')
      .select(`
        *,
        pre_order_items (
          *,
          products (name, price_unit)
        ),
        pickup_points (name, address, city, producer_id, producer_profiles(producer_name))
      `)
      .eq('order_code', orderCode)
      .single();

    if (error) {
      console.error('Error fetching pre-order:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getOrderByCode:', error);
    return null;
  }
}