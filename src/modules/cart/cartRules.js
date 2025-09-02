// @ts-check

/** @typedef {{producerSlug: string, pointId: string, pointName: string}} SelectedPoint */

const STORAGE_KEY = 'foodsaur_selected_point';

/**
 * Получить текущую выбранную точку
 * @returns {SelectedPoint|null}
 */
export function getSelectedPoint() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting selected point:', error);
    return null;
  }
}

/**
 * Установить выбранную точку
 * @param {SelectedPoint} point
 */
export function setSelectedPoint(point) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(point));
    
    // Вызываем кастомное событие для уведомления других компонентов
    window.dispatchEvent(new CustomEvent('selectedPointChanged', { 
      detail: point 
    }));
  } catch (error) {
    console.error('Error setting selected point:', error);
  }
}

/**
 * Очистить выбранную точку
 */
export function clearSelectedPoint() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    
    // Вызываем кастомное событие для уведомления других компонентов
    window.dispatchEvent(new CustomEvent('selectedPointChanged', { 
      detail: null 
    }));
  } catch (error) {
    console.error('Error clearing selected point:', error);
  }
}

/**
 * Проверить, можно ли добавить товар в корзину (правило одной точки)
 * @param {string} producerSlug
 * @param {string} pointId
 * @returns {{canAdd: boolean, conflictType?: 'producer'|'point', currentPoint?: SelectedPoint}}
 */
export function canAddItemToCart(producerSlug, pointId) {
  const selectedPoint = getSelectedPoint();
  
  // Если корзина пустая (нет выбранной точки), можно добавлять
  if (!selectedPoint) {
    return { canAdd: true };
  }

  // Проверяем конфликт производителя
  if (selectedPoint.producerSlug !== producerSlug) {
    return { 
      canAdd: false, 
      conflictType: 'producer', 
      currentPoint: selectedPoint 
    };
  }

  // Проверяем конфликт точки
  if (selectedPoint.pointId !== pointId) {
    return { 
      canAdd: false, 
      conflictType: 'point', 
      currentPoint: selectedPoint 
    };
  }

  // Всё совпадает
  return { canAdd: true };
}

/**
 * Проверить совместимость точки с текущей корзиной
 * @param {string} producerSlug
 * @param {string} pointId
 * @returns {boolean}
 */
export function isPointCompatibleWithCart(producerSlug, pointId) {
  const result = canAddItemToCart(producerSlug, pointId);
  return result.canAdd;
}

/**
 * Получить сообщение о конфликте
 * @param {'producer'|'point'} conflictType
 * @param {SelectedPoint} currentPoint
 * @returns {string}
 */
export function getConflictMessage(conflictType, currentPoint) {
  if (conflictType === 'producer') {
    return `В корзине уже есть товары от другого производителя (точка "${currentPoint.pointName}"). Чтобы продолжить, нужно очистить корзину.`;
  }
  
  if (conflictType === 'point') {
    return `В корзине уже есть товары из другой точки выдачи (${currentPoint.pointName}). Чтобы продолжить, нужно очистить корзину.`;
  }
  
  return 'Конфликт с текущей корзиной. Очистите корзину, чтобы продолжить.';
}

/**
 * Слушать изменения выбранной точки
 * @param {(point: SelectedPoint|null) => void} callback
 * @returns {() => void} функция для отписки
 */
export function onSelectedPointChange(callback) {
  const handleChange = (event) => {
    callback(event.detail);
  };

  window.addEventListener('selectedPointChanged', handleChange);
  
  // Возвращаем функцию для отписки
  return () => {
    window.removeEventListener('selectedPointChanged', handleChange);
  };
}