-- Create shareholder_id_documents table (similar to director_id_documents)
CREATE TABLE public.shareholder_id_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shareholder_id UUID NOT NULL REFERENCES public.shareholders(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_number TEXT,
  expiry_date DATE,
  file_path TEXT,
  file_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shareholder_id_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view shareholder_id_documents"
  ON public.shareholder_id_documents
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write access can create shareholder_id_documents"
  ON public.shareholder_id_documents
  FOR INSERT
  WITH CHECK (can_write());

CREATE POLICY "Users with write access can update shareholder_id_documents"
  ON public.shareholder_id_documents
  FOR UPDATE
  USING (can_write());

CREATE POLICY "Users with write access can delete shareholder_id_documents"
  ON public.shareholder_id_documents
  FOR DELETE
  USING (can_write());

-- Add updated_at trigger
CREATE TRIGGER update_shareholder_id_documents_updated_at
  BEFORE UPDATE ON public.shareholder_id_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();