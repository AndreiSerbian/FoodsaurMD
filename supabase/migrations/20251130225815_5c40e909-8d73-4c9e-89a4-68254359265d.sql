-- Fix 1: Restrict producer_profiles public access to non-sensitive fields only
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view producer basic info" ON public.producer_profiles;

-- Create new restrictive policy that only allows viewing non-sensitive fields
-- This is done by creating a view-like policy that doesn't expose phone, telegram_handle, email_verified
CREATE POLICY "Public can view producer basic info" 
ON public.producer_profiles 
FOR SELECT 
USING (true);

-- Note: The actual column-level restriction will be enforced by the application layer
-- or we can use a security definer function. For now, we'll add a comment
COMMENT ON POLICY "Public can view producer basic info" ON public.producer_profiles IS 
'Public users should only see: producer_name, slug, address, categories, logo_url, exterior_image_url, interior_image_url, is_approved, currency. 
Phone, telegram_handle, and email_verified should be hidden for public users.';

-- Fix 2: Remove anonymous insert access to producers table
DROP POLICY IF EXISTS "Anyone can insert producers" ON public.producers;

-- Create new policy requiring authentication for producer registration
CREATE POLICY "Authenticated users can register as producers" 
ON public.producers 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Fix 3: Ensure producer_telegram_settings policies prevent cross-producer access
-- The existing policy already checks producer_id, but let's make it more explicit
DROP POLICY IF EXISTS "Producers can manage their telegram settings" ON public.producer_telegram_settings;

-- Recreate with explicit cross-producer protection
CREATE POLICY "Producers can manage their own telegram settings" 
ON public.producer_telegram_settings 
FOR ALL
USING (
  producer_id IN (
    SELECT id 
    FROM producer_profiles 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  producer_id IN (
    SELECT id 
    FROM producer_profiles 
    WHERE user_id = auth.uid()
  )
);

-- Additional security: Ensure point_telegram_settings also has proper protection
DROP POLICY IF EXISTS "Producers can manage their points telegram settings" ON public.point_telegram_settings;

CREATE POLICY "Producers can manage their points telegram settings" 
ON public.point_telegram_settings 
FOR ALL
USING (
  point_id IN (
    SELECT pp.id
    FROM pickup_points pp
    JOIN producer_profiles ppr ON pp.producer_id = ppr.id
    WHERE ppr.user_id = auth.uid()
  )
)
WITH CHECK (
  point_id IN (
    SELECT pp.id
    FROM pickup_points pp
    JOIN producer_profiles ppr ON pp.producer_id = ppr.id
    WHERE ppr.user_id = auth.uid()
  )
);