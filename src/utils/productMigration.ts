
import { supabase } from '@/integrations/supabase/client';
import type { ProducerMigrationData } from '../types/migration';

export const migrateProducts = async (
  producer: ProducerMigrationData,
  producerId: string,
  categoryId: string | null
): Promise<string[]> => {
  const errors: string[] = [];
  const isDemo = producer.producerName !== 'Retro Bakery';

  if (!producer.products || producer.products.length === 0) {
    return errors;
  }

  for (const product of producer.products) {
    try {
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
        category_id: categoryId,
        is_demo: isDemo
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
    } catch (error) {
      const errorMsg = `Failed to migrate product ${product.productName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
    }
  }

  return errors;
};
