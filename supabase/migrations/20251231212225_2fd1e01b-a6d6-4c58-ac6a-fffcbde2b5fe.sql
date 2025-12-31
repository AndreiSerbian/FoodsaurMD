-- 1. Add order_code column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_code text;

-- 2. Create unique index on order_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_code 
ON public.orders(order_code) 
WHERE order_code IS NOT NULL;

-- 3. Migrate existing order codes from meta to the new column
UPDATE public.orders 
SET order_code = meta->>'order_code' 
WHERE order_code IS NULL AND meta->>'order_code' IS NOT NULL;

-- 4. Update generate_order_code function to check orders table
CREATE OR REPLACE FUNCTION public.generate_order_code(length_param integer DEFAULT 8)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  code TEXT;
  is_unique BOOLEAN := FALSE;
BEGIN
  WHILE NOT is_unique LOOP
    -- Generate random numeric code
    code := '';
    FOR i IN 1..length_param LOOP
      code := code || (FLOOR(RANDOM() * 10))::TEXT;
    END LOOP;
    
    -- Check uniqueness against orders table
    SELECT NOT EXISTS(SELECT 1 FROM public.orders WHERE order_code = code) INTO is_unique;
  END LOOP;
  
  RETURN code;
END;
$function$;

-- 5. Drop pre_order_items table first (has foreign key to pre_orders)
DROP TABLE IF EXISTS public.pre_order_items CASCADE;

-- 6. Drop pre_orders table
DROP TABLE IF EXISTS public.pre_orders CASCADE;