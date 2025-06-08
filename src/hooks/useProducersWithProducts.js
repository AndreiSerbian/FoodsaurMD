
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProducersWithProducts = (includeDemoData = false) => {
  return useQuery({
    queryKey: ['producers-with-products', includeDemoData],
    queryFn: async () => {
      // Получаем производителей с их категориями
      let query = supabase
        .from('producer_profiles')
        .select(`
          *,
          category:categories(*)
        `);

      // Фильтруем демо-данные если не нужны
      if (!includeDemoData) {
        query = query.eq('is_demo', false);
      }

      const { data: producers, error: producersError } = await query;

      if (producersError) throw producersError;

      // Если нет производителей, возвращаем пустой массив
      if (!producers || producers.length === 0) {
        return [];
      }

      // Получаем продукты с учетом фильтра демо-данных
      let productsQuery = supabase
        .from('producer_products')
        .select('*')
        .in('producer_id', producers.map(p => p.id));

      if (!includeDemoData) {
        productsQuery = productsQuery.eq('is_demo', false);
      }

      const { data: products, error: productsError } = await productsQuery;

      if (productsError) throw productsError;

      // Объединяем данные
      const producersWithProducts = producers.map(producer => ({
        ...producer,
        products: products?.filter(product => product.producer_id === producer.id) || [],
        category: Array.isArray(producer.category) ? producer.category[0] : producer.category
      }));

      return producersWithProducts;
    },
  });
};

export const useProducersByCategory = (categorySlug, includeDemoData = false) => {
  return useQuery({
    queryKey: ['producers-by-category', categorySlug, includeDemoData],
    queryFn: async () => {
      if (!categorySlug) {
        return [];
      }

      // Сначала получаем категорию по slug
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (categoryError) throw categoryError;

      // Затем получаем производителей этой категории с их товарами
      let query = supabase
        .from('producer_profiles')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('category_id', category.id);

      // Фильтруем демо-данные если не нужны
      if (!includeDemoData) {
        query = query.eq('is_demo', false);
      }

      const { data: producers, error: producersError } = await query;

      if (producersError) throw producersError;

      // Если нет производителей, возвращаем пустой массив
      if (!producers || producers.length === 0) {
        return [];
      }

      // Получаем продукты для этих производителей
      let productsQuery = supabase
        .from('producer_products')
        .select('*')
        .in('producer_id', producers.map(p => p.id));

      if (!includeDemoData) {
        productsQuery = productsQuery.eq('is_demo', false);
      }

      const { data: products, error: productsError } = await productsQuery;

      if (productsError) throw productsError;

      // Объединяем данные
      const producersWithProducts = producers.map(producer => ({
        ...producer,
        products: products?.filter(product => product.producer_id === producer.id) || [],
        category: Array.isArray(producer.category) ? producer.category[0] : producer.category
      }));

      return producersWithProducts;
    },
    enabled: !!categorySlug,
  });
};

export const useProducerByName = (producerName, includeDemoData = false) => {
  return useQuery({
    queryKey: ['producer-by-name', producerName, includeDemoData],
    queryFn: async () => {
      if (!producerName) {
        throw new Error('Producer name is required');
      }

      let query = supabase
        .from('producer_profiles')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('producer_name', producerName);

      // Фильтруем демо-данные если не нужны
      if (!includeDemoData) {
        query = query.eq('is_demo', false);
      }

      const { data: producer, error: producerError } = await query.single();

      if (producerError) throw producerError;

      // Получаем продукты производителя
      let productsQuery = supabase
        .from('producer_products')
        .select('*')
        .eq('producer_id', producer.id);

      if (!includeDemoData) {
        productsQuery = productsQuery.eq('is_demo', false);
      }

      const { data: products, error: productsError } = await productsQuery;

      if (productsError) throw productsError;

      const producerWithProducts = {
        ...producer,
        products: products || [],
        category: Array.isArray(producer.category) ? producer.category[0] : producer.category
      };

      return producerWithProducts;
    },
    enabled: !!producerName,
  });
};
