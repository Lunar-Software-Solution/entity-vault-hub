-- Create junction table for many-to-many relationship between issuing_authorities and tax_id_types
CREATE TABLE public.authority_tax_id_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  authority_id uuid NOT NULL REFERENCES public.issuing_authorities(id) ON DELETE CASCADE,
  tax_id_type_id uuid NOT NULL REFERENCES public.tax_id_types(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(authority_id, tax_id_type_id)
);

-- Enable RLS
ALTER TABLE public.authority_tax_id_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view authority tax id types"
  ON public.authority_tax_id_types FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create authority tax id types"
  ON public.authority_tax_id_types FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update authority tax id types"
  ON public.authority_tax_id_types FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete authority tax id types"
  ON public.authority_tax_id_types FOR DELETE
  USING (true);