-- Create storage bucket for contract files
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-files', 'contract-files', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload contract files
CREATE POLICY "Authenticated users can upload contract files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contract-files');

-- Allow authenticated users to view contract files
CREATE POLICY "Authenticated users can view contract files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contract-files');

-- Allow authenticated users to delete their contract files
CREATE POLICY "Authenticated users can delete contract files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'contract-files');

-- Add columns to contracts table for file and AI summary
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS summary_generated_at TIMESTAMP WITH TIME ZONE;