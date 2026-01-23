-- Create the audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email_val TEXT;
BEGIN
  -- Get the user's email if authenticated
  SELECT email INTO user_email_val 
  FROM auth.users 
  WHERE id = auth.uid();

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id, user_email, action, table_name, record_id, new_values
    ) VALUES (
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
      COALESCE(user_email_val, 'system'),
      'INSERT',
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      user_id, user_email, action, table_name, record_id, old_values, new_values
    ) VALUES (
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
      COALESCE(user_email_val, 'system'),
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id, user_email, action, table_name, record_id, old_values
    ) VALUES (
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
      COALESCE(user_email_val, 'system'),
      'DELETE',
      TG_TABLE_NAME,
      OLD.id::TEXT,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers for all core tables
CREATE TRIGGER audit_entities AFTER INSERT OR UPDATE OR DELETE ON public.entities FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_bank_accounts AFTER INSERT OR UPDATE OR DELETE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_credit_cards AFTER INSERT OR UPDATE OR DELETE ON public.credit_cards FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_addresses AFTER INSERT OR UPDATE OR DELETE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_contracts AFTER INSERT OR UPDATE OR DELETE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_phone_numbers AFTER INSERT OR UPDATE OR DELETE ON public.phone_numbers FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_tax_ids AFTER INSERT OR UPDATE OR DELETE ON public.tax_ids FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_social_media_accounts AFTER INSERT OR UPDATE OR DELETE ON public.social_media_accounts FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_directors_ubos AFTER INSERT OR UPDATE OR DELETE ON public.directors_ubos FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_entity_documents AFTER INSERT OR UPDATE OR DELETE ON public.entity_documents FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_entity_filings AFTER INSERT OR UPDATE OR DELETE ON public.entity_filings FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_filing_tasks AFTER INSERT OR UPDATE OR DELETE ON public.filing_tasks FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_shareholders AFTER INSERT OR UPDATE OR DELETE ON public.shareholders FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_share_classes AFTER INSERT OR UPDATE OR DELETE ON public.share_classes FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_equity_transactions AFTER INSERT OR UPDATE OR DELETE ON public.equity_transactions FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_option_grants AFTER INSERT OR UPDATE OR DELETE ON public.option_grants FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_law_firms AFTER INSERT OR UPDATE OR DELETE ON public.law_firms FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_accountant_firms AFTER INSERT OR UPDATE OR DELETE ON public.accountant_firms FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_advisors AFTER INSERT OR UPDATE OR DELETE ON public.advisors FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_auditors AFTER INSERT OR UPDATE OR DELETE ON public.auditors FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_consultants AFTER INSERT OR UPDATE OR DELETE ON public.consultants FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_registration_agents AFTER INSERT OR UPDATE OR DELETE ON public.registration_agents FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_email_addresses AFTER INSERT OR UPDATE OR DELETE ON public.email_addresses FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_user_profiles AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_user_roles AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_team_invitations AFTER INSERT OR UPDATE OR DELETE ON public.team_invitations FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();