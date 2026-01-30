

# AI-Powered ID Document Analysis for Shareholders

## Overview

This feature will add AI analysis of uploaded ID documents (passports, national IDs, driver's licenses, etc.) to automatically extract information and populate fields in both the ID document form and the shareholder form.

## What It Does

When a user uploads an ID document scan (PDF or image), the system will:
1. Analyze the document using AI vision capabilities
2. Auto-fill the ID document fields (document type, number, expiry date)
3. Optionally extract and suggest shareholder-level information (name, address)

## User Experience

1. User clicks "Upload scan" in an ID document row
2. After file upload, an "Analyze with AI" button appears (sparkle icon)
3. User clicks the button, triggering AI analysis
4. A loading spinner shows during analysis
5. Upon completion:
   - ID document fields auto-populate (type, number, expiry)
   - If shareholder fields are empty, a prompt offers to fill them (name, address)
   - Toast notification confirms which fields were updated

## Technical Implementation

### 1. New Backend Function

**File: `supabase/functions/analyze-id-document/index.ts`**

- Accepts: `filePath`, `storageFolder` (bucket path), optional `currentFormData` (to know which fields are already filled)
- Downloads the uploaded file from `id-documents` storage bucket
- Sends to Lovable AI (Gemini 3 Flash) with vision capabilities
- Uses tool calling for structured output extraction
- Returns extracted data:
  - `document_type`: Mapped to existing types (passport, national_id, drivers_license, etc.)
  - `document_number`: The ID number on the document
  - `expiry_date`: Expiration date in YYYY-MM-DD format
  - `holder_name`: Full name of the document holder
  - `holder_address`: Address if present on document
  - `date_of_birth`: DOB if present
  - `nationality`: Nationality/country if present
  - `confidence`: Analysis confidence score

### 2. Frontend Changes

**File: `src/components/shared/IdDocumentsManager.tsx`**

- Add `isAnalyzing` state to track per-document analysis status
- Add "Analyze" button (Sparkles icon) next to uploaded file
- Add `onPersonDataExtracted` callback prop to communicate with parent form
- Handle AI API call and populate document fields
- Show toast with extraction results

**File: `src/components/captable/ShareholderForm.tsx`**

- Pass callback to `IdDocumentsManager` for extracted person data
- When AI extracts name/address, offer to fill empty form fields
- Only suggest filling fields that are currently empty

### 3. Configuration

**File: `supabase/config.toml`**

- Add entry for the new edge function with `verify_jwt = false`

## Data Flow Diagram

```text
[User uploads ID scan]
         |
         v
[File stored in id-documents bucket]
         |
         v
[User clicks "Analyze" button]
         |
         v
[Edge Function: analyze-id-document]
    |-- Download file from storage
    |-- Convert to base64
    |-- Send to Lovable AI Gateway
    |-- Extract structured data via tool calling
         |
         v
[Return extracted data to frontend]
         |
         v
[IdDocumentsManager: Auto-fill document fields]
         |
         v
[ShareholderForm: Offer to fill name/address if empty]
```

## AI Prompt Strategy

The AI will receive the document image and be instructed to:
1. Identify the document type (passport, national ID, driver's license, etc.)
2. Extract the document number/ID
3. Find the expiration date
4. Read the holder's full name
5. Extract address if visible (common on driver's licenses)
6. Note nationality/issuing country

The response uses tool calling for reliable structured output with the following schema:
- `document_type`: enum matching existing types
- `document_number`: string
- `expiry_date`: YYYY-MM-DD format
- `holder_name`: string
- `holder_address`: string (optional)
- `date_of_birth`: YYYY-MM-DD format (optional)
- `nationality`: string (optional)

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/analyze-id-document/index.ts` | Create |
| `supabase/config.toml` | Modify (add function config) |
| `src/components/shared/IdDocumentsManager.tsx` | Modify (add analyze button + logic) |
| `src/components/captable/ShareholderForm.tsx` | Modify (handle extracted person data) |

## Security Considerations

- Authentication required via Authorization header
- User token validated before processing
- Service role key used only for storage access
- Rate limiting handled (429) and credit exhaustion (402)

