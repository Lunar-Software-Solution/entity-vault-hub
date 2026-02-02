

# Add Payment Providers Management to Settings

## Overview

This feature adds a new "Payment Providers" tab to the Settings section, allowing administrators to manage the list of payment processing providers (Stripe, Square, PayPal, etc.) that can be selected when adding Merchant Accounts. This follows the same pattern as existing lookup tables like Website Types, Website Platforms, Software Catalog, etc.

## Why This Approach?

The Settings section already manages several lookup/master data tables:
- Tax ID Types
- Issuing Authorities  
- Document Types
- Filing Types
- Software Catalog
- Website Types
- Website Platforms

Adding "Payment Providers" follows this established pattern, making the codebase consistent and the feature familiar to users.

## Database Schema

Create a new `payment_providers` lookup table:

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | Yes | gen_random_uuid() | Primary key |
| code | text | Yes | - | Short code (e.g., "stripe", "square") |
| name | text | Yes | - | Display name (e.g., "Stripe", "Square") |
| website | text | No | - | Provider website URL |
| description | text | No | - | Optional description |
| created_at | timestamptz | Yes | now() | Creation timestamp |
| updated_at | timestamptz | Yes | now() | Last update timestamp |

RLS policies will follow the same pattern as other lookup tables:
- Authenticated users can SELECT
- Users with write access (admin role) can INSERT, UPDATE, DELETE

Seed data will include common payment providers:
- Stripe
- Square
- PayPal
- Adyen
- Braintree
- Authorize.Net
- Worldpay
- Shopify Payments
- Checkout.com
- 2Checkout

## Technical Implementation

### File 1: Database Migration

Create `payment_providers` table with:
- Standard columns (id, code, name, website, description, timestamps)
- RLS policies matching the pattern of `website_platforms`
- `updated_at` trigger
- Audit trigger
- Seed common providers

### File 2: `src/hooks/usePortalData.ts`

Add:
- `PaymentProvider` type export
- `usePaymentProviders` hook

```typescript
export type PaymentProvider = Tables<"payment_providers">;

export const usePaymentProviders = () => {
  return useQuery({
    queryKey: ["payment_providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_providers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as PaymentProvider[];
    },
  });
};
```

### File 3: `src/hooks/usePortalMutations.ts`

Add CRUD mutation hooks:
- `useCreatePaymentProvider`
- `useUpdatePaymentProvider`
- `useDeletePaymentProvider`

### File 4: `src/components/sections/SettingsSection.tsx`

Add:
1. Import `usePaymentProviders` and mutation hooks
2. Form component `PaymentProviderForm` with fields:
   - Code (required)
   - Name (required)
   - Website (optional URL)
   - Description (optional)
3. State variables for:
   - `showProviderForm`
   - `editingProvider`
   - `deletingProvider`
   - `providerSearch`
   - `providerSortKey`
   - `providerSortDirection`
4. New tab: "Providers" with CreditCard icon
5. TabContent with searchable/sortable table
6. Dialog for add/edit form
7. Delete confirmation dialog

## UI Design

The new "Providers" tab will appear in the Settings tabs:

```
[Tax IDs] [Authorities] [Docs] [Filings] [Software] [Web Types] [Platforms] [Providers]
```

Table columns:
| Code | Name | Website | Description | Actions |

Each row will show:
- Code in monospace font
- Provider name
- Website as clickable link (if provided)
- Description (truncated)
- Edit/Delete buttons (for admin users)

## Files to Modify

| File | Changes |
|------|---------|
| Database Migration | Create `payment_providers` table with RLS, triggers, and seed data |
| `src/hooks/usePortalData.ts` | Add `PaymentProvider` type and `usePaymentProviders` hook |
| `src/hooks/usePortalMutations.ts` | Add Create/Update/Delete mutation hooks |
| `src/components/sections/SettingsSection.tsx` | Add tab, form, table, dialogs for Payment Providers |

## Future Integration

Once this lookup table exists, the Merchant Accounts feature can use it:
- The MerchantAccountForm will have a dropdown populated from `payment_providers`
- Users can select from the managed list or the Merchant Account can reference the provider_id

