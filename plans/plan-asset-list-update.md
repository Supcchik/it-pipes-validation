# 📋 ПЛАН РЕАЛІЗАЦІЇ: Asset List Screen для Core Vision

**Режим:** [MODE: PLAN]  
**Дата:** 27.11.2025  
**Базується на:** redesign-asset-list-core-vision.md + cursor-asset-list-vision.md

---

## 🎯 МЕТА

Створити повнофункціональний Asset List Screen, який:
- Показує список всіх assets/inspections
- Дозволяє перемикатися між різними views (NASCO, Report, Custom)
- Має resizable split view (Map + Table)
- Навігує до детального Inspection Screen при кліку на row
- Використовує mock data для початкової розробки

---

## 📁 СТРУКТУРА ФАЙЛІВ

### Створювані директорії:
```
/app
  /assets
    page.tsx                    ← Головна сторінка Asset List

/components
  /asset-list
    Header.tsx                  ← Header з логотипами та project selector
    ViewTabs.tsx                ← Таби для перемикання views
    Toolbar.tsx                 ← Toolbar з пошуком та діями
    ResizableSplit.tsx          ← Resizable divider для map/table
    MapPanel.tsx                ← Placeholder для мапи (ESRI integration later)
    DataTable.tsx               ← Таблиця з assets
    Pagination.tsx               ← Пагінація
    ViewSettingsDialog.tsx       ← Діалог налаштування view (columns + filters)
    SearchDialog.tsx             ← Діалог пошуку
    ManageViewsDialog.tsx       ← Діалог управління views
    EditRowDialog.tsx            ← Діалог редагування row (опціонально)

/lib
  /types
    asset-list.ts               ← TypeScript типи для Asset List
  /mock-data
    asset-list.ts               ← Mock дані для розробки
  /hooks
    useViewState.ts              ← Hook для управління views (опціонально)
    useResizableSplit.ts         ← Hook для resizable split (опціонально)
```

---

## 🔢 ПОСЛІДОВНІСТЬ РЕАЛІЗАЦІЇ

### ФАЗА 1: Підготовка та типи (Кроки 1-3)

#### Крок 1: Створити структуру директорій
```bash
mkdir -p app/assets
mkdir -p components/asset-list
mkdir -p lib/types
mkdir -p lib/mock-data
mkdir -p lib/hooks
```

**Файли для створення:**
- [ ] Створити `app/assets/page.tsx` (порожній, буде заповнений пізніше)
- [ ] Створити всі директорії вище

---

#### Крок 2: Створити TypeScript типи
**Файл:** `lib/types/asset-list.ts`

**Типи для створення:**
```typescript
// View Configuration
export interface View {
  id: string;
  name: string;
  isFavorite: boolean;
  isDefault: boolean;
  icon?: string;
  displayedColumns: string[];
  columnOrder: string[];
  columnWidths?: Record<string, number>;
  filters: FilterConfig[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  mapRatio: number; // 30-70, default 40
  itemsPerPage: number; // 25, 50, 100, 200
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Filter Configuration
export interface FilterConfig {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'greaterThan' | 'lessThan';
  value: any;
  table: 'asset' | 'inspection' | 'observation';
}

// Column Definition
export interface ColumnDef {
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

// Asset Data
export interface Asset {
  id: string;
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
  observationCount: number;
  hasDefects: boolean;
  maxGrade?: number;
  geometry?: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}
```

**Чекліст:**
- [ ] Створити файл `lib/types/asset-list.ts`
- [ ] Додати всі інтерфейси вище
- [ ] Експортувати всі типи

---

#### Крок 3: Створити Mock дані
**Файл:** `lib/mock-data/asset-list.ts`

**Що створити:**
- [ ] `mockViews: View[]` - 5 прикладів views (NASCO, Report, Daily Check, Material Check, Inspection Review)
- [ ] `mockAssets: Asset[]` - 30 прикладів assets з різними даними
- [ ] `mockColumnDefs: ColumnDef[]` - визначення всіх можливих колонок
- [ ] Експортувати всі mock дані

**Деталі:**
- Mock views мають різні mapRatio (30, 40, 50, 60)
- Mock assets мають різні materials, widths, inspection dates
- ColumnDefs мають покривати Asset, Inspection, Observation поля

---

### ФАЗА 2: Базові компоненти (Кроки 4-7)

#### Крок 4: Header Component
**Файл:** `components/asset-list/Header.tsx`

**Функціональність:**
- [ ] ITpipes logo (ліворуч)
- [ ] Core Vision logo (поруч з ITpipes)
- [ ] Project selector dropdown (центр-право)
- [ ] Chat with Support button (далеко праворуч)
- [ ] Fixed position при scroll
- [ ] Height: 64px, padding: 16px 24px
- [ ] Border bottom: 1px solid neutral-200

**Props:**
```typescript
interface HeaderProps {
  projectName: string;
  onProjectChange: (projectId: string) => void;
}
```

**Технічні деталі:**
- Використовувати shadcn/ui Select для project selector
- Використовувати Button для Chat Support
- Логотипи - поки що текст або placeholder
- Responsive layout

---

#### Крок 5: ResizableSplit Component
**Файл:** `components/asset-list/ResizableSplit.tsx`

**Функціональність:**
- [ ] Draggable divider між панелями
- [ ] Snap points: 30%, 40%, 50%, 60%, 70%
- [ ] Min widths: Map 280px, Table 500px
- [ ] Visual feedback при hover/drag
- [ ] Keyboard shortcuts: `[` `]` `\`
- [ ] Smooth resize animation

**Props:**
```typescript
interface ResizableSplitProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultRatio: number; // 40 = 40% map, 60% table
  minLeftWidth: number;
  minRightWidth: number;
  onRatioChange: (ratio: number) => void;
}
```

**Технічні деталі:**
- Використовувати mouse events для drag
- Calculate snap points при drag
- Divider width: 6px (1px visible + 5px hover zone)
- Divider hover: orange-400, cursor: col-resize
- Divider active: orange-500, wider (8px)

**Реалізація:**
- useState для isDragging
- useEffect для mouse move/up listeners
- Calculate percentage based on container width
- Apply snap logic within 3% threshold

---

#### Крок 6: MapPanel Component (Placeholder)
**Файл:** `components/asset-list/MapPanel.tsx`

**Функціональність:**
- [ ] Placeholder з текстом "ESRI Map Integration"
- [ ] Mock zoom controls (+/-)
- [ ] Mock basemap selector dropdown
- [ ] Mock layers toggle
- [ ] Правильні розміри для майбутньої інтеграції

**Props:**
```typescript
interface MapPanelProps {
  assets: Asset[];
  selectedAssetId?: string;
  onAssetSelect: (assetId: string) => void;
  filters?: FilterConfig[];
}
```

**Дизайн:**
- Gray background (neutral-100)
- Центрований текст з іконкою Map
- Mock controls в правильних позиціях
- Ready for ESRI ArcGIS SDK integration

**Технічні деталі:**
- Використовувати lucide-react MapIcon
- Button components для zoom controls
- Select для basemap selector
- Position: relative для absolute positioned controls

---

#### Крок 7: DataTable Component
**Файл:** `components/asset-list/DataTable.tsx`

**Функціональність:**
- [ ] Sortable columns
- [ ] Row selection (checkbox)
- [ ] Row click → navigate to /inspection/[id]
- [ ] Kebab menu per row (View Details, Edit, Duplicate, Delete)
- [ ] Sticky header on scroll
- [ ] Zebra striping
- [ ] Hover state
- [ ] Loading skeleton
- [ ] Empty state

**Props:**
```typescript
interface DataTableProps {
  data: Asset[];
  columns: ColumnDef[];
  selectedRows: string[];
  onRowSelect: (rowIds: string[]) => void;
  onRowClick: (asset: Asset) => void;
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
}
```

**Дизайн:**
- Row height: 48px
- Header height: 44px
- Checkbox column: 48px width
- Kebab menu column: 48px width
- Font size: 14px
- Cell padding: 12px 16px
- Zebra stripe: neutral-50 / white
- Hover: neutral-100
- Selected: orange-50

**Технічні деталі:**
- Використовувати shadcn/ui Table component
- Checkbox для selection
- DropdownMenu для kebab menu
- useRouter для navigation
- Ignore clicks on interactive elements (checkbox, kebab)

**Row Actions:**
- View Details → router.push(`/inspection/${asset.id}`)
- Edit Asset → openEditDialog (TODO)
- Duplicate → duplicateAsset (TODO)
- Delete → confirmDelete (TODO)

---

### ФАЗА 3: Додаткові компоненти (Кроки 8-10)

#### Крок 8: Pagination Component
**Файл:** `components/asset-list/Pagination.tsx`

**Функціональність:**
- [ ] Show "1-100 of 1,760 items"
- [ ] Items per page selector: [25, 50, 100, 200]
- [ ] Previous/Next buttons
- [ ] Page numbers з ellipsis для великих ranges
- [ ] First/Last page buttons

**Props:**
```typescript
interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (perPage: number) => void;
}
```

**Дизайн:**
```
[1-100 of 1,760 items]  [25 ▼]  [« 1 ... 5 6 [7] 8 9 ... 18 »]
```

**Технічні деталі:**
- Calculate total pages
- Show ellipsis when pages > 7
- Disable buttons at first/last page
- Select component для items per page

---

#### Крок 9: ViewTabs Component
**Файл:** `components/asset-list/ViewTabs.tsx`

**Функціональність:**
- [ ] Show max 5 favorite views as tabs
- [ ] "More" dropdown для additional views
- [ ] Drag to reorder favorites (опціонально, Phase 2)
- [ ] Right-click context menu (Rename, Duplicate, Toggle Favorite, Delete)
- [ ] [+ New View] button

**Props:**
```typescript
interface ViewTabsProps {
  views: View[];
  activeViewId: string;
  onViewChange: (viewId: string) => void;
  onCreateView: () => void;
  onManageViews: () => void;
}
```

**Дизайн:**
- Height: 48px
- Background: neutral-50
- Active tab: white background, border-bottom highlight (orange)
- Hover: subtle background change
- Star icon для favorites (filled/outline)

**Технічні деталі:**
- Filter favorites (max 5)
- DropdownMenu для "More"
- ContextMenu для right-click (опціонально)
- Smooth transitions

---

#### Крок 10: Toolbar Component
**Файл:** `components/asset-list/Toolbar.tsx`

**Функціональність:**
- [ ] Search button → opens search dialog
- [ ] View Settings button → opens column picker + filters
- [ ] More Tools dropdown (Validate, Find/Replace, Export, Print)
- [ ] Pop-out button → dropdown (Map, Table, Both)
- [ ] Context actions when rows selected (Edit, Delete, Export)

**Props:**
```typescript
interface ToolbarProps {
  onSearch: () => void;
  onOpenViewSettings: () => void;
  onPopOutMap: () => void;
  onPopOutTable: () => void;
  selectedRowsCount: number;
}
```

**Дизайн:**
- Height: 56px
- Background: white
- Border bottom: 1px solid neutral-200
- Button sizes: 40px × 40px
- Gap between buttons: 8px
- Icons: 20px

**More Tools Menu:**
- Validate Inspection
- Find & Replace
- Export Project
- Copy to Project
- Print

**Pop-out Menu:**
- Pop-out Map
- Pop-out Table
- Pop-out Both

**Технічні деталі:**
- Primary actions: Search, View Settings, Pop-out
- Secondary actions: More Tools dropdown
- Context actions appear only when selectedRowsCount > 0
- Використовувати DropdownMenu для меню

---

### ФАЗА 4: Діалоги (Кроки 11-13)

#### Крок 11: ViewSettingsDialog Component
**Файл:** `components/asset-list/ViewSettingsDialog.tsx`

**Функціональність:**
- [ ] Two tabs: "Columns" and "Filters"
- [ ] Search-first approach для columns
- [ ] Grouped browsing (Asset/Inspection/Observation)
- [ ] Drag to reorder displayed columns (опціонально)
- [ ] Save as new view or update current

**Props:**
```typescript
interface ViewSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  currentView: View;
  onSave: (view: View) => void;
}
```

**Layout:**
- Dialog з shadcn/ui Dialog
- Tabs для Columns/Filters
- Search input нагорі
- "Currently Displayed" список
- "Browse All Fields" з collapsed sections
- Save/Cancel buttons

**Interactions:**
- Search filters fields in real-time
- [+] button adds column
- [×] button removes column
- [≡] icon для drag handle (опціонально)
- Collapsed sections by default
- Click section to expand

**Технічні деталі:**
- Використовувати shadcn/ui Tabs
- Filter columnDefs based on search query
- Group by table (asset/inspection/observation)
- Track displayed columns state
- Update view on save

---

#### Крок 12: SearchDialog Component
**Файл:** `components/asset-list/SearchDialog.tsx`

**Функціональність:**
- [ ] Global search across all columns
- [ ] Field-specific search option
- [ ] Recent searches
- [ ] Search suggestions (опціонально)
- [ ] Keyboard navigation (↑↓ for results, Enter to select)

**Props:**
```typescript
interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string, field?: string) => void;
}
```

**Дизайн:**
- Dialog з search input
- Field selector dropdown
- Recent searches list
- Keyboard shortcuts hint

**Технічні деталі:**
- Debounce search input (300ms)
- Store recent searches in localStorage
- Filter suggestions based on input
- Handle Enter/Escape keys
- Navigate results with arrow keys

---

#### Крок 13: ManageViewsDialog Component
**Файл:** `components/asset-list/ManageViewsDialog.tsx`

**Функціональність:**
- [ ] List all views
- [ ] Drag to reorder (опціонально)
- [ ] Toggle favorite (star icon)
- [ ] Rename view
- [ ] Duplicate view
- [ ] Delete view
- [ ] Create new view

**Props:**
```typescript
interface ManageViewsDialogProps {
  open: boolean;
  onClose: () => void;
  views: View[];
  onUpdateViews: (views: View[]) => void;
}
```

**Layout:**
- Dialog з двома секціями: Favorites та All Views
- Each view: drag handle, star, name, Edit button, Delete button
- [+ Create New View] button

**Технічні деталі:**
- Separate favorites from all views
- Edit button opens rename dialog
- Delete button shows confirmation
- Duplicate creates copy with "- Copy" suffix
- Drag to reorder (опціонально, використовувати dnd-kit або react-beautiful-dnd)

---

### ФАЗА 5: Головна сторінка та інтеграція (Кроки 14-15)

#### Крок 14: Main Page - app/assets/page.tsx
**Файл:** `app/assets/page.tsx`

**Функціональність:**
- [ ] Імпортувати всі компоненти
- [ ] State management для views, assets, selection, pagination
- [ ] Dialog states
- [ ] Handlers для всіх interactions
- [ ] Layout structure
- [ ] Navigation до /inspection/[id]

**State:**
```typescript
const [views, setViews] = useState<View[]>(mockViews);
const [activeViewId, setActiveViewId] = useState<string>('view-1');
const [assets, setAssets] = useState<Asset[]>(mockAssets);
const [selectedRows, setSelectedRows] = useState<string[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [searchQuery, setSearchQuery] = useState('');
const [viewSettingsOpen, setViewSettingsOpen] = useState(false);
const [searchOpen, setSearchOpen] = useState(false);
const [manageViewsOpen, setManageViewsOpen] = useState(false);
```

**Layout:**
```typescript
<div className="flex flex-col h-screen bg-white">
  <Header />
  <ViewTabs />
  <Toolbar />
  <ResizableSplit
    leftPanel={<MapPanel />}
    rightPanel={
      <div className="flex flex-col h-full">
        <DataTable />
        <Pagination />
      </div>
    }
  />
  {/* Dialogs */}
  <ViewSettingsDialog />
  <SearchDialog />
  <ManageViewsDialog />
</div>
```

**Handlers:**
- handleRowClick → router.push(`/inspection/${asset.id}`)
- handleViewChange → setActiveViewId, reset pagination
- handleSaveView → update views array
- handleSearch → filter assets
- handlePageChange → update currentPage

**Технічні деталі:**
- 'use client' directive
- useRouter для navigation
- Calculate pagination based on activeView.itemsPerPage
- Filter assets based on activeView.filters
- Apply search query to assets
- Sync selected rows with map (bidirectional)

---

#### Крок 15: Інтеграція та тестування
**Чекліст:**

**Функціональність:**
- [ ] View switching works
- [ ] Column picker adds/removes columns
- [ ] Search filters table correctly
- [ ] Pagination updates correctly
- [ ] Row click navigates to inspection screen
- [ ] Resizable split persists per view
- [ ] Favorite views appear in tabs
- [ ] Kebab menu actions work

**UX:**
- [ ] All buttons have hover states
- [ ] Loading states show appropriately
- [ ] Error states handled gracefully
- [ ] Empty states show helpful messages
- [ ] Tooltips explain functionality
- [ ] Keyboard shortcuts work

**Responsive:**
- [ ] Layout works at 1280px
- [ ] Layout works at 1920px
- [ ] Layout works at 2560px (4K)

**Code Quality:**
- [ ] TypeScript types defined
- [ ] Code is well-commented
- [ ] Follows existing project patterns
- [ ] No console errors
- [ ] No TypeScript errors

---

## 🎨 СТИЛІЗАЦІЯ

### Кольори (з vision документів):
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

### Spacing Scale:
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px
- 3xl: 48px

### Border Radius:
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px

---

## 🔗 ІНТЕГРАЦІЯ З ІСНУЮЧИМ КОДОМ

### Навігація:
- Asset List → Inspection Screen: `router.push('/inspection/${asset.id}')`
- Inspection Screen вже існує в `app/page.tsx`
- Переконатися, що routes працюють правильно

### Компоненти:
- Використовувати існуючі shadcn/ui components
- Слідувати patterns з inspection screen
- Використовувати lucide-react icons

### Типи:
- Додати нові типи в `lib/types/asset-list.ts`
- Не змінювати існуючі типи в `types/inspection.ts`

---

## 🚨 ВАЖЛИВІ ПРИМІТКИ

### НЕ включати в MVP:
- ❌ Реальну ESRI map integration (placeholder only)
- ❌ Backend API calls (use mock data)
- ❌ Authentication (assume user is logged in)
- ❌ Real-time updates (static data for now)
- ❌ Advanced features (AI, collaboration, etc.)
- ❌ Drag to reorder columns (можна додати пізніше)
- ❌ Drag to reorder views (можна додати пізніше)

### ВКЛЮЧИТИ в MVP:
- ✅ Всі UI components повністю функціональні
- ✅ Всі interactions working (clicks, drags, etc.)
- ✅ Proper TypeScript types
- ✅ Mock data для realistic testing
- ✅ Placeholder для map (styled and sized correctly)
- ✅ Navigation до /inspection/[id] route
- ✅ Resizable split view
- ✅ View management
- ✅ Column picker
- ✅ Search functionality

---

## 📝 FUTURE INTEGRATION POINTS

Залишити TODO коментарі для:
```typescript
// TODO: Integrate ESRI ArcGIS Maps SDK for JavaScript
// TODO: Connect to backend API for asset data
// TODO: Implement real-time updates via WebSocket
// TODO: Add state persistence to backend
// TODO: Integrate with authentication system
// TODO: Add drag-to-reorder for columns
// TODO: Add drag-to-reorder for views
```

---

## ✅ ФІНАЛЬНИЙ ЧЕКЛИСТ

Перед завершенням перевірити:

**Компоненти:**
- [ ] Header.tsx
- [ ] ViewTabs.tsx
- [ ] Toolbar.tsx
- [ ] ResizableSplit.tsx
- [ ] MapPanel.tsx
- [ ] DataTable.tsx
- [ ] Pagination.tsx
- [ ] ViewSettingsDialog.tsx
- [ ] SearchDialog.tsx
- [ ] ManageViewsDialog.tsx

**Файли:**
- [ ] app/assets/page.tsx
- [ ] lib/types/asset-list.ts
- [ ] lib/mock-data/asset-list.ts

**Функціональність:**
- [ ] All components render without errors
- [ ] Mock data displays correctly
- [ ] Resizable split works smoothly
- [ ] View tabs switch between views
- [ ] Column picker opens and functions
- [ ] Search dialog opens and filters
- [ ] Pagination works correctly
- [ ] Row click navigates to /inspection/[id]
- [ ] All dialogs can open and close
- [ ] Loading/empty states implemented

**Code Quality:**
- [ ] TypeScript types defined
- [ ] Code is well-commented
- [ ] Follows existing project patterns
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Responsive at target resolutions

---

## 🎯 КРИТЕРІЇ УСПІХУ

Проєкт вважається завершеним, коли:

1. **Visual:** Matches the layout structure described in vision documents
2. **Functional:** All interactions work without errors
3. **Data:** Mock data displays correctly in table
4. **Navigation:** Clicking row navigates to inspection screen
5. **Flexible:** Resizable split adjusts smoothly
6. **Organized:** View tabs switch cleanly
7. **Professional:** Looks polished and production-ready

---

**END OF PLAN**

Цей план є деталізованим чеклістом для реалізації Asset List Screen. Кожен крок має конкретні файли, функціональність та технічні деталі для виконання.

