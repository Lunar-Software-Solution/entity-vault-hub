-- Share classes (Common, Preferred A, Preferred B, etc.)
CREATE TABLE public.share_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  class_type TEXT NOT NULL DEFAULT 'common', -- 'common', 'preferred', 'options'
  authorized_shares NUMERIC NOT NULL DEFAULT 0,
  par_value NUMERIC DEFAULT 0.0001,
  voting_rights BOOLEAN DEFAULT true,
  votes_per_share NUMERIC DEFAULT 1,
  liquidation_preference NUMERIC DEFAULT 1, -- 1x, 2x, etc.
  participation_cap NUMERIC, -- null means full participation
  dividend_rate NUMERIC, -- percentage
  conversion_ratio NUMERIC DEFAULT 1,
  anti_dilution TEXT DEFAULT 'none', -- 'none', 'broad_based', 'narrow_based', 'full_ratchet'
  seniority INTEGER DEFAULT 1, -- 1 is highest priority
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shareholders (can be individuals or entities)
CREATE TABLE public.shareholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  shareholder_type TEXT NOT NULL DEFAULT 'individual', -- 'individual', 'institution', 'founder', 'employee', 'investor'
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  is_founder BOOLEAN DEFAULT false,
  is_board_member BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Equity transactions (issuances, transfers, exercises, etc.)
CREATE TABLE public.equity_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  shareholder_id UUID NOT NULL REFERENCES public.shareholders(id) ON DELETE CASCADE,
  share_class_id UUID NOT NULL REFERENCES public.share_classes(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL DEFAULT 'issuance', -- 'issuance', 'transfer', 'repurchase', 'exercise', 'conversion', 'cancellation'
  shares NUMERIC NOT NULL,
  price_per_share NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC GENERATED ALWAYS AS (shares * price_per_share) STORED,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vesting_start_date DATE,
  vesting_end_date DATE,
  vesting_cliff_months INTEGER,
  vesting_period_months INTEGER,
  board_approval_date DATE,
  certificate_number TEXT,
  from_shareholder_id UUID REFERENCES public.shareholders(id), -- for transfers
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Option grants (stock options, warrants)
CREATE TABLE public.option_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  shareholder_id UUID NOT NULL REFERENCES public.shareholders(id) ON DELETE CASCADE,
  share_class_id UUID NOT NULL REFERENCES public.share_classes(id) ON DELETE CASCADE,
  grant_type TEXT NOT NULL DEFAULT 'iso', -- 'iso', 'nso', 'rsu', 'warrant'
  grant_date DATE NOT NULL,
  expiration_date DATE,
  shares_granted NUMERIC NOT NULL,
  shares_vested NUMERIC NOT NULL DEFAULT 0,
  shares_exercised NUMERIC NOT NULL DEFAULT 0,
  exercise_price NUMERIC NOT NULL,
  vesting_start_date DATE,
  vesting_cliff_months INTEGER DEFAULT 12,
  vesting_period_months INTEGER DEFAULT 48,
  acceleration_single_trigger BOOLEAN DEFAULT false,
  acceleration_double_trigger BOOLEAN DEFAULT false,
  early_exercise_allowed BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'exercised', 'cancelled', 'expired'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.share_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shareholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equity_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.option_grants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for share_classes
CREATE POLICY "Authenticated users can view share classes" ON public.share_classes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create share classes" ON public.share_classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update share classes" ON public.share_classes FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete share classes" ON public.share_classes FOR DELETE USING (true);

-- RLS Policies for shareholders
CREATE POLICY "Authenticated users can view shareholders" ON public.shareholders FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create shareholders" ON public.shareholders FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update shareholders" ON public.shareholders FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete shareholders" ON public.shareholders FOR DELETE USING (true);

-- RLS Policies for equity_transactions
CREATE POLICY "Authenticated users can view equity transactions" ON public.equity_transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create equity transactions" ON public.equity_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update equity transactions" ON public.equity_transactions FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete equity transactions" ON public.equity_transactions FOR DELETE USING (true);

-- RLS Policies for option_grants
CREATE POLICY "Authenticated users can view option grants" ON public.option_grants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create option grants" ON public.option_grants FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update option grants" ON public.option_grants FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete option grants" ON public.option_grants FOR DELETE USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_share_classes_updated_at BEFORE UPDATE ON public.share_classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shareholders_updated_at BEFORE UPDATE ON public.shareholders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_equity_transactions_updated_at BEFORE UPDATE ON public.equity_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_option_grants_updated_at BEFORE UPDATE ON public.option_grants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_share_classes_entity ON public.share_classes(entity_id);
CREATE INDEX idx_shareholders_entity ON public.shareholders(entity_id);
CREATE INDEX idx_equity_transactions_entity ON public.equity_transactions(entity_id);
CREATE INDEX idx_equity_transactions_shareholder ON public.equity_transactions(shareholder_id);
CREATE INDEX idx_option_grants_entity ON public.option_grants(entity_id);
CREATE INDEX idx_option_grants_shareholder ON public.option_grants(shareholder_id);