-- Fix audit trigger to cast record_id properly
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      NEW.id::UUID,
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
      NEW.id::UUID,
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
      OLD.id::UUID,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;