-- Удаляем старую функцию если она существует
DROP FUNCTION IF EXISTS public.generate_slug(text);

-- Создаем функцию для генерации slug из текста (транслитерация и форматирование)
CREATE OR REPLACE FUNCTION public.generate_slug(text_value TEXT)
RETURNS TEXT AS $$
DECLARE
  slug_value TEXT;
  cyrillic_chars TEXT[] := ARRAY['а','б','в','г','д','е','ё','ж','з','и','й','к','л','м','н','о','п','р','с','т','у','ф','х','ц','ч','ш','щ','ъ','ы','ь','э','ю','я',' '];
  latin_chars TEXT[] := ARRAY['a','b','v','g','d','e','e','zh','z','i','y','k','l','m','n','o','p','r','s','t','u','f','h','ts','ch','sh','sch','','y','','e','yu','ya','-'];
  i INTEGER;
BEGIN
  slug_value := LOWER(text_value);
  
  -- Транслитерация кириллицы в латиницу
  FOR i IN 1..array_length(cyrillic_chars, 1) LOOP
    slug_value := REPLACE(slug_value, cyrillic_chars[i], latin_chars[i]);
  END LOOP;
  
  -- Удаляем все символы кроме букв, цифр и дефисов
  slug_value := regexp_replace(slug_value, '[^a-z0-9-]', '-', 'g');
  
  -- Заменяем множественные дефисы на один
  slug_value := regexp_replace(slug_value, '-+', '-', 'g');
  
  -- Удаляем дефисы в начале и конце
  slug_value := TRIM(BOTH '-' FROM slug_value);
  
  RETURN slug_value;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Функция для обновления slug производителя
CREATE OR REPLACE FUNCTION public.update_producer_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Генерируем slug только если он пустой, равен '-' или при создании новой записи
  IF NEW.slug IS NULL OR NEW.slug = '' OR NEW.slug = '-' OR TG_OP = 'INSERT' THEN
    NEW.slug := generate_slug(NEW.producer_name);
    
    -- Проверяем уникальность и добавляем счетчик если нужно
    WHILE EXISTS (SELECT 1 FROM producer_profiles WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Функция для обновления slug точки выдачи
CREATE OR REPLACE FUNCTION public.update_point_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Генерируем slug только если он пустой, равен '-' или при создании новой записи
  IF NEW.slug IS NULL OR NEW.slug = '' OR NEW.slug = '-' OR TG_OP = 'INSERT' THEN
    NEW.slug := generate_slug(NEW.city || '-' || NEW.address);
    
    -- Проверяем уникальность и добавляем счетчик если нужно
    WHILE EXISTS (SELECT 1 FROM pickup_points WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры для автоматической генерации slug
DROP TRIGGER IF EXISTS trigger_update_producer_slug ON producer_profiles;
CREATE TRIGGER trigger_update_producer_slug
  BEFORE INSERT OR UPDATE OF producer_name
  ON producer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_producer_slug();

DROP TRIGGER IF EXISTS trigger_update_point_slug ON pickup_points;
CREATE TRIGGER trigger_update_point_slug
  BEFORE INSERT OR UPDATE OF name, city, address
  ON pickup_points
  FOR EACH ROW
  EXECUTE FUNCTION update_point_slug();

-- Обновляем существующие записи с некорректными slug
UPDATE producer_profiles 
SET slug = generate_slug(producer_name)
WHERE slug IS NULL OR slug = '' OR slug = '-';

UPDATE pickup_points 
SET slug = generate_slug(city || '-' || address)
WHERE slug IS NULL OR slug = '' OR slug = '-';