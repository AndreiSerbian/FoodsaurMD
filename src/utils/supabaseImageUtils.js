
import { supabase } from '@/integrations/supabase/client';

/**
 * Получает изображения производителя из Supabase Storage
 * @param {string} producerSlug - Slug производителя (например: "retro-bakery")
 * @returns {Array} Массив объектов с изображениями [{ label, url }]
 */
export const getProducerImages = async (producerSlug) => {
  if (!producerSlug) return [];

  const images = [];
  
  // Формируем slug для папки (заменяем пробелы на дефисы, приводим к нижнему регистру)
  const folderSlug = producerSlug.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

  try {
    // Проверяем наличие логотипа
    const logoPath = `${folderSlug}/logo.png`;
    const { data: logoData } = supabase.storage
      .from('produsers')
      .getPublicUrl(logoPath);
    
    if (logoData?.publicUrl) {
      images.push({
        label: "Логотип",
        url: logoData.publicUrl
      });
    }

    // Проверяем наличие экстерьера
    const exteriorPath = `${folderSlug}/exterior.jpg`;
    const { data: exteriorData } = supabase.storage
      .from('produsers')
      .getPublicUrl(exteriorPath);
    
    if (exteriorData?.publicUrl) {
      images.push({
        label: "Экстерьер", 
        url: exteriorData.publicUrl
      });
    }

    // Если нет изображений, добавляем placeholder
    if (images.length === 0) {
      images.push({
        label: "Изображение",
        url: "/placeholder.svg"
      });
    }

    return images;
  } catch (error) {
    console.error('Ошибка при получении изображений производителя:', error);
    return [{
      label: "Изображение",
      url: "/placeholder.svg"
    }];
  }
};

/**
 * Синхронно получает URL изображений производителя (без проверки существования)
 * @param {string} producerSlug - Slug производителя
 * @returns {Array} Массив объектов с изображениями
 */
export const getProducerImagesSync = (producerSlug) => {
  if (!producerSlug) return [{ label: "Изображение", url: "/placeholder.svg" }];

  const folderSlug = producerSlug.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

  const images = [];

  // Логотип
  const { data: logoData } = supabase.storage
    .from('produsers')
    .getPublicUrl(`${folderSlug}/logo.png`);
  
  if (logoData?.publicUrl) {
    images.push({
      label: "Логотип",
      url: logoData.publicUrl
    });
  }

  // Экстерьер
  const { data: exteriorData } = supabase.storage
    .from('produsers')
    .getPublicUrl(`${folderSlug}/exterior.jpg`);
  
  if (exteriorData?.publicUrl) {
    images.push({
      label: "Экстерьер",
      url: exteriorData.publicUrl
    });
  }

  // Если нет изображений, добавляем placeholder
  if (images.length === 0) {
    images.push({
      label: "Изображение",
      url: "/placeholder.svg"
    });
  }

  return images;
};
