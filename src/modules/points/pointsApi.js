// @ts-check
import { supabase } from '../../integrations/supabase/client.js';

/** @typedef {{open:string, close:string}} TimeRange */
/** @typedef {{mon:TimeRange[], tue:TimeRange[], wed:TimeRange[], thu:TimeRange[], fri:TimeRange[], sat:TimeRange[], sun:TimeRange[]}} WorkHours */
/** @typedef {{id:string, producer_id:string, city:string, address:string, title?:string, lat?:number, lng?:number, work_hours:WorkHours, is_active:boolean, slug:string, name:string, created_at:string, updated_at:string}} PickupPoint */

/**
 * Получить список точек выдачи
 * @param {{producerId?: string, activeOnly?: boolean, search?: string, city?: string}} options
 * @returns {Promise<PickupPoint[]>}
 */
export async function listPoints(options = {}) {
  let query = supabase
    .from('pickup_points')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.producerId) {
    query = query.eq('producer_id', options.producerId);
  }

  if (options.activeOnly) {
    query = query.eq('is_active', true);
  }

  if (options.search) {
    query = query.or(`name.ilike.%${options.search}%,address.ilike.%${options.search}%,city.ilike.%${options.search}%`);
  }

  if (options.city) {
    query = query.eq('city', options.city);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching pickup points:', error);
    throw new Error(`Ошибка при получении точек выдачи: ${error.message}`);
  }

  return data || [];
}

/**
 * Получить точку выдачи по ID
 * @param {string} id
 * @returns {Promise<PickupPoint|null>}
 */
export async function getPointById(id) {
  const { data, error } = await supabase
    .from('pickup_points')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Point not found
    }
    console.error('Error fetching pickup point:', error);
    throw new Error(`Ошибка при получении точки выдачи: ${error.message}`);
  }

  return data;
}

/**
 * Создать новую точку выдачи
 * @param {Omit<PickupPoint, 'id'|'created_at'|'updated_at'|'slug'>} payload
 * @returns {Promise<PickupPoint>}
 */
export async function createPoint(payload) {
  const { data, error } = await supabase
    .from('pickup_points')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error creating pickup point:', error);
    throw new Error(`Ошибка при создании точки выдачи: ${error.message}`);
  }

  return data;
}

/**
 * Обновить точку выдачи
 * @param {string} id
 * @param {Partial<Omit<PickupPoint, 'id'|'created_at'|'updated_at'>>} payload
 * @returns {Promise<PickupPoint>}
 */
export async function updatePoint(id, payload) {
  const { data, error } = await supabase
    .from('pickup_points')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating pickup point:', error);
    throw new Error(`Ошибка при обновлении точки выдачи: ${error.message}`);
  }

  return data;
}

/**
 * Удалить точку выдачи
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deletePoint(id) {
  const { error } = await supabase
    .from('pickup_points')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting pickup point:', error);
    throw new Error(`Ошибка при удалении точки выдачи: ${error.message}`);
  }
}

/**
 * Получить все города с точками выдачи
 * @returns {Promise<string[]>}
 */
export async function getCities() {
  const { data, error } = await supabase
    .from('pickup_points')
    .select('city')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }

  const cities = [...new Set(data?.map(item => item.city) || [])];
  return cities.sort();
}

/**
 * Получить точки выдачи по slug производителя
 * @param {string} producerSlug
 * @returns {Promise<PickupPoint[]>}
 */
export async function getPointsByProducerSlug(producerSlug) {
  // Сначала получаем ID производителя по slug
  const { data: producerData, error: producerError } = await supabase
    .from('producer_profiles')
    .select('id')
    .eq('slug', producerSlug)
    .single();

  if (producerError) {
    console.error('Error fetching producer by slug:', producerError);
    throw new Error(`Ошибка при получении производителя: ${producerError.message}`);
  }

  if (!producerData) {
    return [];
  }

  // Затем получаем точки по producer_id
  const { data, error } = await supabase
    .from('pickup_points')
    .select('*')
    .eq('producer_id', producerData.id)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching points by producer id:', error);
    throw new Error(`Ошибка при получении точек производителя: ${error.message}`);
  }

  console.log(`Found ${data?.length || 0} active points for producer ${producerSlug}`);
  return data || [];
}

/**
 * Получить настройки Telegram для точки выдачи
 * @param {string} pointId
 * @returns {Promise<{bot_token: string|null, chat_id: string|null, is_active: boolean}|null>}
 */
export async function getPointTelegramSettings(pointId) {
  const { data, error } = await supabase
    .from('point_telegram_settings')
    .select('*')
    .eq('point_id', pointId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Settings not found
    }
    console.error('Error fetching Telegram settings:', error);
    throw new Error(`Ошибка при получении настроек Telegram: ${error.message}`);
  }

  return data;
}

/**
 * Создать или обновить настройки Telegram для точки выдачи
 * @param {string} pointId
 * @param {{bot_token: string|null, chat_id: string|null, is_active: boolean}} settings
 * @returns {Promise<any>}
 */
export async function upsertPointTelegramSettings(pointId, settings) {
  const { data, error } = await supabase
    .from('point_telegram_settings')
    .upsert({
      point_id: pointId,
      bot_token: settings.bot_token,
      chat_id: settings.chat_id,
      is_active: settings.is_active,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'point_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting Telegram settings:', error);
    throw new Error(`Ошибка при сохранении настроек Telegram: ${error.message}`);
  }

  return data;
}

/**
 * Отправить тестовое уведомление в Telegram
 * @param {string} botToken
 * @param {string} chatId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendTestTelegramNotification(botToken, chatId) {
  try {
    const response = await supabase.functions.invoke('test-telegram-notification', {
      body: { botToken, chatId }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw new Error(`Ошибка при отправке тестового уведомления: ${error.message}`);
  }
}