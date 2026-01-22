-- Create accountant_firms table
CREATE TABLE public.accountant_firms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  linkedin_url TEXT,
  address TEXT,
  license_number TEXT,
  specializations TEXT[] DEFAULT '{}',
  engagement_start_date DATE,
  engagement_end_date DATE,
  fee_structure TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create law_firms table
CREATE TABLE public.law_firms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  linkedin_url TEXT,
  address TEXT,
  bar_number TEXT,
  practice_areas TEXT[] DEFAULT '{}',
  engagement_start_date DATE,
  engagement_end_date DATE,
  fee_structure TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create registration_agents table
CREATE TABLE public.registration_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  linkedin_url TEXT,
  address TEXT,
  agent_type TEXT,
  jurisdictions_covered TEXT[] DEFAULT '{}',
  engagement_start_date DATE,
  engagement_end_date DATE,
  fee_structure TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create advisors table
CREATE TABLE public.advisors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  linkedin_url TEXT,
  address TEXT,
  advisor_type TEXT,
  certifications TEXT[] DEFAULT '{}',
  engagement_start_date DATE,
  engagement_end_date DATE,
  fee_structure TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create consultants table
CREATE TABLE public.consultants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  linkedin_url TEXT,
  address TEXT,
  consultant_type TEXT,
  project_scope TEXT,
  engagement_start_date DATE,
  engagement_end_date DATE,
  fee_structure TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create auditors table
CREATE TABLE public.auditors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  linkedin_url TEXT,
  address TEXT,
  license_number TEXT,
  audit_types TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  engagement_start_date DATE,
  engagement_end_date DATE,
  fee_structure TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create entity_provider_contracts junction table
CREATE TABLE public.entity_provider_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_type TEXT NOT NULL,
  provider_id UUID NOT NULL,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.accountant_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.law_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_provider_contracts ENABLE ROW LEVEL SECURITY;

-- RLS policies for accountant_firms
CREATE POLICY "Authenticated users can view accountant firms" ON public.accountant_firms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create accountant firms" ON public.accountant_firms FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update accountant firms" ON public.accountant_firms FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete accountant firms" ON public.accountant_firms FOR DELETE USING (true);

-- RLS policies for law_firms
CREATE POLICY "Authenticated users can view law firms" ON public.law_firms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create law firms" ON public.law_firms FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update law firms" ON public.law_firms FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete law firms" ON public.law_firms FOR DELETE USING (true);

-- RLS policies for registration_agents
CREATE POLICY "Authenticated users can view registration agents" ON public.registration_agents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create registration agents" ON public.registration_agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update registration agents" ON public.registration_agents FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete registration agents" ON public.registration_agents FOR DELETE USING (true);

-- RLS policies for advisors
CREATE POLICY "Authenticated users can view advisors" ON public.advisors FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create advisors" ON public.advisors FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update advisors" ON public.advisors FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete advisors" ON public.advisors FOR DELETE USING (true);

-- RLS policies for consultants
CREATE POLICY "Authenticated users can view consultants" ON public.consultants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create consultants" ON public.consultants FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update consultants" ON public.consultants FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete consultants" ON public.consultants FOR DELETE USING (true);

-- RLS policies for auditors
CREATE POLICY "Authenticated users can view auditors" ON public.auditors FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create auditors" ON public.auditors FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update auditors" ON public.auditors FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete auditors" ON public.auditors FOR DELETE USING (true);

-- RLS policies for entity_provider_contracts
CREATE POLICY "Authenticated users can view provider contracts" ON public.entity_provider_contracts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create provider contracts" ON public.entity_provider_contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update provider contracts" ON public.entity_provider_contracts FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete provider contracts" ON public.entity_provider_contracts FOR DELETE USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_accountant_firms_updated_at BEFORE UPDATE ON public.accountant_firms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_law_firms_updated_at BEFORE UPDATE ON public.law_firms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_registration_agents_updated_at BEFORE UPDATE ON public.registration_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_advisors_updated_at BEFORE UPDATE ON public.advisors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consultants_updated_at BEFORE UPDATE ON public.consultants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_auditors_updated_at BEFORE UPDATE ON public.auditors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();