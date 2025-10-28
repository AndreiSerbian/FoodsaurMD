-- Принудительно обновляем slug для всех точек с некорректными значениями
UPDATE pickup_points 
SET slug = public.generate_slug(city || '-' || address),
    updated_at = now()
WHERE slug IS NULL OR slug = '' OR slug = '-' OR slug LIKE '-%' OR LENGTH(slug) < 5;

-- Проверяем уникальность и добавляем счетчик если нужно
DO $$
DECLARE
  point_record RECORD;
  new_slug TEXT;
  counter INTEGER;
BEGIN
  FOR point_record IN 
    SELECT id, city, address, slug 
    FROM pickup_points 
    ORDER BY created_at
  LOOP
    new_slug := public.generate_slug(point_record.city || '-' || point_record.address);
    counter := 0;
    
    -- Проверяем, есть ли другая точка с таким же slug
    WHILE EXISTS (
      SELECT 1 FROM pickup_points 
      WHERE slug = new_slug AND id != point_record.id
    ) LOOP
      counter := counter + 1;
      new_slug := public.generate_slug(point_record.city || '-' || point_record.address) || '-' || counter;
    END LOOP;
    
    -- Обновляем slug если он изменился
    IF point_record.slug != new_slug THEN
      UPDATE pickup_points 
      SET slug = new_slug, updated_at = now()
      WHERE id = point_record.id;
    END IF;
  END LOOP;
END $$;