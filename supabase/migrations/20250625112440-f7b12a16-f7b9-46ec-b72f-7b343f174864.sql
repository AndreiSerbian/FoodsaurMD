
-- Создаём таблицу producers
CREATE TABLE IF NOT EXISTS public.producers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включаем RLS
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;

-- Создаём политику для чтения (например, только для админов)
CREATE POLICY "Admin can view all producers" ON public.producers
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Создаём политику для вставки
CREATE POLICY "Anyone can insert producers" ON public.producers
  FOR INSERT WITH CHECK (true);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_producers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для updated_at
CREATE TRIGGER producers_updated_at
  BEFORE UPDATE ON public.producers
  FOR EACH ROW
  EXECUTE FUNCTION update_producers_updated_at();

-- Функция триггера для уведомлений о новых производителях
CREATE OR REPLACE FUNCTION notify_new_producer()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Функция триггера для уведомлений о подтверждённых производителях
CREATE OR REPLACE FUNCTION notify_confirmed_producer()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Триггер для новых производителей
CREATE TRIGGER producers_new_notification
  AFTER INSERT ON public.producers
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_producer();

-- Триггер для подтверждённых производителей
CREATE TRIGGER producers_confirmed_notification
  AFTER UPDATE ON public.producers
  FOR EACH ROW
  EXECUTE FUNCTION notify_confirmed_producer();
