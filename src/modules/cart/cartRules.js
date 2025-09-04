// @ts-check

import { getMaxAddable } from './inventoryApi.js';
import { getStep, clampQty, normalizeQty } from './quantity.js';
import { getCart, setCart } from './cartState.js';

/**
 * @typedef {Object} TrySetQtyResult
 * @property {boolean} ok
 * @property {number} qty
 * @property {string} [reason]
 */

/**
 * Пытается установить qty для позиции с учётом лимита точки.
 * Возвращает { ok, qty, reason? } без раскрытия чисел stock.
 * @param {Object} params
 * @param {Object} params.item - товар
 * @param {number} params.nextQty - желаемое количество
 * @param {string} params.pointId - ID точки
 * @returns {Promise<TrySetQtyResult>}
 */
export async function trySetQty({ item, nextQty, pointId }) {
  const step = getStep(item.unit);
  const cart = getCart();
  const currentItem = cart.items.find(i => i.productId === item.productId);
  const currentInCart = currentItem ? currentItem.qty : 0;

  const maxAddable = await getMaxAddable({ 
    pointId, 
    productId: item.productId, 
    currentInCart 
  });
  const maxAllowed = currentInCart + maxAddable; // сколько максимум может быть в корзине по итогу

  // Нормализуем и ограничиваем, не раскрывая конкретные числа пользователю в UI
  const bounded = Math.min(nextQty, maxAllowed);
  const clamped = clampQty(bounded, { unit: item.unit, min: step, max: maxAllowed || step });

  if (normalizeQty(nextQty, item.unit) > clamped) {
    return { ok: false, qty: clamped, reason: 'LIMIT' }; // лимит превышен, но без цифр
  }
  return { ok: true, qty: clamped };
}

/**
 * Инкремент с учётом лимита точки (скрытый лимит)
 * @param {Object} params
 * @param {string} params.productId
 * @param {string} params.unit
 * @param {string} params.pointId
 * @returns {Promise<TrySetQtyResult>}
 */
export async function incWithLimit({ productId, unit, pointId }) {
  const cart = getCart();
  const idx = cart.items.findIndex(i => i.productId === productId);
  if (idx < 0) return { ok: false, reason: 'NOT_FOUND' };
  
  const item = cart.items[idx];
  const step = getStep(unit);
  const res = await trySetQty({ item, nextQty: (item.qty || 0) + step, pointId });
  
  cart.items[idx] = { ...item, qty: res.qty };
  setCart({ ...cart, totals: undefined });
  return res;
}

/**
 * Декремент с учётом минимального шага
 * @param {Object} params
 * @param {string} params.productId
 * @param {string} params.unit
 * @param {string} params.pointId
 * @returns {Promise<TrySetQtyResult>}
 */
export async function decWithLimit({ productId, unit, pointId }) {
  const cart = getCart();
  const idx = cart.items.findIndex(i => i.productId === productId);
  if (idx < 0) return { ok: false, reason: 'NOT_FOUND' };
  
  const item = cart.items[idx];
  const step = getStep(unit);
  const newQty = Math.max(0, (item.qty || 0) - step);
  
  if (newQty === 0) {
    // Удаляем товар из корзины
    cart.items.splice(idx, 1);
    setCart({ ...cart, totals: undefined });
    return { ok: true, qty: 0 };
  }
  
  const res = await trySetQty({ item, nextQty: newQty, pointId });
  cart.items[idx] = { ...item, qty: res.qty };
  setCart({ ...cart, totals: undefined });
  return res;
}

/**
 * Установка точного количества с валидацией
 * @param {Object} params
 * @param {string} params.productId
 * @param {number} params.qty
 * @param {string} params.unit
 * @param {string} params.pointId
 * @returns {Promise<TrySetQtyResult>}
 */
export async function setExactQty({ productId, qty, unit, pointId }) {
  const cart = getCart();
  const idx = cart.items.findIndex(i => i.productId === productId);
  if (idx < 0) return { ok: false, reason: 'NOT_FOUND' };
  
  const item = cart.items[idx];
  
  if (qty === 0) {
    // Удаляем товар из корзины
    cart.items.splice(idx, 1);
    setCart({ ...cart, totals: undefined });
    return { ok: true, qty: 0 };
  }
  
  const res = await trySetQty({ item, nextQty: qty, pointId });
  cart.items[idx] = { ...item, qty: res.qty };
  setCart({ ...cart, totals: undefined });
  return res;
}

/**
 * Проверка возможности добавить товар в корзину
 * @param {Object} params
 * @param {Object} params.product - товар
 * @param {string} params.producerSlug - slug производителя
 * @param {string} params.pointId - ID точки
 * @param {number} [params.qty] - количество
 * @returns {Promise<{ok: boolean, reason?: string}>}
 */
export async function canAddToCart({ product, producerSlug, pointId, qty = 1 }) {
  const cart = getCart();
  
  // Проверяем блокировку производителя
  if (cart.items.length > 0) {
    const currentProducer = cart.items[0].producerSlug;
    if (currentProducer !== producerSlug) {
      return { ok: false, reason: 'DIFFERENT_PRODUCER' };
    }
  }
  
  // Проверяем блокировку точки
  if (cart.items.length > 0) {
    const currentPoint = cart.items[0].pointId;
    if (currentPoint !== pointId) {
      return { ok: false, reason: 'DIFFERENT_POINT' };
    }
  }
  
  // Проверяем остатки
  const step = getStep(product.price_unit);
  const normalizedQty = normalizeQty(qty, product.price_unit);
  const currentItem = cart.items.find(i => i.productId === product.id);
  const currentInCart = currentItem ? currentItem.qty : 0;
  
  const maxAddable = await getMaxAddable({ 
    pointId, 
    productId: product.id, 
    currentInCart 
  });
  
  if (normalizedQty > maxAddable) {
    return { ok: false, reason: 'INSUFFICIENT_STOCK' };
  }
  
  return { ok: true };
}