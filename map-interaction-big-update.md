# Map Interface Redesign - Command Center Layout
## Cursor Implementation Prompt

---

## 🎯 Problem Statement

The current map interface has several UX issues:

1. **Search is unclear** - Small icon, not obvious it's separate from table search
2. **Streets dropdown** - Unclear purpose (is it base map selector?)
3. **Layers panel issues:**
   - Popout icon (🔗) that goes nowhere
   - Not scalable for many layers
   - Takes up too much space
4. **Asset count buried** - "30 assets loaded" is at bottom, hard to see
5. **No selection feedback** - Can't see how many assets selected
6. **Missing critical feature** - Can't assign assets to users from map

**From meeting (Dec 5):**
> "There's a search for the data table and then there's a search for the map, these do not always have the same information in them. The table only shows inspections or work orders. The map has the city's entire network." - Michaela

> "Creating a work order is clicking by this hard hat man... assigning it to some operator." - Michaela

**Key Insight:** Map and table are **TWO DIFFERENT DATABASES**
- Table = Inspections & work orders only
- Map = Entire city network (ESRI database)

---

## ✅ Solution: Command Center Layout

Transform the map into a "command center" with:
- **Clear search** (full input field, not icon)
- **Visible status** (assets loaded, selection count)
- **Quick actions** (assign to user)
- **Scalable layers** (dropdown, not permanent panel)

---

## 🎨 New Layout Structure

### Overview:
```
┌─────────────────────────────────────────────────────┐
│ TOP TOOLBAR (Search, Base Map, Layers)              │
├─────────────────────────────────────────────────────┤
│                                                     │
│                  MAP AREA                           │
│     (Pipes, manholes, heat map, selection)         │
│                                                     │
├─────────────────────────────────────────────────────┤
│ BOTTOM CONTROLS (Status, Zoom, Actions)            │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Section 1: Top Toolbar

### Current State (Problems):
```
[🔍 icon]  [Streets ▼ with 📋 icon]  
                                    [Layers panel →]
```
- Search is just an icon (not obvious)
- "Streets" unclear purpose
- Layers panel always visible (wastes space)

### New Design:
```
┌────────────────────────────────────────────────────┐
│ 🔍 [Search city network...           ] [×]         │
│    [Base: Streets ▼]  [Layers (3) ▼]              │
└────────────────────────────────────────────────────┘
```

### Components:

**1. Map Search Input**
- **Full text input field** (not icon!)
- Width: ~320px minimum, can grow
- Placeholder: "Search city network..."
- Clear button (×) appears when typing
- Search icon (🔍) inside input on left

**Purpose:**
Searches ESRI database (entire city network), not just table data.

**Behavior:**
- User types: "S-104"
- Map zooms to that pipe segment
- Highlights pipe on map
- If inspected → Shows snapshots panel
- If not inspected → Shows "Create Work Order" option

**Visual specs:**
```
Height: 40px
Border-radius: 8px
Border: 1px solid gray-300
Padding: 8px 12px 8px 36px (room for icon)
Background: white

On focus:
  Border: blue-500
  Box-shadow: 0 0 0 3px blue-100

On hover (when not focused):
  Border: gray-400
```

**Important:** This search is SEPARATE from table search!
- Table search: Searches current view (inspections/work orders only)
- Map search: Searches entire city network (all assets)

---

**2. Base Map Selector**
```
[Base: Streets ▼]
```

**Purpose:**
Switch between map base layers (background map style).

**Dropdown options:**
```
┌─────────────────┐
│ ● Streets       │ ← Selected
│ ○ Satellite     │
│ ○ Hybrid        │
│ ○ Terrain       │
└─────────────────┘
```

**Behavior:**
- Click → Dropdown opens
- Select option → Map base layer changes
- Dropdown closes
- Button shows selected: "Base: Satellite"

**Visual specs:**
```
Height: 40px
Min-width: 140px
Border-radius: 8px
Border: 1px solid gray-300
Background: white
Padding: 8px 12px

Hover:
  Border: gray-400
  Background: gray-50
```

**Note:** This replaces the current "Streets" dropdown. Rename it to make purpose clear.

---

**3. Layers Dropdown**
```
[Layers (3) ▼]
```

**Purpose:**
Toggle map layers on/off. Number in parentheses shows active layers count.

**Dropdown content:**
```
┌───────────────────────────┐
│ ☑ SewerLines_All          │
│ ☑ Manholes_All            │
│ ☑ Heat Map (Grades)       │
│ ☐ Laterals                │
│ ☐ Valves                  │
│ ☐ Storm Drains            │
│                           │
│ [Manage Layers →]         │
└───────────────────────────┘
```

**Behavior:**
- Click → Dropdown opens
- Check/uncheck layers → Map updates immediately
- Count updates: (3) → (4) when layer added
- Dropdown stays open until user clicks outside
- "Manage Layers" opens full layer management (future enhancement)

**Why dropdown instead of permanent panel:**
- Saves screen space (map is main focus)
- Scalable (can have 10+ layers without crowding)
- Only shown when needed

**Remove from current implementation:**
- ❌ Popout icon (🔗) - serves no purpose
- ❌ Always-visible panel - wastes space
- ❌ Right-side placement - move to top toolbar

**Visual specs:**
```
Button:
  Height: 40px
  Min-width: 120px
  Border-radius: 8px
  Border: 1px solid gray-300

Dropdown:
  Width: 240px
  Max-height: 400px (scrollable if many layers)
  Border-radius: 8px
  Box-shadow: 0 4px 12px rgba(0,0,0,0.15)
  
Checkboxes:
  Size: 20px
  Spacing: 8px between items
  Padding: 8px 12px per item
  
Hover item:
  Background: gray-50
```

**If many layers (10+), group them:**
```
┌───────────────────────────┐
│ Pipe Infrastructure:      │
│   ☑ SewerLines_All        │
│   ☐ SewerLines_Critical   │
│                           │
│ Structures:               │
│   ☑ Manholes_All          │
│   ☐ Valves                │
│                           │
│ Analysis:                 │
│   ☑ Heat Map (Grades)     │
│   ☐ Age Analysis          │
└───────────────────────────┘
```

---

### Top Toolbar Layout:

**Alignment:**
All components left-aligned, with consistent spacing.

**Spacing:**
```
[Search input] [16px gap] [Base dropdown] [8px gap] [Layers dropdown]
```

**Container specs:**
```
Height: 56px
Padding: 8px 16px
Background: white
Border-bottom: 1px solid gray-200
Box-shadow: 0 1px 3px rgba(0,0,0,0.05)
```

**Responsive behavior:**
- Desktop (1200px+): Full layout as shown
- Tablet (768-1199px): Search width reduces to ~240px
- Mobile (<768px): Stack vertically or hide search (show icon)

---

## 📋 Section 2: Bottom Control Bar

### Current State (Problem):
```
[+] [-] [Zoom: 16] [☐ Box Select]     30 assets loaded
```
- Asset count is text in corner (easy to miss)
- No indication of selection count
- No quick actions for selected assets

### New Design:
```
┌──────────────────────────────────────────────────────┐
│ [30 assets] [2 selected]  [+][-][16][☐]  [Assign ▼] │
└──────────────────────────────────────────────────────┘
```

### Components:

**1. Status Chips (Left Side)**

**Assets Loaded Chip:**
```
[30 assets]
```

**Purpose:** Show total assets visible on map

**Visual specs:**
```
Height: 32px
Padding: 4px 12px
Border-radius: 6px
Background: gray-100
Color: gray-700
Font-size: 13px
Font-weight: 500
```

**Behavior:**
- Updates when map loads/filters assets
- Not clickable (just status indicator)

---

**Selection Chip:**
```
[2 selected]
```

**Purpose:** Show how many assets currently selected

**Visual specs:**
```
Height: 32px
Padding: 4px 12px
Border-radius: 6px
Background: blue-100
Color: blue-700
Font-size: 13px
Font-weight: 500
Cursor: pointer

Hover:
  Background: blue-200
  
Active:
  Background: blue-300
```

**Behavior:**

When NO selection:
- Chip not shown
- Just: `[30 assets]`

When 1+ selected:
- Chip appears: `[1 selected]` or `[2 selected]`
- Is clickable
- Click → Opens selection details popover

**Selection Details Popover:**
```
┌─────────────────────────┐
│ Selected Assets:        │
│ • Pipe S-104            │
│ • Pipe S-105            │
│                         │
│ [Clear Selection]       │
│ [Assign to User →]      │
└─────────────────────────┘
```

Popover specs:
```
Width: 240px
Max-height: 300px (scrollable)
Position: Above chip
Border-radius: 8px
Box-shadow: 0 4px 12px rgba(0,0,0,0.15)
Padding: 12px
```

**How selection works:**
- User clicks pipe on map → Single select (1 selected)
- User box-selects area → Multiple select (5 selected)
- Click outside → Deselects (chip disappears)
- Ctrl+Click → Add/remove from selection

---

**2. Zoom Controls (Center)**

Keep existing zoom controls, but group them:

```
[+] [-] [Zoom: 16] [☐ Box Select]
```

**Visual changes:**
- Group in single container with light border
- Consistent spacing (8px between items)
- Same height as status chips (32px)

**Container specs:**
```
Display: inline-flex
Gap: 8px
Border: 1px solid gray-300
Border-radius: 8px
Padding: 4px 8px
Background: white
```

---

**3. Quick Actions (Right Side)**

**Assign to User Dropdown:**
```
[Assign to... ▼]
```

**Purpose:** 
Quickly create work orders and assign selected assets to users.

**States:**

Disabled (no selection):
```
[Assign to... ▼]  (grayed out)
```

Enabled (1+ selected):
```
[Assign to... ▼]  (active, clickable)
```

**Dropdown content:**
```
┌─────────────────────────┐
│ Assign 2 assets to:     │
│                         │
│ 👤 John Smith          │
│ 👤 Mary Johnson        │
│ 👤 Bob Wilson          │
│                         │
│ ─────────────────────  │
│ [+ Create Work Order]   │
└─────────────────────────┘
```

**Quick Assign Behavior:**
- User selects assets on map
- Opens dropdown
- Clicks user name
- → Instant assignment (no dialog needed for simple case)
- Toast confirmation: "Assigned 2 pipes to John Smith"

**Create Work Order Button:**
Opens detailed dialog for more complex assignment:

```
┌──────────────────────────────┐
│ Create Work Order            │
├──────────────────────────────┤
│                              │
│ Selected Assets: (2)         │
│ • Pipe S-104                 │
│ • Pipe S-105                 │
│                              │
│ Assign to:                   │
│ [Select User ▼]              │
│                              │
│ Priority:                    │
│ ● Normal  ○ High  ○ Urgent   │
│                              │
│ Due Date:                    │
│ [Select Date]                │
│                              │
│ Notes:                       │
│ [________________]           │
│ [________________]           │
│                              │
│     [Cancel]  [Create]       │
└──────────────────────────────┘
```

**Visual specs for button:**
```
Height: 32px
Padding: 4px 16px
Border-radius: 6px
Background: blue-600
Color: white
Font-weight: 500

Disabled:
  Background: gray-300
  Color: gray-500
  Cursor: not-allowed
  
Hover (when enabled):
  Background: blue-700
```

**Important:**
This is a NEW feature not in current implementation. It syncs the two databases:
- Map database (ESRI - entire city network)
- Table database (Inspections & work orders)

From meeting: "The table only shows inspections or work orders... the map has the city's entire network. This is a use case to search for it on the map and create a work order."

---

### Bottom Bar Layout:

**Structure:**
```
[Left: Status chips] [Center: Zoom] [Right: Actions]
```

**Spacing:**
```
Status chips [24px gap] Zoom controls [24px gap] Actions
```

**Container specs:**
```
Height: 48px
Padding: 8px 16px
Background: white
Border-top: 1px solid gray-200
Display: flex
Justify-content: space-between
Align-items: center
```

---

## 🔄 User Flows

### Flow 1: Search on Map (Separate from Table)

**Scenario:** User wants to find a pipe that's not in their table yet.

```
1. User clicks in map search input
   → Focus state, cursor appears

2. User types: "S-104"
   → Search queries ESRI database (not table)
   → Shows autocomplete suggestions if available

3. User presses Enter or clicks suggestion
   → Map zooms to pipe S-104
   → Pipe highlights on map (thick blue outline)
   
4. Two possible outcomes:
   
   A) Pipe has been inspected:
      → Snapshots panel opens (shows observation photos)
      → User can view details
      
   B) Pipe NOT inspected yet:
      → "Create Work Order" button appears
      → User can assign it to someone
```

**Key Difference from Table Search:**
- Table search: Only finds assets IN the current view
- Map search: Finds ANY asset in city network

**Implementation note:**
Map search should NOT filter the table. It's a separate action.

---

### Flow 2: Assign Assets to User

**Scenario:** Supervisor wants to assign inspection work to field operator.

```
1. User uses box select on map
   → Draws rectangle around area
   → Multiple pipes highlighted
   
2. Bottom bar updates:
   → [30 assets] [5 selected] appears
   
3. User clicks [Assign to... ▼]
   → Dropdown opens with list of users
   
4. User clicks "John Smith"
   → Confirmation (optional): "Assign 5 pipes to John Smith?"
   → Click Yes
   
5. Backend creates work orders:
   → 5 new work orders created
   → All assigned to John Smith
   → Assets now appear in John's table view
   
6. Feedback:
   → Toast: "Assigned 5 pipes to John Smith ✓"
   → Selection clears
   → Chip disappears: [30 assets] (back to normal)
```

**Why this is critical:**
From meeting: "There may be an asset on the map that does not exist in my table. I want to create a work order so this asset exists in my table."

This bridges the gap between:
- City's entire network (map)
- Active work orders (table)

---

### Flow 3: Toggle Layers

**Scenario:** User wants to hide heat map for clearer view.

```
1. User clicks [Layers (3) ▼]
   → Dropdown opens
   
2. Current state shows:
   ☑ SewerLines_All
   ☑ Manholes_All
   ☑ Heat Map (Grades)  ← Currently ON
   
3. User clicks "Heat Map (Grades)" checkbox
   → Checkbox unchecks
   → Heat map IMMEDIATELY disappears from map
   → Dropdown stays open
   
4. Button updates:
   → [Layers (2) ▼] (count decreased)
   
5. User clicks outside dropdown
   → Dropdown closes
   → Map shows only pipes and manholes
```

**No "Apply" button needed** - changes are instant for better UX.

---

### Flow 4: View Selection Details

**Scenario:** User selected multiple pipes and wants to see list.

```
1. User has [3 selected] chip visible
   
2. User clicks the chip
   → Popover opens above chip
   
3. Popover shows:
   ┌─────────────────────────┐
   │ Selected Assets:        │
   │ • Pipe S-104            │
   │ • Pipe S-105            │
   │ • Pipe S-106            │
   │                         │
   │ [Clear Selection]       │
   │ [Assign to User →]      │
   └─────────────────────────┘
   
4. User can:
   A) Click [Clear Selection] → Deselects all
   B) Click [Assign to User] → Opens assign dropdown
   C) Click outside → Popover closes
```

---

## 🎨 Visual Design System

### Colors:

**Status Chips:**
```
Assets Loaded:
  Background: #F3F4F6 (gray-100)
  Text: #374151 (gray-700)
  
Selected:
  Background: #DBEAFE (blue-100)
  Text: #1E40AF (blue-700)
  Hover: #BFDBFE (blue-200)
```

**Buttons:**
```
Primary (Assign):
  Background: #2563EB (blue-600)
  Text: white
  Hover: #1D4ED8 (blue-700)
  
Secondary (Cancel):
  Background: white
  Border: #D1D5DB (gray-300)
  Text: #374151 (gray-700)
  Hover Background: #F9FAFB (gray-50)
```

**Inputs:**
```
Default:
  Border: #D1D5DB (gray-300)
  Background: white
  
Focus:
  Border: #2563EB (blue-500)
  Box-shadow: 0 0 0 3px #DBEAFE (blue-100)
  
Hover:
  Border: #9CA3AF (gray-400)
```

### Typography:

**Search Input:**
```
Font-size: 14px
Font-weight: 400
Placeholder color: #9CA3AF (gray-400)
```

**Chips:**
```
Font-size: 13px
Font-weight: 500
```

**Dropdown items:**
```
Font-size: 14px
Font-weight: 400
Line-height: 1.5
```

### Spacing:

**Consistent gaps:**
- Between toolbar items: 8-16px
- Padding inside buttons: 8px 12px
- Padding inside dropdowns: 12px
- Between dropdown items: 4px

**Consistent heights:**
- Toolbar height: 56px
- Input/button height: 40px
- Bottom bar height: 48px
- Chip height: 32px

### Shadows:

**Toolbar:**
```
box-shadow: 0 1px 3px rgba(0,0,0,0.05);
```

**Dropdowns:**
```
box-shadow: 0 4px 12px rgba(0,0,0,0.15);
```

**Popovers:**
```
box-shadow: 0 4px 12px rgba(0,0,0,0.15);
```

---

## 🔧 Technical Considerations

### State Management:

**Map Search:**
```typescript
const [mapSearchQuery, setMapSearchQuery] = useState('');
const [mapSearchResults, setMapSearchResults] = useState<Asset[]>([]);
```

**Base Map:**
```typescript
const [baseMapType, setBaseMapType] = useState<'streets' | 'satellite' | 'hybrid' | 'terrain'>('streets');
```

**Layers:**
```typescript
const [activeLayers, setActiveLayers] = useState<string[]>([
  'SewerLines_All',
  'Manholes_All',
  'HeatMap_Grades'
]);
```

**Selection:**
```typescript
const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
const [totalAssetsLoaded, setTotalAssetsLoaded] = useState(0);
```

**Assignment:**
```typescript
const [assignDialogOpen, setAssignDialogOpen] = useState(false);
const [selectedUser, setSelectedUser] = useState<User | null>(null);
```

### API Calls:

**Map Search (ESRI Database):**
```typescript
// Search entire city network
async function searchCityNetwork(query: string): Promise<Asset[]> {
  // Calls ESRI API
  // Returns all matching assets (not filtered by table)
}
```

**Create Work Orders:**
```typescript
// Assign assets to user
async function assignAssetsToUser(
  assetIds: string[], 
  userId: string,
  options?: { priority, dueDate, notes }
): Promise<WorkOrder[]> {
  // Creates work orders in table database
  // Links map assets to table
}
```

**Layer Toggle:**
```typescript
function toggleLayer(layerId: string, enabled: boolean) {
  // Updates map layer visibility
  // No API call needed (client-side)
}
```

### Performance:

**Debounce search:**
- Don't search on every keystroke
- Wait 300ms after user stops typing
- Cancel previous request if new search starts

**Optimize selection:**
- For box select with 100+ assets, show loading state
- Batch work order creation (don't create one by one)
- Limit selection to reasonable number (e.g., 50 max)

---

## 🧪 Testing Scenarios

### Map Search:
- [ ] Type in search → Autocomplete appears
- [ ] Press Enter → Map zooms to asset
- [ ] Search non-existent asset → Show "Not found" message
- [ ] Clear search → Clears input and results
- [ ] Search for inspected pipe → Shows snapshots
- [ ] Search for non-inspected pipe → Shows "Create Work Order" option

### Base Map:
- [ ] Change to Satellite → Map background changes
- [ ] Change to Hybrid → Shows satellite + labels
- [ ] Selected option shows in button label

### Layers:
- [ ] Toggle layer off → Layer disappears from map
- [ ] Toggle layer on → Layer appears on map
- [ ] Count updates correctly (3) → (2) → (3)
- [ ] Multiple layers can be toggled quickly
- [ ] Changes are instant (no Apply button needed)

### Selection:
- [ ] Click pipe → Shows [1 selected]
- [ ] Box select 5 pipes → Shows [5 selected]
- [ ] Click outside → Selection clears, chip disappears
- [ ] Click chip → Opens popover with list
- [ ] Clear selection from popover → Chip disappears

### Assignment:
- [ ] No selection → Assign button disabled
- [ ] 1+ selected → Assign button enabled
- [ ] Click user name → Creates work orders
- [ ] Toast confirmation appears
- [ ] Work orders appear in table
- [ ] Map assets now linked to table

### Edge Cases:
- [ ] Select 100+ assets → Shows reasonable limit warning
- [ ] Search while zoomed out → Zooms to asset location
- [ ] Toggle all layers off → Shows empty map with message
- [ ] Assign to offline user → Shows error, doesn't create

---

## 📋 Implementation Checklist

### Phase 1: Top Toolbar
- [ ] Replace search icon with full input field
- [ ] Add placeholder "Search city network..."
- [ ] Implement ESRI database search (not table search)
- [ ] Add clear (×) button to search
- [ ] Rename "Streets" dropdown to "Base: Streets"
- [ ] Add dropdown options (Satellite, Hybrid, Terrain)
- [ ] Move Layers to dropdown (remove permanent panel)
- [ ] Add active layer count badge
- [ ] Remove popout icon from layers

### Phase 2: Bottom Controls
- [ ] Add [X assets] status chip
- [ ] Add [X selected] status chip (when applicable)
- [ ] Make selection chip clickable
- [ ] Create selection details popover
- [ ] Group zoom controls in container
- [ ] Add [Assign to...] dropdown button
- [ ] Populate dropdown with users list
- [ ] Implement quick assign (click user name)

### Phase 3: Assignment Feature
- [ ] Create work order creation API
- [ ] Link map assets to table database
- [ ] Show toast confirmation after assignment
- [ ] Update table to show new work orders
- [ ] Clear selection after successful assignment
- [ ] Add detailed "Create Work Order" dialog
- [ ] Include priority, due date, notes fields

### Phase 4: Polish
- [ ] Add loading states for search
- [ ] Add empty states (no results, no selection)
- [ ] Keyboard shortcuts (Escape to clear selection)
- [ ] Responsive layout for tablet/mobile
- [ ] Smooth animations for dropdowns
- [ ] Error handling and user feedback
- [ ] Accessibility (ARIA labels, keyboard nav)

---

## 🚫 What NOT to Do

**Don't add:**
- ❌ Settings (⚙️) button - not needed for MVP
- ❌ Export map feature - no one asked for it
- ❌ Map preferences - overcomplicates UI
- ❌ Apply button for layers - instant toggle is better
- ❌ Permanent layers panel - wastes space
- ❌ Combine map and table search - they're different databases

**Don't change:**
- ✅ Table search (keep separate)
- ✅ Existing zoom controls (just group them)
- ✅ Box select tool (works fine)
- ✅ Heat map visualization (keep as is)

---

## 🎯 Success Criteria

After this redesign, users should be able to:

✅ **Clearly distinguish map search from table search**
- Full input field makes it obvious
- Placeholder text explains purpose

✅ **See selection status at a glance**
- Status chips always visible
- No guessing how many assets selected

✅ **Quickly assign work to team members**
- Two clicks: Select assets → Click user name
- Bridges map and table databases

✅ **Manage layers efficiently**
- Dropdown scales to any number of layers
- Doesn't clutter interface
- Instant feedback on toggle

✅ **Understand what each control does**
- Clear labels: "Base: Streets", "Layers (3)"
- Obvious purpose for each element

---

## 📚 Key Takeaways

**The "Command Center" approach:**
1. **Top toolbar** = Input/Configuration (Search, Base Map, Layers)
2. **Map area** = Main workspace (Visual focus)
3. **Bottom bar** = Status/Actions (What's selected, what can I do)

**Core principle:**
Map is not just for viewing - it's a **work interface** where users:
- Find assets across entire city network
- Select what needs work
- Assign to team members
- Bridge map database with work order system

**Critical feature:**
Assignment functionality solves the #1 pain point: "Asset is on map but not in my table yet. I need to create work for it."

This redesign transforms the map from passive viewer to active command center. 🎯