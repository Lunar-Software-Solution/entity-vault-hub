-- Add is_primary to bank_accounts
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;

-- Add is_primary to directors_ubos
ALTER TABLE public.directors_ubos ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;

-- Create entity_emails table for managing multiple emails per entity
CREATE TABLE IF NOT EXISTS public.entity_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'General',
  purpose TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.entity_emails ENABLE ROW LEVEL SECURITY;

-- RLS policies for entity_emails
CREATE POLICY "Authenticated users can view entity_emails" ON public.entity_emails
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert entity_emails" ON public.entity_emails
  FOR INSERT TO authenticated WITH CHECK (public.can_write());

CREATE POLICY "Admins can update entity_emails" ON public.entity_emails
  FOR UPDATE TO authenticated USING (public.can_write());

CREATE POLICY "Admins can delete entity_emails" ON public.entity_emails
  FOR DELETE TO authenticated USING (public.can_write());

-- Timestamp trigger
CREATE TRIGGER update_entity_emails_updated_at
  BEFORE UPDATE ON public.entity_emails
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Audit triggers
CREATE TRIGGER entity_emails_audit_insert
  AFTER INSERT ON public.entity_emails
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER entity_emails_audit_update
  AFTER UPDATE ON public.entity_emails
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER entity_emails_audit_delete
  AFTER DELETE ON public.entity_emails
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();