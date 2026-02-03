

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

## Implementation Components

### 1. Database Schema

Create `inbound_document_queue` table to store pending documents:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email_from | text | Sender email address |
| email_subject | text | Original email subject |
| email_received_at | timestamptz | When email was received |
| file_name | text | Original attachment filename |
| file_path | text | Storage path in entity-documents bucket |
| ai_analysis | jsonb | AI-extracted metadata |
| suggested_entity_id | uuid | AI-suggested entity match |
| suggested_doc_type_id | uuid | AI-suggested document type |
| status | text | pending / approved / rejected |
| processed_by | uuid | User who approved/rejected |
| processed_at | timestamptz | When processed |
| created_at / updated_at | timestamptz | Timestamps |

RLS policies will restrict access to authenticated users with admin role.

### 2. Cloudflare Email Worker

A Cloudflare Worker script that:
- Receives inbound emails via the `email()` event handler
- Parses email content using `postal-mime` library
- Extracts PDF attachments (validates file type)
- Forwards attachment data to Supabase Edge Function via HTTP POST
- Logs success/failure for monitoring

```javascript
// Simplified example structure
import PostalMime from 'postal-mime';

export default {
  async email(message, env, ctx) {
    const email = await PostalMime.parse(message.raw);
    
    for (const attachment of email.attachments) {
      if (attachment.mimeType === 'application/pdf') {
        await fetch(env.SUPABASE_INBOUND_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: message.from,
            subject: email.subject,
            filename: attachment.filename,
            content: attachment.content, // base64
          })
        });
      }
    }
  }
}
```

### 3. Supabase Edge Function: `receive-inbound-email`

Create new Edge Function to:
- Receive webhook POST from Cloudflare Worker
- Validate payload structure
- Upload PDF to `entity-documents` storage bucket
- Call existing AI analysis logic (reuse from `analyze-bulk-documents`)
- Insert record into `inbound_document_queue` with status "pending"
- Optionally send confirmation email to sender

### 4. Admin UI: Inbound Queue Section

Create new section in the portal for reviewing queued documents:

**Sidebar Addition:**
- Add "Inbound Queue" item under the "Legal & Docs" group with an Inbox icon

**Queue List View:**
- Display pending documents with sender, subject, filename, AI suggestions
- Show confidence scores for entity/type matching
- Filter by status (pending/approved/rejected)

**Review Actions:**
- Preview PDF in modal
- Override AI suggestions for entity and document type
- Approve (moves to entity_documents table)
- Reject (marks as rejected with optional reason)
- Bulk approve selected items

**Approval Flow:**
1. Select entity (defaults to AI suggestion)
2. Select document type (defaults to AI suggestion)
3. Add optional notes
4. Click Approve → document inserted into `entity_documents`

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/receive-inbound-email/index.ts` | Webhook handler for Cloudflare Worker |
| `src/components/documents/InboundQueueSection.tsx` | Main queue UI component |
| `src/components/documents/InboundQueueItem.tsx` | Individual queue item display |
| `src/components/documents/InboundApprovalDialog.tsx` | Approval modal with entity/type selection |
| `src/hooks/useInboundQueue.ts` | Query and mutation hooks |
| Database migration | Create `inbound_document_queue` table |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/layout/Sidebar.tsx` | Add "Inbound Queue" menu item |
| `src/pages/Index.tsx` | Add section routing for inbound-queue |
| `supabase/config.toml` | Add function configuration |

## Cloudflare Setup Required (User Action)

After implementation, you will need to configure Cloudflare:

1. **Enable Email Routing** on your domain in Cloudflare dashboard
2. **Create Email Worker** using the provided script
3. **Create Email Rule** to route `documents@yourdomain.com` to the Worker
4. **Set Environment Variables** in Worker settings:
   - `SUPABASE_INBOUND_WEBHOOK`: Your Edge Function URL
   - `WEBHOOK_SECRET`: Shared secret for request validation

## Security Considerations

- Validate webhook requests using shared secret
- Restrict accepted sender addresses (optional whitelist)
- File type validation (PDF only)
- Maximum attachment size: 10MB
- Rate limiting on Edge Function
- RLS policies restrict queue access to admin users

## Implementation Sequence

1. **Database** - Create `inbound_document_queue` table with RLS
2. **Edge Function** - Build `receive-inbound-email` webhook handler
3. **Hooks** - Create data fetching and mutation hooks
4. **UI** - Build InboundQueueSection with list and approval flow
5. **Sidebar** - Add navigation link
6. **Documentation** - Provide Cloudflare setup instructions

