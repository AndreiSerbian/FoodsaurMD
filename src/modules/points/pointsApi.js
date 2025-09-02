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
  const { data, error } = await supabase
    .from('pickup_points')
    .select(`
      *,
      producer_profiles!inner(slug)
    `)
    .eq('producer_profiles.slug', producerSlug)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching points by producer slug:', error);
    throw new Error(`Ошибка при получении точек производителя: ${error.message}`);
  }

  return data || [];
}