-- Add website column to entities table for logo.dev integration
ALTER TABLE public.entities
ADD COLUMN website text;