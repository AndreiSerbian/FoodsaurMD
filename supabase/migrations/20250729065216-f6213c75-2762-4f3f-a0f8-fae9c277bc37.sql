-- Delete old products for Retro Bakery
DELETE FROM products WHERE producer_id = '5bea4a73-e6e8-42f8-b140-e3e92c7c4897';

-- Insert new products for Retro Bakery
INSERT INTO products (producer_id, name, description, ingredients, allergen_info, price_regular, quantity, price_unit, in_stock) VALUES
('5bea4a73-e6e8-42f8-b140-e3e92c7c4897', 'Biscuiți Băieți (Cornulețe) cu vișină', 'Biscuiți cu vișine în diverse forme tradiționale. Fragede, pudrate cu zahăr.', 'făină de grâu, unt, vișină, zahăr, ouă, smântână', 'gluten, lactate, ouă', 110.00, 500, 'г', true),
('5bea4a73-e6e8-42f8-b140-e3e92c7c4897', 'Ursuleț Olimpic', 'Gustul copilăriei în fiecare bucățică.', 'făină de grâu, unt, zahăr, lapte condensat, cacao', 'gluten, lactate, ouă', 27.00, 75, 'шт', true),
('5bea4a73-e6e8-42f8-b140-e3e92c7c4897', 'Saralii cu brânză de vaci și verdeață', 'Plăcinte tradiționale moldovenești cu brânză de vaci și verdeață.', 'făină, apă, brânză de vaci, verdeață', 'gluten, lactate', 26.00, 150, 'г', true),
('5bea4a73-e6e8-42f8-b140-e3e92c7c4897', 'Plăcintă prăjită cu brânză și verdeață', 'Plăcintă tradițională prăjită cu brânză de vaci și verdeață.', 'făină, apă, brânză de vaci, verdeață', 'gluten, lactate', 29.00, 200, 'г', true),
('5bea4a73-e6e8-42f8-b140-e3e92c7c4897', 'Învârtită cu vișină un suc propriu', 'Plăcintă tradițională cu vișine și zahăr pudră.', 'făină, vișine, zahăr pudră', 'gluten', 29.00, 150, 'г', true),
('5bea4a73-e6e8-42f8-b140-e3e92c7c4897', 'Pateu cu carne vită-porc (Beleaș)', 'Pateu prăjit cu carne de vită și porc.', 'făină, carne de vită, carne de porc, condimente', 'gluten', 29.00, 150, 'г', true),
('5bea4a73-e6e8-42f8-b140-e3e92c7c4897', 'Pâine de casă cu maia din hamei și făină albă', 'Pâine cu maia, coaptă artizanal.', 'făină albă, maia, apă, sare', 'gluten', 79.00, 1000, 'г', true),
('5bea4a73-e6e8-42f8-b140-e3e92c7c4897', 'Pâine cu secară și maia din malț și orz', 'Pâine cu secară, coaptă artizanal.', 'făină de secară, maia, orz, apă, sare', 'gluten', 89.00, 1000, 'г', true),
('5bea4a73-e6e8-42f8-b140-e3e92c7c4897', 'Crenvuști în aluat "Covridog"', 'Crenvuști învelit în aluat cu semințe.', 'făină, crenvuști, ou, semințe', 'gluten, ouă', 22.00, 120, 'г', true),
('5bea4a73-e6e8-42f8-b140-e3e92c7c4897', 'Biscuiți Moldova cu vișine (Caștani)', 'Biscuiți fragezi cu vișină, glazurați și dați prin nucă.', 'făină, ouă, zahăr, vișine, lapte condensat, cacao, unt', 'gluten, ouă, lactate, vișine, cacao', 9.00, 50, 'шт', true),
('5bea4a73-e6e8-42f8-b140-e3e92c7c4897', 'Babă Neagră ca la Nord', 'Desert tradițional moldovenesc, copt lent, cu aromă naturală și o textură densă.', 'ouă, lapte, chefir, zahăr, făină, cacao', 'ouă, gluten, lactate', 290.00, 1000, 'г', true);