-- Drop the country column from tax_ids table
ALTER TABLE public.tax_ids DROP COLUMN IF EXISTS country;