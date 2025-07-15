-- Создание таблицы точек продаж
CREATE TABLE public.pickup_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID NOT NULL REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  working_hours_from TIME,
  working_hours_to TIME,
  discount_available_from TIME,
  discount_available_to TIME,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создание таблицы товаров по точкам
CREATE TABLE public.pickup_point_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pickup_point_id UUID NOT NULL REFERENCES public.pickup_points(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pickup_point_id, product_id)
);

-- Создание таблицы предзаказов
CREATE TABLE public.pre_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_code TEXT NOT NULL UNIQUE,
  pickup_point_id UUID NOT NULL REFERENCES public.pickup_points(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'completed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создание таблицы товаров в предзаказе
CREATE TABLE public.pre_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pre_order_id UUID NOT NULL REFERENCES public.pre_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price_regular DECIMAL(10,2) NOT NULL,
  price_discount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создание таблицы настроек Telegram
CREATE TABLE public.producer_telegram_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID NOT NULL REFERENCES public.producer_profiles(id) ON DELETE CASCADE UNIQUE,
  bot_token TEXT,
  chat_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Индексы для производительности
CREATE INDEX idx_pickup_points_producer_id ON public.pickup_points(producer_id);
CREATE INDEX idx_pickup_point_products_pickup_point_id ON public.pickup_point_products(pickup_point_id);
CREATE INDEX idx_pickup_point_products_product_id ON public.pickup_point_products(product_id);
CREATE INDEX idx_pre_orders_order_code ON public.pre_orders(order_code);
CREATE INDEX idx_pre_orders_pickup_point_id ON public.pre_orders(pickup_point_id);
CREATE INDEX idx_pre_orders_status ON public.pre_orders(status);
CREATE INDEX idx_pre_orders_pickup_time ON public.pre_orders(pickup_time);
CREATE INDEX idx_pre_order_items_pre_order_id ON public.pre_order_items(pre_order_id);

-- RLS политики для pickup_points
ALTER TABLE public.pickup_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pickup points are publicly readable" 
ON public.pickup_points 
FOR SELECT 
USING (true);

CREATE POLICY "Producers can manage their pickup points" 
ON public.pickup_points 
FOR ALL 
USING (producer_id IN (
  SELECT id FROM public.producer_profiles 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all pickup points" 
ON public.pickup_points 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS политики для pickup_point_products
ALTER TABLE public.pickup_point_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pickup point products are publicly readable" 
ON public.pickup_point_products 
FOR SELECT 
USING (true);

CREATE POLICY "Producers can manage their pickup point products" 
ON public.pickup_point_products 
FOR ALL 
USING (pickup_point_id IN (
  SELECT pp.id FROM public.pickup_points pp
  JOIN public.producer_profiles ppr ON pp.producer_id = ppr.id
  WHERE ppr.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all pickup point products" 
ON public.pickup_point_products 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS политики для pre_orders
ALTER TABLE public.pre_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create pre-orders" 
ON public.pre_orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Producers can view their pickup point orders" 
ON public.pre_orders 
FOR SELECT 
USING (pickup_point_id IN (
  SELECT pp.id FROM public.pickup_points pp
  JOIN public.producer_profiles ppr ON pp.producer_id = ppr.id
  WHERE ppr.user_id = auth.uid()
));

CREATE POLICY "Producers can update their pickup point orders" 
ON public.pre_orders 
FOR UPDATE 
USING (pickup_point_id IN (
  SELECT pp.id FROM public.pickup_points pp
  JOIN public.producer_profiles ppr ON pp.producer_id = ppr.id
  WHERE ppr.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all pre-orders" 
ON public.pre_orders 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS политики для pre_order_items
ALTER TABLE public.pre_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create pre-order items" 
ON public.pre_order_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Producers can view their pre-order items" 
ON public.pre_order_items 
FOR SELECT 
USING (pre_order_id IN (
  SELECT po.id FROM public.pre_orders po
  JOIN public.pickup_points pp ON po.pickup_point_id = pp.id
  JOIN public.producer_profiles ppr ON pp.producer_id = ppr.id
  WHERE ppr.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all pre-order items" 
ON public.pre_order_items 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS политики для producer_telegram_settings
ALTER TABLE public.producer_telegram_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers can manage their telegram settings" 
ON public.producer_telegram_settings 
FOR ALL 
USING (producer_id IN (
  SELECT id FROM public.producer_profiles 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all telegram settings" 
ON public.producer_telegram_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Триггеры для обновления updated_at
CREATE TRIGGER update_pickup_points_updated_at
BEFORE UPDATE ON public.pickup_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pickup_point_products_updated_at
BEFORE UPDATE ON public.pickup_point_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pre_orders_updated_at
BEFORE UPDATE ON public.pre_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_producer_telegram_settings_updated_at
BEFORE UPDATE ON public.producer_telegram_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Функция генерации уникального кода заказа
CREATE OR REPLACE FUNCTION public.generate_order_code(length_param INTEGER DEFAULT 8)
RETURNS TEXT
LANGUAGE plpgsql
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