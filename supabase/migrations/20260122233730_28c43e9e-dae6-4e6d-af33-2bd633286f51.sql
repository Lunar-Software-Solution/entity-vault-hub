-- Add entity_id column to social_media_accounts
ALTER TABLE public.social_media_accounts 
ADD COLUMN entity_id uuid REFERENCES public.entities(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_social_media_accounts_entity_id ON public.social_media_accounts(entity_id);