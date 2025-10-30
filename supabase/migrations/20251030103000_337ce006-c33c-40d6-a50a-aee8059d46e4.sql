-- Обновляем URLs изображений для производителя "Кисло и Сладко"
-- Структура хранилища: producers/kislo-i-sladko/exterior.jpg и producers/kislo-i-sladko/interior.jpg

UPDATE producer_profiles
SET 
  exterior_image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/kislo-i-sladko/exterior.jpg',
  interior_image_url = 'https://qpljdodpbygbwnskuxsq.supabase.co/storage/v1/object/public/producers/kislo-i-sladko/interior.jpg',
  updated_at = now()
WHERE slug = 'kislo-i-sladko';