
/**
 * Утилиты для работы со slug
 */

/**
 * Генерирует slug из названия
 * @param name Название для преобразования в slug
 * @returns slug в формате kebab-case
 */
export const generateSlug = (name: string): string => {
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
 * @param slug Строка для проверки
 * @returns true если slug валидный
 */
export const isValidSlug = (slug: string): boolean => {
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
} as const;

/**
 * Получает slug для категории, используя предустановленные значения или генерируя новый
 * @param categoryName Название категории
 * @returns slug для категории
 */
export const getCategorySlug = (categoryName: string): string => {
  // Сначала проверяем предустановленные slug
  const predefinedSlug = CATEGORY_SLUGS[categoryName as keyof typeof CATEGORY_SLUGS];
  if (predefinedSlug) {
    return predefinedSlug;
  }
  
  // Если нет предустановленного, генерируем новый
  return generateSlug(categoryName);
};
