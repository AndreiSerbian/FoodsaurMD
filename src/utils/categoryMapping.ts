
import { supabase } from '@/integrations/supabase/client';

export const getCategoryMapping = async (): Promise<Map<string, string>> => {
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug');
  
  if (categoriesError) {
    throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
  }

  const categoryMap = new Map<string, string>();
  categories?.forEach(cat => {
    categoryMap.set(cat.name, cat.id);
    categoryMap.set(cat.slug, cat.id);
  });

  return categoryMap;
};
