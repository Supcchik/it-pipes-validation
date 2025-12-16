# Map Interface - Floating Controls Design
## Cursor Implementation Prompt

---

## 🎯 Core Philosophy

**"Map is king. Everything else floats."**

The map should occupy 95% of screen space. All controls are floating overlays that appear contextually when needed. No permanent toolbars stealing space.

**Key Principle:** Context-aware UI - show controls only when relevant to current user action.

---

## 📐 Current Problems to Solve

1. **Top toolbar takes too much space** - Search, Base, Layers in separate boxes
2. **Bottom bar always visible** - Even when nothing selected
3. **Zoom controls look utilitarian** - Not modern/polished
4. **Box Select missing** - No way to select multiple segments
5. **Assign button in wrong place** - Should be in context of selection, not always visible
6. **Can't add new layers** - No UI for this

---

## ✅ New Structure Overview

```
Map screen layout:
┌─────────────────────────────────────────────┐
│ [Search] (top-left)      [Settings] (top-r) │
│                                             │
│                                             │
│            MAP (95% screen)                 │
│                                             │
│                              [Zoom+Box]     │
│                                (right side) │
│                                             │
│ [Status] (bottom-left, subtle)              │
└─────────────────────────────────────────────┘

When segment selected:
┌─────────────────────────────────────────────┐
│            MAP (slightly dimmed)            │
├─────────────────────────────────────────────┤
│ SNAPSHOTS PANEL (slides up from bottom)     │
│ with [Assign] and [View] actions           │
└─────────────────────────────────────────────┘
```

---

## 🔍 Component 1: Search (Top-Left Floating)

### Purpose
Search entire city network (ESRI database), separate from table search.

### Visual Design

**Default state - floating pill:**
- Shape: Fully rounded pill (border-radius: 22px)
- Size: 280px width × 44px height
- Position: top-left, 16px from edges
- Background: white
- Shadow: 0 2px 8px rgba(0,0,0,0.15) - subtle but visible
- Icon: Search icon (🔍) inside left, 20px size
- Placeholder: "Search city network..."
- Font: 14px, regular weight

**Important:** This is NOT an icon button. It's a full input field that looks like a pill.

**On focus state:**
- Border: 2px solid blue (#3B82F6)
- Shadow: 0 4px 12px rgba(59,130,246,0.25) - blue glow
- Clear button (×) appears on right side
- Dropdown appears below with:
  - Recent searches
  - Autocomplete suggestions as user types
- Dropdown specs:
  - Width: Same as search bar
  - Max height: 300px, scrollable
  - Background: white
  - Shadow: 0 4px 12px rgba(0,0,0,0.15)
  - Border-radius: 8px

**Optional enhancement (on scroll):**
When user scrolls map down, search can collapse to just icon:
- Becomes circular button 44×44px
- Shows only search icon
- Click expands back to full pill

**Behavior:**
- Type query → Searches ESRI database (entire city network)
- Select result → Map zooms to that segment
- Segment highlights on map
- If inspected: Snapshots panel opens
- If not inspected: Show "Create Work Order" option

---

## ⚙️ Component 2: Settings Button (Top-Right Floating)

### Purpose
Access all map configuration: base map, layers, display options.

### Visual Design

**Button:**
- Shape: Circle
- Size: 44×44px
- Position: top-right, 16px from edges
- Background: white
- Shadow: 0 2px 8px rgba(0,0,0,0.15)
- Icon: Settings gear (⚙️), 20px size
- Hover: Scale slightly (1.05)

**Click behavior:**
Opens slide-out panel from right side.

### Settings Panel Design

**Panel specs:**
- Width: 320px
- Height: Full screen height
- Slides in from right with animation (300ms ease-out)
- Background: white
- Shadow: -2px 0 12px rgba(0,0,0,0.15) on left edge
- Backdrop: Map slightly dimmed (overlay with opacity 0.3)

**Panel structure:**

**Header:**
- Text: "Map Settings"
- Close button [×] on right
- Height: 56px
- Border-bottom: 1px solid #E5E7EB

**Section 1: Base Map**
- Title: "Base Map" (14px, medium weight)
- Radio options (vertical list):
  - ● Streets (selected by default)
  - ○ Satellite
  - ○ Hybrid
  - ○ Terrain
- Spacing: 12px between options
- Click any option → Map base layer changes immediately

**Section 2: Layers**
- Title: "Layers" (14px, medium weight)
- Checkbox list:
  - ☑ SewerLines_All (checked by default)
  - ☑ Manholes_All (checked by default)
  - ☑ Heat Map (Grades) (checked by default)
  - ☐ Laterals
  - ☐ Valves
  - ☐ Storm Drains
- Each checkbox: 20px size
- Spacing: 8px between items
- Check/uncheck → Layer toggles on map immediately
- At bottom: "+ Add Layer" button
  - Style: Text button, blue color
  - Click → Opens file picker or layer source dialog

**Section 3: Display**
- Title: "Display" (14px, medium weight)
- Checkbox options:
  - ☑ Show labels
  - ☐ Show asset IDs
  - ☐ Cluster markers

**Note:** NO 3D buildings option (not supported)

**Footer:**
- Empty space or future settings
- Panel scrollable if content grows

**Close panel:**
- Click [×] button
- Click outside panel (on backdrop)
- Press Escape key

---

## 🎛️ Component 3: Zoom + Box Select Stack (Right Side)

### Purpose
Combined control for zoom and selection tools. Stacked vertically on right side of map.

### Visual Design

**Container:**
- Position: right side, 16px from right edge, 100px from bottom
- Width: 44px (consistent with other floating controls)
- Background: white
- Border-radius: 8px (container, not individual buttons)
- Shadow: 0 2px 8px rgba(0,0,0,0.15)
- Buttons stacked with 1px divider between them

**Button structure (top to bottom):**

**1. Zoom In (+)**
- Size: 44×44px
- Icon: Plus sign, 20px
- Border-bottom: 1px solid #E5E7EB (divider)
- Hover: Background #F3F4F6
- Click: Zoom in one level

**2. Zoom Level Display**
- Size: 44×44px
- Shows current zoom: "14" or "16"
- Non-interactive (just display)
- Font: 14px, medium weight
- Border-bottom: 1px solid #E5E7EB

**3. Zoom Out (-)**
- Size: 44×44px
- Icon: Minus sign, 20px
- Border-bottom: 1px solid #E5E7EB
- Hover: Background #F3F4F6
- Click: Zoom out one level

**4. Box Select (□)**
- Size: 44×44px
- Icon: Square outline, 20px
- Toggle button (has active/inactive states)
- Default state:
  - Background: white
  - Icon: Gray
- Active state:
  - Background: #3B82F6 (blue)
  - Icon: white
  - Button "pressed in" appearance

**5. Cancel Button (×) - Appears only when Box Select active**
- Size: 44×44px
- Icon: X mark, 20px
- Color: Red (#EF4444)
- Only visible when Box Select is active
- Click: Deactivates Box Select mode

### Box Select Behavior

**Activating:**
1. User clicks Box Select button (□)
2. Button turns blue (active state)
3. Cancel button (×) appears below it
4. Map cursor changes to crosshair
5. Status chip shows: "Draw box to select segments"

**Drawing box:**
1. User clicks and holds on map
2. Drags to create rectangle
3. Visual: Dashed blue outline (2px dashed line, blue color)
4. Shows preview of selection area
5. On release: Selection is made

**During selection:**
- All segments within box are highlighted
- Count updates: "5 selected"
- Snapshots panel slides up from bottom

**Canceling:**
- Click Cancel button (×) → Deactivates Box Select
- Click Box Select button again → Toggles off
- Press Escape key → Deactivates
- Make selection → Auto-deactivates

**Edge cases:**
- Click without dragging: Deselects all
- Empty selection (no segments in box): Show message "No segments in selection area"

---

## 📊 Component 4: Status Chip (Bottom-Left)

### Purpose
Show asset count and selection status. Very subtle, doesn't compete with map.

### Visual Design

**Position:**
- Bottom-left corner
- 16px from left and bottom edges

**No selection state:**
```
[30 assets]
```
- Background: rgba(0,0,0,0.5) - semi-transparent dark
- Color: white
- Padding: 6px 12px
- Border-radius: 6px
- Font: 13px, medium weight
- Shadow: 0 2px 6px rgba(0,0,0,0.2)

**During Box Select (while drawing):**
```
[Selecting...]
```
- Same styling
- Text changes to indicate action in progress

**After selection made:**
```
[5 selected]
```
- Same styling
- Shows count of selected segments
- Text: "X selected" (NOT "X pipes selected" or "X segments selected")

**Important:** This chip is STATUS ONLY. No actions, not clickable. Just information display.

---

## 📸 Component 5: Snapshots Panel (Context-Aware)

### Purpose
When user selects segment(s), show snapshots and provide actions. This is where the Assign button lives.

### When It Appears
- User clicks single segment on map
- User completes box selection
- User searches for segment and selects it

### Visual Design

**Animation:**
Slides up from bottom of screen (mobile-style bottom sheet pattern)
- Animation duration: 300ms ease-out
- Map behind gets slightly dimmed (overlay opacity 0.3)

**Panel structure:**

**Drag Handle (top):**
- Visual indicator: Horizontal line, centered
- Width: 40px, height: 4px
- Color: #D1D5DB (gray)
- Margin: 12px from top
- Purpose: Visual cue that panel can be swiped down to close

**Header:**
- For single selection: "Pipe S-104" (segment ID)
- For multiple selection: "5 selected"
- Close button [×] on right
- Font: 16px, semibold
- Height: 48px
- Border-bottom: 1px solid #E5E7EB

**Content area:**

**Single segment selected:**
- Horizontal scrollable list of snapshot images
- Each snapshot: 
  - Size: 120×120px
  - Border-radius: 8px
  - Gap: 12px between images
  - Click snapshot → Opens full view
- Below images: Metadata
  - Grade, Distance, Code
  - Compact display, 12px font

**Multiple segments selected:**
- List of segment IDs:
  ```
  • Pipe S-104
  • Pipe S-105
  • Pipe S-106
  • Pipe S-107
  • Pipe S-108
  ```
- Max height: 150px, scrollable if more
- Font: 14px
- Each item: 32px height

**Actions bar (bottom of panel):**

For single segment:
```
[Assign to User ▼]     [View Inspection →]
```

For multiple segments:
```
[Assign to User ▼]     [Clear Selection]
```

**Button specs:**
- Height: 44px
- Gap: 12px between buttons
- Assign button:
  - Style: Primary button
  - Background: Blue (#3B82F6)
  - Color: white
  - Border-radius: 8px
  - Full text: "Assign to User" with dropdown arrow
- View/Clear button:
  - Style: Secondary button
  - Background: white
  - Border: 1px solid #D1D5DB
  - Color: Gray (#374151)

**Panel sizing:**
- Single segment: ~240px height (fits snapshots + actions)
- Multiple segments: ~200px height (list + actions)
- Maximum: 50% of screen height
- Scrollable if content exceeds

### Assign Dropdown (within panel)

**When user clicks "Assign to User ▼":**

Dropdown appears INSIDE the panel (not outside):
- Position: Above the Assign button
- Width: Same as button
- Max height: 200px, scrollable

**Dropdown content:**
- Header: "Assign X to:" (where X is count)
- User list:
  ```
  👤 John Smith
  👤 Mary Johnson
  👤 Bob Wilson
  ```
- Each user: 40px height, click to select
- Divider line
- Bottom option: "+ Create Work Order"
  - Opens detailed dialog for complex assignment

**Quick assign flow:**
1. User clicks "Assign to User ▼"
2. Dropdown appears
3. User clicks user name (e.g., "John Smith")
4. Work order created immediately
5. Toast notification: "Assigned 5 segments to John Smith"
6. Panel closes
7. Selection clears

**Create Work Order flow:**
1. User clicks "+ Create Work Order"
2. Opens modal dialog with:
   - Selected segments list
   - User dropdown
   - Priority (Normal/High/Urgent)
   - Due date picker
   - Notes textarea
   - Cancel and Create buttons
3. On Create:
   - Work orders created
   - Toast notification
   - Modal and panel close

### Closing the Panel

**Methods:**
- Click [×] button
- Swipe down (mobile gesture)
- Click on dimmed map area (outside panel)
- Press Escape key
- Complete an action (assign, view)

**On close:**
- Panel slides down (reverse animation)
- Map brightens back to full opacity
- Selection remains highlighted on map until user clicks elsewhere

---

## 🔄 Complete User Flows

### Flow 1: Box Select Multiple Segments

```
1. User clicks Box Select button [□]
   → Button turns blue
   → Cancel button [×] appears below
   → Cursor becomes crosshair
   → Status: "Draw box to select segments"

2. User clicks and drags on map
   → Dashed blue rectangle appears
   → Shows preview of selection area
   
3. User releases mouse
   → Box Select auto-deactivates
   → Button returns to normal
   → Cancel button disappears
   → Segments within box highlight (blue outline)
   → Status: "5 selected"
   → Snapshots panel slides up
   
4. Snapshots panel shows:
   "5 selected"
   • Pipe S-104
   • Pipe S-105
   • Pipe S-106
   • Pipe S-107
   • Pipe S-108
   
   [Assign to User ▼]  [Clear Selection]

5. User clicks "Assign to User ▼"
   → Dropdown appears above button
   → Shows list of users
   
6. User clicks "John Smith"
   → Dropdown closes
   → Work orders created for all 5 segments
   → Toast: "Assigned 5 segments to John Smith"
   → Panel closes
   → Selection clears
   → Map returns to normal
```

### Flow 2: Single Segment Click

```
1. User clicks segment on map
   → Segment highlights
   → Status: "1 selected"
   → Snapshots panel slides up
   
2. Snapshots panel shows:
   "Pipe S-104"
   [snapshot images in horizontal scroll]
   Grade | Distance | Code
   
   [Assign to User ▼]  [View Inspection →]

3. User can:
   A) Swipe through snapshots
   B) Click "Assign to User ▼" → Assign flow
   C) Click "View Inspection →" → Opens full inspection viewer
   D) Close panel → Returns to map
```

### Flow 3: Search and Select

```
1. User clicks in search bar
   → Search expands (if collapsed)
   → Shows recent searches dropdown
   
2. User types: "S-104"
   → Autocomplete suggestions appear
   → Shows matching segments
   
3. User clicks suggestion or presses Enter
   → Map zooms to segment S-104
   → Segment highlights
   → Snapshots panel opens
   → User can now assign or view
```

### Flow 4: Change Base Map

```
1. User clicks Settings button [⚙️]
   → Panel slides in from right
   → Map dims slightly
   
2. User sees Base Map section
   Current: ● Streets (selected)
   
3. User clicks "○ Satellite"
   → Radio button switches: ○ Streets, ● Satellite
   → Map base layer changes IMMEDIATELY
   → No "Apply" button needed
   
4. User clicks outside panel or [×]
   → Panel slides out
   → Map returns to full brightness
   → Changes are saved
```

### Flow 5: Toggle Layers

```
1. User clicks Settings button [⚙️]
   → Panel opens
   
2. User scrolls to Layers section
   Current layers checked:
   ☑ SewerLines_All
   ☑ Manholes_All
   ☑ Heat Map (Grades)
   
3. User unchecks "Heat Map (Grades)"
   → Checkbox becomes empty ☐
   → Heat map disappears from map IMMEDIATELY
   → Layer count updates somewhere (if displayed)
   
4. User checks "Laterals"
   → Checkbox fills ☑
   → Laterals layer appears on map
   
5. User clicks [+ Add Layer]
   → Opens file picker or layer source selector
   → User selects layer source
   → New layer added to list
   → Checkbox is checked by default
   → Layer appears on map
```

### Flow 6: Cancel Box Select

```
1. User activates Box Select
   → Button blue, cancel appears
   
2. User realizes they don't need it
   → Clicks Cancel button [×]
   OR clicks Box Select button again
   OR presses Escape
   
3. Box Select deactivates
   → Button returns to white
   → Cancel button disappears
   → Cursor returns to normal
   → Status returns to normal
```

---

## 🎨 Visual Design System

### Spacing
- Floating controls from edges: 16px
- Between stacked buttons: 1px divider
- Panel padding: 16px
- Section gaps: 24px
- Button padding: 8px 16px

### Sizes
- Floating buttons: 44×44px (touch-friendly)
- Panel width: 320px
- Search bar: 280×44px
- Snapshots: 120×120px
- Action buttons height: 44px

### Colors

**Backgrounds:**
- White: #FFFFFF
- Floating controls background: white
- Panel background: white
- Dim overlay: rgba(0,0,0,0.3)
- Status chip: rgba(0,0,0,0.5)

**Blues (Primary):**
- Blue-600: #3B82F6 (active states, primary buttons)
- Blue-100: #DBEAFE (subtle backgrounds)

**Grays (Neutrals):**
- Gray-50: #F9FAFB (hover states)
- Gray-200: #E5E7EB (borders, dividers)
- Gray-400: #9CA3AF (placeholders)
- Gray-700: #374151 (text)
- Gray-900: #111827 (headings)

**Feedback:**
- Red-500: #EF4444 (cancel, delete)
- Green-500: #10B981 (success states)

### Shadows

**Floating controls:**
```
box-shadow: 0 2px 8px rgba(0,0,0,0.15);
```

**Panels:**
```
box-shadow: 0 4px 12px rgba(0,0,0,0.15);
```

**Focus states:**
```
box-shadow: 0 0 0 3px rgba(59,130,246,0.25);
```

### Typography

**Search placeholder:**
- Font: 14px, regular (400)
- Color: #9CA3AF

**Panel titles:**
- Font: 14px, medium (500)
- Color: #374151

**Panel headers:**
- Font: 16px, semibold (600)
- Color: #111827

**Button text:**
- Font: 14px, medium (500)

**Status chip:**
- Font: 13px, medium (500)
- Color: white

### Border Radius

**Full pills (search):** 22px (fully rounded)
**Floating controls:** 8px
**Buttons:** 8px
**Panels:** 0 (full height)
**Snapshots:** 8px
**Status chip:** 6px

### Animations

**Panel slide-in:**
- Duration: 300ms
- Easing: ease-out
- Transform: translateX(100%) → translateX(0)

**Snapshots panel slide-up:**
- Duration: 300ms
- Easing: ease-out
- Transform: translateY(100%) → translateY(0)

**Button hover:**
- Duration: 150ms
- Easing: ease-in-out
- Scale: 1.0 → 1.05

**Backdrop fade:**
- Duration: 300ms
- Opacity: 0 → 0.3

---

## 🚫 What NOT to Include

**Do not add:**
- ❌ Permanent top toolbar (we removed it!)
- ❌ Permanent bottom bar (only status chip)
- ❌ 3D buildings option (not supported)
- ❌ "X pipes selected" (use "X selected" or "X segments selected")
- ❌ Left side panel (we chose floating instead)
- ❌ Pan controls (users use mouse/gestures)
- ❌ Compass (not needed for this use case)

**Keep interactions simple:**
- ❌ Don't add complex gestures beyond swipe
- ❌ Don't add keyboard shortcuts yet (future enhancement)
- ❌ Don't add advanced filtering in map view (use table filters)

---

## 📱 Responsive Considerations

**This design is desktop-first** since users work on laptops/desktops with dual monitors.

**For tablet (optional future):**
- Same floating approach works
- Snapshots panel becomes bottom sheet
- Touch targets already 44px (good)

**For mobile (not priority):**
- Search collapses to icon
- Settings panel becomes full screen
- Zoom controls stay on right
- Snapshots panel already mobile-style

---

## ✅ Implementation Checklist

### Phase 1: Floating Controls
- [ ] Remove old top toolbar completely
- [ ] Create Search floating pill (top-left)
- [ ] Create Settings button (top-right)
- [ ] Implement Settings slide-out panel
- [ ] Add Base Map radio selector
- [ ] Add Layers checkbox list with immediate toggle
- [ ] Add "+ Add Layer" button

### Phase 2: Zoom + Box Select
- [ ] Create floating Zoom stack (right side)
- [ ] Add Zoom in/out buttons
- [ ] Add Zoom level display
- [ ] Add Box Select toggle button
- [ ] Implement Box Select active state (blue)
- [ ] Add Cancel button (appears when active)
- [ ] Implement box drawing on map
- [ ] Highlight segments within box
- [ ] Handle selection logic

### Phase 3: Status & Selection
- [ ] Create status chip (bottom-left)
- [ ] Show asset count: "30 assets"
- [ ] Update during selection: "Selecting..."
- [ ] Show selection count: "5 selected"
- [ ] Keep terminology: "X selected" (not "X pipes")

### Phase 4: Snapshots Panel
- [ ] Create bottom panel component
- [ ] Implement slide-up animation
- [ ] Add drag handle (visual only for now)
- [ ] Add panel header with close button
- [ ] Show single segment: ID + snapshots
- [ ] Show multiple segments: list of IDs
- [ ] Add horizontal scrollable snapshot list
- [ ] Add Assign button in panel
- [ ] Add View/Clear button in panel

### Phase 5: Assign Functionality
- [ ] Create Assign dropdown (inside panel)
- [ ] Populate with user list
- [ ] Implement quick assign (click user name)
- [ ] Create work orders on assignment
- [ ] Show toast notification
- [ ] Close panel and clear selection
- [ ] Add "+ Create Work Order" option
- [ ] Create detailed work order dialog

### Phase 6: Interactions
- [ ] Search autocomplete with ESRI data
- [ ] Map zoom on search result
- [ ] Segment click → opens panel
- [ ] Box Select → opens panel with list
- [ ] Settings panel backdrop click to close
- [ ] Snapshots panel swipe down to close
- [ ] Escape key to close panels
- [ ] Click outside to deselect

### Phase 7: Polish
- [ ] Add all hover states
- [ ] Add loading states (search, assign)
- [ ] Add empty states (no results, no selection)
- [ ] Add error states (assign failed, etc.)
- [ ] Smooth animations for all transitions
- [ ] Proper shadows and visual hierarchy
- [ ] Test all user flows end-to-end

---

## 🎯 Success Criteria

After implementation, the interface should:

✅ **Maximize map space** - 95%+ of screen is map
✅ **Clean and modern** - Floating controls, no clutter
✅ **Context-aware** - Assign only shows when selection exists
✅ **Box Select integrated** - Smooth workflow for multiple segments
✅ **Professional yet simple** - "Can my dad use it?" test passes
✅ **No wasted space** - Everything has a purpose
✅ **Mobile-ready patterns** - Bottom panels, swipe gestures
✅ **Immediate feedback** - Layer toggles, base map changes instant

---

## 💡 Key Design Decisions Explained

**Why floating instead of toolbar?**
- Map is primary interface - needs maximum space
- Users view map 90% of time, configure 10%
- Floating = modern pattern (Google Maps, Waze)

**Why Box Select in zoom stack?**
- Related controls grouped together
- Right side = navigation controls
- Both affect how you interact with map
- Consistent location, easy to find

**Why Assign in Snapshots panel?**
- Assignment is action ON selected segments
- Contextual - only appears when relevant
- Keeps main map clean
- Snapshots panel = "what can I do with this selection?"

**Why Settings panel vs dropdown?**
- Too many options for simple dropdown
- Layers list can grow (10+ items)
- Need "+ Add Layer" functionality
- Panel accommodates growth better

**Why status chip vs always-visible bar?**
- Bar wastes space when no selection
- Chip is subtle, doesn't compete with map
- Only shows essential info
- Mobile pattern (unobtrusive)

**Why slide-up panel vs modal?**
- Mobile-first pattern
- Doesn't fully block map
- Swipe gesture feels natural
- Can see map context while reviewing

---

## 🚀 Final Notes

This design transforms the map from a tool surrounded by UI chrome into the primary workspace with contextual controls appearing exactly when needed.

**Core principle:** If something isn't needed right now, hide it. When user needs it, make it appear naturally in context.

**Result:** Clean, professional, modern map interface that doesn't sacrifice power for simplicity. Box Select, assignments, layer management - all accessible but not in the way.