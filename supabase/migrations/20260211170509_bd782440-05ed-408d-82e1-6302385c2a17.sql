
-- Create api_keys table for storing hashed API keys
CREATE TABLE public.api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  key_prefix text NOT NULL, -- first 8 chars for identification
  key_hash text NOT NULL, -- SHA-256 hash of the full key
  last_used_at timestamp with time zone,
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own API keys
CREATE POLICY "Users can view own api_keys"
  ON public.api_keys FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can create API keys
CREATE POLICY "Admins can create api_keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (can_write());

-- Only admins can update their own API keys
CREATE POLICY "Admins can update own api_keys"
  ON public.api_keys FOR UPDATE
  USING (can_write() AND auth.uid() = user_id);

-- Only admins can delete their own API keys
CREATE POLICY "Admins can delete own api_keys"
  ON public.api_keys FOR DELETE
  USING (can_write() AND auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
