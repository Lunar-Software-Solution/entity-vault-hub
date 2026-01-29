
# Auto-Create Website Records from Cloudflare DNS

## Overview
Transform the current Cloudflare DNS integration from a display-only feature into a bulk website creation tool. When a user enters a root domain (e.g., `braxtech.net`) and fetches DNS records, the system will identify all A and CNAME records (subdomains like `support.braxtech.net`, `sales.braxtech.net`) and allow batch creation of website records.

## User Flow

1. User navigates to the **Websites** section
2. Clicks **"Import from Cloudflare"** button (new)
3. Enters root domain (e.g., `braxtech.net`)
4. System fetches all A/CNAME records from Cloudflare
5. User sees a list of discovered domains with checkboxes
6. User selects which domains to import
7. Optionally links them to an entity
8. Clicks **"Create Websites"** to bulk-create records

## Implementation Details

### 1. New Component: CloudflareWebsiteImporter
Create a new dialog component for the import workflow:

**File**: `src/components/forms/CloudflareWebsiteImporter.tsx`

Features:
- Domain input field with fetch button
- List of discovered DNS records as selectable items
- Each record shows: subdomain name, record type (A/CNAME), target IP/hostname
- "Select All" / "Deselect All" toggle
- Optional entity selector to link all imported websites
- Website type selector (default: "other")
- Progress indicator during bulk creation

### 2. New Mutation Hook: useBulkCreateEntityWebsites
Add a bulk creation mutation to handle multiple website inserts efficiently.

**File**: `src/hooks/usePortalMutations.ts`

```text
export const useBulkCreateEntityWebsites = () => {
  // Insert multiple websites in a single transaction
  // Show success toast with count of created records
}
```

### 3. Update WebsitesSection
Add an "Import from Cloudflare" button alongside the existing "Add Website" button.

**File**: `src/components/sections/WebsitesSection.tsx`

Changes:
- Add import button with Cloud icon
- Add state for import dialog visibility
- Render the new `CloudflareWebsiteImporter` dialog

### 4. Intelligent Record Processing
The importer will:
- Filter out duplicate entries (records already existing in entity_websites)
- Auto-generate website names from subdomain (e.g., `support.braxtech.net` becomes "Support")
- Construct full URLs with https:// prefix
- Set sensible defaults (type: "other", is_active: true)

---

## Technical Details

### Component Structure
```text
src/components/forms/CloudflareWebsiteImporter.tsx
├── Domain input + fetch button
├── Loading state
├── Error display
├── DNS Records list (with checkboxes)
│   └── Each record: checkbox, name badge, type badge, target
├── Entity selector (optional)
├── Website type selector
└── Action buttons: Cancel, Create Selected
```

### Data Flow
```text
1. User enters domain
2. Call fetch-cloudflare-dns edge function
3. Receive DNS records array
4. Filter against existing websites (prevent duplicates)
5. User selects records to import
6. Generate website objects from selected records
7. Bulk insert via useBulkCreateEntityWebsites
8. Invalidate queries and close dialog
```

### Website Generation Logic
For each selected DNS record:
```text
- url: `https://${record.name}`
- name: Capitalize first segment (e.g., "support" → "Support") or use domain if root
- type: User-selected or "other"
- platform: null
- is_primary: false (first one could be true for root domain)
- is_active: true
- entity_id: From optional entity selector
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/forms/CloudflareWebsiteImporter.tsx` | Create new |
| `src/hooks/usePortalMutations.ts` | Add bulk mutation |
| `src/components/sections/WebsitesSection.tsx` | Add import button |

---

## Edge Cases Handled
- Duplicate detection: Skip records where URL already exists in database
- Root domain handling: `braxtech.net` A record treated as main website
- Wildcard records: Skip `*.domain.com` entries (not valid URLs)
- Error handling: Show clear messages if Cloudflare API fails
