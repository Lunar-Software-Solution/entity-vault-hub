-- Add fiscal year end to entities (stored as month-day, e.g., '12-31' for December 31)
ALTER TABLE public.entities 
ADD COLUMN fiscal_year_end text DEFAULT '12-31';

-- Add comment explaining the format
COMMENT ON COLUMN public.entities.fiscal_year_end IS 'Fiscal year end in MM-DD format (e.g., 12-31 for December 31)';