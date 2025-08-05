-- Исправляем URL'ы изображений для Retro Bakery products на основе реальных файлов в storage

-- Ursuleț Olimpic - файл урsulet_olimpic.jpg, а не .jpeg
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/ursulet-olimpic/ursulet_olimpic.jpg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Ursuleț Olimpic') 
AND is_primary = true;

-- Saralii cu brânză de vaci și verdeață - файл saralii_branza_verdeata.jpeg
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/saralii-cu-branza-de-vaci-si-verdeta/saralii_branza_verdeata.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Saralii cu brânză de vaci și verdeață') 
AND is_primary = true;

-- Обновляем дополнительное изображение
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/saralii-cu-branza-de-vaci-si-verdeta/saralii_branza_verdeata_1.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Saralii cu brânză de vaci și verdeață') 
AND is_primary = false;

-- Plăcintă prăjită cu brânză și verdeață - файл placinta_prajita_branza_verdeata.jpeg
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/placinta-prajita-cu-branza-si-verdeta/placinta_prajita_branza_verdeata.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Plăcintă prăjită cu brânză și verdeață') 
AND is_primary = true;

-- Добавляем дополнительное изображение
INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  (SELECT id FROM products WHERE name = 'Plăcintă prăjită cu brânză și verdeață'),
  'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/placinta-prajita-cu-branza-si-verdeta/placinta_prajita_branza_verdeata_1.jpeg',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM product_images 
  WHERE product_id = (SELECT id FROM products WHERE name = 'Plăcintă prăjită cu brânză și verdeață')
  AND image_url LIKE '%placinta_prajita_branza_verdeata_1.jpeg'
);

-- Pateu cu carne vită-porc (Beleaș) - файл pateu_vita_porc_beleas.jpeg
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/pateu-cu-carne-vita-porc-beleas/pateu_vita_porc_beleas.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Pateu cu carne vită-porc (Beleaș)') 
AND is_primary = true;

-- Добавляем дополнительные изображения
INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  (SELECT id FROM products WHERE name = 'Pateu cu carne vită-porc (Beleaș)'),
  'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/pateu-cu-carne-vita-porc-beleas/pateu_vita_porc_beleas_1.jpeg',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM product_images 
  WHERE product_id = (SELECT id FROM products WHERE name = 'Pateu cu carne vită-porc (Beleaș)')
  AND image_url LIKE '%pateu_vita_porc_beleas_1.jpeg'
);

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  (SELECT id FROM products WHERE name = 'Pateu cu carne vită-porc (Beleaș)'),
  'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/pateu-cu-carne-vita-porc-beleas/pateu_vita_porc_beleas_2.jpeg',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM product_images 
  WHERE product_id = (SELECT id FROM products WHERE name = 'Pateu cu carne vită-porc (Beleaș)')
  AND image_url LIKE '%pateu_vita_porc_beleas_2.jpeg'
);

-- Pâine de casă cu maia din hamei și făină albă - файл paine_maia_hamei_faina_alba.jpeg
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/paine-de-casa-cu-maia-din-hamei-si-faina-alba/paine_maia_hamei_faina_alba.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Pâine de casă cu maia din hamei și făină albă') 
AND is_primary = true;

-- Обновляем дополнительное изображение
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/paine-de-casa-cu-maia-din-hamei-si-faina-alba/paine_maia_hamei_faina_alba_1.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Pâine de casă cu maia din hamei și făină albă') 
AND is_primary = false;