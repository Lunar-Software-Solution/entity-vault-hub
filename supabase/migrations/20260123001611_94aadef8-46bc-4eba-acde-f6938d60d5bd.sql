-- Add bank_website column to bank_accounts table
ALTER TABLE public.bank_accounts ADD COLUMN bank_website TEXT;

-- Add issuer_website column to credit_cards table  
ALTER TABLE public.credit_cards ADD COLUMN issuer_website TEXT;