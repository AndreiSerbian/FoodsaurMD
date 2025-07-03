
-- Удаляем дублирующую таблицу producer_products, но сначала переносим данные в products
-- Переносим данные из producer_products в products (если они есть)
INSERT INTO products (id, producer_id, name, description, price_regular, price_discount, quantity, in_stock, created_at, updated_at)
SELECT 
  id, 
  producer_id, 
  name, 
  COALESCE(description, ''), 
  price_regular, 
  price_discount, 
  quantity, 
  true, -- in_stock по умолчанию
  created_at, 
  updated_at
FROM producer_products
WHERE id NOT IN (SELECT id FROM products)
ON CONFLICT (id) DO NOTHING;

-- Переносим изображения из producer_products в product_images
INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT 
  id, 
  image_url, 
  true, -- делаем первичным
  created_at
FROM producer_products 
WHERE image_url IS NOT NULL 
  AND id NOT IN (SELECT product_id FROM product_images WHERE image_url = producer_products.image_url)
ON CONFLICT DO NOTHING;

-- Удаляем дублирующую таблицу producer_products
DROP TABLE IF EXISTS producer_products CASCADE;

-- Оптимизируем таблицу producers - делаем её таблицей заявок
-- Добавляем поле для связи с основным профилем после подтверждения
ALTER TABLE producers 
ADD COLUMN IF NOT EXISTS producer_profile_id UUID REFERENCES producer_profiles(id);

-- Добавляем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_producers_status ON producers(status);
CREATE INDEX IF NOT EXISTS idx_producers_email ON producers(email);
CREATE INDEX IF NOT EXISTS idx_producer_profiles_user_id ON producer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_products_producer_id ON products(producer_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- Добавляем ограничение целостности данных
ALTER TABLE products 
ADD CONSTRAINT fk_products_producer_profiles 
FOREIGN KEY (producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE;

ALTER TABLE product_images 
ADD CONSTRAINT fk_product_images_products 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Оптимизируем структуру категорий - добавляем связь многие-ко-многим
CREATE TABLE IF NOT EXISTS producer_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID REFERENCES producer_profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(producer_id, category_id)
);

-- Переносим данные из массива categories в связующую таблицу
INSERT INTO producer_categories (producer_id, category_id)
SELECT 
  pp.id,
  c.id
FROM producer_profiles pp
CROSS JOIN LATERAL unnest(pp.categories) AS cat_slug
JOIN categories c ON c.slug = cat_slug
WHERE pp.categories IS NOT NULL
ON CONFLICT (producer_id, category_id) DO NOTHING;

-- Создаем индекс для связующей таблицы
CREATE INDEX IF NOT EXISTS idx_producer_categories_producer_id ON producer_categories(producer_id);
CREATE INDEX IF NOT EXISTS idx_producer_categories_category_id ON producer_categories(category_id);

-- Добавляем RLS политику для новой таблицы
ALTER TABLE producer_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view producer categories" ON producer_categories
  FOR SELECT USING (true);

CREATE POLICY "Producers can manage their categories" ON producer_categories
  FOR ALL USING (
    producer_id IN (
      SELECT id FROM producer_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all producer categories" ON producer_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
