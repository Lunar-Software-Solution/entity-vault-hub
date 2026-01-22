
# Database Setup Plan for BraxTech Portal

## Overview
Set up a Supabase database with shared data access for all authenticated users. This enables your team to collaboratively manage entity details, bank accounts, credit cards, social media accounts, addresses, and contracts.

## Database Schema

### Core Tables

#### 1. Entity (Business/Personal Details)
Stores the main entity information displayed on the Entity Details page.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| name | text | Entity name (e.g., "Acme Corporation") |
| type | text | LLC, Corporation, Sole Proprietor, etc. |
| status | text | Active, Inactive, Pending |
| founded_date | date | Date entity was founded |
| jurisdiction | text | State/Country of registration |
| email | text | Contact email |
| phone | text | Contact phone |
| website | text | Website URL |
| ein_tax_id | text | EIN or Tax ID (encrypted/masked) |
| registration_number | text | Business registration number |
| duns_number | text | DUNS number |
| is_verified | boolean | Verification status |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### 2. Bank Accounts
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| name | text | Account nickname |
| bank | text | Bank name |
| account_number | text | Masked account number |
| routing_number | text | Routing number |
| balance | numeric | Current balance |
| currency | text | Currency code (USD, EUR, etc.) |
| type | text | Checking, Savings, etc. |
| last_transaction_amount | numeric | Last transaction amount |
| last_transaction_type | text | credit or debit |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### 3. Credit Cards
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| name | text | Card name |
| card_number | text | Masked card number |
| expiry_date | text | Expiration date (MM/YY) |
| cardholder_name | text | Name on card |
| credit_limit | numeric | Credit limit |
| current_balance | numeric | Current balance |
| minimum_payment | numeric | Minimum payment due |
| due_date | date | Payment due date |
| card_color | text | Card styling (gradient class) |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### 4. Social Media Accounts
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| platform | text | Platform name |
| username | text | Username/handle |
| profile_url | text | Full profile URL |
| followers | text | Follower count display |
| is_verified | boolean | Verification status |
| icon | text | Icon display text |
| color | text | Background color class |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### 5. Addresses
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| label | text | Address label (Home, Office) |
| type | text | home, office, shipping, billing |
| street | text | Street address |
| city | text | City |
| state | text | State/Province |
| zip | text | ZIP/Postal code |
| country | text | Country |
| is_primary | boolean | Primary address flag |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### 6. Contracts
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| title | text | Contract title |
| type | text | Real Estate, Technology, Employment, etc. |
| parties | text[] | Array of party names |
| start_date | date | Contract start date |
| end_date | date | Contract end date (null for indefinite) |
| status | text | active, expiring-soon, expired |
| value | text | Contract value display |
| value_numeric | numeric | Numeric value for calculations |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Last update timestamp |

---

## Security Model (Row Level Security)

Since all authenticated users should see the same shared data, the RLS policies will:
- **Allow all authenticated users to SELECT** (read) all records
- **Allow all authenticated users to INSERT/UPDATE/DELETE** (full access)

This creates a collaborative environment where any team member can manage all data.

Example policy pattern for each table:
```sql
-- Enable RLS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read
CREATE POLICY "Authenticated users can view all bank accounts"
  ON public.bank_accounts FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can insert
CREATE POLICY "Authenticated users can create bank accounts"
  ON public.bank_accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- All authenticated users can update
CREATE POLICY "Authenticated users can update bank accounts"
  ON public.bank_accounts FOR UPDATE
  TO authenticated
  USING (true);

-- All authenticated users can delete
CREATE POLICY "Authenticated users can delete bank accounts"
  ON public.bank_accounts FOR DELETE
  TO authenticated
  USING (true);
```

---

## Implementation Steps

### Step 1: Connect Supabase
- Connect your existing Supabase project to Lovable
- This will provide the database and authentication

### Step 2: Run Database Migrations
Create all 6 tables with proper columns, constraints, and RLS policies

### Step 3: Add Authentication
- Create login/signup pages
- Protect the portal so only authenticated users can access
- Email/password authentication (OAuth optional)

### Step 4: Update Components
Modify each section component to:
- Fetch data from Supabase instead of static arrays
- Add forms for creating new records
- Enable editing existing records
- Add delete functionality with confirmation

### Step 5: Dashboard Updates
- Update dashboard stats to reflect real database counts
- Add recent activity based on actual record timestamps

---

## Technical Notes

- **No user_id columns**: Since data is shared, we don't need to scope by user
- **Timestamps**: All tables have created_at/updated_at for audit trails
- **Encryption**: Sensitive data (account numbers, tax IDs) are stored masked in the UI but you may want to consider additional encryption for the full values
- **Supabase Client**: Will use the existing Tanstack Query setup for data fetching

---

## Next Steps After Approval

1. Connect your Supabase project to Lovable
2. I'll create the database migrations for all tables
3. Add authentication UI (login/signup)
4. Convert each section from static data to live database queries
5. Add CRUD forms for managing all data types
