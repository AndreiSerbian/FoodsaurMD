-- Update product image URLs for Kislo-i-sladko to use correct file naming with underscores
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Kislo-i-sladko/Products/medeterian-paine/medeterian_paine.jpg'
WHERE id = '1a455c9b-580e-4fd5-927d-8dc309bccf6d';

UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Kislo-i-sladko/Products/orz-paina/orz_paina.jpg'
WHERE id = 'e9c7e42b-463e-4fc9-a541-9db15da075ba';

UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Kislo-i-sladko/Products/ruleu-de-seminte-de-mac/ruleu_de_seminte_de_mac.jpg'
WHERE id = 'b865cae5-31be-42c5-9640-3ede0e10f5b7';

UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Kislo-i-sladko/Products/paine-secara-grau/paine_secara_grau.jpg'
WHERE id = 'c8daf2a9-dfca-49dd-b6db-fbf0b5df5b17';