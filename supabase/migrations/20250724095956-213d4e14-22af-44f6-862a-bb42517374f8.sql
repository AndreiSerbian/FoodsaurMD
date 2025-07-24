-- Добавляем недостающие поля в таблицу products для полноценного управления продукцией
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS ingredients TEXT,
ADD COLUMN IF NOT EXISTS allergen_info TEXT,
ADD COLUMN IF NOT EXISTS discount_size INTEGER;