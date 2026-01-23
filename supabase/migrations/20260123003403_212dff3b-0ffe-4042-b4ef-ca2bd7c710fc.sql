-- Add due_day to entity_filings for recurring filings (e.g., 10 for the 10th of each month)
ALTER TABLE public.entity_filings 
ADD COLUMN due_day integer;

-- Add comment explaining the field
COMMENT ON COLUMN public.entity_filings.due_day IS 'Day of month for recurring filings (1-31). Used to calculate future due dates.';