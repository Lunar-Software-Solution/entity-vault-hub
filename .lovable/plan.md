
# Mapbox Geocoding Address Autocomplete Integration

## Summary

Integrate Mapbox Search JS into the AddressForm component to provide worldwide address autocomplete functionality. Users will be able to type an address and receive real-time suggestions that automatically populate the street, city, state, zip, and country fields.

---

## Architecture Overview

The implementation will use Mapbox's official `@mapbox/search-js-react` package which provides the `AddressAutofill` component specifically designed for address forms. This component wraps standard HTML inputs and automatically handles autocomplete suggestions.

```text
+-------------------+     +----------------------+     +------------------+
|   AddressForm     | --> | AddressAutofill      | --> | Mapbox Geocoding |
|   (React Form)    |     | (@mapbox/search-js)  |     | API (worldwide)  |
+-------------------+     +----------------------+     +------------------+
         |                         |
         v                         v
+-------------------+     +----------------------+
|  Form Fields      |     | Suggestion Dropdown  |
|  (auto-populated) |     | (address results)    |
+-------------------+     +----------------------+
```

---

## Implementation Steps

### Step 1: Store the Mapbox Access Token

Request the user to provide their Mapbox public access token. This is a publishable key that can be safely used in frontend code.

**Action:** Use the secrets tool to prompt for `MAPBOX_ACCESS_TOKEN`

---

### Step 2: Install the Mapbox Search JS Package

Add the `@mapbox/search-js-react` package to the project dependencies.

**Package:** `@mapbox/search-js-react`

---

### Step 3: Create AddressAutocomplete Component

Create a reusable `AddressAutocomplete.tsx` component in `src/components/shared/` that:

- Wraps the Mapbox `AddressAutofill` component
- Provides an input field for street address with autocomplete
- Exposes an `onAddressSelect` callback with parsed address components
- Handles the Mapbox API response and maps it to our address schema

**Key Features:**
- Real-time address suggestions as user types
- Worldwide coverage with proper localization
- Parses response into: street, city, state/region, postal code, country
- Matches existing form styling using shadcn/ui Input component

**File:** `src/components/shared/AddressAutocomplete.tsx`

---

### Step 4: Update AddressForm to Use Autocomplete

Modify `AddressForm.tsx` to:

1. Replace the plain street Input with the new `AddressAutocomplete` component
2. When an address is selected from suggestions, auto-fill:
   - Street address (address-line1)
   - City (address-level2)
   - State/Province (address-level1)
   - ZIP/Postal code (postal-code)
   - Country (country-name)
3. Keep all fields editable for manual corrections
4. Show a toggle to switch between autocomplete and manual entry modes

**File:** `src/components/forms/AddressForm.tsx`

---

### Step 5: Handle Address Field Mapping

Create utility functions to map Mapbox response format to our address schema:

```text
Mapbox Response           ->  Our Schema
-------------------------     ------------------
address_line1             ->  street
place (locality)          ->  city
region (address-level1)   ->  state
postcode                  ->  zip
country                   ->  country
```

The Mapbox `AddressAutofill` component uses the `autocomplete` HTML attribute standard, making the mapping straightforward.

---

## Technical Details

### Mapbox AddressAutofill Component Usage

The Mapbox `AddressAutofill` component works by wrapping form inputs that have proper `autocomplete` HTML attributes:

- `address-line1` - Street address (triggers autocomplete)
- `address-level2` - City
- `address-level1` - State/Province
- `postal-code` - ZIP/Postal code
- `country-name` - Country

When a user selects a suggestion, Mapbox automatically fills all related input fields based on their autocomplete attributes.

### API Rate Limits

Mapbox provides 100,000 free geocoding requests per month, which should be sufficient for this portal's usage.

### No Map Display Required

Unlike Google Places, Mapbox does not require displaying a map to use the geocoding API, keeping the implementation simple.

---

## Files to Create

1. `src/components/shared/AddressAutocomplete.tsx` - Reusable autocomplete input component

---

## Files to Modify

1. `src/components/forms/AddressForm.tsx` - Integrate the autocomplete component
2. `package.json` - Add `@mapbox/search-js-react` dependency

---

## User Experience

1. User clicks on the "Street Address" field
2. As they type, address suggestions appear in a dropdown
3. User selects an address from the list
4. City, State, ZIP, and Country fields auto-populate
5. User can manually edit any field if needed
6. A small "Enter manually" link allows bypassing autocomplete

---

## Fallback Behavior

- If Mapbox API is unavailable, the form falls back to manual entry
- All fields remain editable regardless of autocomplete selection
- The existing country dropdown remains available for selection
