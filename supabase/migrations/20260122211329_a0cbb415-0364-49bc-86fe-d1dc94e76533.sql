-- Create phone_numbers table for multiple phones per entity
CREATE TABLE public.phone_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT '+1',
  label TEXT NOT NULL DEFAULT 'Main',
  purpose TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view all phone numbers"
  ON public.phone_numbers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create phone numbers"
  ON public.phone_numbers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update phone numbers"
  ON public.phone_numbers FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete phone numbers"
  ON public.phone_numbers FOR DELETE
  USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_phone_numbers_updated_at
  BEFORE UPDATE ON public.phone_numbers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster entity lookups
CREATE INDEX idx_phone_numbers_entity_id ON public.phone_numbers(entity_id);