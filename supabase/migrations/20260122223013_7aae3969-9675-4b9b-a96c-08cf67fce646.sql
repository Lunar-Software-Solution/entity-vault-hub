-- Create document_types table (Settings lookup table)
CREATE TABLE public.document_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entity_documents table
CREATE TABLE public.entity_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  document_type_id UUID REFERENCES public.document_types(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  file_path TEXT,
  file_name TEXT,
  issued_date DATE,
  expiry_date DATE,
  issuing_authority TEXT,
  reference_number TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on document_types
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_types (shared access)
CREATE POLICY "Authenticated users can view document types"
  ON public.document_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create document types"
  ON public.document_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update document types"
  ON public.document_types FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete document types"
  ON public.document_types FOR DELETE
  TO authenticated
  USING (true);

-- Enable RLS on entity_documents
ALTER TABLE public.entity_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for entity_documents (shared access)
CREATE POLICY "Authenticated users can view entity documents"
  ON public.entity_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create entity documents"
  ON public.entity_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update entity documents"
  ON public.entity_documents FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete entity documents"
  ON public.entity_documents FOR DELETE
  TO authenticated
  USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_document_types_updated_at
  BEFORE UPDATE ON public.document_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entity_documents_updated_at
  BEFORE UPDATE ON public.entity_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for entity documents
INSERT INTO storage.buckets (id, name, public) VALUES ('entity-documents', 'entity-documents', false);

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload entity documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'entity-documents');

CREATE POLICY "Authenticated users can view entity documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'entity-documents');

CREATE POLICY "Authenticated users can update entity documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'entity-documents');

CREATE POLICY "Authenticated users can delete entity documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'entity-documents');

-- Seed initial document types
INSERT INTO public.document_types (code, name, category, description) VALUES
  ('COI', 'Certificate of Incorporation', 'Formation', 'Official document certifying the incorporation of a corporation'),
  ('COF', 'Certificate of Formation', 'Formation', 'Official document certifying the formation of an LLC'),
  ('AOI', 'Articles of Incorporation', 'Formation', 'Document establishing a corporation with the state'),
  ('AOO', 'Articles of Organization', 'Formation', 'Document establishing an LLC with the state'),
  ('SS4', 'SS4 Letter (EIN Assignment)', 'Tax', 'IRS confirmation letter assigning Employer Identification Number'),
  ('2553', 'Form 2553 (S-Corp Election)', 'Tax', 'IRS form to elect S corporation tax status'),
  ('8832', 'Form 8832 (Entity Classification)', 'Tax', 'IRS form to elect entity classification'),
  ('BYLAWS', 'Corporate Bylaws', 'Governance', 'Internal rules governing the corporation'),
  ('OA', 'Operating Agreement', 'Governance', 'Agreement governing the LLC operations'),
  ('SHARES', 'Share Certificate', 'Governance', 'Certificate evidencing ownership of shares'),
  ('RESOLUTIONS', 'Board Resolutions', 'Governance', 'Formal decisions made by the board of directors'),
  ('MINUTES', 'Meeting Minutes', 'Governance', 'Official record of meetings'),
  ('NDA', 'Non-Disclosure Agreement', 'Legal', 'Agreement to protect confidential information'),
  ('COG', 'Certificate of Good Standing', 'Legal', 'Document confirming entity is in compliance with state requirements'),
  ('FA', 'Foreign Qualification', 'Legal', 'Registration to do business in another state');