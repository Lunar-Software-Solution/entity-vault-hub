-- Create directors and UBOs table
CREATE TABLE public.directors_ubos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role_type TEXT NOT NULL DEFAULT 'director', -- 'director', 'ubo', 'both'
  title TEXT, -- e.g., 'CEO', 'CFO', 'Chairman', 'Board Member'
  nationality TEXT,
  country_of_residence TEXT,
  date_of_birth DATE,
  appointment_date DATE,
  resignation_date DATE,
  ownership_percentage NUMERIC, -- For UBOs, percentage of ownership
  control_type TEXT, -- 'direct', 'indirect', 'voting_rights', 'other'
  tax_id TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  passport_number TEXT,
  id_document_type TEXT, -- 'passport', 'national_id', 'drivers_license'
  id_document_number TEXT,
  id_expiry_date DATE,
  is_pep BOOLEAN DEFAULT false, -- Politically Exposed Person
  pep_details TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.directors_ubos ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view directors_ubos"
  ON public.directors_ubos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create directors_ubos"
  ON public.directors_ubos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update directors_ubos"
  ON public.directors_ubos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete directors_ubos"
  ON public.directors_ubos FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_directors_ubos_updated_at
  BEFORE UPDATE ON public.directors_ubos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();