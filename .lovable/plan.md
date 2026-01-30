

# Add AI Analysis Feature to Director/UBO ID Documents

## Overview

This feature will add AI-powered document analysis to the Director/UBO form's ID Documents section, matching the functionality already implemented in the ShareholderForm. When a user uploads an ID document, they can click an "Analyze" button to automatically extract document details and personal information.

## What It Does

After uploading an ID document scan (passport, driver's license, etc.):
1. An "Analyze" button with a sparkle icon appears next to the uploaded file
2. Clicking it triggers AI analysis via the existing `analyze-id-document` edge function
3. Document fields (type, number, expiry date) are auto-filled
4. If personal data is extracted (name, address, DOB, nationality), the form offers to fill empty fields

## User Experience

1. User adds an ID document in the Director/UBO form
2. User uploads a scan (PDF or image)
3. The file appears with an "Analyze" button (sparkle icon)
4. User clicks Analyze → loading spinner shows
5. Upon completion:
   - Document type, number, and expiry date are auto-filled
   - If director fields are empty and data was extracted, an alert dialog prompts to apply the data
   - Toast notification confirms which fields were updated

## Technical Changes

### File 1: `src/components/forms/MultipleIdDocuments.tsx`

Add AI analysis functionality by:

1. **Add new imports**: `Sparkles` icon and `AlertDialog` components
2. **Add new prop**: `onPersonDataExtracted?: (data: ExtractedPersonData) => void`
3. **Add state**: `analyzingIndex` to track which document is being analyzed
4. **Add `handleAnalyzeDocument` function**: Calls the `analyze-id-document` edge function and updates document fields
5. **Update UI**: Add "Analyze" button next to uploaded files (matching the IdDocumentsManager style)
6. **Export `ExtractedPersonData` type**: For use by parent components

### File 2: `src/components/forms/DirectorUboForm.tsx`

Handle extracted person data by:

1. **Add state**: `extractedPersonData` and `showApplyDataDialog`
2. **Add callback handler**: Receives extracted data from `MultipleIdDocuments`
3. **Add AlertDialog**: Prompts user to apply extracted name, address, DOB, or nationality to empty form fields
4. **Pass callback to `MultipleIdDocuments`**: Wire up the `onPersonDataExtracted` prop

## Data Flow

```text
[User uploads ID scan]
         |
         v
[User clicks "Analyze" button]
         |
         v
[analyze-id-document edge function]
    |-- Downloads file from storage
    |-- AI vision analysis (Gemini 3 Flash)
    |-- Returns structured data
         |
         v
[MultipleIdDocuments component]
    |-- Auto-fills document_type, document_number, expiry_date
    |-- Calls onPersonDataExtracted with holder_name, address, etc.
         |
         v
[DirectorUboForm component]
    |-- Shows AlertDialog if any director fields are empty
    |-- User can apply extracted data or dismiss
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/forms/MultipleIdDocuments.tsx` | Add Analyze button, AI logic, callback prop |
| `src/components/forms/DirectorUboForm.tsx` | Handle extracted person data, add apply dialog |

## Visual Reference

The Analyze button will appear inline with the uploaded file, similar to how it looks in the shareholder form:

```
[📄 ID Dominic Gingras.jpg] [✨ Analyze] [✕]
```

When clicked, a loading spinner replaces the sparkle icon during analysis.

## Reuses Existing Infrastructure

- Uses the existing `analyze-id-document` edge function (no backend changes needed)
- Follows the same pattern as `IdDocumentsManager` for consistency
- Leverages the same AI model (Gemini 3 Flash) already configured

