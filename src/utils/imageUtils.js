
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
  
  // Возвращаем путь как есть, предполагая что он уже корректный
  return path;
};

/**
 * Получает путь к изображению категории
 * @param {string} filename - Имя файла изображения категории
 * @returns {string} URL изображения категории
 */
export const getCategoryImage = (filename) => {
  if (!filename) return "/placeholder.svg";
  
  // Если путь уже содержит /assets/Images/
  if (filename.includes('/assets/Images/')) {
    return filename;
  }
  
  // Обработка для относительных путей
  return `/assets/Images/categories/${filename.split('/').pop()}`;
};

/**
 * Получает путь к изображению производителя
 * @param {string} filename - Имя файла изображения производителя
 * @returns {string} URL изображения производителя
 */
export const getProducerImage = (filename) => {
  if (!filename) return "/placeholder.svg";
  
  // Если путь уже содержит /assets/Images/
  if (filename.includes('/assets/Images/')) {
    return filename;
  }
  
  // Обработка для относительных путей
  return `/assets/Images/producers/${filename.split('/').pop()}`;
};

/**
 * Получает путь к изображению продукта
 * @param {string} filename - Имя файла изображения продукта
 * @returns {string} URL изображения продукта
 */
export const getProductImage = (filename) => {
  if (!filename) return "/placeholder.svg";
  
  // Если путь уже содержит /assets/Images/
  if (filename.includes('/assets/Images/')) {
    return filename;
  }
  
  // Обработка для относительных путей
  return `/assets/Images/products/${filename.split('/').pop()}`;
};
