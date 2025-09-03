// @ts-check

import { supabase } from '@/integrations/supabase/client';

/**
 * @typedef {Object} StockInfo
 * @property {number} stock
 * @property {number} price
 * @property {number} discount
 * @property {boolean} isAvailable
 */

/**
 * Fetch stock information for a product at a specific point
 * @param {string} pointId
 * @param {string} productId
 * @returns {Promise<StockInfo|null>}
 */
export async function fetchPointStock(pointId, productId) {
  try {
    // First try pickup_point_products table
    const { data, error } = await supabase
      .from('pickup_point_products')
      .select('quantity_available, is_available')
      .eq('pickup_point_id', pointId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching pickup point products:', error);
      // Fall back to product default info
    }

    // If no specific pickup point product link, get product default info
    if (!data || error) {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('quantity, price_regular, price_discount, in_stock')
        .eq('id', productId)
        .single();

      if (productError) {
        console.error('Error fetching product info:', productError);
        return null;
      }

      return {
        stock: productData.quantity || 0,
        price: productData.price_regular,
        discount: productData.price_discount || 0,
        isAvailable: productData.in_stock
      };
    }

    // Get price info from product
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('price_regular, price_discount')
      .eq('id', productId)
      .single();

    if (productError) {
      console.error('Error fetching product price:', productError);
      return null;
    }

    return {
      stock: data.quantity_available || 0,
      price: productData.price_regular,
      discount: productData.price_discount || 0,
      isAvailable: data.is_available && data.quantity_available > 0
    };

  } catch (error) {
    console.error('Error in fetchPointStock:', error);
    return null;
  }
}

/**
 * Check if a quantity can be fulfilled from available stock
 * @param {number} requestedQty
 * @param {number} availableStock
 * @returns {boolean}
 */
export function canFulfill(requestedQty, availableStock) {
  return requestedQty <= availableStock && availableStock > 0;
}

/**
 * Get maximum available quantity for a product at a point
 * @param {string} pointId
 * @param {string} productId
 * @returns {Promise<number>}
 */
export async function getMaxAvailableQty(pointId, productId) {
  const stockInfo = await fetchPointStock(pointId, productId);
  return stockInfo ? stockInfo.stock : 0;
}

/**
 * Check stock for multiple products at once
 * @param {string} pointId
 * @param {Array<{productId: string, qty: number}>} items
 * @returns {Promise<Array<{productId: string, available: boolean, maxQty: number}>>}
 */
export async function checkMultipleStock(pointId, items) {
  const results = [];
  
  for (const item of items) {
    const stockInfo = await fetchPointStock(pointId, item.productId);
    const maxQty = stockInfo ? stockInfo.stock : 0;
    
    results.push({
      productId: item.productId,
      available: canFulfill(item.qty, maxQty),
      maxQty
    });
  }
  
  return results;
}