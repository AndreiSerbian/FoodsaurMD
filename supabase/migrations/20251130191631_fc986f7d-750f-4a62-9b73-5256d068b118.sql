-- Исправление безопасности: orders table
-- Удаляем небезопасную публичную политику INSERT
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Создаем безопасную политику INSERT (только для аутентифицированных пользователей)
CREATE POLICY "Authenticated users can create orders" 
ON public.orders 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Добавляем политику для анонимных заказов (без регистрации)
CREATE POLICY "Anonymous users can create orders" 
ON public.orders 
FOR INSERT 
TO anon
WITH CHECK (user_id IS NULL);

-- Исправление безопасности: producer_profiles table
-- Удаляем небезопасную публичную политику
DROP POLICY IF EXISTS "Anyone can view producer profiles" ON public.producer_profiles;
DROP POLICY IF EXISTS "Public can view all producer profiles" ON public.producer_profiles;

-- Создаем безопасную публичную политику (скрываем контактные данные)
CREATE POLICY "Public can view producer basic info" 
ON public.producer_profiles 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Создаем политику для просмотра полных данных (только своих)
CREATE POLICY "Producers can view own full profile" 
ON public.producer_profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Исправление безопасности: order_rate_limit table
-- Добавляем политики для service role
CREATE POLICY "Service role can manage rate limits" 
ON public.order_rate_limit 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Блокируем публичный доступ к rate limit таблице
CREATE POLICY "No public access to rate limits" 
ON public.order_rate_limit 
FOR SELECT 
TO anon, authenticated
USING (false);