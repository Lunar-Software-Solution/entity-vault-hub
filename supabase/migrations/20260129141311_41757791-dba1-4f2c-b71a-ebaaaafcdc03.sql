-- Create website_types lookup table
CREATE TABLE public.website_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.website_types ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view website types" 
ON public.website_types 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create website types" 
ON public.website_types 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update website types" 
ON public.website_types 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete website types" 
ON public.website_types 
FOR DELETE 
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_website_types_updated_at
BEFORE UPDATE ON public.website_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default website types
INSERT INTO public.website_types (code, name, description) VALUES
  ('corporate', 'Corporate', 'Main corporate website'),
  ('ecommerce', 'E-Commerce', 'Online store or shopping platform'),
  ('marketing', 'Marketing', 'Marketing or promotional website'),
  ('landing', 'Landing Page', 'Single-page landing or campaign page'),
  ('blog', 'Blog', 'Blog or content publishing site'),
  ('support', 'Support Portal', 'Customer support or help center'),
  ('documentation', 'Documentation', 'Technical or product documentation'),
  ('app', 'Web App', 'Web application or SaaS product'),
  ('other', 'Other', 'Other website type');