
-- Обновляем таблицу producer_profiles, добавляем telegram_handle и переименовываем brand_name в producer_name
ALTER TABLE producer_profiles 
ADD COLUMN IF NOT EXISTS telegram_handle TEXT,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Обновляем существующие записи, переименовываем brand_name в producer_name если нужно
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'producer_profiles' AND column_name = 'brand_name') THEN
        ALTER TABLE producer_profiles RENAME COLUMN brand_name TO producer_name;
    END IF;
END
$$;

-- Создаем таблицу products для товаров
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    producer_id UUID REFERENCES producer_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price_regular DECIMAL(10,2) NOT NULL,
    price_discount DECIMAL(10,2),
    quantity INTEGER NOT NULL DEFAULT 0,
    price_unit TEXT NOT NULL DEFAULT 'шт',
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу product_images для фотографий товаров
CREATE TABLE IF NOT EXISTS product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включаем RLS для products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Создаем политики RLS для products
CREATE POLICY "Producers can view their own products" ON products
    FOR SELECT USING (
        producer_id IN (
            SELECT id FROM producer_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Producers can insert their own products" ON products
    FOR INSERT WITH CHECK (
        producer_id IN (
            SELECT id FROM producer_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Producers can update their own products" ON products
    FOR UPDATE USING (
        producer_id IN (
            SELECT id FROM producer_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Producers can delete their own products" ON products
    FOR DELETE USING (
        producer_id IN (
            SELECT id FROM producer_profiles WHERE user_id = auth.uid()
        )
    );

-- Политики для админов
CREATE POLICY "Admins can manage all products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Включаем RLS для product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Создаем политики RLS для product_images
CREATE POLICY "Users can view product images" ON product_images
    FOR SELECT USING (true);

CREATE POLICY "Producers can manage images of their products" ON product_images
    FOR ALL USING (
        product_id IN (
            SELECT id FROM products 
            WHERE producer_id IN (
                SELECT id FROM producer_profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can manage all product images" ON product_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Создаем storage bucket для изображений товаров
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Создаем политики для storage bucket
CREATE POLICY "Anyone can view product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own product images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete their own product images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' AND 
        auth.role() = 'authenticated'
    );

-- Добавляем триггер для updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
