-- Drop tables that will be replaced
DROP TABLE IF EXISTS point_products CASCADE;
DROP TABLE IF EXISTS pickup_point_products CASCADE;
DROP TABLE IF EXISTS point_inventory CASCADE;

-- Create enums
DO $$ BEGIN
  CREATE TYPE measure_kind AS ENUM ('mass', 'unit');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE base_unit AS ENUM ('g', 'pcs');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE sale_mode AS ENUM ('per_pack', 'per_weight', 'per_unit');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Modify existing products table to add new fields
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS measure_kind measure_kind DEFAULT 'unit',
ADD COLUMN IF NOT EXISTS base_unit base_unit DEFAULT 'pcs';

-- Update existing products to have consistent measure/unit
UPDATE public.products 
SET measure_kind = 'unit', base_unit = 'pcs' 
WHERE measure_kind IS NULL;

-- Add constraint for consistency (drop if exists, then add)
DO $$ BEGIN
  ALTER TABLE public.products 
  ADD CONSTRAINT products_measure_unit_consistency CHECK (
    (measure_kind = 'mass' AND base_unit = 'g') OR
    (measure_kind = 'unit' AND base_unit = 'pcs')
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create point_inventory table - single source of truth for stock
CREATE TABLE public.point_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  point_id UUID NOT NULL,
  product_id UUID NOT NULL,
  bulk_qty BIGINT NOT NULL DEFAULT 0 CHECK (bulk_qty >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(point_id, product_id)
);

-- Create point_variants table - different selling options
CREATE TABLE public.point_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  point_id UUID NOT NULL,
  product_id UUID NOT NULL,
  variant_name TEXT NOT NULL,
  sale_mode sale_mode NOT NULL,
  pack_size_base BIGINT NULL, -- required for per_pack mode
  price_per_pack NUMERIC(12,2) NULL,
  price_per_kg NUMERIC(12,2) NULL,
  price_per_unit NUMERIC(12,2) NULL,
  price_discount NUMERIC(12,2) NULL,
  discount_start TIMESTAMPTZ NULL,
  discount_end TIMESTAMPTZ NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints for different sale modes
  CONSTRAINT pack_mode_requirements CHECK (
    sale_mode != 'per_pack' OR (pack_size_base IS NOT NULL AND pack_size_base > 0 AND price_per_pack IS NOT NULL)
  ),
  CONSTRAINT weight_mode_requirements CHECK (
    sale_mode != 'per_weight' OR price_per_kg IS NOT NULL
  ),
  CONSTRAINT unit_mode_requirements CHECK (
    sale_mode != 'per_unit' OR price_per_unit IS NOT NULL
  ),
  CONSTRAINT discount_consistency CHECK (
    (price_discount IS NULL) OR 
    (discount_start IS NOT NULL AND discount_end IS NOT NULL AND discount_start < discount_end)
  )
);

-- Create indexes for performance
CREATE INDEX idx_point_inventory_point_id ON public.point_inventory(point_id);
CREATE INDEX idx_point_inventory_product_id ON public.point_inventory(product_id);
CREATE INDEX idx_point_variants_point_product ON public.point_variants(point_id, product_id);
CREATE INDEX idx_point_variants_active ON public.point_variants(is_active);

-- Enable RLS
ALTER TABLE public.point_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for point_inventory
CREATE POLICY "Public can view inventory" ON public.point_inventory
  FOR SELECT USING (true);

CREATE POLICY "Producers can manage their inventory" ON public.point_inventory
  FOR ALL USING (
    point_id IN (
      SELECT pp.id FROM pickup_points pp
      JOIN producer_profiles ppr ON pp.producer_id = ppr.id
      WHERE ppr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all inventory" ON public.point_inventory
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for point_variants
CREATE POLICY "Public can view active variants" ON public.point_variants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Producers can manage their variants" ON public.point_variants
  FOR ALL USING (
    point_id IN (
      SELECT pp.id FROM pickup_points pp
      JOIN producer_profiles ppr ON pp.producer_id = ppr.id
      WHERE ppr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all variants" ON public.point_variants
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_point_inventory_updated_at
  BEFORE UPDATE ON public.point_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_point_variants_updated_at
  BEFORE UPDATE ON public.point_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create atomic deduction function
CREATE OR REPLACE FUNCTION public.atomic_inventory_deduction(
  p_point_id UUID,
  p_product_id UUID,
  p_deduct_amount BIGINT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_qty BIGINT;
  v_updated_rows INTEGER;
BEGIN
  -- Lock and get current quantity
  SELECT bulk_qty INTO v_current_qty
  FROM public.point_inventory
  WHERE point_id = p_point_id AND product_id = p_product_id
  FOR UPDATE;

  -- Check if record exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PRODUCT_NOT_FOUND',
      'message', 'Product not found in inventory'
    );
  END IF;

  -- Check if enough quantity available
  IF v_current_qty < p_deduct_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INSUFFICIENT_STOCK',
      'message', 'Insufficient stock available',
      'available', v_current_qty,
      'requested', p_deduct_amount
    );
  END IF;

  -- Perform atomic deduction
  UPDATE public.point_inventory
  SET bulk_qty = bulk_qty - p_deduct_amount,
      updated_at = now()
  WHERE point_id = p_point_id 
    AND product_id = p_product_id 
    AND bulk_qty >= p_deduct_amount;
  
  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

  -- Double-check update was successful
  IF v_updated_rows = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CONCURRENT_UPDATE',
      'message', 'Stock was modified by another transaction'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'deducted', p_deduct_amount,
    'remaining', v_current_qty - p_deduct_amount
  );
END;
$$;