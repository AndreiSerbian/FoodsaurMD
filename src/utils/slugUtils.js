
/**
 * Генерирует slug из названия
 * @param {string} name Название для преобразования в slug
 * @returns {string} slug в формате kebab-case
 */
export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    // Заменяем кириллицу на латиницу
    .replace(/а/g, 'a')
    .replace(/б/g, 'b')
    .replace(/в/g, 'v')
    .replace(/г/g, 'g')
    .replace(/д/g, 'd')
    .replace(/е/g, 'e')
    .replace(/ё/g, 'yo')
    .replace(/ж/g, 'zh')
    .replace(/з/g, 'z')
    .replace(/и/g, 'i')
    .replace(/й/g, 'y')
    .replace(/к/g, 'k')
    .replace(/л/g, 'l')
    .replace(/м/g, 'm')
    .replace(/н/g, 'n')
    .replace(/о/g, 'o')
    .replace(/п/g, 'p')
    .replace(/р/g, 'r')
    .replace(/с/g, 's')
    .replace(/т/g, 't')
    .replace(/у/g, 'u')
    .replace(/ф/g, 'f')
    .replace(/х/g, 'kh')
    .replace(/ц/g, 'ts')
    .replace(/ч/g, 'ch')
    .replace(/ш/g, 'sh')
    .replace(/щ/g, 'sch')
    .replace(/ъ/g, '')
    .replace(/ы/g, 'y')
    .replace(/ь/g, '')
    .replace(/э/g, 'e')
    .replace(/ю/g, 'yu')
    .replace(/я/g, 'ya')
    // Убираем специальные символы и заменяем пробелы на дефисы
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Проверяет валидность slug
 * @param {string} slug Строка для проверки
 * @returns {boolean} true если slug валидный
 */
export const isValidSlug = (slug) => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Предустановленные slug для основных категорий
 */
export const CATEGORY_SLUGS = {
  'Молдавская': 'moldavian',
  'Европейская': 'european', 
  'Паназиатская': 'panasian',
  'Десерты': 'desserts',
  'Напитки': 'drinks'
};

/**
 * Получает slug для категории, используя предустановленные значения или генерируя новый
 * @param {string} categoryName Название категории
 * @returns {string} slug для категории
 */
export const getCategorySlug = (categoryName) => {
  // Сначала проверяем предустановленные slug
  const predefinedSlug = CATEGORY_SLUGS[categoryName];
  if (predefinedSlug) {
    return predefinedSlug;
  }
  
  // Если нет предустановленного, генерируем новый
  return generateSlug(categoryName);
};
