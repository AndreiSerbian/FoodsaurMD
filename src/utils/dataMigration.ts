
import { supabase } from '@/integrations/supabase/client';
import { producersData } from '../data/products';

export interface MigrationResult {
  success: boolean;
  message: string;
  details?: any;
}

export const migrateProducersToSupabase = async (): Promise<MigrationResult> => {
  try {
    console.log('Starting migration of producers to Supabase...');
    
    // Получаем существующие категории из Supabase
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug');
    
    if (categoriesError) {
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    // Создаем маппинг названий категорий к их ID
    const categoryMap = new Map();
    categories?.forEach(cat => {
      categoryMap.set(cat.name, cat.id);
      categoryMap.set(cat.slug, cat.id);
    });

    let migratedCount = 0;
    const errors: string[] = [];

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

        // Проверяем, существует ли уже этот производитель
        const { data: existingProducer } = await supabase
          .from('producer_profiles')
          .select('id')
          .eq('producer_name', producer.producerName)
          .single();

        let producerId: string;

        if (existingProducer) {
          // Обновляем существующего производителя
          const { data: updatedProducer, error: updateError } = await supabase
            .from('producer_profiles')
            .update({
              category_id: categoryId,
              address: producer.address,
              phone: producer.phone,
              discount_available_time: producer.discountAvailableTime,
              exterior_image_url: producer.producerImage?.exterior,
              interior_image_url: producer.producerImage?.interior
            })
            .eq('id', existingProducer.id)
            .select('id')
            .single();

          if (updateError) {
            throw new Error(`Failed to update producer: ${updateError.message}`);
          }
          producerId = updatedProducer.id;
        } else {
          // Создаем нового производителя (требует user_id, используем временный UUID)
          const tempUserId = crypto.randomUUID();
          
          const { data: newProducer, error: insertError } = await supabase
            .from('producer_profiles')
            .insert({
              producer_name: producer.producerName,
              category_id: categoryId,
              address: producer.address,
              phone: producer.phone,
              discount_available_time: producer.discountAvailableTime,
              exterior_image_url: producer.producerImage?.exterior,
              interior_image_url: producer.producerImage?.interior,
              user_id: tempUserId // Временный ID, потребует обновления при регистрации
            })
            .select('id')
            .single();

          if (insertError) {
            throw new Error(`Failed to insert producer: ${insertError.message}`);
          }
          producerId = newProducer.id;
        }

        // Мигрируем продукты этого производителя
        if (producer.products && producer.products.length > 0) {
          for (const product of producer.products) {
            // Проверяем, существует ли уже этот продукт
            const { data: existingProduct } = await supabase
              .from('producer_products')
              .select('id')
              .eq('producer_id', producerId)
              .eq('name', product.productName)
              .single();

            const productData = {
              producer_id: producerId,
              name: product.productName,
              description: product.description,
              price_regular: Number(product.priceRegular) || 0,
              price_discount: product.priceDiscount ? Number(product.priceDiscount) : null,
              image_url: product.image,
              quantity: product.quantity || 0,
              category_id: categoryId
            };

            if (existingProduct) {
              // Обновляем существующий продукт
              const { error: updateProductError } = await supabase
                .from('producer_products')
                .update(productData)
                .eq('id', existingProduct.id);

              if (updateProductError) {
                errors.push(`Failed to update product ${product.productName}: ${updateProductError.message}`);
              }
            } else {
              // Создаем новый продукт
              const { error: insertProductError } = await supabase
                .from('producer_products')
                .insert(productData);

              if (insertProductError) {
                errors.push(`Failed to insert product ${product.productName}: ${insertProductError.message}`);
              }
            }
          }
        }

        migratedCount++;
        console.log(`Migrated producer: ${producer.producerName}`);
      } catch (error) {
        const errorMsg = `Failed to migrate producer ${producer.producerName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    const result: MigrationResult = {
      success: errors.length === 0,
      message: `Migration completed. ${migratedCount} producers processed.`,
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
