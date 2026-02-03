

# Email-to-Document Ingestion via Cloudflare Email Workers

## Overview

Implement an email ingestion system where users can forward documents to an email address (e.g., `documents@yourdomain.com`). Cloudflare Email Workers will process incoming emails, extract PDF attachments, and forward them to your Supabase Edge Function for AI analysis and queuing.

## Architecture

```text
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────────┐
│   User sends email  │────▶│ Cloudflare Email     │────▶│ Cloudflare Worker       │
│   with PDF attached │     │ Routing              │     │ (parse & extract)       │
└─────────────────────┘     └──────────────────────┘     └───────────┬─────────────┘
                                                                      │
                                                                      ▼
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────────┐
│   Admin reviews in  │◀────│ inbound_document_    │◀────│ Supabase Edge Function  │
│   Inbound Queue UI  │     │ queue table          │     │ (AI analysis + storage) │
└─────────────────────┘     └──────────────────────┘     └─────────────────────────┘
```

## Implementation Status: ✅ COMPLETE

### 1. Database Schema ✅

Created `inbound_document_queue` table with:
- `email_from`, `email_subject`, `email_received_at`
- `file_name`, `file_path` (storage path)
- `ai_analysis` (JSONB with extracted metadata)
- `suggested_entity_id`, `suggested_doc_type_id` (AI suggestions)
- `status` (pending/approved/rejected)
- `rejection_reason`, `processed_by`, `processed_at`
- RLS policies using `can_write()` for admin/editor access

### 2. Edge Function: `receive-inbound-email` ✅

Webhook handler that:
- Validates webhook secret (optional `INBOUND_EMAIL_WEBHOOK_SECRET`)
- Accepts POST with `from`, `subject`, `filename`, `content` (base64 PDF)
- Uploads PDF to `entity-documents` storage bucket
- Runs AI analysis using Lovable AI to extract metadata
- Inserts record into queue with status "pending"

### 3. Admin UI: Inbound Queue Section ✅

- Added "Inbound Queue" to sidebar under "Legal & Docs" group
- Stats cards showing pending/approved/rejected/total counts
- Table with search and status filters
- Actions: Preview PDF, Approve, Reject, Delete
- Approval dialog with AI suggestions pre-filled
- Entity and document type selection

### 4. Hooks ✅

Created `src/hooks/useInboundQueue.ts` with:
- `useInboundQueue(status?)` - Query queue items
- `useInboundQueueCounts()` - Get status counts
- `useApproveInboundDocument()` - Approve and move to entity_documents
- `useRejectInboundDocument()` - Reject with optional reason
- `useDeleteInboundDocument()` - Delete from queue and storage

---

## Cloudflare Setup Required (User Action)

### Step 1: Create Cloudflare Email Worker

Create a new Worker in your Cloudflare dashboard with this code:

```javascript
// Cloudflare Email Worker for Entity Hub
// Deploy this as an Email Worker in Cloudflare dashboard

import PostalMime from 'postal-mime';

export default {
  async email(message, env, ctx) {
    try {
      // Parse the incoming email
      const rawEmail = await new Response(message.raw).arrayBuffer();
      const parser = new PostalMime();
      const email = await parser.parse(rawEmail);
      
      console.log(`Processing email from: ${message.from}, subject: ${email.subject}`);
      
      // Process PDF attachments only
      const pdfAttachments = (email.attachments || []).filter(
        att => att.mimeType === 'application/pdf' || 
               att.filename?.toLowerCase().endsWith('.pdf')
      );
      
      if (pdfAttachments.length === 0) {
        console.log('No PDF attachments found, skipping');
        return;
      }
      
      for (const attachment of pdfAttachments) {
        // Convert to base64
        const base64Content = btoa(
          String.fromCharCode(...new Uint8Array(attachment.content))
        );
        
        // Send to Supabase Edge Function
        const response = await fetch(env.SUPABASE_INBOUND_WEBHOOK, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': env.WEBHOOK_SECRET || '',
          },
          body: JSON.stringify({
            from: message.from,
            subject: email.subject || '',
            filename: attachment.filename || 'document.pdf',
            content: base64Content,
            receivedAt: new Date().toISOString(),
          }),
        });
        
        if (!response.ok) {
          console.error(`Failed to process attachment: ${await response.text()}`);
        } else {
          console.log(`Successfully queued: ${attachment.filename}`);
        }
      }
    } catch (error) {
      console.error('Error processing email:', error);
    }
  }
};
```

### Step 2: Configure Worker Environment Variables

In your Cloudflare Worker settings, add these environment variables:

| Variable | Value |
|----------|-------|
| `SUPABASE_INBOUND_WEBHOOK` | `https://xxaynwfseusnxlpukwnq.supabase.co/functions/v1/receive-inbound-email` |
| `WEBHOOK_SECRET` | (Optional) A secret string for request validation |

### Step 3: Set Up Email Routing

1. Go to Cloudflare Dashboard → Your Domain → Email → Email Routing
2. Enable Email Routing if not already enabled
3. Add MX records as prompted by Cloudflare
4. Create a custom address rule:
   - Custom address: `documents@yourdomain.com`
   - Action: Send to Worker
   - Destination: Select your Email Worker

### Step 4: (Optional) Add Webhook Secret

If you set a `WEBHOOK_SECRET` in the Worker, also add it to your backend secrets:

1. Go to Settings → Connectors → Lovable Cloud
2. Add secret: `INBOUND_EMAIL_WEBHOOK_SECRET` with the same value

---

## Testing

1. Send an email with a PDF attachment to `documents@yourdomain.com`
2. The document should appear in the Inbound Queue within seconds
3. Review AI suggestions and approve to add to entity documents

## Security Notes

- Webhook secret is optional but recommended for production
- Only PDF files are accepted (validated on both Worker and Edge Function)
- Maximum file size: 10MB
- RLS policies restrict queue access to authenticated users with write permission
