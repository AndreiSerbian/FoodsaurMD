
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type ProducerProfile = Tables<'producer_profiles'>;
type ProducerProduct = Tables<'producer_products'>;

export interface ProducerWithProducts extends ProducerProfile {
  products: ProducerProduct[];
  category?: Tables<'categories'>;
}

export const useProducersWithProducts = () => {
  return useQuery({
    queryKey: ['producers-with-products'],
    queryFn: async () => {
      // Получаем производителей с их категориями
      const { data: producers, error: producersError } = await supabase
        .from('producer_profiles')
        .select(`
          *,
          category:categories(*)
        `);

      if (producersError) throw producersError;

      // Получаем все продукты
      const { data: products, error: productsError } = await supabase
        .from('producer_products')
        .select('*');

      if (productsError) throw productsError;

      // Объединяем данные
      const producersWithProducts: ProducerWithProducts[] = producers.map(producer => ({
        ...producer,
        products: products.filter(product => product.producer_id === producer.id),
        category: Array.isArray(producer.category) ? producer.category[0] : producer.category
      }));

      return producersWithProducts;
    },
  });
};

export const useProducersByCategory = (categorySlug: string) => {
  return useQuery({
    queryKey: ['producers-by-category', categorySlug],
    queryFn: async () => {
      // Сначала получаем категорию по slug
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (categoryError) throw categoryError;

      // Затем получаем производителей этой категории с их товарами
      const { data: producers, error: producersError } = await supabase
        .from('producer_profiles')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('category_id', category.id);

      if (producersError) throw producersError;

      // Получаем продукты для этих производителей
      const { data: products, error: productsError } = await supabase
        .from('producer_products')
        .select('*')
        .in('producer_id', producers.map(p => p.id));

      if (productsError) throw productsError;

      // Объединяем данные
      const producersWithProducts: ProducerWithProducts[] = producers.map(producer => ({
        ...producer,
        products: products.filter(product => product.producer_id === producer.id),
        category: Array.isArray(producer.category) ? producer.category[0] : producer.category
      }));

      return producersWithProducts;
    },
    enabled: !!categorySlug,
  });
};

export const useProducerByName = (producerName: string) => {
  return useQuery({
    queryKey: ['producer-by-name', producerName],
    queryFn: async () => {
      const { data: producer, error: producerError } = await supabase
        .from('producer_profiles')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('producer_name', producerName)
        .single();

      if (producerError) throw producerError;

      // Получаем продукты производителя
      const { data: products, error: productsError } = await supabase
        .from('producer_products')
        .select('*')
        .eq('producer_id', producer.id);

      if (productsError) throw productsError;

      const producerWithProducts: ProducerWithProducts = {
        ...producer,
        products: products || [],
        category: Array.isArray(producer.category) ? producer.category[0] : producer.category
      };

      return producerWithProducts;
    },
    enabled: !!producerName,
  });
};
