

# Add US Secretary of State Issuing Authorities

## Overview
Add all US Secretary of State offices that issue Certificates of Incorporation to the issuing authorities dropdown. This will populate the "Issuing Authority" field with state-by-state options for US corporate formation documents.

## What Will Be Added

A total of **56 new issuing authorities** for the United States:

**All 50 States:**
- Alabama Secretary of State
- Alaska Department of Commerce (Division of Corporations)
- Arizona Corporation Commission
- Arkansas Secretary of State
- California Secretary of State
- Colorado Secretary of State
- Connecticut Secretary of State
- Delaware Division of Corporations
- Florida Division of Corporations
- Georgia Secretary of State
- Hawaii Department of Commerce
- Idaho Secretary of State
- Illinois Secretary of State
- Indiana Secretary of State
- Iowa Secretary of State
- Kansas Secretary of State
- Kentucky Secretary of State
- Louisiana Secretary of State
- Maine Secretary of State
- Maryland Department of Assessments and Taxation
- Massachusetts Secretary of the Commonwealth
- Michigan Department of Licensing and Regulatory Affairs
- Minnesota Secretary of State
- Mississippi Secretary of State
- Missouri Secretary of State
- Montana Secretary of State
- Nebraska Secretary of State
- Nevada Secretary of State
- New Hampshire Secretary of State
- New Jersey Division of Revenue
- New Mexico Secretary of State
- New York Department of State
- North Carolina Secretary of State
- North Dakota Secretary of State
- Ohio Secretary of State
- Oklahoma Secretary of State
- Oregon Secretary of State
- Pennsylvania Department of State
- Rhode Island Secretary of State
- South Carolina Secretary of State
- South Dakota Secretary of State
- Tennessee Secretary of State
- Texas Secretary of State
- Utah Division of Corporations
- Vermont Secretary of State
- Virginia State Corporation Commission
- Washington Secretary of State
- West Virginia Secretary of State
- Wisconsin Department of Financial Institutions
- Wyoming Secretary of State

**Plus DC and Territories:**
- District of Columbia - Department of Consumer and Regulatory Affairs
- Puerto Rico - Department of State
- Guam - Department of Revenue and Taxation
- American Samoa - Treasurer's Office
- U.S. Virgin Islands - Office of the Lieutenant Governor
- Northern Mariana Islands - Registrar of Corporations

---

## Technical Details

### Database Migration
Insert 56 records into the `issuing_authorities` table with:
- `name`: Official name of the issuing office
- `country`: "United States"
- `province_state`: Corresponding state/territory name (matching `src/lib/states.ts`)
- `description`: Brief description noting "Issues Certificates of Incorporation and business filings"

### Example Records
```sql
INSERT INTO issuing_authorities (name, country, province_state, description) VALUES
('Delaware Division of Corporations', 'United States', 'Delaware', 'Issues Certificates of Incorporation, LLCs, and business filings'),
('California Secretary of State', 'United States', 'California', 'Issues Certificates of Incorporation and business filings'),
...
```

### UI Behavior
After the migration, the "Issuing Authority" dropdown in the document form will display these authorities grouped under "United States" with each state's office available for selection.

---

## Files to Modify
1. **Database Migration** - SQL insert statements for all 56 authorities

No frontend code changes are required since the form already fetches and groups issuing authorities by country from the database.

