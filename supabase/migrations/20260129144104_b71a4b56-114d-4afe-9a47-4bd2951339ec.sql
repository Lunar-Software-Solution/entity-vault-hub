-- Remove ssl_expiry_date column from entity_websites table
ALTER TABLE public.entity_websites DROP COLUMN IF EXISTS ssl_expiry_date;