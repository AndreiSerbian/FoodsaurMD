-- Удаление лишних бабок из Кисло и Сладко, оставляем только одну за 24 лей
DELETE FROM product_images WHERE product_id IN (
  'ff153d01-8a44-47d2-bc02-7339a9dc5905',
  '0eb667c6-ab6c-4728-b7c5-94c5d7d42c1d',
  'ee3875fc-f7eb-4e52-bd30-54cc84ed48de',
  '7549416f-0d32-418e-8b84-8baca4dc66d5',
  'f45673b5-abe7-43af-8a81-ef8dc5c9c6ad'
);

DELETE FROM products WHERE id IN (
  'ff153d01-8a44-47d2-bc02-7339a9dc5905',
  '0eb667c6-ab6c-4728-b7c5-94c5d7d42c1d',
  'ee3875fc-f7eb-4e52-bd30-54cc84ed48de',
  '7549416f-0d32-418e-8b84-8baca4dc66d5',
  'f45673b5-abe7-43af-8a81-ef8dc5c9c6ad'
);