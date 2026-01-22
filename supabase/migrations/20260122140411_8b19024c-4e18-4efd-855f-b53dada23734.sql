-- Add entity_id column to bank_accounts
ALTER TABLE public.bank_accounts 
ADD COLUMN entity_id uuid REFERENCES public.entities(id) ON DELETE CASCADE;

-- Add entity_id column to credit_cards
ALTER TABLE public.credit_cards 
ADD COLUMN entity_id uuid REFERENCES public.entities(id) ON DELETE CASCADE;

-- Add entity_id column to addresses
ALTER TABLE public.addresses 
ADD COLUMN entity_id uuid REFERENCES public.entities(id) ON DELETE CASCADE;

-- Add entity_id column to contracts
ALTER TABLE public.contracts 
ADD COLUMN entity_id uuid REFERENCES public.entities(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX idx_bank_accounts_entity_id ON public.bank_accounts(entity_id);
CREATE INDEX idx_credit_cards_entity_id ON public.credit_cards(entity_id);
CREATE INDEX idx_addresses_entity_id ON public.addresses(entity_id);
CREATE INDEX idx_contracts_entity_id ON public.contracts(entity_id);