-- Remove email, phone, and website columns from entities table
ALTER TABLE public.entities DROP COLUMN IF EXISTS email;
ALTER TABLE public.entities DROP COLUMN IF EXISTS phone;
ALTER TABLE public.entities DROP COLUMN IF EXISTS website;