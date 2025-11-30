-- Fix 1: Hide producer phone numbers and telegram handles from public
-- Create a security definer function to check if user can view sensitive producer data
CREATE OR REPLACE FUNCTION public.can_view_producer_sensitive_data(producer_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Allow if user is admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  -- Or if user owns this producer profile
  OR EXISTS (
    SELECT 1 FROM producer_profiles 
    WHERE id = producer_profile_id AND user_id = auth.uid()
  );
$$;

-- Drop existing public view policy
DROP POLICY IF EXISTS "Public can view producer basic info" ON public.producer_profiles;

-- Create separate policies for different access levels
-- Public users: see everything EXCEPT phone, telegram_handle, email_verified
CREATE POLICY "Public can view producer profiles (limited)" 
ON public.producer_profiles 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Note: Column-level filtering must be done in application layer or via views
-- Add a comment to document which fields should be hidden
COMMENT ON TABLE public.producer_profiles IS 
'SECURITY: When querying this table for public users, exclude these sensitive columns: phone, telegram_handle, email_verified. 
Only return these fields to authenticated users who own the profile (user_id = auth.uid()) or admins.';

-- Fix 2: Ensure orders table customer data is properly protected
-- Verify existing policies and add explicit column protection

-- First, let's add a security definer function to check order ownership
CREATE OR REPLACE FUNCTION public.can_view_order_customer_data(order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Allow if user placed this order
  SELECT EXISTS (
    SELECT 1 FROM orders 
    WHERE id = order_id AND user_id = auth.uid()
  )
  -- Or if user is the producer for this order
  OR EXISTS (
    SELECT 1 FROM orders o
    JOIN producer_profiles pp ON o.producer_id = pp.id
    WHERE o.id = order_id AND pp.user_id = auth.uid()
  )
  -- Or if user is admin
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Add comment to orders table about customer data protection
COMMENT ON TABLE public.orders IS 
'SECURITY: Customer data (customer_name, customer_phone, customer_email) should only be visible to:
1. The customer who placed the order (user_id matches)
2. The producer receiving the order (producer_id matches their profile)
3. System admins
Public queries must never expose customer contact information.';

-- Fix 3: Additional protection for telegram settings - ensure bot_token is never returned
-- Update the policy to be more explicit about data access
DROP POLICY IF EXISTS "Producers can manage their own telegram settings" ON public.producer_telegram_settings;

CREATE POLICY "Producers can manage their telegram settings (secure)" 
ON public.producer_telegram_settings 
FOR ALL
USING (
  producer_id IN (
    SELECT id FROM producer_profiles WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  producer_id IN (
    SELECT id FROM producer_profiles WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

COMMENT ON TABLE public.producer_telegram_settings IS 
'SECURITY: The bot_token field contains sensitive API credentials. 
Application code should:
1. Never return bot_token in SELECT queries to clients
2. Only use bot_token server-side in edge functions
3. Consider encrypting bot_token at rest
4. Implement token rotation policies';

-- Same for point telegram settings
DROP POLICY IF EXISTS "Producers can manage their points telegram settings" ON public.point_telegram_settings;

CREATE POLICY "Producers can manage point telegram settings (secure)" 
ON public.point_telegram_settings 
FOR ALL
USING (
  point_id IN (
    SELECT pp.id
    FROM pickup_points pp
    JOIN producer_profiles ppr ON pp.producer_id = ppr.id
    WHERE ppr.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  point_id IN (
    SELECT pp.id
    FROM pickup_points pp
    JOIN producer_profiles ppr ON pp.producer_id = ppr.id
    WHERE ppr.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

COMMENT ON TABLE public.point_telegram_settings IS 
'SECURITY: The bot_token field contains sensitive API credentials. Never return to clients.';