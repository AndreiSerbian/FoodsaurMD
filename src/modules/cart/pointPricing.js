// @ts-check

import { supabase } from '@/integrations/supabase/client';

/**
 * @typedef {Object} PointPriceInfo
 * @property {number} regularPrice - обычная цена
 * @property {number|null} discountPrice - цена со скидкой
 * @property {boolean} isDiscountActive - активна ли скидка сейчас
 * @property {string|null} discountStart - время начала скидки (UTC+3)
 * @property {string|null} discountEnd - время окончания скидки (UTC+3)
 * @property {number} potentialSavings - сколько можно сэкономить
 * @property {string} unit - единица измерения
 */

/**
 * Получить текущее время в UTC+3 (Кишинев)
 * @returns {Date}
 */
export function getChisinauTime() {
  const now = new Date();
  // Получаем UTC время и добавляем 3 часа
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 3));
}

/**
 * Проверить, находится ли текущее время в диапазоне скидки
 * @param {string} startTime - время начала (HH:MM:SS)
 * @param {string} endTime - время окончания (HH:MM:SS)
 * @returns {boolean}
 */
export function isWithinDiscountWindow(startTime, endTime) {
  if (!startTime || !endTime) return false;
  
  const now = getChisinauTime();
  const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS
  
  return currentTime >= startTime && currentTime <= endTime;
}

/**
 * Получить информацию о цене товара в точке с учетом времени
 * @param {string} pointId - ID точки
 * @param {string} productId - ID товара
 * @returns {Promise<PointPriceInfo|null>}
 */
export async function getPointPrice(pointId, productId) {
  try {
    // Получаем вариант товара для точки
    const { data: variant, error: variantError } = await supabase
      .from('point_variants')
      .select('*')
      .eq('point_id', pointId)
      .eq('product_id', productId)
      .eq('is_active', true)
      .maybeSingle();

    if (variantError) {
      console.error('Error fetching point variant:', variantError);
    }

    // Если нет варианта для точки, берем цену из products
    if (!variant) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('price_regular, price_unit')
        .eq('id', productId)
        .maybeSingle();

      if (productError || !product) {
        console.error('Error fetching product:', productError);
        return null;
      }

      return {
        regularPrice: product.price_regular || 0,
        discountPrice: null,
        isDiscountActive: false,
        discountStart: null,
        discountEnd: null,
        potentialSavings: 0,
        unit: product.price_unit || 'шт'
      };
    }

    // Определяем обычную цену
    const regularPrice = variant.price_per_unit || variant.price_per_kg || variant.price_per_pack || 0;
    const discountPrice = variant.price_discount;
    
    // Проверяем, активна ли скидка по времени
    let isDiscountActive = false;
    if (discountPrice && variant.discount_start && variant.discount_end) {
      const startTime = new Date(variant.discount_start).toTimeString().slice(0, 8);
      const endTime = new Date(variant.discount_end).toTimeString().slice(0, 8);
      isDiscountActive = isWithinDiscountWindow(startTime, endTime);
    }

    const potentialSavings = (discountPrice && regularPrice > discountPrice) 
      ? regularPrice - discountPrice 
      : 0;

    return {
      regularPrice,
      discountPrice,
      isDiscountActive,
      discountStart: variant.discount_start,
      discountEnd: variant.discount_end,
      potentialSavings,
      unit: variant.variant_name || 'шт'
    };

  } catch (error) {
    console.error('Error in getPointPrice:', error);
    return null;
  }
}

/**
 * Получить информацию о ценах для нескольких товаров
 * @param {string} pointId - ID точки
 * @param {string[]} productIds - массив ID товаров
 * @returns {Promise<Map<string, PointPriceInfo>>}
 */
export async function getMultiplePointPrices(pointId, productIds) {
  const priceMap = new Map();
  
  // Параллельно получаем все цены
  const promises = productIds.map(productId => 
    getPointPrice(pointId, productId).then(priceInfo => ({
      productId,
      priceInfo
    }))
  );
  
  const results = await Promise.all(promises);
  
  results.forEach(({ productId, priceInfo }) => {
    if (priceInfo) {
      priceMap.set(productId, priceInfo);
    }
  });
  
  return priceMap;
}

/**
 * Форматировать сообщение о потенциальной экономии
 * @param {PointPriceInfo} priceInfo
 * @returns {string|null}
 */
export function formatSavingsMessage(priceInfo) {
  if (!priceInfo.discountPrice || !priceInfo.discountStart || !priceInfo.discountEnd) {
    return null;
  }

  const startTime = new Date(priceInfo.discountStart).toTimeString().slice(0, 5); // HH:MM
  const endTime = new Date(priceInfo.discountEnd).toTimeString().slice(0, 5); // HH:MM
  
  if (priceInfo.isDiscountActive) {
    return `Скидка действует до ${endTime}! Экономия: ${priceInfo.potentialSavings.toFixed(2)} MDL`;
  } else {
    return `Закажите с ${startTime} до ${endTime} и сэкономьте ${priceInfo.potentialSavings.toFixed(2)} MDL`;
  }
}
