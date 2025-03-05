
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
  
  // Проверяем, начинается ли путь с src/
  if (path.startsWith('src/')) {
    return path;
  }
  
  return "/placeholder.svg";
};

/**
 * Получает путь к изображению категории
 * @param {string} filename - Имя файла изображения категории
 * @returns {string} URL изображения категории
 */
export const getCategoryImage = (filename) => {
  if (!filename) return "/placeholder.svg";
  
  // Если путь уже полный, включая директорию src/
  if (filename.startsWith('src/')) {
    return filename;
  }
  
  // Добавляем путь к директории категорий
  return `src/assets/Images/categories/${filename}`;
};

/**
 * Получает путь к изображению производителя
 * @param {string} filename - Имя файла изображения производителя
 * @returns {string} URL изображения производителя
 */
export const getProducerImage = (filename) => {
  if (!filename) return "/placeholder.svg";
  
  // Если путь уже полный, включая директорию src/
  if (filename.startsWith('src/')) {
    return filename;
  }
  
  // Добавляем путь к директории производителей
  return `src/assets/Images/producers/${filename}`;
};

/**
 * Получает путь к изображению продукта
 * @param {string} filename - Имя файла изображения продукта
 * @returns {string} URL изображения продукта
 */
export const getProductImage = (filename) => {
  if (!filename) return "/placeholder.svg";
  
  // Если путь уже полный, включая директорию src/
  if (filename.startsWith('src/')) {
    return filename;
  }
  
  // Добавляем путь к директории продуктов
  return `src/assets/Images/products/${filename}`;
};
