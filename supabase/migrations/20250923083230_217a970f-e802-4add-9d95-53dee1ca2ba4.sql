-- Add missing price fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS price_regular NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_discount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS price_unit TEXT DEFAULT 'шт';