-- Add security code and billing address to credit_cards table
ALTER TABLE public.credit_cards 
ADD COLUMN IF NOT EXISTS security_code TEXT,
ADD COLUMN IF NOT EXISTS billing_address TEXT;