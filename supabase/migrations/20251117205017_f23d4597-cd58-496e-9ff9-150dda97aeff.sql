
-- Возвращаем правильный регистр для Kislo-i-sladko (с заглавной K)
UPDATE product_images
SET image_url = REPLACE(image_url, '/kislo-i-sladko/', '/Kislo-i-sladko/')
WHERE image_url LIKE '%/kislo-i-sladko/%';

-- Обновляем галерею производителя
UPDATE producer_gallery
SET image_url = REPLACE(image_url, '/kislo-i-sladko/', '/Kislo-i-sladko/')
WHERE image_url LIKE '%/kislo-i-sladko/%';
