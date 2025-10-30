-- Добавление продуктов для Кисло и Сладко
INSERT INTO products (
  producer_id,
  name,
  description,
  price_regular,
  price_discount,
  base_unit,
  unit_type,
  price_unit,
  measure_kind,
  quantity,
  in_stock,
  is_active
) VALUES
  -- Булка Средиземноморская
  (
    'c5f03653-6d60-454d-87ac-a4fb1a7d8bbd',
    'Булка Средиземноморская',
    'Ароматная средиземноморская булка с маслинами',
    28,
    19,
    'pcs',
    'шт',
    'шт',
    'unit',
    50,
    true,
    true
  ),
  -- Гречневый хлеб
  (
    'c5f03653-6d60-454d-87ac-a4fb1a7d8bbd',
    'Гречневый хлеб',
    'Полезный хлеб из гречневой муки',
    30,
    20,
    'pcs',
    'шт',
    'шт',
    'unit',
    50,
    true,
    true
  ),
  -- Пшенично-ржаной хлеб
  (
    'c5f03653-6d60-454d-87ac-a4fb1a7d8bbd',
    'Пшенично-ржаной хлеб',
    'Классический пшенично-ржаной хлеб',
    25,
    18,
    'pcs',
    'шт',
    'шт',
    'unit',
    50,
    true,
    true
  ),
  -- Маковые рулеты
  (
    'c5f03653-6d60-454d-87ac-a4fb1a7d8bbd',
    'Маковые рулеты',
    'Нежные рулеты с маковой начинкой',
    27,
    19,
    'pcs',
    'шт',
    'шт',
    'unit',
    50,
    true,
    true
  );

-- Добавление изображений продуктов
INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  p.id,
  CASE 
    WHEN p.name = 'Булка Средиземноморская' THEN 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/product-images/kislo-i-sladko/medeterian-paine.jpg'
    WHEN p.name = 'Гречневый хлеб' THEN 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/product-images/kislo-i-sladko/orz-paina.jpg'
    WHEN p.name = 'Пшенично-ржаной хлеб' THEN 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/product-images/kislo-i-sladko/paine-secara-grau.jpg'
    WHEN p.name = 'Маковые рулеты' THEN 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/product-images/kislo-i-sladko/ruleu-de-seminte-de-mac.jpg'
  END,
  true
FROM products p
WHERE p.producer_id = 'c5f03653-6d60-454d-87ac-a4fb1a7d8bbd'
  AND p.name IN ('Булка Средиземноморская', 'Гречневый хлеб', 'Пшенично-ржаной хлеб', 'Маковые рулеты');