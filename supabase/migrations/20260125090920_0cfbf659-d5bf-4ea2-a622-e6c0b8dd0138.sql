-- Fix the email exposure vulnerability in team_invitations
-- The current policy allows reading ALL invitations if token IS NOT NULL
-- We need to restrict it so anon users can ONLY see an invitation if they provide the exact token

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can validate invitation by token" ON public.team_invitations;

-- Create a security definer function that validates invitation tokens
-- This returns limited data only when an exact token match is found
CREATE OR REPLACE FUNCTION public.validate_invitation_token(invite_token TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  role TEXT,
  status TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email, role, status, expires_at
  FROM public.team_invitations
  WHERE token = invite_token
  LIMIT 1;
$$;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION public.validate_invitation_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_invitation_token(TEXT) TO authenticated;