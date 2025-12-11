# 📋 ПЛАН РЕАЛІЗАЦІЇ: Core Vision Asset List Updates

**Режим:** [MODE: PLAN]  
**Дата:** 2025-12-10  
**Джерело:** new-update-filters-and-other.md  
**Пріоритет:** Critical (10) → Important (3)

---

## 🎯 ЗАГАЛЬНА СТРАТЕГІЯ

### Аналіз поточної структури:
- ✅ DataTable має inline editing з Save/Cancel кнопками (потрібно змінити на auto-save)
- ✅ ActionsColumn.tsx існує, але не використовується в DataTable (потрібно інтегрувати як fixed column)
- ✅ FloatingSelectionBar має "Open in Tabs" (потрібно замінити на "Open Compare")
- ✅ FindReplaceDialog має тільки "selection" та "project" scope (потрібно додати "Entire view")
- ✅ Filters вже реалізовані в ViewSettingsDialog та app/page.tsx
- ✅ MapPanel має базову функціональність (потрібно додати search та plot defects)

### Порядок реалізації:
1. **Фаза 1 (Critical 1-4):** Quick Actions, Auto-save, Open Compare, Find & Replace scope
2. **Фаза 2 (Critical 5-7):** Snapshots Panel, Plot Defects, Map Search
3. **Фаза 3 (Critical 8-10):** Views vs Filters model, AND/OR grouping, Rename Template
4. **Фаза 4 (Important 11-13):** Report Preview, Map Layers, Views Sharing

---

## 🔴 ФАЗА 1: CRITICAL UPDATES 1-4

### 1. Quick Actions - Fixed Floating Column

**Проблема:** Quick Actions колонка скролиться разом з таблицею і ховається.

**Рішення:** Створити fixed sticky колонку справа, яка завжди видима.

**Файли для модифікації:**
- `components/asset-list/DataTable.tsx` - інтегрувати ActionsColumn як fixed column
- `components/asset-list/ActionsColumn.tsx` - оновити стилі для sticky positioning

**Технічні деталі:**

**Крок 1.1: Оновити ActionsColumn.tsx**
- [ ] Оновити `ActionsColumnHeader`:
  - Додати `sticky right-0 z-20` до TableHead
  - Ширина: `w-[60px]` (мінімальна для kebab icon)
  - Background: `bg-white`
  - Border: `border-l border-neutral-200`
  - Shadow: `shadow-[inset_4px_0_6px_-2px_rgba(0,0,0,0.05)]` (ліва тінь)
- [ ] Оновити `ActionsColumnCell`:
  - Додати `sticky right-0 z-10` до TableCell
  - Ті ж стилі що і в header
  - Центрувати kebab menu button
  - Зменшити padding: `px-2`

**Крок 1.2: Інтегрувати в DataTable.tsx**
- [ ] Імпортувати `ActionsColumnHeader` та `ActionsColumnCell` з ActionsColumn.tsx
- [ ] Додати ActionsColumnHeader в TableHeader ПІСЛЯ всіх data columns
- [ ] Додати ActionsColumnCell в кожен TableRow ПІСЛЯ всіх data cells
- [ ] Видалити стару реалізацію actions (DropdownMenu в TableCell)
- [ ] Передати props до ActionsColumnCell:
  - `asset`, `onViewDetails`, `onEdit`, `onDuplicate`, `onDelete`
- [ ] Обгорнути таблицю в div з `overflow-x-auto` для горизонтального скролу

**Крок 1.3: Оновити структуру таблиці**
- [ ] Переконатися що scrollable area (ліва частина) має `overflow-x-auto`
- [ ] Fixed column (права частина) має `position: sticky; right: 0`
- [ ] Z-index: header = 20, cells = 10 (щоб header був вище)

**Тестування:**
- [ ] Перевірити що колонка завжди видима при горизонтальному скролі
- [ ] Перевірити що kebab menu відкривається правильно
- [ ] Перевірити що тінь з'являється коли контент скролиться під колонку
- [ ] Перевірити на різних розмірах екрану

---

### 2. Table Editing - Auto-save on Enter

**Проблема:** Потрібно натискати Save кнопку для збереження змін.

**Рішення:** Auto-save при натисканні Enter або blur (клік поза полем).

**Файли для модифікації:**
- `components/asset-list/DataTable.tsx` - змінити логіку збереження

**Технічні деталі:**

**Крок 2.1: Оновити inline editing handlers**
- [ ] Видалити Save/Cancel кнопки з edit mode
- [ ] Додати `onKeyDown` handler до Input:
  - Enter → викликати `handleSaveCell` (auto-save)
  - Escape → викликати `cancelEditing` (скасувати без збереження)
- [ ] Додати `onBlur` handler до Input:
  - Викликати `handleSaveCell` (auto-save при blur)

**Крок 2.2: Створити handleSaveCell функцію**
- [ ] Валідація поля (якщо потрібно)
- [ ] Якщо невалідно: показати error, залишити в edit mode
- [ ] Якщо валідно:
  - Викликати `onUpdateAsset(editingRowId, { [field]: newValue })`
  - Показати success indicator (зелений checkmark на 500ms)
  - Вийти з edit mode (`setEditingRowId(null)`)

**Крок 2.3: Додати visual feedback**
- [ ] Editing state: синя border + focus ring на Input
- [ ] Saving state: показати spinner (200ms max) - можна використати Loader2 іконку
- [ ] Saved state: зелений checkmark зліва від cell (500ms)
- [ ] Error state: червона border + error message під cell

**Крок 2.4: Оновити edit mode trigger**
- [ ] Double-click на editable cell → входить в edit mode
- [ ] Edit з Quick Actions → входить в edit mode для всієї row
- [ ] При edit mode: всі editable cells стають Input полями

**Тестування:**
- [ ] Перевірити auto-save на Enter
- [ ] Перевірити auto-save на blur
- [ ] Перевірити скасування на Escape
- [ ] Перевірити visual feedback (saving, saved, error)
- [ ] Перевірити валідацію

---

### 3. Bulk Action: "Open Compare" (Replace "Open in tabs")

**Проблема:** "Open in tabs" не корисна, потрібно порівняння двох inspections.

**Рішення:** Замінити на "Open Compare", яка активна тільки коли вибрано рівно 2 rows.

**Файли для модифікації:**
- `components/asset-list/FloatingSelectionBar.tsx` - замінити кнопку та логіку
- `app/page.tsx` - додати handler для navigation

**Технічні деталі:**

**Крок 3.1: Оновити FloatingSelectionBar.tsx**
- [ ] Замінити "Open in Tabs" кнопку на "Open Compare"
- [ ] Додати умову enabled/disabled:
  - Enabled тільки коли `selectedAssets.length === 2`
  - Disabled коли 0, 1, або 3+ selected
- [ ] Оновити стилі:
  - Disabled: `opacity-50 cursor-not-allowed`
  - Enabled: нормальні стилі
- [ ] Додати Tooltip:
  - Disabled: "Select exactly 2 inspections to compare"
  - Enabled: "Open comparison view"
- [ ] Оновити іконку: можна використати `GitCompare` з lucide-react

**Крок 3.2: Створити handleOpenCompare handler**
- [ ] Перевірити що `selectedAssets.length === 2`
- [ ] Взяти два inspection IDs
- [ ] Навігувати до `/inspection-viewer?mode=compare&current={id1}&previous={id2}`
- [ ] Використати `router.push()` з useRouter

**Крок 3.3: Інтегрувати в app/page.tsx**
- [ ] Створити `handleOpenCompare` функцію
- [ ] Передати як prop `onOpenCompare` до FloatingSelectionBar
- [ ] Видалити старий `onOpenInTabs` handler

**Тестування:**
- [ ] Перевірити що кнопка disabled при 0, 1, 3+ selected
- [ ] Перевірити що кнопка enabled при 2 selected
- [ ] Перевірити tooltip на disabled стані
- [ ] Перевірити navigation до compare view

---

### 4. Find & Replace - Scope Updates

**Проблема:** Немає "Entire view" scope, тільки "Selection" та "Entire project".

**Рішення:** Додати "Entire view" scope та перейменувати "Entire project" на "Project".

**Файли для модифікації:**
- `components/asset-list/FindReplaceDialog.tsx` - додати новий scope

**Технічні деталі:**

**Крок 4.1: Оновити scope type**
- [ ] Змінити тип scope: `'selection' | 'entireView' | 'project'`
- [ ] Оновити state: `const [scope, setScope] = useState<'selection' | 'entireView' | 'project'>('selection')`

**Крок 4.2: Оновити UI для scope selection**
- [ ] Додати третю опцію в RadioGroup:
  - "Selected rows" (X rows selected) - selection
  - "Entire view" (Y rows in view) - entireView (НОВИЙ)
  - "Project" (Z total assets) - project (перейменовано)
- [ ] Додати опис для кожної опції
- [ ] Показувати count для кожної опції

**Крок 4.3: Оновити логіку matchedAssets**
- [ ] Оновити `useMemo` для matchedAssets:
  - Якщо scope === 'selection': використовувати selectedAssetIds
  - Якщо scope === 'entireView': використовувати filteredAssets (всі assets після фільтрів)
  - Якщо scope === 'project': використовувати всі assets
- [ ] Передати `filteredAssets` як prop до FindReplaceDialog

**Крок 4.4: Додати typeahead для "Find what" та "Replace with"**
- [ ] Створити state для suggestions: `const [suggestions, setSuggestions] = useState<string[]>([])`
- [ ] При зміні `findValue` або `field`:
  - Зібрати унікальні значення з обраного scope
  - Фільтрувати по введеному тексту
  - Показати до 8 suggestions
- [ ] Додати Combobox або Autocomplete до Input полів
- [ ] Додати keyboard navigation (Arrow keys + Enter)

**Крок 4.5: Додати Project dropdown (якщо scope === 'project')**
- [ ] Показати Select dropdown тільки коли scope === 'project'
- [ ] Заповнити списком доступних projects
- [ ] Додати typeahead search в dropdown

**Крок 4.6: Оновити інтеграцію в app/page.tsx**
- [ ] Передати `filteredAssets` як prop до FindReplaceDialog
- [ ] Оновити `handleFindReplace` для обробки нового scope

**Тестування:**
- [ ] Перевірити що "Entire view" scope працює
- [ ] Перевірити що "Project" перейменовано
- [ ] Перевірити що counts правильні для кожного scope
- [ ] Перевірити typeahead suggestions
- [ ] Перевірити keyboard navigation

---

## 🔴 ФАЗА 2: CRITICAL UPDATES 5-7

### 5. Snapshots Panel on Single-Select

**Проблема:** При виборі одного row не показуються snapshots.

**Рішення:** Показувати snapshots panel над мапою коли вибрано один asset.

**Файли для модифікації:**
- `components/asset-list/SnapshotsPanel.tsx` - створити новий компонент
- `app/page.tsx` - інтегрувати panel та логіку
- `components/asset-list/MapPanel.tsx` - оновити layout для panel

**Технічні деталі:**

**Крок 5.1: Створити SnapshotsPanel.tsx**
- [ ] Створити компонент що приймає:
  - `asset: Asset | null` - обраний asset
  - `onClose: () => void` - закрити panel
  - `onSnapshotClick: (snapshotId: string) => void` - клік на snapshot
- [ ] Додати state для visible grades: `const [visibleGrades, setVisibleGrades] = useState<number[]>([0,1,2,3,4,5])`
- [ ] Створити mock data для snapshots (поки що)
- [ ] UI структура:
  - Header з назвою asset та Close button
  - Visible Grades filter (checkbox group)
  - Snapshots grid (горизонтальний scroll)
  - Кожен snapshot card: thumbnail, distance, code, grade indicator

**Крок 5.2: Інтегрувати в app/page.tsx**
- [ ] Додати state: `const [selectedAssetForSnapshots, setSelectedAssetForSnapshots] = useState<Asset | null>(null)`
- [ ] Оновити `handleRowClick`:
  - Якщо вибрано один row: встановити `setSelectedAssetForSnapshots(asset)`
  - Якщо вибрано інший row: оновити `setSelectedAssetForSnapshots(newAsset)`
  - Якщо deselect: встановити `setSelectedAssetForSnapshots(null)`
- [ ] Додати SnapshotsPanel в layout ПЕРЕД MapPanel
- [ ] Показувати тільки коли `selectedAssetForSnapshots !== null`

**Крок 5.3: Оновити MapPanel layout**
- [ ] Коли SnapshotsPanel видимий:
  - Зменшити висоту мапи на ~200px
  - Panel займає 30% ширини, мапа 30% ширини
  - Table залишається 70% ширини (не змінюється)

**Крок 5.4: Додати навігацію мапи до asset**
- [ ] При виборі asset в таблиці:
  - MapPanel автоматично навігує до цього asset (використати `autoZoomToAssets`)
  - Highlight asset на мапі

**Тестування:**
- [ ] Перевірити що panel з'являється при single-select
- [ ] Перевірити що panel оновлюється при зміні selection
- [ ] Перевірити що panel зникає при deselect
- [ ] Перевірити visible grades filter
- [ ] Перевірити навігацію мапи

---

### 6. Plot Defects on Map

**Проблема:** Мапа не показує де саме на pipe знаходяться defects.

**Рішення:** Показати plot points на обраному pipe segment з кольорами по grade.

**Файли для модифікації:**
- `components/asset-list/MapPanel.tsx` - додати plot points rendering
- `lib/types/asset-list.ts` - додати PlotPoint interface

**Технічні деталі:**

**Крок 6.1: Додати PlotPoint interface**
- [ ] Створити `interface PlotPoint` в `lib/types/asset-list.ts`:
  - `id: string`
  - `distance: number` (в feet)
  - `code: string`
  - `grade: 0 | 1 | 2 | 3 | 4 | 5`
  - `lat: number`
  - `lng: number`
  - `observationId: string`

**Крок 6.2: Створити helper для розрахунку позицій**
- [ ] Створити `calculatePlotPosition()` функцію:
  - Приймає: pipeStartCoords, pipeEndCoords, pipeLength, observationDistance
  - Повертає: { lat, lng } через linear interpolation
- [ ] Додати в `lib/utils/map-utils.ts` (створити файл якщо потрібно)

**Крок 6.3: Оновити MapPanel.tsx**
- [ ] Додати state для plot points: `const [plotPoints, setPlotPoints] = useState<PlotPoint[]>([])`
- [ ] При виборі asset:
  - Отримати observations для цього asset (mock data поки що)
  - Розрахувати позиції для кожного observation
  - Встановити plotPoints
- [ ] Додати rendering plot points на canvas:
  - Малювати маленькі кола (8px diameter) на позиціях
  - Кольори по grade:
    - Grade 0-1: Green (#10b981)
    - Grade 2: Yellow (#fbbf24)
    - Grade 3: Orange (#f97316)
    - Grade 4-5: Red (#ef4444)
  - Білий border (1px) для контрасту

**Крок 6.4: Додати hover interaction**
- [ ] При hover на plot point:
  - Показати tooltip з: distance, code, grade
  - Можна використати popup або HTML overlay

**Крок 6.5: Додати click interaction**
- [ ] При click на plot point:
  - Відкрити inspection viewer на цьому observation
  - Або highlight в SnapshotsPanel

**Крок 6.6: Інтегрувати з Visible Grades filter**
- [ ] Якщо SnapshotsPanel має visible grades filter:
  - Фільтрувати plot points по visible grades
  - Оновлювати в real-time

**Тестування:**
- [ ] Перевірити що plot points з'являються при виборі asset
- [ ] Перевірити що кольори правильні по grade
- [ ] Перевірити hover tooltip
- [ ] Перевірити click navigation
- [ ] Перевірити фільтрацію по visible grades

---

### 7. Map Search (Separate from Table Search)

**Проблема:** Є тільки один search для таблиці, потрібен окремий для мапи (ESRI data).

**Рішення:** Додати окремий search box для мапи в MapPanel.

**Файли для модифікації:**
- `components/asset-list/MapPanel.tsx` - додати search UI та логіку
- `components/asset-list/MapSearch.tsx` - створити новий компонент (опціонально)

**Технічні деталі:**

**Крок 7.1: Створити MapSearch компонент (або додати в MapPanel)**
- [ ] Створити search input з іконкою (magnifying glass + map pin)
- [ ] Розташування: top-right мапи
- [ ] Placeholder: "Search map network..."
- [ ] Стилі: відрізнятися від table search (синій колір замість сірого)

**Крок 7.2: Додати search state та logic**
- [ ] Додати state: `const [mapSearchQuery, setMapSearchQuery] = useState('')`
- [ ] Додати state для results: `const [mapSearchResults, setMapSearchResults] = useState<NetworkAsset[]>([])`
- [ ] Створити `searchMapNetwork()` функцію:
  - Приймає query string
  - Шукає в ESRI database (mock data поки що)
  - Повертає масив NetworkAsset (може включати assets НЕ в таблиці)

**Крок 7.3: Додати results dropdown**
- [ ] Показувати dropdown з результатами (до 10)
- [ ] Кожен результат: Asset ID, Address, Type (Manhole/Pipe)
- [ ] При click на результат:
  - Навігувати мапу до цього asset
  - Highlight asset на мапі
  - Якщо asset в таблиці: highlight row
  - Якщо asset НЕ в таблиці: показати "Create Work Order" кнопку

**Крок 7.4: Додати debounce для search**
- [ ] Використати `useDebounce` hook або setTimeout
- [ ] Затримка: 300ms перед виконанням search

**Крок 7.5: Візуальна відмінність від table search**
- [ ] Table search: сірий, зліва в Toolbar
- [ ] Map search: синій, справа в MapPanel
- [ ] Різні іконки для розрізнення

**Тестування:**
- [ ] Перевірити що search працює
- [ ] Перевірити що results показуються
- [ ] Перевірити navigation до asset
- [ ] Перевірити "Create Work Order" для assets не в таблиці
- [ ] Перевірити debounce

---

## 🔴 ФАЗА 3: CRITICAL UPDATES 8-10

### 8. Views vs Filters - Conceptual Model

**Проблема:** Неясна різниця між Views та Filters.

**Рішення:** Уточнити що View = Column Configuration + Filters + Sort Order.

**Файли для модифікації:**
- `components/asset-list/ViewSettingsDialog.tsx` - оновити UI та логіку
- `components/asset-list/CreateViewDialog.tsx` - додати filters в створення view
- `app/page.tsx` - розрізняти view filters та temporary filters

**Технічні деталі:**

**Крок 8.1: Оновити View interface (якщо потрібно)**
- [ ] Переконатися що View має:
  - `filters: FilterConfig[]` - filters збережені в view
  - `displayedColumns: string[]` - колонки
  - `columnOrder: string[]` - порядок колонок
  - `sortBy?: string` - сортування
  - `sortDirection?: 'asc' | 'desc'`

**Крок 8.2: Додати temporary filters state в app/page.tsx**
- [ ] Додати state: `const [temporaryFilters, setTemporaryFilters] = useState<FilterConfig[]>([])`
- [ ] Temporary filters додаються поверх view filters
- [ ] При зміні view: очищати temporary filters

**Крок 8.3: Оновити CreateViewDialog**
- [ ] Додати можливість налаштувати filters при створенні view
- [ ] Показати що filters будуть збережені в view

**Крок 8.4: Оновити ViewSettingsDialog**
- [ ] Показати що filters є частиною view
- [ ] Додати індикатор "from view" для view filters
- [ ] Додати можливість додавати temporary filters (не зберігаються в view)

**Крок 8.5: Оновити ActiveFiltersBar**
- [ ] Показувати які filters з view, які temporary
- [ ] Різні кольори/іконки для розрізнення

**Тестування:**
- [ ] Перевірити що view filters зберігаються
- [ ] Перевірити що temporary filters не зберігаються
- [ ] Перевірити що temporary filters очищаються при зміні view

---

### 9. AND/OR Grouping for Filters (Visual Block Builder)

**Проблема:** Неможливо групувати filters з дужками для складних умов.

**Рішення:** Створити visual block builder для груп filters.

**Файли для модифікації:**
- `components/asset-list/AdvancedFiltersDialog.tsx` - створити новий компонент
- `components/asset-list/ViewSettingsDialog.tsx` - додати кнопку "Advanced Filters"

**Технічні деталі:**

**Крок 9.1: Створити AdvancedFiltersDialog.tsx**
- [ ] Створити компонент з block builder UI
- [ ] Структура:
  - Groups (outlined boxes)
  - Conditions within groups (lines)
  - Field/Operator/Value (inline)
- [ ] State:
  - `groups: FilterGroup[]`
  - `groupOperator: 'AND' | 'OR'` (між групами)

**Крок 9.2: Створити FilterGroup interface**
- [ ] `interface FilterGroup`:
  - `id: string`
  - `conditions: FilterCondition[]`
  - `operator: 'AND' | 'OR'` (між умовами в групі)
- [ ] `interface ComplexFilter`:
  - `groups: FilterGroup[]`
  - `groupOperator: 'AND' | 'OR'`

**Крок 9.3: Реалізувати UI для groups**
- [ ] Візуальні блоки з border та background color
- [ ] Header з "Group 1", "Group 2" та Delete button
- [ ] Conditions всередині групи
- [ ] AND/OR selector між групами

**Крок 9.4: Реалізувати query translation**
- [ ] Створити `buildQuery(filter: ComplexFilter): string` функцію
- [ ] Перетворити groups в query string з дужками

**Крок 9.5: Інтегрувати в ViewSettingsDialog**
- [ ] Додати кнопку "Advanced Filters" в Filters tab
- [ ] Відкривати AdvancedFiltersDialog
- [ ] Зберігати complex filter в view

**Тестування:**
- [ ] Перевірити створення groups
- [ ] Перевірити додавання conditions до groups
- [ ] Перевірити AND/OR між groups
- [ ] Перевірити query translation
- [ ] Перевірити застосування filters

---

### 10. Rename "Template" → "Existing Tab"

**Проблема:** Термін "Template" конфліктує з database templates.

**Рішення:** Перейменувати на "Existing Tab" або "Existing View".

**Файли для модифікації:**
- `components/asset-list/CreateViewDialog.tsx` - замінити всі посилання на "Template"

**Технічні деталі:**

**Крок 10.1: Знайти всі посилання на "Template"**
- [ ] Пошук по всьому проекту: `grep -r "Template" components/`
- [ ] Замінити на "Existing Tab" або "Existing View"

**Крок 10.2: Оновити CreateViewDialog**
- [ ] Замінити "Select Template" → "Select Starting Point"
- [ ] Замінити "Use Template" → "Use Existing Tab"
- [ ] Замінити "Select a template..." → "Select an existing tab..."
- [ ] Оновити help text

**Крок 10.3: Оновити інші місця (якщо є)**
- [ ] ViewSettingsDialog
- [ ] ManageViewsDialog
- [ ] Інші компоненти

**Тестування:**
- [ ] Перевірити що всі "Template" замінені
- [ ] Перевірити що UI зрозумілий
- [ ] Перевірити що функціональність не зламана

---

## 🟡 ФАЗА 4: IMPORTANT UPDATES 11-13

### 11. Report Generation - Preview Flow

**Проблема:** Немає можливості preview перед генерацією PDF.

**Рішення:** Додати preview step перед генерацією.

**Файли для модифікації:**
- `components/asset-list/ReportGenerationDialog.tsx` - додати preview step
- `components/asset-list/ReportPreviewDialog.tsx` - створити новий компонент (опціонально)

**Технічні деталі:**

**Крок 11.1: Додати preview step в ReportGenerationDialog**
- [ ] Додати step 3: Preview
- [ ] Показати thumbnail першої сторінки
- [ ] Показати metadata: project name, date, asset count, page count
- [ ] Показати checklist sections з можливістю include/exclude

**Крок 11.2: Створити preview data**
- [ ] Генерувати preview data перед показом
- [ ] Показати estimated page count
- [ ] Показати estimated file size

**Крок 11.3: Додати actions**
- [ ] "Edit Contents" - повернутися до configuration
- [ ] "Generate PDF" - продовжити до генерації

**Тестування:**
- [ ] Перевірити preview step
- [ ] Перевірити metadata display
- [ ] Перевірити sections checklist
- [ ] Перевірити navigation між steps

---

### 12. Map Layers - Hide/Pop-out Management

**Проблема:** 20+ layers блокують мапу, немає способу їх приховати.

**Рішення:** Додати можливість приховати layers panel та pop-out в окреме вікно.

**Файли для модифікації:**
- `components/asset-list/MapPanel.tsx` - додати layers management

**Технічні деталі:**

**Крок 12.1: Додати collapse/expand для layers panel**
- [ ] Додати кнопку [▶] / [◀] для collapse/expand
- [ ] При collapse: panel ховається, мапа займає всю ширину

**Крок 12.2: Додати pop-out функціональність**
- [ ] Додати кнопку [↗ Pop Out]
- [ ] При click: відкрити нове вікно з layers control
- [ ] Використати `window.open()` з BroadcastChannel для синхронізації

**Крок 12.3: Додати search/filter для layers**
- [ ] Додати search box в layers panel
- [ ] Фільтрувати layers по назві

**Крок 12.4: Додати grouping для layers**
- [ ] Організувати layers в collapsible groups
- [ ] Groups: Infrastructure, Observations, Reference

**Тестування:**
- [ ] Перевірити collapse/expand
- [ ] Перевірити pop-out window
- [ ] Перевірити search/filter
- [ ] Перевірити grouping

---

### 13. Views Sharing System + Bulk Actions

**Проблема:** Немає способу share views з іншими users.

**Рішення:** Додати sharing system з різними рівнями доступу.

**Файли для модифікації:**
- `components/asset-list/ShareViewDialog.tsx` - створити новий компонент
- `components/asset-list/ManageViewsDialog.tsx` - додати bulk actions

**Технічні деталі:**

**Крок 13.1: Створити ShareViewDialog**
- [ ] Додати рівні sharing:
  - Personal (default)
  - User Role
  - Specific Users
  - Project
  - Company-wide
- [ ] UI з radio buttons для вибору рівня
- [ ] Додати permissions: Can view, Can edit

**Крок 13.2: Додати bulk actions в ManageViewsDialog**
- [ ] Додати checkboxes для selection
- [ ] Додати bulk actions dropdown:
  - Share...
  - Duplicate
  - Export
  - Delete
- [ ] Додати bulk share dialog

**Крок 13.3: Додати sync & updates**
- [ ] При оновленні shared view: показати notification
- [ ] Users отримують notification про updates

**Тестування:**
- [ ] Перевірити sharing на різних рівнях
- [ ] Перевірити bulk actions
- [ ] Перевірити notifications

---

## ✅ ФІНАЛЬНА ПЕРЕВІРКА

### Тестування всіх функцій:
- [ ] **Critical 1-4:**
  - [ ] Quick Actions fixed column працює
  - [ ] Auto-save на Enter/blur працює
  - [ ] Open Compare працює для 2 selected
  - [ ] Find & Replace має "Entire view" scope

- [ ] **Critical 5-7:**
  - [ ] Snapshots Panel з'являється при single-select
  - [ ] Plot Defects показуються на мапі
  - [ ] Map Search працює окремо від Table Search

- [ ] **Critical 8-10:**
  - [ ] Views vs Filters модель зрозуміла
  - [ ] AND/OR Grouping працює
  - [ ] "Template" перейменовано на "Existing Tab"

- [ ] **Important 11-13:**
  - [ ] Report Preview показується перед генерацією
  - [ ] Map Layers можна приховати/pop-out
  - [ ] Views Sharing працює

### Code Quality:
- [ ] Всі компоненти < 300 рядків
- [ ] TypeScript типи дотримані
- [ ] Немає console.log (окрім TODO)
- [ ] Коментарі додані для складної логіки
- [ ] Edge cases оброблені

### Взаємодія з існуючим кодом:
- [ ] Нічого не поламано з поточної функціональності
- [ ] Backward compatibility збережена
- [ ] Mock data працює правильно

---

## 📝 ПРИМІТКИ

### Залежності між завданнями:
- **1 (Quick Actions)** може бути зроблено незалежно
- **2 (Auto-save)** потребує оновлення DataTable
- **3 (Open Compare)** потребує navigation до inspection viewer
- **4 (Find & Replace)** потребує filteredAssets prop
- **5 (Snapshots Panel)** потребує mock snapshot data
- **6 (Plot Defects)** потребує mock observation data
- **7 (Map Search)** потребує mock ESRI data
- **8 (Views vs Filters)** потребує оновлення View interface
- **9 (AND/OR Grouping)** складне, потребує нового компонента
- **10 (Rename Template)** просте, тільки текст
- **11-13 (Important)** можуть бути зроблені після Critical

### Рекомендований порядок виконання:
1. **Фаза 1 (1-4):** 4-5 годин
2. **Фаза 2 (5-7):** 5-6 годин
3. **Фаза 3 (8-10):** 4-5 годин
4. **Фаза 4 (11-13):** 3-4 години

**Загальний час:** ~16-20 годин

---

**КІНЕЦЬ ПЛАНУ**

---

# 📋 ПЛАН РЕАЛІЗАЦІЇ: Table Row Interactions & Quick Actions
**Режим:** [MODE: PLAN]  
**Дата:** 2025-12-11  
**Джерело:** new-table-interaction.md  
**Пріоритет:** Critical

---

## 🎯 ЗАГАЛЬНА СТРАТЕГІЯ

### Аналіз поточної структури:
- ✅ DataTable має базове inline editing (потрібно покращити)
- ✅ ActionsColumn існує, але має тільки kebab menu (потрібно додати окрему View кнопку)
- ✅ Row selection працює (потрібно покращити single-select з map navigation)
- ✅ SnapshotsPanel існує (потрібно інтегрувати з single-select)
- ✅ MapPanel інтегрований (потрібно додати навігацію при single-select)

### Порядок реалізації:
1. **Фаза 1:** Quick Actions Column - розділити на View + More
2. **Фаза 2:** Inline Field Editing - клік на поле для редагування
3. **Фаза 3:** Full Row Edit Mode - з меню Edit
4. **Фаза 4:** Single-Select з Map Navigation + Snapshots
5. **Фаза 5:** Duplicate та Delete функціональність
6. **Фаза 6:** Візуальні покращення та feedback

---

## 🔴 ФАЗА 1: Quick Actions Column - View + More Buttons

**Проблема:** Зараз є тільки kebab menu (⋮), потрібно окрему View кнопку (👁️) та More меню.

**Рішення:** Розділити на дві кнопки: View (завжди видима) та More (dropdown).

**Файли для модифікації:**
- `components/asset-list/ActionsColumn.tsx` - оновити структуру
- `components/asset-list/DataTable.tsx` - переконатися що колонка sticky

**Технічні деталі:**

**Крок 1.1: Оновити ActionsColumn.tsx**
- [ ] Оновити `ActionsColumnHeader`:
  - Збільшити ширину: `w-[90px]` (для двох кнопок)
  - Залишити sticky positioning
- [ ] Оновити `ActionsColumnCell`:
  - Змінити layout на flex з gap: `flex items-center gap-2 justify-center`
  - Додати дві окремі кнопки:
    1. **View Button (Eye icon 👁️)**:
       - `Eye` іконка з lucide-react
       - Size: 36px × 36px
       - Color: #6B7280 (gray-500)
       - Hover: #374151 (gray-700) + background #F3F4F6
       - Tooltip: "View Details"
       - Action: `onViewDetails(asset)`
    2. **More Button (Kebab ⋮)**:
       - `MoreVertical` іконка
       - Ті ж стилі що View
       - Dropdown menu з: Edit, Duplicate, Delete
  - Оновити стилі кнопок:
    - `h-9 w-9` (36px)
    - `rounded-md`
    - `hover:bg-gray-100`
    - `transition-colors`

**Крок 1.2: Оновити dropdown menu**
- [ ] Залишити тільки: Edit, Duplicate, Delete
- [ ] Видалити "View Details" з меню (тепер окрема кнопка)
- [ ] Стилізувати Delete як червоний текст

**Крок 1.3: Перевірити sticky positioning**
- [ ] Переконатися що колонка завжди видима при скролі
- [ ] Z-index правильний (header: 20, cells: 10)
- [ ] Shadow з'являється при скролі

**Тестування:**
- [ ] Перевірити що обидві кнопки видимі
- [ ] Перевірити hover стани
- [ ] Перевірити що View кнопка працює
- [ ] Перевірити що dropdown відкривається правильно

---

## 🔴 ФАЗА 2: Inline Field Editing - Click to Edit

**Проблема:** Зараз редагування тільки через Edit в меню, потрібно клік на поле.

**Рішення:** Додати можливість клікнути на editable field для редагування.

**Файли для модифікації:**
- `components/asset-list/DataTable.tsx` - додати click handler для полів

**Технічні деталі:**

**Крок 2.1: Додати click handler для editable fields**
- [ ] Визначити які поля editable:
  - `column.table === 'asset'`
  - `column.field !== 'id'`
  - `column.field !== 'pipeSegment'` (можливо залишити нередагуваним)
  - `column.type !== 'date'` (дати редагувати окремо)
- [ ] Додати `onClick` до TableCell для editable полів:
  - Якщо не в edit mode: входити в single field edit mode
  - Якщо вже в edit mode: не робити нічого (вже редагується)
- [ ] Додати visual indicator що поле editable:
  - Cursor: `cursor-pointer` на hover
  - Можна додати subtle edit icon на hover (опціонально)

**Крок 2.2: Оновити edit mode state**
- [ ] Додати `editingField: string | null` до state
- [ ] Можливі стани:
  - `editingRowId === null` → нормальний режим
  - `editingRowId !== null && editingField !== null` → single field edit
  - `editingRowId !== null && editingField === null` → full row edit
- [ ] При кліку на field:
  - `setEditingRowId(asset.id)`
  - `setEditingField(column.field)`
  - `setEditingValues({ [column.field]: currentValue })`

**Крок 2.3: Оновити auto-save логіку**
- [ ] Enter key: зберегти поле → вийти з edit mode
- [ ] Blur: зберегти поле → вийти з edit mode
- [ ] Escape: скасувати → вийти з edit mode
- [ ] Tab: зберегти поточне → перейти до наступного editable поля (якщо в full edit mode)

**Крок 2.4: Додати pre-select value**
- [ ] При вході в edit mode: виділити весь текст в Input
- [ ] Використати `autoFocus` та `select()` метод

**Тестування:**
- [ ] Перевірити клік на editable field
- [ ] Перевірити що тільки одне поле редагується
- [ ] Перевірити auto-save на Enter
- [ ] Перевірити auto-save на blur
- [ ] Перевірити cancel на Escape
- [ ] Перевірити pre-select тексту

---

## 🔴 ФАЗА 3: Full Row Edit Mode

**Проблема:** Потрібно редагувати всі поля одночасно.

**Рішення:** Edit з меню активує full row edit mode.

**Файли для модифікації:**
- `components/asset-list/DataTable.tsx` - додати full edit mode
- `components/asset-list/ActionsColumn.tsx` - оновити Edit handler

**Технічні деталі:**

**Крок 3.1: Оновити Edit handler**
- [ ] В `ActionsColumn.tsx`: `onEdit` викликає функцію що активує full edit
- [ ] В `DataTable.tsx`: створити `startFullRowEdit(asset)`:
  - `setEditingRowId(asset.id)`
  - `setEditingField(null)` // null означає full edit
  - `setEditingValues({ ...asset })` // всі поля

**Крок 3.2: Оновити rendering логіку**
- [ ] Якщо `editingRowId === asset.id && editingField === null`:
  - Всі editable поля стають Input
  - Row має distinct edit mode styling (жовтий/блакитний фон)
- [ ] Якщо `editingRowId === asset.id && editingField !== null`:
  - Тільки одне поле в edit mode
  - Row залишається нормальним

**Крок 3.3: Оновити save логіку для full edit**
- [ ] Blur на row (клік поза row): зберегти всі змінені поля
- [ ] Escape: скасувати всі зміни
- [ ] Tab між полями: зберігати поточне поле перед переходом
- [ ] Enter в останньому полі: зберегти всі поля → вийти з edit mode

**Крок 3.4: Додати visual feedback**
- [ ] Edit mode row: `bg-yellow-50` або `bg-blue-50`
- [ ] Border: `border-2 border-yellow-300` або `border-blue-300`
- [ ] Всі Input поля мають синю border

**Крок 3.5: Запобігти multiple rows в edit mode**
- [ ] При вході в edit mode на row B:
  - Якщо row A в edit mode: спочатку зберегти/скасувати row A
  - Показати confirmation якщо є незбережені зміни

**Тестування:**
- [ ] Перевірити що Edit з меню активує full edit
- [ ] Перевірити що всі поля стають editable
- [ ] Перевірити Tab navigation між полями
- [ ] Перевірити save на blur
- [ ] Перевірити cancel на Escape
- [ ] Перевірити що тільки один row в edit mode

---

## 🔴 ФАЗА 4: Single-Select з Map Navigation + Snapshots

**Проблема:** Потрібно покращити single-select для показу snapshots та навігації мапи.

**Рішення:** Оновити handleRowClick для single-select поведінки.

**Файли для модифікації:**
- `app/page.tsx` - оновити handleRowClick
- `components/asset-list/DataTable.tsx` - переконатися що row click працює правильно

**Технічні деталі:**

**Крок 4.1: Оновити handleRowClick в app/page.tsx**
- [ ] Поточна логіка:
  - Якщо `selectedRows.length === 1 && selectedRows[0] === asset.id`: показувати snapshots
  - Інакше: навігація до inspection page
- [ ] Нова логіка:
  - Якщо клік на вже вибраний row: залишити вибраним (snapshots вже показані)
  - Якщо клік на інший row:
    - Встановити `setSelectedRows([asset.id])`
    - Встановити `setSelectedAssetForSnapshots(asset)`
    - MapPanel автоматично навігує (через selectedAssetIds prop)
  - Якщо клік поза row (deselect): очистити selection

**Крок 4.2: Оновити MapPanel integration**
- [ ] Переконатися що `selectedAssetIds` передається правильно
- [ ] MapPanel має автоматично навігувати до обраного asset
- [ ] Highlight asset на мапі

**Крок 4.3: Оновити SnapshotsPanel integration**
- [ ] Переконатися що `selectedAssetForSnapshots` встановлюється при single-select
- [ ] Panel з'являється над мапою
- [ ] При закритті panel: deselect row

**Крок 4.4: Додати plot defects на мапі**
- [ ] Коли asset обраний: показати plot points з defects
- [ ] Кольори по grade (green/yellow/orange/red)
- [ ] Hover показує tooltip з інформацією

**Тестування:**
- [ ] Перевірити single-select → snapshots panel з'являється
- [ ] Перевірити single-select → map навігує
- [ ] Перевірити що plot defects показуються
- [ ] Перевірити deselect → panel зникає
- [ ] Перевірити що multi-select не показує snapshots

---

## 🔴 ФАЗА 5: Duplicate та Delete функціональність

**Проблема:** Duplicate та Delete не реалізовані.

**Рішення:** Додати handlers для Duplicate та Delete.

**Файли для модифікації:**
- `app/page.tsx` - додати handlers
- `components/asset-list/DataTable.tsx` - передати handlers
- `components/asset-list/DeleteConfirmDialog.tsx` - перевірити чи існує

**Технічні деталі:**

**Крок 5.1: Реалізувати Duplicate**
- [ ] Створити `handleDuplicate(asset)` в app/page.tsx:
  - Створити копію asset з новим ID
  - Додати суфікс "(Copy)" до pipeSegment
  - Додати до filteredAssets (mock data)
  - Показати success notification
  - Опціонально: відкрити новий asset в edit mode
- [ ] Передати handler до DataTable → ActionsColumn

**Крок 5.2: Реалізувати Delete з confirmation**
- [ ] Перевірити чи існує DeleteConfirmDialog
- [ ] Якщо ні: створити простий dialog
- [ ] Створити `handleDelete(asset)` в app/page.tsx:
  - Показати confirmation dialog
  - Якщо підтверджено: видалити з filteredAssets
  - Показати success notification
  - Очистити selection якщо видалений asset був обраний
- [ ] Передати handler до DataTable → ActionsColumn

**Крок 5.3: Оновити DeleteConfirmDialog (якщо існує)**
- [ ] Показати asset ID/pipeSegment в повідомленні
- [ ] Кнопки: "Cancel" та "Delete" (червона)
- [ ] Закрити при Cancel або поза dialog

**Тестування:**
- [ ] Перевірити Duplicate створює копію
- [ ] Перевірити що копія має новий ID
- [ ] Перевірити Delete показує confirmation
- [ ] Перевірити Delete видаляє asset
- [ ] Перевірити що selection очищається після delete

---

## 🔴 ФАЗА 6: Візуальні покращення та Feedback

**Проблема:** Потрібно покращити візуальні стани та feedback.

**Рішення:** Додати всі візуальні покращення з специфікації.

**Файли для модифікації:**
- `components/asset-list/DataTable.tsx` - оновити стилі
- `components/asset-list/ActionsColumn.tsx` - оновити стилі

**Технічні деталі:**

**Крок 6.1: Оновити row states**
- [ ] Normal row: білий фон, border-bottom
- [ ] Selected row: `bg-gray-100` (#F3F4F6), optional left accent bar
- [ ] Hover row: `bg-gray-50` (#F9FAFB) якщо не selected
- [ ] Edit mode row: `bg-yellow-50` (#FFFBEB) або `bg-blue-50` (#EFF6FF)
- [ ] Edit mode border: `border-2 border-yellow-300` або `border-blue-300`

**Крок 6.2: Оновити field states**
- [ ] Normal field: текст, `cursor-pointer` якщо editable
- [ ] Hover editable field: `bg-gray-50` (опціонально)
- [ ] Field in edit mode: Input з синьою border, focus ring
- [ ] Field saving: spinner indicator
- [ ] Field saved: зелений checkmark (500ms)
- [ ] Field error: червона border + error message

**Крок 6.3: Оновити Quick Actions buttons**
- [ ] Default: `text-gray-500` (#6B7280)
- [ ] Hover: `text-gray-700` (#374151) + `bg-gray-100`
- [ ] Active: slight scale down (0.95)
- [ ] Size: 36px × 36px
- [ ] Border-radius: 6px

**Крок 6.4: Додати transitions**
- [ ] Smooth transitions для всіх станів (150ms ease)
- [ ] Hover effects
- [ ] Focus rings

**Крок 6.5: Додати loading states**
- [ ] Spinner під час save операції
- [ ] Disable interactions під час save
- [ ] Optimistic updates з rollback на error

**Тестування:**
- [ ] Перевірити всі візуальні стани
- [ ] Перевірити hover effects
- [ ] Перевірити transitions
- [ ] Перевірити loading indicators
- [ ] Перевірити error states

---

## ✅ ФІНАЛЬНА ПЕРЕВІРКА

### Тестування всіх функцій:
- [ ] **Фаза 1:** Quick Actions має View + More кнопки
- [ ] **Фаза 2:** Клік на поле активує inline editing
- [ ] **Фаза 3:** Edit з меню активує full row edit
- [ ] **Фаза 4:** Single-select показує snapshots + навігує мапу
- [ ] **Фаза 5:** Duplicate та Delete працюють
- [ ] **Фаза 6:** Всі візуальні стани правильні

### Code Quality:
- [ ] Всі компоненти < 300 рядків
- [ ] TypeScript типи дотримані
- [ ] Немає console.log (окрім TODO)
- [ ] Коментарі додані для складної логіки
- [ ] Edge cases оброблені

### Взаємодія з існуючим кодом:
- [ ] Нічого не поламано з поточної функціональності
- [ ] Backward compatibility збережена
- [ ] Mock data працює правильно

---

## 📝 ПРИМІТКИ

### Залежності між завданнями:
- **Фаза 1 (Quick Actions)** може бути зроблено незалежно
- **Фаза 2 (Inline Editing)** потребує оновлення DataTable state
- **Фаза 3 (Full Row Edit)** залежить від Фази 2
- **Фаза 4 (Single-Select)** потребує SnapshotsPanel та MapPanel
- **Фаза 5 (Duplicate/Delete)** може бути зроблено незалежно
- **Фаза 6 (Visual)** може бути зроблено паралельно

### Рекомендований порядок виконання:
1. **Фаза 1:** 1-2 години
2. **Фаза 2:** 2-3 години
3. **Фаза 3:** 2-3 години
4. **Фаза 4:** 2-3 години
5. **Фаза 5:** 1-2 години
6. **Фаза 6:** 1-2 години

**Загальний час:** ~9-15 годин

---

**КІНЕЦЬ ПЛАНУ TABLE ROW INTERACTIONS**
