-- Remove duplicate foreign key constraints to fix relationship embedding issues

-- Drop the older duplicate constraints
ALTER TABLE producer_categories DROP CONSTRAINT IF EXISTS producer_categories_producer_id_fkey;
ALTER TABLE producer_categories DROP CONSTRAINT IF EXISTS producer_categories_category_id_fkey;

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_producer_id_fkey;
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_producer_id;

ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS fk_product_images_product_id;