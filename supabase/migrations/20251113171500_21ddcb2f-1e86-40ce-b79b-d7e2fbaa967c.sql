
-- Обновляем URL изображений для продуктов Kislo-i-sladko
-- Меняем заглавную K на маленькую k в путях

UPDATE product_images
SET image_url = REPLACE(image_url, '/Kislo-i-sladko/', '/kislo-i-sladko/')
WHERE image_url LIKE '%/Kislo-i-sladko/%';

-- Также обновляем поле exterior_image_url в producer_profiles если есть
UPDATE producer_profiles
SET exterior_image_url = REPLACE(exterior_image_url, '/Kislo-i-sladko/', '/kislo-i-sladko/')
WHERE exterior_image_url LIKE '%/Kislo-i-sladko/%';

UPDATE producer_profiles
SET interior_image_url = REPLACE(interior_image_url, '/Kislo-i-sladko/', '/kislo-i-sladko/')
WHERE interior_image_url LIKE '%/Kislo-i-sladko/%';

UPDATE producer_profiles
SET logo_url = REPLACE(logo_url, '/Kislo-i-sladko/', '/kislo-i-sladko/')
WHERE logo_url LIKE '%/Kislo-i-sladko/%';
