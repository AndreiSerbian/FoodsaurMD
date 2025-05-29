
import { producersData } from '../data/products';
import { getCategoryMapping } from './categoryMapping';
import { migrateProducer } from './producerMigration';
import { migrateProducts } from './productMigration';
import { clearDemoData } from './demoDataCleaner';
import type { MigrationResult } from '../types/migration';

export type { MigrationResult };
export { clearDemoData };

export const migrateProducersToSupabase = async (): Promise<MigrationResult> => {
  try {
    console.log('Starting migration of producers to Supabase...');
    
    // Получаем маппинг категорий
    const categoryMap = await getCategoryMapping();

    let migratedCount = 0;
    const errors: string[] = [];

    // Очищаем существующие демо-данные перед миграцией
    await clearDemoData();

    for (const producer of producersData) {
      try {
        // Определяем category_id на основе названия категории
        let categoryId = null;
        if (producer.category) {
          categoryId = categoryMap.get(producer.category);
          if (!categoryId) {
            console.warn(`Category not found for producer ${producer.producerName}: ${producer.category}`);
          }
        }

        // Мигрируем производителя
        const producerId = await migrateProducer(producer, categoryId);

        // Мигрируем продукты этого производителя
        const productErrors = await migrateProducts(producer, producerId, categoryId);
        errors.push(...productErrors);

        migratedCount++;
        console.log(`Migrated producer: ${producer.producerName}`);
      } catch (error) {
        if (error instanceof Error && error.message.includes('аутентификации')) {
          // Это ожидаемая ошибка для новых производителей
          const result: MigrationResult = {
            success: false,
            message: 'Для создания новых производителей необходимо настроить систему аутентификации. Используйте SQL-миграцию в админ-панели Supabase.',
            details: {
              note: 'В данный момент можно только обновлять существующих производителей'
            }
          };
          return result;
        }

        const errorMsg = `Failed to migrate producer ${producer.producerName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    const result: MigrationResult = {
      success: errors.length === 0,
      message: `Migration completed. ${migratedCount} producers processed. Retro Bakery verified, others marked as demo.`,
      details: {
        migratedCount,
        errors: errors.length > 0 ? errors : undefined
      }
    };

    console.log('Migration result:', result);
    return result;
  } catch (error) {
    const errorMsg = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    return {
      success: false,
      message: errorMsg
    };
  }
};
