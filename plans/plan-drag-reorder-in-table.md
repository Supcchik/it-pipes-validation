# 📋 ПЛАН РЕАЛІЗАЦІЇ: Drag-to-Reorder Колонок в Таблиці

**Режим:** [MODE: PLAN]  
**Дата:** 27.11.2025  
**Мета:** Додати можливість перетягування колонок безпосередньо в таблиці DataTable

---

## 🎯 МЕТА

Реалізувати drag-to-reorder колонок прямо в таблиці, щоб користувач міг змінювати порядок колонок без відкриття діалогу налаштувань.

---

## 📁 ФАЙЛИ ДЛЯ МОДИФІКАЦІЇ

### Існуючі файли (потребують оновлення):
```
/components/asset-list/
  DataTable.tsx                 ← Додати drag-to-reorder в заголовки колонок

/app/assets/
  page.tsx                      ← Додати handler для оновлення columnOrder
```

---

## 🔢 ПОСЛІДОВНІСТЬ РЕАЛІЗАЦІЇ

### Крок 1: Додати drag-to-reorder до DataTable
**Файл:** `components/asset-list/DataTable.tsx`

**Що додати:**
- [ ] Імпорти @dnd-kit (DndContext, SortableContext, useSortable)
- [ ] Імпорт GripVertical icon
- [ ] Додати prop `onColumnReorder?: (newOrder: string[]) => void`
- [ ] Створити SortableColumnHeader component
- [ ] Обгорнути TableHeader в DndContext та SortableContext
- [ ] Додати drag handle до кожного заголовка колонки
- [ ] Обробляти drag end для оновлення порядку

**UI зміни:**
```
┌─────────────────────────────────────────────┐
│ [☑] [≡] Pipe Segment [↑↓] [≡] Street [↑↓] │
│     ↑drag handle                            │
└─────────────────────────────────────────────┘
```

**Технічні деталі:**
- Використати горизонтальний sorting strategy (`horizontalListSortingStrategy`)
- Drag handle має бути зліва від назви колонки
- При drag - заголовок стає напівпрозорим
- Після drop - викликати `onColumnReorder` з новим порядком

---

### Крок 2: Додати handler в app/assets/page.tsx
**Файл:** `app/assets/page.tsx`

**Що додати:**
- [ ] Handler `handleColumnReorder` для оновлення columnOrder
- [ ] Оновити activeView з новим columnOrder
- [ ] Зберегти зміни в views

**Логіка:**
```typescript
const handleColumnReorder = (newOrder: string[]) => {
  if (!activeView) return;
  
  const updatedView: View = {
    ...activeView,
    columnOrder: newOrder,
    displayedColumns: newOrder, // Синхронізувати з columnOrder
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  // Оновити views
  setViews(views.map(v => 
    v.id === activeView.id ? updatedView : v
  ));
};
```

---

### Крок 3: Передати handler до DataTable
**Файл:** `app/assets/page.tsx`

**Що оновити:**
- [ ] Додати `onColumnReorder={handleColumnReorder}` до DataTable

---

## 🎨 UI/UX ДЕТАЛІ

### Drag Handle в заголовку колонки:
- **Розташування:** Зліва від назви колонки
- **Іконка:** GripVertical (≡)
- **Стиль:** 
  - За замовчуванням: `text-neutral-300`
  - При hover: `text-neutral-500`
  - Cursor: `grab` → `grabbing`
- **Розмір:** `h-4 w-4`

### Visual Feedback:
- При drag: заголовок стає напівпрозорим (opacity: 0.5)
- При hover на drag handle: іконка стає більш видимою
- Drop indicator: можна додати тонку лінію між колонками (опціонально)

### Accessibility:
- ARIA labels для drag handles
- Keyboard navigation (через @dnd-kit)
- Focus management

---

## 🧪 ТЕСТУВАННЯ

- [ ] Drag column header → visual feedback працює
- [ ] Drop column → порядок оновлюється
- [ ] ColumnOrder зберігається в view
- [ ] При перезавантаженні сторінки порядок зберігається
- [ ] Drag handle не конфліктує з sorting
- [ ] Keyboard navigation працює
- [ ] Drag працює на мобільних пристроях

---

## 📝 КОД ПРИКЛАДИ

### SortableColumnHeader Component:
```typescript
function SortableColumnHeader({ 
  column, 
  onSort 
}: { 
  column: ColumnDef; 
  onSort: (field: string, direction: 'asc' | 'desc') => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className={cn(
        'h-11 px-4 text-left font-medium text-neutral-700',
        column.sortable && 'cursor-pointer hover:bg-neutral-50'
      )}
      onClick={() => {
        if (column.sortable) {
          onSort(column.field, 'asc');
        }
      }}
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500"
          aria-label={`Drag to reorder ${column.label}`}
          type="button"
          onMouseDown={(e) => {
            // Prevent sorting when dragging
            e.stopPropagation();
          }}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {column.label}
        {column.sortable && (
          <ArrowUpDown className="h-3 w-3 text-neutral-400" />
        )}
      </div>
    </TableHead>
  );
}
```

### DndContext в TableHeader:
```typescript
<TableHeader className="sticky top-0 bg-white z-10">
  <DndContext
    sensors={sensors}
    collisionDetection={closestCenter}
    onDragEnd={handleDragEnd}
  >
    <SortableContext
      items={columns.map(col => col.id)}
      strategy={horizontalListSortingStrategy}
    >
      <TableRow>
        {/* Checkbox column */}
        <TableHead className="w-12">...</TableHead>

        {/* Data columns */}
        {columns.map((column) => (
          <SortableColumnHeader
            key={column.id}
            column={column}
            onSort={onSort}
          />
        ))}

        {/* Actions column */}
        <TableHead className="w-12"></TableHead>
      </TableRow>
    </SortableContext>
  </DndContext>
</TableHeader>
```

---

## 🚨 ВАЖЛИВІ ПРИМІТКИ

### Конфлікти:
- **Sorting vs Dragging:** Переконатися що drag handle не викликає sorting
- **Click vs Drag:** Використати `activationConstraint` для розрізнення
- **Checkbox column:** Не додавати drag handle до checkbox колонки
- **Actions column:** Не додавати drag handle до actions колонки

### Performance:
- Використати `useMemo` для sensors
- Мінімізувати re-renders при drag

### State Management:
- ColumnOrder має бути синхронізований з displayedColumns
- Зміни мають зберігатися в view

---

## ✅ ФІНАЛЬНИЙ ЧЕКЛИСТ

- [ ] Імпорти @dnd-kit додані до DataTable
- [ ] SortableColumnHeader component створено
- [ ] DndContext та SortableContext додані
- [ ] Drag handles додані до заголовків колонок
- [ ] Visual feedback при drag працює
- [ ] handleColumnReorder handler створено
- [ ] Handler передано до DataTable
- [ ] ColumnOrder оновлюється при drag
- [ ] Зміни зберігаються в view
- [ ] Keyboard navigation працює
- [ ] Accessibility labels додані
- [ ] Конфлікт з sorting вирішено

---

## 🎯 КРИТЕРІЇ УСПІХУ

Проєкт вважається завершеним, коли:

1. ✅ Користувач може перетягувати колонки прямо в таблиці
2. ✅ Порядок колонок оновлюється в реальному часі
3. ✅ Зміни зберігаються в view
4. ✅ Drag handle не конфліктує з sorting
5. ✅ UX плавний та зрозумілий

---

**END OF PLAN**

