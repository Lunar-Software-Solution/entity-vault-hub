
-- Create storage bucket for task documents
INSERT INTO storage.buckets (id, name, public) VALUES ('task-documents', 'task-documents', false);

-- Create table to track task document attachments
CREATE TABLE public.filing_task_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.filing_tasks(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.filing_task_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies (match filing_tasks access pattern)
CREATE POLICY "Authenticated users can view task documents"
  ON public.filing_task_documents FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert task documents"
  ON public.filing_task_documents FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete task documents"
  ON public.filing_task_documents FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Storage policies
CREATE POLICY "Authenticated users can upload task documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'task-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view task documents storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'task-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete task documents storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'task-documents' AND auth.uid() IS NOT NULL);
