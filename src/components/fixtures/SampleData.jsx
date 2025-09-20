import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SampleData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createSampleData = async () => {
    setLoading(true);
    try {
      // Get first producer profile
      const { data: producerProfiles, error: profileError } = await supabase
        .from('producer_profiles')
        .select('id')
        .limit(1);

      if (profileError) throw profileError;
      
      if (producerProfiles.length === 0) {
        throw new Error('Нет производителей для создания тестовых данных');
      }

      const producerId = producerProfiles[0].id;

      // Get first pickup point
      const { data: pickupPoints, error: pointError } = await supabase
        .from('pickup_points')
        .select('id')
        .eq('producer_id', producerId)
        .limit(1);

      if (pointError) throw pointError;
      
      if (pickupPoints.length === 0) {
        throw new Error('Нет точек выдачи для создания тестовых данных');
      }

      const pointId = pickupPoints[0].id;

      // Create sample products
      const products = [
        {
          producer_id: producerId,
          name: 'Мука пшеничная высшего сорта',
          description: 'Высококачественная мука для выпечки',
          measure_kind: 'mass',
          base_unit: 'g',
          ingredients: 'Пшеница мягкая',
          allergen_info: 'Содержит глютен',
          is_active: true
        },
        {
          producer_id: producerId,
          name: 'Круассан классический',
          description: 'Свежеиспеченный французский круассан',
          measure_kind: 'unit',
          base_unit: 'pcs',
          ingredients: 'Мука, масло, дрожжи, соль',
          allergen_info: 'Содержит глютен, молоко',
          is_active: true
        }
      ];

      const { data: createdProducts, error: productError } = await supabase
        .from('products')
        .insert(products)
        .select();

      if (productError) throw productError;

      // Create inventory records
      for (const product of createdProducts) {
        const bulkQty = product.measure_kind === 'mass' ? 2500 : 50; // 2.5kg flour or 50 croissants
        
        await supabase
          .from('point_inventory')
          .insert({
            point_id: pointId,
            product_id: product.id,
            bulk_qty: bulkQty
          });
      }

      // Create variants
      const variants = [
        // Flour variants
        {
          point_id: pointId,
          product_id: createdProducts[0].id,
          variant_name: 'Пачка 250г',
          sale_mode: 'per_pack',
          pack_size_base: 250,
          price_per_pack: 149.00,
          price_discount: 119.00,
          discount_start: new Date().toISOString(),
          discount_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        },
        {
          point_id: pointId,
          product_id: createdProducts[0].id,
          variant_name: 'На развес',
          sale_mode: 'per_weight',
          price_per_kg: 596.00,
          is_active: true
        },
        // Croissant variants
        {
          point_id: pointId,
          product_id: createdProducts[1].id,
          variant_name: 'Поштучно',
          sale_mode: 'per_unit',
          price_per_unit: 25.00,
          is_active: true
        }
      ];

      const { error: variantError } = await supabase
        .from('point_variants')
        .insert(variants);

      if (variantError) throw variantError;

      toast({
        title: 'Успешно',
        description: 'Тестовые данные созданы'
      });

    } catch (error) {
      console.error('Error creating sample data:', error);
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Создание тестовых данных</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Создает образцы товаров с различными вариантами продаж для тестирования новой системы учёта.
            <br />
            Будут созданы:
            <ul className="list-disc list-inside mt-2">
              <li>Мука (2.5 кг bulk) - пачки 250г и развес</li>
              <li>Круассаны (50 шт bulk) - поштучная продажа</li>
              <li>Скидка на муку в пачках (7 дней)</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={createSampleData} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Создание...' : 'Создать тестовые данные'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SampleData;