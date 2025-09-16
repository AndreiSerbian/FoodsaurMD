import { supabase } from '@/integrations/supabase/client';
import { syncProductsToPoint } from '@/modules/inventory/inventorySync';

/**
 * Инициализировать остатки для всех точек производителя
 * @param {string} producerSlug - слаг производителя
 */
export async function initializeProducerInventory(producerSlug) {
  try {
    // Получаем производителя по slug
    const { data: producer, error: producerError } = await supabase
      .from('producer_profiles')
      .select('id')
      .eq('slug', producerSlug)
      .single();

    if (producerError || !producer) {
      throw new Error('Производитель не найден');
    }

    // Получаем все точки производителя
    const { data: points, error: pointsError } = await supabase
      .from('pickup_points')
      .select('id, name')
      .eq('producer_id', producer.id);

    if (pointsError) {
      throw new Error(`Ошибка получения точек: ${pointsError.message}`);
    }

    if (!points || points.length === 0) {
      throw new Error('У производителя нет точек выдачи');
    }

    // Синхронизируем каждую точку
    const results = [];
    for (const point of points) {
      try {
        const result = await syncProductsToPoint(point.id, producer.id);
        results.push({
          pointId: point.id,
          pointName: point.name,
          ...result
        });
      } catch (error) {
        console.error(`Ошибка синхронизации точки ${point.name}:`, error);
        results.push({
          pointId: point.id,
          pointName: point.name,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Ошибка инициализации остатков:', error);
    throw error;
  }
}

// Функция для немедленного запуска инициализации
export async function runInitForRetroBakery() {
  try {
    console.log('Начинаем инициализацию остатков для Retro Bakery...');
    const results = await initializeProducerInventory('retro-bakery');
    console.log('Результаты инициализации:', results);
    return results;
  } catch (error) {
    console.error('Ошибка инициализации Retro Bakery:', error);
    throw error;
  }
}