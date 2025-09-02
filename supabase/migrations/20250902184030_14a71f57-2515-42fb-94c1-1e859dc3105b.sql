-- Add missing fields to pickup_points table
ALTER TABLE public.pickup_points 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS lat double precision,
ADD COLUMN IF NOT EXISTS lng double precision,
ADD COLUMN IF NOT EXISTS work_hours jsonb,
ADD COLUMN IF NOT EXISTS slug text;

-- Make city required if not already
UPDATE public.pickup_points SET city = 'Unknown' WHERE city IS NULL;
ALTER TABLE public.pickup_points ALTER COLUMN city SET NOT NULL;

-- Create function to generate slug from title or address
CREATE OR REPLACE FUNCTION public.generate_pickup_point_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(replace(regexp_replace(coalesce(NEW.title, NEW.address), '[^a-zA-Z0-9\s-]', '', 'g'), ' ', '-'));
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for slug generation
CREATE TRIGGER set_pickup_point_slug
  BEFORE INSERT OR UPDATE ON public.pickup_points
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_pickup_point_slug();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pickup_points_producer_active ON public.pickup_points(producer_id, is_active);
CREATE INDEX IF NOT EXISTS idx_pickup_points_slug ON public.pickup_points(slug);
CREATE INDEX IF NOT EXISTS idx_pickup_points_city ON public.pickup_points(city);

-- Default work_hours for existing records
UPDATE public.pickup_points 
SET work_hours = jsonb_build_object(
  'mon', CASE WHEN working_hours_from IS NOT NULL AND working_hours_to IS NOT NULL 
         THEN jsonb_build_array(jsonb_build_object('open', working_hours_from::text, 'close', working_hours_to::text))
         ELSE '[]'::jsonb END,
  'tue', CASE WHEN working_hours_from IS NOT NULL AND working_hours_to IS NOT NULL 
         THEN jsonb_build_array(jsonb_build_object('open', working_hours_from::text, 'close', working_hours_to::text))
         ELSE '[]'::jsonb END,
  'wed', CASE WHEN working_hours_from IS NOT NULL AND working_hours_to IS NOT NULL 
         THEN jsonb_build_array(jsonb_build_object('open', working_hours_from::text, 'close', working_hours_to::text))
         ELSE '[]'::jsonb END,
  'thu', CASE WHEN working_hours_from IS NOT NULL AND working_hours_to IS NOT NULL 
         THEN jsonb_build_array(jsonb_build_object('open', working_hours_from::text, 'close', working_hours_to::text))
         ELSE '[]'::jsonb END,
  'fri', CASE WHEN working_hours_from IS NOT NULL AND working_hours_to IS NOT NULL 
         THEN jsonb_build_array(jsonb_build_object('open', working_hours_from::text, 'close', working_hours_to::text))
         ELSE '[]'::jsonb END,
  'sat', CASE WHEN working_hours_from IS NOT NULL AND working_hours_to IS NOT NULL 
         THEN jsonb_build_array(jsonb_build_object('open', working_hours_from::text, 'close', working_hours_to::text))
         ELSE '[]'::jsonb END,
  'sun', '[]'::jsonb
)
WHERE work_hours IS NULL;

-- Make work_hours required
ALTER TABLE public.pickup_points ALTER COLUMN work_hours SET NOT NULL;
ALTER TABLE public.pickup_points ALTER COLUMN work_hours SET DEFAULT '{}'::jsonb;