

# Professional Service Providers Implementation Plan

## Overview
Add the ability to track and manage professional service relationships for each entity, including **6 provider types**: Accountant Firms, Law Firms, Registration Agents, Advisors, Consultants, and Auditors. Each provider type will have its own dedicated table with full business profiles, **LinkedIn profiles**, and contract/engagement tracking.

---

## Database Schema

### New Tables (6 provider tables + 1 junction table)

Each table follows a consistent structure with type-specific fields:

#### Common Fields (all 6 tables)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| entity_id | uuid (FK) | Links to parent entity (CASCADE delete) |
| name | text | Firm/company name |
| contact_name | text | Primary contact person |
| email | text | Contact email |
| phone | text | Contact phone |
| website | text | Website URL |
| **linkedin_url** | text | LinkedIn profile URL |
| address | text | Office address |
| engagement_start_date | date | When relationship began |
| engagement_end_date | date | When ended (null if active) |
| fee_structure | text | Hourly, Retainer, Project-based |
| notes | text | Additional notes |
| is_active | boolean | Current engagement status |
| created_at/updated_at | timestamptz | Timestamps |

#### Type-Specific Fields

| Table | Additional Columns |
|-------|-------------------|
| **accountant_firms** | license_number, specializations (text[]) |
| **law_firms** | bar_number, practice_areas (text[]) |
| **registration_agents** | agent_type, jurisdictions_covered (text[]) |
| **advisors** | advisor_type, certifications (text[]) |
| **consultants** | consultant_type, project_scope |
| **auditors** | license_number, audit_types (text[]), certifications (text[]) |

#### Junction Table: entity_provider_contracts
Links existing contracts to specific service providers.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| provider_type | text | accountant_firm, law_firm, auditor, etc. |
| provider_id | uuid | ID of the provider record |
| contract_id | uuid (FK) | Links to contracts table |
| created_at | timestamptz | Timestamp |

---

## Row Level Security
All tables follow the existing shared-access pattern:
- All authenticated users can SELECT, INSERT, UPDATE, DELETE
- No user-specific scoping (collaborative team access)

---

## Implementation Steps

### Step 1: Database Migration
Create all 7 tables with:
- Proper column types and constraints
- LinkedIn URL field on all provider tables
- Foreign key to entities table with ON DELETE CASCADE
- RLS policies for authenticated access
- Automatic updated_at triggers

### Step 2: TypeScript Types & Hooks

**New types in usePortalData.ts:**
- AccountantFirm, LawFirm, RegistrationAgent, Advisor, Consultant, Auditor (all include linkedin_url)
- EntityProviderContract

**New query hooks:**
- useAccountantFirms(), useLawFirms(), useRegistrationAgents()
- useAdvisors(), useConsultants(), useAuditors()
- Filtered versions: useAccountantFirmsForEntity(entityId), etc.

### Step 3: Mutation Hooks

**In usePortalMutations.ts:**
- CRUD hooks for each provider type (18 hooks total):
  - useCreateAccountantFirm, useUpdateAccountantFirm, useDeleteAccountantFirm
  - useCreateLawFirm, useUpdateLawFirm, useDeleteLawFirm
  - useCreateRegistrationAgent, useUpdateRegistrationAgent, useDeleteRegistrationAgent
  - useCreateAdvisor, useUpdateAdvisor, useDeleteAdvisor
  - useCreateConsultant, useUpdateConsultant, useDeleteConsultant
  - useCreateAuditor, useUpdateAuditor, useDeleteAuditor

### Step 4: Zod Validation Schemas

**In formSchemas.ts:**
Add validation schemas for each provider type with linkedin_url validation:

```typescript
linkedin_url: z.string().trim().url("Invalid LinkedIn URL").optional().or(z.literal("")),
```

### Step 5: Form Components

**New form components (6 files):**
- `src/components/forms/AccountantFirmForm.tsx`
- `src/components/forms/LawFirmForm.tsx`
- `src/components/forms/RegistrationAgentForm.tsx`
- `src/components/forms/AdvisorForm.tsx`
- `src/components/forms/ConsultantForm.tsx`
- `src/components/forms/AuditorForm.tsx`

Each form includes:
- Basic info fields (name, contact, email, phone, website, **LinkedIn URL**, address)
- Type-specific fields (licenses, specializations, certifications)
- Engagement dates and fee structure
- Active status toggle
- Notes textarea

### Step 6: Entity Detail - Linked Components

**New linked components (6 files):**
- `src/components/entity-detail/LinkedAccountantFirms.tsx`
- `src/components/entity-detail/LinkedLawFirms.tsx`
- `src/components/entity-detail/LinkedRegistrationAgents.tsx`
- `src/components/entity-detail/LinkedAdvisors.tsx`
- `src/components/entity-detail/LinkedConsultants.tsx`
- `src/components/entity-detail/LinkedAuditors.tsx`

Each component displays:
- Provider cards with firm name, contact, and key info
- **LinkedIn icon/link** when profile URL is available
- Active/inactive status badge
- Specializations/certifications as badges
- Engagement dates

### Step 7: Update EntityDetail.tsx

- Import new hooks to fetch all 6 provider types
- Filter providers by entity_id
- Add 6 new stat cards in the summary grid
- Add 6 new linked sections in the detail grid

---

## UI Layout Changes

### Stats Grid (expanded from 6 to 12 cards)

```text
+----------------------------------------------------------+
| Stats Grid (12 cards, 2 rows)                            |
| Row 1: [Banks] [Cards] [Phones] [TaxIDs] [Addresses] [Contracts] |
| Row 2: [Accountants] [Lawyers] [Agents] [Advisors] [Consultants] [Auditors] |
+----------------------------------------------------------+
```

### Provider Card Design (with LinkedIn)

```text
+------------------------------------------+
| [Icon] Firm Name               [Active]  |
|        Primary Contact                   |
+------------------------------------------+
| Email: contact@firm.com                  |
| Phone: +1 (555) 123-4567                 |
| LinkedIn: [in] View Profile  <- clickable|
| Engagement: Jan 2023 - Present           |
+------------------------------------------+
| [Tax] [Audit] [Bookkeeping]  <- badges   |
+------------------------------------------+
```

---

## Files Summary

### New Files (14 total)
| File | Purpose |
|------|---------|
| src/components/forms/AccountantFirmForm.tsx | Accountant firm add/edit form |
| src/components/forms/LawFirmForm.tsx | Law firm add/edit form |
| src/components/forms/RegistrationAgentForm.tsx | Registration agent add/edit form |
| src/components/forms/AdvisorForm.tsx | Advisor add/edit form |
| src/components/forms/ConsultantForm.tsx | Consultant add/edit form |
| src/components/forms/AuditorForm.tsx | Auditor add/edit form |
| src/components/entity-detail/LinkedAccountantFirms.tsx | Display linked accountants |
| src/components/entity-detail/LinkedLawFirms.tsx | Display linked law firms |
| src/components/entity-detail/LinkedRegistrationAgents.tsx | Display linked agents |
| src/components/entity-detail/LinkedAdvisors.tsx | Display linked advisors |
| src/components/entity-detail/LinkedConsultants.tsx | Display linked consultants |
| src/components/entity-detail/LinkedAuditors.tsx | Display linked auditors |
| Database migration | Creates 7 new tables |

### Modified Files (4 total)
| File | Changes |
|------|---------|
| src/hooks/usePortalData.ts | Add 6 types + 6 query hooks |
| src/hooks/usePortalMutations.ts | Add 18 mutation hooks |
| src/lib/formSchemas.ts | Add 6 validation schemas with linkedin_url |
| src/pages/EntityDetail.tsx | Integrate all 6 provider sections |

---

## Technical Notes

1. **LinkedIn URL Field**: Added to all 6 provider tables for tracking professional profiles
2. **LinkedIn UI**: Will display as a clickable LinkedIn icon that opens the profile in a new tab
3. **URL Validation**: LinkedIn URLs validated using Zod's URL validator
4. **Auditor-Specific Fields**: Includes `audit_types` (Financial, Compliance, Operational, IT, Tax) and `certifications` (CPA, CIA, CISA, etc.)
5. **Specialization Arrays**: Using text[] for flexible tagging without additional lookup tables
6. **Entity Cascade**: All provider records auto-delete when parent entity is deleted
7. **Pattern Consistency**: All components follow the existing LinkedBankAccounts design pattern

