

# Plan: Add Comprehensive Tax ID Types for Canada, France, Netherlands, UK, and Others

## Current State Analysis

The database currently has **12 tax ID types**:
- USA: EIN, SSN, ITIN
- Generic: TIN, VAT, GST
- Other: ABN (Australia), CNPJ (Brazil), NIF (Spain), PAN (India), RFC (Mexico), UTR (UK)

## Missing Tax ID Types to Add

### Canada (Priority - 6 types)
| Code | Label | Description |
|------|-------|-------------|
| SIN | Social Insurance Number (Canada) | 9-digit number for individuals for tax filing and employment |
| BN | Business Number (Canada) | 9-digit CRA identifier for businesses |
| GST/HST | GST/HST Registration Number (Canada) | Federal goods and services tax registration (RT0001 format) |
| PST | Provincial Sales Tax Number (Canada) | Provincial sales tax registration for BC, SK, MB |
| QST | Quebec Sales Tax Number (Canada) | Quebec provincial sales tax registration number |
| RST | Retail Sales Tax Number (Canada) | Manitoba retail sales tax registration |

### France (3 types)
| Code | Label | Description |
|------|-------|-------------|
| SIREN | SIREN Number (France) | 9-digit unique business identifier from INSEE |
| SIRET | SIRET Number (France) | 14-digit establishment identifier (SIREN + NIC) |
| TVA | TVA Intracommunautaire (France) | French VAT number (FR + 11 characters) |

### Netherlands (3 types)
| Code | Label | Description |
|------|-------|-------------|
| KVK | KVK Number (Netherlands) | 8-digit Chamber of Commerce registration |
| BTW | BTW Number (Netherlands) | Dutch VAT number (NL + 9 digits + B + 2 digits) |
| BSN | Burgerservicenummer (Netherlands) | 9-digit personal identification number |

### United Kingdom (2 types)
| Code | Label | Description |
|------|-------|-------------|
| NI | National Insurance Number (UK) | Alphanumeric identifier (XX XXXXXX X) for individuals |
| CRN | Company Registration Number (UK) | 8-character Companies House identifier |

### Australia (2 types)
| Code | Label | Description |
|------|-------|-------------|
| ACN | Australian Company Number | 9-digit company identifier |
| TFN | Tax File Number (Australia) | 8-9 digit individual/entity tax number |

### Bulgaria (1 type)
| Code | Label | Description |
|------|-------|-------------|
| EIK | EIK/BULSTAT (Bulgaria) | 9 or 13-digit business registration number |

## Implementation Steps

### Step 1: Database Insert
Insert **17 new tax ID types** into the `tax_id_types` table:

```sql
INSERT INTO tax_id_types (code, label, description) VALUES
-- Canada
('SIN', 'Social Insurance Number (Canada)', 'A 9-digit number (XXX-XXX-XXX) issued by Service Canada to individuals for tax filing, employment records, and government benefits.'),
('BN', 'Business Number (Canada)', 'A 9-digit identifier assigned by the Canada Revenue Agency (CRA) to businesses for GST/HST, payroll, import/export, and corporate tax.'),
('GST_CA', 'GST/HST Registration (Canada)', 'A 15-character federal sales tax account number (9-digit BN + RT + 4 digits). Required for collecting and remitting GST/HST.'),
('PST', 'Provincial Sales Tax (Canada)', 'Provincial sales tax registration number for British Columbia, Saskatchewan, and Manitoba. Format varies by province.'),
('QST', 'Quebec Sales Tax Number (Canada)', 'A 10-digit registration number issued by Revenu Quebec for collecting and remitting Quebec Sales Tax (TVQ).'),

-- France
('SIREN', 'SIREN Number (France)', 'A 9-digit unique identifier assigned by INSEE to French businesses upon registration.'),
('SIRET', 'SIRET Number (France)', 'A 14-digit number combining SIREN (9 digits) and NIC (5 digits) identifying each business establishment in France.'),
('TVA', 'TVA Intracommunautaire (France)', 'French VAT identification number in format FR + 2 check digits + 9-digit SIREN. Required for EU trade.'),

-- Netherlands
('KVK', 'KVK Number (Netherlands)', 'An 8-digit registration number from the Dutch Chamber of Commerce (Kamer van Koophandel).'),
('BTW', 'BTW Number (Netherlands)', 'Dutch VAT identification number in format NL + 9 digits + B + 2 digits.'),
('BSN', 'Burgerservicenummer (Netherlands)', 'A 9-digit personal identification number for Dutch residents used for tax and government services.'),

-- United Kingdom
('NI', 'National Insurance Number (UK)', 'Alphanumeric identifier (XX XXXXXX X) issued by HMRC for employment, tax contributions, and state benefits.'),
('CRN', 'Company Registration Number (UK)', 'An 8-character identifier assigned by Companies House to registered UK companies.'),

-- Australia
('ACN', 'Australian Company Number', 'A 9-digit unique identifier assigned by ASIC to all registered Australian companies.'),
('TFN', 'Tax File Number (Australia)', 'An 8-9 digit number issued by the ATO to individuals and entities for tax purposes.'),

-- Bulgaria
('EIK', 'EIK/BULSTAT (Bulgaria)', 'A 9 or 13-digit unified identification code for Bulgarian legal entities and sole traders.');
```

### Step 2: Update Form Placeholders (Already Done)
The `TaxIdForm.tsx` already has the `TAX_ID_FORMATS` constant with placeholders for all these types. We only need to add formats for the new Canadian sales tax types:

```typescript
// Add to TAX_ID_FORMATS in TaxIdForm.tsx
GST_CA: { placeholder: "XXXXXXXXX RT XXXX", hint: "BN + RT + 4 digits" },
PST: { placeholder: "PST-XXXX-XXXX", hint: "Format varies by province" },
QST: { placeholder: "XXXXXXXXXX TQ XXXX", hint: "10-digit QST number" },
```

## Summary

| Country | Types Added |
|---------|-------------|
| Canada | SIN, BN, GST_CA, PST, QST (5 types) |
| France | SIREN, SIRET, TVA (3 types) |
| Netherlands | KVK, BTW, BSN (3 types) |
| UK | NI, CRN (2 types) |
| Australia | ACN, TFN (2 types) |
| Bulgaria | EIK (1 type) |

**Total**: 16 new tax ID types will be added to the system, bringing the total from 12 to 28 types.

