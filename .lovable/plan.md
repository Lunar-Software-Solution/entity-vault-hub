
# Multi-Entity Support for Phone Numbers and Email Addresses

## Summary

The database migration was completed successfully, creating the `phone_number_entity_links` and `email_entity_links` junction tables. However, the code implementation to use these tables is still needed. This plan covers creating the UI components and updating existing forms to enable many-to-many relationships between phone numbers/emails and entities.

---

## Implementation Steps

### Step 1: Create Phone Number Entity Affiliations Manager

Create a new component `PhoneNumberEntityAffiliationsManager.tsx` that allows users to link a phone number to multiple entities with specific roles (e.g., 'main', 'billing', 'support').

**Key Features:**
- Display existing entity affiliations for a phone number
- Add new affiliations with role selection
- Mark one affiliation as primary
- Remove affiliations
- Follows the same pattern as `AddressEntityAffiliationsManager`

---

### Step 2: Create Email Entity Affiliations Manager

Create a new component `EmailEntityAffiliationsManager.tsx` following the same pattern for email addresses.

**Key Features:**
- Display existing entity affiliations for an email
- Add new affiliations with role selection (e.g., 'general', 'billing', 'support', 'notifications')
- Mark one affiliation as primary
- Remove affiliations

---

### Step 3: Update Phone Number Form

Modify `PhoneNumberForm.tsx` to:
- Include the `PhoneNumberEntityAffiliationsManager` component when editing an existing phone number
- Add a "Linked Entities" section below the main form fields
- This allows managing complex multi-entity relationships after the phone number is created

---

### Step 4: Update Linked Phone Numbers Component

Modify `LinkedPhoneNumbers.tsx` to:
- Query both the legacy `entity_id` column AND the new `phone_number_entity_links` junction table
- Merge results to show all phone numbers linked to an entity
- Display role and link indicator for junction-table relationships
- Maintain backward compatibility with existing data

---

### Step 5: Create Linked Email Addresses Component

Create a new `LinkedEmailAddresses.tsx` component for the Entity Detail page that:
- Shows emails linked via the legacy `entity_id` column
- Also queries `email_entity_links` junction table for additional affiliations
- Displays inline add/edit/delete functionality
- Shows role badges for affiliated emails

---

### Step 6: Update Email Section Form

Modify `EmailSection.tsx` to:
- Include the `EmailEntityAffiliationsManager` when editing existing emails
- Allow managing multi-entity affiliations after the email is created

---

### Step 7: Update Entity Detail Page

Modify `EntityDetail.tsx` to:
- Import and use the new `LinkedEmailAddresses` component
- Pass `entityId` to `LinkedPhoneNumbers` for junction table queries
- Add the email addresses section to the entity detail view

---

## Technical Details

### Junction Table Queries

Both components will use queries like:

```text
supabase
  .from("phone_number_entity_links")
  .select(`
    id,
    phone_number_id,
    is_primary,
    role,
    phone_number:phone_numbers(*)
  `)
  .eq("entity_id", entityId)
```

### Role Options

**Phone Numbers:**
- main, billing, support, sales, fax, mobile, office, other

**Email Addresses:**
- general, billing, support, notifications, marketing, legal, hr, other

### Files to Create

1. `src/components/forms/PhoneNumberEntityAffiliationsManager.tsx`
2. `src/components/forms/EmailEntityAffiliationsManager.tsx`
3. `src/components/entity-detail/LinkedEmailAddresses.tsx`

### Files to Modify

1. `src/components/forms/PhoneNumberForm.tsx` - Add affiliations manager
2. `src/components/entity-detail/LinkedPhoneNumbers.tsx` - Query junction table
3. `src/components/sections/EmailSection.tsx` - Add affiliations manager to form
4. `src/pages/EntityDetail.tsx` - Add email section, pass entityId to phone section

---

## Backward Compatibility

The implementation maintains backward compatibility:
- Existing records with `entity_id` continue to work
- Junction table adds additional affiliations
- UI merges both data sources seamlessly
