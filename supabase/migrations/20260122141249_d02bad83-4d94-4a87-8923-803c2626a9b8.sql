-- Remove balance and transaction fields from bank_accounts
ALTER TABLE public.bank_accounts 
  DROP COLUMN IF EXISTS balance,
  DROP COLUMN IF EXISTS last_transaction_amount,
  DROP COLUMN IF EXISTS last_transaction_type;

-- Remove current_balance and minimum_payment from credit_cards (keep credit_limit)
ALTER TABLE public.credit_cards 
  DROP COLUMN IF EXISTS current_balance,
  DROP COLUMN IF EXISTS minimum_payment;

-- Remove value fields from contracts
ALTER TABLE public.contracts 
  DROP COLUMN IF EXISTS value,
  DROP COLUMN IF EXISTS value_numeric;