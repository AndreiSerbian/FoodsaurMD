-- Fix image URLs for Retro Bakery products to use correct produsers bucket
UPDATE product_images 
SET image_url = REPLACE(image_url, 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/product-images/', 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/produsers/')
WHERE product_id IN (
  SELECT p.id 
  FROM products p 
  JOIN producer_profiles pp ON p.producer_id = pp.id 
  WHERE pp.producer_name = 'Retro Bakery'
);