-- Создание функции для инициализации остатков точки
CREATE OR REPLACE FUNCTION public.initialize_point_inventory(
  point_id_param UUID,
  producer_id_param UUID
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  synced_count INTEGER := 0;
  product_record RECORD;
BEGIN
  -- Получаем все товары производителя
  FOR product_record IN 
    SELECT id, quantity 
    FROM products 
    WHERE producer_id = producer_id_param
  LOOP
    -- Вставляем или обновляем остатки в point_inventory
    INSERT INTO point_inventory (point_id, product_id, stock, is_listed, updated_at)
    VALUES (point_id_param, product_record.id, product_record.quantity, true, now())
    ON CONFLICT (point_id, product_id) 
    DO UPDATE SET 
      stock = EXCLUDED.stock,
      is_listed = EXCLUDED.is_listed,
      updated_at = EXCLUDED.updated_at;
    
    synced_count := synced_count + 1;
  END LOOP;
  
  RETURN synced_count;
END;
$$;

-- Инициализация остатков для всех точек retro-bakery
DO $$
DECLARE
  producer_id_val UUID;
  point_record RECORD;
  sync_result INTEGER;
BEGIN
  -- Получаем ID производителя retro-bakery
  SELECT id INTO producer_id_val 
  FROM producer_profiles 
  WHERE slug = 'retro-bakery';
  
  IF producer_id_val IS NOT NULL THEN
    -- Для каждой точки производителя инициализируем остатки
    FOR point_record IN 
      SELECT id, name 
      FROM pickup_points 
      WHERE producer_id = producer_id_val
    LOOP
      SELECT public.initialize_point_inventory(point_record.id, producer_id_val) INTO sync_result;
      RAISE NOTICE 'Синхронизировано % товаров для точки %', sync_result, point_record.name;
    END LOOP;
  ELSE
    RAISE NOTICE 'Производитель retro-bakery не найден';
  END IF;
END;
$$;