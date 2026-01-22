

# Fix AI Assistant Close Button Visibility

## Problem
The close button (X) in the top-right corner of the AI Assistant panel is invisible because:
1. Using `variant="ghost"` which has very low contrast on dark backgrounds
2. The icon may blend into the dark header background

## Solution
Improve the close button visibility by:
1. Adding explicit text color to ensure the X icon is visible
2. Adding a hover background for better UX
3. Potentially increasing the icon size slightly

## Technical Changes

### File: `src/components/ai/AIChatAssistant.tsx`

**Update the close button styling (around line 141-143):**

Current code:
```tsx
<Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
  <X className="h-4 w-4" />
</Button>
```

Updated code:
```tsx
<Button 
  variant="ghost" 
  size="icon" 
  onClick={() => setIsOpen(false)}
  className="text-foreground hover:bg-muted/50"
>
  <X className="h-5 w-5" />
</Button>
```

Changes:
- Add `text-foreground` class to ensure the icon is always visible against the background
- Add `hover:bg-muted/50` for a subtle hover effect
- Increase icon size from `h-4 w-4` to `h-5 w-5` for better visibility

**Also update the Clear button for consistency (around line 137):**
```tsx
<Button variant="ghost" size="sm" onClick={clearChat} className="text-xs text-muted-foreground hover:text-foreground">
  Clear
</Button>
```

This ensures both header buttons are clearly visible and consistent with the application's design system.

