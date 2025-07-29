-- Fix duplicate foreign key relationships that are causing embedding issues

-- Check and drop duplicate foreign keys for producer_categories table
DO $$ 
BEGIN
    -- Drop duplicate foreign key constraints if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'producer_categories_producer_id_fkey' 
               AND table_name = 'producer_categories') THEN
        ALTER TABLE producer_categories DROP CONSTRAINT IF EXISTS producer_categories_producer_id_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'producer_categories_category_id_fkey' 
               AND table_name = 'producer_categories') THEN
        ALTER TABLE producer_categories DROP CONSTRAINT IF EXISTS producer_categories_category_id_fkey;
    END IF;
END $$;

-- Add proper foreign key constraints with unique names
ALTER TABLE producer_categories 
ADD CONSTRAINT fk_producer_categories_producer_id 
FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;

ALTER TABLE producer_categories 
ADD CONSTRAINT fk_producer_categories_category_id 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

-- Fix similar issues for products table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'products_producer_id_fkey' 
               AND table_name = 'products') THEN
        ALTER TABLE products DROP CONSTRAINT IF EXISTS products_producer_id_fkey;
    END IF;
END $$;

ALTER TABLE products 
ADD CONSTRAINT fk_products_producer_profiles 
FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;

-- Fix product_images table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'product_images_product_id_fkey' 
               AND table_name = 'product_images') THEN
        ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
    END IF;
END $$;

ALTER TABLE product_images 
ADD CONSTRAINT fk_product_images_products 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;