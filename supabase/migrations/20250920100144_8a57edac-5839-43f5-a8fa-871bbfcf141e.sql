-- First, let's check the current structure and add missing columns to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS sku text;

-- Remove price fields from products table (global catalog should have no prices)
ALTER TABLE public.products DROP COLUMN IF EXISTS price_unit;

-- Create indexes for products
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active) WHERE is_active = true;

-- Ensure point_products table exists with correct structure
CREATE TABLE IF NOT EXISTS public.point_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  point_id uuid NOT NULL REFERENCES public.pickup_points(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  price_regular numeric(12,2) NOT NULL CHECK (price_regular > 0),
  price_discount numeric(12,2) CHECK (price_discount IS NULL OR price_discount < price_regular),
  discount_start timestamptz,
  discount_end timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(point_id, product_id)
);

-- Add constraint for discount period validation
ALTER TABLE public.point_products 
ADD CONSTRAINT check_discount_period 
CHECK (
  (discount_start IS NULL AND discount_end IS NULL) OR 
  (discount_start IS NOT NULL AND discount_end IS NOT NULL AND discount_start < discount_end)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_point_products_point ON public.point_products(point_id, is_active);
CREATE INDEX IF NOT EXISTS idx_point_products_product ON public.point_products(product_id);
CREATE INDEX IF NOT EXISTS idx_point_products_discount ON public.point_products(discount_start, discount_end) WHERE discount_start IS NOT NULL;

-- Enable RLS on point_products if not already enabled
ALTER TABLE public.point_products ENABLE ROW LEVEL SECURITY;

-- Update products table to have proper default values
UPDATE public.products SET 
  images = '[]'::jsonb WHERE images IS NULL,
  is_active = true WHERE is_active IS NULL;