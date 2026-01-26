-- Add description_of_activities field to entities table
ALTER TABLE public.entities
ADD COLUMN description_of_activities TEXT;