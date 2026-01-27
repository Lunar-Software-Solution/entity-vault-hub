

## Add All Missing Canadian Provincial Tax ID Types

### Overview
Add comprehensive Canadian provincial and territorial tax ID types to support businesses registered across all Canadian jurisdictions. This includes provincial corporation/business registry numbers, provincial sales tax accounts, and other mandatory identifiers.

---

### Tax ID Types to Add

#### Provincial Corporation/Business Registry Numbers

| Code | Label | Description |
|------|-------|-------------|
| ON_CORP | Ontario Corporation Number (Ontario) | 7-digit number assigned by Ontario Business Registry to incorporated businesses in Ontario. |
| BC_CORP | BC Incorporation Number (British Columbia) | Alphanumeric identifier (e.g., BC1234567) assigned by BC Registry Services to incorporated businesses. |
| AB_CORP | Corporate Access Number (Alberta) | 9-digit number assigned by Alberta Corporate Registry to registered businesses. |
| MB_CORP | Manitoba Business Number (Manitoba) | Registration number assigned by Companies Office of Manitoba to incorporated businesses. |
| SK_CORP | Saskatchewan Corporation Number (Saskatchewan) | Registration number assigned by ISC Corporate Registry to Saskatchewan corporations. |
| NS_CORP | Nova Scotia Registry ID (Nova Scotia) | Registration number assigned by NS Registry of Joint Stock Companies. |
| NB_CORP | New Brunswick Corporation Number (New Brunswick) | Registration number assigned by Service New Brunswick Corporate Registry. |
| PE_CORP | PEI Corporation Number (Prince Edward Island) | Registration number assigned by PEI Corporate/Business Names Registry. |
| NL_CORP | Newfoundland Corporation Number (Newfoundland & Labrador) | Registration number assigned by NL Companies & Deeds Registry. |
| NT_BL | NWT Business Licence (Northwest Territories) | Business licence number issued by GNWT to businesses operating in NWT. |
| YT_CORP | Yukon Corporation Number (Yukon) | Registration number assigned by Yukon Corporate Affairs. |
| NU_BL | Nunavut Business Licence (Nunavut) | Business licence number issued by Nunavut Legal Registries. |
| FED_CORP | Federal Corporation Number (Canada Federal) | Corporation number assigned by Corporations Canada to federally incorporated businesses. |

#### Provincial Sales Tax Accounts

| Code | Label | Description |
|------|-------|-------------|
| RST_MB | Retail Sales Tax Number (Manitoba) | Registration number for collecting and remitting Manitoba's 7% Retail Sales Tax. |
| PST_SK | PST Vendor Licence (Saskatchewan) | Licence number for collecting and remitting Saskatchewan's 6% Provincial Sales Tax. |
| PST_BC | BC PST Number (British Columbia) | Registration number for collecting and remitting BC's 7% Provincial Sales Tax. |

---

### Implementation Steps

#### Step 1: Database Insert
Insert the new tax ID types into the `tax_id_types` table:

```sql
INSERT INTO tax_id_types (code, label, description) VALUES
-- Federal
('FED_CORP', 'Federal Corporation Number (Canada Federal)', 
 'Corporation number assigned by Corporations Canada to federally incorporated businesses.'),

-- Provincial Corporation Numbers
('ON_CORP', 'Ontario Corporation Number (Ontario)', 
 '7-digit number assigned by Ontario Business Registry to incorporated businesses in Ontario.'),
('BC_CORP', 'BC Incorporation Number (British Columbia)', 
 'Alphanumeric identifier (e.g., BC1234567) assigned by BC Registry Services to incorporated businesses.'),
('AB_CORP', 'Corporate Access Number (Alberta)', 
 '9-digit number assigned by Alberta Corporate Registry to registered businesses.'),
('MB_CORP', 'Manitoba Business Number (Manitoba)', 
 'Registration number assigned by Companies Office of Manitoba to incorporated businesses.'),
('SK_CORP', 'Saskatchewan Corporation Number (Saskatchewan)', 
 'Registration number assigned by ISC Corporate Registry to Saskatchewan corporations.'),
('NS_CORP', 'Nova Scotia Registry ID (Nova Scotia)', 
 'Registration number assigned by NS Registry of Joint Stock Companies.'),
('NB_CORP', 'New Brunswick Corporation Number (New Brunswick)', 
 'Registration number assigned by Service New Brunswick Corporate Registry.'),
('PE_CORP', 'PEI Corporation Number (Prince Edward Island)', 
 'Registration number assigned by PEI Corporate/Business Names Registry.'),
('NL_CORP', 'Newfoundland Corporation Number (Newfoundland & Labrador)', 
 'Registration number assigned by NL Companies & Deeds Registry.'),
('NT_BL', 'NWT Business Licence (Northwest Territories)', 
 'Business licence number issued by GNWT to businesses operating in NWT.'),
('YT_CORP', 'Yukon Corporation Number (Yukon)', 
 'Registration number assigned by Yukon Corporate Affairs.'),
('NU_BL', 'Nunavut Business Licence (Nunavut)', 
 'Business licence number issued by Nunavut Legal Registries.'),

-- Provincial Sales Tax Accounts
('RST_MB', 'Retail Sales Tax Number (Manitoba)', 
 'Registration number for collecting and remitting Manitoba''s 7% Retail Sales Tax.'),
('PST_SK', 'PST Vendor Licence (Saskatchewan)', 
 'Licence number for collecting and remitting Saskatchewan''s 6% Provincial Sales Tax.'),
('PST_BC', 'BC PST Number (British Columbia)', 
 'Registration number for collecting and remitting BC''s 7% Provincial Sales Tax.');
```

#### Step 2: Add Format Hints to TaxIdForm.tsx
Update the `TAX_ID_FORMATS` constant with placeholders and hints:

```typescript
// Canada - Federal
FED_CORP: { placeholder: "XXXXXXX", hint: "Federal corporation number" },

// Canada - Provincial Corporation Numbers
ON_CORP: { placeholder: "XXXXXXX", hint: "7-digit Ontario corporation number" },
BC_CORP: { placeholder: "BC XXXXXXX", hint: "BC + 7-digit number" },
AB_CORP: { placeholder: "XXXXXXXXX", hint: "9-digit Corporate Access Number" },
MB_CORP: { placeholder: "XXXXXXX", hint: "Manitoba business number" },
SK_CORP: { placeholder: "XXXXXXX", hint: "Saskatchewan corporation number" },
NS_CORP: { placeholder: "XXXXXXX", hint: "Nova Scotia registry ID" },
NB_CORP: { placeholder: "XXXXXX", hint: "New Brunswick corporation number" },
PE_CORP: { placeholder: "XXXXXX", hint: "PEI corporation number" },
NL_CORP: { placeholder: "XXXXXXX", hint: "Newfoundland corporation number" },
NT_BL: { placeholder: "XXXXXX", hint: "NWT business licence number" },
YT_CORP: { placeholder: "XXXXXXX", hint: "Yukon corporation number" },
NU_BL: { placeholder: "XXXXXX", hint: "Nunavut business licence number" },

// Canada - Provincial Sales Tax
RST_MB: { placeholder: "XXXXXXX", hint: "Manitoba RST number" },
PST_SK: { placeholder: "XXXXXXX", hint: "Saskatchewan PST vendor licence" },
PST_BC: { placeholder: "PST-XXXX-XXXX", hint: "BC PST registration number" },
```

#### Step 3: Update Country Pattern Matching
Update the `countryPatterns` in TaxIdForm.tsx to properly group all Canadian types:

```typescript
'Canada': /\(Canada\)|\(Ontario\)|\(British Columbia\)|\(Alberta\)|\(Manitoba\)|\(Saskatchewan\)|\(Nova Scotia\)|\(New Brunswick\)|\(Prince Edward Island\)|\(Newfoundland\)|\(Northwest Territories\)|\(Yukon\)|\(Nunavut\)|\(Quebec\)|\(Canada Federal\)/i,
```

---

### Result
After implementation:
- 16 new Canadian tax ID types will be added to the database
- All types will appear in the Tax ID Type dropdown grouped under **Canada**
- Each type will have appropriate placeholder text and format hints
- Covers all 13 provinces/territories plus federal corporation numbers

