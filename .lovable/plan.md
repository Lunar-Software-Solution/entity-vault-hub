

# Fix File Upload Visibility in Director/UBO Form

## Problem

When uploading a PDF or image in the Director/UBO form, the file doesn't appear in the UI. This is caused by a **stale state bug** in the `MultipleIdDocuments` component.

## Root Cause

The component calls `updateDocument` twice in sequence when a file is uploaded:

```typescript
updateDocument(index, "file_path", filePath);   // Update state with new file_path
updateDocument(index, "file_name", file.name);  // This overwrites file_path with stale value!
```

Because React state updates are asynchronous and the `documents` array is captured at the time of the function call, the second update uses the old state (before `file_path` was set), effectively erasing the `file_path` value.

This is the same bug that was fixed in the `IdDocumentsManager` component for shareholders.

## Solution

Refactor the `updateDocument` function in `MultipleIdDocuments.tsx` to accept a partial object of updates instead of individual key-value pairs. This ensures both `file_path` and `file_name` are updated atomically in a single state change.

## Changes

**File: `src/components/forms/MultipleIdDocuments.tsx`**

1. **Refactor `updateDocument` function** (line 79-83):
   - Change signature from `(index: number, field: keyof IdDocument, value: string)` to `(index: number, updates: Partial<IdDocument>)`
   - Spread all updates at once instead of single field

2. **Update file upload handler** (lines 128-129):
   - Change from two separate calls to one combined call:
   ```typescript
   updateDocument(index, { file_path: filePath, file_name: file.name });
   ```

3. **Update file removal handler** (lines 145-146):
   - Change from two separate calls to one combined call:
   ```typescript
   updateDocument(index, { file_path: "", file_name: "" });
   ```

4. **Update field change handlers** in the JSX (lines 202, 226, 237):
   - Change from `updateDocument(index, "field", value)` to `updateDocument(index, { field: value })`

## Technical Details

The pattern change is straightforward:

**Before (buggy):**
```typescript
const updateDocument = (index: number, field: keyof IdDocument, value: string) => {
  const updated = [...documents];
  updated[index] = { ...updated[index], [field]: value };
  onChange(updated);
};

// Usage - second call overwrites first
updateDocument(index, "file_path", filePath);
updateDocument(index, "file_name", file.name);
```

**After (fixed):**
```typescript
const updateDocument = (index: number, updates: Partial<IdDocument>) => {
  const updated = [...documents];
  updated[index] = { ...updated[index], ...updates };
  onChange(updated);
};

// Usage - single atomic update
updateDocument(index, { file_path: filePath, file_name: file.name });
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/forms/MultipleIdDocuments.tsx` | Refactor updateDocument function and all call sites |

## Testing

After this fix:
1. Open the Director/UBO form
2. Click "Add ID" to add an ID document row
3. Click "Upload scan (PDF or image)"
4. Select a file
5. The uploaded file should now appear immediately with its name and icon

