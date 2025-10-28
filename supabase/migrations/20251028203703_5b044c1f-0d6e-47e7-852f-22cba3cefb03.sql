-- Удаляем старые функции с CASCADE
DROP FUNCTION IF EXISTS public.generate_slug(text) CASCADE;
DROP FUNCTION IF EXISTS public.update_producer_slug() CASCADE;
DROP FUNCTION IF EXISTS public.update_point_slug() CASCADE;

-- Создаем улучшенные функции с правильным search_path
CREATE OR REPLACE FUNCTION public.generate_slug(text_value TEXT)
RETURNS TEXT 
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  slug_value TEXT;
  cyrillic_chars TEXT[] := ARRAY['а','б','в','г','д','е','ё','ж','з','и','й','к','л','м','н','о','п','р','с','т','у','ф','х','ц','ч','ш','щ','ъ','ы','ь','э','ю','я',' '];
  latin_chars TEXT[] := ARRAY['a','b','v','g','d','e','e','zh','z','i','y','k','l','m','n','o','p','r','s','t','u','f','h','ts','ch','sh','sch','','y','','e','yu','ya','-'];
  i INTEGER;
BEGIN
  slug_value := LOWER(text_value);
  
  FOR i IN 1..array_length(cyrillic_chars, 1) LOOP
    slug_value := REPLACE(slug_value, cyrillic_chars[i], latin_chars[i]);
  END LOOP;
  
  slug_value := regexp_replace(slug_value, '[^a-z0-9-]', '-', 'g');
  slug_value := regexp_replace(slug_value, '-+', '-', 'g');
  slug_value := TRIM(BOTH '-' FROM slug_value);
  
  RETURN slug_value;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_producer_slug()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' OR NEW.slug = '-' OR TG_OP = 'INSERT' THEN
    NEW.slug := generate_slug(NEW.producer_name);
    
    WHILE EXISTS (SELECT 1 FROM producer_profiles WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_point_slug()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' OR NEW.slug = '-' OR TG_OP = 'INSERT' THEN
    NEW.slug := generate_slug(NEW.city || '-' || NEW.address);
    
    WHILE EXISTS (SELECT 1 FROM pickup_points WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Пересоздаем триггеры
CREATE TRIGGER trigger_update_producer_slug
  BEFORE INSERT OR UPDATE OF producer_name
  ON producer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_producer_slug();

CREATE TRIGGER trigger_update_point_slug
  BEFORE INSERT OR UPDATE OF name, city, address
  ON pickup_points
  FOR EACH ROW
  EXECUTE FUNCTION update_point_slug();