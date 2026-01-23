-- Remove unused is_verified column from entities table
ALTER TABLE public.entities DROP COLUMN IF EXISTS is_verified;