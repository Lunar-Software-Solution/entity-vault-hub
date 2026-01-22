

# Corporate Document Management Implementation Plan

## Overview
Add a comprehensive corporate document management system that allows users to:
1. **Define custom document types** in Settings (e.g., Incorporation Documents, Tax Forms, Share Certificates, Bylaws, SS4 Letters, Operating Agreements)
2. **Upload and manage documents** linked to each entity with PDF file storage
3. **Track document metadata** including issue dates, expiration dates, and notes

This follows the existing patterns used for Tax ID Types/Issuing Authorities in Settings, and the contract file upload functionality.

---

## Database Schema

### New Tables (2 tables)

#### 1. document_types (Settings lookup table)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| code | text | Short code (e.g., "SS4", "COI", "BYLAWS") |
| name | text | Display name (e.g., "SS4 Letter", "Certificate of Incorporation") |
| category | text | Category grouping (Formation, Tax, Governance, Legal) |
| description | text | Optional description |
| created_at/updated_at | timestamptz | Timestamps |

#### 2. entity_documents (Documents linked to entities)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| entity_id | uuid (FK) | Links to parent entity (CASCADE delete) |
| document_type_id | uuid (FK) | Links to document_types table |
| title | text | Document title/name |
| file_path | text | Storage path for the file |
| file_name | text | Original file name |
| issued_date | date | When document was issued |
| expiry_date | date | Expiration date (if applicable) |
| issuing_authority | text | Who issued it (e.g., "Delaware Secretary of State") |
| reference_number | text | Document/filing reference number |
| notes | text | Additional notes |
| status | text | current, superseded, expired |
| created_at/updated_at | timestamptz | Timestamps |

---

## Storage Bucket

Create a new storage bucket `entity-documents` for storing uploaded PDFs (following the existing `contract-files` pattern).

---

## Row Level Security
All tables follow the existing shared-access pattern:
- All authenticated users can SELECT, INSERT, UPDATE, DELETE
- No user-specific scoping (collaborative team access)

---

## Implementation Steps

### Step 1: Database Migration
- Create `document_types` table with RLS policies
- Create `entity_documents` table with RLS policies and foreign keys
- Create storage bucket `entity-documents` with appropriate RLS
- Add `updated_at` triggers
- Seed initial document types (common corporate documents)

### Step 2: TypeScript Types & Hooks

**New types in usePortalData.ts:**
- DocumentType
- EntityDocument

**New query hooks:**
- useDocumentTypes()
- useEntityDocuments()

### Step 3: Mutation Hooks

**In usePortalMutations.ts:**
- CRUD hooks for document types:
  - useCreateDocumentType, useUpdateDocumentType, useDeleteDocumentType
- CRUD hooks for entity documents:
  - useCreateEntityDocument, useUpdateEntityDocument, useDeleteEntityDocument

### Step 4: Zod Validation Schemas

**In formSchemas.ts:**
- documentTypeSchema (code, name, category, description)
- entityDocumentSchema (entity_id, document_type_id, title, dates, notes, status)

### Step 5: Settings Section - Document Types Tab

**Update SettingsSection.tsx:**
- Add a new tab "Document Types" alongside Tax ID Types and Issuing Authorities
- Include search, sort, add/edit/delete functionality
- Display category badges for organization

### Step 6: Document Upload Component

**New component:**
- `src/components/documents/DocumentFileUpload.tsx`
- Similar to ContractFileUpload but for entity documents
- Supports PDF upload to `entity-documents` bucket

### Step 7: Entity Document Form

**New form component:**
- `src/components/forms/EntityDocumentForm.tsx`
- Fields: Document Type (dropdown), Title, File Upload, Issued Date, Expiry Date, Issuing Authority, Reference Number, Notes, Status

### Step 8: Entity Detail - Linked Documents

**New linked component:**
- `src/components/entity-detail/LinkedDocuments.tsx`
- Display document cards with:
  - Document type badge (with category color)
  - Title and file name
  - Issue/expiry dates
  - Status indicator (current/superseded/expired)
  - View PDF button
  - Edit/Delete actions

### Step 9: Documents Section (Optional top-level view)

**New section component:**
- `src/components/sections/DocumentsSection.tsx`
- Table view of all documents across entities
- Filter by entity, document type, category, status
- Search functionality

### Step 10: Update EntityDetail.tsx

- Import and use new hooks
- Add document count stat card
- Add LinkedDocuments section to the grid

### Step 11: Update Sidebar & Index.tsx

- Add "Documents" menu item to sidebar
- Add DocumentsSection to route handling

---

## UI Layout Changes

### Settings - New Tab

```text
+--------------------------------------------------+
| Settings                                         |
+--------------------------------------------------+
| [Tax ID Types] [Issuing Authorities] [Document Types] |
+--------------------------------------------------+
| Document Types                        [+ Add Type] |
|                                                    |
| Search: [__________________]                       |
|                                                    |
| Code    | Name                      | Category     |
|---------|---------------------------|--------------|
| COI     | Certificate of Inc.       | [Formation]  |
| SS4     | SS4 Letter                | [Tax]        |
| BYLAWS  | Bylaws                    | [Governance] |
| SHARES  | Share Certificate         | [Governance] |
| OA      | Operating Agreement       | [Legal]      |
+--------------------------------------------------+
```

### Entity Detail - Document Cards

```text
+------------------------------------------+
| [FileText] Documents                     |
|          5 linked                        |
+------------------------------------------+
| +--------------------------------------+ |
| | [Formation] Certificate of Inc.      | |
| | Delaware Certificate of Formation    | |
| | Filed: Jan 15, 2020                  | |
| | Ref: 12345678              [Current] | |
| | [View PDF] [Edit] [Delete]           | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [Tax] SS4 Letter                     | |
| | EIN Assignment Letter                | |
| | Issued: Feb 1, 2020                  | |
| | Ref: EIN 12-3456789        [Current] | |
| | [View PDF] [Edit] [Delete]           | |
| +--------------------------------------+ |
+------------------------------------------+
```

### Category Color Coding

| Category | Color |
|----------|-------|
| Formation | Blue |
| Tax | Orange |
| Governance | Purple |
| Legal | Green |
| Other | Gray |

---

## Pre-seeded Document Types

The migration will include common corporate document types:

| Code | Name | Category |
|------|------|----------|
| COI | Certificate of Incorporation | Formation |
| COF | Certificate of Formation | Formation |
| AOI | Articles of Incorporation | Formation |
| AOO | Articles of Organization | Formation |
| SS4 | SS4 Letter (EIN Assignment) | Tax |
| 2553 | Form 2553 (S-Corp Election) | Tax |
| BYLAWS | Corporate Bylaws | Governance |
| OA | Operating Agreement | Governance |
| SHARES | Share Certificate | Governance |
| RESOLUTIONS | Board Resolutions | Governance |
| MINUTES | Meeting Minutes | Governance |
| NDA | Non-Disclosure Agreement | Legal |
| COG | Certificate of Good Standing | Legal |
| FA | Foreign Qualification | Legal |

---

## Files Summary

### New Files (6 total)
| File | Purpose |
|------|---------|
| src/components/documents/DocumentFileUpload.tsx | File upload for entity documents |
| src/components/forms/EntityDocumentForm.tsx | Add/edit document form |
| src/components/entity-detail/LinkedDocuments.tsx | Display linked documents |
| src/components/sections/DocumentsSection.tsx | Top-level documents view |
| Database migration | Creates tables, bucket, seeds data |

### Modified Files (6 total)
| File | Changes |
|------|---------|
| src/hooks/usePortalData.ts | Add DocumentType, EntityDocument types + hooks |
| src/hooks/usePortalMutations.ts | Add 6 mutation hooks |
| src/lib/formSchemas.ts | Add 2 validation schemas |
| src/components/sections/SettingsSection.tsx | Add Document Types tab |
| src/components/layout/Sidebar.tsx | Add Documents menu item |
| src/pages/Index.tsx | Add DocumentsSection route |
| src/pages/EntityDetail.tsx | Integrate LinkedDocuments |

---

## Technical Notes

1. **Storage Pattern**: Following the existing `contract-files` bucket pattern for `entity-documents`
2. **PDF Viewer**: Reuse the existing PdfViewerDialog component for viewing documents
3. **Document Types**: Settings-managed lookup table allows users to add custom document types
4. **Category System**: Provides visual organization with color-coded badges
5. **Status Tracking**: Supports document versioning (current, superseded, expired)
6. **Entity Cascade**: All documents auto-delete when parent entity is deleted
7. **Pre-seeded Data**: Common corporate document types included in migration for immediate use

