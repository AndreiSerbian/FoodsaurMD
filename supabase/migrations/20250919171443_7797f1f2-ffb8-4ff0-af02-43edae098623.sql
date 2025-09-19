-- Update products table to remove prices
ALTER TABLE products DROP COLUMN IF EXISTS price_regular;
ALTER TABLE products DROP COLUMN IF EXISTS price_discount;
ALTER TABLE products DROP COLUMN IF EXISTS discount_size;

-- Add unit_type column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_type text NOT NULL DEFAULT 'pcs';
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku text;

-- Create point_products table
CREATE TABLE IF NOT EXISTS point_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  point_id uuid NOT NULL REFERENCES pickup_points(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  price_regular numeric(12,2) NOT NULL CHECK (price_regular > 0),
  price_discount numeric(12,2) NULL CHECK (price_discount IS NULL OR price_discount < price_regular),
  discount_start timestamptz NULL,
  discount_end timestamptz NULL,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(point_id, product_id),
  CHECK (
    (discount_start IS NULL AND discount_end IS NULL AND price_discount IS NULL) OR
    (discount_start IS NOT NULL AND discount_end IS NOT NULL AND discount_start < discount_end)
  )
);

-- Enable RLS on point_products
ALTER TABLE point_products ENABLE ROW LEVEL SECURITY;

-- RLS policies for point_products
CREATE POLICY "Producers can manage their point products" 
ON point_products 
FOR ALL 
USING (
  point_id IN (
    SELECT pp.id 
    FROM pickup_points pp
    JOIN producer_profiles ppr ON pp.producer_id = ppr.id
    WHERE ppr.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all point products" 
ON point_products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active point products" 
ON point_products 
FOR SELECT 
USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_point_products_updated_at
BEFORE UPDATE ON point_products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_point_products_point_id ON point_products(point_id);
CREATE INDEX IF NOT EXISTS idx_point_products_product_id ON point_products(product_id);
CREATE INDEX IF NOT EXISTS idx_point_products_active ON point_products(is_active) WHERE is_active = true;