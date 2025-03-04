
/**
 * Получает путь к изображению категории
 * @param {string} categoryName - Имя категории
 * @returns {string} - Путь к изображению
 */
export const getCategoryImagePath = (categoryName) => {
  try {
    // Нормализуем имя категории для использования в пути к файлу
    const normalizedName = categoryName.toLowerCase().replace(/\s+/g, '-');
    return `/assets/images/categories/${normalizedName}.jpg`;
  } catch (error) {
    console.error('Ошибка при получении пути к изображению категории:', error);
    return '/placeholder.svg';
  }
};

/**
 * Получает путь к изображению производителя
 * @param {string} categoryName - Имя категории
 * @param {string} producerName - Имя производителя
 * @param {string} type - Тип изображения (exterior или interior)
 * @returns {string} - Путь к изображению
 */
export const getProducerImagePath = (categoryName, producerName, type = 'exterior') => {
  try {
    const normalizedCategory = categoryName.toLowerCase().replace(/\s+/g, '-');
    const normalizedProducer = producerName.toLowerCase().replace(/\s+/g, '-');
    return `/assets/images/producers/${normalizedCategory}/${normalizedProducer}-${type}.jpg`;
  } catch (error) {
    console.error('Ошибка при получении пути к изображению производителя:', error);
    return '/placeholder.svg';
  }
};

/**
 * Получает путь к изображению продукта
 * @param {string} categoryName - Имя категории
 * @param {string} productName - Имя продукта
 * @returns {string} - Путь к изображению
 */
export const getProductImagePath = (categoryName, productName) => {
  try {
    const normalizedCategory = categoryName.toLowerCase().replace(/\s+/g, '-');
    const normalizedProduct = productName.toLowerCase().replace(/\s+/g, '-');
    return `/assets/images/products/${normalizedCategory}/${normalizedProduct}.jpg`;
  } catch (error) {
    console.error('Ошибка при получении пути к изображению продукта:', error);
    return '/placeholder.svg';
  }
};

/**
 * Универсальный компонент изображения с запасным вариантом
 * @param {string} src - Путь к изображению
 * @param {string} alt - Альтернативный текст
 * @param {string} className - CSS классы
 * @returns {JSX.Element} - React компонент
 */
export const ImageWithFallback = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  
  const handleError = () => {
    setImgSrc('/placeholder.svg');
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className} 
      onError={handleError}
    />
  );
};
