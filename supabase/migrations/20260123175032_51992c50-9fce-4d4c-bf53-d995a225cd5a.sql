-- Create entity_websites table for tracking websites/URLs
CREATE TABLE public.entity_websites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'corporate',
  platform TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  ssl_expiry_date DATE,
  domain_expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.entity_websites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (shared access model)
CREATE POLICY "Authenticated users can view entity websites"
  ON public.entity_websites FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert entity websites"
  ON public.entity_websites FOR INSERT
  TO authenticated
  WITH CHECK (public.can_write());

CREATE POLICY "Admins can update entity websites"
  ON public.entity_websites FOR UPDATE
  TO authenticated
  USING (public.can_write());

CREATE POLICY "Admins can delete entity websites"
  ON public.entity_websites FOR DELETE
  TO authenticated
  USING (public.can_write());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_entity_websites_updated_at
  BEFORE UPDATE ON public.entity_websites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit trigger
CREATE TRIGGER entity_websites_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.entity_websites
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();

-- Add index for faster lookups
CREATE INDEX idx_entity_websites_entity_id ON public.entity_websites(entity_id);