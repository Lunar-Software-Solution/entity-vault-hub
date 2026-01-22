-- Drop the junction table (not needed for this relationship)
DROP TABLE IF EXISTS public.authority_tax_id_types;

-- Add authority_id foreign key to tax_id_types
ALTER TABLE public.tax_id_types 
ADD COLUMN authority_id uuid REFERENCES public.issuing_authorities(id) ON DELETE SET NULL;