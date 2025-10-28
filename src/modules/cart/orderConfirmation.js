// @ts-check

import { supabase } from '@/integrations/supabase/client';

/**
 * Подтверждение заказа производителем и обновление остатков
 * @param {string} orderId - ID заказа
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function confirmOrder(orderId) {
  try {
    // Получаем данные заказа
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_id,
          qty
        )
      `)
      .eq('id', orderId)
      .eq('status', 'preorder')
      .single();

    if (orderError || !order) {
      return {
        success: false,
        message: 'Заказ не найден или уже обработан'
      };
    }

    // Обновляем статус заказа на confirmed
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (updateError) {
      return {
        success: false,
        message: 'Ошибка при подтверждении заказа'
      };
    }

    // Обновляем остатки товаров
    for (const item of order.order_items) {
      // Обновляем в point_inventory
      await supabase
        .from('point_inventory')
        .update({
          bulk_qty: supabase.raw(`GREATEST(0, bulk_qty - ${item.qty})`),
          updated_at: new Date().toISOString()
        })
        .eq('point_id', order.point_id)
        .eq('product_id', item.product_id);

      // Обновляем общий остаток товара
      await supabase
        .from('products')
        .update({
          quantity: supabase.raw(`GREATEST(0, quantity - ${item.qty})`),
          updated_at: new Date().toISOString()
        })
        .eq('id', item.product_id);
    }

    return {
      success: true,
      message: 'Заказ подтвержден, остатки обновлены'
    };
  } catch (error) {
    console.error('Error confirming order:', error);
    return {
      success: false,
      message: 'Произошла ошибка при подтверждении заказа'
    };
  }
}

/**
 * Отклонение заказа (остатки не обновляются)
 * @param {string} orderId - ID заказа
 * @param {string} reason - причина отклонения
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function rejectOrder(orderId, reason = '') {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'rejected',
        meta: supabase.raw(`meta || '{"rejection_reason": "${reason}"}'::jsonb`),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('status', 'preorder');

    if (error) {
      return {
        success: false,
        message: 'Ошибка при отклонении заказа'
      };
    }

    return {
      success: true,
      message: 'Заказ отклонен'
    };
  } catch (error) {
    console.error('Error rejecting order:', error);
    return {
      success: false,
      message: 'Произошла ошибка при отклонении заказа'
    };
  }
}