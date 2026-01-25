-- Drop the overly permissive INSERT policy that allows any authenticated user to insert audit logs
DROP POLICY IF EXISTS "Authenticated users can create audit_logs" ON public.audit_logs;