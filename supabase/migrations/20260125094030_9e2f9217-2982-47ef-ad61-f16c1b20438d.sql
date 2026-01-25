-- Add storage policies for director/shareholder avatars
-- These use the can_write() function to check if user has write access

-- Allow authenticated users with write access to upload director/shareholder avatars
CREATE POLICY "Users can upload director avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] IN ('directors_ubos', 'shareholders')
  AND auth.uid() IS NOT NULL
);

-- Allow authenticated users to update director/shareholder avatars
CREATE POLICY "Users can update director avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] IN ('directors_ubos', 'shareholders')
  AND auth.uid() IS NOT NULL
);

-- Allow authenticated users to delete director/shareholder avatars
CREATE POLICY "Users can delete director avatars"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] IN ('directors_ubos', 'shareholders')
  AND auth.uid() IS NOT NULL
);