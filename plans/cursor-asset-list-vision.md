# 🎯 CURSOR AI PROMPT: Core Vision Asset List Screen

**Target:** Generate complete Asset List screen for Core Vision application  
**Context:** This is a PARENT screen that shows list of all assets/inspections. User can click on row to navigate to detailed Inspection Screen (which already exists in the project).  
**Tech Stack:** Next.js, React, TypeScript, shadcn/ui, Tailwind CSS

---

## 📋 PROJECT CONTEXT

### Existing Structure:
```
/app
  /inspection
    /page.tsx          ← ALREADY EXISTS (detailed inspection view)
  /assets              ← CREATE THIS (asset list view)
    /page.tsx          ← MAIN FILE TO CREATE
```

### Component Library:
- Use shadcn/ui components (Button, Input, Select, Dialog, etc.)
- Follow existing design system from Inspection Screen
- Maintain consistent styling and patterns

### Data Flow:
```
Asset List Screen (THIS)
  ↓ Click on row
Inspection Screen (EXISTS)
  ↓ Detailed work with observations
```

---

## 🎨 DESIGN REQUIREMENTS

### Brand Colors:
```typescript
const colors = {
  primary: {
    orange: '#E86F25',
    blue: '#336099'
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712'
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  }
}
```

### Typography:
- Font: System UI stack (Inter, -apple-system, sans-serif)
- Headers: 600-700 weight
- Body: 400-500 weight
- Ensure readability for non-tech-savvy users

---

## 🏗️ SCREEN LAYOUT STRUCTURE

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                            │
│ [ITpipes Logo] [Core Vision Logo] [Project: CityTestQA ▼] [Chat]│
├──────────────────────────────────────────────────────────────────┤
│ VIEW TABS                                                         │
│ [★ NASCO Check] [★ Report Ready] [★ Daily Check] [⋮ More (5)]  │
├──────────────────────────────────────────────────────────────────┤
│ TOOLBAR                                                           │
│ [🔍 Search] [⚙️ View Settings] [⋮ More Tools] [↗ Pop-out]      │
├────────────────────────────┬─────────────────────────────────────┤
│                            ║                                     │
│          MAP               ║           TABLE                     │
│         (40%)              ║          (60%)                      │
│                            ║                                     │
│   [Placeholder for now]    ║  Columns based on View Settings    │
│   "ESRI Map Integration"   ║  - Pipe Segment                    │
│   Future: ESRI ArcGIS      ║  - Street                          │
│                            ║  - Upstream MH                     │
│                            ║  - Material                        │
│                            ║  - Width                           │
│                            ║  - Distance                        │
│   [Basemap ▼] [Layers ▼]   ║  - Surveyed By                     │
│                            ║                                     │
│                            ║  Each row clickable → Inspection   │
│                            ║                                     │
│                            ║  [1-100 of 1,760] [Pagination]     │
│                            ║                                     │
└────────────────────────────┴─────────────────────────────────────┘
                         ↕ Resizable divider
```

---

## 🧩 COMPONENTS TO CREATE

### 1. HEADER COMPONENT

**File:** `components/asset-list/Header.tsx`

```typescript
interface HeaderProps {
  projectName: string;
  onProjectChange: (projectId: string) => void;
}

// Requirements:
// - ITpipes logo (left)
// - Core Vision logo (next to ITpipes)
// - Project selector dropdown (center-right)
// - Chat with Support button (far right)
// - Responsive layout
// - Fixed position on scroll
```

**Design specs:**
- Height: 64px
- Background: white
- Border bottom: 1px solid neutral-200
- Padding: 16px 24px
- Shadow on scroll: subtle

---

### 2. VIEW TABS COMPONENT

**File:** `components/asset-list/ViewTabs.tsx`

```typescript
interface View {
  id: string;
  name: string;
  isFavorite: boolean;
  icon?: string;
  filters?: FilterConfig[];
  columns?: string[];
  sortOrder?: SortConfig;
  mapRatio?: number; // 30-70, default 40
}

interface ViewTabsProps {
  views: View[];
  activeViewId: string;
  onViewChange: (viewId: string) => void;
  onCreateView: () => void;
  onManageViews: () => void;
}

// Requirements:
// - Show max 5 favorite views as tabs
// - "More" dropdown for additional views
// - Drag to reorder favorites
// - Right-click context menu (Hide, Favorite, Delete)
// - [+ New View] button
```

**Design specs:**
- Height: 48px
- Background: neutral-50
- Active tab: white background, border-bottom highlight (orange)
- Hover: subtle background change
- Star icon for favorites (filled/outline)
- Smooth transitions

**Interactions:**
```typescript
// Context menu on right-click
const contextMenuOptions = [
  { label: 'Rename', icon: Edit },
  { label: 'Duplicate', icon: Copy },
  { label: 'Toggle Favorite', icon: Star },
  { label: 'Delete', icon: Trash, destructive: true }
];
```

---

### 3. TOOLBAR COMPONENT

**File:** `components/asset-list/Toolbar.tsx`

```typescript
interface ToolbarProps {
  onSearch: (query: string) => void;
  onOpenViewSettings: () => void;
  onPopOutMap: () => void;
  onPopOutTable: () => void;
  selectedRowsCount: number;
}

// Requirements:
// - Search button → opens search dialog
// - View Settings button → opens column picker + filters
// - More Tools dropdown (Validate, Find/Replace, Export, Print)
// - Pop-out button → dropdown (Map, Table, Both)
// - Context actions when rows selected (Edit, Delete, Export)
```

**Design specs:**
- Height: 56px
- Background: white
- Border bottom: 1px solid neutral-200
- Button sizes: 40px × 40px
- Gap between buttons: 8px
- Icons: 20px

**More Tools dropdown:**
```typescript
const toolsMenuItems = [
  { label: 'Validate Inspection', icon: CheckCircle },
  { label: 'Find & Replace', icon: Search },
  { label: 'Export Project', icon: Download },
  { label: 'Copy to Project', icon: Copy },
  { label: 'Print', icon: Printer }
];
```

---

### 4. RESIZABLE SPLIT LAYOUT

**File:** `components/asset-list/ResizableSplit.tsx`

```typescript
interface ResizableSplitProps {
  leftPanel: React.ReactNode;  // Map
  rightPanel: React.ReactNode; // Table
  defaultRatio: number;         // 40 (40% map, 60% table)
  minLeftWidth: number;         // 280px
  minRightWidth: number;        // 500px
  onRatioChange: (ratio: number) => void;
}

// Requirements:
// - Draggable divider between panels
// - Snap points: 30%, 40%, 50%, 60%, 70%
// - Visual feedback on hover/drag
// - Keyboard shortcuts: [ ] \ for adjusting
// - Save ratio preference per view
// - Smooth resize animation
```

**Implementation details:**
```typescript
// Snap logic
const snapPoints = [30, 40, 50, 60, 70];
const snapThreshold = 3; // 3% threshold

// Keyboard shortcuts
[  → Increase map width by 10%
]  → Increase table width by 10%
\  → Reset to default (40/60)
```

**Design specs:**
- Divider width: 6px (1px visible line + 5px hover zone)
- Divider color: neutral-300
- Divider hover: orange-400, cursor: col-resize
- Divider active (dragging): orange-500, wider (8px)

---

### 5. MAP PANEL (PLACEHOLDER)

**File:** `components/asset-list/MapPanel.tsx`

```typescript
interface MapPanelProps {
  assets: Asset[];
  selectedAssetId?: string;
  onAssetSelect: (assetId: string) => void;
  filters?: FilterConfig[];
}

// FOR NOW: Create placeholder component
// FUTURE: Integrate ESRI ArcGIS Maps SDK

// Requirements for placeholder:
// - Gray background with text "ESRI Map Integration"
// - Mock zoom controls (+/-)
// - Mock basemap selector dropdown
// - Mock layers toggle
// - Dimensions and spacing for future integration
```

**Placeholder design:**
```typescript
<div className="relative w-full h-full bg-neutral-100 flex items-center justify-center">
  <div className="text-center">
    <MapIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-neutral-600">
      ESRI Map Integration
    </h3>
    <p className="text-sm text-neutral-500 mt-2">
      Map placeholder - Ready for ESRI ArcGIS SDK
    </p>
  </div>
  
  {/* Mock controls */}
  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
    <Button size="icon" variant="secondary">+</Button>
    <Button size="icon" variant="secondary">-</Button>
  </div>
  
  <div className="absolute top-4 right-4">
    <Select>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Basemap" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="streets">Streets</SelectItem>
        <SelectItem value="satellite">Satellite</SelectItem>
        <SelectItem value="hybrid">Hybrid</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>
```

---

### 6. DATA TABLE COMPONENT

**File:** `components/asset-list/DataTable.tsx`

```typescript
interface Asset {
  id: string;
  pipeSegment: string;
  street: string;
  upstreamMH: string;
  downstreamMH: string;
  material: string;
  width: number;
  distance: number;
  surveyedBy: string;
  // ... additional fields based on view
}

interface DataTableProps {
  data: Asset[];
  columns: ColumnDef[];
  selectedRows: string[];
  onRowSelect: (rowIds: string[]) => void;
  onRowClick: (asset: Asset) => void;
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
}

// Requirements:
// - Sortable columns
// - Row selection (checkbox)
// - Row click → navigate to /inspection/[id]
// - Kebab menu per row (Edit, Delete, Duplicate)
// - Sticky header on scroll
// - Zebra striping (alternating row colors)
// - Hover state
// - Loading skeleton
// - Empty state
```

**Design specs:**
- Row height: 48px
- Header height: 44px
- Checkbox column width: 48px
- Kebab menu column width: 48px
- Font size: 14px
- Cell padding: 12px 16px
- Zebra stripe: neutral-50 / white
- Hover: neutral-100
- Selected: orange-50
- Border: 1px solid neutral-200

**Row actions (kebab menu):**
```typescript
const rowActions = [
  { 
    label: 'View Details', 
    icon: Eye,
    onClick: (asset) => router.push(`/inspection/${asset.id}`)
  },
  { 
    label: 'Edit Asset', 
    icon: Edit,
    onClick: (asset) => openEditDialog(asset)
  },
  { 
    label: 'Duplicate', 
    icon: Copy,
    onClick: (asset) => duplicateAsset(asset)
  },
  { 
    label: 'Delete', 
    icon: Trash,
    onClick: (asset) => confirmDelete(asset),
    destructive: true
  }
];
```

**Click behavior:**
```typescript
// Row click (anywhere except checkbox, kebab) → Navigate to inspection
const handleRowClick = (asset: Asset, e: React.MouseEvent) => {
  // Ignore clicks on interactive elements
  if (
    (e.target as HTMLElement).closest('button') ||
    (e.target as HTMLElement).closest('input')
  ) {
    return;
  }
  
  router.push(`/inspection/${asset.id}`);
};
```

---

### 7. PAGINATION COMPONENT

**File:** `components/asset-list/Pagination.tsx`

```typescript
interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (perPage: number) => void;
}

// Requirements:
// - Show "1-100 of 1,760 items"
// - Items per page selector: [25, 50, 100, 200]
// - Previous/Next buttons
// - Page numbers (with ellipsis for large ranges)
// - First/Last page buttons
```

**Design:**
```
[1-100 of 1,760 items]  [25 ▼]  [« 1 ... 5 6 [7] 8 9 ... 18 »]
```

---

### 8. VIEW SETTINGS DIALOG (Column Picker)

**File:** `components/asset-list/ViewSettingsDialog.tsx`

```typescript
interface ViewSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  currentView: View;
  onSave: (view: View) => void;
}

// Requirements:
// - Two tabs: "Columns" and "Filters"
// - Search-first approach for columns
// - Grouped browsing (Asset/Inspection/Observation)
// - Drag to reorder displayed columns
// - Save as new view or update current
```

**Layout:**
```
┌─────────────────────────────────────────────┐
│ View Settings                          [×]  │
├─────────────────────────────────────────────┤
│ [Columns] [Filters]                         │
├─────────────────────────────────────────────┤
│                                              │
│ 🔍 Search columns...                        │
│                                              │
│ Currently Displayed (7):                    │
│ ─────────────────────────────────────────   │
│ [≡] Pipe Segment Reference          [×]     │
│ [≡] Street                           [×]     │
│ [≡] Upstream MH                      [×]     │
│ [≡] Material                         [×]     │
│ [≡] Width                            [×]     │
│ [≡] Distance                         [×]     │
│ [≡] Surveyed By                      [×]     │
│                                              │
│ ▼ Browse All Fields                         │
│   ▼ Asset Fields (5 of 8 added)             │
│     [+] Project                              │
│     [+] City                                 │
│     [+] Location Code                        │
│   ▼ Inspection Fields (2 of 9 added)        │
│     [+] Certificate Number                   │
│     [+] Date                                 │
│   ▼ Observation Fields (0 of 11 added)      │
│     [+] Code                                 │
│     [+] Description                          │
│                                              │
├─────────────────────────────────────────────┤
│                    [Cancel]  [Save Changes] │
└─────────────────────────────────────────────┘
```

**Interactions:**
- Search: filters all fields in real-time
- [+] button: adds column to "Currently Displayed"
- [×] button: removes from displayed
- [≡] icon: drag handle for reordering
- Collapsed sections by default
- Click section to expand

---

### 9. SEARCH DIALOG

**File:** `components/asset-list/SearchDialog.tsx`

```typescript
interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string, field?: string) => void;
}

// Requirements:
// - Global search across all columns
// - Field-specific search option
// - Recent searches
// - Search suggestions
// - Keyboard navigation (↑↓ for results, Enter to select)
```

**Design:**
```
┌─────────────────────────────────────┐
│ 🔍 Search Assets              [×]   │
├─────────────────────────────────────┤
│                                      │
│ [Search all fields...          ]    │
│ [In: All Fields ▼]                  │
│                                      │
│ Recent:                              │
│ • ML-347                             │
│ • Main Street                        │
│ • Clay pipes                         │
│                                      │
│ Press Enter to search                │
│ ↑↓ to navigate                       │
└─────────────────────────────────────┘
```

---

### 10. MANAGE VIEWS DIALOG

**File:** `components/asset-list/ManageViewsDialog.tsx`

```typescript
interface ManageViewsDialogProps {
  open: boolean;
  onClose: () => void;
  views: View[];
  onUpdateViews: (views: View[]) => void;
}

// Requirements:
// - List all views
// - Drag to reorder
// - Toggle favorite (star icon)
// - Rename view
// - Duplicate view
// - Delete view
// - Create new view
```

**Design:**
```
┌─────────────────────────────────────────┐
│ Manage Views                       [×]  │
├─────────────────────────────────────────┤
│                                          │
│ ⭐ Favorites (3)                        │
│ ─────────────────────────────────────   │
│ [≡] ⭐ NASCO Check        [Edit] [×]    │
│ [≡] ⭐ Report Ready       [Edit] [×]    │
│ [≡] ⭐ Daily Check        [Edit] [×]    │
│                                          │
│ 📁 All Views (8)                        │
│ ─────────────────────────────────────   │
│ [≡] ☆ Custom View 1      [Edit] [×]    │
│ [≡] ☆ Material Check     [Edit] [×]    │
│ [≡] ☆ Inspection Review  [Edit] [×]    │
│ [≡] ☆ QA Pass 1          [Edit] [×]    │
│ [≡] ☆ Weekly Review      [Edit] [×]    │
│                                          │
│ [+ Create New View]                     │
│                                          │
├─────────────────────────────────────────┤
│                    [Close]              │
└─────────────────────────────────────────┘
```

---

## 📊 DATA STRUCTURES

### View Configuration:
```typescript
interface View {
  id: string;
  name: string;
  isFavorite: boolean;
  isDefault: boolean;
  icon?: string;
  
  // Column configuration
  displayedColumns: string[];
  columnOrder: string[];
  columnWidths?: Record<string, number>;
  
  // Filter configuration
  filters: FilterConfig[];
  
  // Sort configuration
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  
  // Layout preferences
  mapRatio: number; // 30-70, default 40
  itemsPerPage: number; // 25, 50, 100, 200
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface FilterConfig {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'greaterThan' | 'lessThan';
  value: any;
  table: 'asset' | 'inspection' | 'observation';
}

interface ColumnDef {
  id: string;
  label: string;
  field: string;
  table: 'asset' | 'inspection' | 'observation';
  type: 'text' | 'number' | 'date' | 'select';
  sortable: boolean;
  filterable: boolean;
  width?: number;
  minWidth?: number;
}
```

### Asset Data:
```typescript
interface Asset {
  id: string;
  
  // Asset level fields
  pipeSegment: string;
  project: string;
  city: string;
  locationCode?: string;
  locationDetails?: string;
  street: string;
  upstreamMH: string;
  downstreamMH: string;
  pipeUse?: string;
  drainageArea?: string;
  yearConstructed?: number;
  yearRenewed?: number;
  material: string;
  width: number;
  
  // Latest inspection data
  latestInspection?: {
    id: string;
    certificateNumber: string;
    date: string;
    purpose: string;
    preCleaning: boolean;
    direction: string;
    mediaLabel: string;
    weather: string;
    poNumber?: string;
    workOrder?: string;
    surveyedBy: string;
  };
  
  // Observation summary
  observationCount: number;
  hasDefects: boolean;
  maxGrade?: number;
  
  // Geographic data (for map)
  geometry?: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}
```

---

## 🎯 MOCK DATA FOR DEVELOPMENT

```typescript
// Use this mock data for initial development
const mockViews: View[] = [
  {
    id: 'view-1',
    name: 'NASCO Check',
    isFavorite: true,
    isDefault: true,
    displayedColumns: [
      'pipeSegment', 'street', 'upstreamMH', 'downstreamMH',
      'material', 'width', 'certificateNumber', 'surveyedBy'
    ],
    columnOrder: ['pipeSegment', 'street', 'upstreamMH', 'downstreamMH', 'material', 'width', 'certificateNumber', 'surveyedBy'],
    filters: [],
    mapRatio: 40,
    itemsPerPage: 100,
    createdAt: '2025-01-01',
    updatedAt: '2025-11-27',
    createdBy: 'system'
  },
  {
    id: 'view-2',
    name: 'Report Ready',
    isFavorite: true,
    isDefault: false,
    displayedColumns: [
      'pipeSegment', 'date', 'certificateNumber', 'observationCount', 'maxGrade'
    ],
    columnOrder: ['pipeSegment', 'date', 'certificateNumber', 'observationCount', 'maxGrade'],
    filters: [
      {
        id: 'f1',
        field: 'hasDefects',
        operator: 'equals',
        value: true,
        table: 'asset'
      }
    ],
    mapRatio: 30,
    itemsPerPage: 50,
    createdAt: '2025-01-15',
    updatedAt: '2025-11-20',
    createdBy: 'user-1'
  },
  {
    id: 'view-3',
    name: 'Daily Check',
    isFavorite: true,
    isDefault: false,
    displayedColumns: [
      'pipeSegment', 'street', 'material', 'width', 'date', 'surveyedBy'
    ],
    columnOrder: ['pipeSegment', 'street', 'material', 'width', 'date', 'surveyedBy'],
    filters: [],
    mapRatio: 50,
    itemsPerPage: 100,
    createdAt: '2025-02-01',
    updatedAt: '2025-11-25',
    createdBy: 'user-2'
  },
  {
    id: 'view-4',
    name: 'Material Check',
    isFavorite: false,
    isDefault: false,
    displayedColumns: ['pipeSegment', 'material', 'width', 'yearConstructed', 'yearRenewed'],
    columnOrder: ['pipeSegment', 'material', 'width', 'yearConstructed', 'yearRenewed'],
    filters: [
      {
        id: 'f2',
        field: 'material',
        operator: 'equals',
        value: 'Clay',
        table: 'asset'
      }
    ],
    mapRatio: 60,
    itemsPerPage: 200,
    createdAt: '2025-03-10',
    updatedAt: '2025-10-15',
    createdBy: 'user-1'
  },
  {
    id: 'view-5',
    name: 'Inspection Review',
    isFavorite: false,
    isDefault: false,
    displayedColumns: [
      'pipeSegment', 'certificateNumber', 'date', 'purpose', 'preCleaning', 'direction'
    ],
    columnOrder: ['pipeSegment', 'certificateNumber', 'date', 'purpose', 'preCleaning', 'direction'],
    filters: [],
    mapRatio: 40,
    itemsPerPage: 100,
    createdAt: '2025-04-01',
    updatedAt: '2025-11-15',
    createdBy: 'user-3'
  }
];

const mockAssets: Asset[] = [
  {
    id: 'asset-1',
    pipeSegment: 'ML-001',
    project: 'CityTestQA',
    city: 'Springfield',
    street: 'Main Street',
    upstreamMH: 'MH-100',
    downstreamMH: 'MH-101',
    material: 'PVC',
    width: 12,
    latestInspection: {
      id: 'insp-1',
      certificateNumber: 'CERT-2025-001',
      date: '2025-11-15',
      purpose: 'Routine Inspection',
      preCleaning: true,
      direction: 'Downstream',
      mediaLabel: 'ML001_2025',
      weather: 'Clear',
      surveyedBy: 'John Smith'
    },
    observationCount: 3,
    hasDefects: true,
    maxGrade: 3
  },
  {
    id: 'asset-2',
    pipeSegment: 'ML-002',
    project: 'CityTestQA',
    city: 'Springfield',
    street: 'Oak Avenue',
    upstreamMH: 'MH-101',
    downstreamMH: 'MH-102',
    material: 'Clay',
    width: 8,
    latestInspection: {
      id: 'insp-2',
      certificateNumber: 'CERT-2025-002',
      date: '2025-11-16',
      purpose: 'Post-Repair',
      preCleaning: false,
      direction: 'Upstream',
      mediaLabel: 'ML002_2025',
      weather: 'Rainy',
      surveyedBy: 'Jane Doe'
    },
    observationCount: 5,
    hasDefects: true,
    maxGrade: 4
  },
  {
    id: 'asset-3',
    pipeSegment: 'ML-003',
    project: 'CityTestQA',
    city: 'Springfield',
    street: 'Elm Street',
    upstreamMH: 'MH-102',
    downstreamMH: 'MH-103',
    material: 'Concrete',
    width: 15,
    latestInspection: {
      id: 'insp-3',
      certificateNumber: 'CERT-2025-003',
      date: '2025-11-17',
      purpose: 'Routine Inspection',
      preCleaning: true,
      direction: 'Downstream',
      mediaLabel: 'ML003_2025',
      weather: 'Clear',
      surveyedBy: 'John Smith'
    },
    observationCount: 1,
    hasDefects: false,
    maxGrade: 1
  },
  // Generate 20-30 more for realistic pagination testing
  ...Array.from({ length: 27 }, (_, i) => ({
    id: `asset-${i + 4}`,
    pipeSegment: `ML-${String(i + 4).padStart(3, '0')}`,
    project: 'CityTestQA',
    city: 'Springfield',
    street: `Street ${i + 4}`,
    upstreamMH: `MH-${100 + i + 3}`,
    downstreamMH: `MH-${100 + i + 4}`,
    material: ['PVC', 'Clay', 'Concrete', 'HDPE'][i % 4],
    width: [8, 10, 12, 15, 18][i % 5],
    latestInspection: {
      id: `insp-${i + 4}`,
      certificateNumber: `CERT-2025-${String(i + 4).padStart(3, '0')}`,
      date: new Date(2025, 10, 15 + (i % 12)).toISOString().split('T')[0],
      purpose: ['Routine Inspection', 'Post-Repair', 'Emergency'][i % 3],
      preCleaning: i % 2 === 0,
      direction: i % 2 === 0 ? 'Downstream' : 'Upstream',
      mediaLabel: `ML${String(i + 4).padStart(3, '0')}_2025`,
      weather: ['Clear', 'Rainy', 'Cloudy'][i % 3],
      surveyedBy: ['John Smith', 'Jane Doe', 'Bob Johnson'][i % 3]
    },
    observationCount: (i % 5) + 1,
    hasDefects: i % 3 !== 0,
    maxGrade: (i % 5) + 1
  }))
];

// Total: 30 assets for testing
```

---

## 🚀 IMPLEMENTATION STEPS

### Step 1: Project Setup
```bash
# Create directory structure
mkdir -p app/assets
mkdir -p components/asset-list
mkdir -p lib/types
mkdir -p lib/hooks
```

### Step 2: Type Definitions
**File:** `lib/types/asset-list.ts`
```typescript
// Copy all interfaces from Data Structures section above
```

### Step 3: Create Components (in order)
1. Header.tsx
2. ResizableSplit.tsx
3. MapPanel.tsx (placeholder)
4. DataTable.tsx
5. Pagination.tsx
6. ViewTabs.tsx
7. Toolbar.tsx
8. ViewSettingsDialog.tsx
9. SearchDialog.tsx
10. ManageViewsDialog.tsx

### Step 4: Main Page
**File:** `app/assets/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/asset-list/Header';
import ViewTabs from '@/components/asset-list/ViewTabs';
import Toolbar from '@/components/asset-list/Toolbar';
import ResizableSplit from '@/components/asset-list/ResizableSplit';
import MapPanel from '@/components/asset-list/MapPanel';
import DataTable from '@/components/asset-list/DataTable';
import Pagination from '@/components/asset-list/Pagination';
import ViewSettingsDialog from '@/components/asset-list/ViewSettingsDialog';
import SearchDialog from '@/components/asset-list/SearchDialog';
import ManageViewsDialog from '@/components/asset-list/ManageViewsDialog';
import { mockViews, mockAssets } from '@/lib/mock-data';
import type { View, Asset } from '@/lib/types/asset-list';

export default function AssetListPage() {
  const router = useRouter();
  
  // State management
  const [views, setViews] = useState<View[]>(mockViews);
  const [activeViewId, setActiveViewId] = useState<string>('view-1');
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [viewSettingsOpen, setViewSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [manageViewsOpen, setManageViewsOpen] = useState(false);
  
  // Get active view
  const activeView = views.find(v => v.id === activeViewId) || views[0];
  
  // Calculate pagination
  const totalItems = assets.length;
  const itemsPerPage = activeView.itemsPerPage;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssets = assets.slice(startIndex, endIndex);
  
  // Handlers
  const handleRowClick = (asset: Asset) => {
    router.push(`/inspection/${asset.id}`);
  };
  
  const handleViewChange = (viewId: string) => {
    setActiveViewId(viewId);
    setCurrentPage(1);
  };
  
  const handleSaveView = (updatedView: View) => {
    setViews(views.map(v => v.id === updatedView.id ? updatedView : v));
  };
  
  return (
    <div className="flex flex-col h-screen bg-white">
      <Header 
        projectName="CityTestQA"
        onProjectChange={(projectId) => console.log('Project changed:', projectId)}
      />
      
      <ViewTabs
        views={views}
        activeViewId={activeViewId}
        onViewChange={handleViewChange}
        onCreateView={() => {/* TODO */}}
        onManageViews={() => setManageViewsOpen(true)}
      />
      
      <Toolbar
        onSearch={() => setSearchOpen(true)}
        onOpenViewSettings={() => setViewSettingsOpen(true)}
        onPopOutMap={() => {/* TODO */}}
        onPopOutTable={() => {/* TODO */}}
        selectedRowsCount={selectedRows.length}
      />
      
      <ResizableSplit
        defaultRatio={activeView.mapRatio}
        onRatioChange={(ratio) => {/* Save to view */}}
        leftPanel={
          <MapPanel
            assets={assets}
            selectedAssetId={selectedRows[0]}
            onAssetSelect={(id) => setSelectedRows([id])}
          />
        }
        rightPanel={
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
              <DataTable
                data={paginatedAssets}
                columns={activeView.displayedColumns}
                selectedRows={selectedRows}
                onRowSelect={setSelectedRows}
                onRowClick={handleRowClick}
                onSort={(col, dir) => {/* TODO */}}
              />
            </div>
            
            <Pagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(perPage) => {/* Update view */}}
            />
          </div>
        }
      />
      
      {/* Dialogs */}
      <ViewSettingsDialog
        open={viewSettingsOpen}
        onClose={() => setViewSettingsOpen(false)}
        currentView={activeView}
        onSave={handleSaveView}
      />
      
      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSearch={(query) => {
          setSearchQuery(query);
          // Filter assets
        }}
      />
      
      <ManageViewsDialog
        open={manageViewsOpen}
        onClose={() => setManageViewsOpen(false)}
        views={views}
        onUpdateViews={setViews}
      />
    </div>
  );
}
```

---

## ⚙️ TECHNICAL REQUIREMENTS

### Performance:
- Virtualize table if > 100 rows visible
- Debounce search input (300ms)
- Memoize expensive calculations
- Lazy load dialogs (code splitting)

### Accessibility:
- ARIA labels on all interactive elements
- Keyboard navigation for table (↑↓ for rows, Tab for cells)
- Focus management in dialogs
- Screen reader announcements for actions

### Responsive:
- Minimum viewport: 1280px (this is desktop-only app)
- Scale gracefully up to 4K displays
- Handle dual monitor pop-outs

### State Management:
- Use React Context for view state (if needed)
- Local storage for user preferences
- Optimistic updates for UI responsiveness

---

## 🎨 STYLING GUIDELINES

### Spacing Scale:
```typescript
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
}
```

### Border Radius:
```typescript
const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
}
```

### Shadows:
```typescript
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
}
```

### Transitions:
```typescript
const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
}
```

---

## 🧪 TESTING CHECKLIST

### Functionality:
- [ ] View switching works
- [ ] Column picker adds/removes columns
- [ ] Search filters table correctly
- [ ] Pagination updates correctly
- [ ] Row click navigates to inspection screen
- [ ] Resizable split persists per view
- [ ] Favorite views appear in tabs
- [ ] Kebab menu actions work

### UX:
- [ ] All buttons have hover states
- [ ] Loading states show appropriately
- [ ] Error states handled gracefully
- [ ] Empty states show helpful messages
- [ ] Tooltips explain functionality
- [ ] Keyboard shortcuts work

### Responsive:
- [ ] Layout works at 1280px
- [ ] Layout works at 1920px
- [ ] Layout works at 2560px (4K)
- [ ] Pop-out windows function correctly

---

## 🚨 IMPORTANT NOTES

### Do NOT Include:
- ❌ Actual ESRI map integration (placeholder only)
- ❌ Backend API calls (use mock data)
- ❌ Authentication (assume user is logged in)
- ❌ Real-time updates (static data for now)
- ❌ Advanced features (AI, collaboration, etc.)

### DO Include:
- ✅ All UI components fully functional
- ✅ All interactions working (clicks, drags, etc.)
- ✅ Proper TypeScript types
- ✅ Mock data for realistic testing
- ✅ Placeholder for map (styled and sized correctly)
- ✅ Navigation to /inspection/[id] route

### Future Integration Points:
```typescript
// These will be added later - leave TODOs
// TODO: Integrate ESRI ArcGIS Maps SDK for JavaScript
// TODO: Connect to backend API for asset data
// TODO: Implement real-time updates via WebSocket
// TODO: Add state persistence to backend
// TODO: Integrate with authentication system
```

---

## 📝 FINAL CHECKLIST

Before considering this complete:

- [ ] All components created and functional
- [ ] Mock data renders correctly
- [ ] Resizable split works smoothly
- [ ] View tabs switch between views
- [ ] Column picker opens and functions
- [ ] Search dialog opens and filters
- [ ] Pagination works correctly
- [ ] Row click navigates to /inspection/[id]
- [ ] All dialogs can open and close
- [ ] Loading/empty states implemented
- [ ] TypeScript types defined
- [ ] Code is well-commented
- [ ] Follows existing project patterns
- [ ] No console errors
- [ ] Responsive at target resolutions

---

## 🎯 SUCCESS CRITERIA

You'll know this is done when:

1. **Visual:** Matches the layout structure described above
2. **Functional:** All interactions work without errors
3. **Data:** Mock data displays correctly in table
4. **Navigation:** Clicking row navigates to inspection screen
5. **Flexible:** Resizable split adjusts smoothly
6. **Organized:** View tabs switch cleanly
7. **Professional:** Looks polished and production-ready

---

**END OF PROMPT**

This is everything Cursor AI needs to generate a complete, functional Asset List screen that integrates with your existing Inspection Screen. Good luck! 🚀