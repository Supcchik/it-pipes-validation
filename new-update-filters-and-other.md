# Core Vision Asset List - Prototype Update Instructions

## 📋 Overview
This document contains detailed implementation instructions for updating the Core Vision Asset List interactive prototype based on client feedback from meetings on December 3rd and 5th, 2025. Focus on implementing 13 critical and important updates that will significantly improve the UX.

**Current Tech Stack:**
- React with TypeScript
- shadcn/ui components
- Tailwind CSS
- Next.js

**Priority:** Implement Critical (10) and Important (3) updates only. Nice-to-have features are documented but not in current scope.

---

## 🔴 CRITICAL UPDATES (Must-have for MVP)

### 1. Quick Actions - Fixed Floating Column

**Current Problem:**
The Quick Actions column (Edit, View Details, Duplicate, Delete) scrolls horizontally with the table and becomes hidden when the table is wide. Users have to scroll to find these essential actions.

**Required Solution:**
Implement a fixed floating column on the right side of the table that remains visible regardless of horizontal scroll position.

**Technical Implementation:**
```
Table Structure:
├── Scrollable columns area (left side)
│   ├── Checkbox column (if selecting)
│   ├── All data columns (Pipe Segment, Street, Material, etc.)
│   └── Horizontal scroll enabled
│
└── Fixed Quick Actions column (right side)
    ├── Always visible (position: sticky or fixed)
    ├── Does not scroll with table
    ├── Contains: Edit, View Details, Duplicate, Delete
    └── Kebab menu (three dots) for actions
```

**Visual Specifications:**
- Column width: 60px (just enough for kebab icon)
- Background: white with subtle border-left
- Z-index: Higher than scrollable content
- Shadow: Subtle left shadow when content scrolls behind it
- Sticky position: `right: 0`
- Height: Matches row height exactly

**Interaction Details:**
- Click kebab menu → Dropdown appears with actions
- Actions in dropdown: Edit, View Details, Duplicate, Delete
- Dropdown appears below icon (or above if near bottom)
- Click outside closes dropdown
- Hover state on kebab icon

**Reference Design System Pattern:**
Look at shadcn/ui Data Table with sticky columns. Implement similar pattern but specifically for actions column.

**Client Quote:**
> "It shouldn't be in the end, it should be like here, just floating row. Yeah, so we will use our design system in this table." (03.12.2025, 49:33-50:11)

---

### 2. Table Editing - Auto-save on Enter

**Current Problem:**
When editing a cell in the table, users must click a separate Save button that is hidden and not intuitive. The Save button placement is confusing.

**Required Solution:**
Implement auto-save functionality that triggers on Enter key press or on blur (clicking outside the field).

**Technical Implementation:**

**Edit Mode Trigger:**
- Double-click on editable cell → enters edit mode
- Or click Edit from Quick Actions → entire row becomes editable

**Save Triggers:**
1. User presses Enter → auto-save + exit edit mode
2. User clicks outside field (blur) → auto-save + exit edit mode
3. User presses Escape → cancel edit + exit edit mode (no save)

**Visual Feedback:**
- Editing state: Cell has blue border + focus ring
- Saving state: Brief loading spinner (200ms max)
- Saved state: Green checkmark appears briefly (500ms)
- Error state: Red border + error message below cell

**Field Validation:**
- Validate on save attempt
- If invalid: show error, keep in edit mode, don't save
- If valid: save immediately, exit edit mode

**API Call Pattern:**
```typescript
// Pseudo-code for save behavior
async function handleCellSave(rowId: string, field: string, newValue: any) {
  // 1. Validate
  const isValid = validateField(field, newValue);
  if (!isValid) {
    showError(field);
    return;
  }
  
  // 2. Optimistic update
  updateLocalState(rowId, field, newValue);
  
  // 3. API call
  try {
    await api.updateAsset(rowId, { [field]: newValue });
    showSuccessIndicator();
  } catch (error) {
    // Rollback on error
    revertLocalState(rowId, field);
    showErrorMessage(error);
  }
}
```

**Remove:**
- Separate Save button in row
- Any explicit save/cancel buttons for inline editing

**Client Quote:**
> "It should be auto-saving when you click enter." (03.12.2025, 47:27)

---

### 3. Bulk Action: "Open Compare" (Replace "Open in tabs")

**Current Problem:**
The "Open in tabs" bulk action is not as useful as expected. Users actually need to compare two inspections side-by-side.

**Required Solution:**
Replace "Open in tabs" with "Open compare" functionality.

**Functionality:**

**Button Behavior:**
- Visible in floating action bar (appears when rows selected)
- ONLY enabled when exactly 2 rows selected
- Disabled (grayed out) when 0, 1, or 3+ rows selected
- Tooltip on hover: "Select exactly 2 inspections to compare"

**When Clicked:**
1. Take the 2 selected inspection IDs
2. Navigate to Inspection Viewer route
3. Automatically open in compare mode
4. No intermediate steps or modals

**Floating Action Bar Updates:**
```
Current actions: [Assign] [Edit] [Delete] [Open in tabs] [Export]
New actions:     [Assign] [Edit] [Delete] [Open Compare] [Export]
                                          ↑ replaces "Open in tabs"
```

**Visual States:**

Disabled state (0, 1, or 3+ selected):
- Button grayed out (opacity: 0.5)
- Cursor: not-allowed
- Tooltip: "Select exactly 2 inspections"

Enabled state (2 selected):
- Button full color (blue/primary)
- Cursor: pointer
- Tooltip: "Open comparison view"

**Navigation Pattern:**
```typescript
// Pseudo-code
function handleOpenCompare(selectedIds: string[]) {
  if (selectedIds.length !== 2) return;
  
  const [inspection1, inspection2] = selectedIds;
  
  // Navigate to comparison view
  router.push(`/inspection-viewer?mode=compare&current=${inspection1}&previous=${inspection2}`);
}
```

**Client Reaction:**
> "It will be really, really cool. Yeah, I didn't have any words, and it's a really cool idea." (03.12.2025, 53:00)

---

### 4. Find & Replace - Scope Updates

**Current Problem:**
The Find & Replace modal only has "Selection" and "Entire project" scopes. Missing the current filtered view scope, and the naming is confusing.

**Required Solution:**
Add "Entire view" scope and improve the interface.

**Updated Scope Options:**

1. **Selection** (unchanged)
   - Label: "Selected rows"
   - Description: "Apply to currently selected rows only"
   - Count: Show "X rows selected"

2. **Entire view** (NEW)
   - Label: "Entire view"
   - Description: "Apply to all rows in current filtered view"
   - Count: Show "Y rows in view"

3. **Project** (renamed from "Entire project")
   - Label: "Project"
   - Description: "Apply to all assets in project"
   - Count: Show "Z total assets"

**Visual Layout:**
```
┌─────────────────────────────────────────┐
│  Find & Replace                    [X]  │
├─────────────────────────────────────────┤
│                                         │
│  Find what:                             │
│  ┌───────────────────────────────────┐  │
│  │ [typeahead search field]          │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Replace with:                          │
│  ┌───────────────────────────────────┐  │
│  │ [typeahead search field]          │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Scope:                                 │
│  ┌─────────────────────────────────────┐│
│  │ ○ Selected rows (3 selected)       ││
│  │ ● Entire view (24 in view)         ││
│  │ ○ Project (156 total assets)       ││
│  └─────────────────────────────────────┘│
│                                         │
│  Project: (if "Project" scope selected) │
│  ┌───────────────────────────────────┐  │
│  │ [dropdown with typeahead]         │  │
│  └───────────────────────────────────┘  │
│                                         │
│         [Cancel]  [Find & Replace]      │
└─────────────────────────────────────────┘
```

**Typeahead Implementation:**

**For "Find what" and "Replace with" fields:**
- As user types, show suggestions from existing values
- Suggestions come from the selected scope
- Example: If field is "Material", show: PVC, Clay, Concrete, etc.
- Max 8 suggestions visible
- Keyboard navigation: Arrow keys + Enter to select

**For "Project" dropdown:**
- Searchable dropdown (combobox pattern)
- User can type to filter project list
- Shows all accessible projects
- Alphabetically sorted

**Client Quote:**
> "The only other selection I would have is current filtered view. Entire view, yeah, it would be better." (03.12.2025, 36:54)

---

### 5. Snapshots Panel on Single-Select

**Current Problem:**
Users expect that clicking a single row will show a quick preview of snapshots without opening the full inspection. Currently this doesn't happen.

**Required Solution:**
Implement a snapshots panel that appears when a single row is selected, showing quick preview of observations.

**Trigger Behavior:**
- User single-clicks on any row in table
- Row becomes selected (highlighted)
- Map automatically navigates to that asset location
- Snapshots panel appears above the map

**Panel Layout:**

```
┌────────────────────────────────────────────┐
│  Table (70% width)                         │
│  [Always fully visible]                    │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│  Snapshots Panel (30% width, pushes map up)│
│  ┌──────────────────────────────────────┐ │
│  │ Pipe Segment S-104        [Close X]  │ │
│  ├──────────────────────────────────────┤ │
│  │ Visible Grades: ●0-1 ●2 ●3 ●4 ●5    │ │
│  ├──────────────────────────────────────┤ │
│  │ ┌────┐  ┌────┐  ┌────┐  ┌────┐     │ │
│  │ │img │  │img │  │img │  │img │     │ │
│  │ │12' │  │24' │  │36' │  │48' │     │ │
│  │ │TBD │  │CRK │  │CRK │  │TBD │     │ │
│  │ └────┘  └────┘  └────┘  └────┘     │ │
│  │ [Horizontal scroll if more]        │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│  Map (30% width, reduced height)           │
│  [Asset highlighted, plot points visible]  │
└────────────────────────────────────────────┘
```

**Panel Specifications:**

**Header:**
- Asset name/ID (e.g., "Pipe Segment S-104")
- Close button (X) on right side
- Background: Light gray
- Border: Bottom border only

**Visible Grades Filter:**
- Checkbox group: Grades 0, 1, 2, 3, 4, 5
- Checked by default: All grades
- When unchecked, snapshots with that grade are hidden
- Updates immediately on change

**Snapshots Grid:**
- Each snapshot card contains:
  - Thumbnail image (120x90px)
  - Distance (e.g., "12'")
  - Code (e.g., "TBD")
  - Grade indicator (colored dot)
- Horizontal scroll for overflow
- Gap between cards: 12px
- 4 visible at once, scroll for more

**Interaction:**
- Click snapshot → Opens full inspection at that observation
- Click Close (X) → Panel disappears, deselect row
- Select different row → Panel updates with new asset's snapshots
- Deselect row → Panel disappears

**Map Integration:**
When panel appears:
1. Map height reduces by panel height (~200px)
2. Map stays fully functional (pan, zoom, select)
3. Selected asset is highlighted on map
4. Plot defect points appear on the selected pipe segment

**Responsive Behavior:**
- Panel must not block table (table always fully visible)
- Panel takes space from map, not table
- If screen too small (<768px), panel appears as modal overlay

**Data Requirements:**
```typescript
interface SnapshotData {
  id: string;
  distance: number; // in feet
  code: string; // PACP/NASSCO code
  codeDescription?: string; // Full name of code
  grade: 0 | 1 | 2 | 3 | 4 | 5;
  thumbnailUrl: string;
  inspectionId: string;
}
```

**Client Quote:**
> "When I select a pipe, it will navigate me to that pipe on the map and show me a pop-up of my snapshots. Selecting and having it navigate here is a crucial one." (05.12.2025, 0:53)

---

### 6. Plot Defects on Map

**Current Problem:**
When an asset is selected, the map only highlights the pipe segment but doesn't show WHERE along the pipe the defects are located.

**Required Solution:**
Display plot points/markers on the selected pipe segment showing the exact location of each defect observation.

**Visual Implementation:**

**Plot Point Specifications:**
- Shape: Small circle (8px diameter)
- Position: Overlaid on pipe segment at exact footage location
- Color: Based on grade severity
  - Grade 0-1: Green (#10b981)
  - Grade 2: Yellow (#fbbf24)
  - Grade 3: Orange (#f97316)
  - Grade 4-5: Red (#ef4444)
- Border: 1px white border for contrast
- Z-index: Above pipe, below controls

**Behavior:**
1. User selects asset in table
2. Map navigates to asset
3. Pipe segment highlights (current behavior)
4. Plot points appear along the pipe showing defects

**Hover Interaction:**
- Hover over plot point → Tooltip appears
- Tooltip shows:
  - Distance (e.g., "12.5 feet")
  - Code (e.g., "CRK")
  - Grade (e.g., "Grade 3")
  - Quick thumbnail preview (optional)

**Click Interaction:**
- Click plot point → Opens inspection at that specific observation
- Or: Opens snapshots panel with that observation highlighted

**Filtering Integration:**
- Plot points respect Visible Grades filter
- If Grade 3 unchecked, Grade 3 points hidden
- Updates in real-time when filter changes

**Data Structure:**
```typescript
interface PlotPoint {
  id: string;
  distance: number; // Distance along pipe in feet
  code: string;
  grade: 0 | 1 | 2 | 3 | 4 | 5;
  lat: number; // Calculated from pipe geometry + distance
  lng: number;
  observationId: string;
}
```

**Calculation Logic:**
```typescript
// Pseudo-code for positioning plot points
function calculatePlotPosition(
  pipeStartCoords: {lat, lng},
  pipeEndCoords: {lat, lng},
  pipeLength: number,
  observationDistance: number
): {lat, lng} {
  // Linear interpolation along pipe segment
  const ratio = observationDistance / pipeLength;
  return {
    lat: pipeStartCoords.lat + (pipeEndCoords.lat - pipeStartCoords.lat) * ratio,
    lng: pipeStartCoords.lng + (pipeEndCoords.lng - pipeStartCoords.lng) * ratio
  };
}
```

**Performance Consideration:**
- If >50 plot points, show aggregated clusters at zoomed-out view
- Expand to individual points when zooming in
- Use map clustering library (e.g., Supercluster)

**Client Quote:**
> "These plot points of visible grades, which these plot points actually go into a heat map, so you can kind of see that this is showing where a lot of defects are." (05.12.2025, 1:49)

---

### 7. Map Search (Separate from Table Search)

**Current Problem:**
There's only one search that searches the table data (inspections/work orders). But users also need to search the entire city pipe network on the map, which is a separate database.

**Required Solution:**
Add a dedicated search box for the map that searches the full asset network, not just assets in the current table.

**Two Separate Searches:**

**1. Table Search (existing):**
- Location: Top toolbar, left side
- Searches: Only assets/inspections in current project/view
- Placeholder: "Search table..."
- Searches fields: Pipe Segment, Street, Material, Certificate, etc.

**2. Map Search (NEW):**
- Location: Map controls area, top-right of map
- Searches: Entire city's pipe network (ESRI data)
- Placeholder: "Search map network..."
- Searches fields: Asset ID, Manhole numbers, Address

**Map Search Layout:**

```
┌─────────────────────────────────────┐
│  Map Area                      [🔍] │ ← Search icon
│  ┌──────────────────────────────┐   │
│  │ [Layers] [Zoom] [Tools]      │   │
│  │                              │   │
│  │                              │   │
│  │         Map Content          │   │
│  │                              │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘

When search icon clicked:
┌─────────────────────────────────────┐
│  Map Area                           │
│  ┌──────────────────────────────┐   │
│  │ ┌────────────────────────┐   │   │
│  │ │ Search map network...  │   │   │
│  │ └────────────────────────┘   │   │
│  │ ┌────────────────────────┐   │   │
│  │ │ S-104                  │   │   │
│  │ │ S-105 (Main St)        │   │   │
│  │ │ Manhole MH-234        │   │   │
│  │ └────────────────────────┘   │   │
│  │         Map Content          │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Search Functionality:**

**User Types Query:**
- Shows live results dropdown
- Max 10 results shown
- Results from ESRI database (city's full network)
- Includes assets NOT in current table

**Result Selection:**
1. User clicks result
2. Map navigates to that location
3. Asset highlights on map
4. If asset exists in table → also highlights row
5. If asset NOT in table → Show "Create Work Order" option

**Use Case Example:**
```
User searches "MH-234" in map search
→ Finds manhole in city network
→ Manhole highlighted on map
→ Asset doesn't exist in current project table
→ Shows button: "Create Work Order for MH-234"
→ User can add it to their project
```

**Technical Implementation:**
```typescript
// Two separate search functions

// Table search - existing
async function searchTable(query: string): Promise<Asset[]> {
  // Searches current project/view only
  return api.searchProjectAssets(projectId, query);
}

// Map search - NEW
async function searchMap(query: string): Promise<NetworkAsset[]> {
  // Searches entire city network via ESRI
  return esriApi.searchNetwork(query);
}
```

**Visual Differentiation:**
- Table search icon: Magnifying glass (gray)
- Map search icon: Magnifying glass with map pin (blue)
- Different styling to make clear they're separate

**Client Quote:**
> "There's a search for the data table and then there's a search for the map table, these do not always have the same information in them. It's frequent. This table only shows inspections or work orders that are open or have been completed. This has the city's entire data set network in there." (05.12.2025, 11:00)

---

### 8. Views vs Filters - Conceptual Model

**Current Problem:**
The relationship between Views and Filters is unclear in the current prototype. Users and developers need clarity on how these concepts relate.

**Required Solution:**
Clarify and implement the conceptual model where Views contain both column configuration AND filters.

**Conceptual Model:**

```
VIEW = Column Configuration + Filters + Sort Order
       ↓                      ↓         ↓
    Which columns          Which data  How ordered
    to display             to show
```

**What is a View:**
A View is a saved configuration that includes:
1. **Column Selection**: Which columns are visible/hidden
2. **Column Order**: Left-to-right arrangement
3. **Filters Applied**: Pre-applied filter conditions
4. **Sort Order**: Default sort configuration
5. **View Name**: User-defined name
6. **View Type**: Personal or Shared

**What are Filters:**
Filters can exist in two states:
1. **Part of View Definition**: Permanently saved in the View
2. **Ad-hoc/Temporary**: Applied on top of View, not saved

**Example:**

```
View: "NASSCO Check"
├── Columns: [Pipe Segment, Material, Width, Grade, Status]
├── Filters: [Grade >= 3, Status = "Needs Review"]
├── Sort: Grade descending
└── Type: Shared (Company-wide)

User opens "NASSCO Check" view:
✓ Sees only specified columns
✓ Data pre-filtered to Grade >= 3 AND Status = "Needs Review"
✓ Sorted by Grade (highest first)

User can then add temporary filter:
+ Material = "PVC" (not saved to view)

Result: All View filters + temporary PVC filter
```

**Implementation in UI:**

**Creating a View:**
```
┌────────────────────────────────────────┐
│  Create New View                       │
├────────────────────────────────────────┤
│                                        │
│  View Name: ___________________        │
│                                        │
│  Columns: (Select which to display)   │
│  ☑ Pipe Segment  ☑ Material           │
│  ☑ Width         ☑ Grade              │
│  ☐ Certificate   ☐ Surveyed By        │
│                                        │
│  Filters: (Pre-apply to this view)    │
│  ┌──────────────────────────────────┐ │
│  │ Grade >= 3                       │ │
│  │ Status = "Needs Review"          │ │
│  └──────────────────────────────────┘ │
│  [+ Add Filter]                        │
│                                        │
│  Sort: Grade ▼ Descending              │
│                                        │
│  Share with:                           │
│  ○ Personal (only me)                  │
│  ● Company-wide                        │
│                                        │
│         [Cancel]  [Create View]        │
└────────────────────────────────────────┘
```

**Active View Indicator:**
```
Currently viewing: NASSCO Check ⚙️
Active filters:
  • Grade >= 3 (from view)
  • Status = "Needs Review" (from view)
  • Material = "PVC" (temporary) [x remove]
```

**Key Behaviors:**

**When switching Views:**
- All temporary filters cleared
- View's saved filters applied
- Column configuration changes
- Sort order resets to View's default

**When applying temporary filter:**
- Added on top of View's filters (AND logic)
- Indicated as "temporary" (different color/icon)
- Can be removed without affecting View
- NOT saved when switching Views

**When editing a View:**
- Can modify columns, filters, sort
- If View is shared: triggers notification to other users
- Personal Views: changes only affect you

**Client Quote:**
> "Are the views an arrangement with a filter applied to it? I want it to be set up with these 10 columns, and I only want these columns to display this information, like only the materials that are PVC, and that is a view." (03.12.2025, 16:24)

---

### 9. AND/OR Grouping for Filters (Visual Block Builder)

**Current Problem:**
Users can create filters with AND/OR logic, but they cannot GROUP filters with parentheses to create complex conditions. Like in math, you need order of operations.

**Required Solution:**
Create a visual block builder that allows users to create grouped filter conditions with clear visual representation of AND/OR logic.

**Conceptual Example:**

**What we need to support:**
```
(Material = PVC AND Width = 12)
OR
(Material = Clay AND Grade >= 3)
```

This is different from:
```
Material = PVC AND Width = 12 OR Material = Clay AND Grade >= 3
(which would be ambiguous)
```

**Visual Block Builder Design:**

```
┌─────────────────────────────────────────────────┐
│  Advanced Filters                               │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─── Group 1 ────────────────────────────┐    │
│  │  Material = PVC                         │    │
│  │  AND                                    │    │
│  │  Width = 12                             │    │
│  │                        [+ Add] [Delete] │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ◉ OR  ○ AND                                   │
│                                                 │
│  ┌─── Group 2 ────────────────────────────┐    │
│  │  Material = Clay                        │    │
│  │  AND                                    │    │
│  │  Grade >= 3                             │    │
│  │                        [+ Add] [Delete] │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  [+ Add Group]                                  │
│                                                 │
│         [Cancel]  [Apply Filters]               │
└─────────────────────────────────────────────────┘
```

**Detailed UI Elements:**

**Group Block:**
- Visual container with border and background color
- Header shows "Group 1", "Group 2", etc.
- Delete button in top-right of group
- Drag handle to reorder groups (optional)

**Conditions Within Group:**
- Each condition on separate line
- Dropdown for field (Material, Width, Grade, etc.)
- Dropdown for operator (=, !=, >, <, >=, <=, contains)
- Input for value (text, number, or dropdown depending on field)
- AND/OR selector between conditions (default AND within group)
- "+ Add" button to add condition to group

**Between Groups:**
- Radio button selector: OR vs AND
- Visual connector line showing relationship
- Default: OR between groups

**Visual Hierarchy:**

```
Level 1: Groups (Outlined boxes)
  └── Level 2: Conditions within group (Lines)
      └── Level 3: Field/Operator/Value (Inline)

Color Coding:
- Group 1: Light blue background
- Group 2: Light green background  
- Group 3: Light yellow background
- etc.
```

**Interaction Flow:**

1. **User clicks "Advanced Filters"**
   - Opens modal with block builder

2. **Default State:**
   - One empty group shown
   - "+ Add Group" button visible

3. **Adding Conditions:**
   - Click "+ Add" in group
   - New condition row appears
   - Select field → operator → value
   - AND automatically inserted between conditions

4. **Adding Groups:**
   - Click "+ Add Group"
   - New group block appears below
   - OR/AND selector appears between groups

5. **Deleting:**
   - Delete condition: Click X on condition row
   - Delete group: Click Delete in group header
   - Confirmation for group deletion if it has conditions

6. **Applying:**
   - Click "Apply Filters"
   - Builder translates to query
   - Results update
   - Active filters badge shows count

**Active Filters Display:**

After applying complex filters:
```
Active Filters: 2 groups
┌─────────────────────────────────────────┐
│ (Material = PVC AND Width = 12)         │
│ OR                                      │
│ (Material = Clay AND Grade >= 3)        │
│                               [Edit] [x]│
└─────────────────────────────────────────┘
```

**Technical Implementation Notes:**

**Data Structure:**
```typescript
interface FilterGroup {
  id: string;
  conditions: FilterCondition[];
  operator: 'AND' | 'OR'; // between conditions within group
}

interface FilterCondition {
  id: string;
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains';
  value: any;
}

interface ComplexFilter {
  groups: FilterGroup[];
  groupOperator: 'AND' | 'OR'; // between groups
}
```

**Query Translation:**
```typescript
// Pseudo-code
function buildQuery(filter: ComplexFilter): string {
  const groupQueries = filter.groups.map(group => {
    const conditions = group.conditions.map(c => 
      `${c.field} ${c.operator} ${c.value}`
    ).join(` ${group.operator} `);
    return `(${conditions})`;
  });
  
  return groupQueries.join(` ${filter.groupOperator} `);
}

// Result: "(Material = PVC AND Width = 12) OR (Material = Clay AND Grade >= 3)"
```

**Client Quote:**
> "We do have and or statements, but we can't group and or statements. So you know how in math, there's order of operations, you have to do what's in the parentheses first, and then you can go outward. We need a way to get an order of operations for filtering. I will think how to make it visually easy to understand. And it will be like, just small blocks, you drag them pretty much in." (03.12.2025, 22:45 - 24:09)

---

### 10. Rename "Template" → "Existing Tab" in Create View Modal

**Current Problem:**
The word "Template" is already used in ITpipes to refer to database structure templates. Using the same term for View templates will confuse low-capacity users.

**Required Solution:**
Rename "Template" to "Existing Tab" or similar alternative throughout the Create View flow.

**Current UI (WRONG):**
```
Create New View
─────────────────
Start from:
○ Blank
○ Template: NASSCO Check
○ Template: Material Check
```

**Updated UI (CORRECT):**
```
Create New View
─────────────────
Start from:
○ Blank
○ Existing tab: NASSCO Check
○ Existing tab: Material Check
```

**Alternative Naming Options:**
1. "Existing tab" (RECOMMENDED)
2. "Copy from existing view"
3. "Start from saved view"
4. "Use existing setup"

**Places to Update:**

1. **Create View Modal Header**
   - Before: "Select Template"
   - After: "Select Starting Point"

2. **Radio Button Labels**
   - Before: "Use Template"
   - After: "Use Existing Tab"

3. **Dropdown Placeholder**
   - Before: "Select a template..."
   - After: "Select an existing tab..."

4. **Help Text**
   - Before: "Templates are pre-configured views"
   - After: "Copy column and filter settings from existing tabs"

5. **Button Text**
   - Keep: "Create from Blank" (unchanged)
   - Change: "Create from Template" → "Create from Existing"

**Visual Example:**

```
┌─────────────────────────────────────────┐
│  Create New View                 [X]    │
├─────────────────────────────────────────┤
│                                         │
│  How do you want to start?              │
│                                         │
│  ○ Start from blank                     │
│    Create a new view from scratch       │
│                                         │
│  ● Use existing tab                     │
│    Copy settings from another view      │
│    ┌─────────────────────────────────┐  │
│    │ NASSCO Check              ▼     │  │
│    └─────────────────────────────────┘  │
│                                         │
│  Pre-made setups:                       │
│  ┌─────────────────────────────────┐   │
│  │ [📋 Material Check    ]         │   │
│  │ [📋 Grade Review      ]         │   │
│  │ [📋 Inspection Status ]         │   │
│  └─────────────────────────────────┘   │
│                                         │
│         [Cancel]  [Continue]            │
└─────────────────────────────────────────┘
```

**Terminology Consistency:**

**Always use:**
- "Tab" or "View" when referring to saved views
- "Existing tab" when copying from another view
- "Pre-made setup" for system-provided starting points

**Never use:**
- "Template" (reserved for database structure)
- "Preset" (can be confusing)
- "Copy" as noun (use as verb only: "Copy from...")

**Client Quote:**
> "Template is the name of what is used to create the database structure. And so it might be confusing. I'm thinking of the users, the low capacity users that will get confused by verbiage." (03.12.2025, 4:47 - 5:51)

---

## 🟡 IMPORTANT UPDATES (Should-have)

### 11. Report Generation - Preview Flow

**Current Problem:**
Users can generate PDF reports but have no way to preview or adjust what's included before generating. The current system shows a huge display screen but "doesn't let you do anything from there."

**Required Solution:**
Add a preview step before PDF generation where users can see and adjust report contents.

**Report Generation Flow:**

```
Step 1: Configure Report Scope
       ↓
Step 2: Select Report Contents
       ↓
Step 3: Preview Report (NEW)
       ↓
Step 4: Generate PDF
```

**Step 3: Preview Flow (NEW):**

```
┌──────────────────────────────────────────────┐
│  Report Preview                    [X]       │
├──────────────────────────────────────────────┤
│                                              │
│  [← Back]  Estimated: 14 pages  [Generate →]│
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │                                        │ │
│  │    [Report Preview Thumbnail]          │ │
│  │                                        │ │
│  │    Project: NASSCO Check 2024          │ │
│  │    Date: Dec 10, 2025                  │ │
│  │                                        │ │
│  │    Executive Summary...                │ │
│  │    24 assets inspected                 │ │
│  │    3 critical issues found             │ │
│  │                                        │ │
│  │    [Page 1 of 14]                      │ │
│  │                                        │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Sections included:                          │
│  ☑ Cover Page                                │
│  ☑ Executive Summary                         │
│  ☑ Asset List (24 items)                     │
│  ☑ Observations Details (48 observations)    │
│  ☑ Photo Gallery (96 images)                 │
│  ☐ Compliance Standards (add?)               │
│                                              │
│  [Edit Contents]  [Generate PDF]             │
└──────────────────────────────────────────────┘
```

**Preview Features:**

1. **Thumbnail Preview**
   - Shows first page of report
   - Scrollable to see more pages (up to 5)
   - Click to see full-page preview

2. **Metadata Display**
   - Project name
   - Date range
   - Number of assets/observations included
   - Estimated page count
   - Estimated file size

3. **Section Checklist**
   - Shows all possible sections
   - Checkboxes to include/exclude
   - Shows item counts (e.g., "24 assets", "48 observations")
   - Can add optional sections

4. **Actions**
   - "Edit Contents": Go back to configuration
   - "Generate PDF": Proceed to generation

**After Generation:**
```
┌──────────────────────────────────────────┐
│  Report Generated Successfully   ✓       │
├──────────────────────────────────────────┤
│                                          │
│  NASSCO_Check_2024_Report.pdf            │
│  14 pages • 3.2 MB                       │
│  Generated: Dec 10, 2025 at 2:34 PM      │
│                                          │
│  [Download]  [Open]  [Share Link]        │
│                                          │
└──────────────────────────────────────────┘
```

**Technical Implementation:**

```typescript
interface ReportPreview {
  metadata: {
    projectName: string;
    dateRange: { start: Date; end: Date };
    assetCount: number;
    observationCount: number;
    estimatedPages: number;
    estimatedSizeMB: number;
  };
  sections: ReportSection[];
  thumbnailUrl: string; // First page preview
}

interface ReportSection {
  id: string;
  name: string;
  included: boolean;
  itemCount?: number;
  optional: boolean;
}
```

**Generation Progress:**
```
Generating Report...
[████████████░░░░░░░░] 60%

✓ Cover page generated
✓ Executive summary generated
⏳ Rendering asset details...
  Rendering photo gallery...
  Finalizing PDF...
```

**Client Quote:**
> "Should we allow to preview this report? I like that. I like that idea. Because right now our product just gives you a huge display screen, but doesn't let you do anything from there." (03.12.2025, 35:06 & 25.11.2025, 13:58)

---

### 12. Map Layers - Hide/Pop-out Management

**Current Problem:**
Some clients have 20+ layers displayed on the map. When shown side-by-side, they block the map view and there's no way to manage them efficiently.

**Required Solution:**
Add ability to hide layers panel and pop it out to a separate window for multi-monitor setups.

**Layers Panel Current State:**
```
┌─────────────────────────────────┐
│  Map                            │
│  ┌────────┬──────────────────┐  │
│  │ Layers │  Map Content     │  │
│  │────────│                  │  │
│  │ □ L1   │                  │  │
│  │ ☑ L2   │                  │  │
│  │ ☑ L3   │    (blocks       │  │
│  │ □ L4   │     view)        │  │
│  │ ... x20│                  │  │
│  └────────┴──────────────────┘  │
└─────────────────────────────────┘
```

**Solution 1: Collapsible Panel**

```
Collapsed State:
┌─────────────────────────────────┐
│  Map                       [▶]  │ ← Expand button
│  ┌──────────────────────────┐  │
│  │                          │  │
│  │                          │  │
│  │    Full Map View         │  │
│  │                          │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘

Expanded State:
┌─────────────────────────────────┐
│  Map                       [◀]  │ ← Collapse button
│  ┌────────┬─────────────────┐  │
│  │ Layers │  Map Content    │  │
│  │ (show) │                 │  │
│  └────────┴─────────────────┘  │
└─────────────────────────────────┘
```

**Solution 2: Multi-Column Layout (when >10 layers)**

```
┌─────────────────────────────────┐
│  Layers Panel              [↗]  │ ← Pop-out button
│  ┌─────────┬─────────┬────────┐ │
│  │ □ L1    │ ☑ L11   │ □ L21  │ │
│  │ ☑ L2    │ □ L12   │ ☑ L22  │ │
│  │ ☑ L3    │ ☑ L13   │ □ L23  │ │
│  │ □ L4    │ □ L14   │ ☑ L24  │ │
│  │ ☑ L5    │ ☑ L15   │ □ L25  │ │
│  │ ... (3 columns for 20+ layers)│
│  └─────────┴─────────┴────────┘ │
└─────────────────────────────────┘
```

**Solution 3: Pop-out Window**

Button in panel: [↗ Pop Out]

When clicked:
```
New Browser Window Opens:
┌────────────────────────────────┐
│ Layers Control     [─][□][×]  │
├────────────────────────────────┤
│  Search layers: ___________    │
│                                │
│  ☑ All Layers                  │
│  ├─ Infrastructure             │
│  │  ☑ Water Lines               │
│  │  ☑ Sewer Lines               │
│  │  □ Storm Drains              │
│  ├─ Observations                │
│  │  ☑ Grade 4-5                 │
│  │  ☑ Grade 3                   │
│  │  □ Grade 0-2                 │
│  └─ Reference                   │
│     ☑ Street Names              │
│     ☑ Property Lines            │
│     □ Elevation Contours        │
│                                │
│  [Collapse All] [Expand All]   │
└────────────────────────────────┘

Original window:
Map now uses full width, no layers panel
```

**Layer Panel Features:**

**Search/Filter:**
- Search box at top of layers panel
- Filters layers by name as you type
- Example: Type "water" → Shows only water-related layers

**Grouping:**
- Layers organized in collapsible groups
- Groups: Infrastructure, Observations, Reference, etc.
- Click group name to collapse/expand

**Bulk Actions:**
- "Show All" button
- "Hide All" button
- "Show Only Grade 4-5" (quick filter buttons)

**Visual Indicators:**
- Checkbox: Layer visible/hidden
- Eye icon: Additional visibility toggle
- Color swatch: Layer color indicator
- Count badge: Number of features in layer

**Persistence:**
- Layer visibility saved per user
- Restored on next session
- Syncs across devices (if user logged in)

**Performance:**
- Lazy load layer controls (don't render all 20+ at once)
- Virtualized list for very long layer lists
- Debounce search input

**Client Quote:**
> "Some clients have 20 plus layers. If you've got a way to hide it and then pop out the view." (03.12.2025, 1:03:36 - 1:04:21)

---

### 13. Views Sharing System + Bulk Actions

**Current Problem:**
There's no way for admins to share Views with other users, user groups, or specific projects. Also missing bulk operations for managing multiple Views at once.

**Required Solution:**
Implement comprehensive View sharing system with admin controls and bulk actions.

**View Sharing Levels:**

```
1. Personal (default)
   - Only visible to creator
   - Only creator can edit/delete

2. User Role
   - Shared with specific role (e.g., "Field Operators")
   - All users with that role can access
   - Only admin can edit

3. Specific Users
   - Select individual users to share with
   - Users can view but not edit
   - Admin controls access list

4. Project
   - Shared with all users in specific project
   - Project members can access
   - Admin controls

5. Company-wide
   - Visible to entire organization
   - All users can access
   - Only admin can edit/delete
```

**Share View Dialog:**

```
┌─────────────────────────────────────────┐
│  Share View: "NASSCO Check"      [X]    │
├─────────────────────────────────────────┤
│                                         │
│  Share with:                            │
│                                         │
│  ○ Keep personal (only me)              │
│                                         │
│  ○ User role                            │
│    ┌───────────────────────────────┐   │
│    │ Select roles...         ▼     │   │
│    │ ☑ Field Operators             │   │
│    │ ☐ Office Reviewers            │   │
│    │ ☐ Admins                      │   │
│    └───────────────────────────────┘   │
│                                         │
│  ○ Specific users                       │
│    ┌───────────────────────────────┐   │
│    │ Search users...               │   │
│    │ ☑ John Smith                  │   │
│    │ ☑ Jane Doe                    │   │
│    │ + Add more users              │   │
│    └───────────────────────────────┘   │
│                                         │
│  ● Project                              │
│    ┌───────────────────────────────┐   │
│    │ Select project...       ▼     │   │
│    └───────────────────────────────┘   │
│                                         │
│  ○ Company-wide (all users)             │
│                                         │
│  Permissions:                           │
│  ☑ Can view                             │
│  ☐ Can edit (admins only)               │
│                                         │
│         [Cancel]  [Share View]          │
└─────────────────────────────────────────┘
```

**View Sync & Updates:**

When Admin updates shared View:

```
┌─────────────────────────────────────────┐
│  Update Shared View?                    │
├─────────────────────────────────────────┤
│                                         │
│  You are updating "NASSCO Check"        │
│  which is shared with 12 users          │
│                                         │
│  Changes:                               │
│  • Added filter: Grade >= 4             │
│  • Changed columns: +Certificate        │
│  • Updated sort: Grade descending       │
│                                         │
│  ☑ Notify users of changes              │
│  ☑ Send update notification now         │
│                                         │
│         [Cancel]  [Update View]         │
└─────────────────────────────────────────┘
```

User receives notification:
```
┌─────────────────────────────────────────┐
│  View Update Available          [X]     │
├─────────────────────────────────────────┤
│                                         │
│  Admin updated "NASSCO Check" view      │
│                                         │
│  Changes:                               │
│  • Added filter: Grade >= 4             │
│  • Changed columns: +Certificate        │
│  • Updated sort: Grade descending       │
│                                         │
│  [View Changes]  [Accept]  [Decline]    │
└─────────────────────────────────────────┘
```

**Bulk Actions for Views:**

Manage Views screen:
```
┌─────────────────────────────────────────────┐
│  Manage Views                    [+ New]    │
├─────────────────────────────────────────────┤
│  ☐ Select All        [Bulk Actions ▼]      │
│                                             │
│  ☑ NASSCO Check      Personal    [⚙]       │
│  ☑ Material Review   User Role   [⚙]       │
│  ☐ Grade Analysis    Project     [⚙]       │
│  ☑ Inspection Queue  Personal    [⚙]       │
│  ☐ Quality Control   Company     [⚙]       │
│                                             │
│  3 selected                                 │
└─────────────────────────────────────────────┘

Bulk Actions Dropdown:
┌─────────────────────┐
│ Share...            │
│ Duplicate           │
│ Export              │
│ Delete              │
│ ─────────────       │
│ Assign to role...   │
│ Change project...   │
└─────────────────────┘
```

**Bulk Share Dialog:**
```
┌─────────────────────────────────────────┐
│  Bulk Share (3 views selected)   [X]    │
├─────────────────────────────────────────┤
│                                         │
│  Sharing:                               │
│  • NASSCO Check                         │
│  • Material Review                      │
│  • Inspection Queue                     │
│                                         │
│  Share with:                            │
│  ● User role                            │
│    ┌───────────────────────────────┐   │
│    │ Field Operators         ▼     │   │
│    └───────────────────────────────┘   │
│                                         │
│  ○ Specific users                       │
│  ○ Project                              │
│  ○ Company-wide                         │
│                                         │
│         [Cancel]  [Share All]           │
└─────────────────────────────────────────┘
```

**View Management Features:**

**Filter Views:**
- Show Personal only
- Show Shared only
- Show by Role
- Show by Project

**Sort Views:**
- By name
- By creator
- By last modified
- By usage count

**Search Views:**
- Search by name
- Search by creator
- Search by filters used

**View Access Indicator:**
```
View: "NASSCO Check"
┌────────────────────────────────┐
│ 👤 Shared with Field Operators │
│ 12 users have access           │
│ Last updated: 3 days ago       │
│ Created by: Admin              │
└────────────────────────────────┘
```

**Client Quote:**
> "Personal filters and company-wide filters. Share by user role, specific user, or project. Should we allow bulk actions with filters? Yeah." (03.12.2025, 12:48 - 13:56)

---

## 📚 Additional Context

### Design Consistency Guidelines

**Colors:**
- Primary: #E86F25 (Orange) - Brand color
- Secondary: #336099 (Blue) - Brand color
- Success: #10b981 (Green)
- Warning: #fbbf24 (Yellow)
- Danger: #ef4444 (Red)
- Neutral: #6c757d (Gray)

**Typography:**
- Headings: System font stack
- Body: System font stack
- Monospace: Code snippets only

**Spacing:**
- Use Tailwind spacing scale
- Consistent padding: 16px default
- Gaps: 8px, 12px, 16px, 24px

**Shadows:**
- Subtle: For cards and panels
- Medium: For modals and dropdowns
- None: For inline elements

### Testing Checklist

After implementing each update, verify:

**Functionality:**
- [ ] Feature works as described
- [ ] Edge cases handled
- [ ] Error states defined
- [ ] Loading states shown
- [ ] Success feedback provided

**UX:**
- [ ] Intuitive without explanation
- [ ] Works for non-tech-savvy users
- [ ] Clear visual feedback
- [ ] Keyboard navigation works
- [ ] Mobile responsive (if applicable)

**Performance:**
- [ ] No lag on interaction
- [ ] Handles large datasets
- [ ] Optimistic updates where possible
- [ ] Proper loading indicators

**Consistency:**
- [ ] Matches existing design patterns
- [ ] Uses Design System components
- [ ] Terminology consistent
- [ ] Behavior consistent with similar features

### Priority Implementation Order

1. **Phase 1 (Immediate):**
   - Task 1: Quick Actions fixed column
   - Task 2: Auto-save on enter
   - Task 3: Open Compare button
   - Task 4: Find & Replace scope

2. **Phase 2 (Week 1):**
   - Task 5: Snapshots panel
   - Task 6: Plot defects on map
   - Task 7: Map search

3. **Phase 3 (Week 2):**
   - Task 8: Views vs Filters model
   - Task 9: AND/OR grouping
   - Task 10: Rename Template

4. **Phase 4 (Week 3):**
   - Task 11: Report preview
   - Task 12: Map layers management
   - Task 13: Views sharing system

### Client Satisfaction Notes

**What Michaela LOVED:**
- "Everything you do turns to gold" (about quality check report)
- "Unmistakable filter view" (about active filters visibility)
- "This is awesome" (about report functionality)
- "Really cool idea" (about Open Compare feature)

**What confused Michaela:**
- Quick Actions being hidden (now fixing)
- "Entire project" vs "Entire view" scope (now fixing)
- Template terminology (now fixing)
- Snapshots blocking map (now fixing)

**Key User Principles from Client:**
- "Table should be fully visible all the time"
- "Highly utilized feature" (about map navigation)
- "It's frequent" (about map search use case)
- "Low capacity users" (remember non-tech-savvy audience)

---

## 🚀 Ready to Implement

This document contains everything needed to implement all 13 critical and important updates. Each section provides:
- Clear problem statement
- Detailed solution description
- Visual mockups/layouts
- Technical implementation notes
- Client quotes for context
- Testing considerations

Cursor should have complete understanding of what needs to be built, how it should look, and how it should behave. Focus on one task at a time, implement thoroughly, and test against the checklist before moving to the next.

**Remember:** These updates are based on direct client feedback from actual user testing. The specifications are validated and approved. Build with confidence!