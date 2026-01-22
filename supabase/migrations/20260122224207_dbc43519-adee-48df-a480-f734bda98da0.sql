-- =============================================
-- FILING MANAGEMENT SYSTEM - Database Schema
-- =============================================

-- 1. Create filing_types lookup table
CREATE TABLE public.filing_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  description TEXT,
  default_frequency TEXT NOT NULL DEFAULT 'annual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create entity_filings table
CREATE TABLE public.entity_filings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  filing_type_id UUID REFERENCES public.filing_types(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  jurisdiction TEXT,
  due_date DATE NOT NULL,
  filing_date DATE,
  frequency TEXT NOT NULL DEFAULT 'annual',
  amount NUMERIC DEFAULT 0,
  confirmation_number TEXT,
  filed_by TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reminder_days INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create filing_tasks table
CREATE TABLE public.filing_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  filing_id UUID REFERENCES public.entity_filings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_auto_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create filing_documents junction table
CREATE TABLE public.filing_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filing_id UUID NOT NULL REFERENCES public.entity_filings(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.entity_documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(filing_id, document_id)
);

-- =============================================
-- Enable Row Level Security
-- =============================================

ALTER TABLE public.filing_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filing_documents ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for filing_types
-- =============================================

CREATE POLICY "Authenticated users can view filing types"
ON public.filing_types FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create filing types"
ON public.filing_types FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update filing types"
ON public.filing_types FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete filing types"
ON public.filing_types FOR DELETE
USING (true);

-- =============================================
-- RLS Policies for entity_filings
-- =============================================

CREATE POLICY "Authenticated users can view entity filings"
ON public.entity_filings FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create entity filings"
ON public.entity_filings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update entity filings"
ON public.entity_filings FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete entity filings"
ON public.entity_filings FOR DELETE
USING (true);

-- =============================================
-- RLS Policies for filing_tasks
-- =============================================

CREATE POLICY "Authenticated users can view filing tasks"
ON public.filing_tasks FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create filing tasks"
ON public.filing_tasks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update filing tasks"
ON public.filing_tasks FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete filing tasks"
ON public.filing_tasks FOR DELETE
USING (true);

-- =============================================
-- RLS Policies for filing_documents
-- =============================================

CREATE POLICY "Authenticated users can view filing documents"
ON public.filing_documents FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create filing documents"
ON public.filing_documents FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete filing documents"
ON public.filing_documents FOR DELETE
USING (true);

-- =============================================
-- Add updated_at triggers
-- =============================================

CREATE TRIGGER update_filing_types_updated_at
BEFORE UPDATE ON public.filing_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entity_filings_updated_at
BEFORE UPDATE ON public.entity_filings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_filing_tasks_updated_at
BEFORE UPDATE ON public.filing_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Auto-generate tasks function
-- =============================================

CREATE OR REPLACE FUNCTION public.generate_filing_task()
RETURNS TRIGGER AS $$
DECLARE
  entity_name TEXT;
  filing_type_name TEXT;
  task_priority TEXT;
  days_until_due INTEGER;
BEGIN
  -- Only create task if filing has a due date and is pending
  IF NEW.due_date IS NOT NULL AND NEW.status = 'pending' THEN
    -- Calculate days until due
    days_until_due := NEW.due_date - CURRENT_DATE;
    
    -- Only create task if within reminder period and task doesn't already exist
    IF days_until_due <= NEW.reminder_days AND days_until_due >= 0 THEN
      -- Check if auto-generated task already exists for this filing
      IF NOT EXISTS (
        SELECT 1 FROM public.filing_tasks 
        WHERE filing_id = NEW.id AND is_auto_generated = true AND status != 'completed'
      ) THEN
        -- Get entity name
        SELECT name INTO entity_name FROM public.entities WHERE id = NEW.entity_id;
        
        -- Get filing type name
        IF NEW.filing_type_id IS NOT NULL THEN
          SELECT name INTO filing_type_name FROM public.filing_types WHERE id = NEW.filing_type_id;
        ELSE
          filing_type_name := 'Filing';
        END IF;
        
        -- Determine priority based on days remaining
        IF days_until_due <= 7 THEN
          task_priority := 'urgent';
        ELSIF days_until_due <= 14 THEN
          task_priority := 'high';
        ELSIF days_until_due <= 30 THEN
          task_priority := 'medium';
        ELSE
          task_priority := 'low';
        END IF;
        
        -- Create the task
        INSERT INTO public.filing_tasks (
          entity_id,
          filing_id,
          title,
          description,
          due_date,
          priority,
          status,
          is_auto_generated
        ) VALUES (
          NEW.entity_id,
          NEW.id,
          COALESCE(filing_type_name, 'Filing') || ' due for ' || COALESCE(entity_name, 'Entity'),
          'Auto-generated reminder for: ' || NEW.title,
          NEW.due_date,
          task_priority,
          'pending',
          true
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for auto-generating tasks
CREATE TRIGGER auto_generate_filing_task
AFTER INSERT OR UPDATE OF due_date, status, reminder_days ON public.entity_filings
FOR EACH ROW EXECUTE FUNCTION public.generate_filing_task();

-- =============================================
-- Seed filing types data
-- =============================================

INSERT INTO public.filing_types (code, name, category, description, default_frequency) VALUES
-- State Filings
('AR', 'Annual Report', 'State', 'Annual report filed with state Secretary of State', 'annual'),
('RAS', 'Registered Agent Statement', 'State', 'Statement of registered agent information', 'annual'),
('BL', 'Business License Renewal', 'State', 'Annual business license renewal', 'annual'),

-- Federal Filings
('BOI', 'Beneficial Ownership Information (FinCEN)', 'Federal', 'FinCEN beneficial ownership reporting', 'one-time'),
('10K', 'Form 10-K (Annual SEC Report)', 'Federal', 'Annual report for SEC-registered companies', 'annual'),
('10Q', 'Form 10-Q (Quarterly SEC Report)', 'Federal', 'Quarterly report for SEC-registered companies', 'quarterly'),

-- Sales & Use Tax
('ST-M', 'Sales Tax Return (Monthly)', 'Tax', 'Monthly sales tax return', 'monthly'),
('ST-Q', 'Sales Tax Return (Quarterly)', 'Tax', 'Quarterly sales tax return', 'quarterly'),
('ST-A', 'Sales Tax Return (Annual)', 'Tax', 'Annual sales tax return', 'annual'),
('UT', 'Use Tax Return', 'Tax', 'Use tax return for untaxed purchases', 'quarterly'),
('ST-E', 'Sales Tax Exemption Certificate Renewal', 'Tax', 'Renewal of sales tax exemption certificates', 'annual'),

-- Income & Franchise Tax
('FTX', 'Franchise Tax', 'Tax', 'State franchise tax return', 'annual'),
('1120', 'Form 1120 (C-Corp Federal Income Tax)', 'Tax', 'Federal income tax return for C corporations', 'annual'),
('1120S', 'Form 1120-S (S-Corp Federal Income Tax)', 'Tax', 'Federal income tax return for S corporations', 'annual'),
('1065', 'Form 1065 (Partnership Return)', 'Tax', 'Federal income tax return for partnerships', 'annual'),
('EST-Q', 'Estimated Tax Payment (Quarterly)', 'Tax', 'Quarterly estimated tax payments', 'quarterly'),
('SIT', 'State Income Tax Return', 'Tax', 'State income tax return', 'annual'),

-- Property Tax
('PT', 'Property Tax Return', 'Tax', 'Annual property tax return', 'annual'),
('PPT', 'Personal Property Tax Return', 'Tax', 'Business personal property tax return', 'annual'),

-- Payroll Tax
('941', 'Form 941 (Quarterly Payroll Tax)', 'Payroll', 'Quarterly federal payroll tax return', 'quarterly'),
('940', 'Form 940 (Annual FUTA Tax)', 'Payroll', 'Annual federal unemployment tax return', 'annual'),
('W2', 'Form W-2/W-3 Filing', 'Payroll', 'Annual wage and tax statement filing', 'annual'),
('1099', 'Form 1099 Filing', 'Payroll', 'Information returns for miscellaneous income', 'annual'),
('SUTA', 'State Unemployment Tax (SUTA)', 'Payroll', 'State unemployment tax return', 'quarterly'),
('WC', 'Workers Compensation Filing', 'Payroll', 'Workers compensation insurance reporting', 'annual'),

-- Other Tax
('EXT', 'Tax Extension (Form 7004)', 'Tax', 'Application for automatic extension of time to file', 'annual'),
('BIRT', 'Business Income & Receipts Tax', 'Tax', 'Local business income and receipts tax', 'annual'),
('GT', 'Gross Receipts Tax', 'Tax', 'Tax on gross receipts', 'quarterly'),
('ET', 'Excise Tax Return', 'Tax', 'Federal or state excise tax return', 'quarterly');

-- =============================================
-- Create indexes for performance
-- =============================================

CREATE INDEX idx_entity_filings_entity_id ON public.entity_filings(entity_id);
CREATE INDEX idx_entity_filings_due_date ON public.entity_filings(due_date);
CREATE INDEX idx_entity_filings_status ON public.entity_filings(status);
CREATE INDEX idx_filing_tasks_entity_id ON public.filing_tasks(entity_id);
CREATE INDEX idx_filing_tasks_filing_id ON public.filing_tasks(filing_id);
CREATE INDEX idx_filing_tasks_due_date ON public.filing_tasks(due_date);
CREATE INDEX idx_filing_tasks_status ON public.filing_tasks(status);