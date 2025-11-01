-- Удаляем дублирующиеся RLS политики на producer_profiles
DROP POLICY IF EXISTS "Producers can create their own profile" ON public.producer_profiles;
DROP POLICY IF EXISTS "Producers can insert their own profile" ON public.producer_profiles;

-- Удаляем объекты из неиспользуемых бакетов перед удалением самих бакетов
DELETE FROM storage.objects WHERE bucket_id = 'produsers';
DELETE FROM storage.objects WHERE bucket_id = 'product-images';

-- Теперь удаляем сами бакеты
DELETE FROM storage.buckets WHERE id = 'produsers';
DELETE FROM storage.buckets WHERE id = 'product-images';

-- Добавляем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pre_orders_order_code ON public.pre_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_point_inventory_point_product ON public.point_inventory(point_id, product_id);

-- Таблица для rate limiting (защита от спама)
CREATE TABLE IF NOT EXISTS public.order_rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  order_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_window ON public.order_rate_limit(ip_address, window_start);

ALTER TABLE public.order_rate_limit ENABLE ROW LEVEL SECURITY;

-- Комментарии для документации
COMMENT ON TABLE public.orders IS 'Customer orders - anonymous creation allowed with captcha verification';
COMMENT ON TABLE public.pre_orders IS 'Pre-orders - anonymous creation allowed with captcha verification';
COMMENT ON COLUMN public.orders.customer_phone IS 'Optional contact - not required for order creation';
COMMENT ON COLUMN public.orders.customer_name IS 'Optional contact - not required for order creation';