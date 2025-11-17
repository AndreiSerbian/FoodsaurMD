
-- Создаем таблицу для галереи производителя
CREATE TABLE IF NOT EXISTS public.producer_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID NOT NULL REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  image_type TEXT NOT NULL DEFAULT 'other' CHECK (image_type IN ('exterior', 'interior', 'product', 'team', 'atmosphere', 'other')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем индекс для быстрого поиска по производителю
CREATE INDEX idx_producer_gallery_producer_id ON public.producer_gallery(producer_id);
CREATE INDEX idx_producer_gallery_display_order ON public.producer_gallery(producer_id, display_order);

-- Enable RLS
ALTER TABLE public.producer_gallery ENABLE ROW LEVEL SECURITY;

-- RLS политики для чтения (публичные)
CREATE POLICY "Gallery images are publicly readable"
ON public.producer_gallery
FOR SELECT
USING (true);

-- RLS политики для производителей (управление своими фото)
CREATE POLICY "Producers can manage their gallery"
ON public.producer_gallery
FOR ALL
USING (
  producer_id IN (
    SELECT id FROM producer_profiles WHERE user_id = auth.uid()
  )
);

-- RLS политики для администраторов
CREATE POLICY "Admins can manage all galleries"
ON public.producer_gallery
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Триггер для обновления updated_at
CREATE TRIGGER update_producer_gallery_updated_at
  BEFORE UPDATE ON public.producer_gallery
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Мигрируем существующие exterior/interior фото из producer_profiles
INSERT INTO public.producer_gallery (producer_id, image_url, image_type, display_order, caption)
SELECT 
  id,
  exterior_image_url,
  'exterior',
  1,
  'Exterior photo'
FROM public.producer_profiles
WHERE exterior_image_url IS NOT NULL;

INSERT INTO public.producer_gallery (producer_id, image_url, image_type, display_order, caption)
SELECT 
  id,
  interior_image_url,
  'interior',
  2,
  'Interior photo'
FROM public.producer_profiles
WHERE interior_image_url IS NOT NULL;
