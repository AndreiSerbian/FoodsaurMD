
-- Добавляем колонку categories как массив текстовых значений
ALTER TABLE producer_profiles 
ADD COLUMN IF NOT EXISTS categories text[];
