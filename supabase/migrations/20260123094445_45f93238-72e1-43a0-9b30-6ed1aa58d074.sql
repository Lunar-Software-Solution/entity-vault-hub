-- Create table for director ID documents (supports multiple per director)
CREATE TABLE public.director_id_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  director_id UUID NOT NULL REFERENCES public.directors_ubos(id) ON DELETE CASCADE,
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
ALTER TABLE public.director_id_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (matching existing pattern)
CREATE POLICY "Allow read access to authenticated users"
ON public.director_id_documents FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow insert for users with write access"
ON public.director_id_documents FOR INSERT
WITH CHECK (public.can_write());

CREATE POLICY "Allow update for users with write access"
ON public.director_id_documents FOR UPDATE
USING (public.can_write());

CREATE POLICY "Allow delete for users with write access"
ON public.director_id_documents FOR DELETE
USING (public.can_write());

-- Create trigger for updated_at
CREATE TRIGGER update_director_id_documents_updated_at
BEFORE UPDATE ON public.director_id_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();