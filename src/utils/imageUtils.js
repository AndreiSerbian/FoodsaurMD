
/**
 * Утилиты для работы с изображениями
 */

// Функция для получения пути к изображению категории
export const getCategoryImagePath = (category) => {
  // Приводим название категории к формату файла (lowercase, замена пробелов на дефисы)
  const formattedName = category.toLowerCase().replace(/\s+/g, '-');
  return `/src/assets/images/categories/${formattedName}.jpg`;
};

// Функция для получения пути к изображению производителя
export const getProducerImagePath = (producerName, type = 'exterior') => {
  // Приводим название ресторана к формату файла (lowercase, замена пробелов на дефисы)
  const formattedName = producerName.toLowerCase().replace(/\s+/g, '-');
  return `/src/assets/images/producers/${formattedName}-${type}.jpg`;
};

// Функция для получения пути к изображению продукта
export const getProductImagePath = (productName) => {
  // Приводим название продукта к формату файла (lowercase, замена пробелов на дефисы)
  const formattedName = productName.toLowerCase().replace(/\s+/g, '-');
  return `/src/assets/images/products/${formattedName}.jpg`;
};

// Функция-обработчик ошибок изображений
export const handleImageError = (e) => {
  e.currentTarget.src = "/placeholder.svg";
};
