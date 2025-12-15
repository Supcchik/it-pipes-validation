# Three-Level Filter System - Progressive Disclosure
## Cursor Implementation Prompt

---

## 🎯 Overview & Philosophy

### The Problem We're Solving

Current filter systems fail because they either:
1. **Too simple** - Can't handle complex logic (only AND)
2. **Too complex** - Scare non-technical users with AND/OR terminology
3. **All-or-nothing** - Force users to choose between basic or advanced

### Our Solution: Progressive Disclosure

Three levels that reveal complexity only when needed:
- **Level 1 (90% users):** Simple filters, all AND
- **Level 2 (8% users):** Filter groups with OR between groups
- **Level 3 (2% users):** Full flexibility, OR within groups

**Core Principle:** "Can my dad use it?" - Start simple, grow complex only when necessary.

---

## 📊 User Research Context

From client meeting (Dec 3, 2025):

> "We do have and or statements, but we can't group and or statements. So you know how in math, there's order of operations, you have to do what's in the parentheses first, and then you can go outward. We need a way to get an order of operations for the filtering."

**What this means:**
- Users need grouping: (A AND B) OR (C AND D)
- Users need order of operations: mathematical precedence
- Users need visual clarity: "visually easy to understand"
- BUT: Users are non-technical (municipal operators, field workers)

**Key Insight:**
The system must support complex logic WITHOUT requiring users to understand boolean algebra.

---

## 🎨 Level 1: Simple Filters (Default)

### Purpose

Handle 90% of filtering use cases where users want:
- "Show me PVC pipes"
- "Show me pending inspections"
- "Show me grade 3 or higher"

All conditions work together (AND logic) - the most common scenario.

### User Mental Model

"I'm narrowing down the list by adding filters."

NOT: "I'm creating boolean expressions with AND operators."

### UI Layout

```
┌─────────────────────────────────────────────┐
│ Filters                                [×]  │
├─────────────────────────────────────────────┤
│                                             │
│ Material       [is ▼]     [PVC ▼       ]   │
│ Status         [is ▼]     [Pending ▼   ]   │
│ Grade          [≥ ▼]      [3___________]   │
│                                             │
│ + Add another filter                        │
│                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ℹ️ All filters work together                │
│                                             │
│ Need to show different types of assets?     │
│ [Switch to Filter Groups →]                 │
│                                             │
│                    [Clear] [Apply]          │
└─────────────────────────────────────────────┘
```

### Design Specifications

**Layout:**
- Clean, simple list
- No boxes, no borders around individual filters
- Generous spacing (12px between filters)
- White background
- Maximum width: 500px

**Filter Row Structure:**
- Three components: Field selector + Operator + Value input
- Aligned horizontally
- Fixed widths: Field (150px), Operator (120px), Value (flexible)
- Remove button (×) appears on hover only

**Typography:**
- Field names: Medium weight, 14px, Gray-900
- Operators: Regular weight, 14px, Gray-700
- Help text: Regular, 13px, Gray-600
- Hint text (bottom): Regular, 13px, Blue-600

**Colors:**
- Background: White (#FFFFFF)
- Text: Gray-900 (#111827)
- Borders: Gray-200 (#E5E7EB)
- Help text: Gray-600 (#4B5563)
- Hint link: Blue-600 (#2563EB)
- Divider: Gray-300 (#D1D5DB)

**Interactions:**
- Hover filter row: Subtle Gray-50 background
- Focus input: Blue-500 ring
- Remove button (×): Only visible on hover
- "+ Add another filter": Blue-600 text, no border

### Field Types & Operators

**Text fields** (Pipe Segment, Material, etc.):
- Operators: "is", "is not", "contains", "starts with", "ends with"
- Input: Text field with typeahead suggestions
- Example: Pipe Segment [contains] [S-104]

**Number fields** (Grade, Width, etc.):
- Operators: "is", "is not", ">", "<", "≥", "≤", "between"
- Input: Number input
- Example: Grade [≥] [3]

**Dropdown fields** (Status, Material, etc.):
- Operators: "is", "is not", "is one of"
- Input: Dropdown with search
- Example: Status [is] [Pending ▼]

**Date fields** (Inspected Date, etc.):
- Operators: "is", "before", "after", "between", "in last X days"
- Input: Date picker
- Example: Inspected Date [in last X days] [30]

### Operator Display Names

Use plain English, not symbols:
- "=" → "is"
- "!=" → "is not"
- ">" → "greater than"
- "<" → "less than"
- "≥" → "≥" (keep symbol, but show tooltip "greater than or equal to")
- "contains" → "contains"

### Help Text & Messaging

**Info message (always visible):**
"ℹ️ All filters work together"

**Tooltip on info icon:**
"Assets must match ALL filters you add here. This uses AND logic."

**When no filters:**
"Add filters to narrow down the list"

**Hint to Level 2 (appears after 2+ filters added):**
"Need to show different types of assets?"
[Switch to Filter Groups →]

### Progressive Hint System

**After 1 filter:** No hint (most users stop here)

**After 2 filters:** Show subtle hint about groups
- Appearance: Fade in animation
- Dismissible: User can close with ×
- Remember dismissal per session

**After 3+ filters:** Hint becomes more prominent
- Blue background
- Larger text
- Suggests: "It looks like you might need OR logic"

### User Flow Example

```
1. User opens Filters modal
   → Sees empty Level 1

2. Clicks "+ Add another filter"
   → New filter row appears

3. Selects: Material [is] [PVC]
   → Filter added

4. Clicks "+ Add another filter"
   → Adds: Status [is] [Pending]

5. Sees message: "All filters work together"
   → Understands: Assets need BOTH PVC AND Pending

6. Clicks Apply
   → Filters applied to table
   → Modal closes

7. Chips show: [Material: PVC ×] [Status: Pending ×]
```

---

## 🔷 Level 2: Filter Groups

### Purpose

Handle cases where users need OR logic between different criteria:
- "Show me PVC pipes in pending status OR anything grade 4+"
- "Show me recent inspections OR critical issues"

Groups represent different "types" of assets user wants to see.

### User Mental Model

"I want to see assets that match THIS or THAT"

NOT: "I'm creating OR operators between groups."

**Key insight:** Each group is a "type" of asset. The OR is implicit - "show me Type A or Type B"

### UI Layout

```
┌──────────────────────────────────────────────┐
│ Filter Groups                           [×]  │
├──────────────────────────────────────────────┤
│                                              │
│ Show assets that match:                      │
│                                              │
│ ┌─ Group A ─────────────────────────── ×──┐ │
│ │                                          │ │
│ │ Material    [is]    [PVC         ]  [×] │ │
│ │         and                              │ │
│ │ Status      [is]    [Pending     ]  [×] │ │
│ │         and                              │ │
│ │ Grade       [≥]     [2___________]  [×] │ │
│ │                                          │ │
│ │ + Add to this group                      │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│              ──── OR ────                    │
│                                              │
│ ┌─ Group B ─────────────────────────── ×──┐ │
│ │                                          │ │
│ │ Grade    [≥]    [4]                 [×] │ │
│ │                                          │ │
│ │ + Add to this group                      │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ [+ Add another group]                        │
│                                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ This will show assets matching Group A OR   │
│ Group B (total from both groups)            │
│                                              │
│ Need complex logic in groups?               │
│ [Switch to Advanced Builder →]              │
│                                              │
│ [← Back to Simple]      [Clear] [Apply]     │
└──────────────────────────────────────────────┘
```

### Design Specifications

**Group Container:**
- Border: 1px solid Gray-300 (#D1D5DB)
- Border-radius: 8px
- Background: Gray-50 (#F9FAFB)
- Padding: 16px
- Margin between groups: 24px

**Group Header:**
- Label: "Group A", "Group B" (auto-generated)
- Font: Medium weight, 14px, Gray-700
- Delete button (×): Right-aligned, visible always
- Hover on header: Subtle highlight
- Optional: Allow rename by clicking label

**Conditions Within Group:**
- Same styling as Level 1 filters
- "and" connector between conditions
- "and" text: lowercase, Gray-500, 12px, centered
- Subtle visual connection (optional: thin vertical line)

**OR Divider:**
- Width: Full width of modal
- Text: "OR" centered
- Style: Gray-600, 14px, medium weight
- Lines: 1px solid Gray-300 on both sides
- Spacing: 20px above/below

**Add Buttons:**
- "+ Add to this group": Inside group, Gray-600
- "+ Add another group": Outside, below all groups, Blue-600

### Visual Hierarchy

**Goal:** Make clear which conditions are grouped together

**Techniques:**
1. **Background color** - Groups have distinct background
2. **Borders** - Clear group boundaries
3. **Spacing** - More space between groups than within
4. **"and" connectors** - Show conditions in same group work together
5. **"OR" divider** - Prominent separator between groups

**Color coding (optional enhancement):**
- Group A: Blue-50 background
- Group B: Green-50 background
- Group C: Yellow-50 background
- Keeps cycling through colors

### Group Naming

**Auto-naming:**
- First group: "Group A"
- Second group: "Group B"
- Continue alphabet

**Smart naming (optional):**
- Analyze first condition
- If Material = PVC: "PVC Pipes"
- If Grade ≥ 4: "High Grade Issues"
- User can override

**Editing names:**
- Click on group label
- Inline edit field appears
- Save on Enter or blur
- Limit: 30 characters

### Explanation Text

**Always show at bottom:**
"This will show assets matching Group A OR Group B"

**Dynamic updates:**
- 1 group: "...matching Group A"
- 2 groups: "...matching Group A OR Group B"
- 3 groups: "...matching Group A OR Group B OR Group C"

**Detailed explanation (tooltip or expandable):**
"Assets that match ALL conditions in Group A will be shown, along with assets that match ALL conditions in Group B. An asset only needs to match one of the groups to appear."

### User Flow Example

```
1. User in Level 1 with filters:
   - Material = PVC
   - Status = Pending

2. Clicks "Switch to Filter Groups"
   → Transitions to Level 2
   → Auto-creates Group A with existing filters

3. Sees: Group A with PVC + Pending

4. Thinks: "I also want to see grade 4+ issues"

5. Clicks "+ Add another group"
   → Group B appears (empty)

6. In Group B, adds: Grade ≥ 4

7. Sees explanation:
   "This will show assets matching Group A OR Group B"

8. Understands:
   "PVC + Pending" OR "Grade 4+" - two different types

9. Clicks Apply
   → Filters applied
   → Modal closes

10. Chips show:
    [Group A: 2 filters ⌄] OR [Group B: 1 filter ⌄]
```

### Transitioning from Level 1

**When user clicks "Switch to Filter Groups":**

1. **Auto-convert existing filters:**
   - Take all Level 1 filters
   - Put them in Group A
   - User sees familiar filters in new context

2. **Show brief explanation:**
   - Tooltip or small banner
   - "Your filters are now in Group A"
   - "Add more groups to show different types of assets"
   - Dismissible after first time

3. **Smooth animation:**
   - Fade out Level 1 layout
   - Grow border around filters (forming Group A)
   - Fade in Group label and OR section
   - Duration: 300ms

### Back to Simple Flow

**When user clicks "Back to Simple":**

**If only 1 group exists:**
- Convert group conditions back to simple list
- Smooth transition
- No data loss

**If 2+ groups exist:**
- Show warning:
  "You have multiple groups. Going back to Simple will keep only the first group. Continue?"
- Options: [Keep Groups] [Yes, Simplify]
- If Yes: Keep only Group A conditions

---

## 🔬 Level 3: Advanced Builder

### Purpose

Handle power users (2%) who need:
- OR within a single group: (Material = PVC OR Material = Clay) AND Grade ≥ 3
- Complex nested logic
- Maximum flexibility

This is the "no training wheels" mode.

### User Mental Model

"I'm creating complex boolean logic with full control"

This level assumes user understands AND/OR operators.

### UI Layout

```
┌──────────────────────────────────────────────┐
│ Advanced Filter Builder    [← Back]     [×] │
├──────────────────────────────────────────────┤
│                                              │
│ ┏━ Group 1 ───────────────────────── ×━━━┓ │
│ ┃                                          ┃ │
│ ┃ Material  [is]  [PVC]              [×]  ┃ │
│ ┃                                          ┃ │
│ ┃   ○ and   ● or                           ┃ │
│ ┃                                          ┃ │
│ ┃ Material  [is]  [Clay]             [×]  ┃ │
│ ┃                                          ┃ │
│ ┃   ● and   ○ or                           ┃ │
│ ┃                                          ┃ │
│ ┃ Grade  [≥]  [3]                     [×]  ┃ │
│ ┃                                          ┃ │
│ ┃ + Add condition                          ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                              │
│              ═══ OR ═══                      │
│                                              │
│ ┏━ Group 2 ───────────────────────── ×━━━┓ │
│ ┃                                          ┃ │
│ ┃ Status  [is]  [Critical]           [×]  ┃ │
│ ┃                                          ┃ │
│ ┃ + Add condition                          ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                              │
│ + Add group                                  │
│                                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                              │
│ 📋 Preview:                                  │
│ ┌────────────────────────────────────────┐  │
│ │ (Material is PVC OR Material is Clay)  │  │
│ │ AND Grade ≥ 3                          │  │
│ │         OR                             │  │
│ │ Status is Critical                     │  │
│ └────────────────────────────────────────┘  │
│                                              │
│              [Clear] [Apply]                 │
└──────────────────────────────────────────────┘
```

### Design Specifications

**Group Styling:**
- Border: 2px solid Blue-400 (thicker than Level 2)
- Border-radius: 8px
- Background: Blue-50 (#EFF6FF)
- Padding: 20px
- Visual distinction from Level 2

**Radio Buttons for AND/OR:**
- Position: Between each pair of conditions
- Alignment: Slightly indented (16px from left)
- Size: 20px
- Selected color: Blue-600
- Label spacing: 8px between radio and text
- Labels: "and", "or" (lowercase)

**Condition Rows:**
- Same as other levels
- But with radio button operators between them
- Vertical spacing: 12px between condition and radio buttons

**Preview Box:**
- Background: Yellow-50 (#FFFBEB)
- Border: 1px solid Yellow-200
- Padding: 12px
- Font: Monospace, 13px
- Text: Gray-800
- Icon: 📋 clipboard
- Title: "Preview" (Gray-600, 12px, uppercase)

### Radio Button Behavior

**Between each pair of conditions:**
- After Condition 1: ○ and  ● or
- After Condition 2: ● and  ○ or
- After Condition 3: (none, if last)

**Default selection:**
- First operator: AND (selected)
- User can change to OR

**Visual feedback:**
- Selected: Filled circle (●), bold text
- Unselected: Empty circle (○), normal text
- Hover: Subtle background highlight

**Logic:**
```
If 3 conditions with operators:
  Condition 1
    AND (selected)
  Condition 2
    OR (selected)
  Condition 3

Result: (Condition1 AND Condition2) OR Condition3
```

### Preview Generation

**Purpose:**
Help users understand the logic they've created.

**Format:**
- Use parentheses for grouping
- Show operators in plain English
- One line per group (within a group)
- Groups separated visually

**Example:**
```
User creates:
  Group 1:
    - Material = PVC
    - (OR)
    - Material = Clay
    - (AND)
    - Grade ≥ 3
  Group 2:
    - Status = Critical

Preview shows:
  (Material is PVC OR Material is Clay)
  AND Grade ≥ 3
        OR
  Status is Critical
```

**Formatting rules:**
- Conditions in same group on separate lines
- Indent nested operations
- Bold the operators (AND, OR)
- Use plain English for conditions

### Validation & Warnings

**Empty groups:**
- Show warning: "Group has no conditions"
- Disable Apply until fixed
- Highlight group in red

**Single condition with OR:**
- Show info: "OR needs at least 2 conditions"
- Auto-switch to AND (or disable OR radio)

**Overly complex filters:**
- If 5+ groups or 10+ total conditions
- Show warning: "This is very complex. Consider simplifying."
- Don't block, just warn

### User Flow Example

```
1. User in Level 2 with:
   Group A: Material = PVC
   Group B: Grade ≥ 4

2. Thinks: "I need (PVC OR Clay) AND Grade ≥ 3"
   → Can't do this in Level 2

3. Clicks "Switch to Advanced Builder"
   → Goes to Level 3

4. In Group 1:
   - Material = PVC exists
   - Clicks "+ Add condition"
   - Adds: Material = Clay
   - Selects OR radio between them

5. Clicks "+ Add condition"
   - Adds: Grade ≥ 3
   - Selects AND radio (connects to previous OR pair)

6. Sees Preview:
   "(Material is PVC OR Material is Clay)
    AND Grade ≥ 3"

7. Thinks: "Perfect! That's what I want"

8. Clicks Apply
   → Complex filter applied
   → Modal closes

9. Chips show:
   [Complex filter: 3 conditions ⌄] [Edit →]
```

### Transitioning from Level 2

**When user clicks "Switch to Advanced Builder":**

1. **Preserve all groups and conditions**
   - Groups stay as they are
   - Conditions stay in same groups
   - OR between groups stays

2. **Add radio buttons**
   - Default all to AND within groups
   - User can now change to OR

3. **Add preview**
   - Show current logic
   - Updates live as user edits

4. **Show brief tip:**
   - "You can now use OR within groups"
   - "Use radio buttons between conditions"
   - Dismissible

### Back Button Behavior

**When user clicks "← Back":**

**If no OR within groups:**
- Simply go back to Level 2
- All groups preserved
- Smooth transition

**If OR exists within groups:**
- Show warning:
  "You have OR logic within groups. Going back will reset to AND. Continue?"
- Options: [Stay in Advanced] [Yes, Go Back]
- If Yes: Convert all within-group operators to AND

---

## 🏷️ Active Filters Display (Chips)

### Purpose

Show users what filters are currently active without needing to open the modal.

### Location

Below the toolbar, above the table:
```
┌────────────────────────────────────────────┐
│ 🔍 Search  🎚️ Filter (3)  📋 Columns  ... │
├────────────────────────────────────────────┤
│ Active: [Material: PVC ×] [Grade ≥ 3 ×]   │
│         [View all filters →]                │
└────────────────────────────────────────────┘
```

### Display Strategies by Level

**Level 1 (Simple Filters):**
```
Active: [Material: PVC ×] [Status: Pending ×] [Grade ≥ 3 ×]
```
- Show all chips inline
- Each chip = one filter
- Remove with ×
- Max 3 visible, then "+X more"

**Level 2 (Filter Groups):**
```
Active: [Group A: 2 filters ⌄] OR [Group B: 1 filter ⌄]
```
- Each chip = one group
- Shows count of filters in group
- Dropdown arrow (⌄) indicates expandable
- OR text between groups

**Alternative (collapsed):**
```
Active: [2 groups: 5 filters total ⌄]  [Edit filters]
```
- Single chip summarizing all
- Click to expand details
- "Edit filters" opens modal

**Level 3 (Advanced):**
```
Active: [Complex filter: 5 conditions ⌄]  [Edit →]
```
- Single chip (too complex to display inline)
- Dropdown shows preview
- "Edit →" opens Level 3 modal

### Chip Interactions

**Hover:**
- Slightly darker background
- Cursor: pointer
- Show full value if truncated

**Click chip (not ×):**
- Level 1: Opens filter modal, focuses that filter
- Level 2: Expands group inline OR opens modal
- Level 3: Opens modal to Advanced view

**Click × on chip:**
- Level 1: Removes that filter
- Level 2: Removes entire group (confirm first)
- Level 3: Opens modal (too complex to remove blind)

**Expandable chips (⌄):**
```
Before: [Group A: 2 filters ⌄]

After click:
[Material: PVC ×] [Status: Pending ×] [Collapse ︿]
```

### Chip Styling

**Basic chip:**
- Background: Blue-100 (#DBEAFE)
- Border: 1px solid Blue-200
- Text: Blue-800
- Padding: 4px 8px
- Border-radius: 6px
- Gap between chips: 8px

**Group chip:**
- Background: Blue-200 (slightly darker)
- Border: 1px solid Blue-300
- Font-weight: Medium
- Icon: Folder or group icon

**OR indicator:**
- Display: Small badge
- Background: Gray-200
- Text: "OR" uppercase
- Font-size: 11px
- Padding: 2px 6px
- Border-radius: 4px

**Remove button (×):**
- Size: 16px × 16px
- Color: Blue-600
- Hover: Blue-800
- Position: Right side of chip
- Padding: 2px

### Truncation Strategy

**If many filters:**
- Show first 3 chips
- Add "+X more" chip
- Click "+X more" expands all

```
Before: [Filter1 ×] [Filter2 ×] [+3 more]

After click "+3 more":
[Filter1 ×] [Filter2 ×] [Filter3 ×] 
[Filter4 ×] [Filter5 ×] [Collapse ︿]
```

**If chip text too long:**
- Truncate with ellipsis
- Max width: 200px
- Show full text on hover tooltip

```
Display: [Pipe Segment: S-104-ABC-... ×]
Tooltip: "Pipe Segment contains S-104-ABC-DEF-GHI"
```

### Badge on Filter Button

**Show count:**
```
🎚️ Filter (3)
```
- Number = total active filters (all levels)
- Updates when filters change
- Badge: Blue-600, white text

**States:**
- No filters: "Filter" (no badge)
- 1-9 filters: "Filter (N)"
- 10+ filters: "Filter (10+)"

---

## 🔄 Transitions & Animations

### Modal Opening

**Animation:**
- Fade in background overlay (300ms)
- Scale up modal from 0.95 to 1.0 (250ms)
- Ease-out timing function

**Initial state:**
- If no filters: Open to Level 1 (empty)
- If simple filters: Open to Level 1 (populated)
- If groups: Open to Level 2
- If advanced: Open to Level 3

**Remember last level:**
- Store user's last used level in localStorage
- Open to that level next time (with their filters)

### Level Switching

**Level 1 → Level 2:**
```
1. Fade out "+ Add another filter" button
2. Grow border around existing filters (forming Group A)
3. Fade in Group label and OR section
4. Fade in "+ Add another group" button
Duration: 400ms total
```

**Level 2 → Level 3:**
```
1. Thicken group borders (1px → 2px)
2. Change background color (Gray-50 → Blue-50)
3. Fade in radio buttons between conditions
4. Slide in Preview section from bottom
Duration: 350ms total
```

**Going back:**
- Reverse animation
- Slightly faster (300ms)

### Adding/Removing Items

**Add condition:**
- Slide down from 0 height
- Fade in opacity
- Duration: 200ms

**Remove condition:**
- Fade out opacity
- Slide up to 0 height
- Duration: 150ms

**Add group:**
- Appear below existing groups
- Slight bounce effect
- Duration: 300ms

**Remove group:**
- Fade out
- Adjacent groups slide up to fill space
- Duration: 250ms

### Apply/Close Actions

**On Apply:**
- Modal: Scale down and fade out (200ms)
- Chips: Fade in new chips (300ms, staggered by 50ms each)
- Table: Brief loading indicator → update results

**On Cancel/Close:**
- Modal: Fade out (150ms)
- No chip changes
- No table update

---

## 💾 State Management

### What to Save

**Per user (localStorage or backend):**
- Last used level
- Recent filters (for suggestions)
- Dismissed hints/tips
- Preferred operators per field type

**Per session:**
- Current filters in modal
- Unsaved changes
- Expanded/collapsed groups in chips

**Per project/view:**
- Saved filter configurations
- Shared filter templates

### Unsaved Changes Warning

**When user has unsaved changes:**
- If clicks Cancel: No warning (expected)
- If clicks outside modal: Show warning
- If tries to switch views: Show warning

**Warning message:**
"You have unsaved filter changes. Apply them before leaving?"
- [Discard] [Apply & Continue]

### Draft System

**Auto-save drafts:**
- Save to localStorage every 2 seconds
- Key: `filter_draft_${projectId}`
- Restore on re-open

**Clear draft:**
- On Apply: Delete draft
- On explicit Cancel: Keep draft
- On discard warning: Delete draft

---

## 🧪 Testing Scenarios

### Level 1 Tests

**Basic functionality:**
- [ ] Add filter with all field types
- [ ] Remove filter
- [ ] Change operator
- [ ] Change value
- [ ] Multiple filters all work together (AND)

**Edge cases:**
- [ ] Empty modal (no filters)
- [ ] Single filter
- [ ] 10+ filters (performance)
- [ ] Very long field values (truncation)
- [ ] Special characters in values

**Interactions:**
- [ ] Hint appears after 2 filters
- [ ] Hint dismissible
- [ ] Switch to Level 2 button works
- [ ] Apply button applies filters
- [ ] Cancel discards changes
- [ ] Close (×) acts like Cancel

### Level 2 Tests

**Basic functionality:**
- [ ] Create second group
- [ ] Add conditions to groups
- [ ] Remove condition from group
- [ ] Remove entire group
- [ ] OR between groups works

**Edge cases:**
- [ ] Single group (equivalent to Level 1)
- [ ] Empty group (validation)
- [ ] 5+ groups (UI doesn't break)
- [ ] Group with 10+ conditions

**Transitions:**
- [ ] Level 1 → Level 2 preserves filters
- [ ] Level 2 → Level 1 handles multiple groups
- [ ] Back button works correctly

### Level 3 Tests

**Basic functionality:**
- [ ] Radio buttons work
- [ ] OR within group works
- [ ] Preview updates correctly
- [ ] Complex logic applies correctly

**Edge cases:**
- [ ] Single condition (OR disabled)
- [ ] Very complex filter (5 groups, 20 conditions)
- [ ] Preview with long field names
- [ ] All OR operators
- [ ] All AND operators

**Transitions:**
- [ ] Level 2 → Level 3 preserves structure
- [ ] Level 3 → Level 2 handles OR within groups
- [ ] Back button warning appears

### Chips Display Tests

**Visual:**
- [ ] Chips appear after applying
- [ ] Chips update on filter change
- [ ] Remove via × works
- [ ] Expandable chips work
- [ ] "+X more" works
- [ ] OR indicators show correctly

**States:**
- [ ] No filters (no chips)
- [ ] Simple filters (show all)
- [ ] Groups (collapsed view)
- [ ] Advanced (complex summary)

**Interactions:**
- [ ] Click chip opens modal
- [ ] Click × removes filter
- [ ] Hover shows full value
- [ ] Badge count is accurate

### Cross-Level Tests

**Consistency:**
- [ ] Same filters in Level 1 and Level 2 (single group) produce same results
- [ ] Switching levels doesn't lose data
- [ ] Preview matches actual applied logic

**Performance:**
- [ ] Large datasets (1000+ rows) filter quickly
- [ ] Complex filters don't lag UI
- [ ] Animations smooth on slower devices

---

## 🎯 UX Best Practices

### Do's

**Progressive disclosure:**
✅ Start simple, reveal complexity gradually
✅ Each level can stand alone
✅ User can go back anytime

**Clear communication:**
✅ Explain what each level does
✅ Show live preview of logic
✅ Use plain English, not technical terms

**Visual hierarchy:**
✅ Different levels look different
✅ Groups clearly distinguished
✅ Operators clearly visible

**Helpful hints:**
✅ Suggest next level when appropriate
✅ Explain OR functionality simply
✅ Provide examples

**Smooth transitions:**
✅ Animate between levels
✅ Preserve user's work
✅ No jarring changes

### Don'ts

**Overwhelming users:**
❌ Don't show all levels at once
❌ Don't use technical jargon
❌ Don't hide important actions

**Confusing interactions:**
❌ Don't use drag-and-drop (too complex)
❌ Don't auto-switch levels without user action
❌ Don't lose user's work without warning

**Visual clutter:**
❌ Don't use too many colors
❌ Don't over-animate
❌ Don't show everything at once

**Assuming knowledge:**
❌ Don't assume users know boolean logic
❌ Don't use symbols without labels
❌ Don't skip explanations

---

## 📱 Responsive Considerations

### Desktop (Primary)

- Modal width: 600px
- Modal height: Auto (max 80vh)
- Scrollable content area
- Fixed header and footer

### Tablet (768px - 1024px)

- Modal width: 90vw
- Simplified spacing
- Slightly smaller text
- Touch-friendly buttons (44px min)

### Mobile (<768px)

**Consider simplified version:**
- Full-screen modal
- One filter per screen
- Step-by-step wizard
- Or: Redirect to desktop with message

**If implementing mobile:**
- Stack filter components vertically
- Larger touch targets
- Simplified Level 3 (maybe hide)
- Focus on Level 1 and 2

---

## 🎨 Accessibility

### Keyboard Navigation

**Tab order:**
- Filter button → Modal opens
- Tab through fields in order
- Radio buttons navigable with arrows
- Enter on button = activate
- Escape = close modal

**Shortcuts:**
- Alt+F: Open filters
- Ctrl+Enter: Apply filters
- Escape: Cancel/Close
- Ctrl+Z: Undo last change (within modal)

### Screen Readers

**ARIA labels:**
- Modal: role="dialog" aria-label="Filter settings"
- Groups: role="group" aria-label="Filter Group A"
- Remove buttons: aria-label="Remove filter Material PVC"
- Radio buttons: Properly labeled with context

**Announcements:**
- "Filter added" when adding
- "Filter removed" when removing
- "Switched to Filter Groups" on level change
- "X filters applied" on Apply

### Visual

**Contrast:**
- All text meets WCAG AA (4.5:1)
- Interactive elements clearly visible
- Focus indicators prominent

**Sizes:**
- Text: Minimum 13px
- Touch targets: Minimum 44px
- Buttons: Large enough to click
- Spacing: Generous for clarity

---

## 🔧 Technical Considerations

### Performance

**Optimization strategies:**
- Debounce preview generation (300ms)
- Virtualize filter list if 50+ conditions
- Lazy load operator options
- Cache filter results on backend
- Index database for common filter fields

**Rendering:**
- Use React.memo for filter rows
- Avoid re-rendering entire list
- Optimize animations (use transform/opacity)
- Batch updates when switching levels

### API Design

**Filter object structure:**
```typescript
interface SimpleFilter {
  type: 'simple';
  conditions: Condition[];
}

interface GroupFilter {
  type: 'groups';
  groups: Group[];
}

interface AdvancedFilter {
  type: 'advanced';
  groups: AdvancedGroup[];
}

interface Condition {
  field: string;
  operator: string;
  value: any;
}

interface Group {
  id: string;
  name: string;
  conditions: Condition[];
}

interface AdvancedGroup extends Group {
  conditions: ConditionWithOperator[];
}

interface ConditionWithOperator extends Condition {
  nextOperator?: 'AND' | 'OR'; // Operator to next condition
}
```

**Backend translation:**
- Frontend sends filter object
- Backend converts to SQL WHERE clause
- Backend handles operator precedence
- Backend returns filtered results

### Error Handling

**Validation errors:**
- Empty required fields
- Invalid values (e.g., text in number field)
- Date range errors
- Too many conditions (if limit exists)

**API errors:**
- Network failure
- Timeout
- Invalid filter syntax
- No results found

**User feedback:**
- Inline errors (red text below field)
- Toast notifications for API errors
- Helpful error messages
- Suggest fixes when possible

---

## 💡 Future Enhancements

### Phase 2 (After MVP)

**Smart suggestions:**
- "Users like you often filter by..."
- Auto-complete for values based on data
- Recent filters quick access
- Popular filter templates

**Saved filters:**
- Save common filter combinations
- Name and organize saved filters
- Share filters with team
- Import/export filters

**Advanced features:**
- NOT operator support
- NULL checks (is empty/is not empty)
- IN operator (match any of list)
- Regular expressions for text

### Phase 3 (Advanced)

**AI assistance:**
- Natural language input: "Show me PVC pipes from last month"
- Convert to filters automatically
- Suggest filters based on context

**Visual query builder:**
- Flowchart-style interface
- Drag connections between nodes
- For very complex queries

**Performance insights:**
- Show estimated result count before applying
- Suggest optimizations for slow filters
- Index recommendations

---

## 📚 Summary

This three-level filter system balances:
- **Simplicity** for 90% of users (Level 1)
- **Flexibility** for 8% who need OR (Level 2)
- **Power** for 2% who need complex logic (Level 3)

**Key principles:**
1. Progressive disclosure
2. Plain language
3. Visual clarity
4. Smooth transitions
5. No drag-and-drop complexity

**Success metrics:**
- 90%+ of users never need Level 2
- 98%+ of users never need Level 3
- <10 seconds to apply simple filter
- <30 seconds to create group filter
- Zero "how do I..." support tickets

**Implementation priority:**
1. Level 1 (Simple) - Core functionality
2. Chips display - User feedback
3. Level 2 (Groups) - OR logic
4. Level 3 (Advanced) - Power users
5. Polish - Animations, hints, help

This system transforms complex boolean logic into intuitive, progressive interactions that anyone can master.
