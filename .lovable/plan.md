

# Plan: Add International Banking Fields to Bank Accounts

## Overview
Extend the bank accounts feature to support international banking details including IBAN, SWIFT/BIC codes, account holder name, and bank address. This enables proper storage of accounts like Wise that have different details for domestic vs international transfers.

## Database Migration

Add new columns to the `bank_accounts` table:

| Column | Type | Description |
|--------|------|-------------|
| `iban` | TEXT | International Bank Account Number (SEPA) |
| `swift_bic` | TEXT | SWIFT/BIC code for international transfers |
| `account_holder_name` | TEXT | Legal name on the account |
| `bank_address` | TEXT | Full bank branch address |

```sql
ALTER TABLE public.bank_accounts 
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS swift_bic TEXT,
ADD COLUMN IF NOT EXISTS account_holder_name TEXT,
ADD COLUMN IF NOT EXISTS bank_address TEXT;
```

## Code Changes

### 1. Update Form Schema (`src/lib/formSchemas.ts`)
- Add `iban` field (optional string)
- Add `swift_bic` field (optional, max 11 characters per SWIFT standard)
- Add `account_holder_name` field (optional string)
- Add `bank_address` field (optional string)

### 2. Update Bank Account Form (`src/components/forms/BankAccountForm.tsx`)
Add new form fields organized in sections:
- **Account Holder** section: Account holder name field
- **Account Details** section: Existing fields plus IBAN
- **Routing Information** section: Routing number and SWIFT/BIC
- **Bank Information** section: Bank name, website, and address

### 3. Update Bank Accounts Display (`src/components/sections/BankAccountsSection.tsx`)
Extend the account card to show:
- Account holder name (if different from account name)
- IBAN (when present, in addition to account number)
- SWIFT/BIC code
- Bank address

### 4. Update Entity Detail View (`src/components/entity-detail/LinkedBankAccounts.tsx`)
Show key international details in the compact linked accounts view.

### 5. Update Mutations (`src/hooks/usePortalMutations.ts`)
Ensure create and update mutations include the new fields.

## Visual Layout (Updated Form)

```text
+--------------------------------------------------+
| Linked Entity: [Select entity dropdown]          |
+--------------------------------------------------+
| Account Holder Name    | Account Name (nickname) |
| [LUNAR TECHNOLOGIES]   | [Primary EUR Account]   |
+--------------------------------------------------+
| Bank Name              | Bank Website            |
| [Wise]                 | [https://wise.com]      |
+--------------------------------------------------+
| Account Number         | IBAN                    |
| [****1234]             | [BE95 9676 8175 4358]   |
+--------------------------------------------------+
| Routing Number         | SWIFT/BIC               |
| [026073150]            | [TRWIBEB1XXX]           |
+--------------------------------------------------+
| Account Type           | Currency                |
| [Checking]             | [EUR]                   |
+--------------------------------------------------+
| Bank Address                                     |
| [Wise, Rue du Trône 100, 3rd floor, Brussels...] |
+--------------------------------------------------+
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/formSchemas.ts` | Add 4 new optional fields to schema |
| `src/components/forms/BankAccountForm.tsx` | Add form inputs for new fields |
| `src/components/sections/BankAccountsSection.tsx` | Display new fields in card |
| `src/components/entity-detail/LinkedBankAccounts.tsx` | Show international details |
| `src/hooks/usePortalMutations.ts` | Include new fields in mutations |

## Example Result

After implementation, your Wise accounts will display like:

**EUR Account Card:**
- Account Holder: LUNAR TECHNOLOGIES OOD
- IBAN: BE95 9676 8175 4358
- SWIFT/BIC: TRWIBEB1XXX
- Bank: Wise, Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium

**USD Account Card:**
- Account Holder: LUNAR TECHNOLOGIES OOD
- Account: 8313453359 | Routing: 026073150
- SWIFT/BIC: CMFGUS33
- Bank: Community Federal Savings Bank, 89-16 Jamaica Ave, Woodhaven, NY, 11421, United States

