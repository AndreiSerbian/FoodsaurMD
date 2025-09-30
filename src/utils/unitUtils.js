import { getAvailableUnits, formatQty, getUnitType } from '../modules/cart/quantity';

/**
 * Получает человекочитаемое название единицы измерения
 * @param {string} unit - единица измерения
 * @returns {string}
 */
export function getUnitLabel(unit) {
  const units = getAvailableUnits();
  const unitConfig = units.find(u => u.value === unit);
  return unitConfig ? unitConfig.label : unit;
}

/**
 * Форматирует цену с единицей измерения
 * @param {number} price - цена
 * @param {string} unit - единица измерения
 * @returns {string}
 */
export function formatPrice(price, unit) {
  return `${(price || 0).toFixed(2)} лей/${getUnitLabel(unit)}`;
}

/**
 * Форматирует количество с единицей измерения
 * @param {number} qty - количество
 * @param {string} unit - единица измерения
 * @returns {string}
 */
export function formatQuantity(qty, unit) {
  return `${formatQty(qty, unit)} ${getUnitLabel(unit)}`;
}

/**
 * Группирует единицы измерения по типам
 * @returns {Object}
 */
export function getGroupedUnits() {
  const units = getAvailableUnits();
  return units.reduce((acc, unit) => {
    if (!acc[unit.type]) acc[unit.type] = [];
    acc[unit.type].push(unit);
    return acc;
  }, {});
}

/**
 * Получает иконку для типа единицы измерения
 * @param {string} unitType - тип единицы
 * @returns {string}
 */
export function getUnitTypeIcon(unitType) {
  const icons = {
    piece: '🔢',
    weight: '⚖️',
    volume: '🥤'
  };
  return icons[unitType] || '📦';
}

/**
 * Получает цвет для типа единицы измерения (для UI)
 * @param {string} unitType - тип единицы
 * @returns {string}
 */
export function getUnitTypeColor(unitType) {
  const colors = {
    piece: 'blue',
    weight: 'green', 
    volume: 'purple'
  };
  return colors[unitType] || 'gray';
}