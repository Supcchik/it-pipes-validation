# 🚀 CURSOR AI PROMPT: Core Vision Asset List Screen - Complete Implementation Guide

**Version:** 2.0 - Redesigned with UX Research  
**Date:** December 2, 2025  
**Status:** Ready for Implementation  

---

## 🎯 MISSION

Build the Core Vision Asset List Screen with table-first layout, intuitive toolbar organization, and advanced features based on stakeholder feedback. Every design decision is backed by user research and workflow analysis.

---

## 📐 LAYOUT STRUCTURE & UX PHILOSOPHY

### 🧠 Research-Backed Design Decisions

**Critical Insight from Stakeholder Research:**
> "Operators use **dedicated monitors for video feeds** (live inspection camera). The primary screen is for **data entry and review**, NOT video/map viewing."

This fundamental insight drives our entire layout strategy.

### Why Table LEFT, Map RIGHT (Not the Reverse)

**1. Western Reading Pattern 📖**
- Users naturally scan **left-to-right**
- Most important content should be in the **left/primary position**
- Table = primary workspace → Must be on left

**2. Frequency of Use 📊**
- Table interactions: **90% of operator time**
  - Data entry
  - Review and verification
  - Selection for bulk actions
  - Inline editing
- Map interactions: **10% of operator time**
  - Spatial context
  - Asset location
  - Quick navigation

**3. Operator Workflow Analysis 👷**
- **Typical Setup:** Video feed on second monitor (right side)
- **Main Screen:** Dedicated to data entry and table work
- **Map Role:** Provides spatial context, not primary task
- **Mental Model:** "I work in the table, I reference the map"

**4. Visual Weight = Priority 🎨**
- **70% width** for table = "This is more important"
- **30% width** for map = "This provides context"
- Size communicates priority without words

**Anti-Pattern Warning:**
❌ **OLD DESIGN:** Map-left, Table-right forces users to scan past less important content to reach their primary workspace. This breaks natural reading flow and slows down data entry.

---

## 🎨 COMPLETE VISUAL LAYOUT

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ HEADER (64px fixed, sticky top, z-index: 40)                 │ bg-white       │
│ ┌─────────────────┐                                                           │
│ │  Core Vision    │  [CityTestQA ▾]                [💬 Chat]  [👤 User Menu] │
│ │  Logo (primary) │  Project Selector                                         │
│ └─────────────────┘                                                           │
│ (ITpipes logo secondary/small in footer if needed)                           │
├────────────────────────────────────────────────────────────────────────────────┤
│ VIEW TABS (48px fixed, sticky, z-index: 30)               │ bg-neutral-50    │
│                                                                                │
│ [★ NASCO Check] [★ Report Ready] [★ Daily Check] [••• More (2) ▾]           │
│                                              [+ New View] [Manage Views →]    │
│                                                                                │
│ Visual States:                                                                │
│ • Active: border-b-2 border-orange-500, bg-white, text-orange-600            │
│ • Inactive: bg-transparent, text-neutral-600, hover:bg-neutral-100           │
│ • Favorite: Star filled (★), Non-favorite: Star outline (☆)                  │
├────────────────────────────────────────────────────────────────────────────────┤
│ TOOLBAR (56px fixed, sticky, z-index: 20)                 │ bg-white         │
│                                                                                │
│ Logical Button Grouping (left-to-right with visual separators):              │
│                                                                                │
│ [🔍]  │  [🔽 Filter] [📊 Columns]  │  [📄 Report] [⋮ More]  │        [⧉]    │
│  ↓             ↓          ↓               ↓         ↓                 ↓       │
│ Global    Table      Table          Primary    Context         Window        │
│ Search    Filters    Display         Output    Actions          Layout       │
│                                                                                │
│ Spacing: │←8px→│←──16px gap──→│←──16px gap──→│←─ml-auto─→│                 │
│                                                                                │
│ CONTEXTUAL STATE (when rows selected):                                        │
│ [🔍] │ [🔽] [📊] │ [5 selected] [Edit] [Delete] [Export] │ [📄] [⋮] │ [⧉] │
│                     ↑                                                          │
│              Orange badge with count, actions appear dynamically              │
│                                                                                │
│ Button Visual Hierarchy:                                                      │
│ • Report: bg-orange-50 hover:bg-orange-100 text-orange-600 (promoted!)       │
│ • Filter/Columns: bg-transparent hover:bg-neutral-100 text-neutral-700       │
│ • Other: bg-transparent hover:bg-neutral-100 text-neutral-600                │
├────────────────────────────────────────────────────────────────────────────────┤
│ ACTIVE FILTERS BAR (44px, conditional, z-index: 15)       │ bg-orange-50     │
│ Only visible when filters.length > 0                                          │
│                                                                                │
│ Filters: [Material="PVC" ×] [Width>10 ×] [+2 more ▾] ───────  [View all →]  │
│           ↑                              ↑                       ↑             │
│     Dismissible chips          Dropdown shows rest    Opens Filter dialog    │
│                                                                                │
│ Design: Orange theme, max 3 chips visible, rest in dropdown                  │
│ Interaction: Click × to remove, click chip to edit, click "View all" to open │
├────────────────────────────────────────────────────────────────────────────────┤
│ MAIN CONTENT AREA (flex-1, fills remaining height)        │ bg-neutral-50    │
│                                                                                │
│ ┌─────────────────────────────────────────┬────────────────────────────────┐ │
│ │ DATA TABLE (70% default, 50-85% range) │ MAP PANEL (30%, 15-50% range) │ │
│ │ bg-white, rounded-lg, shadow-sm         │ bg-white, rounded-lg          │ │
│ │                                          │                               │ │
│ │ STICKY HEADER (48px, bg-neutral-50):    │ ┌───────────────────────────┐ │ │
│ │ ┌────────────────────────────────────┐  │ │ [🔍+] [🔍-] [📍] [≡]      │ │ │
│ │ │☐│PIPE│STREET│UPSTREAM│MATERIAL│⋮│   │  │ │ Zoom  Zoom Locate Layers  │ │ │
│ │ └────────────────────────────────────┘  │ └───────────────────────────┘ │ │
│ │ Sortable columns, click header to sort  │                               │ │
│ │                                          │ ┌───────────────────────────┐ │ │
│ │ SCROLLABLE ROWS (56px each):            │ │                           │ │ │
│ │ ┌────────────────────────────────────┐  │ │    ESRI Map Integration   │ │ │
│ │ │☐│ML-001│Main St│MH-100│PVC│12│⋮│   │  │ │                           │ │ │
│ │ │☐│ML-002│Oak Ave│MH-101│Clay│8│⋮│   │  │ │  [Asset markers]         │ │ │
│ │ │☐│ML-003│Elm St│MH-102│Concrete│15│⋮││ │ │  [Selected highlighted]   │ │ │
│ │ │☐│ML-004│St 4│MH-103│PVC│8│⋮│        │  │ │  [Cluster groups]        │ │ │
│ │ │☐│ML-005│St 5│MH-104│Clay│10│⋮│      │  │ │                           │ │ │
│ │ │☐│ML-006│St 6│MH-105│Concrete│12│⋮│  │  │ │  [Zoom controls]         │ │ │
│ │ │☐│ML-007│St 7│MH-106│HDPE│15│⋮│      │  │ │  [Basemap selector]      │ │ │
│ │ │ ... (smooth scrolling, ~20 visible)    │  │ │                           │ │ │
│ │ └────────────────────────────────────┘  │ └───────────────────────────┘ │ │
│ │                                          │                               │ │
│ │ ROW INTERACTION STATES:                  │ ┌───────────────────────────┐ │ │
│ │ • Default: bg-white                      │ │ Streets ▾                 │ │ │
│ │ • Even rows: bg-neutral-50               │ │ 30 assets loaded          │ │ │
│ │ • Hover: bg-neutral-100, cursor-pointer  │ │ Zoom level: 14            │ │ │
│ │ • Selected: bg-orange-50                 │ │ Coordinates: 40.7N, 74.0W │ │ │
│ │ • Editing: bg-blue-50, border-blue-300   │ └───────────────────────────┘ │ │
│ │ • Error: bg-red-50, border-red-300       │                               │ │
│ │                                          │ MAP PURPOSE:                  │ │
│ │ CLICK BEHAVIORS:                         │ • Spatial context             │ │
│ │ • Single click row → Navigate to detail  │ • Asset selection/navigation  │ │
│ │ • Checkbox → Select for bulk actions     │ • Visual overview of spread   │ │
│ │ • Kebab (⋮) → Open actions menu          │ • NOT primary workspace       │ │
│ │ • NO double-click edit (too dangerous!)  │ • Supporting role             │ │
│ │                                          │                               │ │
│ │ KEBAB MENU ACTIONS:                      │ MAP INTERACTIONS:             │ │
│ │ • View Details (opens detail page)       │ • Click marker → Highlight +  │ │
│ │ • Edit Asset (inline edit mode)          │   scroll to table row         │ │
│ │ • Duplicate (copy with new ID)           │ • Drag → Pan map              │ │
│ │ • Delete (with confirmation)             │ • Scroll → Zoom in/out        │ │
│ │                                          │ • Click empty → Deselect all  │ │
│ └──────────────────────────────────────────┴───────────────────────────────┘ │
│                ↕ RESIZABLE SPLITTER (6px wide, hover:bg-neutral-400)          │
│               Drag handle to adjust ratio | Min 50%, Max 85% for table        │
├────────────────────────────────────────────────────────────────────────────────┤
│ PAGINATION (56px fixed, bg-white, border-t)                                   │
│                                                                                │
│ [⏮] [◀] [1] 2 3 ... 10 [▶] [⏭]      1-30 of 300 items      Show: [100 ▾]    │
│  ↑   ↑   ↑               ↑   ↑        ↑                           ↑           │
│ First Prev Active        Next Last   Range display         Items per page    │
│                                                                                │
│ Page buttons: w-8 h-8, rounded, active: bg-orange-500 text-white             │
│ Disabled: opacity-50, cursor-not-allowed                                      │
└────────────────────────────────────────────────────────────────────────────────┘

VIEWPORT HEIGHT DISTRIBUTION:
━━━━━━━━━━━━━━━━━━━━━━━
Header:         64px (5%)
View Tabs:      48px (4%)
Toolbar:        56px (4%)
Active Filters: 44px (3%, conditional)
━━━━━━━━━━━━━━━━━━━━━━━
Content Area:   ~83% (calc(100vh - 268px))
━━━━━━━━━━━━━━━━━━━━━━━
Pagination:     56px (4%)
━━━━━━━━━━━━━━━━━━━━━━━
Total:          100vh
```

---

## 🎛️ TOOLBAR IMPLEMENTATION (CRITICAL SECTION)

### Button Grouping Rationale

**Group 1: Global Search** [Leftmost]
```typescript
<Button variant="ghost" size="icon" className="w-10 h-10">
  <Search className="w-5 h-5" />
</Button>
```
**Why:**
- Icon only saves space
- Universal action (not view-specific)
- Clear affordance at edge position
- Opens advanced search dialog

**Visual Separator** 
```typescript
<div className="h-6 w-px bg-neutral-300 mx-2" />
```

**Group 2: Table Configuration** [Left-Center, MOST USED]
```typescript
<Button 
  variant="ghost" 
  className="gap-2 px-3 h-9 hover:bg-neutral-100"
  onClick={onOpenFilters}
>
  <Filter className="w-4 h-4" />
  <span className="text-sm font-medium">Filter</span>
  {activeFilters.length > 0 && (
    <Badge variant="default" className="ml-1 bg-orange-500 text-white">
      {activeFilters.length}
    </Badge>
  )}
</Button>

<Button 
  variant="ghost" 
  className="gap-2 px-3 h-9 hover:bg-neutral-100"
  onClick={onOpenColumns}
>
  <Columns className="w-4 h-4" />
  <span className="text-sm font-medium">Columns</span>
  <span className="text-xs text-neutral-500 ml-1">({visibleCount})</span>
</Button>
```
**Why:**
- Text labels for clarity (users interact constantly)
- Show active state with badges/counts
- Direct access (no dropdown friction)
- Controls what user sees in table (high frequency)

**Visual Separator**
```typescript
<div className="h-6 w-px bg-neutral-300 mx-2" />
```

**Group 3: Actions** [Center-Right]
```typescript
// REPORT BUTTON - PROMOTED (based on stakeholder feedback)
<Button 
  variant="ghost" 
  className="gap-2 px-3 h-9 text-orange-600 hover:bg-orange-50 font-medium"
  onClick={onOpenReport}
>
  <Printer className="w-4 h-4" />
  <span className="text-sm">Report</span>
</Button>

// MORE DROPDOWN - Less frequent actions
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" className="w-10 h-10">
      <MoreVertical className="w-5 h-5" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-56">
    <DropdownMenuItem onClick={onValidateInspection}>
      <FileCheck className="w-4 h-4 mr-2" />
      Validate Inspection
    </DropdownMenuItem>
    <DropdownMenuItem onClick={onFindReplace}>
      <RefreshCw className="w-4 h-4 mr-2" />
      Find & Replace
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={onExport}>
      <Download className="w-4 h-4 mr-2" />
      Export Project
    </DropdownMenuItem>
    <DropdownMenuItem onClick={onCopyToProject}>
      <Copy className="w-4 h-4 mr-2" />
      Copy to Project
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={onPrint}>
      <Printer className="w-4 h-4 mr-2" />
      Print
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```
**Why Report Promoted:**
- Stakeholder feedback: "frequently used feature"
- Generates primary output (PDF reports)
- Orange accent = visual importance
- Text label for discoverability

**Why More Dropdown:**
- Contains less-frequent actions
- Keeps toolbar clean
- Icon only (context from dropdown title)

**Auto-Spacer**
```typescript
<div className="flex-1" />  // Pushes next group to far right
```

**Group 4: Window Management** [Rightmost]
```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" className="w-10 h-10">
      <ExternalLink className="w-5 h-5" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={onPopOutMap}>
      <Map className="w-4 h-4 mr-2" />
      Pop-out Map
    </DropdownMenuItem>
    <DropdownMenuItem onClick={onPopOutTable}>
      <TableIcon className="w-4 h-4 mr-2" />
      Pop-out Table
    </DropdownMenuItem>
    <DropdownMenuItem onClick={onPopOutBoth}>
      <Maximize className="w-4 h-4 mr-2" />
      Pop-out Both
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```
**Why:**
- Different mental model (layout vs actions)
- Icon only (edge position is affordance)
- For advanced users with dual monitors

### Contextual Toolbar State

When `selectedRows.length > 0`, toolbar transforms:

```typescript
{selectedRowsCount > 0 && (
  <>
    <div className="h-6 w-px bg-neutral-300 mx-2" />
    
    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
      {selectedRowsCount} selected
    </Badge>
    
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onEditSelected}
      className="h-8 text-sm"
    >
      Edit
    </Button>
    
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onDeleteSelected}
      className="h-8 text-sm text-red-600 hover:bg-red-50"
    >
      Delete
    </Button>
    
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onExportSelected}
      className="h-8 text-sm"
    >
      Export Selected
    </Button>
  </>
)}
```

---

## 🎨 COLOR SYSTEM & DESIGN TOKENS

### Brand Colors
```css
/* Primary - Orange (Core Vision brand) */
--orange-50:  #fff7ed;
--orange-100: #ffedd5;
--orange-200: #fed7aa;
--orange-500: #f97316;  /* PRIMARY BRAND COLOR */
--orange-600: #ea580c;
--orange-700: #c2410c;

/* Neutrals - Professional Gray Scale */
--neutral-50:  #f8fafc;
--neutral-100: #f1f5f9;
--neutral-200: #e2e8f0;
--neutral-300: #cbd5e1;
--neutral-400: #94a3b8;
--neutral-600: #475569;
--neutral-700: #334155;
--neutral-900: #0f172a;
```

### Semantic Colors
```css
/* Success - Green */
--green-50:  #f0fdf4;
--green-600: #16a34a;

/* Danger - Red */
--red-50:  #fef2f2;
--red-600: #dc2626;

/* Info - Blue */
--blue-50:  #eff6ff;
--blue-600: #2563eb;

/* Warning - Yellow */
--yellow-50:  #fefce8;
--yellow-600: #ca8a04;
```

### State Colors
```typescript
const STATE_COLORS = {
  default:    'bg-white',
  hover:      'bg-neutral-100',
  selected:   'bg-orange-50 border-orange-200',
  focus:      'ring-2 ring-orange-500 ring-offset-2',
  editing:    'bg-blue-50 border-blue-300',
  error:      'bg-red-50 border-red-300',
  success:    'bg-green-50 border-green-300',
  disabled:   'opacity-50 cursor-not-allowed'
};
```

---

## 📱 RESPONSIVE BREAKPOINTS

### Desktop Large (1920px+)
**Optimal Experience**
- Table: 70% width (1344px) - Comfortable data entry
- Map: 30% width (576px) - Adequate context
- All button labels visible
- 24px spacing between groups

### Desktop Standard (1366px-1920px)
**Adjusted Proportions**
- Table: 65% width (~890px) - Still comfortable
- Map: 35% width (~478px) - Sufficient
- All labels visible
- 16px spacing between groups

### Laptop (1024px-1366px)
**Compact Mode**
- Table: 60% width (~614px) - Minimum comfortable
- Map: 40% width (~410px) - Adequate
- Consider icon-only for some buttons
- 12px spacing between groups

### Tablet Landscape (768px-1024px)
**Warning Territory**
- Show banner: "For best experience, use desktop browser"
- Consider collapsing map to overlay/modal
- Icon-only toolbar
- Single column if under 900px

### Mobile (< 768px)
**Not Supported**
- Show full-screen message:
  "Core Vision is optimized for desktop browsers.
   Please use a desktop computer or download our mobile app."
- Don't attempt to force desktop interface

---

## 🎯 INTERACTION PATTERNS & BEHAVIORS

### Table Row Interactions

```typescript
// Single Click = Navigate (Primary Action)
<tr 
  onClick={(e) => {
    // Don't navigate if clicking interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;
    
    router.push(`/assets/${asset.id}`);
  }}
  className="cursor-pointer hover:bg-neutral-100 transition-colors"
>
  {/* Row content */}
</tr>

// Checkbox = Explicit Selection
<Checkbox
  checked={selectedRows.includes(asset.id)}
  onCheckedChange={() => handleRowSelect(asset.id)}
  onClick={(e) => e.stopPropagation()} // Prevent row click
/>

// Kebab Menu = Actions
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button 
      variant="ghost" 
      size="icon"
      onClick={(e) => e.stopPropagation()} // Prevent row click
    >
      <MoreVertical className="w-4 h-4" />
    </Button>
  </DropdownMenuTrigger>
  {/* Menu items */}
</DropdownMenu>

// NO DOUBLE-CLICK EDIT (Safety Pattern)
// Double-click is too easy to trigger accidentally
// Use explicit Edit action from kebab menu instead
```

### Map Interactions

```typescript
// Click Marker = Highlight & Scroll
const handleMarkerClick = (assetId: string) => {
  // 1. Highlight in table
  setSelectedRows([assetId]);
  
  // 2. Scroll row into view
  const row = document.querySelector(`[data-asset-id="${assetId}"]`);
  row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // 3. Brief flash animation
  row?.classList.add('flash-highlight');
  setTimeout(() => row?.classList.remove('flash-highlight'), 1000);
};

// Click Empty Area = Deselect
const handleMapClick = (e: any) => {
  if (!e.features || e.features.length === 0) {
    setSelectedRows([]);
  }
};
```

### Keyboard Shortcuts (Future Enhancement)

```typescript
const shortcuts = {
  'Cmd+F':     'Open search',
  'Cmd+K':     'Open filters',
  'Cmd+\\':    'Open columns',
  'Cmd+P':     'Open report',
  'Cmd+A':     'Select all',
  'Delete':    'Delete selected (with confirmation)',
  'Escape':    'Clear selection / Close dialog',
  'Enter':     'Open detail view (when row focused)',
  'Space':     'Toggle selection (when row focused)',
};
```

---

## ♿ ACCESSIBILITY REQUIREMENTS

### Keyboard Navigation
```typescript
// Tab order must be logical
const tabOrder = [
  'Skip to main content',
  'Project selector',
  'View tabs',
  'Toolbar buttons',
  'Table header checkboxes',
  'Table rows',
  'Pagination controls'
];

// Focus indicators
<Button className="focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
```

### Screen Reader Support
```typescript
// Table headers
<th scope="col" aria-label="Pipe Segment Reference">
  Pipe Segment
</th>

// Row selection
<Checkbox 
  aria-label={`Select asset ${asset.pipeSegment}`}
  checked={isSelected}
/>

// Status announcements
<div 
  role="status" 
  aria-live="polite" 
  className="sr-only"
>
  {`${selectedRows.length} assets selected`}
</div>
```

### Color Contrast
- All text: **4.5:1 minimum** (WCAG AA)
- Interactive elements: **3:1 minimum**
- Never rely solely on color (use icons + text)

---

## 📏 SPACING & TYPOGRAPHY

### Spacing Scale
```typescript
const spacing = {
  xs:  '4px',   // 0.25rem
  sm:  '8px',   // 0.5rem
  md:  '12px',  // 0.75rem
  lg:  '16px',  // 1rem
  xl:  '24px',  // 1.5rem
  '2xl': '32px' // 2rem
};
```

### Typography Scale
```typescript
const typography = {
  xs:   { size: '12px', lineHeight: '16px' }, // Helper text
  sm:   { size: '14px', lineHeight: '20px' }, // Body, buttons
  base: { size: '16px', lineHeight: '24px' }, // Default
  lg:   { size: '18px', lineHeight: '28px' }, // Sections
  xl:   { size: '20px', lineHeight: '28px' }, // Cards
  '2xl': { size: '24px', lineHeight: '32px' }  // Dialogs
};

const fontWeights = {
  normal:   400, // Body text
  medium:   500, // Emphasis, buttons
  semibold: 600, // Headers, labels
  bold:     700  // Major headers
};
```

---

## 🚀 IMPLEMENTATION PRIORITY ORDER

Implement features in this order for optimal workflow:

1. ✅ **Layout Structure** (foundation)
   - Header, tabs, toolbar shell
   - Table-Map split with resizer
   - Pagination

2. ✅ **Toolbar Buttons** (critical path)
   - Search, Filter, Columns, Report, More, Pop-out
   - All properly grouped and styled

3. ✅ **Advanced Search** (builds on search)
4. ✅ **Filter & Columns Dialogs** (table config)
5. ✅ **Inline Editing** (high value, safe pattern)
6. ✅ **Export Selected** (straightforward)
7. ✅ **Find & Replace** (builds on search+edit)
8. ✅ **Report Generation** (most complex)
9. ✅ **Pop-out Windows** (bonus feature)

---

## 🎯 SUCCESS CRITERIA

Your implementation is successful when:

✅ Table is on LEFT (70%), Map on RIGHT (30%)  
✅ Report button is in toolbar (orange accent)  
✅ Filter and Columns are separate buttons  
✅ Toolbar grouping follows: Search | Filter+Columns | Report+More | Pop-out  
✅ Table rows select via checkbox (not click)  
✅ Navigation to detail requires explicit action  
✅ No double-click editing (use kebab menu)  
✅ All features from advanced prompt work  
✅ Responsive at 1366px+ (desktop focused)  
✅ WCAG AA accessibility compliance  

---

## 📦 REQUIRED DEPENDENCIES

```bash
# Framework
npm install next@latest react@latest react-dom@latest

# UI Components (shadcn/ui)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input select dialog dropdown-menu
npx shadcn-ui@latest add tabs tooltip badge card checkbox radio-group
npx shadcn-ui@latest add separator accordion

# Drag and Drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Icons
npm install lucide-react

# Utilities
npm install clsx tailwind-merge
npm install date-fns

# Export Features
npm install xlsx papaparse

# Report Generation
npm install jspdf jspdf-autotable
```

---

## 🎨 DESIGN SYSTEM TOKENS

```typescript
// colors.ts
export const colors = {
  brand: {
    orange: {
      50: '#fff7ed',
      500: '#f97316',
      600: '#ea580c'
    }
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    // ... rest
  }
};

// spacing.ts
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem'
};

// typography.ts
export const typography = {
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem'
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
};
```

---

## 🚨 CRITICAL REMINDERS

❗ **Table MUST be on LEFT** (research-backed decision)  
❗ **Report MUST be in toolbar** (stakeholder requirement)  
❗ **NO double-click editing** (safety pattern)  
❗ **Filter and Columns separate** (not combined in Settings)  
❗ **Orange = brand color** (use consistently)  
❗ **70/30 table/map ratio** (can adjust to 50-85%)  
❗ **Desktop-first** (1366px+ is primary target)  
❗ **All interactions explicit** (no accidental actions)  

---

**END OF PROMPT**

This prompt contains complete UX rationale, visual specifications, and implementation guidelines. Follow the priority order for smooth development. Good luck! 🚀
