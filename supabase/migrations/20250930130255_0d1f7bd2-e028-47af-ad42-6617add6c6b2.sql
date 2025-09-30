-- Добавляем таблицу для Telegram настроек точек выдачи
CREATE TABLE IF NOT EXISTS public.point_telegram_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  point_id UUID NOT NULL REFERENCES public.pickup_points(id) ON DELETE CASCADE,
  chat_id TEXT,
  bot_token TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(point_id)
);

-- Enable RLS
ALTER TABLE public.point_telegram_settings ENABLE ROW LEVEL SECURITY;

-- Producers can manage their points' telegram settings
CREATE POLICY "Producers can manage their points telegram settings"
ON public.point_telegram_settings
FOR ALL
USING (
  point_id IN (
    SELECT pp.id FROM public.pickup_points pp
    JOIN public.producer_profiles ppr ON pp.producer_id = ppr.id
    WHERE ppr.user_id = auth.uid()
  )
);

-- Admins can manage all telegram settings
CREATE POLICY "Admins can manage all point telegram settings"
ON public.point_telegram_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update trigger for updated_at
CREATE TRIGGER update_point_telegram_settings_updated_at
BEFORE UPDATE ON public.point_telegram_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();