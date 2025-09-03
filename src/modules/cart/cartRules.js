// @ts-check

import { getCart, getSelectedPoint, getProducerLock } from './cartState.js';
import { fetchPointStock, canFulfill } from './availability.js';

/**
 * @typedef {Object} AddItemParams
 * @property {Object} item
 * @property {string} item.productId
 * @property {string} item.producerSlug
 * @property {string} item.pointId
 * @property {number} item.qty
 * @property {Object} item.product
 * @property {Function} [resolveConflict] - Function to handle conflicts
 */

/**
 * @typedef {Object} AddItemResult
 * @property {boolean} ok
 * @property {string} [message]
 * @property {string} [conflictType] - 'producer' | 'point' | 'stock'
 * @property {Object} [conflictData]
 */

/**
 * Check if an item can be added to cart with business rules
 * @param {AddItemParams} params
 * @returns {Promise<AddItemResult>}
 */
export async function canAddItem({ item, resolveConflict }) {
  const selectedPoint = getSelectedPoint();
  const producerLock = getProducerLock();
  const currentCart = getCart();

  // 1. Check producer conflict
  if (producerLock && producerLock !== item.producerSlug) {
    const conflictData = {
      currentProducer: producerLock,
      newProducer: item.producerSlug
    };

    if (resolveConflict) {
      const resolved = await resolveConflict('producer', conflictData);
      if (!resolved) {
        return { 
          ok: false, 
          message: `В корзине уже есть товары от производителя "${producerLock}". Очистите корзину, чтобы продолжить.`,
          conflictType: 'producer',
          conflictData
        };
      }
    } else {
      return { 
        ok: false, 
        message: `В корзине уже есть товары от производителя "${producerLock}". Очистите корзину, чтобы продолжить.`,
        conflictType: 'producer',
        conflictData
      };
    }
  }

  // 2. Check point conflict (only if producer is same)
  if (selectedPoint && selectedPoint.pointId !== item.pointId) {
    const conflictData = {
      currentPoint: selectedPoint,
      newPointId: item.pointId
    };

    if (resolveConflict) {
      const resolved = await resolveConflict('point', conflictData);
      if (!resolved) {
        return { 
          ok: false, 
          message: `В корзине уже есть товары из точки "${selectedPoint.pointName}". Очистите корзину, чтобы продолжить.`,
          conflictType: 'point',
          conflictData
        };
      }
    } else {
      return { 
        ok: false, 
        message: `В корзине уже есть товары из точки "${selectedPoint.pointName}". Очистите корзину, чтобы продолжить.`,
        conflictType: 'point',
        conflictData
      };
    }
  }

  // 3. Check stock availability
  const stockInfo = await fetchPointStock(item.pointId, item.productId);
  if (!stockInfo) {
    return {
      ok: false,
      message: 'Не удалось проверить наличие товара',
      conflictType: 'stock'
    };
  }

  // Calculate total quantity needed (existing + new)
  const existingItem = currentCart.find(cartItem => cartItem.productId === item.productId);
  const totalNeeded = (existingItem ? existingItem.qty : 0) + item.qty;

  if (!canFulfill(totalNeeded, stockInfo.stock)) {
    return {
      ok: false,
      message: `Недостаточно товара в наличии. Доступно: ${stockInfo.stock}, требуется: ${totalNeeded}`,
      conflictType: 'stock',
      conflictData: { available: stockInfo.stock, requested: totalNeeded }
    };
  }

  return { ok: true };
}

/**
 * Add item to cart with all business rule checks
 * @param {AddItemParams} params
 * @returns {Promise<AddItemResult>}
 */
export async function addItemWithRules(params) {
  const result = await canAddItem(params);
  
  if (!result.ok) {
    return result;
  }

  // If we get here, item can be added
  return { ok: true };
}

/**
 * Validate current cart against business rules
 * @returns {Promise<{isValid: boolean, errors: string[]}>}
 */
export async function validateCart() {
  const cart = getCart();
  const selectedPoint = getSelectedPoint();
  const errors = [];

  if (cart.length === 0) {
    errors.push('Корзина пуста');
    return { isValid: false, errors };
  }

  if (!selectedPoint) {
    errors.push('Не выбрана точка получения');
    return { isValid: false, errors };
  }

  // Check if all items are from same producer and point
  const firstItem = cart[0];
  for (const item of cart) {
    if (item.producerSlug !== firstItem.producerSlug) {
      errors.push('В корзине товары от разных производителей');
    }
    if (item.pointId !== firstItem.pointId) {
      errors.push('В корзине товары из разных точек');
    }
  }

  // Check stock for all items
  for (const item of cart) {
    const stockInfo = await fetchPointStock(item.pointId, item.productId);
    if (!stockInfo || !canFulfill(item.qty, stockInfo.stock)) {
      errors.push(`Недостаточно товара "${item.product?.name || item.productId}" в наличии`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Get conflict message for UI display
 * @param {string} conflictType
 * @param {Object} conflictData
 * @returns {string}
 */
export function getConflictMessage(conflictType, conflictData) {
  switch (conflictType) {
    case 'producer':
      return `В корзине уже есть товары от производителя "${conflictData.currentProducer}". Чтобы добавить товары от "${conflictData.newProducer}", нужно очистить корзину.`;
    case 'point':
      return `В корзине уже есть товары из точки "${conflictData.currentPoint.pointName}". Чтобы продолжить, нужно очистить корзину.`;
    case 'stock':
      return `Недостаточно товара в наличии. Доступно: ${conflictData.available}, требуется: ${conflictData.requested}`;
    default:
      return 'Конфликт с текущей корзиной. Очистите корзину, чтобы продолжить.';
  }
}