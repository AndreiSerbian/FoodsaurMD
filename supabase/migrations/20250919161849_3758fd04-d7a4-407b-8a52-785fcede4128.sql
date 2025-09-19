-- Create producer time slots table
CREATE TABLE producer_time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_discount_time BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create discounts table
CREATE TABLE discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_amount NUMERIC(12,2),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE producer_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Policies for producer_time_slots
CREATE POLICY "Public can view active time slots" 
ON producer_time_slots 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Producers can manage their time slots" 
ON producer_time_slots 
FOR ALL 
USING (producer_id IN (
  SELECT producer_profiles.id 
  FROM producer_profiles 
  WHERE producer_profiles.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all time slots" 
ON producer_time_slots 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for discounts
CREATE POLICY "Public can view active discounts" 
ON discounts 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Producers can manage their product discounts" 
ON discounts 
FOR ALL 
USING (product_id IN (
  SELECT products.id 
  FROM products 
  JOIN producer_profiles ON products.producer_id = producer_profiles.id
  WHERE producer_profiles.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all discounts" 
ON discounts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_producer_time_slots_updated_at
  BEFORE UPDATE ON producer_time_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at
  BEFORE UPDATE ON discounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();