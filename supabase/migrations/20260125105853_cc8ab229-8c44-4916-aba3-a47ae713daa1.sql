-- Enable Row Level Security on email_2fa_codes table
ALTER TABLE public.email_2fa_codes ENABLE ROW LEVEL SECURITY;

-- No SELECT policy - codes should never be readable directly by users
-- All code validation happens server-side via edge functions with service role

-- No INSERT/UPDATE/DELETE policies for regular users
-- All code management happens server-side via edge functions with service role

-- This ensures the table is completely locked down from direct client access
-- Only edge functions using SUPABASE_SERVICE_ROLE_KEY can access this table