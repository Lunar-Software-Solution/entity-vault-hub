-- Create function to reset recurring filings after due date passes
CREATE OR REPLACE FUNCTION public.reset_recurring_filings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE entity_filings
  SET 
    status = 'pending',
    filing_date = NULL,
    confirmation_number = NULL,
    due_date = CASE frequency
      WHEN 'monthly' THEN due_date + INTERVAL '1 month'
      WHEN 'quarterly' THEN due_date + INTERVAL '3 months'
      WHEN 'semi-annual' THEN due_date + INTERVAL '6 months'
      WHEN 'annual' THEN due_date + INTERVAL '1 year'
      ELSE due_date
    END
  WHERE 
    status = 'filed' 
    AND frequency != 'one-time'
    AND due_date < CURRENT_DATE;
END;
$$;