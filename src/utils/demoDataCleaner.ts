
import { supabase } from '@/integrations/supabase/client';
import type { MigrationResult } from '../types/migration';

export const clearDemoData = async (): Promise<MigrationResult> => {
  try {
    console.log('Starting demo data cleanup...');

    // Удаляем демо-продукты
    const { error: productsError } = await supabase
      .from('producer_products')
      .delete()
      .eq('is_demo', true);

    if (productsError) {
      throw new Error(`Failed to delete demo products: ${productsError.message}`);
    }

    // Удаляем демо-производителей
    const { error: producersError } = await supabase
      .from('producer_profiles')
      .delete()
      .eq('is_demo', true);

    if (producersError) {
      throw new Error(`Failed to delete demo producers: ${producersError.message}`);
    }

    const result: MigrationResult = {
      success: true,
      message: 'Demo data cleared successfully. Only verified producers remain.'
    };

    console.log('Demo cleanup result:', result);
    return result;
  } catch (error) {
    const errorMsg = `Demo cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    return {
      success: false,
      message: errorMsg
    };
  }
};
