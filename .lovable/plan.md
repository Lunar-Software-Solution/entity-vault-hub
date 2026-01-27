

## Add NEQ (Quebec Enterprise Number) Tax ID Type

### Overview
Add the **NEQ (Numéro d'entreprise du Québec)** tax ID type for Quebec, Canada. The NEQ is a 10-digit unique identifier assigned by the Registraire des entreprises du Québec to all businesses registered in Quebec.

---

### What Will Be Added

| Code | Label | Description |
|------|-------|-------------|
| NEQ | Numéro d'entreprise du Québec (Quebec) | A 10-digit unique identifier assigned by the Registraire des entreprises du Québec to businesses operating in Quebec. Required for provincial business registration and filings. |

---

### Implementation Steps

#### Step 1: Database Insert
Insert the new NEQ tax ID type into the `tax_id_types` table:

```sql
INSERT INTO tax_id_types (code, label, description) VALUES
('NEQ', 'Numéro d''entreprise du Québec (Quebec)', 
 'A 10-digit unique identifier assigned by the Registraire des entreprises du Québec to all businesses registered in Quebec. Required for provincial registrations, permits, and government filings.');
```

#### Step 2: Add Format Hint to Form
Update the `TAX_ID_FORMATS` constant in `TaxIdForm.tsx` to include placeholder and hint for NEQ:

```typescript
// Add to TAX_ID_FORMATS in TaxIdForm.tsx
NEQ: { placeholder: "XXXXXXXXXX", hint: "10-digit Quebec enterprise number" },
```

---

### Result
After implementation:
- NEQ will appear in the Tax ID Type dropdown under the **Canada** group
- When selected, the Tax ID Number field will show the placeholder "XXXXXXXXXX" with the hint "10-digit Quebec enterprise number"
- Users can add Quebec Enterprise Numbers to their entities

