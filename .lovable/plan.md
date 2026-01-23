

# Plan: Add All Quick Actions to Dashboard

## Overview
Expand the Quick Actions section in the dashboard to include buttons for all major data sections in the application, making it easy for users to quickly navigate to add new items.

## Current State
The dashboard currently has 4 quick actions:
- Add Bank Account
- New Contract  
- Add Filing
- Add Address

## Proposed Quick Actions (14 total)
Based on the sidebar navigation structure, I'll add quick actions for all manageable sections:

**Corporate**
- Add Entity (Building2 icon)
- Add Director/UBO (Users icon)
- Add Cap Table Entry (PieChart icon)
- Add Service Provider (Briefcase icon)
- Add Filing (Calendar icon) - already exists

**Financial**
- Add Bank Account (Wallet icon) - already exists
- Add Credit Card (CreditCard icon)
- Add Tax ID (Receipt icon)

**Contact**
- Add Phone Number (Phone icon)
- Add Email (Mail icon)
- Add Social Media (Share2 icon)
- Add Address (MapPin icon) - already exists

**Legal & Docs**
- Add Document (FileText icon)
- New Contract (FileText icon) - already exists

## Technical Implementation

### File Changes

**`src/components/dashboard/DashboardSection.tsx`**

1. **Update imports** - Add missing icons:
   - `Users`, `PieChart`, `Briefcase`, `Phone`, `Mail`, `Receipt`

2. **Expand quick actions array** - Replace the current 4 items with all 14 quick actions, organized by category

3. **Update grid layout** - Change from `grid-cols-2` to a responsive layout that accommodates more items (e.g., `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`)

4. **Update button styling** - Ensure consistent styling across all quick action buttons

### Visual Layout
The Quick Actions section will display in a responsive grid:
- Mobile: 2 columns
- Tablet: 3 columns  
- Desktop: 4 columns

This allows all 14 quick actions to be visible without excessive scrolling while maintaining a clean, organized appearance.

