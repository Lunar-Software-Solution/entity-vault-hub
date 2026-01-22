-- Create tax_ids table for multiple tax identifiers per entity
CREATE TABLE public.tax_ids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  tax_id_number TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'EIN',
  authority TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United States',
  issued_date DATE,
  expiry_date DATE,
  notes TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tax_ids ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view all tax ids"
  ON public.tax_ids FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tax ids"
  ON public.tax_ids FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tax ids"
  ON public.tax_ids FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete tax ids"
  ON public.tax_ids FOR DELETE
  USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tax_ids_updated_at
  BEFORE UPDATE ON public.tax_ids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster entity lookups
CREATE INDEX idx_tax_ids_entity_id ON public.tax_ids(entity_id);