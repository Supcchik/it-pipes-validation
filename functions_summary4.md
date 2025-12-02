# 📋 ФУНКЦІОНАЛ ТА ІНТЕРАКЦІЇ: Asset List Screen

**Дата створення:** 27.11.2025  
**Версія:** 1.0  
**Базується на:** Реалізований функціонал в `app/assets/page.tsx` та компонентах

---

## 🎨 ЗАГАЛЬНИЙ LAYOUT СТОРІНКИ

### Структура компонентів (зверху вниз):

```
┌─────────────────────────────────────────────────────────┐
│ Header (pt-16)                                          │
│ - Логотипи, Project Selector, Chat Support             │
├─────────────────────────────────────────────────────────┤
│ ViewTabs (h-12)                                         │
│ - Favorite Views (до 5), More dropdown, New View button  │
├─────────────────────────────────────────────────────────┤
│ Toolbar (min-h-14)                                      │
│ - Search, View Settings, Active Filters Bar, More Tools │
│ - Context Actions (коли є selected rows)                │
│ - Pop-out dropdown                                      │
├─────────────────────────────────────────────────────────┤
│ ResizableSplit (flex-1)                                 │
│ ├─ MapPanel (ліва панель, змінна ширина)                │
│ │  - Map з assets markers                               │
│ │  - Controls для мапи                                  │
│ └─ DataTable + Pagination (права панель)               │
│    ├─ DataTable (flex-1, scrollable)                    │
│    │  - Sortable columns                                │
│    │  - Selectable rows                                 │
│    │  - Clickable rows (навігація)                      │
│    │  - Kebab menu для actions                          │
│    └─ Pagination (bottom)                               │
│       - Page navigation                                 │
│       - Items per page selector                         │
└─────────────────────────────────────────────────────────┘
```

### Розміри та пропорції:
- **Header:** `pt-16` (64px padding-top)
- **ViewTabs:** `h-12` (48px)
- **Toolbar:** `min-h-14` (56px мінімум, може розширюватися)
- **ResizableSplit:** `flex-1` (займає решту простору)
  - **Default ratio:** 40% Map / 60% Table
  - **Min widths:** Map 280px, Table 500px
  - **Snap points:** 30%, 40%, 50%, 60%, 70%

---

## 🧩 КОМПОНЕНТИ ТА ЇХ ФУНКЦІОНАЛ

### 1. **Header** (`components/asset-list/Header.tsx`)

**Функціонал:**
- Відображення логотипів (Core Vision, ITpipes)
- Project Selector dropdown
- Chat Support button

**Інтеракції:**
- `onProjectChange(projectId)` - зміна проекту (console.log)
- Chat button - відкриття чату (console.log)

---

### 2. **ViewTabs** (`components/asset-list/ViewTabs.tsx`)

**Функціонал:**
- Відображення favorite views (до 5) як tabs
- "More" dropdown для інших views
- "New View" button
- "Manage Views" button

**Інтеракції:**
- **Click на tab** → `onViewChange(viewId)`
  - Перемикає активний view
  - Скидає pagination на сторінку 1
  - Завантажує колонки, фільтри, mapRatio з view
  
- **Click "More" dropdown** → показує список інших views
  - Click на view → `onViewChange(viewId)`
  
- **Click "New View" button** → `onCreateView()`
  - TODO: Відкриває діалог створення нового view
  
- **Click "Manage Views" button** → `onManageViews()`
  - Відкриває `ManageViewsDialog`

**Візуальні стани:**
- **Active tab:** `border-b-2 border-orange-500 text-orange-600`
- **Inactive tab:** `border-b-2 border-transparent text-neutral-600`
- **Favorite indicator:** ⭐ іконка

---

### 3. **Toolbar** (`components/asset-list/Toolbar.tsx`)

**Функціонал:**
- Primary actions (Search, View Settings)
- Active Filters Bar (відображає активні фільтри)
- More Tools dropdown
- Context Actions (коли є selected rows)
- Pop-out dropdown

**Інтеракції:**

#### Primary Actions:
- **Search button** → `onSearch()`
  - Відкриває `SearchDialog`
  
- **View Settings button** → `onOpenViewSettings()`
  - Відкриває `ViewSettingsDialog` (Smart Tab)

#### Active Filters Bar:
- Відображає до 3 активних фільтрів як chips
- Кожен chip показує: `Field Operator Value`
- **Click на chip** → відкриває View Settings з Filters tab
- **Click "×" на chip** → `onRemoveFilter(filterId)`
- **"+X more" button** → відкриває View Settings
- **"View all filters" button** → відкриває View Settings

#### More Tools Dropdown:
- Validate Inspection
- Find & Replace
- Export Project
- Copy to Project
- Print

#### Context Actions (коли `selectedRowsCount > 0`):
- Показує кількість вибраних: `"{count} selected"`
- **Edit button** → редагування вибраних rows
- **Delete button** → видалення вибраних rows
- **Export Selected button** → експорт вибраних

#### Pop-out Dropdown:
- Pop-out Map
- Pop-out Table
- Pop-out Both

---

### 4. **ResizableSplit** (`components/asset-list/ResizableSplit.tsx`)

**Функціонал:**
- Розділювач між Map та Table панелями
- Drag-to-resize
- Snap points (30%, 40%, 50%, 60%, 70%)
- Keyboard shortcuts

**Інтеракції:**
- **Mouse drag на divider** → зміна пропорцій
  - Мінімальна ширина Map: 280px
  - Мінімальна ширина Table: 500px
  - Автоматичне snap до найближчого snap point (threshold 3%)
  
- **Keyboard shortcuts:**
  - `[` → збільшити Map на 10%
  - `]` → зменшити Map на 10%
  - `{` → збільшити Table на 10%
  - `}` → зменшити Table на 10%
  
- **onRatioChange(ratio)** → зберігає ratio в activeView.mapRatio

**Візуальні стани:**
- **Divider:** `w-1 bg-neutral-300 hover:bg-orange-500 cursor-col-resize`
- **While dragging:** `bg-orange-500`

---

### 5. **MapPanel** (`components/asset-list/MapPanel.tsx`)

**Функціонал:**
- Placeholder для мапи (ESRI integration later)
- Відображення assets markers
- Controls для мапи

**Інтеракції:**
- **Click на marker** → `onAssetSelect(assetId)`
  - Вибирає asset в таблиці
  - Скролить до row в таблиці

**Props:**
- `assets: Asset[]` - список assets для відображення
- `selectedAssetId?: string` - вибраний asset
- `onAssetSelect: (id: string) => void` - callback при виборі
- `filters?: FilterConfig[]` - активні фільтри

---

### 6. **DataTable** (`components/asset-list/DataTable.tsx`)

**Функціонал:**
- Відображення assets в табличному форматі
- Sortable columns
- Selectable rows (checkbox)
- Clickable rows (навігація)
- Kebab menu для row actions
- Drag-to-reorder columns (в header)

**Інтеракції:**

#### Column Header:
- **Click на sortable column** → `onSort(column, 'asc')`
  - TODO: Реалізувати сортування
  
- **Drag column header** → `onColumnReorder(newOrder)`
  - Перетягування колонок для зміни порядку
  - Працює тільки після монтування (isMounted)
  - Оновлює `activeView.columnOrder`

#### Row Selection:
- **Checkbox в header** → `onRowSelect(allIds)` або `onRowSelect([])`
  - Select All / Deselect All
  
- **Checkbox в row** → `onRowSelect([...selectedRows, id])` або `onRowSelect(selectedRows.filter(...))`
  - Додає/видаляє row з selection

#### Row Click:
- **Click на row** → `onRowClick(asset)`
  - Навігація до `/inspection/${asset.id}`
  - Ігнорує clicks на interactive elements (checkbox, button)

#### Kebab Menu (⋮):
- **View Details** → навігація до `/inspection/${asset.id}`
- **Edit Asset** → TODO: відкрити edit dialog
- **Duplicate** → TODO: дублювати asset
- **Delete** → TODO: показати confirmation та видалити

**Візуальні стани:**
- **Selected row:** `bg-orange-50`
- **Alternating rows:** `bg-white` / `bg-neutral-50`
- **Hover:** `hover:bg-neutral-100`
- **Loading:** показує "Loading..." message
- **Empty:** показує "No assets found" message

---

### 7. **Pagination** (`components/asset-list/Pagination.tsx`)

**Функціонал:**
- Навігація між сторінками
- Items per page selector
- Відображення range: "X-Y of Z items"

**Інтеракції:**
- **First page button (⏮)** → `onPageChange(1)`
- **Previous page button (◀)** → `onPageChange(currentPage - 1)`
- **Page number button** → `onPageChange(page)`
- **Next page button (▶)** → `onPageChange(currentPage + 1)`
- **Last page button (⏭)** → `onPageChange(totalPages)`
- **Items per page selector** → `onItemsPerPageChange(perPage)`
  - Опції: 10, 25, 50, 100
  - Зберігає в `activeView.itemsPerPage`
  - Скидає на сторінку 1

**Візуальні стани:**
- **Current page:** `bg-primary text-primary-foreground`
- **Other pages:** `border bg-background hover:bg-accent`
- **Disabled buttons:** коли на першій/останній сторінці

---

### 8. **ViewSettingsDialog** (`components/asset-list/ViewSettingsDialog.tsx`)

**Функціонал:**
- Smart Tab (Column Picker)
- Filters Tab
- Налаштування колонок та фільтрів для view

**Інтеракції:**

#### Smart Tab (Columns):

##### Search:
- **Input field** → фільтрує колонки в real-time
- Пошук по `label` та `field`

##### Currently Displayed:
- Список доданих колонок
- **Drag-to-reorder** → зміна порядку колонок
  - Використовує `@dnd-kit`
  - Оновлює `displayedColumns` та `columnOrder`
- **Remove button (×)** → видаляє колонку з `displayedColumns`

##### Browse All Fields:
- Групування по таблицях: Asset, Inspection, Observation
- **Expand/Collapse sections** → toggle `expandedSections`
- **Add button (+)** → додає колонку до `displayedColumns`

#### Filters Tab:

##### Active Filters:
- Список активних фільтрів
- Кожен фільтр має:
  - **Field selector** → вибір поля для фільтрації
  - **Operator selector** → вибір оператора (equals, contains, startsWith, greaterThan, lessThan)
  - **Value input** → введення значення (залежить від типу поля)
  - **Remove button (×)** → видаляє фільтр

##### Filter Types:
- **Text:** Input field, оператори: equals, contains, startsWith
- **Number:** Number input, оператори: equals, greaterThan, lessThan
- **Date:** Date picker, оператори: equals, greaterThan, lessThan
- **Select:** Dropdown, оператор: equals
- **Boolean:** Dropdown (Yes/No), оператор: equals

##### Preview Count:
- Показує кількість assets що відповідають фільтрам
- Оновлюється в real-time при зміні фільтрів
- Показує "No assets match" якщо результатів немає

##### Actions:
- **Add Filter button** → додає новий фільтр
- **Clear All button** → видаляє всі фільтри

#### Save/Cancel:
- **Save Changes button** → `onSave(updatedView)`
  - Зберігає `displayedColumns`, `columnOrder`, `filters`
  - Оновлює `updatedAt`
  - Закриває діалог
  
- **Cancel button** → `onClose()`
  - Закриває діалог без збереження

**Візуальні покращення:**
- Color coding для типів полів (text=blue, number=green, date=purple, select=orange, boolean=gray)
- Іконки для операторів (=, >, <, ⊃, ⊂)
- Компактний layout

---

### 9. **SearchDialog** (`components/asset-list/SearchDialog.tsx`)

**Функціонал:**
- Пошук по всіх полях або конкретному полю
- Recent searches (збережені в localStorage)

**Інтеракції:**
- **Search input** → введення запиту
- **Field selector** → вибір поля для пошуку (All Fields, Pipe Segment, Street, Material, etc.)
- **Search button** або **Enter** → `onSearch(query, field)`
  - Зберігає в recent searches (до 5)
  - Оновлює `searchQuery` в state
  - Скидає pagination на сторінку 1
  - Закриває діалог

**Recent Searches:**
- Відображає останні 5 пошуків
- **Click на recent search** → виконує пошук
- Зберігається в `localStorage.getItem('asset-list-recent-searches')`

---

### 10. **ManageViewsDialog** (`components/asset-list/ManageViewsDialog.tsx`)

**Функціонал:**
- Управління views (rename, duplicate, delete, favorite)
- Створення нового view

**Інтеракції:**

#### Favorite Views Section:
- Список favorite views
- Кожен view має:
  - **Star button** → `handleToggleFavorite(viewId)`
  - **Edit button** → `handleStartEdit(view)` → inline editing
  - **Duplicate button** → `handleDuplicate(view)`
  - **Delete button** → `handleDelete(viewId)` з confirmation

#### All Views Section:
- Список всіх інших views
- Ті самі actions як для favorites

#### Inline Editing:
- **Edit button** → активація editing mode
- **Input field** → редагування назви
- **Save button** → `handleSaveEdit()` → зберігає зміни
- **Cancel button** → `handleCancelEdit()` → скасовує редагування

#### Create New View:
- **+ Create New View button** → `handleCreateNew()`
  - TODO: Відкриває діалог створення нового view

**Save Changes:**
- Всі зміни зберігаються через `onUpdateViews(updatedViews)`
- Оновлює `views` state в головному компоненті

---

### 11. **ActiveFiltersBar** (`components/asset-list/ActiveFiltersBar.tsx`)

**Функціонал:**
- Відображення активних фільтрів як chips в Toolbar
- Швидке видалення фільтрів

**Інтеракції:**
- **Click на chip** → `onOpenViewSettings()`
  - Відкриває View Settings з Filters tab
  
- **Click "×" на chip** → `onRemoveFilter(filterId)`
  - Видаляє фільтр з `activeView.filters`
  - Оновлює view
  
- **"+X more" button** → `onOpenViewSettings()`
  - Показується якщо фільтрів більше ніж `maxVisible` (3)
  
- **"View all filters" button** → `onOpenViewSettings()`

**Візуальні стани:**
- **Filter chip:** `bg-neutral-100 border border-neutral-200 rounded-md`
- **Hover:** `hover:bg-neutral-200`

---

## 🔄 USER FLOWS

### 1. **Smart Tab (Column Picker) Flow**

```
Користувач → Click "View Settings" button в Toolbar
           ↓
    ViewSettingsDialog відкривається (Smart Tab активний)
           ↓
    Користувач бачить:
    - Currently Displayed columns (з drag handles)
    - Search field
    - Browse All Fields (груповані по таблицях)
           ↓
    Варіант A: Додати колонку
    → Розгорнути секцію (Asset/Inspection/Observation)
    → Click "Add" на колонці
    → Колонка додається до "Currently Displayed"
           ↓
    Варіант B: Переставити колонки
    → Drag column header в "Currently Displayed"
    → Drop на нову позицію
    → Порядок оновлюється
           ↓
    Варіант C: Видалити колонку
    → Click "×" на колонці в "Currently Displayed"
    → Колонка видаляється
           ↓
    Click "Save Changes"
    → View оновлюється
    → Table відображає нові колонки в новому порядку
    → Діалог закривається
```

**Альтернативний шлях:**
- **Drag-to-reorder прямо в таблиці:**
  - Користувач drag column header в DataTable
  - Порядок оновлюється в real-time
  - Зберігається в `activeView.columnOrder`

---

### 2. **Filter Flow**

```
Користувач → Click "View Settings" button в Toolbar
           ↓
    ViewSettingsDialog відкривається
           ↓
    Click "Filters" tab
           ↓
    Користувач бачить:
    - Active Filters (якщо є)
    - Preview count (якщо є фільтри)
    - "Add Filter" button
           ↓
    Click "Add Filter"
    → Створюється новий фільтр з default значеннями
           ↓
    Налаштування фільтра:
    → Select Field (Material, Width, Certificate Number, etc.)
    → Select Operator (equals, contains, >, <, etc.)
    → Enter Value (залежить від типу поля)
           ↓
    Preview count оновлюється в real-time
    → Показує кількість assets що відповідають
           ↓
    Можна додати більше фільтрів
    → Кожен фільтр застосовується з AND логікою
           ↓
    Click "Save Changes"
    → Фільтри зберігаються в `activeView.filters`
    → Table фільтрується
    → Active Filters Bar показує фільтри в Toolbar
    → Діалог закривається
```

**Швидке видалення фільтра:**
```
Користувач → Бачить filter chip в Active Filters Bar
           ↓
    Click "×" на chip
    → Фільтр видаляється
    → Table оновлюється
    → View зберігається
```

**Перегляд всіх фільтрів:**
```
Користувач → Click "View all filters" в Active Filters Bar
           ↓
    ViewSettingsDialog відкривається з Filters tab
           ↓
    Користувач бачить всі фільтри
    → Може редагувати
    → Може видаляти
    → Може додавати нові
```

---

### 3. **Add New Tab (View) Flow**

```
Користувач → Click "+ New View" button в ViewTabs
           ↓
    TODO: Відкривається Create View Dialog
           ↓
    Користувач вводить:
    - Name для view
    - (Опціонально) вибирає базовий view для копіювання
           ↓
    Click "Create"
    → Створюється новий view з default налаштуваннями
    → View додається до списку views
    → View стає активним
    → Table оновлюється з новим view
```

**Альтернативний шлях через Manage Views:**
```
Користувач → Click "Manage Views" в ViewTabs
           ↓
    ManageViewsDialog відкривається
           ↓
    Click "+ Create New View"
    → TODO: Відкривається Create View Dialog
           ↓
    Створення view (як вище)
```

**Дублювання існуючого view:**
```
Користувач → Click "Manage Views" в ViewTabs
           ↓
    ManageViewsDialog відкривається
           ↓
    Click "Duplicate" на view
    → Створюється копія з назвою "{Original Name} - Copy"
    → Копія не є favorite
    → View додається до списку
```

---

### 4. **Table Interactions Flow**

#### 4.1. **Row Selection**

```
Користувач → Click checkbox в header
           ↓
    Всі rows вибираються
    → Toolbar показує Context Actions
    → Показує "{count} selected"
           ↓
    Користувач може:
    → Click "Edit" → редагування вибраних
    → Click "Delete" → видалення вибраних
    → Click "Export Selected" → експорт
           ↓
    Або click checkbox знову → deselect all
```

**Одиночний вибір:**
```
Користувач → Click checkbox на row
           ↓
    Row вибирається
    → Toolbar показує Context Actions
    → Map може highlight marker
```

#### 4.2. **Row Navigation**

```
Користувач → Click на row (не на checkbox/button)
           ↓
    Навігація до `/inspection/${asset.id}`
    → Відкривається Inspection Detail Screen
```

#### 4.3. **Row Actions (Kebab Menu)**

```
Користувач → Click "⋮" button на row
           ↓
    Dropdown menu відкривається
           ↓
    Варіанти:
    → "View Details" → навігація до Inspection Detail
    → "Edit Asset" → TODO: відкрити edit dialog
    → "Duplicate" → TODO: дублювати asset
    → "Delete" → TODO: показати confirmation та видалити
```

#### 4.4. **Column Sorting**

```
Користувач → Click на column header (якщо sortable)
           ↓
    TODO: Table сортується по цій колонці
    → Показує arrow indicator (↑↓)
    → Зберігає sort state
```

#### 4.5. **Column Reordering**

```
Користувач → Drag column header
           ↓
    Column переміщується
    → Visual feedback (opacity, transform)
           ↓
    Drop на нову позицію
    → Порядок оновлюється
    → Зберігається в `activeView.columnOrder`
    → Table відображає новий порядок
```

---

## 📊 STATE MANAGEMENT

### Головний State (`app/assets/page.tsx`):

```typescript
// Views
const [views, setViews] = useState<View[]>(mockViews);
const [activeViewId, setActiveViewId] = useState<string>('view-1');

// Assets
const [assets, setAssets] = useState<Asset[]>(mockAssets);

// Selection
const [selectedRows, setSelectedRows] = useState<string[]>([]);

// Pagination
const [currentPage, setCurrentPage] = useState(1);

// Search
const [searchQuery, setSearchQuery] = useState('');

// Dialogs
const [viewSettingsOpen, setViewSettingsOpen] = useState(false);
const [searchOpen, setSearchOpen] = useState(false);
const [manageViewsOpen, setManageViewsOpen] = useState(false);
```

### Computed Values:

```typescript
// Active View
const activeView = useMemo(() => {
  return views.find(v => v.id === activeViewId) || views[0];
}, [views, activeViewId]);

// Filtered Assets
const filteredAssets = useMemo(() => {
  // Застосовує фільтри з activeView.filters
  // Застосовує searchQuery
  return filtered;
}, [assets, activeView, searchQuery]);

// Displayed Columns
const displayedColumns = useMemo(() => {
  // Використовує activeView.columnOrder або activeView.displayedColumns
  return columns;
}, [activeView]);

// Paginated Assets
const paginatedAssets = useMemo(() => {
  // Пагінація filteredAssets
  return paginated;
}, [filteredAssets, currentPage, itemsPerPage]);
```

---

## 🎯 ОСНОВНІ ІНТЕРАКЦІЇ (Детальний опис)

### 1. **Smart Tab (Column Picker)**

**Тригери:**
- Click "View Settings" button в Toolbar
- Click на filter chip в Active Filters Bar
- Click "View all filters" в Active Filters Bar

**Кроки:**
1. Діалог відкривається з Smart Tab активним
2. Користувач бачить:
   - Search field (для пошуку колонок)
   - Currently Displayed (список доданих колонок з drag handles)
   - Browse All Fields (груповані по Asset/Inspection/Observation)
3. Дії:
   - **Додати колонку:** Розгорнути секцію → Click "Add"
   - **Видалити колонку:** Click "×" в Currently Displayed
   - **Переставити колонки:** Drag column в Currently Displayed
   - **Пошук:** Ввести текст в Search field
4. Save Changes → оновлює view, закриває діалог

**Альтернативний спосіб:**
- Drag column header прямо в таблиці
- Порядок оновлюється в real-time
- Зберігається автоматично

---

### 2. **Filter**

**Тригери:**
- Click "View Settings" → Filters tab
- Click "View all filters" в Active Filters Bar

**Кроки:**
1. Діалог відкривається з Filters tab активним
2. Користувач бачить:
   - Active Filters (якщо є)
   - Preview count (кількість matching assets)
   - "Add Filter" button
3. Додавання фільтра:
   - Click "Add Filter"
   - Select Field (dropdown)
   - Select Operator (залежить від типу поля)
   - Enter Value (input field, залежить від типу)
   - Preview count оновлюється автоматично
4. Редагування фільтра:
   - Змінити Field/Operator/Value
   - Preview count оновлюється
5. Видалення фільтра:
   - Click "×" на фільтрі
   - Або "Clear All"
6. Save Changes → фільтри застосовуються, Active Filters Bar оновлюється

**Швидке видалення:**
- Click "×" на filter chip в Toolbar
- Фільтр видаляється одразу

---

### 3. **Add New Tab (View)**

**Тригери:**
- Click "+ New View" button в ViewTabs
- Click "+ Create New View" в ManageViewsDialog

**Кроки:**
1. TODO: Відкривається Create View Dialog
2. Користувач вводить:
   - Name для view
   - (Опціонально) вибирає базовий view
3. Click "Create"
4. View створюється з:
   - Default columns
   - Empty filters
   - Default mapRatio (40)
   - Default itemsPerPage (100)
5. View стає активним
6. Table оновлюється

**Дублювання:**
- Click "Duplicate" в ManageViewsDialog
- Створюється копія з "- Copy" suffix
- Копія не є favorite

---

### 4. **Table Interactions**

#### 4.1. **Selection**

**Тригери:**
- Click checkbox в header (select all)
- Click checkbox на row (select one)

**Кроки:**
1. Checkbox змінює стан
2. `selectedRows` оновлюється
3. Toolbar показує Context Actions
4. Map може highlight markers

**Deselect:**
- Click checkbox знову
- Або click checkbox в header (deselect all)

#### 4.2. **Navigation**

**Тригери:**
- Click на row (не на interactive elements)

**Кроки:**
1. `onRowClick(asset)` викликається
2. Навігація до `/inspection/${asset.id}`
3. Inspection Detail Screen відкривається

#### 4.3. **Row Actions**

**Тригери:**
- Click "⋮" button на row

**Кроки:**
1. Dropdown menu відкривається
2. Користувач вибирає action:
   - View Details → навігація
   - Edit Asset → TODO: edit dialog
   - Duplicate → TODO: duplicate
   - Delete → TODO: confirmation + delete

#### 4.4. **Column Sorting**

**Тригери:**
- Click на sortable column header

**Кроки:**
1. TODO: Table сортується
2. Arrow indicator показує напрямок
3. Sort state зберігається

#### 4.5. **Column Reordering**

**Тригери:**
- Drag column header в таблиці

**Кроки:**
1. Mouse down на column header
2. Drag початок
3. Visual feedback (opacity, transform)
4. Drop на нову позицію
5. `onColumnReorder(newOrder)` викликається
6. `activeView.columnOrder` оновлюється
7. Table відображає новий порядок

---

## 🔑 KEYBOARD SHORTCUTS

### ResizableSplit:
- `[` → збільшити Map на 10%
- `]` → зменшити Map на 10%
- `{` → збільшити Table на 10%
- `}` → зменшити Table на 10%

### SearchDialog:
- `Enter` → виконати пошук

### ViewSettingsDialog:
- `Esc` → закрити діалог (через Dialog component)

---

## 📝 TODO / НЕ РЕАЛІЗОВАНО

### Функціонал:
- [ ] Create View Dialog (створення нового view)
- [ ] Edit Asset Dialog (редагування asset)
- [ ] Duplicate Asset функціонал
- [ ] Delete Asset з confirmation
- [ ] Column Sorting (тільки UI, логіка не реалізована)
- [ ] Pop-out Map/Table windows
- [ ] Export функціонал
- [ ] Print функціонал
- [ ] Find & Replace
- [ ] Validate Inspection

### UX Improvements:
- [ ] Filter Presets (збереження наборів фільтрів)
- [ ] AND/OR логіка для фільтрів
- [ ] Column Width Control
- [ ] Quick Actions для Column Picker (Select All, Clear All для груп)
- [ ] Preview колонок перед додаванням
- [ ] Keyboard shortcuts для всіх actions

---

## 🎨 ВІЗУАЛЬНІ ДЕТАЛІ

### Кольори:
- **Primary:** Orange (`orange-500`, `orange-600`)
- **Background:** White (`bg-white`)
- **Borders:** Neutral (`border-neutral-200`)
- **Text:** Neutral (`text-neutral-700`, `text-neutral-600`)
- **Selected:** Orange light (`bg-orange-50`)
- **Hover:** Neutral light (`hover:bg-neutral-100`)

### Filter Color Coding:
- **Text:** Blue (`bg-blue-50`, `border-blue-200`)
- **Number:** Green (`bg-green-50`, `border-green-200`)
- **Date:** Purple (`bg-purple-50`, `border-purple-200`)
- **Select:** Orange (`bg-orange-50`, `border-orange-200`)
- **Boolean:** Gray (`bg-neutral-50`, `border-neutral-200`)

### Spacing:
- **Header:** `pt-16` (64px)
- **ViewTabs:** `h-12` (48px)
- **Toolbar:** `min-h-14` (56px)
- **Table row:** `h-12` (48px)
- **Pagination:** `px-4 py-3` (16px vertical)

---

**END OF DOCUMENT**

Цей документ описує весь функціонал та інтеракції реалізовані в Asset List Screen станом на 27.11.2025.

