-- Remove legacy identification fields from entities table
ALTER TABLE public.entities DROP COLUMN IF EXISTS ein_tax_id;
ALTER TABLE public.entities DROP COLUMN IF EXISTS registration_number;
ALTER TABLE public.entities DROP COLUMN IF EXISTS duns_number;