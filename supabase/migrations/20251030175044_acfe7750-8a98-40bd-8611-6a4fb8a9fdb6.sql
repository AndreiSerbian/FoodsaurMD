-- Обновляем URL изображений для продуктов Кисло и Сладко с правильными путями к файлам в папках

UPDATE product_images
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Kislo-i-sladko/Products/babka/babka.jpg'
WHERE id = '18ba94d8-8eea-4315-9d7d-3df2946d4448';

UPDATE product_images
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Kislo-i-sladko/Products/medeterian-paine/medeterian-paine.jpg'
WHERE id = '1a455c9b-580e-4fd5-927d-8dc309bccf6d';

UPDATE product_images
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Kislo-i-sladko/Products/orz-paina/orz-paina.jpg'
WHERE id = 'e9c7e42b-463e-4fc9-a541-9db15da075ba';

UPDATE product_images
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Kislo-i-sladko/Products/paine-secara-grau/paine-secara-grau.jpg'
WHERE id = 'c8daf2a9-dfca-49dd-b6db-fbf0b5df5b17';

UPDATE product_images
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Kislo-i-sladko/Products/ruleu-de-seminte-de-mac/ruleu-de-seminte-de-mac.jpg'
WHERE id = 'b865cae5-31be-42c5-9640-3ede0e10f5b7';