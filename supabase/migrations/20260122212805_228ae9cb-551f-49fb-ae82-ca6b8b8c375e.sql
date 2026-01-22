-- Create tax_id_types lookup table
CREATE TABLE public.tax_id_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create issuing_authorities lookup table
CREATE TABLE public.issuing_authorities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.tax_id_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issuing_authorities ENABLE ROW LEVEL SECURITY;

-- RLS policies for tax_id_types
CREATE POLICY "Authenticated users can view tax id types"
  ON public.tax_id_types FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tax id types"
  ON public.tax_id_types FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update tax id types"
  ON public.tax_id_types FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can delete tax id types"
  ON public.tax_id_types FOR DELETE USING (true);

-- RLS policies for issuing_authorities
CREATE POLICY "Authenticated users can view issuing authorities"
  ON public.issuing_authorities FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create issuing authorities"
  ON public.issuing_authorities FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update issuing authorities"
  ON public.issuing_authorities FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can delete issuing authorities"
  ON public.issuing_authorities FOR DELETE USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_tax_id_types_updated_at
  BEFORE UPDATE ON public.tax_id_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_issuing_authorities_updated_at
  BEFORE UPDATE ON public.issuing_authorities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert common tax ID types as seed data
INSERT INTO public.tax_id_types (code, label, description) VALUES
  ('EIN', 'EIN', 'Employer Identification Number (US)'),
  ('SSN', 'SSN', 'Social Security Number (US)'),
  ('ITIN', 'ITIN', 'Individual Taxpayer Identification Number (US)'),
  ('VAT', 'VAT', 'Value Added Tax Number (EU)'),
  ('GST', 'GST', 'Goods & Services Tax Number'),
  ('TIN', 'TIN', 'Tax Identification Number'),
  ('ABN', 'ABN', 'Australian Business Number'),
  ('UTR', 'UTR', 'Unique Taxpayer Reference (UK)'),
  ('PAN', 'PAN', 'Permanent Account Number (India)'),
  ('NIF', 'NIF', 'Número de Identificación Fiscal (Spain)'),
  ('RFC', 'RFC', 'Registro Federal de Contribuyentes (Mexico)'),
  ('CNPJ', 'CNPJ', 'Cadastro Nacional da Pessoa Jurídica (Brazil)');

-- Insert common issuing authorities as seed data
INSERT INTO public.issuing_authorities (name, country, description) VALUES
  ('IRS', 'United States', 'Internal Revenue Service'),
  ('HMRC', 'United Kingdom', 'HM Revenue & Customs'),
  ('CRA', 'Canada', 'Canada Revenue Agency'),
  ('ATO', 'Australia', 'Australian Taxation Office'),
  ('AFIP', 'Argentina', 'Administración Federal de Ingresos Públicos'),
  ('SAT', 'Mexico', 'Servicio de Administración Tributaria'),
  ('Receita Federal', 'Brazil', 'Secretaria da Receita Federal'),
  ('BZSt', 'Germany', 'Bundeszentralamt für Steuern'),
  ('DGFIP', 'France', 'Direction Générale des Finances Publiques'),
  ('Agenzia delle Entrate', 'Italy', 'Italian Revenue Agency'),
  ('AEAT', 'Spain', 'Agencia Estatal de Administración Tributaria'),
  ('NTA', 'Japan', 'National Tax Agency'),
  ('IRAS', 'Singapore', 'Inland Revenue Authority of Singapore');