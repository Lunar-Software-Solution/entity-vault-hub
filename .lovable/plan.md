
# Remove Primary Entity Field from Address Form

## Summary

Remove the "Primary Entity" dropdown field from the Address form and transition to using only the "Linked Entities" concept via the `address_entity_links` junction table. This simplifies the address-entity relationship to a single, consistent many-to-many pattern.

---

## Current State

The Address form currently has two ways to link an address to an entity:

1. **Primary Entity field** (line 44-61 in AddressForm.tsx): A dropdown that sets the `entity_id` column directly on the `addresses` table
2. **Linked Entities section** (AddressEntityAffiliationsManager): A junction table approach that allows many-to-many relationships with roles

This creates confusion and redundancy. The plan is to remove option 1 and rely solely on the junction table approach.

---

## Implementation Steps

### Step 1: Update AddressForm.tsx

Remove the "Primary Entity" field and its associated logic:

- Remove the `entity_id` FormField (lines 44-61)
- Remove `entity_id` from the form's defaultValues
- Remove the `useEntities` import (no longer needed in form)
- Keep the `AddressEntityAffiliationsManager` section for linking entities

---

### Step 2: Update Form Schema

Modify `addressSchema` in `formSchemas.ts`:

- Remove the `entity_id` field from the schema
- Remove `entity_id` from the `AddressFormData` type

---

### Step 3: Update AddressesSection.tsx

Update the section to handle the removal of direct `entity_id`:

- Update the `handleSubmit` function to not include `entity_id`
- Update the `filteredAddresses` logic to also check the junction table for entity filtering
- Update the entity display logic on cards to use junction table data

---

### Step 4: Update LinkedAddresses.tsx

Simplify the component since addresses will only come from the junction table:

- Remove the legacy `addresses` prop that relied on direct `entity_id`
- Query only from `address_entity_links` junction table
- Update the component interface to only require `entityId`

---

### Step 5: Database Migration (Optional - For Cleanup)

**Note:** The `entity_id` column in the `addresses` table can be kept for backward compatibility with existing data. Alternatively, a migration can:

- Set all existing `addresses.entity_id` values to create corresponding `address_entity_links` entries
- Then set `entity_id` to null on all addresses

This step is optional and can be done later if full migration is desired.

---

## Technical Details

### Files to Modify

1. `src/components/forms/AddressForm.tsx`
   - Remove the Primary Entity select field
   - Remove `entity_id` from defaultValues
   - Remove unused `useEntities` hook

2. `src/lib/formSchemas.ts`
   - Remove `entity_id` from `addressSchema`
   - Remove `entity_id` from `AddressFormData` type

3. `src/components/sections/AddressesSection.tsx`
   - Update `handleSubmit` to not pass `entity_id`
   - Update filtering logic to query junction table
   - Update card display to show entities from junction table

4. `src/components/entity-detail/LinkedAddresses.tsx`
   - Remove the `addresses` prop
   - Simplify to only query junction table

---

## Impact on Entity Filtering

Currently, the Addresses section can filter by entity using the direct `entity_id`. After this change:

- Filtering will query the `address_entity_links` table instead
- An address will appear for an entity if it has a link in the junction table
- This is consistent with how the LinkedAddresses component already works

---

## Backward Compatibility

- Existing addresses with `entity_id` set will need to be migrated to the junction table
- The LinkedAddresses component already handles both sources, so existing data will still display correctly in entity detail view
- After migration, all new entity associations will use the junction table exclusively
