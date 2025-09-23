-- Phase 1: High Priority Database Optimization (Targeted Version)
-- Skip existing constraints and add only missing ones

-- Check and add foreign keys only if they don't exist
DO $$
BEGIN
    -- Products table foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_products_producer_id' AND table_name = 'products') 
    THEN
        ALTER TABLE products ADD CONSTRAINT fk_products_producer_id 
        FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;
    END IF;

    -- Orders foreign keys  
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_orders_producer_id' AND table_name = 'orders') 
    THEN
        ALTER TABLE orders ADD CONSTRAINT fk_orders_producer_id 
        FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_orders_point_id' AND table_name = 'orders') 
    THEN
        ALTER TABLE orders ADD CONSTRAINT fk_orders_point_id 
        FOREIGN KEY (point_id) REFERENCES pickup_points(id) ON DELETE CASCADE;
    END IF;

    -- Point inventory foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_point_inventory_point_id' AND table_name = 'point_inventory') 
    THEN
        ALTER TABLE point_inventory ADD CONSTRAINT fk_point_inventory_point_id 
        FOREIGN KEY (point_id) REFERENCES pickup_points(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_point_inventory_product_id' AND table_name = 'point_inventory') 
    THEN
        ALTER TABLE point_inventory ADD CONSTRAINT fk_point_inventory_product_id 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;

    -- Point variants foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_point_variants_point_id' AND table_name = 'point_variants') 
    THEN
        ALTER TABLE point_variants ADD CONSTRAINT fk_point_variants_point_id 
        FOREIGN KEY (point_id) REFERENCES pickup_points(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_point_variants_product_id' AND table_name = 'point_variants') 
    THEN
        ALTER TABLE point_variants ADD CONSTRAINT fk_point_variants_product_id 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;

    -- Pre-orders foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_pre_orders_pickup_point_id' AND table_name = 'pre_orders') 
    THEN
        ALTER TABLE pre_orders ADD CONSTRAINT fk_pre_orders_pickup_point_id 
        FOREIGN KEY (pickup_point_id) REFERENCES pickup_points(id) ON DELETE CASCADE;
    END IF;

    -- Pre-order items foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_pre_order_items_pre_order_id' AND table_name = 'pre_order_items') 
    THEN
        ALTER TABLE pre_order_items ADD CONSTRAINT fk_pre_order_items_pre_order_id 
        FOREIGN KEY (pre_order_id) REFERENCES pre_orders(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_pre_order_items_product_id' AND table_name = 'pre_order_items') 
    THEN
        ALTER TABLE pre_order_items ADD CONSTRAINT fk_pre_order_items_product_id 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;

    -- Order items foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_order_items_order_id' AND table_name = 'order_items') 
    THEN
        ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order_id 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_order_items_product_id' AND table_name = 'order_items') 
    THEN
        ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product_id 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;

    -- Discounts foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_discounts_product_id' AND table_name = 'discounts') 
    THEN
        ALTER TABLE discounts ADD CONSTRAINT fk_discounts_product_id 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;

    -- Producer categories foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_producer_categories_producer_id' AND table_name = 'producer_categories') 
    THEN
        ALTER TABLE producer_categories ADD CONSTRAINT fk_producer_categories_producer_id 
        FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_producer_categories_category_id' AND table_name = 'producer_categories') 
    THEN
        ALTER TABLE producer_categories ADD CONSTRAINT fk_producer_categories_category_id 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;
    END IF;

    -- Producer telegram settings foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_producer_telegram_settings_producer_id' AND table_name = 'producer_telegram_settings') 
    THEN
        ALTER TABLE producer_telegram_settings ADD CONSTRAINT fk_producer_telegram_settings_producer_id 
        FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;
    END IF;

    -- Producer time slots foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_producer_time_slots_producer_id' AND table_name = 'producer_time_slots') 
    THEN
        ALTER TABLE producer_time_slots ADD CONSTRAINT fk_producer_time_slots_producer_id 
        FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;
    END IF;

    -- Product images foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_product_images_product_id' AND table_name = 'product_images') 
    THEN
        ALTER TABLE product_images ADD CONSTRAINT fk_product_images_product_id 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;

END $$;

-- 2. Fix Security Functions - Add proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'producer');
  RETURN NEW;
END;
$$;

-- Update initialize_point_inventory to use bulk_qty instead of stock
CREATE OR REPLACE FUNCTION public.initialize_point_inventory(point_id_param uuid, producer_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  synced_count INTEGER := 0;
  product_record RECORD;
BEGIN
  FOR product_record IN 
    SELECT id, quantity 
    FROM products 
    WHERE producer_id = producer_id_param
  LOOP
    INSERT INTO point_inventory (point_id, product_id, bulk_qty, updated_at)
    VALUES (point_id_param, product_record.id, product_record.quantity, now())
    ON CONFLICT (point_id, product_id) 
    DO UPDATE SET 
      bulk_qty = EXCLUDED.bulk_qty,
      updated_at = EXCLUDED.updated_at;
    
    synced_count := synced_count + 1;
  END LOOP;
  
  RETURN synced_count;
END;
$$;

-- 3. Create Performance Indexes (with IF NOT EXISTS checks)
CREATE INDEX IF NOT EXISTS idx_products_producer_id ON products(producer_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);

CREATE INDEX IF NOT EXISTS idx_pickup_points_producer_id ON pickup_points(producer_id);
CREATE INDEX IF NOT EXISTS idx_pickup_points_is_active ON pickup_points(is_active);

CREATE INDEX IF NOT EXISTS idx_orders_producer_id ON orders(producer_id);
CREATE INDEX IF NOT EXISTS idx_orders_point_id ON orders(point_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_time ON orders(pickup_time);

CREATE INDEX IF NOT EXISTS idx_point_inventory_point_id ON point_inventory(point_id);
CREATE INDEX IF NOT EXISTS idx_point_inventory_product_id ON point_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_point_inventory_point_product ON point_inventory(point_id, product_id);

CREATE INDEX IF NOT EXISTS idx_point_variants_point_id ON point_variants(point_id);
CREATE INDEX IF NOT EXISTS idx_point_variants_product_id ON point_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_point_variants_is_active ON point_variants(is_active);

CREATE INDEX IF NOT EXISTS idx_pre_orders_pickup_point_id ON pre_orders(pickup_point_id);
CREATE INDEX IF NOT EXISTS idx_pre_orders_status ON pre_orders(status);
CREATE INDEX IF NOT EXISTS idx_pre_orders_pickup_time ON pre_orders(pickup_time);

CREATE INDEX IF NOT EXISTS idx_pre_order_items_pre_order_id ON pre_order_items(pre_order_id);
CREATE INDEX IF NOT EXISTS idx_pre_order_items_product_id ON pre_order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_discounts_product_id ON discounts(product_id);
CREATE INDEX IF NOT EXISTS idx_discounts_is_active ON discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_discounts_time_range ON discounts(start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_producer_categories_producer_id ON producer_categories(producer_id);
CREATE INDEX IF NOT EXISTS idx_producer_categories_category_id ON producer_categories(category_id);

CREATE INDEX IF NOT EXISTS idx_producer_telegram_settings_producer_id ON producer_telegram_settings(producer_id);
CREATE INDEX IF NOT EXISTS idx_producer_telegram_settings_is_active ON producer_telegram_settings(is_active);

CREATE INDEX IF NOT EXISTS idx_producer_time_slots_producer_id ON producer_time_slots(producer_id);
CREATE INDEX IF NOT EXISTS idx_producer_time_slots_is_active ON producer_time_slots(is_active);
CREATE INDEX IF NOT EXISTS idx_producer_time_slots_day ON producer_time_slots(day_of_week);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_producer_active ON products(producer_id, is_active);
CREATE INDEX IF NOT EXISTS idx_orders_producer_status ON orders(producer_id, status);
CREATE INDEX IF NOT EXISTS idx_point_inventory_stock_check ON point_inventory(point_id, product_id, bulk_qty);

-- Add unique constraints to prevent duplicates (with IF NOT EXISTS equivalent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'unique_point_inventory_point_product' 
                   AND table_name = 'point_inventory') 
    THEN
        ALTER TABLE point_inventory ADD CONSTRAINT unique_point_inventory_point_product 
        UNIQUE (point_id, product_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'unique_point_variants_point_product_variant' 
                   AND table_name = 'point_variants') 
    THEN
        ALTER TABLE point_variants ADD CONSTRAINT unique_point_variants_point_product_variant 
        UNIQUE (point_id, product_id, variant_name);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'unique_producer_categories_producer_category' 
                   AND table_name = 'producer_categories') 
    THEN
        ALTER TABLE producer_categories ADD CONSTRAINT unique_producer_categories_producer_category 
        UNIQUE (producer_id, category_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'unique_user_roles_user_role' 
                   AND table_name = 'user_roles') 
    THEN
        ALTER TABLE user_roles ADD CONSTRAINT unique_user_roles_user_role 
        UNIQUE (user_id, role);
    END IF;
END $$;