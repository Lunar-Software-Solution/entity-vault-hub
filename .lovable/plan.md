

# Filing Management System with Calendar & Task Automation

## Overview
Add a comprehensive filing management system that enables users to:
1. **Track regulatory filings** (Annual Reports, Franchise Tax, 10-K, Beneficial Ownership) for each entity
2. **View deadlines in a calendar interface** with month/week navigation
3. **Automatically generate tasks** when filings are due (with configurable reminder periods)
4. **Manage tasks** with status tracking (pending, in-progress, completed, overdue)

This feature integrates with the existing entity structure and follows established patterns for sections, forms, and mutations.

---

## Database Schema

### New Tables (4 tables)

#### 1. filing_types (Settings lookup table)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| code | text | Short code (e.g., "AR", "FTX", "10K") |
| name | text | Display name (e.g., "Annual Report") |
| category | text | Category grouping (State, Federal, Tax, Corporate) |
| description | text | Optional description |
| default_frequency | text | annual, quarterly, monthly, one-time |
| created_at/updated_at | timestamptz | Timestamps |

#### 2. entity_filings (Filings linked to entities)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| entity_id | uuid (FK) | Links to parent entity (CASCADE delete) |
| filing_type_id | uuid (FK) | Links to filing_types table |
| title | text | Filing title/description |
| jurisdiction | text | State/country where filing is required |
| due_date | date | When filing is due |
| filing_date | date | When actually filed (null if pending) |
| frequency | text | annual, quarterly, monthly, one-time |
| amount | numeric | Filing fee amount |
| confirmation_number | text | Reference/confirmation number |
| filed_by | text | Who filed it (person/firm name) |
| notes | text | Additional notes |
| status | text | pending, filed, overdue |
| reminder_days | integer | Days before due date to create task (default 30) |
| created_at/updated_at | timestamptz | Timestamps |

#### 3. filing_tasks (Auto-generated and manual tasks)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| entity_id | uuid (FK) | Links to parent entity (CASCADE delete) |
| filing_id | uuid (FK) | Links to entity_filings (nullable for manual tasks) |
| title | text | Task title |
| description | text | Task description |
| due_date | date | Task due date |
| priority | text | low, medium, high, urgent |
| status | text | pending, in_progress, completed, cancelled |
| assigned_to | text | Person responsible |
| completed_at | timestamptz | When task was completed |
| is_auto_generated | boolean | Whether task was auto-created from filing |
| created_at/updated_at | timestamptz | Timestamps |

#### 4. filing_documents (Link filings to uploaded documents)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| filing_id | uuid (FK) | Links to entity_filings (CASCADE delete) |
| document_id | uuid (FK) | Links to entity_documents (CASCADE delete) |
| created_at | timestamptz | Timestamp |

---

## Row Level Security
All tables follow the existing shared-access pattern:
- All authenticated users can SELECT, INSERT, UPDATE, DELETE
- No user-specific scoping (collaborative team access)

---

## Automatic Task Generation

### Database Function
A PostgreSQL function will automatically create tasks when:
1. A new filing is created with a due date
2. A filing's due date is updated
3. Daily cron job checks for upcoming filings within reminder period

### Task Auto-Generation Logic
```text
When filing.due_date - reminder_days = today:
  Create filing_task with:
    - title: "[Filing Type] due for [Entity Name]"
    - due_date: filing.due_date
    - priority: based on days remaining (urgent if < 7 days)
    - status: pending
    - is_auto_generated: true
```

---

## Implementation Steps

### Step 1: Database Migration
- Create `filing_types` table with RLS policies
- Create `entity_filings` table with RLS policies and foreign keys
- Create `filing_tasks` table with RLS policies
- Create `filing_documents` junction table
- Add `updated_at` triggers
- Create task auto-generation function and trigger
- Seed initial filing types (common regulatory and tax filings)

### Step 2: TypeScript Types & Hooks

**New types in usePortalData.ts:**
- FilingType
- EntityFiling
- FilingTask
- FilingDocument

**New query hooks:**
- useFilingTypes()
- useEntityFilings()
- useFilingTasks()
- useFilingsForEntity(entityId)
- useTasksForEntity(entityId)
- useUpcomingFilings() - filings due in next 90 days
- useOverdueTasks()

### Step 3: Mutation Hooks

**In usePortalMutations.ts:**
- CRUD hooks for filing types (3 hooks)
- CRUD hooks for entity filings (3 hooks)
- CRUD hooks for filing tasks (3 hooks)
- useCompleteTask, useReopenTask (status helpers)

### Step 4: Zod Validation Schemas

**In formSchemas.ts:**
- filingTypeSchema (code, name, category, frequency, description)
- entityFilingSchema (entity_id, filing_type_id, title, jurisdiction, dates, amount, notes, status)
- filingTaskSchema (entity_id, title, description, due_date, priority, status, assigned_to)

### Step 5: Settings Section - Filing Types Tab

**Update SettingsSection.tsx:**
- Add a new tab "Filing Types" alongside Document Types
- Include search, sort, add/edit/delete functionality
- Display category badges and frequency indicators

### Step 6: Calendar Component

**New component: FilingsCalendar.tsx**
- Month view with day cells showing filing counts
- Week view for detailed daily view
- Color-coded by status (pending/filed/overdue)
- Click on day to see filings due
- Navigation between months/weeks
- Legend for status colors

### Step 7: Filing Form Components

**New form components:**
- `src/components/forms/FilingTypeForm.tsx` - Settings form
- `src/components/forms/EntityFilingForm.tsx` - Filing creation/edit
- `src/components/forms/FilingTaskForm.tsx` - Task creation/edit

### Step 8: Filings Section (Top-level view)

**New section component: FilingsSection.tsx**
- Tabs: Calendar View | List View | Tasks
- Calendar tab shows FilingsCalendar
- List tab shows table of all filings with filters
- Tasks tab shows all filing-related tasks
- Filter by entity, status, date range
- Quick stats: upcoming, overdue, completed this month

### Step 9: Entity Detail - Linked Filings & Tasks

**New linked components:**
- `src/components/entity-detail/LinkedFilings.tsx`
- `src/components/entity-detail/LinkedFilingTasks.tsx`

Display:
- Filing cards with due date, status, and amount
- Task cards with priority badges and due dates
- Quick complete/edit actions on tasks
- Link to upload supporting documents

### Step 10: Dashboard Integration

**Update DashboardSection.tsx:**
- Add stat card for "Upcoming Filings"
- Add stat card for "Open Tasks"
- Show overdue count in subtitle
- Add quick action "Add Filing"

### Step 11: Update Sidebar & Index.tsx

- Add "Filings" menu item to sidebar
- Add FilingsSection to route handling
- Add to entity filter sections

---

## UI Layout Changes

### Filings Section - Calendar View

```text
+------------------------------------------------------------------+
| Filings                                    [+ Add Filing]        |
+------------------------------------------------------------------+
| [Calendar] [List] [Tasks]                   Filter: [All Entities] |
+------------------------------------------------------------------+
|            < January 2026 >                                      |
| +------+------+------+------+------+------+------+               |
| | Sun  | Mon  | Tue  | Wed  | Thu  | Fri  | Sat  |               |
| +------+------+------+------+------+------+------+               |
| |      |      |      |   1  |   2  |   3  |   4  |               |
| |      |      |      |      |      |      |      |               |
| +------+------+------+------+------+------+------+               |
| |   5  |   6  |   7  |   8  |   9  |  10  |  11  |               |
| |      |      |      |      |      |      |      |               |
| +------+------+------+------+------+------+------+               |
| |  12  |  13  |  14  |  15  |  16  |  17  |  18  |               |
| |      |      | [2]  |      | [1]  |      |      |               |
| +------+------+------+------+------+------+------+               |
| ...                                                              |
+------------------------------------------------------------------+
| Legend: [Blue] Pending  [Green] Filed  [Red] Overdue             |
+------------------------------------------------------------------+
```

### Filing Card Design

```text
+------------------------------------------+
| [Tax] Sales Tax Return          [Pending] |
| Q1 2026 Sales Tax - California            |
+------------------------------------------+
| Due: April 30, 2026                       |
| Amount: $2,450.00                         |
| Reminder: 15 days before                  |
+------------------------------------------+
| [View] [Edit] [Mark Filed] [Delete]       |
+------------------------------------------+
```

### Task Card Design

```text
+------------------------------------------+
| [!] File Q1 Sales Tax Return     [High]   |
| Due: April 30, 2026                       |
+------------------------------------------+
| Entity: Acme Corp LLC                     |
| Assigned to: John Smith                   |
| Status: In Progress                       |
+------------------------------------------+
| [Complete] [Edit] [Cancel]                |
+------------------------------------------+
```

---

## Category Color Coding

| Category | Color |
|----------|-------|
| State | Blue |
| Federal | Purple |
| Tax | Orange |
| Corporate | Green |
| Payroll | Teal |
| Other | Gray |

## Priority Color Coding

| Priority | Color |
|----------|-------|
| Low | Gray |
| Medium | Blue |
| High | Orange |
| Urgent | Red |

## Status Indicators

| Status | Style |
|--------|-------|
| Pending | Blue badge |
| In Progress | Yellow badge |
| Filed/Completed | Green badge |
| Overdue | Red badge |
| Cancelled | Gray strikethrough |

---

## Pre-seeded Filing Types (Expanded with Sales & Tax Filings)

The migration will include comprehensive regulatory and tax filing types:

### State Filings
| Code | Name | Category | Frequency |
|------|------|----------|-----------|
| AR | Annual Report | State | annual |
| RAS | Registered Agent Statement | State | annual |
| BL | Business License Renewal | State | annual |

### Federal Filings
| Code | Name | Category | Frequency |
|------|------|----------|-----------|
| BOI | Beneficial Ownership Information (FinCEN) | Federal | one-time |
| 10K | Form 10-K (Annual SEC Report) | Federal | annual |
| 10Q | Form 10-Q (Quarterly SEC Report) | Federal | quarterly |

### Sales & Use Tax Filings
| Code | Name | Category | Frequency |
|------|------|----------|-----------|
| ST-M | Sales Tax Return (Monthly) | Tax | monthly |
| ST-Q | Sales Tax Return (Quarterly) | Tax | quarterly |
| ST-A | Sales Tax Return (Annual) | Tax | annual |
| UT | Use Tax Return | Tax | quarterly |
| ST-E | Sales Tax Exemption Certificate Renewal | Tax | annual |

### Income & Franchise Tax Filings
| Code | Name | Category | Frequency |
|------|------|----------|-----------|
| FTX | Franchise Tax | Tax | annual |
| 1120 | Form 1120 (C-Corp Federal Income Tax) | Tax | annual |
| 1120S | Form 1120-S (S-Corp Federal Income Tax) | Tax | annual |
| 1065 | Form 1065 (Partnership Return) | Tax | annual |
| EST-Q | Estimated Tax Payment (Quarterly) | Tax | quarterly |
| SIT | State Income Tax Return | Tax | annual |

### Property Tax Filings
| Code | Name | Category | Frequency |
|------|------|----------|-----------|
| PT | Property Tax Return | Tax | annual |
| PPT | Personal Property Tax Return | Tax | annual |

### Payroll Tax Filings
| Code | Name | Category | Frequency |
|------|------|----------|-----------|
| 941 | Form 941 (Quarterly Payroll Tax) | Payroll | quarterly |
| 940 | Form 940 (Annual FUTA Tax) | Payroll | annual |
| W2 | Form W-2/W-3 Filing | Payroll | annual |
| 1099 | Form 1099 Filing | Payroll | annual |
| SUTA | State Unemployment Tax (SUTA) | Payroll | quarterly |
| WC | Workers Compensation Filing | Payroll | annual |

### Other Tax Filings
| Code | Name | Category | Frequency |
|------|------|----------|-----------|
| EXT | Tax Extension (Form 7004) | Tax | annual |
| BIRT | Business Income & Receipts Tax | Tax | annual |
| GT | Gross Receipts Tax | Tax | quarterly |
| ET | Excise Tax Return | Tax | quarterly |

---

## Files Summary

### New Files (10 total)
| File | Purpose |
|------|---------|
| src/components/filings/FilingsCalendar.tsx | Interactive calendar view |
| src/components/filings/CalendarDayPopover.tsx | Day detail popover |
| src/components/forms/FilingTypeForm.tsx | Settings form for filing types |
| src/components/forms/EntityFilingForm.tsx | Add/edit filings |
| src/components/forms/FilingTaskForm.tsx | Add/edit tasks |
| src/components/entity-detail/LinkedFilings.tsx | Display linked filings |
| src/components/entity-detail/LinkedFilingTasks.tsx | Display linked tasks |
| src/components/sections/FilingsSection.tsx | Top-level filings view |
| src/lib/filingUtils.ts | Helper functions for date/status |
| Database migration | Creates tables, triggers, seeds data |

### Modified Files (7 total)
| File | Changes |
|------|---------|
| src/hooks/usePortalData.ts | Add 4 types + 7 query hooks |
| src/hooks/usePortalMutations.ts | Add 11 mutation hooks |
| src/lib/formSchemas.ts | Add 3 validation schemas |
| src/components/sections/SettingsSection.tsx | Add Filing Types tab |
| src/components/layout/Sidebar.tsx | Add Filings menu item |
| src/pages/Index.tsx | Add FilingsSection route |
| src/pages/EntityDetail.tsx | Integrate LinkedFilings & LinkedFilingTasks |
| src/components/dashboard/DashboardSection.tsx | Add filing stats and quick action |

---

## Technical Notes

1. **Calendar Library**: Using the existing `react-day-picker` (DayPicker) component already in the project
2. **Date Handling**: Using `date-fns` for all date calculations and formatting
3. **Auto-Task Generation**: PostgreSQL trigger on `entity_filings` INSERT/UPDATE creates tasks automatically
4. **Reminder System**: Configurable per-filing reminder days (default 30)
5. **Entity Cascade**: All filings and tasks auto-delete when parent entity is deleted
6. **Status Updates**: Automatic status change to "overdue" when due_date passes (handled client-side)
7. **Filing-Document Link**: Optional linking of filings to uploaded entity documents for proof of filing
8. **Pre-seeded Data**: 30+ common regulatory and tax filings included for immediate use
9. **Sales Tax Flexibility**: Multiple frequency options (monthly/quarterly/annual) to accommodate different state requirements
10. **Payroll Category**: Separate category for payroll-related filings with distinct color coding

