-- Fix remaining security functions that need SET search_path = public

CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT lower(
    regexp_replace(
      regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_producers_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_producer_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.producer_name);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_pickup_point_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(replace(regexp_replace(coalesce(NEW.title, NEW.address), '[^a-zA-Z0-9\s-]', '', 'g'), ' ', '-'));
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_confirmed_producer()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Проверяем, что статус изменился с не-confirmed на confirmed
  IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
    -- Вызываем Edge Function для уведомления о подтверждении
    PERFORM net.http_post(
      url := 'https://qpljdodpbygbwnskuxsq.supabase.co/functions/v1/producer-notification',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbGpkb2RwYnlnYnduc2t1eHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjc5MjQsImV4cCI6MjA2MzcwMzkyNH0.BRwlCfQrqXChl1u0z5f8NRH6fYU0MXYsYOolE4jwcps"}'::jsonb,
      body := json_build_object(
        'event_type', 'confirmed_producer',
        'producer_id', NEW.id,
        'company_name', NEW.company_name,
        'email', NEW.email
      )::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_new_producer()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Вызываем Edge Function для уведомления о новом производителе
  PERFORM net.http_post(
    url := 'https://qpljdodpbygbwnskuxsq.supabase.co/functions/v1/producer-notification',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbGpkb2RwYnlnYnduc2t1eHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjc5MjQsImV4cCI6MjA2MzcwMzkyNH0.BRwlCfQrqXChl1u0z5f8NRH6fYU0MXYsYOolE4jwcps"}'::jsonb,
    body := json_build_object(
      'event_type', 'new_producer',
      'producer_id', NEW.id,
      'company_name', NEW.company_name,
      'email', NEW.email,
      'phone', NEW.phone
    )::jsonb
  );
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_order_code(length_param integer DEFAULT 8)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  code TEXT;
  is_unique BOOLEAN := FALSE;
BEGIN
  WHILE NOT is_unique LOOP
    -- Генерируем случайный код из цифр
    code := '';
    FOR i IN 1..length_param LOOP
      code := code || (FLOOR(RANDOM() * 10))::TEXT;
    END LOOP;
    
    -- Проверяем уникальность
    SELECT NOT EXISTS(SELECT 1 FROM public.pre_orders WHERE order_code = code) INTO is_unique;
  END LOOP;
  
  RETURN code;
END;
$$;