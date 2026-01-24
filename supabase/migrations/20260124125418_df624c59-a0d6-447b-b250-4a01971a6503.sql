-- Drop passport_number and tax_id columns from directors_ubos table
ALTER TABLE public.directors_ubos DROP COLUMN IF EXISTS passport_number;
ALTER TABLE public.directors_ubos DROP COLUMN IF EXISTS tax_id;