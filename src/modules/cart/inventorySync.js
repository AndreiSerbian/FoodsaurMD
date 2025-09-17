// @ts-check

import { supabase } from '@/integrations/supabase/client';

/**
 * Система синхронизации остатков товаров
 * Производитель устанавливает остатки через панель управления
 * Данные сохраняются в БД и используются для ограничения корзины
 */

/**
 * Получить актуальные остатки товаров по точке
 * @param {string} pointId - ID точки выдачи  
 * @param {string[]} productIds - массив ID товаров
 * @returns {Promise<Map<string, {stock: number, unit: string, price: number}>>}
 */
export async function getInventoryData(pointId, productIds) {
  try {
    const inventoryMap = new Map();
    
    // Получаем остатки по точкам из point_inventory
    const { data: pointInventory } = await supabase
      .from('point_inventory')
      .select('product_id, stock')
      .eq('point_id', pointId)
      .in('product_id', productIds)
      .eq('is_listed', true);

    // Получаем данные товаров (цена, единица измерения)  
    const { data: products } = await supabase
      .from('products')
      .select('id, quantity, price_regular, price_discount, price_unit')
      .in('id', productIds);

    // Создаем карту данных
    products?.forEach(product => {
      // Приоритет остаткам из point_inventory
      const pointStock = pointInventory?.find(pi => pi.product_id === product.id);
      const stock = pointStock ? pointStock.stock : product.quantity;
      
      inventoryMap.set(product.id, {
        stock: stock || 0,
        unit: product.price_unit || 'шт',
        price: product.price_discount || product.price_regular,
        priceRegular: product.price_regular
      });
    });

    return inventoryMap;
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    return new Map();
  }
}

/**
 * Проверить доступность товара для добавления в корзину
 * @param {string} pointId - ID точки
 * @param {string} productId - ID товара 
 * @param {number} requestedQty - запрашиваемое количество
 * @param {number} currentInCart - текущее количество в корзине
 * @returns {Promise<{available: boolean, maxQty: number, unit: string}>}
 */
export async function checkProductAvailability(pointId, productId, requestedQty, currentInCart = 0) {
  const inventory = await getInventoryData(pointId, [productId]);
  const productData = inventory.get(productId);
  
  if (!productData) {
    return { available: false, maxQty: 0, unit: 'шт' };
  }
  
  const availableToAdd = Math.max(0, productData.stock - currentInCart);
  
  return {
    available: requestedQty <= availableToAdd,
    maxQty: availableToAdd,
    unit: productData.unit,
    currentStock: productData.stock
  };
}

/**
 * Проверить весь состав корзины на доступность
 * @param {string} pointId - ID точки
 * @param {Array<{productId: string, qty: number}>} cartItems - товары в корзине
 * @returns {Promise<{valid: boolean, errors: Array}>}
 */
export async function validateCart(pointId, cartItems) {
  const productIds = cartItems.map(item => item.productId);
  const inventory = await getInventoryData(pointId, productIds);
  
  const errors = [];
  let valid = true;
  
  cartItems.forEach(item => {
    const productData = inventory.get(item.productId);
    if (!productData || item.qty > productData.stock) {
      valid = false;
      errors.push({
        productId: item.productId,
        requested: item.qty,
        available: productData?.stock || 0,
        message: `Недостаточно товара. Доступно: ${productData?.stock || 0} ${productData?.unit || 'шт'}`
      });
    }
  });
  
  return { valid, errors };
}