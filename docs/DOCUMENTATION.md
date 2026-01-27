# Entity Vault Hub - Documentation

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Features](#features)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [Edge Functions](#edge-functions)
7. [Project Structure](#project-structure)
8. [Getting Started](#getting-started)
9. [Configuration](#configuration)

---

## Overview

Entity Vault Hub is a comprehensive corporate entity management platform designed to securely manage and organize all aspects of business entities, including:

- Legal entity information
- Directors, UBOs (Ultimate Beneficial Owners), and shareholders
- Bank accounts and credit cards
- Tax IDs and issuing authorities
- Contracts and legal documents
- Filings, compliance tasks, and deadlines
- Service providers (law firms, accountants, auditors, advisors, consultants)
- Software subscriptions and websites
- Cap table management (shareholders, share classes, equity transactions)

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Component library |
| **React Router v6** | Client-side routing |
| **TanStack Query** | Server state management |
| **React Hook Form** | Form handling |
| **Zod** | Schema validation |
| **Lucide React** | Icon library |
| **Recharts** | Data visualization |

### Backend (Lovable Cloud / Supabase)
| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Database |
| **Row Level Security (RLS)** | Data access control |
| **Edge Functions (Deno)** | Serverless backend logic |
| **Storage Buckets** | File storage |
| **Authentication** | User management |

---

## Features

### Core Modules

#### 1. Entity Management
- Create, edit, and manage multiple legal entities
- Track entity status (Active, Inactive, Dissolved, Pending)
- Store jurisdiction, type, founding date, fiscal year end
- Description of activities
- Entity-specific filtering across all modules

#### 2. Directors & UBOs
- Manage directors, officers, and beneficial owners
- Role types: Director, Officer, UBO, Secretary, Registered Agent
- Track appointments, resignations, ownership percentages
- ID document management with multiple document support
- Gravatar integration for avatars
- LinkedIn profile linking
- PEP (Politically Exposed Person) flagging
- Multi-entity affiliations

#### 3. Bank Accounts
- Store bank account details (account number, routing, IBAN, SWIFT/BIC)
- Multiple account types (Checking, Savings, Business, Money Market)
- Multi-currency support
- Primary account designation
- Entity assignment

#### 4. Credit Cards
- Secure credit card storage
- Visual card display with brand detection (Visa, Mastercard, Amex, Discover)
- Credit limit tracking
- Expiry and due date management
- Card color customization

#### 5. Tax IDs
- Comprehensive tax ID management
- Support for 47+ tax ID types across multiple countries:
  - **USA**: EIN, SSN, ITIN, State IDs
  - **Canada**: BN, SIN, NEQ, Provincial Corporate Numbers, GST/HST/PST
  - **UK**: UTR, CRN, NI, VAT
  - **France**: SIRET, SIREN, NIF, TVA
  - **Netherlands**: KVK, BSN, BTW
  - **Australia**: ABN, ACN, TFN
  - **Bulgaria**: EIK, EGN, VAT BG
- Issuing authority tracking
- Primary ID designation

#### 6. Contracts
- Contract lifecycle management
- File upload with PDF viewing
- AI-powered contract summarization
- Status tracking (Active, Expiring Soon, Expired, Draft)
- Multi-party support
- Service provider linking

#### 7. Documents
- Centralized document repository
- 30+ document types across categories:
  - Formation, Tax, Governance, Legal, Compliance, Other
- AI-powered document summarization
- Bulk document upload
- Entity and filing associations

#### 8. Filings & Compliance
- Filing deadline tracking
- Recurring filing support (Annual, Quarterly, Monthly, One-time)
- Filing status management (Pending, Filed, Overdue)
- Automated task generation
- Calendar view with day popovers
- Document attachments

#### 9. Filing Tasks
- Task management for compliance activities
- Priority levels (Low, Medium, High, Urgent)
- Status tracking (Pending, In Progress, Completed, Cancelled)
- Due date management
- Auto-generated tasks from filings
- Task reminders via email

#### 10. Service Providers
Manage relationships with:
- **Law Firms**: Practice areas, bar numbers
- **Accountant Firms**: Specializations, license numbers
- **Auditors**: Audit types, certifications
- **Advisors**: Advisor types, certifications
- **Consultants**: Consultant types, project scope
- **Registration Agents**: Registered agent services

Common features:
- Contact information
- Engagement dates
- Fee structure tracking
- Contract linking
- Active/inactive status

#### 11. Addresses
- Multiple address types (Registered, Mailing, Physical, Headquarters)
- Country and state/province support
- Primary address designation

#### 12. Phone Numbers
- Multiple phone types (Office, Mobile, Fax, Toll-Free)
- Primary number designation
- Purpose field

#### 13. Email Addresses
- Email management with verification status
- Mail server associations
- Purpose tracking

#### 14. Social Media
- Platform accounts (LinkedIn, Twitter, Facebook, Instagram, YouTube, TikTok)
- Account URL and username storage
- Verification status

#### 15. Websites
- Website URL management
- Domain and SSL expiry tracking
- Platform identification
- Website types (Corporate, E-commerce, Blog, Landing Page)

#### 16. Software Subscriptions
- Software catalog with 50+ pre-defined applications
- Categories: Accounting, HR, CRM, Communication, Development, etc.
- License tracking (Subscription, Perpetual, Free, Trial, Enterprise)
- Account email and login URL storage

#### 17. Cap Table Management
- **Share Classes**: Common, Preferred Series A/B/C, Options Pool
- **Shareholders**: Individual and entity shareholders
- **Equity Transactions**: Issuance, Transfer, Repurchase, Cancellation
- **Option Grants**: ISO, NSO, RSA, RSU
- Vesting schedules with cliff periods
- Ownership percentage calculations

### Administrative Features

#### User Management
- Role-based access control (Admin, Viewer)
- User invitation system via email
- Role assignment and management

#### Settings
- **Filing Types**: Manage filing type master data
- **Document Types**: Manage document type categories
- **Tax ID Types**: Configure tax ID types with format hints
- **Issuing Authorities**: Manage issuing authorities by country
- **Cron Jobs**: View and toggle scheduled tasks
- **Trusted Devices**: Manage 2FA trusted devices

#### Security
- Email-based 2FA authentication
- Trusted device management
- Session management
- Audit logging for all data changes

#### AI Features
- AI Chat Assistant for data queries
- Contract summarization
- Document summarization
- Bulk document analysis

---

## Database Schema

### Core Tables

#### entities
Primary table for legal entity information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Entity name |
| type | text | Entity type (LLC, Corporation, etc.) |
| status | text | Active, Inactive, Dissolved, Pending |
| jurisdiction | text | Formation jurisdiction |
| founded_date | date | Date of formation |
| fiscal_year_end | text | Fiscal year end (MM-DD format) |
| description_of_activities | text | Business description |
| website | text | Entity website URL |

#### directors_ubos
Directors, officers, and ultimate beneficial owners.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| name | text | Full name |
| role_type | text | director, officer, ubo, secretary, registered_agent |
| title | text | Position title |
| email | text | Email address |
| phone | text | Phone number |
| ownership_percentage | numeric | Ownership % (for UBOs) |
| appointment_date | date | Date appointed |
| resignation_date | date | Date resigned (if applicable) |
| is_active | boolean | Current status |
| is_primary | boolean | Primary contact flag |
| nationality | text | Nationality |
| country_of_residence | text | Country of residence |
| date_of_birth | date | Date of birth |
| is_pep | boolean | Politically exposed person flag |
| pep_details | text | PEP details if applicable |
| linkedin_url | text | LinkedIn profile URL |
| avatar_url | text | Custom avatar URL |
| suppress_avatar | boolean | Disable Gravatar lookup |

#### director_entity_links
Many-to-many relationship for directors serving multiple entities.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| director_id | uuid | FK to directors_ubos |
| entity_id | uuid | FK to entities |
| role_type | text | Role at this entity |
| title | text | Title at this entity |
| ownership_percentage | numeric | Ownership at this entity |
| appointment_date | date | Appointment date |
| resignation_date | date | Resignation date |
| is_active | boolean | Active at this entity |

#### director_id_documents
ID documents for directors/UBOs.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| director_id | uuid | FK to directors_ubos |
| document_type | text | passport, drivers_license, national_id, etc. |
| document_number | text | Document number |
| expiry_date | date | Expiration date |
| file_path | text | Storage path |
| file_name | text | Original filename |

#### bank_accounts
Bank account information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| name | text | Account nickname |
| bank | text | Bank name |
| account_number | text | Account number |
| routing_number | text | Routing/Transit number |
| iban | text | IBAN (international) |
| swift_bic | text | SWIFT/BIC code |
| type | text | Checking, Savings, etc. |
| currency | text | Currency code |
| is_primary | boolean | Primary account flag |
| account_holder_name | text | Account holder name |
| bank_address | text | Bank branch address |
| bank_website | text | Bank website URL |

#### credit_cards
Credit card information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| name | text | Card name/nickname |
| card_number | text | Card number (masked) |
| cardholder_name | text | Name on card |
| expiry_date | text | MM/YY format |
| security_code | text | CVV (encrypted) |
| credit_limit | numeric | Credit limit |
| due_date | date | Payment due date |
| card_color | text | Display color gradient |
| billing_address | text | Billing address |
| issuer_website | text | Card issuer website |

#### tax_ids
Tax identification numbers.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| type_id | uuid | FK to tax_id_types |
| tax_id | text | The tax ID number |
| authority | text | Issuing authority name |
| is_primary | boolean | Primary tax ID flag |
| issued_date | date | Issue date |
| expiry_date | date | Expiration date |
| notes | text | Additional notes |

#### tax_id_types
Master data for tax ID types.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| code | text | Type code (EIN, SSN, etc.) |
| name | text | Full name |
| description | text | Description |
| authority_id | uuid | FK to issuing_authorities |

#### issuing_authorities
Master data for tax authorities.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Authority name |
| country | text | Country |
| province_state | text | Province/State (if applicable) |
| description | text | Description |

#### contracts
Contract management.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| title | text | Contract title |
| type | text | Contract type |
| parties | text[] | Parties to the contract |
| status | text | active, expiring-soon, expired, draft |
| start_date | date | Contract start date |
| end_date | date | Contract end date |
| file_path | text | Storage path |
| file_name | text | Original filename |
| ai_summary | text | AI-generated summary |
| summary_generated_at | timestamp | When summary was generated |

#### entity_documents
Document repository.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| document_type_id | uuid | FK to document_types |
| title | text | Document title |
| status | text | current, expired, superseded, draft |
| reference_number | text | Reference/document number |
| issuing_authority | text | Issuing authority |
| issued_date | date | Issue date |
| expiry_date | date | Expiration date |
| file_path | text | Storage path |
| file_name | text | Original filename |
| ai_summary | text | AI-generated summary |
| notes | text | Additional notes |

#### document_types
Master data for document types.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| code | text | Type code |
| name | text | Type name |
| category | text | Formation, Tax, Governance, Legal, Other |
| description | text | Description |

#### entity_filings
Filing/compliance tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| filing_type_id | uuid | FK to filing_types |
| title | text | Filing title |
| due_date | date | Due date |
| due_day | integer | Day of month/year for recurring |
| frequency | text | annual, quarterly, monthly, one-time |
| status | text | pending, filed, overdue |
| filing_date | date | Actual filing date |
| confirmation_number | text | Filing confirmation |
| filed_by | text | Who filed it |
| amount | numeric | Filing fee |
| jurisdiction | text | Filing jurisdiction |
| reminder_days | integer | Days before to remind |
| notes | text | Additional notes |

#### filing_types
Master data for filing types.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| code | text | Type code |
| name | text | Type name |
| category | text | Tax, Corporate, Regulatory, Other |
| default_frequency | text | Default frequency |
| description | text | Description |

#### filing_tasks
Compliance task management.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| filing_id | uuid | FK to entity_filings (optional) |
| title | text | Task title |
| description | text | Task description |
| due_date | date | Due date |
| priority | text | low, medium, high, urgent |
| status | text | pending, in_progress, completed, cancelled |
| assigned_to | text | Assignee |
| is_auto_generated | boolean | Created by system |
| completed_at | timestamp | Completion timestamp |

#### filing_documents
Link filings to documents.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| filing_id | uuid | FK to entity_filings |
| document_id | uuid | FK to entity_documents |

### Service Provider Tables

#### law_firms
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| name | text | Firm name |
| contact_name | text | Primary contact |
| email | text | Email |
| phone | text | Phone |
| website | text | Website |
| address | text | Address |
| linkedin_url | text | LinkedIn URL |
| bar_number | text | Bar registration |
| practice_areas | text[] | Areas of practice |
| engagement_start_date | date | Start date |
| engagement_end_date | date | End date |
| fee_structure | text | Fee arrangement |
| is_active | boolean | Active status |
| notes | text | Notes |

#### accountant_firms
Similar structure with `specializations` and `license_number` fields.

#### auditors
Similar structure with `audit_types` and `certifications` fields.

#### advisors
Similar structure with `advisor_type` and `certifications` fields.

#### consultants
Similar structure with `consultant_type` and `project_scope` fields.

#### registration_agents
Similar structure for registered agent services.

#### entity_provider_contracts
Links service providers to contracts.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| provider_id | uuid | Provider ID |
| provider_type | text | law_firm, accountant, etc. |
| contract_id | uuid | FK to contracts |

### Communication Tables

#### addresses
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| label | text | Address label |
| type | text | registered, mailing, physical, headquarters |
| street | text | Street address |
| city | text | City |
| state | text | State/Province |
| zip | text | Postal code |
| country | text | Country |
| is_primary | boolean | Primary address flag |

#### phone_numbers
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| label | text | Phone label |
| type | text | office, mobile, fax, toll-free |
| number | text | Phone number |
| is_primary | boolean | Primary phone flag |
| purpose | text | Purpose description |

#### email_addresses
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| label | text | Email label |
| email | text | Email address |
| is_primary | boolean | Primary email flag |
| is_verified | boolean | Verification status |
| purpose | text | Purpose description |
| mail_server_id | uuid | FK to mail_servers |

#### social_media_accounts
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| platform | text | linkedin, twitter, facebook, etc. |
| account_url | text | Profile URL |
| username | text | Username/handle |
| is_verified | boolean | Verification status |

### Digital Assets Tables

#### entity_websites
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| name | text | Website name |
| url | text | Website URL |
| type | text | corporate, ecommerce, blog, landing |
| platform | text | WordPress, Shopify, etc. |
| domain_expiry_date | date | Domain expiration |
| ssl_expiry_date | date | SSL certificate expiration |
| is_primary | boolean | Primary website flag |
| is_active | boolean | Active status |
| notes | text | Notes |

#### software_catalog
Master data for software applications.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Software name |
| category | text | Category |
| logo_url | text | Logo URL |
| website | text | Software website |

#### entity_software
Software subscriptions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| software_id | uuid | FK to software_catalog |
| custom_name | text | Custom name (if not from catalog) |
| category | text | Category |
| license_type | text | subscription, perpetual, free, trial, enterprise |
| license_expiry_date | date | License expiration |
| account_email | text | Account email |
| login_url | text | Login URL |
| is_active | boolean | Active status |
| notes | text | Notes |

### Cap Table Tables

#### share_classes
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| name | text | Class name |
| class_type | text | common, preferred_a, preferred_b, etc. |
| authorized_shares | numeric | Authorized shares |
| par_value | numeric | Par value |
| price_per_share | numeric | Current price |
| voting_rights | boolean | Has voting rights |
| votes_per_share | numeric | Votes per share |
| dividend_rate | numeric | Dividend rate |
| liquidation_preference | numeric | Liquidation preference |
| participation_cap | numeric | Participation cap |
| anti_dilution | text | Anti-dilution provisions |
| conversion_ratio | numeric | Conversion ratio |
| is_convertible | boolean | Convertible flag |
| seniority | integer | Seniority rank |

#### shareholders
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| name | text | Shareholder name |
| shareholder_type | text | individual, entity, trust, fund |
| email | text | Email |
| phone | text | Phone |
| address | text | Address |
| tax_id | text | Tax ID |
| is_active | boolean | Active status |
| notes | text | Notes |

#### equity_transactions
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| shareholder_id | uuid | FK to shareholders |
| share_class_id | uuid | FK to share_classes |
| transaction_type | text | issuance, transfer, repurchase, cancellation |
| transaction_date | date | Transaction date |
| shares | numeric | Number of shares |
| price_per_share | numeric | Price per share |
| total_amount | numeric | Total transaction amount |
| from_shareholder_id | uuid | FK for transfers |
| certificate_number | text | Certificate number |
| board_approval_date | date | Board approval date |
| vesting_start_date | date | Vesting start |
| vesting_end_date | date | Vesting end |
| vesting_period_months | integer | Vesting period |
| vesting_cliff_months | integer | Cliff period |
| notes | text | Notes |

#### option_grants
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_id | uuid | FK to entities |
| shareholder_id | uuid | FK to shareholders |
| share_class_id | uuid | FK to share_classes |
| grant_type | text | iso, nso, rsa, rsu |
| grant_date | date | Grant date |
| expiration_date | date | Expiration date |
| shares_granted | numeric | Shares granted |
| shares_vested | numeric | Shares vested |
| shares_exercised | numeric | Shares exercised |
| exercise_price | numeric | Exercise price |
| status | text | active, exercised, expired, cancelled |
| vesting_start_date | date | Vesting start |
| vesting_period_months | integer | Vesting period |
| vesting_cliff_months | integer | Cliff period |
| early_exercise_allowed | boolean | Early exercise flag |
| acceleration_single_trigger | boolean | Single trigger |
| acceleration_double_trigger | boolean | Double trigger |
| notes | text | Notes |

### Security Tables

#### user_roles
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to auth.users |
| role | app_role | admin or viewer |

#### user_invitations
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | text | Invited email |
| role | text | Assigned role |
| invited_by | uuid | Inviter user ID |
| token | text | Invitation token |
| expires_at | timestamp | Expiration |
| accepted_at | timestamp | Acceptance time |

#### audit_logs
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User who made change |
| user_email | text | User email |
| action | text | Action type |
| table_name | text | Affected table |
| record_id | uuid | Affected record |
| old_values | jsonb | Previous values |
| new_values | jsonb | New values |
| ip_address | text | Client IP |
| user_agent | text | Client user agent |
| created_at | timestamp | Timestamp |

#### email_2fa_codes
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User ID |
| email | text | Email address |
| code | text | 2FA code |
| expires_at | timestamp | Expiration |
| used | boolean | Used flag |

#### trusted_devices
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User ID |
| device_id | text | Device identifier |
| device_name | text | Device name |
| user_agent | text | User agent |
| ip_address | text | IP address |
| last_used_at | timestamp | Last use |
| expires_at | timestamp | Expiration |

### Email Configuration Tables

#### mail_servers
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Server name |
| provider | text | Provider type |
| domain | text | Domain |
| smtp_host | text | SMTP host |
| smtp_port | integer | SMTP port |
| imap_host | text | IMAP host |
| imap_port | integer | IMAP port |
| username | text | Username |
| is_active | boolean | Active status |
| is_verified | boolean | Verified status |
| configuration | jsonb | Additional config |

---

## Authentication & Authorization

### Authentication Flow

1. **Sign Up**: Users register with email and password
2. **Email Verification**: Auto-confirmed (development mode)
3. **Sign In**: Email/password authentication
4. **2FA**: Email-based two-factor authentication
5. **Trusted Devices**: Remember devices for 30 days

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **admin** | Full CRUD access to all data |
| **viewer** | Read-only access to all data |

### RLS (Row Level Security)

All tables implement RLS policies:

```sql
-- Example: Authenticated users can view
CREATE POLICY "Authenticated users can view entities"
ON public.entities FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Example: Write access via can_write() function
CREATE POLICY "Users with write access can create entities"
ON public.entities FOR INSERT
WITH CHECK (can_write());

-- can_write() checks if user has admin role
CREATE FUNCTION can_write() RETURNS boolean AS $$
BEGIN
  RETURN has_role('admin', auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Edge Functions

### AI Functions

#### ai-assistant
Interactive AI chat for querying entity data.

#### summarize-contract
Generates AI summaries for uploaded contracts.

#### summarize-document
Generates AI summaries for uploaded documents.

#### analyze-bulk-documents
Batch analysis of multiple documents.

### Authentication Functions

#### send-2fa-code
Sends email verification code for 2FA.

#### verify-2fa-code
Verifies 2FA code entered by user.

#### check-trusted-device
Checks if device is trusted.

#### register-trusted-device
Registers a device as trusted.

#### revoke-trusted-device
Revokes trusted device status.

#### list-trusted-devices
Lists all trusted devices for user.

### User Management Functions

#### send-invitation
Sends email invitation to new users.

### Scheduled Functions

#### generate-recurring-tasks
Auto-generates tasks from recurring filings.

#### send-task-reminders
Sends email reminders for upcoming tasks.

### Utility Functions

#### enrich-profile
Enriches director profiles with external data.

#### fetch-social-profile
Fetches social media profile information.

#### submit-feedback
Handles user feedback submissions.

#### list-cron-jobs
Lists all cron jobs.

#### toggle-cron-job
Enables/disables cron jobs.

---

## Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, logos
│   ├── components/
│   │   ├── ai/            # AI chat components
│   │   ├── captable/      # Cap table components
│   │   ├── contracts/     # Contract components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── documents/     # Document components
│   │   ├── entity-detail/ # Entity detail components
│   │   ├── feedback/      # Feedback components
│   │   ├── filings/       # Filing calendar components
│   │   ├── forms/         # Form components
│   │   ├── layout/        # Layout components
│   │   ├── sections/      # Main section components
│   │   ├── settings/      # Settings components
│   │   ├── shared/        # Shared/reusable components
│   │   └── ui/            # shadcn/ui components
│   ├── hooks/
│   │   ├── useAuth.tsx    # Authentication hook
│   │   ├── usePortalData.ts   # Data fetching hooks
│   │   ├── usePortalMutations.ts  # Data mutation hooks
│   │   ├── useUserRole.ts # Role management hook
│   │   └── ...
│   ├── integrations/
│   │   └── supabase/      # Supabase client & types
│   ├── lib/
│   │   ├── auditLogUtils.ts   # Audit log helpers
│   │   ├── cardBrandUtils.ts  # Credit card brand detection
│   │   ├── countries.ts   # Country data
│   │   ├── filingUtils.ts # Filing helpers
│   │   ├── formSchemas.ts # Zod form schemas
│   │   ├── gravatar.ts    # Gravatar helpers
│   │   ├── states.ts      # State/province data
│   │   └── utils.ts       # Utility functions
│   ├── pages/
│   │   ├── Auth.tsx       # Authentication page
│   │   ├── EntityDetail.tsx   # Entity detail page
│   │   ├── Index.tsx      # Main dashboard
│   │   ├── NotFound.tsx   # 404 page
│   │   └── ResetPassword.tsx  # Password reset
│   ├── App.tsx            # App root
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── supabase/
│   ├── config.toml        # Supabase configuration
│   ├── functions/         # Edge functions
│   └── migrations/        # Database migrations
├── docs/                  # Documentation
└── ...config files
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd entity-vault-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

The following environment variables are automatically configured:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |

---

## Configuration

### Tailwind CSS

The project uses a custom design system with semantic color tokens defined in `src/index.css` and `tailwind.config.ts`.

### Form Validation

All forms use Zod schemas defined in `src/lib/formSchemas.ts` for type-safe validation.

### Data Fetching

- **TanStack Query**: All data fetching uses React Query
- **Hooks**: Custom hooks in `src/hooks/usePortalData.ts`
- **Mutations**: Custom mutation hooks in `src/hooks/usePortalMutations.ts`

---

## License

Proprietary - All rights reserved.

---

*Documentation generated on January 27, 2026*
