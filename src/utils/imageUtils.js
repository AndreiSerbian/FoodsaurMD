
/**
 * Утилиты для импорта изображений из локальных папок
 */

/**
 * Получает путь к изображению
 * @param {string} path - Путь к изображению
 * @returns {string} URL изображения или placeholder
 */
export const getImage = (path) => {
  if (!path) return "/placeholder.svg";
  return path;
};

/**
 * Получает путь к изображению категории
 * @param {string} path - Путь к изображению категории
 * @returns {string} URL изображения категории
 */
export const getCategoryImage = (path) => {
  return path;
};

/**
 * Получает путь к изображению производителя
 * @param {string} path - Путь к изображению производителя
 * @returns {string} URL изображения производителя
 */
export const getProducerImage = (path) => {
  return path;
};

/**
 * Получает путь к изображению продукта
 * @param {string} path - Путь к изображению продукта
 * @returns {string} URL изображения продукта
 */
export const getProductImage = (path) => {
  return path;
};
