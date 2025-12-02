# 📋 ПЛАН РЕАЛІЗАЦІЇ: Фільтри та Drag-to-Reorder Колонок

**Режим:** [MODE: PLAN]  
**Дата:** 27.11.2025  
**Базується на:** implementation-status-report.md

---

## 🎯 МЕТА

Реалізувати дві критичні функції для Asset List Screen:
1. **Фільтри** - повнофункціональний filter builder в ViewSettingsDialog
2. **Drag-to-Reorder колонок** - можливість змінювати порядок колонок перетягуванням

---

## 📁 ФАЙЛИ ДЛЯ МОДИФІКАЦІЇ

### Існуючі файли (потребують оновлення):
```
/components/asset-list/
  ViewSettingsDialog.tsx        ← Додати Filters Tab + drag-to-reorder
  DataTable.tsx                 ← Оновити column order display

/lib/types/
  asset-list.ts                ← Перевірити FilterConfig interface

/app/assets/
  page.tsx                     ← Оновити filtering logic
```

### Нові файли (можливо потрібні):
```
/components/asset-list/
  FilterBuilder.tsx            ← Новий компонент для filter builder (опціонально)
  ColumnReorder.tsx            ← Новий компонент для drag-to-reorder (опціонально)
```

---

## 🔢 ПОСЛІДОВНІСТЬ РЕАЛІЗАЦІЇ

### ФАЗА 1: Фільтри (Кроки 1-4)

#### Крок 1: Перевірити та оновити FilterConfig interface
**Файл:** `lib/types/asset-list.ts`

**Що перевірити:**
- [ ] FilterConfig interface має всі необхідні поля
- [ ] Operator types правильні ('equals', 'contains', 'startsWith', 'greaterThan', 'lessThan')
- [ ] Table types правильні ('asset' | 'inspection' | 'observation')
- [ ] Value type підтримує різні типи даних

**Поточний interface (перевірити):**
```typescript
export interface FilterConfig {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'greaterThan' | 'lessThan';
  value: unknown;
  table: 'asset' | 'inspection' | 'observation';
}
```

**Можливі покращення:**
- Додати `label?: string` для відображення
- Додати `enabled?: boolean` для тимчасового вимкнення
- Переконатися що `value` може бути string, number, boolean, date

---

#### Крок 2: Створити Filter Builder UI
**Файл:** `components/asset-list/ViewSettingsDialog.tsx`

**Функціональність для Filters Tab:**
- [ ] Список активних фільтрів
- [ ] Кнопка "Add Filter"
- [ ] Для кожного фільтра:
  - [ ] Field selector (dropdown з усіх доступних полів)
  - [ ] Operator selector (equals, contains, startsWith, greaterThan, lessThan)
  - [ ] Value input (текст, число, date picker залежно від типу поля)
  - [ ] Кнопка видалення (×)
- [ ] "Clear All Filters" кнопка
- [ ] Прев'ю результатів (скільки assets відповідають фільтрам)

**UI Layout для Filters Tab:**
```
┌─────────────────────────────────────────────┐
│ Filters                                      │
├─────────────────────────────────────────────┤
│                                              │
│ Active Filters (2):                         │
│ ─────────────────────────────────────────── │
│ [Material ▼] [equals ▼] [Clay    ] [×]     │
│ [Width    ▼] [>       ▼] [10      ] [×]    │
│                                              │
│ [+ Add Filter]                               │
│                                              │
│ Preview: 15 assets match these filters      │
│                                              │
│ [Clear All Filters]                         │
│                                              │
└─────────────────────────────────────────────┘
```

**Технічні деталі:**
- Використовувати Select для field та operator
- Input для value (з валідацією за типом поля)
- Для date полів - DatePicker компонент
- Для number полів - number input з min/max
- Для select полів (material, direction) - Select з опціями

**Field Options (з mockColumnDefs):**
- Asset fields: pipeSegment, street, material, width, yearConstructed, etc.
- Inspection fields: certificateNumber, date, purpose, direction, weather, etc.
- Observation fields: observationCount, hasDefects, maxGrade

**Operator Options за типом поля:**
- Text fields: equals, contains, startsWith
- Number fields: equals, greaterThan, lessThan
- Date fields: equals, greaterThan, lessThan
- Boolean fields: equals

---

#### Крок 3: Реалізувати логіку фільтрації
**Файл:** `app/assets/page.tsx`

**Що оновити:**
- [ ] `filteredAssets` useMemo - додати логіку для всіх operator types
- [ ] Переконатися що фільтри працюють з:
  - Asset fields (прямий доступ)
  - Inspection fields (через latestInspection)
  - Observation fields (через observationCount, hasDefects, maxGrade)

**Логіка для кожного operator:**
```typescript
case 'equals':
  return value === filter.value;
case 'contains':
  return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
case 'startsWith':
  return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
case 'greaterThan':
  return Number(value) > Number(filter.value);
case 'lessThan':
  return Number(value) < Number(filter.value);
```

**Обробка різних типів полів:**
- Asset fields: `(asset as Record<string, unknown>)[filter.field]`
- Inspection fields: `asset.latestInspection?.[filter.field]`
- Observation fields: спеціальна логіка для observationCount, hasDefects, maxGrade

**Валідація:**
- Перевіряти що field існує
- Перевіряти що value має правильний тип
- Обробляти null/undefined значення

---

#### Крок 4: Інтегрувати фільтри з View
**Файл:** `components/asset-list/ViewSettingsDialog.tsx`

**Що додати:**
- [ ] State для filters в ViewSettingsDialog
- [ ] Initialize filters з currentView.filters
- [ ] Add filter handler
- [ ] Remove filter handler
- [ ] Update filter handler (field, operator, value)
- [ ] Save filters до view при збереженні

**State management:**
```typescript
const [filters, setFilters] = useState<FilterConfig[]>(currentView.filters || []);
```

**Handlers:**
```typescript
const handleAddFilter = () => {
  const newFilter: FilterConfig = {
    id: `filter-${Date.now()}`,
    field: 'pipeSegment', // default
    operator: 'contains',
    value: '',
    table: 'asset'
  };
  setFilters([...filters, newFilter]);
};

const handleRemoveFilter = (filterId: string) => {
  setFilters(filters.filter(f => f.id !== filterId));
};

const handleUpdateFilter = (filterId: string, updates: Partial<FilterConfig>) => {
  setFilters(filters.map(f => 
    f.id === filterId ? { ...f, ...updates } : f
  ));
};
```

**Save handler:**
```typescript
const handleSave = () => {
  const updatedView: View = {
    ...currentView,
    displayedColumns,
    columnOrder: displayedColumns,
    filters, // ← Додати filters
    updatedAt: new Date().toISOString().split('T')[0]
  };
  onSave(updatedView);
  onClose();
};
```

---

### ФАЗА 2: Drag-to-Reorder Колонок (Кроки 5-8)

#### Крок 5: Встановити бібліотеку для drag-and-drop
**Варіанти:**
1. **@dnd-kit/core** + **@dnd-kit/sortable** (рекомендовано, сучасна, легка)
2. **react-beautiful-dnd** (популярна, але важча)
3. **native HTML5 drag-and-drop** (без залежностей, але більше коду)

**Рекомендація:** @dnd-kit (сучасна, підтримується, легка)

**Встановлення:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Альтернатива (якщо не хочеться додавати залежності):**
- Використати native HTML5 drag-and-drop API
- Більше коду, але без нових залежностей

---

#### Крок 6: Реалізувати Drag-to-Reorder в ViewSettingsDialog
**Файл:** `components/asset-list/ViewSettingsDialog.tsx`

**Функціональність:**
- [ ] "Currently Displayed" список має бути draggable
- [ ] Drag handle (≡ icon) для кожного column
- [ ] Visual feedback при drag (opacity, border)
- [ ] Drop indicator (лінія між елементами)
- [ ] Оновлювати columnOrder при drop

**UI з drag handles:**
```
Currently Displayed (7):
─────────────────────────────────────────
[≡] Pipe Segment Reference        [×]
[≡] Street                         [×]
[≡] Upstream MH                    [×]
[≡] Material                       [×]
[≡] Width                          [×]
[≡] Distance                       [×]
[≡] Surveyed By                    [×]
```

**Технічні деталі з @dnd-kit:**
```typescript
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
```

**State та handlers:**
```typescript
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  
  if (over && active.id !== over.id) {
    setDisplayedColumns((items) => {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      return arrayMove(items, oldIndex, newIndex);
    });
  }
};
```

**SortableItem component:**
```typescript
function SortableColumnItem({ columnId, onRemove }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: columnId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 hover:bg-white rounded"
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-neutral-400" />
        </button>
        <span>{getColumnDef(columnId)?.label}</span>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(columnId)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

**Альтернатива (native HTML5):**
- Використати `draggable="true"` атрибут
- `onDragStart`, `onDragOver`, `onDrop` handlers
- Більше коду, але без залежностей

---

#### Крок 7: Оновити columnOrder при збереженні
**Файл:** `components/asset-list/ViewSettingsDialog.tsx`

**Що оновити:**
- [ ] При drag-and-drop оновлювати displayedColumns (вже робиться)
- [ ] При save - columnOrder має відповідати порядку displayedColumns
- [ ] Переконатися що columnOrder синхронізований з displayedColumns

**Save handler (оновлений):**
```typescript
const handleSave = () => {
  const updatedView: View = {
    ...currentView,
    displayedColumns,
    columnOrder: displayedColumns, // ← Порядок = порядок displayedColumns
    filters,
    updatedAt: new Date().toISOString().split('T')[0]
  };
  onSave(updatedView);
  onClose();
};
```

---

#### Крок 8: Відображати колонки в правильному порядку в DataTable
**Файл:** `components/asset-list/DataTable.tsx`

**Що перевірити:**
- [ ] DataTable отримує columns в правильному порядку
- [ ] Якщо є columnOrder в view - використовувати його
- [ ] Якщо немає columnOrder - використовувати порядок з displayedColumns

**В app/assets/page.tsx:**
```typescript
const displayedColumns = useMemo(() => {
  if (!activeView || !activeView.displayedColumns || !mockColumnDefs) {
    return [];
  }
  
  // Отримати колонки в правильному порядку
  const columns = activeView.displayedColumns
    .map(colId => mockColumnDefs.find(col => col.id === colId))
    .filter((col): col is ColumnDef => col !== undefined);
  
  // Якщо є columnOrder - сортувати за ним
  if (activeView.columnOrder && activeView.columnOrder.length > 0) {
    return activeView.columnOrder
      .map(colId => columns.find(col => col.id === colId))
      .filter((col): col is ColumnDef => col !== undefined);
  }
  
  return columns;
}, [activeView]);
```

**Або простіше (якщо columnOrder завжди синхронізований):**
```typescript
const displayedColumns = useMemo(() => {
  if (!activeView || !activeView.displayedColumns || !mockColumnDefs) {
    return [];
  }
  
  // Використовувати columnOrder якщо є, інакше displayedColumns
  const order = activeView.columnOrder || activeView.displayedColumns;
  
  return order
    .map(colId => mockColumnDefs.find(col => col.id === colId))
    .filter((col): col is ColumnDef => col !== undefined);
}, [activeView]);
```

---

## 🎨 UI/UX ДЕТАЛІ

### Фільтри Tab

**Add Filter Flow:**
1. Користувач натискає "+ Add Filter"
2. З'являється новий filter row з:
   - Field dropdown (всі доступні поля)
   - Operator dropdown (залежно від типу поля)
   - Value input (залежно від типу поля)
   - × button для видалення
3. Після вибору field - operator та value оновлюються автоматично

**Field Types та їх Inputs:**
- Text fields → Text Input
- Number fields → Number Input (з min/max якщо потрібно)
- Date fields → DatePicker
- Select fields (material, direction) → Select dropdown
- Boolean fields → Checkbox або Toggle

**Preview:**
- Показувати кількість assets що відповідають фільтрам
- Оновлювати в real-time при зміні фільтрів
- Можна показати sample assets (опціонально)

### Drag-to-Reorder

**Visual Feedback:**
- Drag handle (≡) при hover стає більш видимим
- При drag - елемент стає напівпрозорим (opacity: 0.5)
- Drop indicator - тонка лінія між елементами
- Cursor: grab → grabbing

**Accessibility:**
- Keyboard navigation (Arrow keys для переміщення)
- ARIA labels для screen readers
- Focus management

---

## 🧪 ТЕСТУВАННЯ

### Фільтри:
- [ ] Додати filter → з'являється в списку
- [ ] Видалити filter → зникає зі списку
- [ ] Змінити field → operator оновлюється
- [ ] Змінити operator → value input оновлюється
- [ ] Змінити value → preview оновлюється
- [ ] Apply filters → assets фільтруються правильно
- [ ] Save view → filters зберігаються
- [ ] Load view → filters завантажуються правильно
- [ ] Clear all → всі filters видаляються
- [ ] Multiple filters → працюють разом (AND logic)

### Drag-to-Reorder:
- [ ] Drag column → visual feedback працює
- [ ] Drop column → порядок оновлюється
- [ ] Save view → columnOrder зберігається
- [ ] Load view → колонки відображаються в правильному порядку
- [ ] Keyboard navigation → працює
- [ ] Drag handle → зручно використовувати

---

## 📝 КОД ПРИКЛАДИ

### Filter Builder Component (опціонально, якщо ViewSettingsDialog стане занадто великим)

```typescript
// components/asset-list/FilterBuilder.tsx
'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { FilterConfig, ColumnDef } from '@/lib/types/asset-list';
import { mockColumnDefs } from '@/lib/mock-data/asset-list';

interface FilterBuilderProps {
  filters: FilterConfig[];
  onFiltersChange: (filters: FilterConfig[]) => void;
}

export default function FilterBuilder({ filters, onFiltersChange }: FilterBuilderProps) {
  // ... implementation
}
```

### Sortable Column Item (для drag-to-reorder)

```typescript
// В ViewSettingsDialog.tsx
import { useSortable } from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';

function SortableColumnItem({ 
  columnId, 
  onRemove 
}: { 
  columnId: string; 
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: columnId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const col = getColumnDef(columnId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-neutral-200"
    >
      <div className="flex items-center gap-2 flex-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-sm">{col?.label}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => onRemove(columnId)}
        aria-label={`Remove ${col?.label}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

---

## 🚨 ВАЖЛИВІ ПРИМІТКИ

### Фільтри:
- **AND logic** - всі фільтри мають відповідати (не OR)
- **Type safety** - перевіряти типи значень
- **Null handling** - обробляти null/undefined значення
- **Performance** - useMemo для filtered assets

### Drag-to-Reorder:
- **Accessibility** - keyboard navigation обов'язкова
- **Visual feedback** - важливо для UX
- **State sync** - columnOrder має бути синхронізований з displayedColumns
- **Persistence** - зберігати порядок в view

---

## ✅ ФІНАЛЬНИЙ ЧЕКЛИСТ

### Фільтри:
- [ ] FilterConfig interface перевірено/оновлено
- [ ] Filters Tab UI реалізовано
- [ ] Add/Remove/Update filter handlers працюють
- [ ] Filtering logic в app/assets/page.tsx працює
- [ ] Всі operator types працюють
- [ ] Різні типи полів обробляються правильно
- [ ] Preview кількості assets працює
- [ ] Save filters до view працює
- [ ] Load filters з view працює
- [ ] Clear all filters працює

### Drag-to-Reorder:
- [ ] Бібліотека встановлена (або native implementation)
- [ ] Drag handles додані до columns
- [ ] Visual feedback при drag працює
- [ ] Drop працює правильно
- [ ] ColumnOrder оновлюється при drag
- [ ] Save columnOrder до view працює
- [ ] Load columnOrder з view працює
- [ ] DataTable відображає колонки в правильному порядку
- [ ] Keyboard navigation працює
- [ ] Accessibility labels додані

---

## 🎯 КРИТЕРІЇ УСПІХУ

Проєкт вважається завершеним, коли:

1. ✅ **Фільтри:** Користувач може додавати, редагувати, видаляти фільтри
2. ✅ **Фільтрація:** Assets фільтруються правильно за всіма фільтрами
3. ✅ **Збереження:** Фільтри зберігаються в view
4. ✅ **Drag-to-Reorder:** Користувач може перетягувати колонки
5. ✅ **Порядок:** Колонки відображаються в правильному порядку
6. ✅ **Збереження порядку:** Порядок колонок зберігається в view
7. ✅ **UX:** Всі interactions плавні та зрозумілі

---

**END OF PLAN**

Цей план деталізує реалізацію фільтрів та drag-to-reorder функціональності для Asset List Screen.

