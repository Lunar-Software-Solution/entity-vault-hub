-- Create inbound_document_queue table for email ingestion
CREATE TABLE public.inbound_document_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_from text NOT NULL,
  email_subject text,
  email_received_at timestamp with time zone NOT NULL DEFAULT now(),
  file_name text NOT NULL,
  file_path text NOT NULL,
  ai_analysis jsonb,
  suggested_entity_id uuid REFERENCES public.entities(id) ON DELETE SET NULL,
  suggested_doc_type_id uuid REFERENCES public.document_types(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  processed_by uuid,
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster queries on status
CREATE INDEX idx_inbound_queue_status ON public.inbound_document_queue(status);
CREATE INDEX idx_inbound_queue_created ON public.inbound_document_queue(created_at DESC);

-- Enable RLS
ALTER TABLE public.inbound_document_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies - only admins and editors can access
CREATE POLICY "Authenticated users can view inbound_document_queue"
ON public.inbound_document_queue
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with write access can create inbound_document_queue"
ON public.inbound_document_queue
FOR INSERT
WITH CHECK (can_write());

CREATE POLICY "Users with write access can update inbound_document_queue"
ON public.inbound_document_queue
FOR UPDATE
USING (can_write());

CREATE POLICY "Users with write access can delete inbound_document_queue"
ON public.inbound_document_queue
FOR DELETE
USING (can_write());

-- Trigger for updated_at
CREATE TRIGGER update_inbound_document_queue_updated_at
BEFORE UPDATE ON public.inbound_document_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();