-- Добавляем политику для публичного просмотра товаров
CREATE POLICY "Public can view all products" 
ON public.products 
FOR SELECT 
USING (true);

-- Добавляем политику для публичного просмотра изображений товаров  
CREATE POLICY "Public can view all product images"
ON public.product_images
FOR SELECT 
USING (true);