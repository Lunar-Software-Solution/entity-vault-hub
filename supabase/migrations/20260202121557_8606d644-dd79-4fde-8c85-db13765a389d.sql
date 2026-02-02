-- Create payment_providers lookup table
CREATE TABLE public.payment_providers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  website text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;

-- RLS Policies (matching website_platforms pattern)
CREATE POLICY "Authenticated users can view payment_providers"
  ON public.payment_providers
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write access can create payment_providers"
  ON public.payment_providers
  FOR INSERT
  WITH CHECK (can_write());

CREATE POLICY "Users with write access can update payment_providers"
  ON public.payment_providers
  FOR UPDATE
  USING (can_write());

CREATE POLICY "Users with write access can delete payment_providers"
  ON public.payment_providers
  FOR DELETE
  USING (can_write());

-- Updated_at trigger
CREATE TRIGGER update_payment_providers_updated_at
  BEFORE UPDATE ON public.payment_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Audit trigger
CREATE TRIGGER audit_payment_providers
  AFTER INSERT OR UPDATE OR DELETE ON public.payment_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();

-- Seed common payment providers
INSERT INTO public.payment_providers (code, name, website, description) VALUES
  ('stripe', 'Stripe', 'https://stripe.com', 'Online payment processing platform'),
  ('square', 'Square', 'https://squareup.com', 'Payment and point of sale solutions'),
  ('paypal', 'PayPal', 'https://paypal.com', 'Digital payment platform'),
  ('adyen', 'Adyen', 'https://adyen.com', 'Global payment company'),
  ('braintree', 'Braintree', 'https://braintreepayments.com', 'Full-stack payment platform'),
  ('authorizenet', 'Authorize.Net', 'https://authorize.net', 'Payment gateway service'),
  ('worldpay', 'Worldpay', 'https://worldpay.com', 'Global payment processing'),
  ('shopify_payments', 'Shopify Payments', 'https://shopify.com/payments', 'Shopify integrated payments'),
  ('checkout', 'Checkout.com', 'https://checkout.com', 'Cloud-based payment platform'),
  ('2checkout', '2Checkout', 'https://2checkout.com', 'Digital commerce platform'),
  ('amazon_pay', 'Amazon Pay', 'https://pay.amazon.com', 'Amazon payment service'),
  ('apple_pay', 'Apple Pay', 'https://apple.com/apple-pay', 'Apple mobile payment'),
  ('google_pay', 'Google Pay', 'https://pay.google.com', 'Google payment service'),
  ('payoneer', 'Payoneer', 'https://payoneer.com', 'Cross-border payment platform'),
  ('wise', 'Wise Business', 'https://wise.com/business', 'International business payments');