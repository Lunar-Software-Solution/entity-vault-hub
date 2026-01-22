-- Add avatar_url column to social_media_accounts
ALTER TABLE public.social_media_accounts 
ADD COLUMN avatar_url text;