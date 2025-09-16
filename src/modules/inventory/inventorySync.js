import { supabase } from '@/integrations/supabase/client';

/**
 * Синхронизировать остатки товаров производителя с точкой выдачи
 * @param {string} pointId - ID точки выдачи
 * @param {string} producerId - ID производителя
 */
export async function syncProductsToPoint(pointId, producerId) {
  try {
    // Получаем все товары производителя
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, quantity')
      .eq('producer_id', producerId);

    if (productsError) {
      throw new Error(`Ошибка получения товаров: ${productsError.message}`);
    }

    if (!products || products.length === 0) {
      console.log('У производителя нет товаров для синхронизации');
      return { success: true, synced: 0 };
    }

    // Создаем записи в point_inventory для каждого товара
    const inventoryRecords = products.map(product => ({
      point_id: pointId,
      product_id: product.id,
      stock: product.quantity, // Копируем глобальный остаток
      is_listed: true,
      updated_at: new Date().toISOString()
    }));

    // Используем upsert для избежания дублирования
    const { error: insertError } = await supabase
      .from('point_inventory')
      .upsert(inventoryRecords, {
        onConflict: 'point_id,product_id',
        ignoreDuplicates: false
      });

    if (insertError) {
      throw new Error(`Ошибка синхронизации остатков: ${insertError.message}`);
    }

    console.log(`Синхронизировано ${inventoryRecords.length} товаров для точки ${pointId}`);
    return { success: true, synced: inventoryRecords.length };

  } catch (error) {
    console.error('Ошибка синхронизации остатков:', error);
    throw error;
  }
}

/**
 * Обновить остатки товара в точке
 * @param {string} pointId - ID точки
 * @param {string} productId - ID товара
 * @param {number} newStock - новый остаток
 */
export async function updatePointStock(pointId, productId, newStock) {
  try {
    const { error } = await supabase
      .from('point_inventory')
      .upsert({
        point_id: pointId,
        product_id: productId,
        stock: newStock,
        is_listed: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'point_id,product_id'
      });

    if (error) {
      throw new Error(`Ошибка обновления остатков: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Ошибка обновления остатков:', error);
    throw error;
  }
}

/**
 * Получить остатки товаров для точки
 * @param {string} pointId - ID точки
 */
export async function getPointInventory(pointId) {
  try {
    const { data, error } = await supabase
      .from('point_inventory')
      .select(`
        *,
        products (
          id,
          name,
          price_regular
        )
      `)
      .eq('point_id', pointId)
      .eq('is_listed', true)
      .order('products(name)');

    if (error) {
      throw new Error(`Ошибка получения остатков: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Ошибка получения остатков:', error);
    throw error;
  }
}