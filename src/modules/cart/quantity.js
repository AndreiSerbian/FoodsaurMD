// @ts-check

/**
 * Получить шаг единицы измерения
 * @param {string} unit - единица измерения
 * @returns {number}
 */
export function getStep(unit) {
  if (unit === 'шт' || unit === 'pcs') return 1;
  if (unit === 'кг' || unit === 'kg') return 0.1;
  if (unit === 'г' || unit === 'g') return 50;
  return 1;
}

/**
 * Нормализация количества по шагу единицы
 * @param {number} qty - количество
 * @param {string} unit - единица измерения
 * @returns {number}
 */
export function normalizeQty(qty, unit) {
  const step = getStep(unit);
  const n = Math.floor(Number(qty || 0) / step) * step;
  return Number(n.toFixed(3));
}

/**
 * Ограничение количества в пределах min/max
 * @param {number} qty - количество
 * @param {Object} options - опции
 * @param {string} options.unit - единица измерения
 * @param {number} [options.min] - минимум
 * @param {number} [options.max] - максимум
 * @returns {number}
 */
export function clampQty(qty, { unit, min = getStep(unit), max = Infinity }) {
  const q1 = normalizeQty(qty, unit);
  const bounded = Math.min(Math.max(q1, min), max);
  return Number(bounded.toFixed(3));
}

/**
 * Эффективная цена с учетом скидки
 * @param {number} price - базовая цена
 * @param {number} [discount] - скидка в процентах или долях
 * @returns {number}
 */
export function effectivePrice(price, discount) {
  if (!discount) return Number(Number(price).toFixed(2));
  const d = discount > 1 ? discount / 100 : discount;
  return Number((price * (1 - d)).toFixed(2));
}

/**
 * Подсчет суммы строки заказа
 * @param {Object} item - товар
 * @param {number} item.price - цена
 * @param {number} [item.discount] - скидка
 * @param {number} item.qty - количество
 * @param {string} item.unit - единица
 * @returns {number}
 */
export function lineSubtotal({ price, discount, qty, unit }) {
  const p = effectivePrice(price, discount);
  const q = normalizeQty(qty, unit);
  return Number((p * q).toFixed(2));
}

/**
 * Пересчет итогов корзины
 * @param {Object} cart - корзина
 * @param {Array} cart.items - товары
 * @param {number} [cart.deliveryFee] - стоимость доставки
 * @param {number} [cart.cartDiscount] - скидка на корзину
 * @returns {Object}
 */
export function recalcTotals(cart) {
  const items = cart.items || [];
  let subtotal = 0;
  for (const it of items) {
    subtotal += lineSubtotal(it);
  }
  const delivery = cart.deliveryFee || 0;
  const discountTotal = cart.cartDiscount || 0;
  const total = Math.max(0, Number((subtotal + delivery - discountTotal).toFixed(2)));
  return { 
    subtotal: Number(subtotal.toFixed(2)), 
    delivery, 
    discountTotal, 
    total 
  };
}