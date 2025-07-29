-- Добавляем внешние ключи для связей между таблицами

-- Связь products -> producer_profiles
ALTER TABLE products 
ADD CONSTRAINT fk_products_producer_id 
FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;

-- Связь product_images -> products
ALTER TABLE product_images 
ADD CONSTRAINT fk_product_images_product_id 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Связь producer_categories -> producer_profiles
ALTER TABLE producer_categories 
ADD CONSTRAINT fk_producer_categories_producer_id 
FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;

-- Связь producer_categories -> categories
ALTER TABLE producer_categories 
ADD CONSTRAINT fk_producer_categories_category_id 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

-- Связь pickup_points -> producer_profiles
ALTER TABLE pickup_points 
ADD CONSTRAINT fk_pickup_points_producer_id 
FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;

-- Связь pickup_point_products -> pickup_points
ALTER TABLE pickup_point_products 
ADD CONSTRAINT fk_pickup_point_products_pickup_point_id 
FOREIGN KEY (pickup_point_id) REFERENCES pickup_points(id) ON DELETE CASCADE;

-- Связь pickup_point_products -> products
ALTER TABLE pickup_point_products 
ADD CONSTRAINT fk_pickup_point_products_product_id 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Связь pre_orders -> pickup_points
ALTER TABLE pre_orders 
ADD CONSTRAINT fk_pre_orders_pickup_point_id 
FOREIGN KEY (pickup_point_id) REFERENCES pickup_points(id) ON DELETE CASCADE;

-- Связь pre_order_items -> pre_orders
ALTER TABLE pre_order_items 
ADD CONSTRAINT fk_pre_order_items_pre_order_id 
FOREIGN KEY (pre_order_id) REFERENCES pre_orders(id) ON DELETE CASCADE;

-- Связь pre_order_items -> products
ALTER TABLE pre_order_items 
ADD CONSTRAINT fk_pre_order_items_product_id 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Связь producer_telegram_settings -> producer_profiles
ALTER TABLE producer_telegram_settings 
ADD CONSTRAINT fk_producer_telegram_settings_producer_id 
FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;