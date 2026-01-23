-- Create software catalog lookup table (managed in Settings)
CREATE TABLE public.software_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  vendor TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entity software table (links entities to software with credentials)
CREATE TABLE public.entity_software (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  software_id UUID REFERENCES public.software_catalog(id) ON DELETE SET NULL,
  custom_name TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  login_url TEXT,
  account_email TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  license_type TEXT,
  license_expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.software_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_software ENABLE ROW LEVEL SECURITY;

-- RLS policies for software_catalog
CREATE POLICY "Authenticated users can view software catalog" ON public.software_catalog
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert software catalog" ON public.software_catalog
  FOR INSERT WITH CHECK (public.can_write());

CREATE POLICY "Admins can update software catalog" ON public.software_catalog
  FOR UPDATE USING (public.can_write());

CREATE POLICY "Admins can delete software catalog" ON public.software_catalog
  FOR DELETE USING (public.can_write());

-- RLS policies for entity_software
CREATE POLICY "Authenticated users can view entity software" ON public.entity_software
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert entity software" ON public.entity_software
  FOR INSERT WITH CHECK (public.can_write());

CREATE POLICY "Admins can update entity software" ON public.entity_software
  FOR UPDATE USING (public.can_write());

CREATE POLICY "Admins can delete entity software" ON public.entity_software
  FOR DELETE USING (public.can_write());

-- Create indexes
CREATE INDEX idx_entity_software_entity_id ON public.entity_software(entity_id);
CREATE INDEX idx_entity_software_software_id ON public.entity_software(software_id);
CREATE INDEX idx_software_catalog_category ON public.software_catalog(category);

-- Add updated_at triggers
CREATE TRIGGER update_software_catalog_updated_at
  BEFORE UPDATE ON public.software_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entity_software_updated_at
  BEFORE UPDATE ON public.entity_software
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit triggers
CREATE TRIGGER audit_software_catalog
  AFTER INSERT OR UPDATE OR DELETE ON public.software_catalog
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_entity_software
  AFTER INSERT OR UPDATE OR DELETE ON public.entity_software
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Insert common software options
INSERT INTO public.software_catalog (name, category, vendor, website) VALUES
  ('SAP S/4HANA', 'erp', 'SAP', 'https://www.sap.com'),
  ('Oracle NetSuite', 'erp', 'Oracle', 'https://www.netsuite.com'),
  ('Microsoft Dynamics 365', 'erp', 'Microsoft', 'https://dynamics.microsoft.com'),
  ('Sage Intacct', 'erp', 'Sage', 'https://www.sageintacct.com'),
  ('QuickBooks Online', 'accounting', 'Intuit', 'https://quickbooks.intuit.com'),
  ('Xero', 'accounting', 'Xero', 'https://www.xero.com'),
  ('FreshBooks', 'accounting', 'FreshBooks', 'https://www.freshbooks.com'),
  ('Wave', 'accounting', 'Wave', 'https://www.waveapps.com'),
  ('Gusto', 'payroll', 'Gusto', 'https://gusto.com'),
  ('ADP Workforce Now', 'payroll', 'ADP', 'https://www.adp.com'),
  ('Paychex Flex', 'payroll', 'Paychex', 'https://www.paychex.com'),
  ('Rippling', 'payroll', 'Rippling', 'https://www.rippling.com'),
  ('Tableau', 'business_intelligence', 'Salesforce', 'https://www.tableau.com'),
  ('Power BI', 'business_intelligence', 'Microsoft', 'https://powerbi.microsoft.com'),
  ('Looker', 'business_intelligence', 'Google', 'https://looker.com'),
  ('Domo', 'business_intelligence', 'Domo', 'https://www.domo.com'),
  ('HubSpot', 'crm', 'HubSpot', 'https://www.hubspot.com'),
  ('Salesforce', 'crm', 'Salesforce', 'https://www.salesforce.com'),
  ('Zoho CRM', 'crm', 'Zoho', 'https://www.zoho.com/crm'),
  ('Pipedrive', 'crm', 'Pipedrive', 'https://www.pipedrive.com'),
  ('Monday.com', 'project_management', 'Monday', 'https://monday.com'),
  ('Asana', 'project_management', 'Asana', 'https://asana.com'),
  ('Jira', 'project_management', 'Atlassian', 'https://www.atlassian.com/software/jira'),
  ('Trello', 'project_management', 'Atlassian', 'https://trello.com'),
  ('Slack', 'communication', 'Salesforce', 'https://slack.com'),
  ('Microsoft Teams', 'communication', 'Microsoft', 'https://www.microsoft.com/microsoft-teams'),
  ('Zoom', 'communication', 'Zoom', 'https://zoom.us'),
  ('Google Workspace', 'productivity', 'Google', 'https://workspace.google.com'),
  ('Microsoft 365', 'productivity', 'Microsoft', 'https://www.microsoft.com/microsoft-365');