-- Add province/state column to issuing_authorities
ALTER TABLE public.issuing_authorities
ADD COLUMN province_state text NULL;