

# Comprehensive Portal Enhancement Plan

This plan covers 10 major feature additions to transform the portal into a complete business management system.

## Overview

The requested features span across several categories:
1. **Service Providers Section** - New top-level section for managing all providers
2. **Document Types Management** - Complete the Settings tab
3. **Document Expiry Tracking** - Notifications for expiring documents
4. **Bulk Document Upload** - AI-powered document sorting
5. **Contract-Provider Linking** - Use the existing junction table
6. **Entity Detail Search** - Filter providers on entity page
7. **Filing Management System** - Already implemented, needs enhancement
8. **User Management** - Full user system with audit logs
9. **Email Addresses/Mail Servers** - Group email management
10. **AI Chat Enhancement** - Already implemented, needs refinement

---

## Phase 1: Quick Wins (Already Partially Implemented)

### 1.1 Complete Document Types Management in Settings

The Document Types tab exists but needs to be fully displayed in the Settings tabs.

**Changes:**
- Update `src/components/sections/SettingsSection.tsx`:
  - Expand `TabsList` to include "Document Types" as the 4th tab
  - Add `TabsContent` for document types with search, sort, and CRUD functionality
  - Use the existing `DocumentTypeForm` component and mutation hooks

### 1.2 AI Chat Enhancement

Already implemented with confirmation workflow. Minor refinements:
- Ensure all object types are supported
- Add better error handling for entity linking

---

## Phase 2: Service Providers Section

### 2.1 Create ServiceProvidersSection Component

**New file:** `src/components/sections/ServiceProvidersSection.tsx`

**Features:**
- Tabs for each provider type (Law Firms, Accountants, Auditors, Advisors, Consultants, Registration Agents)
- Table view with all providers across all entities
- Entity filter dropdown to filter by linked entity
- Provider type filter
- Status filter (Active/Inactive)
- Search by name, contact, email
- Add/Edit/Delete functionality using existing form components
- Click to navigate to linked entity detail page

**Data flow:**
```text
+-------------------+     +------------------+
| ServiceProviders  |---->| useLawFirms()    |
| Section           |     | useAccountants() |
|                   |     | useAuditors()    |
+-------------------+     +------------------+
         |
         v
+-------------------+
| Entity Filter     |
| Provider Filter   |
| Status Filter     |
| Search Box        |
+-------------------+
```

### 2.2 Update Sidebar

**Modify:** `src/components/layout/Sidebar.tsx`
- Add new menu item: `{ id: "service-providers", label: "Service Providers", icon: Briefcase }`
- Position after Entities

### 2.3 Update Index Page

**Modify:** `src/pages/Index.tsx`
- Add case for "service-providers" in `renderSection()`
- Import and render `ServiceProvidersSection`

---

## Phase 3: Document Expiry Tracking

### 3.1 Create Document Expiry Notification System

**Database changes:**
- No schema changes needed - `entity_documents` already has `expiry_date` column

**New hook:** Add to `src/hooks/usePortalData.ts`
```typescript
export const useExpiringDocuments = (daysThreshold: number = 30) => {
  // Query documents where expiry_date is within threshold
}
```

### 3.2 Dashboard Expiry Widget

**Modify:** `src/components/dashboard/DashboardSection.tsx`
- Add new stat cards for:
  - Documents expiring in 30 days
  - Documents expiring in 60 days
  - Documents expiring in 90 days
- Add clickable list of expiring documents

### 3.3 Document Status Enhancement

**Modify:** `src/components/sections/DocumentsSection.tsx`
- Auto-update status based on expiry date (current/expiring/expired)
- Add visual indicators (badges with colors)
- Add "Expiring Soon" filter option

---

## Phase 4: Bulk Document Upload with AI Sorting

### 4.1 Create Bulk Upload Component

**New file:** `src/components/documents/BulkDocumentUpload.tsx`

**Features:**
- Multi-file dropzone (accepts PDFs)
- Progress indicators for each file
- AI-powered document classification
- Preview of detected document types
- Entity assignment
- Confirmation before saving

### 4.2 Create AI Document Classification Edge Function

**New file:** `supabase/functions/classify-documents/index.ts`

**Logic:**
- Receive file content/name
- Use AI to analyze and suggest:
  - Document type (from existing document_types table)
  - Title extraction
  - Date extraction
  - Category classification
- Return suggestions for user confirmation

### 4.3 Integrate with Documents Section

**Modify:** `src/components/sections/DocumentsSection.tsx`
- Add "Bulk Upload" button next to "Add Document"
- Open bulk upload dialog

---

## Phase 5: Contract-Provider Linking

### 5.1 Create Contract Linking UI

The `entity_provider_contracts` junction table already exists with columns:
- `contract_id`, `provider_id`, `provider_type`

**New component:** `src/components/contracts/ContractProviderLink.tsx`
- Dropdown to select existing contracts
- Displays currently linked contracts for a provider
- Add/Remove contract links

### 5.2 Update Provider Components

**Modify all LinkedXXX components:**
- `LinkedLawFirms.tsx`, `LinkedAccountantFirms.tsx`, etc.
- Add "Linked Contracts" section showing associated contracts
- Add button to link/unlink contracts

### 5.3 Create Mutation Hooks

**Add to:** `src/hooks/usePortalMutations.ts`
```typescript
export const useCreateProviderContract = () => { ... }
export const useDeleteProviderContract = () => { ... }
```

---

## Phase 6: Entity Detail Search & Filtering

### 6.1 Add Search Bar to Entity Detail

**Modify:** `src/pages/EntityDetail.tsx`
- Add search input in header
- Filter all linked sections based on search term
- Collapsible sections for better navigation

### 6.2 Provider Filtering

**Features:**
- Search by provider name, type, contact
- Filter by status (Active/Inactive)
- Quick jump to specific section

---

## Phase 7: User Management System

### 7.1 Database Schema Changes

**New tables:**

```sql
-- User profiles with extended info
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  invited_by UUID,
  invited_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audit log for all user actions
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Team invitations
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  invited_by UUID NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 7.2 User Management Section

**New file:** `src/components/sections/UserManagementSection.tsx`

**Features:**
- List all users with status, role, last login
- Invite new users via email
- Change user roles (Admin/Member/Viewer)
- Deactivate/Reactivate users
- View audit log per user

### 7.3 Audit Log Component

**New file:** `src/components/users/AuditLogViewer.tsx`
- Filterable by user, action type, date range
- Table with action details
- Export to CSV

### 7.4 Edge Function for Invitations

**New file:** `supabase/functions/invite-user/index.ts`
- Generate secure invitation token
- Send invitation email
- Handle invitation acceptance

---

## Phase 8: Email Addresses & Mail Server Management

### 8.1 Database Schema Changes

**New tables:**

```sql
-- Group email addresses
CREATE TABLE email_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES entities(id),
  email TEXT NOT NULL,
  label TEXT NOT NULL, -- e.g., 'support', 'sales', 'info'
  purpose TEXT,
  mail_server_id UUID,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mail server configurations
CREATE TABLE mail_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'microsoft365', 'brevo', 'google', 'custom'
  domain TEXT,
  configuration JSONB, -- Provider-specific settings
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 8.2 Email Management Section

**New file:** `src/components/sections/EmailSection.tsx`

**Features:**
- List all group emails (support@, sales@, etc.)
- Link to entities
- Show mail server provider
- Add/Edit/Delete emails

### 8.3 Mail Server Settings Tab

**Add to:** `src/components/sections/SettingsSection.tsx`
- New tab: "Mail Servers"
- Configure Microsoft 365, Brevo, Google Workspace, Custom SMTP
- Domain verification status
- Test connection button

---

## Phase 9: Filing Management Enhancement

The filing system already exists with calendar and task management. Enhancements:

### 9.1 Automatic Task Generation

Already implemented via database trigger `generate_filing_task()`. Verify it's working correctly.

### 9.2 Recurring Filing Creation

**Modify:** `src/components/forms/EntityFilingForm.tsx`
- Add "Create Recurring" option
- Auto-generate future filings based on frequency

### 9.3 Filing Reminders

**New edge function:** `supabase/functions/filing-reminders/index.ts`
- Scheduled function to check upcoming filings
- Generate notifications/emails for reminders

---

## Implementation Priority

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 1 | Document Types Settings Tab | Low | Medium |
| 2 | Service Providers Section | Medium | High |
| 3 | Document Expiry Tracking | Low | High |
| 4 | Entity Detail Search | Low | Medium |
| 5 | Contract-Provider Linking | Medium | Medium |
| 6 | Bulk Document Upload | High | High |
| 7 | Email Addresses | Medium | Medium |
| 8 | User Management | High | High |
| 9 | Filing Enhancements | Medium | Medium |

---

## Technical Implementation Details

### Files to Create:
1. `src/components/sections/ServiceProvidersSection.tsx`
2. `src/components/documents/BulkDocumentUpload.tsx`
3. `src/components/contracts/ContractProviderLink.tsx`
4. `src/components/sections/UserManagementSection.tsx`
5. `src/components/users/AuditLogViewer.tsx`
6. `src/components/sections/EmailSection.tsx`
7. `supabase/functions/classify-documents/index.ts`
8. `supabase/functions/invite-user/index.ts`
9. `supabase/functions/filing-reminders/index.ts`

### Files to Modify:
1. `src/components/layout/Sidebar.tsx` - Add new menu items
2. `src/pages/Index.tsx` - Add new section renderers
3. `src/components/sections/SettingsSection.tsx` - Add Document Types and Mail Servers tabs
4. `src/pages/EntityDetail.tsx` - Add search/filter functionality
5. `src/hooks/usePortalData.ts` - Add new hooks for expiring documents, user profiles, etc.
6. `src/hooks/usePortalMutations.ts` - Add mutations for new entities
7. All `LinkedXXX.tsx` components - Add contract linking capability

### Database Migrations:
1. `user_profiles` table
2. `audit_logs` table  
3. `team_invitations` table
4. `email_addresses` table
5. `mail_servers` table
6. RLS policies for all new tables
7. Trigger for audit logging

