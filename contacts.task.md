# 📋 ПЛАН ІМПЛЕМЕНТАЦІЇ: Asset List Improvements & Fixes

**Режим:** PLAN  
**Дата створення:** 2025  
**Джерело:** big-update-pre-plan.md  
**Пріоритет:** Critical → Important → Nice-to-Have

---

## 🎯 ЗАГАЛЬНА СТРАТЕГІЯ

### Порядок виконання:
1. **Підготовка** - встановлення залежностей, створення відсутніх UI компонентів
2. **Critical Fixes** (1-5) - обов'язкові виправлення
3. **Important Improvements** (6-10) - важливі покращення UX/UI
4. **Polish** (11-13) - фінальне полірування

### Технічні вимоги:
- Використовувати існуючі паттерни коду
- Дотримуватися TypeScript типів з `lib/types/asset-list.ts`
- Компоненти до 300 рядків
- Тестувати кожен компонент перед переходом до наступного

---

## 📦 ЕТАП 0: ПІДГОТОВКА

### 0.1. Перевірка залежностей
- [ ] Перевірити що `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` встановлені (вже є в package.json)
- [ ] Якщо потрібно: `npm install`

### 0.2. Створення відсутніх UI компонентів
- [ ] **Badge компонент** - створити `components/ui/badge.tsx` (для ActiveFiltersBar)
  - Використати shadcn/ui шаблон або створити простий варіант
  - Варіанти: `default`, `secondary`, `outline`
  - Розміри: `sm`, `md`, `lg`
  
- [ ] **RadioGroup компонент** - додати через shadcn
  - Команда: `npx shadcn-ui@latest add radio-group`
  - Потрібен для CreateViewDialog (вибір template)
  
- [ ] **Tooltip компонент** - додати через shadcn
  - Команда: `npx shadcn-ui@latest add tooltip`
  - Потрібен для всіх icon buttons

### 0.3. Перевірка існуючих компонентів
- [ ] Перевірити що `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` існують
- [ ] Перевірити що всі необхідні іконки з `lucide-react` доступні

---

## 🚨 ЕТАП 1: CRITICAL FIXES (Must Do)

### 1.1. Active Filters Bar Component

**Файл:** `components/asset-list/ActiveFiltersBar.tsx` (створити новий)

**Завдання:**
- [ ] Створити компонент що приймає `filters: FilterConfig[]`
- [ ] Реалізувати логіку відображення перших N фільтрів (maxVisible = 3)
- [ ] Додати функцію `getOperatorSymbol()` для відображення операторів (=, ⊃, ⊂, >, <)
- [ ] Створити UI з Badge компонентами для кожного фільтра
- [ ] Додати кнопку видалення (X) на кожному badge
- [ ] Додати кнопку "+N more" якщо фільтрів більше ніж maxVisible
- [ ] Додати кнопку "View all filters" справа (ml-auto)
- [ ] Стилізувати: bg-neutral-50, border-b, padding, hover effects
- [ ] Повертати `null` якщо filters.length === 0

**Інтеграція в `app/assets/page.tsx`:**
- [ ] Імпортувати ActiveFiltersBar
- [ ] Додати після Toolbar компонента
- [ ] Передати `filters={activeView.filters}`
- [ ] Реалізувати `onRemoveFilter` handler що:
  - Фільтрує filters масив (видаляє filter з відповідним id)
  - Оновлює activeView через handleSaveView
  - Оновлює updatedAt timestamp
- [ ] Реалізувати `onOpenViewSettings` що:
  - Відкриває ViewSettingsDialog
  - TODO: Встановлює активний таб на "Filters" (поки що просто відкриває)

**Тестування:**
- [ ] Перевірити що bar з'являється коли є фільтри
- [ ] Перевірити що bar зникає коли фільтри видалені
- [ ] Перевірити видалення фільтра через X кнопку
- [ ] Перевірити "+N more" кнопку при >3 фільтрах
- [ ] Перевірити "View all filters" кнопку

---

### 1.2. Drag-to-Reorder для Columns

**Файл:** `components/asset-list/ViewSettingsDialog.tsx` (оновлення)

**Завдання:**
- [ ] Додати імпорти з @dnd-kit:
  - `DndContext`, `closestCenter`, `KeyboardSensor`, `PointerSensor`, `useSensor`, `useSensors` з `@dnd-kit/core`
  - `SortableContext`, `sortableKeyboardCoordinates`, `verticalListSortingStrategy`, `useSortable` з `@dnd-kit/sortable`
  - `CSS` з `@dnd-kit/utilities`
- [ ] Додати іконку `GripVertical` з lucide-react
- [ ] Створити компонент `SortableColumnItem`:
  - Приймає `column: ColumnDef` та `onRemove: () => void`
  - Використовує `useSortable({ id: column.id })`
  - Відображає drag handle (GripVertical іконка)
  - Відображає column label
  - Відображає remove button (X)
  - Застосовує transform стилі через CSS.Transform.toString()
  - Додає opacity: 0.5 та shadow-lg під час dragging
  - Cursor: grab/grabbing
- [ ] Додати helper функцію `arrayMove<T>()` для переміщення елементів в масиві
- [ ] В ViewSettingsDialog додати:
  - `useSensors` з PointerSensor та KeyboardSensor
  - `handleDragEnd` функцію що:
    - Отримує active та over з event
    - Знаходить oldIndex та newIndex
    - Викликає arrayMove для оновлення displayedColumns
    - Оновлює state через setDisplayedColumns
- [ ] Обгорнути список displayedColumns в:
  - `DndContext` з sensors, collisionDetection, onDragEnd
  - `SortableContext` з items (масив id) та strategy
- [ ] Замінити звичайні div на SortableColumnItem компоненти

**Тестування:**
- [ ] Перевірити drag handle з'являється
- [ ] Перевірити можливість перетягування колонок
- [ ] Перевірити візуальний feedback під час dragging
- [ ] Перевірити що порядок зберігається після drag
- [ ] Перевірити keyboard navigation (Tab + Arrow keys)

---

### 1.3. Create View Dialog - Guided Flow

**Файл:** `components/asset-list/CreateViewDialog.tsx` (створити новий)

**Завдання:**
- [ ] Створити компонент з типами:
  - `Step = 'welcome' | 'name' | 'template' | 'confirm'`
  - Props: `open`, `onClose`, `existingViews`, `onCreateView`
- [ ] Додати state:
  - `step: Step` (початкове: 'welcome')
  - `viewName: string`
  - `selectedTemplate: string` (початкове: 'blank')
  - `makeDefault: boolean`
- [ ] Реалізувати `handleReset()` для скидання форми
- [ ] Реалізувати `handleClose()` що викликає handleReset + onClose
- [ ] Реалізувати `handleCreate()` що:
  - Якщо selectedTemplate === 'blank': створює новий View з дефолтними значеннями
  - Якщо selectedTemplate !== 'blank': дублює існуючий view з новим id та name
  - Встановлює isDefault якщо makeDefault === true
  - Викликає onCreateView(newView)
  - Викликає handleClose()
- [ ] Реалізувати валідацію:
  - `canProceedToName = true`
  - `canProceedToTemplate = viewName.trim().length > 0`
  - `canCreate = viewName.trim().length > 0 && selectedTemplate`
- [ ] Створити UI для кожного кроку:

**Step 1: Welcome**
- [ ] Progress indicator (4 точки)
- [ ] DialogHeader з заголовком "Create New View"
- [ ] Центрований контент:
  - Іконка Star в оранжевому колі
  - Заголовок "Views help you organize your work"
  - Опис тексту
- [ ] Card з інформацією про що буде налаштовано (3 пункти з іконками)
- [ ] DialogFooter з кнопками Cancel та "Get Started"

**Step 2: Name**
- [ ] Progress indicator
- [ ] DialogHeader "Name Your View"
- [ ] Input поле для view name з placeholder
- [ ] Підказка (Tip Card) з прикладами назв
- [ ] DialogFooter з Back та Next кнопками
- [ ] Next disabled якщо viewName порожній

**Step 3: Template**
- [ ] Progress indicator
- [ ] DialogHeader "Choose a Starting Point"
- [ ] RadioGroup з опціями:
  - "Start from Scratch" (blank) - Card з radio button
  - Список існуючих views (до 5) як templates - кожен як Card з radio button
  - Показувати для кожного view: name, isFavorite star, кількість columns та filters
- [ ] Підказка про копіювання
- [ ] DialogFooter з Back та Next

**Step 4: Confirm**
- [ ] Progress indicator
- [ ] DialogHeader "Review and Create"
- [ ] Card з summary:
  - Name
  - Template (blank або назва view)
  - Якщо не blank: Columns count, Filters count
- [ ] Checkbox "Make this my default view"
- [ ] Підказка про наступні кроки
- [ ] DialogFooter з Back та "Create View" (orange button)
- [ ] Create View disabled якщо не валідно

**Інтеграція в `app/assets/page.tsx`:**
- [ ] Додати state `createViewOpen: boolean`
- [ ] Створити `handleCreateView(newView: View)` що:
  - Додає новий view до views масиву
  - Встановлює activeViewId на новий view
  - Скидає currentPage на 1
  - Показує toast notification (якщо є sonner)
- [ ] Оновити ViewTabs `onCreateView` prop: `() => setCreateViewOpen(true)`
- [ ] Додати CreateViewDialog в кінці компонента з усіма props

**Тестування:**
- [ ] Перевірити всі 4 кроки послідовно
- [ ] Перевірити валідацію (не можна продовжити без name)
- [ ] Перевірити створення blank view
- [ ] Перевірити створення view з template
- [ ] Перевірити makeDefault checkbox
- [ ] Перевірити reset при закритті

---

### 1.4. Color Coding для Filter Types

**Файл:** `components/asset-list/ViewSettingsDialog.tsx` (оновлення Filters tab)

**Завдання:**
- [ ] Додати імпорти іконок: `Hash`, `Calendar`, `Text`, `ListFilter`, `ToggleLeft` з lucide-react
- [ ] Створити helper `getFieldType(fieldId: string): ColumnDef['type']`:
  - Знаходить column в allColumns за field
  - Повертає column.type або 'text' за замовчуванням
- [ ] Створити helper `getTypeColorClasses(type: ColumnDef['type']): string`:
  - 'text' → 'bg-blue-50 border-blue-200'
  - 'number' → 'bg-green-50 border-green-200'
  - 'date' → 'bg-purple-50 border-purple-200'
  - 'select' → 'bg-orange-50 border-orange-200'
  - default → 'bg-neutral-50 border-neutral-200'
- [ ] Створити helper `getTypeIcon(type: ColumnDef['type']): JSX.Element`:
  - 'text' → Text іконка (blue-600)
  - 'number' → Hash іконка (green-600)
  - 'date' → Calendar іконка (purple-600)
  - 'select' → ListFilter іконка (orange-600)
  - default → ToggleLeft іконка (neutral-600)
- [ ] Оновити рендеринг filters:
  - Обгорнути кожен filter в div з кольоровими класами (через getTypeColorClasses)
  - Додати іконку типу зліва (через getTypeIcon)
  - Оновити Field Selector: в SelectItem додати іконку типу перед label
  - Оновити Operator Select: використати getOperatorsForType для фільтрації операторів
- [ ] Створити helper `getOperatorsForType(type: ColumnDef['type'])`:
  - 'text' → equals, contains, startsWith (з іконками =, ⊃, ⊂)
  - 'number' → equals, greaterThan, lessThan (з іконками =, >, <)
  - 'date' → equals, greaterThan, lessThan (з labels "On date", "After", "Before")
  - default → тільки equals

**Тестування:**
- [ ] Перевірити що різні типи фільтрів мають різні кольори
- [ ] Перевірити що іконки відображаються правильно
- [ ] Перевірити що оператори фільтруються по типу
- [ ] Перевірити що при зміні field, тип оновлюється

---

### 1.5. Preview Count в Filters Tab

**Файл:** `components/asset-list/ViewSettingsDialog.tsx` (оновлення Filters tab)

**Завдання:**
- [ ] Додати імпорти: `AlertCircle`, `Check` з lucide-react, `useMemo` з react
- [ ] Створити helper `getMatchingAssetsCount(filters: FilterConfig[]): number`:
  - Якщо filters.length === 0 → повертає assets.length
  - Інакше фільтрує assets:
    - Для кожного asset перевіряє чи всі filters проходять
    - Для кожного filter:
      - Отримує value з asset через getAssetFieldValue (потрібно створити helper)
      - Застосовує operator (equals, contains, startsWith, greaterThan, lessThan)
      - Повертає кількість matching assets
- [ ] Створити helper `getAssetFieldValue(asset: Asset, fieldId: string): unknown`:
  - Знаходить column за fieldId
  - За column.table визначає звідки брати значення:
    - 'asset' → asset[field]
    - 'inspection' → asset.latestInspection?.[field]
    - 'observation' → asset[field] (для observationCount, hasDefects, maxGrade)
  - Повертає значення або undefined
- [ ] Додати useMemo для `matchingCount`:
  - Залежності: filters, assets
  - Викликає getMatchingAssetsCount(filters)
- [ ] Оновити Filters tab UI:
  - Додати "Clear All" кнопку поруч з "Active Filters" heading (якщо filters.length > 0)
  - Додати Card з preview count ПІСЛЯ heading, ПЕРЕД списком filters:
    - Якщо matchingCount === 0: червоний Card з AlertCircle, текст "No assets match these filters"
    - Якщо matchingCount > 0: зелений Card з Check, текст "{count} assets match these filters"
    - Показувати тільки якщо filters.length > 0

**Тестування:**
- [ ] Перевірити що count оновлюється при додаванні фільтра
- [ ] Перевірити що count оновлюється при зміні значення фільтра
- [ ] Перевірити що count оновлюється при зміні оператора
- [ ] Перевірити червоний Card коли count === 0
- [ ] Перевірити зелений Card коли count > 0
- [ ] Перевірити "Clear All" кнопку

---

## 🎨 ЕТАП 2: IMPORTANT IMPROVEMENTS (Should Do)

### 2.1. Improve Map Panel UI

**Файл:** `components/asset-list/MapPanel.tsx` (оновлення)

**Завдання:**
- [ ] Додати state: `basemap: string` (початкове: 'streets'), `zoom: number` (початкове: 14)
- [ ] Оновити placeholder контент:
  - Залишити Map іконку та текст
  - Додати відображення кількості assets: `{assets.length} assets loaded`
- [ ] Додати Zoom Controls (bottom-left):
  - Вертикальний flex контейнер
  - Кнопка "+" (Plus іконка) - збільшує zoom (max 20)
  - Кнопка "-" (Minus іконка) - зменшує zoom (min 1)
  - Стилі: bg-white, shadow-md, rounded, hover effects
- [ ] Додати Basemap Selector (top-right):
  - Select компонент з Layers іконкою
  - Опції: Streets, Satellite, Hybrid, Topographic
  - Стилі: bg-white, shadow-md
- [ ] Додати Zoom Level Display (bottom-right):
  - Білий badge з текстом "Zoom: {zoom}"
  - Стилі: bg-white, px-3, py-1.5, rounded-md, shadow-md

**Тестування:**
- [ ] Перевірити zoom controls працюють
- [ ] Перевірити basemap selector працює
- [ ] Перевірити zoom level відображається
- [ ] Перевірити що zoom не виходить за межі 1-20

---

### 2.2. Fix View Tabs Star Icons

**Файл:** `components/asset-list/ViewTabs.tsx` (оновлення)

**Завдання:**
- [ ] Оновити рендеринг favorite views:
  - Додати `fill-orange-500 text-orange-500` до Star іконки
  - Це зробить зірку заповненою для favorites
- [ ] Оновити рендеринг non-favorite views (в More dropdown):
  - Залишити Star іконку без fill (тільки outline)
  - Додати `text-neutral-400` для нейтрального кольору

**Тестування:**
- [ ] Перевірити що favorite views мають filled star
- [ ] Перевірити що non-favorite views мають outline star
- [ ] Перевірити що кольори правильні (orange для favorites)

---

### 2.3. Improve Table Header Prominence

**Файл:** `components/asset-list/DataTable.tsx` (оновлення)

**Завдання:**
- [ ] Оновити стилі `<th>` елементів:
  - Додати `bg-neutral-50` (замість bg-white)
  - Додати `border-b-2 border-neutral-300` (замість border-b)
  - Додати `text-xs font-semibold uppercase tracking-wider`
  - Додати `text-neutral-600`
  - Для sortable columns: додати `cursor-pointer hover:bg-neutral-100 group`
- [ ] Оновити вміст header cell:
  - Обгорнути в div з flex items-center gap-2
  - Додати ArrowUpDown іконку для sortable columns
  - Іконка має `opacity-0 group-hover:opacity-100 transition-opacity`
  - Іконка стилі: `w-3 h-3 text-neutral-400`

**Тестування:**
- [ ] Перевірити що headers виразніші (bg-neutral-50)
- [ ] Перевірити що border товстіший (border-b-2)
- [ ] Перевірити що текст uppercase та tracking-wider
- [ ] Перевірити hover effect на sortable columns
- [ ] Перевірити що іконка сортування з'являється на hover

---

### 2.4. Add Tooltips to All Icon Buttons

**Файл:** `components/asset-list/Toolbar.tsx` (оновлення)

**Завдання:**
- [ ] Додати імпорти Tooltip компонентів з shadcn/ui
- [ ] Обгорнути всі icon buttons в TooltipProvider
- [ ] Додати Tooltip для Search button:
  - Текст: "Search assets"
  - Підтекст: "Ctrl+K" (text-xs text-neutral-500)
- [ ] Додати Tooltip для View Settings button:
  - Текст: "View Settings"
  - Підтекст: "Columns & Filters"
- [ ] Додати Tooltip для More Tools dropdown:
  - Текст: "More tools"
- [ ] Додати Tooltip для Pop-out dropdown:
  - Текст: "Pop-out window"
  - Підтекст: "Open in new window"

**Інші файли для оновлення:**
- [ ] `components/asset-list/Header.tsx` - додати tooltips до project selector та chat support
- [ ] `components/asset-list/DataTable.tsx` - додати tooltip до kebab menu в rows

**Тестування:**
- [ ] Перевірити що tooltips з'являються на hover
- [ ] Перевірити що текст правильний
- [ ] Перевірити що підтексти відображаються

---

### 2.5. Improve Spacing & Visual Hierarchy

**Файл:** `app/assets/page.tsx` (оновлення layout)

**Завдання:**
- [ ] Оновити root div:
  - Змінити `bg-white` на `bg-neutral-50`
- [ ] Обгорнути Toolbar та ActiveFiltersBar в div з `shadow-sm`
- [ ] Додати padding навколо ResizableSplit:
  - Обгорнути в `<div className="flex-1 p-4">`

**Файл:** `components/asset-list/DataTable.tsx` (оновлення)

**Завдання:**
- [ ] Оновити row height: `h-14` (замість h-12)
- [ ] Оновити cell padding: `px-4 py-3` (замість меншого)
- [ ] Додати margin перед Pagination:
  - Обгорнути Pagination в `<div className="border-t border-neutral-200 mt-4">`

**Файл:** `components/asset-list/ViewSettingsDialog.tsx` (оновлення)

**Завдання:**
- [ ] Додати padding до DialogHeader: `pb-4`
- [ ] Оновити TabsList: `w-full justify-start border-b`
- [ ] Оновити TabsTrigger: `flex-1` для рівномірного розподілу
- [ ] Оновити TabsContent spacing: `space-y-6` (замість space-y-4)
- [ ] Оновити spacing в Currently Displayed: `space-y-3` для заголовка, `space-y-2` для списку
- [ ] Додати padding до DialogFooter: `pt-4`

**Тестування:**
- [ ] Перевірити що spacing виглядає природно
- [ ] Перевірити що не тісно і не занадто розріджено
- [ ] Перевірити на різних розмірах екрану

---

## ✨ ЕТАП 3: POLISH (Nice-to-Have)

### 3.1. Better Empty States

**Файл:** `components/asset-list/DataTable.tsx` (оновлення)

**Завдання:**
- [ ] Додати loading state:
  - Якщо `loading === true`:
    - Центрований контент з Loader2 іконкою (animate-spin)
    - Текст "Loading assets..."
    - Висота: h-64
- [ ] Оновити empty state:
  - Якщо `data.length === 0`:
    - Центрований контент
    - Database іконка в круглому bg-neutral-100
    - Заголовок "No assets found"
    - Опис залежить від searchQuery та filters:
      - Якщо є searchQuery: "No results for "{searchQuery}". Try adjusting your search."
      - Якщо є filters: "No assets match your current filters. Try removing some filters."
    - Кнопка "Clear filters and search" (якщо є searchQuery або filters)
    - Висота: h-64

**Тестування:**
- [ ] Перевірити loading state
- [ ] Перевірити empty state без фільтрів
- [ ] Перевірити empty state з search query
- [ ] Перевірити empty state з filters
- [ ] Перевірити кнопку "Clear filters and search"

---

### 3.2. Add Loading States

**Файл:** `app/assets/page.tsx` (оновлення)

**Завдання:**
- [ ] Додати state `isLoadingView: boolean`
- [ ] Оновити `handleViewChange`:
  - Встановити `setIsLoadingView(true)`
  - Встановити новий activeViewId
  - Скинути currentPage на 1
  - Симулювати затримку (await new Promise(resolve => setTimeout(resolve, 300)))
  - Встановити `setIsLoadingView(false)`
- [ ] Додати loading overlay:
  - Абсолютне позиціонування (inset-0)
  - bg-white/50 backdrop-blur-sm
  - Центрований контент
  - Білий Card з Loader2 іконкою та текстом "Switching view..."
  - z-50
  - Показувати тільки якщо isLoadingView === true

**Тестування:**
- [ ] Перевірити що overlay з'являється при зміні view
- [ ] Перевірити що overlay зникає після затримки
- [ ] Перевірити що анімація smooth

---

### 3.3. Improve Hover Effects

**Завдання:**
- [ ] Додати transition classes до buttons:
  - `transition-all duration-150 ease-in-out`
  - `hover:scale-105 active:scale-95` (для основних кнопок)
- [ ] Оновити table rows:
  - Додати `transition-colors duration-150`
  - Додати `hover:shadow-sm` (якщо потрібно)
- [ ] Оновити filter chips (в ActiveFiltersBar):
  - Додати `transition-all duration-150`
  - Додати `hover:shadow-md hover:border-neutral-300`

**Файли для оновлення:**
- [ ] `components/asset-list/Toolbar.tsx` - buttons
- [ ] `components/asset-list/DataTable.tsx` - rows
- [ ] `components/asset-list/ActiveFiltersBar.tsx` - badges
- [ ] `components/asset-list/ViewSettingsDialog.tsx` - buttons та cards

**Тестування:**
- [ ] Перевірити що hover effects subtle але помітні
- [ ] Перевірити що transitions smooth
- [ ] Перевірити що не занадто агресивні

---

## ✅ ФІНАЛЬНА ПЕРЕВІРКА

### Тестування всіх функцій:
- [ ] **Critical Features:**
  - [ ] Active Filters Bar показується коли є фільтри
  - [ ] Drag-to-reorder колонок працює плавно
  - [ ] Create View Dialog проходить всі 4 кроки
  - [ ] Color coding для фільтрів відображається правильно
  - [ ] Preview count оновлюється в real-time

- [ ] **Visual Polish:**
  - [ ] Map controls виглядають професійно
  - [ ] Favorite stars filled, non-favorites outline
  - [ ] Table headers виразні та readable
  - [ ] Tooltips показуються на всіх icon buttons
  - [ ] Spacing natural, не тісно і не занадто розріджено

- [ ] **UX:**
  - [ ] Empty states показують helpful messages
  - [ ] Loading states smooth, не jumpy
  - [ ] Hover effects subtle але помітні
  - [ ] Все interactive має cursor pointer
  - [ ] Keyboard navigation працює

### Code Quality:
- [ ] Всі компоненти < 300 рядків
- [ ] TypeScript типи дотримані
- [ ] Немає console.log (окрім TODO)
- [ ] Коментарі додані для складної логіки
- [ ] Edge cases оброблені (empty arrays, null values)

### Responsive Testing:
- [ ] Тестування на 1280px ширині
- [ ] Тестування на 1920px ширині
- [ ] Тестування на 2560px ширині
- [ ] Перевірка що все працює на різних розмірах

---

## 📝 ПРИМІТКИ

### Залежності між завданнями:
- **1.1 (ActiveFiltersBar)** може бути зроблено незалежно
- **1.2 (Drag-to-reorder)** потребує @dnd-kit (вже встановлено)
- **1.3 (CreateViewDialog)** потребує RadioGroup компонент (0.2)
- **1.4 (Color coding)** та **1.5 (Preview count)** можуть бути зроблені разом
- **2.4 (Tooltips)** потребує tooltip компонент (0.2)

### Рекомендований порядок виконання:
1. Етап 0 (Підготовка) - 30 хв
2. 1.1 ActiveFiltersBar - 1 год
3. 1.2 Drag-to-reorder - 1.5 год
4. 1.3 CreateViewDialog - 2 год
5. 1.4 + 1.5 Color coding + Preview count - 1.5 год
6. Етап 2 (Important) - 2 год
7. Етап 3 (Polish) - 1 год

**Загальний час:** ~9-10 годин

---

**КІНЕЦЬ ПЛАНУ**
