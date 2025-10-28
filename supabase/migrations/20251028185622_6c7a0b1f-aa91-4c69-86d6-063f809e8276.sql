-- Add is_listed column to point_inventory table
ALTER TABLE public.point_inventory 
ADD COLUMN is_listed BOOLEAN NOT NULL DEFAULT true;

-- Create index for better performance when filtering by is_listed
CREATE INDEX idx_point_inventory_is_listed ON public.point_inventory(is_listed);

-- Add comment to explain the column
COMMENT ON COLUMN public.point_inventory.is_listed IS 'Indicates whether the product is actively listed/available at this pickup point';