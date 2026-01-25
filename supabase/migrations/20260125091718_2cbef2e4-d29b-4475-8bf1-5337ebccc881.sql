-- Remove the overly permissive SELECT policy from email_2fa_codes
-- Edge functions use service role key which bypasses RLS, so client access is unnecessary
-- This eliminates the risk of 2FA code exposure

DROP POLICY IF EXISTS "Anyone can verify their own code" ON public.email_2fa_codes;