// @ts-check

/**
 * @typedef {Object} CartItem
 * @property {string} productId
 * @property {string} producerSlug  
 * @property {string} pointId
 * @property {number} qty
 * @property {number} price
 * @property {Object} product - Product snapshot
 */

/**
 * @typedef {Object} SelectedPoint
 * @property {string} producerSlug
 * @property {string} pointId
 * @property {string} pointName
 */

const STORAGE_KEYS = {
  CART: 'fs_cart_v1',
  PRODUCER_LOCK: 'fs_cart_producer_lock_v1',
  SELECTED_POINT: 'fs_cart_point_v1'
};

/**
 * Get current cart items
 * @returns {CartItem[]}
 */
export function getCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CART);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
}

/**
 * Set cart items
 * @param {CartItem[]} items
 */
export function setCart(items) {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cartChanged', { detail: items }));
  } catch (error) {
    console.error('Error setting cart:', error);
  }
}

/**
 * Clear cart completely
 */
export function clearCart() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.PRODUCER_LOCK);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_POINT);
    window.dispatchEvent(new CustomEvent('cartChanged', { detail: [] }));
    window.dispatchEvent(new CustomEvent('selectedPointChanged', { detail: null }));
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
}

/**
 * Get selected point
 * @returns {SelectedPoint|null}
 */
export function getSelectedPoint() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_POINT);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting selected point:', error);
    return null;
  }
}

/**
 * Set selected point
 * @param {SelectedPoint} point
 */
export function setSelectedPoint(point) {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_POINT, JSON.stringify(point));
    window.dispatchEvent(new CustomEvent('selectedPointChanged', { detail: point }));
  } catch (error) {
    console.error('Error setting selected point:', error);
  }
}

/**
 * Get producer lock (currently selected producer)
 * @returns {string|null}
 */
export function getProducerLock() {
  try {
    return localStorage.getItem(STORAGE_KEYS.PRODUCER_LOCK);
  } catch (error) {
    console.error('Error getting producer lock:', error);
    return null;
  }
}

/**
 * Set producer lock
 * @param {string} producerSlug
 */
export function setProducerLock(producerSlug) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCER_LOCK, producerSlug);
  } catch (error) {
    console.error('Error setting producer lock:', error);
  }
}

/**
 * Add item to cart
 * @param {CartItem} item
 */
export function addItemToCart(item) {
  const cart = getCart();
  const existingIndex = cart.findIndex(cartItem => cartItem.productId === item.productId);
  
  if (existingIndex >= 0) {
    cart[existingIndex].qty += item.qty;
  } else {
    cart.push(item);
  }
  
  setCart(cart);
}

/**
 * Remove item from cart
 * @param {string} productId
 */
export function removeItemFromCart(productId) {
  const cart = getCart();
  const filtered = cart.filter(item => item.productId !== productId);
  setCart(filtered);
}

/**
 * Update item quantity in cart
 * @param {string} productId
 * @param {number} qty
 */
export function updateItemQuantity(productId, qty) {
  if (qty <= 0) {
    removeItemFromCart(productId);
    return;
  }
  
  const cart = getCart();
  const item = cart.find(cartItem => cartItem.productId === productId);
  if (item) {
    item.qty = qty;
    setCart(cart);
  }
}

/**
 * Get cart totals
 * @returns {{total: number, itemCount: number}}
 */
export function getCartTotals() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  
  return { total, itemCount };
}

/**
 * Listen to cart changes
 * @param {(cart: CartItem[]) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function onCartChange(callback) {
  const handleChange = (event) => callback(event.detail);
  window.addEventListener('cartChanged', handleChange);
  return () => window.removeEventListener('cartChanged', handleChange);
}

/**
 * Listen to selected point changes
 * @param {(point: SelectedPoint|null) => void} callback  
 * @returns {() => void} unsubscribe function
 */
export function onSelectedPointChange(callback) {
  const handleChange = (event) => callback(event.detail);
  window.addEventListener('selectedPointChanged', handleChange);
  return () => window.removeEventListener('selectedPointChanged', handleChange);
}