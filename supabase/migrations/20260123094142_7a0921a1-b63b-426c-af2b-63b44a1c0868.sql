-- Create storage bucket for ID documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-documents', 'id-documents', false);

-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload ID documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'id-documents' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to view files
CREATE POLICY "Users can view ID documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'id-documents' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to delete their files
CREATE POLICY "Users can delete ID documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'id-documents' AND auth.uid() IS NOT NULL);

-- Add column to directors_ubos table for storing file path
ALTER TABLE public.directors_ubos
ADD COLUMN IF NOT EXISTS id_document_file_path TEXT,
ADD COLUMN IF NOT EXISTS id_document_file_name TEXT;