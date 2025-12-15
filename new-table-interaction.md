# Table Row Interactions & Quick Actions Pattern
## Cursor Implementation Prompt

---

## 🎯 Overview

Implement a comprehensive table interaction system with:
1. **Single-select** → Map navigation + Snapshots panel
2. **Inline field editing** → Click individual fields to edit
3. **Full row editing** → Edit action activates all fields
4. **Quick Actions column** → Fixed column with View + More actions
5. **Auto-save** → Save on Enter or blur

**Key Principle:** Keep interactions simple and predictable for non-tech-savvy users.

---

## 🎨 Quick Actions Column - Fixed Layout

### Visual Structure

```
Table Layout:
┌─────────────────────────────────────────────────────┐
│ [Scrollable Columns Area]      │ [Fixed Column]    │
│ Checkbox | Pipe | Street | ... │ [👁️] [⋮]         │
│ ☐        | S-104| Main St| ... │ [👁️] [⋮]         │
│ ☐        | S-105| Oak Ave| ... │ [👁️] [⋮]         │
└─────────────────────────────────────────────────────┘
                                   ↑
                            Always visible,
                            doesn't scroll
```

### Component Structure

**Quick Actions Column:**
- Width: 80-100px (enough for two icon buttons + spacing)
- Position: `position: sticky; right: 0;`
- Background: White with subtle left border
- Z-index: Above scrollable content
- Shadow: Subtle left shadow when content scrolls

**Two Icon Buttons:**

1. **View Details (Eye Icon 👁️)**
   - Icon: Eye or similar "view" icon
   - Size: 32-36px clickable area
   - Tooltip: "View Details"
   - Action: Opens Inspection Viewer
   - Primary action (most frequently used)

2. **More Actions (Kebab ⋮)**
   - Icon: Three vertical dots
   - Size: 32-36px clickable area
   - Action: Opens dropdown menu
   - Menu items:
     - Edit (with edit icon)
     - Duplicate (with duplicate icon)
     - Delete (with delete icon, red text)

### Interaction States

**Default state:**
- Both icons visible at normal opacity
- Subtle gray color (#6B7280)

**Hover state:**
- Icon darkens slightly (#374151)
- Subtle background circle appears
- Cursor: pointer

**Active/pressed state:**
- Slight scale down (0.95)
- Background becomes more visible

**Row selected state:**
- Icons remain at same position
- Don't change appearance based on row selection
- Both actions always available

---

## 🖱️ Row Interaction Patterns

### Pattern 1: Single-Click on Row

**Trigger:**
User clicks anywhere on the row (except on buttons, links, or input fields)

**Behavior:**
1. Row becomes visually selected (background highlight)
2. Map navigates to asset location
3. Snapshots panel appears above map
4. Plot defect points appear on map
5. Row stays selected until:
   - User clicks different row
   - User clicks elsewhere (deselect)
   - User closes snapshots panel

**Visual Feedback:**
- Selected row: Light blue/gray background (#F3F4F6)
- Slight border or left accent bar (optional)
- Maintain readability of text

**Implementation Notes:**
- Don't trigger selection when clicking:
  - Action buttons (View, More)
  - Input fields (when in edit mode)
  - Checkboxes (for multi-select)
  - Links (like Pipe Segment if made clickable)
- Use event delegation or stopPropagation appropriately
- Clear previous selection before setting new one

---

### Pattern 2: Click on Editable Field

**Trigger:**
User clicks directly on an editable field (Pipe Segment, Material, Width, etc.)

**Behavior:**
1. That specific field enters edit mode
2. Input field appears in place of text
3. Text is pre-filled with current value
4. Text is auto-selected (ready to type)
5. Field stays in edit mode until:
   - User presses Enter (saves)
   - User clicks outside field (saves)
   - User presses Escape (cancels)

**Visual Feedback:**
- Field transforms to input with border
- Blue focus ring around input
- Rest of row remains non-editable
- Other rows remain normal

**Auto-save Behavior:**
- **Enter key:** Validate → Save → Exit edit mode → Move focus to next field
- **Blur (click outside):** Validate → Save → Exit edit mode
- **Escape key:** Discard changes → Restore original value → Exit edit mode
- **Tab key:** Save current → Move to next editable field in row

**Validation:**
- Validate before saving
- If invalid: Show error, keep in edit mode, don't save
- If valid: Save immediately, show brief success indicator

**Loading State:**
- Brief loading indicator during save (if needed)
- Optimistic update: Show new value immediately
- Rollback on error

---

### Pattern 3: Edit Action (Full Row Edit)

**Trigger:**
User clicks "Edit" from kebab menu dropdown

**Behavior:**
1. All editable fields in the row become edit mode simultaneously
2. Each field shows as input with current values
3. User can tab between fields
4. Row stays in "edit mode" until:
   - User clicks outside row (auto-saves all changes)
   - User presses Escape (cancels all changes)
   - User clicks Edit again (toggles off, saves changes)

**Visual Feedback:**
- Entire row has distinct "edit mode" appearance
- Light yellow/blue background tint (#FFFBEB or #EFF6FF)
- All editable fields show input borders
- Non-editable fields remain as text
- Edit button in menu could show "Save" or checkmark

**Save Behavior:**
- Save all modified fields together in one API call
- If any field invalid: Highlight that field, keep in edit mode
- If all valid: Save all, show success, exit edit mode
- Optimistic updates for better UX

**Cancel Behavior:**
- Escape key: Revert ALL fields to original values
- Confirmation dialog if multiple fields changed (optional)

---

### Pattern 4: View Details Action

**Trigger:**
User clicks the eye icon (👁️) in Quick Actions column

**Behavior:**
1. Navigate to Inspection Viewer page/modal
2. Open at the specific inspection for this asset
3. Don't change row selection state
4. User can return to table (back button/close modal)

**Navigation Options:**
- **Option A:** Open in new tab/window (doesn't lose context)
- **Option B:** Navigate in same page (with back navigation)
- **Option C:** Open as modal overlay (keeps table visible)

Recommend Option C (modal) for better context preservation, but check existing patterns in your app.

**Data to Pass:**
- Asset ID
- Inspection ID
- Current view/filter context (optional, for back button)

---

## 📊 State Management

### Row States

Each row can be in multiple states simultaneously:

**Selection State:**
- `selected: boolean` - Whether row is currently selected
- Affects: Background color, map navigation, snapshots panel

**Edit State:**
- `editMode: 'none' | 'field' | 'full'`
- `editingField: string | null` - Which field if single field edit
- Affects: Which inputs are shown

**Loading State:**
- `saving: boolean` - Whether save operation in progress
- Affects: Loading indicators, disable interactions

**Validation State:**
- `errors: Record<string, string>` - Field-level errors
- Affects: Error messages, prevent save

### Global State

**Selected Asset:**
- `selectedAssetId: string | null`
- Controls snapshots panel visibility
- Controls map highlight and navigation

**Edit State:**
- `editingRowId: string | null`
- `editingMode: 'field' | 'full' | null`
- Prevents multiple rows from being in edit mode

### State Transitions

**Selection Flow:**
```
No selection
    ↓ (click row)
Row selected
    ↓ (click different row)
Different row selected
    ↓ (click outside or close panel)
No selection
```

**Edit Flow:**
```
Normal mode
    ↓ (click field)
Single field edit
    ↓ (save/cancel)
Normal mode

Normal mode
    ↓ (click Edit in menu)
Full row edit
    ↓ (save/cancel)
Normal mode
```

**Combined:**
Selection and Edit can happen independently:
- Can select row without editing
- Can edit row without full selection (just field edit)
- Full row edit doesn't affect selection state

---

## 🎨 Visual Design Specifications

### Quick Actions Column

**Fixed Column Styling:**
- Width: 90px
- Padding: 8px
- Background: #FFFFFF
- Border-left: 1px solid #E5E7EB
- Box-shadow: -2px 0 4px rgba(0,0,0,0.04) (when content scrolled)

**Icon Buttons:**
- Size: 36px × 36px
- Gap between buttons: 8px
- Icon size: 20px
- Color: #6B7280 (gray-500)
- Hover color: #374151 (gray-700)
- Border-radius: 6px
- Hover background: #F3F4F6 (gray-100)

**Layout:**
```css
display: flex;
gap: 8px;
align-items: center;
justify-content: center;
```

### Row States Visual

**Normal Row:**
- Background: White
- Border-bottom: 1px solid #F3F4F6
- Text: #111827 (gray-900)

**Selected Row:**
- Background: #F3F4F6 (gray-100)
- Border-left: 3px solid #3B82F6 (blue-500) - optional accent
- Text: Same as normal

**Hover Row:**
- Background: #F9FAFB (gray-50) - if not selected
- Transition: 150ms ease

**Edit Mode Row (Full):**
- Background: #FFFBEB (yellow-50) or #EFF6FF (blue-50)
- Border: 1px solid #FCD34D (yellow-300) or #BFDBFE (blue-200)

### Field Edit States

**Normal Field:**
- Display as text
- Padding: 8px 12px
- Cursor: pointer (if editable)

**Hover Field (if editable):**
- Light background: #F9FAFB
- Show subtle edit icon (optional)

**Field in Edit Mode:**
- Border: 1px solid #3B82F6 (blue-500)
- Focus ring: 2px blue shadow
- Padding: 7px 11px (account for border)
- Border-radius: 4px

**Field with Error:**
- Border: 1px solid #EF4444 (red-500)
- Error message below: Small red text

**Field Saving:**
- Brief spinner or pulse animation
- Disabled state during save

---

## 🔄 Auto-save Implementation

### Save Triggers

**1. Enter Key:**
- Validate field value
- If valid: Save → Show success → Exit edit mode
- If invalid: Show error → Stay in edit mode → Focus field
- Move focus to next editable field (optional)

**2. Blur Event (Click Outside):**
- Triggered when user clicks outside the input
- Same validation and save logic as Enter
- Don't trigger if clicking another editable field in same row (for full edit mode)

**3. Tab Key:**
- Save current field first
- Then move focus to next field
- If last field: Exit edit mode or loop to first

**4. Escape Key:**
- Cancel edit without saving
- Restore original value
- Exit edit mode
- Remove focus

### Save Flow

```
User triggers save
    ↓
Validate value
    ↓
Valid? ──No──→ Show error message
  │             Stay in edit mode
  Yes           Keep focus on field
  │
  ↓
Show loading indicator (brief)
  ↓
Optimistic update (update UI immediately)
  ↓
API call to save
  ↓
Success? ──No──→ Rollback optimistic update
  │              Show error notification
  Yes            Keep value visible
  │              Allow retry
  ↓
Show success indicator (500ms)
  ↓
Exit edit mode
  ↓
Update row state
```

### Validation Rules

**Before Save:**
- Required fields must not be empty
- Format validation (numbers, dates, etc.)
- Range validation (min/max values)
- Custom business logic validation

**Error Display:**
- Show below field or as tooltip
- Red text, clear message
- Don't block field interaction
- Allow user to correct immediately

**Success Feedback:**
- Brief green checkmark (500ms)
- Or subtle background color pulse
- Don't use intrusive notifications for single field saves

---

## 🎯 Dropdown Menu (Kebab)

### Menu Trigger

**Click kebab icon (⋮):**
- Open dropdown menu below icon
- If near bottom of screen: Open upward instead
- Close other open menus first
- Add slight shadow/overlay

### Menu Structure

```
┌─────────────────────┐
│ ✏️  Edit            │
│ 📋 Duplicate        │
│ 🗑️  Delete          │ (red text)
└─────────────────────┘
```

**Menu Items:**

1. **Edit**
   - Icon: Edit/pencil icon
   - Text: "Edit"
   - Action: Activate full row edit mode
   - Shortcut: Maybe show "E" or "Enter" hint

2. **Duplicate**
   - Icon: Duplicate/copy icon
   - Text: "Duplicate"
   - Action: Create copy of row (shows in table immediately)
   - Opens new row in edit mode (optional)

3. **Delete**
   - Icon: Trash/delete icon
   - Text: "Delete" (in red #EF4444)
   - Action: Show confirmation dialog → Delete
   - Confirmation: "Are you sure you want to delete [Pipe Segment]?"

### Menu Behavior

**Opening:**
- Click icon → Menu appears
- Click outside → Menu closes
- Click another kebab → Close current, open new
- Escape key → Close menu

**Menu Item Interaction:**
- Hover: Background highlight (#F3F4F6)
- Click: Execute action → Close menu
- Keyboard: Arrow keys to navigate, Enter to select

**Positioning:**
- Default: Below icon, aligned to right edge
- If near screen edge: Flip to left or top
- Keep menu fully visible on screen

---

## 📱 Interaction Priority & Conflicts

### Click Target Hierarchy

When user clicks on row, determine what element was actually clicked:

**Priority (highest to lowest):**
1. **Action buttons** (View, Kebab) → Execute button action
2. **Input fields** (in edit mode) → Focus input, don't change selection
3. **Editable fields** (not in edit mode) → Enter field edit mode
4. **Checkboxes** (for multi-select) → Toggle checkbox
5. **Anywhere else on row** → Select row (map navigation + snapshots)

**Implementation:**
Use event propagation carefully:
- Stop propagation on buttons/inputs
- Let row click handler catch clicks on empty areas
- Check event.target to determine click location

### Preventing Conflicts

**Scenario 1: Field edit during row selection**
- Field edit takes priority
- Row doesn't get selected when clicking field
- Map/snapshots don't trigger

**Scenario 2: Edit mode + row selection**
- Both can coexist
- Edit mode affects inputs
- Selection affects background and map
- They don't interfere

**Scenario 3: Multiple rows in edit mode**
- Prevent: Only one row in full edit mode at a time
- Single field edits: Can be multiple rows (less confusing)
- When entering full edit on row B, save/cancel row A first

**Scenario 4: Quick action during edit**
- View Details: Always works, doesn't affect edit state
- Delete: Cancel edit first, then confirm delete
- Duplicate: Save edits first, then duplicate

---

## 🧪 Testing Scenarios

### Single-Select Flow
- [ ] Click row → Row highlights
- [ ] Click row → Map navigates to asset
- [ ] Click row → Snapshots panel appears
- [ ] Click different row → Previous deselects, new selects
- [ ] Click selected row again → Stays selected (doesn't deselect)
- [ ] Click outside table → Row deselects (optional behavior)
- [ ] Close snapshots panel → Row deselects

### Field Edit Flow
- [ ] Click editable field → Field enters edit mode
- [ ] Field shows input with current value
- [ ] Value is pre-selected/highlighted
- [ ] Enter → Saves and exits edit mode
- [ ] Blur → Saves and exits edit mode
- [ ] Escape → Cancels and restores value
- [ ] Tab → Saves current, moves to next field
- [ ] Invalid value → Shows error, stays in edit mode
- [ ] Valid value → Saves, shows brief success indicator

### Full Row Edit Flow
- [ ] Click Edit in menu → All fields become editable
- [ ] Row shows distinct edit mode appearance
- [ ] Tab between fields within row
- [ ] Click outside row → Saves all changes
- [ ] Escape → Cancels all changes
- [ ] Invalid field → Highlights error, prevents save
- [ ] Save with multiple changes → All save together

### Quick Actions
- [ ] View icon always visible (doesn't scroll)
- [ ] View icon opens Inspection Viewer
- [ ] Kebab icon opens dropdown menu
- [ ] Dropdown positioned correctly (not off-screen)
- [ ] Duplicate creates new row
- [ ] Delete shows confirmation
- [ ] Delete after confirm removes row

### Edge Cases
- [ ] Click action button during edit mode
- [ ] Rapid clicking between rows
- [ ] Network error during save
- [ ] Unsaved changes when leaving page
- [ ] Multiple fields invalid in full edit
- [ ] Very long values in edit fields
- [ ] Keyboard-only navigation works
- [ ] Mobile touch interactions (if applicable)

---

## 💡 UX Best Practices

### Feedback Principles

**Immediate:**
- Visual state changes happen instantly (hover, focus)
- Optimistic updates for saves
- No perceived lag

**Clear:**
- Obvious what's clickable (cursor, hover states)
- Visible edit mode (distinct appearance)
- Error messages are specific and helpful

**Reversible:**
- Escape cancels edits
- Delete requires confirmation
- Undo option (optional, advanced)

### Error Handling

**Validation Errors:**
- Show inline below field
- Keep field in focus
- Allow user to correct immediately
- Clear error when user starts typing

**Save Errors:**
- Show notification/toast
- Rollback optimistic update
- Keep edit mode active
- Offer retry option

**Network Errors:**
- Clear message: "Could not save changes"
- Retry button
- Offline indicator if applicable

### Accessibility

**Keyboard Navigation:**
- Tab through all interactive elements
- Enter/Space activate buttons
- Escape closes menus/cancels edits
- Arrow keys navigate dropdown menus

**Screen Readers:**
- Proper ARIA labels on icon buttons
- Announce state changes ("Row selected", "Edit mode")
- Error messages associated with fields
- Menu items have clear labels

**Visual:**
- Sufficient color contrast
- Don't rely on color alone (use icons, text)
- Focus indicators visible
- Text remains readable in all states

---

## 🚀 Implementation Checklist

### Phase 1: Basic Structure
- [ ] Implement fixed Quick Actions column
- [ ] Add View Details icon button
- [ ] Add Kebab menu icon button
- [ ] Create dropdown menu component
- [ ] Style menu items (Edit, Duplicate, Delete)

### Phase 2: Row Selection
- [ ] Add click handler for row selection
- [ ] Highlight selected row visually
- [ ] Integrate with map navigation
- [ ] Integrate with snapshots panel
- [ ] Handle deselection

### Phase 3: Single Field Edit
- [ ] Make fields clickable to edit
- [ ] Transform field to input on click
- [ ] Pre-select/highlight value
- [ ] Implement auto-save on Enter
- [ ] Implement auto-save on blur
- [ ] Implement cancel on Escape
- [ ] Add validation
- [ ] Show success/error feedback

### Phase 4: Full Row Edit
- [ ] Implement Edit action from menu
- [ ] Activate all fields in row
- [ ] Apply distinct edit mode styling
- [ ] Handle save all fields together
- [ ] Handle cancel all changes
- [ ] Prevent multiple rows in edit mode

### Phase 5: Menu Actions
- [ ] Implement Duplicate action
- [ ] Implement Delete with confirmation
- [ ] Handle menu positioning
- [ ] Close menu on outside click
- [ ] Keyboard navigation in menu

### Phase 6: Polish
- [ ] Add loading indicators
- [ ] Smooth transitions/animations
- [ ] Error recovery flows
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements
- [ ] Mobile responsiveness (if needed)

---

## ⚠️ Common Pitfalls

1. **Don't let Quick Actions scroll away** - Use position: sticky
2. **Don't allow multiple edit modes** - Confusing for users
3. **Don't forget to validate before saving** - Prevent bad data
4. **Don't block on save operations** - Use optimistic updates
5. **Don't ignore keyboard users** - Full keyboard support required
6. **Don't make clickable areas too small** - Minimum 32x32px touch targets
7. **Don't forget loading states** - Show when operations in progress
8. **Don't lose unsaved changes silently** - Warn or auto-save
9. **Don't use same handler for all clicks** - Check event.target

---

## 📝 Summary

This interaction pattern provides:
- **Simple, predictable behavior** for non-technical users
- **Quick access** to most common actions (View, Edit)
- **Flexible editing** - single field or full row
- **Auto-save** reduces user effort
- **Fixed Quick Actions** always accessible
- **Clear visual feedback** at every step

Focus on making interactions feel natural and effortless. Users shouldn't need to think about how to perform actions - they should just work intuitively.

