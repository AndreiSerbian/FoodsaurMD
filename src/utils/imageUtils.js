
/**
 * Утилиты для динамической загрузки изображений из локальных папок
 */

// Импортируем все изображения категорий
function importCategoryImages() {
  const categoryImages = {};
  
  try {
    // Динамический импорт всех jpg/png файлов из categories
    const categoryImagesContext = import.meta.glob('../assets/Images/categories/*.{jpg,png,jpeg}', { eager: true });
    
    // Формируем объект с ключами - названиями категорий, значениями - путями к изображениям
    Object.keys(categoryImagesContext).forEach(path => {
      const fileName = path.split('/').pop().split('.')[0];
      categoryImages[fileName] = categoryImagesContext[path].default;
    });
  } catch (error) {
    console.error("Ошибка при импорте изображений категорий:", error);
  }
  
  return categoryImages;
}

// Импортируем все изображения производителей
function importProducerImages() {
  const producerImages = {};
  
  try {
    // Динамический импорт всех jpg/png файлов из producers
    const producerImagesContext = import.meta.glob('../assets/Images/producers/*.{jpg,png,jpeg}', { eager: true });
    
    // Формируем объект с ключами - названиями производителей и типом (interior/exterior), значениями - путями к изображениям
    Object.keys(producerImagesContext).forEach(path => {
      const fullFileName = path.split('/').pop();
      const [producerWithType] = fullFileName.split('.');
      
      // Определяем тип изображения (interior/exterior)
      if (producerWithType.endsWith('-interior')) {
        const producerName = producerWithType.replace('-interior', '');
        if (!producerImages[producerName]) producerImages[producerName] = {};
        producerImages[producerName].interior = producerImagesContext[path].default;
      } else if (producerWithType.endsWith('-exterior')) {
        const producerName = producerWithType.replace('-exterior', '');
        if (!producerImages[producerName]) producerImages[producerName] = {};
        producerImages[producerName].exterior = producerImagesContext[path].default;
      }
    });
  } catch (error) {
    console.error("Ошибка при импорте изображений производителей:", error);
  }
  
  return producerImages;
}

// Импортируем все изображения продуктов
function importProductImages() {
  const productImages = {};
  
  try {
    // Динамический импорт всех jpg/png файлов из products
    const productImagesContext = import.meta.glob('../assets/Images/products/*.{jpg,png,jpeg}', { eager: true });
    
    // Формируем объект с ключами - названиями продуктов, значениями - путями к изображениям
    Object.keys(productImagesContext).forEach(path => {
      const fileName = path.split('/').pop().split('.')[0];
      productImages[fileName] = productImagesContext[path].default;
    });
  } catch (error) {
    console.error("Ошибка при импорте изображений продуктов:", error);
  }
  
  return productImages;
}

// Кеширование изображений для повторного использования
const CATEGORY_IMAGES = importCategoryImages();
const PRODUCER_IMAGES = importProducerImages();
const PRODUCT_IMAGES = importProductImages();

/**
 * Получает путь к изображению категории
 * @param {string} categoryName - Название категории
 * @returns {string} Путь к изображению категории или путь к placeholder
 */
export const getCategoryImage = (categoryName) => {
  if (!categoryName) return "/placeholder.svg";
  
  const formattedName = categoryName.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  
  return CATEGORY_IMAGES[formattedName] || "/placeholder.svg";
};

/**
 * Получает путь к изображению производителя
 * @param {string} producerName - Название производителя
 * @param {string} type - Тип изображения (interior или exterior)
 * @returns {string} Путь к изображению производителя или путь к placeholder
 */
export const getProducerImage = (producerName, type) => {
  if (!producerName || !type) return "/placeholder.svg";
  
  const formattedName = producerName.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  
  return PRODUCER_IMAGES[formattedName]?.[type] || "/placeholder.svg";
};

/**
 * Получает путь к изображению продукта
 * @param {string} productName - Название продукта
 * @returns {string} Путь к изображению продукта или путь к placeholder
 */
export const getProductImage = (productName) => {
  if (!productName) return "/placeholder.svg";
  
  const formattedName = productName.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  
  return PRODUCT_IMAGES[formattedName] || "/placeholder.svg";
};
