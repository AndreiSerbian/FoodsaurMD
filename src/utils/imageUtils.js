
/**
 * Утилиты для импорта изображений из локальных папок
 */

// Импортируем все изображения категорий
const categoryImages = import.meta.glob('/src/assets/images/categories/*.{jpg,png,jpeg}', { eager: true });
const producerImages = import.meta.glob('/src/assets/images/producers/*.{jpg,png,jpeg}', { eager: true });
const productImages = import.meta.glob('/src/assets/images/products/*.{jpg,png,jpeg}', { eager: true });

/**
 * Получает изображение по относительному пути
 * @param {string} path - Относительный путь к изображению
 * @returns {string} URL изображения или placeholder
 */
export const getImage = (path) => {
  if (!path) return "/placeholder.svg";
  
  let importPath = `/src/assets/images/${path}`;
  
  if (path.startsWith('categories/')) {
    const imagePath = Object.keys(categoryImages).find(key => key.includes(path));
    return imagePath ? categoryImages[imagePath].default : "/placeholder.svg";
  }
  
  if (path.startsWith('producers/')) {
    const imagePath = Object.keys(producerImages).find(key => key.includes(path));
    return imagePath ? producerImages[imagePath].default : "/placeholder.svg";
  }
  
  if (path.startsWith('products/')) {
    const imagePath = Object.keys(productImages).find(key => key.includes(path));
    return imagePath ? productImages[imagePath].default : "/placeholder.svg";
  }
  
  return "/placeholder.svg";
};

/**
 * Получает путь к изображению категории
 * @param {string} path - Путь к изображению категории
 * @returns {string} URL изображения категории или placeholder
 */
export const getCategoryImage = (path) => {
  return getImage(`categories/${path}`);
};

/**
 * Получает путь к изображению производителя
 * @param {string} path - Путь к изображению производителя
 * @returns {string} URL изображения производителя или placeholder
 */
export const getProducerImage = (path) => {
  return getImage(`producers/${path}`);
};

/**
 * Получает путь к изображению продукта
 * @param {string} path - Путь к изображению продукта
 * @returns {string} URL изображения продукта или placeholder
 */
export const getProductImage = (path) => {
  return getImage(`products/${path}`);
};
