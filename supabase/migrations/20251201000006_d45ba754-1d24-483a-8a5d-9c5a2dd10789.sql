-- Drop duplicate foreign key constraints on order_items table
-- Keep the newer fk_* named constraints, remove the old *_fkey ones

ALTER TABLE public.order_items 
  DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

ALTER TABLE public.order_items 
  DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;