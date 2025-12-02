# 📋 ПЛАН РЕАЛІЗАЦІЇ: Core Vision Asset List Screen v2.0

**Дата:** 2025-12-02  
**Джерело:** `new-update-report.md`  
**Статус:** План реалізації

---

## 🎯 ОСНОВНІ ЗМІНИ З ВЕРСІЇ 1.0

### Критичні зміни:
1. **Table LEFT, Map RIGHT** (зараз навпаки!)
2. **Report button в toolbar** (зараз в dropdown)
3. **Toolbar структура** з visual separators
4. **Контекстні дії** при виборі рядків
5. **Активні фільтри bar** з orange theme

---

## 📊 ПОТОЧНИЙ СТАН vs НОВИЙ ДИЗАЙН

### ❌ ПОТОЧНИЙ СТАН:
```
ResizableSplit:
  leftPanel = MapPanel (40%)
  rightPanel = DataTable (60%)
```

### ✅ НОВИЙ ДИЗАЙН:
```
ResizableSplit:
  leftPanel = DataTable (70%)
  rightPanel = MapPanel (30%)
```

---

## 🚀 ЕТАПИ РЕАЛІЗАЦІЇ

### ЕТАП 1: ВИПРАВИТИ LAYOUT (Table LEFT, Map RIGHT)

**Пріоритет:** 🔥 КРИТИЧНИЙ  
**Ризик:** 🟢 Низький  
**Час:** ~30 хвилин

#### Крок 1.1: Змінити порядок панелей в ResizableSplit

**Файл:** `app/assets/page.tsx`

**Зміни:**
```typescript
// БУЛО:
<ResizableSplit
  defaultRatio={activeView?.mapRatio || 40}
  leftPanel={<MapPanel ... />}
  rightPanel={<DataTable ... />}
/>

// СТАНЕ:
<ResizableSplit
  defaultRatio={70} // Table 70%, Map 30%
  minLeftWidth={500} // Мінімум для таблиці
  minRightWidth={280} // Мінімум для карти
  onRatioChange={handleRatioChange}
  leftPanel={
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <DataTable ... />
      </div>
      <div className="border-t border-neutral-200">
        <Pagination ... />
      </div>
    </div>
  }
  rightPanel={
    <MapPanel ... />
  }
/>
```

#### Крок 1.2: Оновити mapRatio логіку

**Зміни:**
- `mapRatio: 40` означає 40% для map (right panel)
- Але тепер mapRatio = 100 - tableRatio
- Або змінити на `tableRatio: 70` (default)

**Рішення:** Використовувати `tableRatio` замість `mapRatio`:
```typescript
interface View {
  // ...
  tableRatio: number; // 50-85% (default 70)
  // Remove: mapRatio
}
```

**Або:** Залишити `mapRatio`, але інвертувати:
```typescript
defaultRatio={100 - (activeView?.mapRatio || 30)} // 30% map = 70% table
```

**Рекомендація:** Використати `tableRatio` для ясності.

#### Крок 1.3: Оновити min/max обмеження

**Зміни:**
```typescript
minLeftWidth={500}   // Мінімум для таблиці (50% від 1000px)
minRightWidth={280}  // Мінімум для карти (15% від 1920px)
// Max для table: 85% (автоматично через minRightWidth)
```

**Тестування:**
- [ ] Table на лівій стороні
- [ ] Map на правій стороні
- [ ] Resize працює правильно
- [ ] Мінімальні розміри дотримуються

---

### ЕТАП 2: ОНОВИТИ TOOLBAR СТРУКТУРУ

**Пріоритет:** 🔥 КРИТИЧНИЙ  
**Ризик:** 🟡 Середній  
**Час:** ~2 години

#### Крок 2.1: Додати visual separators

**Файл:** `components/asset-list/Toolbar.tsx`

**Зміни:**
```typescript
<div className="h-14 flex items-center justify-between px-4 gap-2">
  {/* Group 1: Search */}
  <div className="flex items-center gap-2">
    <Button variant="ghost" size="icon" ...>
      <Search />
    </Button>
  </div>
  
  {/* Visual Separator */}
  <div className="h-6 w-px bg-neutral-300 mx-2" />
  
  {/* Group 2: Filter + Columns */}
  <div className="flex items-center gap-2">
    <Button variant="ghost" className="gap-2 px-3 h-9" ...>
      <Filter className="w-4 h-4" />
      <span className="text-sm font-medium">Filter</span>
      {activeFilters.length > 0 && (
        <Badge className="ml-1 bg-orange-500 text-white">
          {activeFilters.length}
        </Badge>
      )}
    </Button>
    
    <Button variant="ghost" className="gap-2 px-3 h-9" ...>
      <Columns className="w-4 h-4" />
      <span className="text-sm font-medium">Columns</span>
      <span className="text-xs text-neutral-500 ml-1">
        ({visibleColumnsCount})
      </span>
    </Button>
  </div>
  
  {/* Visual Separator */}
  <div className="h-6 w-px bg-neutral-300 mx-2" />
  
  {/* Group 3: Report + More */}
  <div className="flex items-center gap-2">
    {/* REPORT BUTTON - PROMOTED */}
    <Button 
      variant="ghost" 
      className="gap-2 px-3 h-9 text-orange-600 hover:bg-orange-50 font-medium"
      onClick={onGenerateReport}
    >
      <Printer className="w-4 h-4" />
      <span className="text-sm">Report</span>
    </Button>
    
    {/* More Dropdown */}
    <DropdownMenu>
      ...
    </DropdownMenu>
  </div>
  
  {/* Auto-spacer */}
  <div className="flex-1" />
  
  {/* Group 4: Pop-out */}
  <div className="flex items-center gap-2">
    <DropdownMenu>
      ...
    </DropdownMenu>
  </div>
</div>
```

#### Крок 2.2: Додати контекстні дії при виборі рядків

**Зміни:**
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
      className="h-8 text-sm"
      onClick={onEditSelected}
    >
      Edit
    </Button>
    
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-8 text-sm text-red-600 hover:bg-red-50"
      onClick={onDeleteSelected}
    >
      Delete
    </Button>
    
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-8 text-sm"
      onClick={onExportSelected}
    >
      Export Selected
    </Button>
  </>
)}
```

**Позиція:** Між Group 2 та Group 3 (Filter/Columns та Report/More)

#### Крок 2.3: Оновити стилі кнопок

**Зміни:**
- Report: `text-orange-600 hover:bg-orange-50 font-medium`
- Filter/Columns: `hover:bg-neutral-100 text-neutral-700`
- Інші: `hover:bg-neutral-100 text-neutral-600`

**Тестування:**
- [ ] Visual separators видимі
- [ ] Report button з orange accent
- [ ] Контекстні дії з'являються при виборі
- [ ] Правильне вирівнювання груп

---

### ЕТАП 3: ПОКРАЩИТИ ACTIVE FILTERS BAR

**Пріоритет:** 🟡 ВИСОКИЙ  
**Ризик:** 🟢 Низький  
**Час:** ~1 година

#### Крок 3.1: Оновити стилі ActiveFiltersBar

**Файл:** `components/asset-list/ActiveFiltersBar.tsx`

**Зміни:**
```typescript
// Змінити bg-neutral-50 на bg-orange-50
<div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
  ...
</div>
```

#### Крок 3.2: Додати "View all" кнопку

**Зміни:**
```typescript
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    {/* Filter chips */}
  </div>
  
  <Button 
    variant="ghost" 
    size="sm"
    onClick={onOpenFilters}
    className="text-orange-600 hover:text-orange-700"
  >
    View all →
  </Button>
</div>
```

**Тестування:**
- [ ] Orange theme застосовано
- [ ] "View all" кнопка працює
- [ ] Max 3 chips visible, решта в dropdown

---

### ЕТАП 4: ОНОВИТИ VIEW TABS СТИЛІ

**Пріоритет:** 🟡 ВИСОКИЙ  
**Ризик:** 🟢 Низький  
**Час:** ~30 хвилин

#### Крок 4.1: Оновити активний стан

**Файл:** `components/asset-list/ViewTabs.tsx`

**Зміни:**
```typescript
// Active tab:
className={cn(
  "border-b-2 border-orange-500 bg-white text-orange-600",
  isActive && "font-medium"
)}

// Inactive tab:
className={cn(
  "bg-transparent text-neutral-600 hover:bg-neutral-100",
  !isActive && "border-b-2 border-transparent"
)}
```

**Тестування:**
- [ ] Active tab з orange border
- [ ] Hover states працюють
- [ ] Favorite stars видимі

---

### ЕТАП 5: ОНОВИТИ TABLE ROW INTERACTIONS

**Пріоритет:** 🟡 ВИСОКИЙ  
**Ризик:** 🟡 Середній  
**Час:** ~1 година

#### Крок 5.1: Переконатися що checkbox не тригерить navigation

**Файл:** `components/asset-list/DataTable.tsx`

**Перевірити:**
```typescript
// Checkbox має stopPropagation
<Checkbox
  onClick={(e) => e.stopPropagation()}
  ...
/>

// Row click має ігнорувати interactive elements
<tr
  onClick={(e) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('input') || 
      target.closest('[role="checkbox"]')
    ) return;
    router.push(`/assets/${asset.id}`);
  }}
>
```

#### Крок 5.2: Переконатися що немає double-click edit

**Перевірити:** Немає `onDoubleClick` handlers на rows

**Тестування:**
- [ ] Checkbox не навігує
- [ ] Row click навігує тільки якщо не interactive element
- [ ] Немає double-click edit

---

### ЕТАП 6: ОНОВИТИ MAP INTERACTIONS

**Пріоритет:** 🟢 СЕРЕДНІЙ  
**Ризик:** 🟡 Середній  
**Час:** ~1 година

#### Крок 6.1: Додати scroll to row при кліку на marker

**Файл:** `components/asset-list/MapPanel.tsx` або handler в `app/assets/page.tsx`

**Зміни:**
```typescript
const handleMarkerClick = (assetId: string) => {
  // 1. Select
  setSelectedRows([assetId]);
  
  // 2. Scroll to row
  const row = document.querySelector(`[data-asset-id="${assetId}"]`);
  row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // 3. Flash animation
  row?.classList.add('flash-highlight');
  setTimeout(() => row?.classList.remove('flash-highlight'), 1000);
};
```

#### Крок 6.2: Додати deselect при кліку на empty map area

**Зміни:**
```typescript
const handleMapClick = (e: any) => {
  if (!e.features || e.features.length === 0) {
    setSelectedRows([]);
  }
};
```

**Тестування:**
- [ ] Marker click → highlight + scroll
- [ ] Empty area click → deselect
- [ ] Flash animation працює

---

### ЕТАП 7: ОНОВИТИ SPACING & TYPOGRAPHY

**Пріоритет:** 🟢 СЕРЕДНІЙ  
**Ризик:** 🟢 Низький  
**Час:** ~30 хвилин

#### Крок 7.1: Перевірити spacing scale

**Перевірити:**
- Toolbar: `px-4 gap-2` (16px padding, 8px gap)
- Button groups: `gap-2` (8px)
- Visual separators: `mx-2` (8px margin)

#### Крок 7.2: Перевірити typography

**Перевірити:**
- Button labels: `text-sm` (14px)
- Badge text: `text-xs` (12px)
- Headers: `text-base font-semibold` (16px, 600)

---

### ЕТАП 8: ДОДАТИ ACCESSIBILITY

**Пріоритет:** 🟢 СЕРЕДНІЙ  
**Ризик:** 🟢 Низький  
**Час:** ~1 година

#### Крок 8.1: Додати ARIA labels

**Зміни:**
```typescript
// Table headers
<th scope="col" aria-label="Pipe Segment Reference">
  Pipe Segment
</th>

// Checkboxes
<Checkbox 
  aria-label={`Select asset ${asset.pipeSegment}`}
  ...
/>

// Status announcements
<div role="status" aria-live="polite" className="sr-only">
  {`${selectedRows.length} assets selected`}
</div>
```

#### Крок 8.2: Додати keyboard navigation

**Перевірити:**
- Tab order логічний
- Focus indicators видимі
- Escape закриває dialogs

---

## 📝 CHECKLIST ПЕРЕВІРКИ

### Layout
- [ ] Table на LEFT (70%)
- [ ] Map на RIGHT (30%)
- [ ] Resize працює правильно
- [ ] Мінімальні розміри дотримуються

### Toolbar
- [ ] Visual separators видимі
- [ ] Report button з orange accent
- [ ] Filter/Columns з text labels
- [ ] Контекстні дії при виборі
- [ ] Правильне групування

### Interactions
- [ ] Checkbox не навігує
- [ ] Row click навігує правильно
- [ ] Marker click → scroll to row
- [ ] Empty map click → deselect

### Styling
- [ ] Orange theme застосовано
- [ ] Active filters bar orange
- [ ] View tabs з orange border
- [ ] Правильні spacing

### Accessibility
- [ ] ARIA labels додані
- [ ] Keyboard navigation працює
- [ ] Focus indicators видимі

---

## 🎯 ПРІОРИТЕТИ ВИКОНАННЯ

1. **ЕТАП 1** - Виправити layout (КРИТИЧНО!)
2. **ЕТАП 2** - Оновити toolbar (КРИТИЧНО!)
3. **ЕТАП 3** - Покращити filters bar
4. **ЕТАП 4** - Оновити view tabs
5. **ЕТАП 5** - Перевірити interactions
6. **ЕТАП 6** - Покращити map interactions
7. **ЕТАП 7** - Оновити spacing
8. **ЕТАП 8** - Додати accessibility

---

## ⚠️ КРИТИЧНІ НАГАДУВАННЯ

❗ **Table MUST be on LEFT** (research-backed)  
❗ **Report MUST be in toolbar** (stakeholder requirement)  
❗ **NO double-click editing** (safety pattern)  
❗ **Orange = brand color** (use consistently)  
❗ **70/30 table/map ratio** (can adjust 50-85%)  

---

**END OF PLAN**

