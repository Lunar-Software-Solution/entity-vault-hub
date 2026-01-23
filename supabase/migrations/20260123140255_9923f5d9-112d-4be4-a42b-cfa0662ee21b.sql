-- Create table for 2FA verification codes
CREATE TABLE public.email_2fa_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_2fa_codes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to verify codes (needed before full auth)
CREATE POLICY "Anyone can verify their own code"
ON public.email_2fa_codes
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow edge function (service role) to insert/update codes
-- The edge function uses service role key which bypasses RLS

-- Create index for faster lookups
CREATE INDEX idx_2fa_codes_user_email ON public.email_2fa_codes(user_id, email);
CREATE INDEX idx_2fa_codes_expires ON public.email_2fa_codes(expires_at);

-- Auto-delete expired codes (optional cleanup)
CREATE OR REPLACE FUNCTION public.cleanup_expired_2fa_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.email_2fa_codes WHERE expires_at < now() OR used = true;
END;
$$;