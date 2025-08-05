-- Обновляем изображения для продуктов Retro Bakery из Supabase Storage

-- Babă Neagră ca la Nord
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/baba-neagra-ca-la-nord/baba_neagra_nord.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Babă Neagră ca la Nord') 
AND is_primary = true;

-- Добавляем дополнительные изображения для Babă Neagră ca la Nord
INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  (SELECT id FROM products WHERE name = 'Babă Neagră ca la Nord'),
  'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/baba-neagra-ca-la-nord/baba_neagra_nord_1.jpeg',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM product_images 
  WHERE product_id = (SELECT id FROM products WHERE name = 'Babă Neagră ca la Nord')
  AND image_url LIKE '%baba_neagra_nord_1.jpeg'
);

-- Biscuiți Băieți (Cornulețe) cu vișină
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/biscuiti-baieti-cornulete-cu-visina/cornulete_visina.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Biscuiți Băieți (Cornulețe) cu vișină') 
AND is_primary = true;

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  (SELECT id FROM products WHERE name = 'Biscuiți Băieți (Cornulețe) cu vișină'),
  'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/biscuiti-baieti-cornulete-cu-visina/cornulete_visina1.jpeg',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM product_images 
  WHERE product_id = (SELECT id FROM products WHERE name = 'Biscuiți Băieți (Cornulețe) cu vișină')
  AND image_url LIKE '%cornulete_visina1.jpeg'
);

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  (SELECT id FROM products WHERE name = 'Biscuiți Băieți (Cornulețe) cu vișină'),
  'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/biscuiti-baieti-cornulete-cu-visina/cornulete_visina2.jpeg',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM product_images 
  WHERE product_id = (SELECT id FROM products WHERE name = 'Biscuiți Băieți (Cornulețe) cu vișină')
  AND image_url LIKE '%cornulete_visina2.jpeg'
);

-- Biscuiți Moldova cu vișine (Caștani)
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/biscuiti-moldova-cu-visine-castani/biscuiti_moldova_visina.jpg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Biscuiți Moldova cu vișine (Caștani)') 
AND is_primary = true;

-- Crenvuști în aluat "Covridog"
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/crenvusti-in-aluat-covridog/crenvusti_aluat_covridog.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Crenvuști în aluat "Covridog"') 
AND is_primary = true;

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  (SELECT id FROM products WHERE name = 'Crenvuști în aluat "Covridog"'),
  'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/crenvusti-in-aluat-covridog/crenvusti_aluat_covridog_1.jpeg',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM product_images 
  WHERE product_id = (SELECT id FROM products WHERE name = 'Crenvuști în aluat "Covridog"')
  AND image_url LIKE '%crenvusti_aluat_covridog_1.jpeg'
);

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  (SELECT id FROM products WHERE name = 'Crenvuști în aluat "Covridog"'),
  'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/crenvusti-in-aluat-covridog/crenvusti_aluat_covridog_2.jpeg',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM product_images 
  WHERE product_id = (SELECT id FROM products WHERE name = 'Crenvuști în aluat "Covridog"')
  AND image_url LIKE '%crenvusti_aluat_covridog_2.jpeg'
);

-- Învârtită cu vișină un suc propriu
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/invartita-cu-visina-un-suc-propriu/invartita_visina_suc_propriu.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Învârtită cu vișină un suc propriu') 
AND is_primary = true;

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  (SELECT id FROM products WHERE name = 'Învârtită cu vișină un suc propriu'),
  'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/invartita-cu-visina-un-suc-propriu/invartita_visina_suc_propriu_1.jpeg',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM product_images 
  WHERE product_id = (SELECT id FROM products WHERE name = 'Învârtită cu vișină un suc propriu')
  AND image_url LIKE '%invartita_visina_suc_propriu_1.jpeg'
);

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  (SELECT id FROM products WHERE name = 'Învârtită cu vișină un suc propriu'),
  'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/invartita-cu-visina-un-suc-propriu/invartita_visina_suc_propriu_2.jpeg',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM product_images 
  WHERE product_id = (SELECT id FROM products WHERE name = 'Învârtită cu vișină un suc propriu')
  AND image_url LIKE '%invartita_visina_suc_propriu_2.jpeg'
);

-- Pâine cu secară și maia din malț și orz
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/paine-cu-secara-si-maia-din-malt-si-orz/paine_secara_malt_orz.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Pâine cu secară și maia din malț și orz') 
AND is_primary = true;

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  (SELECT id FROM products WHERE name = 'Pâine cu secară și maia din malț și orz'),
  'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/paine-cu-secara-si-maia-din-malt-si-orz/paine_secara_malt_orz_1.jpg',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM product_images 
  WHERE product_id = (SELECT id FROM products WHERE name = 'Pâine cu secară și maia din malț și orz')
  AND image_url LIKE '%paine_secara_malt_orz_1.jpg'
);

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  (SELECT id FROM products WHERE name = 'Pâine cu secară și maia din malț și orz'),
  'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/paine-cu-secara-si-maia-din-malt-si-orz/paine_secara_malt_orz_2.jpeg',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM product_images 
  WHERE product_id = (SELECT id FROM products WHERE name = 'Pâine cu secară și maia din malț și orz')
  AND image_url LIKE '%paine_secara_malt_orz_2.jpeg'
);

-- Pâine de casă cu maia din hamei și făină albă
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/paine-de-casa-cu-maia-din-hamei-si-faina-alba/paine_casa_maia_hamei_faina_alba.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Pâine de casă cu maia din hamei și făină albă') 
AND is_primary = true;

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  (SELECT id FROM products WHERE name = 'Pâine de casă cu maia din hamei și făină albă'),
  'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/paine-de-casa-cu-maia-din-hamei-si-faina-alba/paine_casa_maia_hamei_faina_alba_1.jpeg',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM product_images 
  WHERE product_id = (SELECT id FROM products WHERE name = 'Pâine de casă cu maia din hamei și făină albă')
  AND image_url LIKE '%paine_casa_maia_hamei_faina_alba_1.jpeg'
);

-- Pateu cu carne vită-porc (Beleaș)
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/pateu-cu-carne-vita-porc-beleas/pateu_carne_vita_porc_beleas.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Pateu cu carne vită-porc (Beleaș)') 
AND is_primary = true;

-- Plăcintă prăjită cu brânză și verdeață
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/placinta-prajita-cu-branza-si-verdeta/placinta_prajita_branza_verdeta.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Plăcintă prăjită cu brânză și verdeață') 
AND is_primary = true;

-- Saralii cu brânză de vaci și verdeață
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/saralii-cu-branza-de-vaci-si-verdeta/saralii_branza_vaci_verdeta.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Saralii cu brânză de vaci și verdeață') 
AND is_primary = true;

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  (SELECT id FROM products WHERE name = 'Saralii cu brânză de vaci și verdeață'),
  'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/saralii-cu-branza-de-vaci-si-verdeta/saralii_branza_vaci_verdeta_1.jpeg',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM product_images 
  WHERE product_id = (SELECT id FROM products WHERE name = 'Saralii cu brânză de vaci și verdeață')
  AND image_url LIKE '%saralii_branza_vaci_verdeta_1.jpeg'
);

-- Ursuleț Olimpic
UPDATE product_images 
SET image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/Retro%20Bakery/Products/ursulet-olimpic/ursulet_olimpic.jpeg'
WHERE product_id = (SELECT id FROM products WHERE name = 'Ursuleț Olimpic') 
AND is_primary = true;