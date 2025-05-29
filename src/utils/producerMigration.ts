
import { supabase } from '@/integrations/supabase/client';
import type { ProducerMigrationData } from '../types/migration';

export const migrateProducer = async (
  producer: ProducerMigrationData,
  categoryId: string | null
): Promise<string> => {
  const isRetro = producer.producerName === 'Retro Bakery';
  const isDemo = !isRetro;
  const isVerified = isRetro;

  console.log(`Processing producer: ${producer.producerName} (demo: ${isDemo}, verified: ${isVerified})`);

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
        interior_image_url: producer.producerImage?.interior,
        is_demo: isDemo,
        is_verified: isVerified
      })
      .eq('id', existingProducer.id)
      .select('id')
      .single();

    if (updateError) {
      throw new Error(`Failed to update producer: ${updateError.message}`);
    }
    producerId = updatedProducer.id;
  } else {
    // Для создания новых производителей требуется аутентификация
    throw new Error('Для создания новых производителей необходимо настроить систему аутентификации');
  }

  return producerId;
};
