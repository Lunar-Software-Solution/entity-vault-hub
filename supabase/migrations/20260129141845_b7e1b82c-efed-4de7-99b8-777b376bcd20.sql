-- Create website_platforms table for managing platform types
CREATE TABLE IF NOT EXISTS public.website_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.website_platforms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view website platforms"
  ON public.website_platforms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users with write access can manage website platforms"
  ON public.website_platforms FOR ALL
  TO authenticated
  USING (public.can_write())
  WITH CHECK (public.can_write());

-- Create updated_at trigger
CREATE TRIGGER update_website_platforms_updated_at
  BEFORE UPDATE ON public.website_platforms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with default platforms
INSERT INTO public.website_platforms (code, name, description) VALUES
  ('wordpress', 'WordPress', 'Popular open-source CMS'),
  ('shopify', 'Shopify', 'E-commerce platform'),
  ('squarespace', 'Squarespace', 'Website builder'),
  ('wix', 'Wix', 'Website builder'),
  ('webflow', 'Webflow', 'Visual web design tool'),
  ('magento', 'Magento', 'E-commerce platform'),
  ('woocommerce', 'WooCommerce', 'WordPress e-commerce plugin'),
  ('bigcommerce', 'BigCommerce', 'E-commerce platform'),
  ('hubspot', 'HubSpot', 'CRM and CMS platform'),
  ('ghost', 'Ghost', 'Publishing platform'),
  ('drupal', 'Drupal', 'Open-source CMS'),
  ('joomla', 'Joomla', 'Open-source CMS'),
  ('custom', 'Custom Built', 'Custom developed website'),
  ('react', 'React/Next.js', 'React-based framework'),
  ('vue', 'Vue/Nuxt', 'Vue-based framework'),
  ('angular', 'Angular', 'Angular framework'),
  ('directus', 'Directus', 'Headless CMS'),
  ('strapi', 'Strapi', 'Headless CMS'),
  ('contentful', 'Contentful', 'Headless CMS'),
  ('sanity', 'Sanity', 'Headless CMS'),
  ('aws', 'AWS', 'Amazon Web Services'),
  ('vercel', 'Vercel', 'Frontend deployment platform'),
  ('netlify', 'Netlify', 'Frontend deployment platform'),
  ('cloudflare', 'Cloudflare Pages', 'Cloudflare hosting'),
  ('other', 'Other', 'Other platform')
ON CONFLICT (code) DO NOTHING;