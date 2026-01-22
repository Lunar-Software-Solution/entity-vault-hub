-- Create entities table (business/personal details)
CREATE TABLE public.entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'LLC',
  status TEXT NOT NULL DEFAULT 'Active',
  founded_date DATE,
  jurisdiction TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  ein_tax_id TEXT,
  registration_number TEXT,
  duns_number TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bank_accounts table
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bank TEXT NOT NULL,
  account_number TEXT NOT NULL,
  routing_number TEXT,
  balance NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  type TEXT NOT NULL DEFAULT 'Checking',
  last_transaction_amount NUMERIC,
  last_transaction_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create credit_cards table
CREATE TABLE public.credit_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  card_number TEXT NOT NULL,
  expiry_date TEXT,
  cardholder_name TEXT,
  credit_limit NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  minimum_payment NUMERIC,
  due_date DATE,
  card_color TEXT NOT NULL DEFAULT 'from-zinc-800 to-zinc-600',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create social_media_accounts table
CREATE TABLE public.social_media_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  profile_url TEXT,
  followers TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  icon TEXT,
  color TEXT NOT NULL DEFAULT 'bg-zinc-800',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create addresses table
CREATE TABLE public.addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'home',
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip TEXT,
  country TEXT NOT NULL DEFAULT 'United States',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'General',
  parties TEXT[] NOT NULL DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  value TEXT,
  value_numeric NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for all tables
CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON public.entities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON public.credit_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_social_media_accounts_updated_at BEFORE UPDATE ON public.social_media_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- RLS policies for entities (shared access for all authenticated users)
CREATE POLICY "Authenticated users can view all entities" ON public.entities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create entities" ON public.entities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update entities" ON public.entities FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete entities" ON public.entities FOR DELETE TO authenticated USING (true);

-- RLS policies for bank_accounts
CREATE POLICY "Authenticated users can view all bank accounts" ON public.bank_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create bank accounts" ON public.bank_accounts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update bank accounts" ON public.bank_accounts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete bank accounts" ON public.bank_accounts FOR DELETE TO authenticated USING (true);

-- RLS policies for credit_cards
CREATE POLICY "Authenticated users can view all credit cards" ON public.credit_cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create credit cards" ON public.credit_cards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update credit cards" ON public.credit_cards FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete credit cards" ON public.credit_cards FOR DELETE TO authenticated USING (true);

-- RLS policies for social_media_accounts
CREATE POLICY "Authenticated users can view all social accounts" ON public.social_media_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create social accounts" ON public.social_media_accounts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update social accounts" ON public.social_media_accounts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete social accounts" ON public.social_media_accounts FOR DELETE TO authenticated USING (true);

-- RLS policies for addresses
CREATE POLICY "Authenticated users can view all addresses" ON public.addresses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create addresses" ON public.addresses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update addresses" ON public.addresses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete addresses" ON public.addresses FOR DELETE TO authenticated USING (true);

-- RLS policies for contracts
CREATE POLICY "Authenticated users can view all contracts" ON public.contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create contracts" ON public.contracts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update contracts" ON public.contracts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete contracts" ON public.contracts FOR DELETE TO authenticated USING (true);