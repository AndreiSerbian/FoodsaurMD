-- Add currency field to producer_profiles
ALTER TABLE producer_profiles 
ADD COLUMN currency TEXT NOT NULL DEFAULT 'MDL' CHECK (currency IN ('MDL', 'RUP'));

-- Update existing producers
-- Кисло и Сладко (slug: kislo-i-sladko) -> RUP
UPDATE producer_profiles 
SET currency = 'RUP' 
WHERE slug = 'kislo-i-sladko';

-- Retro Bakery (slug должен быть retro-bakery) -> MDL
UPDATE producer_profiles 
SET currency = 'MDL' 
WHERE slug LIKE '%retro%bakery%' OR producer_name LIKE '%Retro%Bakery%';

-- Add comment
COMMENT ON COLUMN producer_profiles.currency IS 'Currency used by producer: MDL (Moldovan Leu) or RUP (Transnistrian Ruble)';