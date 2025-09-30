// @ts-check

import { supabase } from '@/integrations/supabase/client';

/**
 * Возвращает доступный stock по точке для товара (число)
 * @param {string} pointId - ID точки
 * @param {string} productId - ID товара
 * @returns {Promise<number>}
 */
export async function getPointStock(pointId, productId) {
  try {
    // Получаем остаток из point_inventory
    const { data: inventory, error: inventoryError } = await supabase
      .from('point_inventory')
      .select('bulk_qty')
      .eq('point_id', pointId)
      .eq('product_id', productId)
      .maybeSingle();

    if (inventoryError) {
      console.warn('Error fetching point_inventory:', inventoryError);
      return 0;
    }

    if (inventory) {
      return inventory.bulk_qty || 0;
    }

    // Fallback на общий остаток товара
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', productId)
      .maybeSingle();

    if (productError) {
      console.warn('Error fetching product quantity:', productError);
      return 0;
    }

    return product?.quantity || 0;
  } catch (error) {
    console.error('Error in getPointStock:', error);
    return 0;
  }
}

/**
 * Возвращает максимально доступное кол-во к добавлению для товара 
 * с учётом уже находящегося в корзине
 * @param {Object} params - параметры
 * @param {string} params.pointId - ID точки
 * @param {string} params.productId - ID товара
 * @param {number} [params.currentInCart] - текущее количество в корзине
 * @returns {Promise<number>}
 */
export async function getMaxAddable({ pointId, productId, currentInCart = 0 }) {
  const stock = await getPointStock(pointId, productId);
  const left = Math.max(0, stock - currentInCart);
  return left; // число, но UI не обязан его показывать
}

/**
 * Проверка доступности множества товаров
 * @param {string} pointId - ID точки
 * @param {Array<{productId: string, qty: number}>} items - товары для проверки
 * @returns {Promise<Array<{productId: string, available: boolean, maxQty: number}>>}
 */
export async function checkMultipleStock(pointId, items) {
  const results = [];
  
  for (const item of items) {
    const stock = await getPointStock(pointId, item.productId);
    const available = stock >= item.qty;
    results.push({
      productId: item.productId,
      available,
      maxQty: stock
    });
  }
  
  return results;
}