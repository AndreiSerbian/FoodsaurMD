-- Исправляем URL для проблемных продуктов Retro Bakery (заменяем пробелы на %20)

-- Pâine de casă cu maia din hamei și făină albă
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/paine-de-casa-cu-maia-din-hamei-si-faina-alba/paine_casa_maia_hamei_faina_alba.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Pâine de casă cu maia din hamei și făină albă') 
AND is_primary = true;

UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/paine-de-casa-cu-maia-din-hamei-si-faina-alba/paine_casa_maia_hamei_faina_alba_1.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Pâine de casă cu maia din hamei și făină albă') 
AND image_url LIKE '%paine_casa_maia_hamei_faina_alba_1.jpeg';

-- Plăcintă prăjită cu brânză și verdeață
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/placinta-prajita-cu-branza-si-verdeta/placinta_prajita_branza_verdeta.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Plăcintă prăjită cu brânză și verdeață') 
AND is_primary = true;

-- Ursuleț Olimpic  
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/ursulet-olimpic/ursulet_olimpic.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Ursuleț Olimpic') 
AND is_primary = true;

-- Saralii cu brânză de vaci și verdeață
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/saralii-cu-branza-de-vaci-si-verdeta/saralii_branza_vaci_verdeta.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Saralii cu brânză de vaci și verdeață') 
AND is_primary = true;

UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/saralii-cu-branza-de-vaci-si-verdeta/saralii_branza_vaci_verdeta_1.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Saralii cu brânză de vaci și verdeață') 
AND image_url LIKE '%saralii_branza_vaci_verdeta_1.jpeg';

-- Pateu cu carne vită-porc (Beleaș)
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/pateu-cu-carne-vita-porc-beleas/pateu_carne_vita_porc_beleas.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Pateu cu carne vită-porc (Beleaș)') 
AND is_primary = true;