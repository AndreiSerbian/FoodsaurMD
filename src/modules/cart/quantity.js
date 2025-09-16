// @ts-check

/**
 * Конфигурация единиц измерения
 */
const UNIT_CONFIG = {
  'шт': { step: 1, minStep: 1, decimals: 0, type: 'piece' },
  'pcs': { step: 1, minStep: 1, decimals: 0, type: 'piece' },
  'упаковка': { step: 1, minStep: 1, decimals: 0, type: 'piece' },
  'кг': { step: 0.1, minStep: 0.1, decimals: 1, type: 'weight' },
  'kg': { step: 0.1, minStep: 0.1, decimals: 1, type: 'weight' },
  'г': { step: 50, minStep: 50, decimals: 0, type: 'weight' },
  'g': { step: 50, minStep: 50, decimals: 0, type: 'weight' },
  'л': { step: 0.1, minStep: 0.1, decimals: 1, type: 'volume' },
  'мл': { step: 50, minStep: 50, decimals: 0, type: 'volume' },
};

/**
 * Получить шаг единицы измерения
 * @param {string} unit - единица измерения
 * @returns {number}
 */
export function getStep(unit) {
  const config = UNIT_CONFIG[unit];
  return config ? config.step : 1;
}

/**
 * Получить минимальный шаг единицы измерения
 * @param {string} unit - единица измерения
 * @returns {number}
 */
export function getMinStep(unit) {
  const config = UNIT_CONFIG[unit];
  return config ? config.minStep : 1;
}

/**
 * Получить количество десятичных знаков для единицы
 * @param {string} unit - единица измерения
 * @returns {number}
 */
export function getDecimals(unit) {
  const config = UNIT_CONFIG[unit];
  return config ? config.decimals : 0;
}

/**
 * Получить тип единицы измерения
 * @param {string} unit - единица измерения
 * @returns {string}
 */
export function getUnitType(unit) {
  const config = UNIT_CONFIG[unit];
  return config ? config.type : 'piece';
}

/**
 * Получить все доступные единицы измерения
 * @returns {Array<{value: string, label: string, type: string}>}
 */
export function getAvailableUnits() {
  return [
    { value: 'шт', label: 'шт', type: 'piece' },
    { value: 'упаковка', label: 'упаковка', type: 'piece' },
    { value: 'кг', label: 'кг', type: 'weight' },
    { value: 'г', label: 'г', type: 'weight' },
    { value: 'л', label: 'л', type: 'volume' },
    { value: 'мл', label: 'мл', type: 'volume' },
  ];
}

/**
 * Нормализация количества по шагу единицы
 * @param {number} qty - количество
 * @param {string} unit - единица измерения
 * @returns {number}
 */
export function normalizeQty(qty, unit) {
  const step = getStep(unit);
  const decimals = getDecimals(unit);
  const n = Math.floor(Number(qty || 0) / step) * step;
  return Number(n.toFixed(decimals));
}

/**
 * Форматирование количества для отображения
 * @param {number} qty - количество
 * @param {string} unit - единица измерения
 * @returns {string}
 */
export function formatQty(qty, unit) {
  const decimals = getDecimals(unit);
  const normalized = normalizeQty(qty, unit);
  return normalized.toFixed(decimals);
}

/**
 * Валидация количества для единицы измерения
 * @param {number} qty - количество
 * @param {string} unit - единица измерения
 * @returns {{valid: boolean, error?: string}}
 */
export function validateQty(qty, unit) {
  const minStep = getMinStep(unit);
  const config = UNIT_CONFIG[unit];
  
  if (!config) {
    return { valid: false, error: 'Неизвестная единица измерения' };
  }
  
  if (qty < 0) {
    return { valid: false, error: 'Количество не может быть отрицательным' };
  }
  
  if (qty > 0 && qty < minStep) {
    return { valid: false, error: `Минимальное количество: ${minStep} ${unit}` };
  }
  
  return { valid: true };
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
export function clampQty(qty, { unit, min = getMinStep(unit), max = Infinity }) {
  const q1 = normalizeQty(qty, unit);
  const bounded = Math.min(Math.max(q1, min), max);
  const decimals = getDecimals(unit);
  return Number(bounded.toFixed(decimals));
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