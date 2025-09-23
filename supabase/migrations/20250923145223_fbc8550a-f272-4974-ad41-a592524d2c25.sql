-- Phase 1: High Priority Database Optimization
-- 1. Add Foreign Key Constraints for Relational Integrity

-- Products table foreign keys
ALTER TABLE products 
ADD CONSTRAINT fk_products_producer_id 
FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;

-- Pickup points foreign keys
ALTER TABLE pickup_points 
ADD CONSTRAINT fk_pickup_points_producer_id 
FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;

-- Orders foreign keys
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_producer_id 
FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;

ALTER TABLE orders 
ADD CONSTRAINT fk_orders_point_id 
FOREIGN KEY (point_id) REFERENCES pickup_points(id) ON DELETE CASCADE;

-- Point inventory foreign keys
ALTER TABLE point_inventory 
ADD CONSTRAINT fk_point_inventory_point_id 
FOREIGN KEY (point_id) REFERENCES pickup_points(id) ON DELETE CASCADE;

ALTER TABLE point_inventory 
ADD CONSTRAINT fk_point_inventory_product_id 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Point variants foreign keys
ALTER TABLE point_variants 
ADD CONSTRAINT fk_point_variants_point_id 
FOREIGN KEY (point_id) REFERENCES pickup_points(id) ON DELETE CASCADE;

ALTER TABLE point_variants 
ADD CONSTRAINT fk_point_variants_product_id 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Pre-orders foreign keys
ALTER TABLE pre_orders 
ADD CONSTRAINT fk_pre_orders_pickup_point_id 
FOREIGN KEY (pickup_point_id) REFERENCES pickup_points(id) ON DELETE CASCADE;

-- Pre-order items foreign keys
ALTER TABLE pre_order_items 
ADD CONSTRAINT fk_pre_order_items_pre_order_id 
FOREIGN KEY (pre_order_id) REFERENCES pre_orders(id) ON DELETE CASCADE;

ALTER TABLE pre_order_items 
ADD CONSTRAINT fk_pre_order_items_product_id 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Order items foreign keys
ALTER TABLE order_items 
ADD CONSTRAINT fk_order_items_order_id 
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE order_items 
ADD CONSTRAINT fk_order_items_product_id 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Discounts foreign keys
ALTER TABLE discounts 
ADD CONSTRAINT fk_discounts_product_id 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Producer categories foreign keys
ALTER TABLE producer_categories 
ADD CONSTRAINT fk_producer_categories_producer_id 
FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;

ALTER TABLE producer_categories 
ADD CONSTRAINT fk_producer_categories_category_id 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

-- Producer telegram settings foreign keys
ALTER TABLE producer_telegram_settings 
ADD CONSTRAINT fk_producer_telegram_settings_producer_id 
FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;

-- Producer time slots foreign keys
ALTER TABLE producer_time_slots 
ADD CONSTRAINT fk_producer_time_slots_producer_id 
FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;

-- Product images foreign keys
ALTER TABLE product_images 
ADD CONSTRAINT fk_product_images_product_id 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

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
  -- Получаем все товары производителя
  FOR product_record IN 
    SELECT id, quantity 
    FROM products 
    WHERE producer_id = producer_id_param
  LOOP
    -- Вставляем или обновляем остатки в point_inventory
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

CREATE OR REPLACE FUNCTION public.rpc_create_preorder_and_decrement(order_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order_id UUID;
  _producer_id UUID;
  _point_id UUID;
  _user_id UUID;
  _customer_name TEXT;
  _customer_phone TEXT;
  _customer_email TEXT;
  _pickup_time TIMESTAMPTZ;
  _total_amount NUMERIC(12,2) := 0;
  _item JSONB;
  _product_data RECORD;
  _current_stock BIGINT;
BEGIN
  -- Извлекаем данные из payload
  _user_id := (order_payload->>'user_id')::UUID;
  _producer_id := (order_payload->>'producer_id')::UUID;
  _point_id := (order_payload->>'point_id')::UUID;
  _customer_name := order_payload->>'customer_name';
  _customer_phone := order_payload->>'customer_phone';
  _customer_email := order_payload->>'customer_email';
  _pickup_time := (order_payload->>'pickup_time')::TIMESTAMPTZ;

  -- Проверяем и блокируем остатки для каждого товара
  FOR _item IN SELECT * FROM jsonb_array_elements(order_payload->'items')
  LOOP
    -- Получаем данные товара
    SELECT p.* INTO _product_data
    FROM products p
    WHERE p.id = (_item->>'product_id')::UUID;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND: %', _item->>'product_id';
    END IF;

    -- Проверяем остаток в точке (с блокировкой)
    SELECT bulk_qty INTO _current_stock
    FROM point_inventory
    WHERE point_id = _point_id 
      AND product_id = (_item->>'product_id')::UUID
    FOR UPDATE;

    -- Если записи нет в point_inventory, используем общий остаток товара
    IF NOT FOUND THEN
      _current_stock := _product_data.quantity;
      
      -- Создаем запись в point_inventory если её нет
      INSERT INTO point_inventory (point_id, product_id, bulk_qty)
      VALUES (_point_id, (_item->>'product_id')::UUID, _product_data.quantity);
    END IF;

    -- Проверяем достаточность остатка
    IF _current_stock < (_item->>'qty')::INTEGER THEN
      RAISE EXCEPTION 'OUT_OF_STOCK: Product % has only % items available at this point', 
        _product_data.name, _current_stock;
    END IF;

    -- Вычисляем общую сумму
    _total_amount := _total_amount + ((_item->>'price')::NUMERIC * (_item->>'qty')::INTEGER);
  END LOOP;

  -- Создаем заказ
  INSERT INTO orders (
    user_id, producer_id, point_id, total_amount, 
    customer_name, customer_phone, customer_email, pickup_time,
    status
  ) VALUES (
    _user_id, _producer_id, _point_id, _total_amount,
    _customer_name, _customer_phone, _customer_email, _pickup_time,
    'preorder'
  ) RETURNING id INTO _order_id;

  -- Создаем позиции заказа и списываем остатки
  FOR _item IN SELECT * FROM jsonb_array_elements(order_payload->'items')
  LOOP
    -- Получаем данные товара для snapshot
    SELECT row_to_json(p.*) INTO _product_data
    FROM products p
    WHERE p.id = (_item->>'product_id')::UUID;

    -- Создаем позицию заказа
    INSERT INTO order_items (
      order_id, product_id, qty, price, subtotal, product_snapshot
    ) VALUES (
      _order_id,
      (_item->>'product_id')::UUID,
      (_item->>'qty')::INTEGER,
      (_item->>'price')::NUMERIC,
      ((_item->>'price')::NUMERIC * (_item->>'qty')::INTEGER),
      _product_data::JSONB
    );

    -- Списываем остаток
    UPDATE point_inventory
    SET bulk_qty = bulk_qty - (_item->>'qty')::INTEGER,
        updated_at = now()
    WHERE point_id = _point_id 
      AND product_id = (_item->>'product_id')::UUID;
  END LOOP;

  RETURN jsonb_build_object('order_id', _order_id, 'success', true);
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_cancel_preorder(order_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order_record RECORD;
  _item RECORD;
BEGIN
  -- Получаем данные заказа
  SELECT * INTO _order_record
  FROM orders
  WHERE id = order_id_param AND status = 'preorder';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND_OR_NOT_CANCELABLE';
  END IF;

  -- Возвращаем остатки по каждой позиции
  FOR _item IN 
    SELECT product_id, qty 
    FROM order_items 
    WHERE order_id = order_id_param
  LOOP
    -- Возвращаем остаток в point_inventory
    UPDATE point_inventory
    SET bulk_qty = bulk_qty + _item.qty,
        updated_at = now()
    WHERE point_id = _order_record.point_id 
      AND product_id = _item.product_id;

    -- Если записи нет, создаем её
    IF NOT FOUND THEN
      INSERT INTO point_inventory (point_id, product_id, bulk_qty, updated_at)
      VALUES (_order_record.point_id, _item.product_id, _item.qty, now());
    END IF;
  END LOOP;

  -- Обновляем статус заказа
  UPDATE orders
  SET status = 'cancelled', updated_at = now()
  WHERE id = order_id_param;

  RETURN jsonb_build_object('success', true, 'order_id', order_id_param);
END;
$$;

CREATE OR REPLACE FUNCTION public.atomic_inventory_deduction(p_point_id uuid, p_product_id uuid, p_deduct_amount bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_qty BIGINT;
  v_updated_rows INTEGER;
BEGIN
  -- Lock and get current quantity
  SELECT bulk_qty INTO v_current_qty
  FROM public.point_inventory
  WHERE point_id = p_point_id AND product_id = p_product_id
  FOR UPDATE;

  -- Check if record exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PRODUCT_NOT_FOUND',
      'message', 'Product not found in inventory'
    );
  END IF;

  -- Check if enough quantity available
  IF v_current_qty < p_deduct_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INSUFFICIENT_STOCK',
      'message', 'Insufficient stock available',
      'available', v_current_qty,
      'requested', p_deduct_amount
    );
  END IF;

  -- Perform atomic deduction
  UPDATE public.point_inventory
  SET bulk_qty = bulk_qty - p_deduct_amount,
      updated_at = now()
  WHERE point_id = p_point_id 
    AND product_id = p_product_id 
    AND bulk_qty >= p_deduct_amount;
  
  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

  -- Double-check update was successful
  IF v_updated_rows = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CONCURRENT_UPDATE',
      'message', 'Stock was modified by another transaction'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'deducted', p_deduct_amount,
    'remaining', v_current_qty - p_deduct_amount
  );
END;
$$;

-- 3. Create Performance Indexes on Foreign Key Columns

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_producer_id ON products(producer_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);

-- Pickup points indexes  
CREATE INDEX IF NOT EXISTS idx_pickup_points_producer_id ON pickup_points(producer_id);
CREATE INDEX IF NOT EXISTS idx_pickup_points_is_active ON pickup_points(is_active);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_producer_id ON orders(producer_id);
CREATE INDEX IF NOT EXISTS idx_orders_point_id ON orders(point_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_time ON orders(pickup_time);

-- Point inventory indexes
CREATE INDEX IF NOT EXISTS idx_point_inventory_point_id ON point_inventory(point_id);
CREATE INDEX IF NOT EXISTS idx_point_inventory_product_id ON point_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_point_inventory_point_product ON point_inventory(point_id, product_id);

-- Point variants indexes
CREATE INDEX IF NOT EXISTS idx_point_variants_point_id ON point_variants(point_id);
CREATE INDEX IF NOT EXISTS idx_point_variants_product_id ON point_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_point_variants_is_active ON point_variants(is_active);

-- Pre-orders indexes
CREATE INDEX IF NOT EXISTS idx_pre_orders_pickup_point_id ON pre_orders(pickup_point_id);
CREATE INDEX IF NOT EXISTS idx_pre_orders_status ON pre_orders(status);
CREATE INDEX IF NOT EXISTS idx_pre_orders_pickup_time ON pre_orders(pickup_time);

-- Pre-order items indexes
CREATE INDEX IF NOT EXISTS idx_pre_order_items_pre_order_id ON pre_order_items(pre_order_id);
CREATE INDEX IF NOT EXISTS idx_pre_order_items_product_id ON pre_order_items(product_id);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Discounts indexes
CREATE INDEX IF NOT EXISTS idx_discounts_product_id ON discounts(product_id);
CREATE INDEX IF NOT EXISTS idx_discounts_is_active ON discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_discounts_time_range ON discounts(start_time, end_time);

-- Producer categories indexes
CREATE INDEX IF NOT EXISTS idx_producer_categories_producer_id ON producer_categories(producer_id);
CREATE INDEX IF NOT EXISTS idx_producer_categories_category_id ON producer_categories(category_id);

-- Producer telegram settings indexes
CREATE INDEX IF NOT EXISTS idx_producer_telegram_settings_producer_id ON producer_telegram_settings(producer_id);
CREATE INDEX IF NOT EXISTS idx_producer_telegram_settings_is_active ON producer_telegram_settings(is_active);

-- Producer time slots indexes
CREATE INDEX IF NOT EXISTS idx_producer_time_slots_producer_id ON producer_time_slots(producer_id);
CREATE INDEX IF NOT EXISTS idx_producer_time_slots_is_active ON producer_time_slots(is_active);
CREATE INDEX IF NOT EXISTS idx_producer_time_slots_day ON producer_time_slots(day_of_week);

-- Product images indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Additional composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_producer_active ON products(producer_id, is_active);
CREATE INDEX IF NOT EXISTS idx_orders_producer_status ON orders(producer_id, status);
CREATE INDEX IF NOT EXISTS idx_point_inventory_stock_check ON point_inventory(point_id, product_id, bulk_qty);

-- Unique constraints to prevent duplicates
ALTER TABLE point_inventory ADD CONSTRAINT unique_point_inventory_point_product UNIQUE (point_id, product_id);
ALTER TABLE point_variants ADD CONSTRAINT unique_point_variants_point_product_variant UNIQUE (point_id, product_id, variant_name);
ALTER TABLE producer_categories ADD CONSTRAINT unique_producer_categories_producer_category UNIQUE (producer_id, category_id);
ALTER TABLE user_roles ADD CONSTRAINT unique_user_roles_user_role UNIQUE (user_id, role);