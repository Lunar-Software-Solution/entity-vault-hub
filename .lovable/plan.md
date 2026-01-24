

## Plan: Auto-Reset Recurring Filings After Due Date

### Overview
For recurring filings (non "one-time"), the system will automatically reset the filing status from "filed" back to "pending" once the current due date has passed. This creates a proper recurring workflow where each period's task completion marks the filing as "filed" for that cycle, then resets for the next cycle.

### Implementation Approach

There are two approaches to implement this:

**Option A: Database Trigger (Recommended)**
Create a PostgreSQL trigger that automatically updates the filing status and advances the due_date when the current due date passes. This runs server-side and keeps the filing perpetually cycling.

**Option B: Display-Based Logic**
Modify the `getFilingDisplayStatus` function to dynamically show "pending" for recurring filings where the due date has passed, even if the stored status is "filed".

I recommend **Option A** as it properly updates the data model and ensures consistency.

---

### Changes Required

#### 1. Database: Create a Scheduled Function to Reset Filings
Create a PostgreSQL function that runs periodically (e.g., daily via cron) to:
- Find all recurring filings where `status = 'filed'` and `due_date < today`
- Reset their `status` to `'pending'`
- Advance their `due_date` to the next period based on frequency
- Clear the `filing_date` and `confirmation_number` for the new period

#### 2. Alternative: Immediate Client-Side Solution
Modify the display logic to treat filed recurring filings as "pending" when their due date has passed:
- Update `getFilingDisplayStatus` in `src/lib/filingUtils.ts`
- Also update the `useCompleteTask` hook to properly advance the due_date when completing a task for a recurring filing

---

### Technical Details

```text
Recurring Filing Lifecycle:
                                       
  ┌──────────────────────────────────────────────────────────────────┐
  │                                                                  │
  │   ┌─────────┐      Task        ┌────────┐     Due Date    ┌─────────┐
  │   │ PENDING │  ───────────►    │ FILED  │  ───────────►   │ PENDING │
  │   │         │    Completed     │        │     Passes      │ (next   │
  │   │         │                  │        │    + advance    │  cycle) │
  │   └─────────┘                  └────────┘    due_date     └─────────┘
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘
```

#### Database Function (Option A)

```sql
CREATE OR REPLACE FUNCTION reset_recurring_filings()
RETURNS void AS $$
BEGIN
  UPDATE entity_filings
  SET 
    status = 'pending',
    filing_date = NULL,
    confirmation_number = NULL,
    due_date = CASE frequency
      WHEN 'monthly' THEN due_date + INTERVAL '1 month'
      WHEN 'quarterly' THEN due_date + INTERVAL '3 months'
      WHEN 'semi-annual' THEN due_date + INTERVAL '6 months'
      WHEN 'annual' THEN due_date + INTERVAL '1 year'
      ELSE due_date
    END
  WHERE 
    status = 'filed' 
    AND frequency != 'one-time'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Schedule via pg_cron to run daily at midnight
SELECT cron.schedule(
  'reset-recurring-filings',
  '0 0 * * *',
  $$SELECT reset_recurring_filings()$$
);
```

#### Client-Side Enhancement (Option B)

Modify `src/lib/filingUtils.ts`:

```typescript
export function getFilingDisplayStatus(
  dueDate: string, 
  currentStatus: string, 
  frequency?: string
): string {
  // For filed recurring filings where due date passed, show as pending (awaiting next cycle)
  if (currentStatus === "filed" && frequency && frequency !== "one-time") {
    const today = startOfDay(new Date());
    const due = startOfDay(new Date(dueDate));
    if (isBefore(due, today)) {
      return "pending"; // Next cycle is pending
    }
  }
  
  if (currentStatus === "filed") return "filed";
  
  const today = startOfDay(new Date());
  const due = startOfDay(new Date(dueDate));
  
  if (isBefore(due, today)) {
    return "overdue";
  }
  
  return currentStatus;
}
```

---

### Recommended Implementation

I recommend implementing **both approaches together**:

1. **Immediate fix**: Update the display logic to show the correct status visually
2. **Background job**: Create a daily cron job to actually reset the filing data and advance due dates

This ensures:
- Users immediately see the correct status
- The database stays clean and properly reflects the current filing period
- Due dates automatically advance to the next period

---

### Summary of Changes

| Component | Change |
|-----------|--------|
| `src/lib/filingUtils.ts` | Update `getFilingDisplayStatus` to handle recurring filings past due date |
| Database Migration | Create `reset_recurring_filings()` function |
| Database (pg_cron) | Schedule daily job to reset recurring filings and advance due dates |
| `src/hooks/usePortalMutations.ts` | Update `useCompleteTask` to set filing status to "filed" when task is completed |

