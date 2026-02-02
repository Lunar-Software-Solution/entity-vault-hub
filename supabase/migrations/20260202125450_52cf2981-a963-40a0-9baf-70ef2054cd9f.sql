-- Create merchant_accounts table
CREATE TABLE public.merchant_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id uuid REFERENCES public.entities(id) ON DELETE SET NULL,
  provider_id uuid REFERENCES public.payment_providers(id) ON DELETE SET NULL,
  name text NOT NULL,
  merchant_id text,
  api_key_masked text,
  processing_currencies text[] DEFAULT '{}'::text[],
  fee_structure text,
  settlement_currency text DEFAULT 'USD',
  settlement_bank_account_id uuid REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  is_primary boolean DEFAULT false,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.merchant_accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies (following the same pattern as other tables)
CREATE POLICY "Authenticated users can view merchant_accounts"
  ON public.merchant_accounts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write access can create merchant_accounts"
  ON public.merchant_accounts FOR INSERT
  WITH CHECK (can_write());

CREATE POLICY "Users with write access can update merchant_accounts"
  ON public.merchant_accounts FOR UPDATE
  USING (can_write());

CREATE POLICY "Users with write access can delete merchant_accounts"
  ON public.merchant_accounts FOR DELETE
  USING (can_write());

-- Add updated_at trigger
CREATE TRIGGER update_merchant_accounts_updated_at
  BEFORE UPDATE ON public.merchant_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit trigger
CREATE TRIGGER audit_merchant_accounts
  AFTER INSERT OR UPDATE OR DELETE ON public.merchant_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();