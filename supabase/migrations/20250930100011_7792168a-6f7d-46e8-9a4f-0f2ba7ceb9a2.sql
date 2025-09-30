
-- Устанавливаем средние цены по Молдове для товаров Retro Bakery

-- Babă Neagră ca la Nord (традиционный десерт)
UPDATE products 
SET price_regular = 45.00, price_discount = 40.00
WHERE id = '1a170cde-0704-4068-a636-7da3f89bcadc';

-- Biscuiți Băieți (Cornulețe) cu vișină
UPDATE products 
SET price_regular = 35.00, price_discount = 30.00
WHERE id = 'fc406d0b-7032-4ab3-be7a-374870d10f4c';

-- Biscuiți Moldova cu vișine (Caștani)
UPDATE products 
SET price_regular = 40.00, price_discount = 35.00
WHERE id = '2e942d45-b353-438c-a605-49d2ebaea231';

-- Crenvuști în aluat "Covridog"
UPDATE products 
SET price_regular = 25.00, price_discount = 22.00
WHERE id = 'a5983ba0-d69b-41e3-a118-eff5911e89aa';

-- Învârtită cu vișină
UPDATE products 
SET price_regular = 30.00, price_discount = 27.00
WHERE id = '6787fe41-eca2-4998-b93e-6d99f668a9b5';

-- Pâine cu secară și maia din malț și orz
UPDATE products 
SET price_regular = 20.00
WHERE id = '1acd6c40-71d4-4a1a-b685-42dd8de757ed';

-- Pâine de casă cu maia din hamei și făină albă
UPDATE products 
SET price_regular = 18.00
WHERE id = 'af897282-e762-4e08-9784-4fff74c69bb5';

-- Pateu cu carne vită-porc (Beleaș)
UPDATE products 
SET price_regular = 28.00, price_discount = 25.00
WHERE id = '86f9fb6f-9c56-4424-9c1e-d89385b69312';

-- Plăcintă prăjită cu brânză și verdeață
UPDATE products 
SET price_regular = 22.00, price_discount = 20.00
WHERE id = '63dc803a-3959-416b-b61f-9baa25b35d08';

-- Saralii cu brânză de vaci și verdeață
UPDATE products 
SET price_regular = 20.00, price_discount = 18.00
WHERE id = '3d8250a5-07a9-4542-bd27-d0adb33f00c9';

-- Ursuleț Olimpic
UPDATE products 
SET price_regular = 35.00, price_discount = 32.00
WHERE id = 'dd79d025-02ba-44ae-874e-560fad990572';
