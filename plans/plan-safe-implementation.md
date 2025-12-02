# 🛡️ ПЛАН БЕЗПЕЧНОЇ РЕАЛІЗАЦІЇ НОВОГО ФУНКЦІОНАЛУ

**Дата:** 2 грудня 2025  
**Мета:** Реалізувати 7 нових функцій з `new-functional-update.md` без поламання існуючого коду

---

## 📋 ПРИНЦИПИ БЕЗПЕЧНОЇ РЕАЛІЗАЦІЇ

1. **Поетапна реалізація** - одна функція за раз
2. **Тестування після кожного кроку** - перевірка, що все працює
3. **Feature flags** - можливість вимкнути новий функціонал
4. **Backward compatibility** - старий код продовжує працювати
5. **Incremental changes** - мінімальні зміни в існуючих файлах
6. **Git commits** - комітити після кожного завершеного кроку

---

## 🎯 ПОРЯДОК РЕАЛІЗАЦІЇ (за пріоритетом)

### ЕТАП 1: Toolbar Hierarchy (Split Settings Button)
**Пріоритет:** 🔥 Найвищий (найпростіший, фундаментальний)  
**Ризик:** 🟢 Низький  
**Час:** ~30 хвилин

### ЕТАП 2: Advanced Search
**Пріоритет:** 🔥 Високий  
**Ризик:** 🟡 Середній  
**Час:** ~1-2 години

### ЕТАП 3: Inline Editing
**Пріоритет:** ⚡ Важливий  
**Ризик:** 🟡 Середній  
**Час:** ~2-3 години

### ЕТАП 4: Export Selected
**Пріоритет:** ⚡ Важливий  
**Ризик:** 🟢 Низький  
**Час:** ~1 година

### ЕТАП 5: Find & Replace
**Пріоритет:** ⚡ Важливий  
**Ризик:** 🟡 Середній  
**Час:** ~2 години

### ЕТАП 6: Report Generation
**Пріоритет:** ⚡ Важливий  
**Ризик:** 🟠 Високий (залежить від PDF бібліотеки)  
**Час:** ~3-4 години

### ЕТАП 7: Pop-out Functionality
**Пріоритет:** ⚡ Бонус  
**Ризик:** 🟠 Високий (складна синхронізація)  
**Час:** ~4-5 годин

---

## 📝 ДЕТАЛЬНИЙ ПЛАН КРОК ЗА КРОКОМ

---

## ЕТАП 1: TOOLBAR HIERARCHY (Split Settings Button)

### Крок 1.1: Оновити Toolbar компонент

**Файл:** `components/asset-list/Toolbar.tsx`

**Зміни:**
1. Додати нові props: `onOpenFilters`, `onOpenColumns`
2. Залишити старий `onOpenViewSettings` для backward compatibility
3. Додати дві нові кнопки: Filter та Columns
4. Приховати стару кнопку Settings (або зробити опціональною)

**Код:**
```typescript
interface ToolbarProps {
  onSearch: () => void;
  onOpenViewSettings: () => void;  // ЗАЛИШИТИ для backward compatibility
  onOpenFilters?: () => void;      // НОВИЙ
  onOpenColumns?: () => void;       // НОВИЙ
  onPopOutMap: () => void;
  onPopOutTable: () => void;
  selectedRowsCount: number;
}

export default function Toolbar({
  onSearch,
  onOpenViewSettings,
  onOpenFilters,
  onOpenColumns,
  // ... rest
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      {/* Search - БЕЗ ЗМІН */}
      <Button variant="ghost" size="icon" onClick={onSearch}>
        <Search className="w-5 h-5" />
      </Button>

      {/* НОВІ кнопки Filter та Columns */}
      {onOpenFilters && (
        <Button variant="ghost" className="gap-2" onClick={onOpenFilters}>
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filter</span>
        </Button>
      )}

      {onOpenColumns && (
        <Button variant="ghost" className="gap-2" onClick={onOpenColumns}>
          <Columns className="w-4 h-4" />
          <span className="text-sm">Columns</span>
        </Button>
      )}

      {/* Стара кнопка Settings - показувати тільки якщо нові не передані */}
      {(!onOpenFilters || !onOpenColumns) && (
        <Button variant="ghost" size="icon" onClick={onOpenViewSettings}>
          <Settings className="w-5 h-5" />
        </Button>
      )}

      {/* Решта без змін */}
    </div>
  );
}
```

**Перевірка:**
- [ ] Компонент компілюється без помилок
- [ ] Старий код продовжує працювати (якщо не передати нові props)
- [ ] Нові кнопки з'являються коли передати нові props

---

### Крок 1.2: Оновити ViewSettingsDialog

**Файл:** `components/asset-list/ViewSettingsDialog.tsx`

**Зміни:**
1. Додати prop `defaultTab?: 'columns' | 'filters'`
2. Використовувати `defaultTab` для встановлення початкової вкладки
3. Залишити старий `defaultValue="columns"` для backward compatibility

**Код:**
```typescript
interface ViewSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  currentView: View;
  onSave: (view: View) => void;
  assets?: Asset[];
  defaultTab?: 'columns' | 'filters'; // НОВИЙ prop
}

export default function ViewSettingsDialog({
  open,
  onClose,
  currentView,
  onSave,
  assets = [],
  defaultTab = 'columns' // Значення за замовчуванням
}: ViewSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Скидати на defaultTab коли діалог відкривається
  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'columns' | 'filters')}>
          {/* Решта без змін */}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

**Перевірка:**
- [ ] Діалог відкривається на правильній вкладці
- [ ] Старий код працює (якщо не передати `defaultTab`)

---

### Крок 1.3: Оновити головну сторінку

**Файл:** `app/assets/page.tsx`

**Зміни:**
1. Додати state для defaultTab
2. Додати handlers для нових кнопок
3. Передати нові props в Toolbar
4. Передати defaultTab в ViewSettingsDialog

**Код:**
```typescript
// Додати новий state
const [viewSettingsDefaultTab, setViewSettingsDefaultTab] = useState<'columns' | 'filters'>('columns');

// Додати нові handlers
const handleOpenFilters = () => {
  setViewSettingsDefaultTab('filters');
  setViewSettingsOpen(true);
};

const handleOpenColumns = () => {
  setViewSettingsDefaultTab('columns');
  setViewSettingsOpen(true);
};

// В JSX:
<Toolbar
  onSearch={() => setSearchOpen(true)}
  onOpenViewSettings={() => setViewSettingsOpen(true)} // ЗАЛИШИТИ для backward compatibility
  onOpenFilters={handleOpenFilters}  // НОВИЙ
  onOpenColumns={handleOpenColumns} // НОВИЙ
  // ... rest
/>

<ViewSettingsDialog
  open={viewSettingsOpen}
  onClose={() => setViewSettingsOpen(false)}
  currentView={activeView}
  onSave={handleSaveView}
  assets={assets}
  defaultTab={viewSettingsDefaultTab} // НОВИЙ
/>
```

**Перевірка:**
- [ ] Кнопка Filter відкриває діалог на вкладці Filters
- [ ] Кнопка Columns відкриває діалог на вкладці Columns
- [ ] Стара кнопка Settings продовжує працювати
- [ ] Всі інші функції працюють як раніше

---

### Крок 1.4: Тестування Етапу 1

**Чеклист:**
- [ ] Кнопка Filter відкриває ViewSettings на вкладці Filters
- [ ] Кнопка Columns відкриває ViewSettings на вкладці Columns
- [ ] Стара кнопка Settings працює (якщо залишена)
- [ ] Всі інші функції працюють без змін
- [ ] Немає помилок в консолі
- [ ] Немає TypeScript помилок

**Git commit:**
```bash
git add .
git commit -m "feat: Split Settings button into Filter and Columns buttons"
```

---

## ЕТАП 2: ADVANCED SEARCH

### Крок 2.1: Оновити SearchDialog компонент

**Файл:** `components/asset-list/SearchDialog.tsx`

**Зміни:**
1. Замінити простий пошук на advanced search
2. Додати вибір таблиці (Asset/Inspection/Observation)
3. Додати вибір поля
4. Додати вибір оператора
5. Додати введення значення
6. Оновити інтерфейс `onSearch` для прийняття `SearchQuery`

**Новий інтерфейс:**
```typescript
interface SearchQuery {
  table: 'asset' | 'inspection' | 'observation';
  field: string;
  operator: 'is' | 'isNot' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  value: string;
}

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  columns: ColumnDef[]; // Додати для вибору полів
  onSearch: (query: SearchQuery) => void; // Оновити сигнатуру
}
```

**Важливо:**
- Зберегти backward compatibility можна через перевірку типу:
```typescript
onSearch: ((query: SearchQuery) => void) | ((query: string) => void);
```
Але краще просто оновити, бо це новий функціонал.

**Перевірка:**
- [ ] Компонент компілюється
- [ ] Всі селектори працюють
- [ ] Пошук виконується з правильними параметрами

---

### Крок 2.2: Оновити логіку пошуку на головній сторінці

**Файл:** `app/assets/page.tsx`

**Зміни:**
1. Замінити `searchQuery: string` на `searchQuery: SearchQuery | null`
2. Оновити `filteredAssets` для використання advanced search
3. Оновити handler `handleSearch`

**Код:**
```typescript
// Замінити:
const [searchQuery, setSearchQuery] = useState('');

// На:
interface SearchQuery {
  table: 'asset' | 'inspection' | 'observation';
  field: string;
  operator: 'is' | 'isNot' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  value: string;
}
const [searchQuery, setSearchQuery] = useState<SearchQuery | null>(null);

// Оновити filteredAssets:
const filteredAssets = useMemo(() => {
  let filtered = [...assets];

  // Apply view filters (БЕЗ ЗМІН)
  // ...

  // Apply advanced search query
  if (searchQuery && searchQuery.value.trim()) {
    filtered = filtered.filter(asset => {
      // Get value based on searchQuery.table
      let value: unknown;
      
      if (searchQuery.table === 'asset') {
        value = (asset as unknown as Record<string, unknown>)[searchQuery.field];
      } else if (searchQuery.table === 'inspection' && asset.latestInspection) {
        value = (asset.latestInspection as unknown as Record<string, unknown>)[searchQuery.field];
      } else if (searchQuery.table === 'observation') {
        // Handle observation fields
        if (searchQuery.field === 'observationCount') value = asset.observationCount;
        else if (searchQuery.field === 'hasDefects') value = asset.hasDefects;
        else if (searchQuery.field === 'maxGrade') value = asset.maxGrade;
        else value = undefined;
      } else {
        return false;
      }

      if (value === null || value === undefined) return false;

      // Apply operator
      switch (searchQuery.operator) {
        case 'is':
          return String(value).toLowerCase() === String(searchQuery.value).toLowerCase();
        case 'isNot':
          return String(value).toLowerCase() !== String(searchQuery.value).toLowerCase();
        case 'contains':
          return String(value).toLowerCase().includes(String(searchQuery.value).toLowerCase());
        case 'startsWith':
          return String(value).toLowerCase().startsWith(String(searchQuery.value).toLowerCase());
        case 'endsWith':
          return String(value).toLowerCase().endsWith(String(searchQuery.value).toLowerCase());
        case 'greaterThan':
          return Number(value) > Number(searchQuery.value);
        case 'lessThan':
          return Number(value) < Number(searchQuery.value);
        default:
          return true;
      }
    });
  }

  return filtered;
}, [assets, activeView, searchQuery]);

// Оновити handler:
const handleSearch = (query: SearchQuery) => {
  setSearchQuery(query);
  setCurrentPage(1);
};
```

**Перевірка:**
- [ ] Пошук працює з різними операторами
- [ ] Пошук працює для різних таблиць
- [ ] Фільтри view продовжують працювати

---

### Крок 2.3: Передати columns в SearchDialog

**Файл:** `app/assets/page.tsx`

**Зміни:**
1. Імпортувати `mockColumnDefs`
2. Передати в SearchDialog

**Код:**
```typescript
import { mockViews, mockAssets, mockColumnDefs } from '@/lib/mock-data/asset-list';

// В JSX:
<SearchDialog
  open={searchOpen}
  onClose={() => setSearchOpen(false)}
  columns={mockColumnDefs}
  onSearch={handleSearch}
/>
```

**Перевірка:**
- [ ] SearchDialog отримує columns
- [ ] Вибір полів працює правильно

---

### Крок 2.4: Тестування Етапу 2

**Чеклист:**
- [ ] Advanced search знаходить assets правильно
- [ ] Всі оператори працюють
- [ ] Пошук по різним таблицям працює
- [ ] Комбінація з filters працює
- [ ] Немає помилок

**Git commit:**
```bash
git add .
git commit -m "feat: Add advanced search with field selector and operators"
```

---

## ЕТАП 3: INLINE EDITING (Safe Pattern)

### Крок 3.1: Додати edit state в DataTable

**Файл:** `components/asset-list/DataTable.tsx`

**Зміни:**
1. Додати state для editing mode
2. Додати prop `onUpdateAsset`
3. Реалізувати inline editing через kebab menu

**Код:**
```typescript
interface DataTableProps {
  // ... existing props
  onUpdateAsset?: (assetId: string, updates: Partial<Asset>) => void; // НОВИЙ
}

export default function DataTable({
  // ... existing props
  onUpdateAsset
}: DataTableProps) {
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<Asset>>({});

  const startEditing = (asset: Asset) => {
    setEditingRowId(asset.id);
    setEditingValues({ ...asset });
  };

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditingValues({});
  };

  const saveEditing = () => {
    if (editingRowId && onUpdateAsset) {
      onUpdateAsset(editingRowId, editingValues);
      setEditingRowId(null);
      setEditingValues({});
    }
  };

  // В render:
  {data.map((asset) => {
    const isEditing = editingRowId === asset.id;
    
    return (
      <TableRow
        key={asset.id}
        className={isEditing ? 'bg-blue-50 border-blue-300 border-2' : ''}
      >
        {/* Cells */}
        {columns.map((column) => {
          const isEditable = column.field !== 'id' && 
                           column.field !== 'pipeSegment' &&
                           column.type !== 'date';

          return (
            <TableCell key={column.id}>
              {isEditing && isEditable ? (
                <Input
                  value={editingValues[column.field as keyof Asset] || ''}
                  onChange={(e) => setEditingValues(prev => ({
                    ...prev,
                    [column.field]: e.target.value
                  }))}
                />
              ) : (
                <span>{getCellValue(asset, column)}</span>
              )}
            </TableCell>
          );
        })}

        {/* Actions */}
        <TableCell>
          {isEditing ? (
            <div className="flex gap-1">
              <Button size="sm" onClick={saveEditing}>Save</Button>
              <Button size="sm" variant="ghost" onClick={cancelEditing}>Cancel</Button>
            </div>
          ) : (
            <DropdownMenu>
              {/* ... existing menu */}
              <DropdownMenuItem onClick={() => startEditing(asset)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Asset
              </DropdownMenuItem>
            </DropdownMenu>
          )}
        </TableCell>
      </TableRow>
    );
  })}
}
```

**Перевірка:**
- [ ] Edit mode активується через kebab menu
- [ ] Save/Cancel працюють
- [ ] Візуальне виділення редагування працює

---

### Крок 3.2: Додати handler на головній сторінці

**Файл:** `app/assets/page.tsx`

**Зміни:**
1. Змінити `assets` з `useState` на можливість оновлення
2. Додати handler `handleUpdateAsset`

**Код:**
```typescript
// Замінити:
const [assets] = useState<Asset[]>(() => { ... });

// На:
const [assets, setAssets] = useState<Asset[]>(() => { ... });

// Додати handler:
const handleUpdateAsset = (assetId: string, updates: Partial<Asset>) => {
  setAssets(assets.map(asset => 
    asset.id === assetId ? { ...asset, ...updates } : asset
  ));
  
  // Show toast notification (якщо є)
  // toast({ title: "Asset updated", description: "Changes saved successfully" });
};

// В JSX:
<DataTable
  // ... existing props
  onUpdateAsset={handleUpdateAsset}
/>
```

**Перевірка:**
- [ ] Оновлення asset зберігається
- [ ] Таблиця оновлюється відразу
- [ ] Інші функції не порушені

---

### Крок 3.3: Тестування Етапу 3

**Чеклист:**
- [ ] Edit mode активується через kebab menu (НЕ через клік на cell)
- [ ] Можна редагувати кілька полів одночасно
- [ ] Save зберігає зміни
- [ ] Cancel скасовує зміни
- [ ] Візуальне виділення редагування працює
- [ ] Неможливо випадково редагувати ID/key fields

**Git commit:**
```bash
git add .
git commit -m "feat: Add safe inline editing via kebab menu"
```

---

## ЕТАП 4: EXPORT SELECTED

### Крок 4.1: Встановити залежність

```bash
npm install xlsx
npm install --save-dev @types/xlsx
```

---

### Крок 4.2: Створити утиліту для експорту

**Файл:** `lib/utils/export.ts` (НОВИЙ)

**Код:**
```typescript
import * as XLSX from 'xlsx';
import type { Asset, ColumnDef } from '../types/asset-list';

export async function exportToExcel(
  assets: Asset[],
  columns: ColumnDef[],
  filename: string
) {
  const exportData = assets.map(asset => {
    const row: Record<string, unknown> = {};
    columns.forEach(col => {
      const value = asset[col.field as keyof Asset] || '';
      row[col.label] = value;
    });
    return row;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // Auto-size columns
  const maxWidths: number[] = [];
  columns.forEach((col, idx) => {
    const headerWidth = col.label.length;
    const dataWidths = exportData.map(row => 
      String(row[col.label] || '').length
    );
    maxWidths[idx] = Math.max(headerWidth, ...dataWidths, 10);
  });
  ws['!cols'] = maxWidths.map(w => ({ wch: w }));

  XLSX.utils.book_append_sheet(wb, ws, 'Assets');
  XLSX.writeFile(wb, filename);
}

export async function exportToCSV(
  assets: Asset[],
  columns: ColumnDef[],
  filename: string
) {
  const headers = columns.map(col => col.label).join(',');
  const rows = assets.map(asset => {
    return columns.map(col => {
      const value = asset[col.field as keyof Asset] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  const csv = [headers, ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
```

**Перевірка:**
- [ ] Файл створено
- [ ] Немає TypeScript помилок

---

### Крок 4.3: Додати handler в Toolbar

**Файл:** `components/asset-list/Toolbar.tsx`

**Зміни:**
1. Додати prop `onExportSelected`
2. Підключити до кнопки "Export Selected"

**Код:**
```typescript
interface ToolbarProps {
  // ... existing props
  onExportSelected?: () => void; // НОВИЙ
}

// В JSX:
{selectedRowsCount > 0 && (
  <Button variant="outline" size="sm" onClick={onExportSelected}>
    <Download className="mr-2 h-4 w-4" />
    Export Selected
  </Button>
)}
```

---

### Крок 4.4: Створити Export Dialog

**Файл:** `components/asset-list/ExportDialog.tsx` (НОВИЙ)

**Код:** (Див. `new-functional-update.md` секція 5)

---

### Крок 4.5: Додати handler на головній сторінці

**Файл:** `app/assets/page.tsx`

**Код:**
```typescript
import { exportToExcel, exportToCSV } from '@/lib/utils/export';

const handleExportSelected = async () => {
  if (selectedRows.length === 0) return;
  
  const selectedAssets = assets.filter(a => selectedRows.includes(a.id));
  const date = new Date().toISOString().split('T')[0];
  const filename = `CoreVision_Export_${activeView.name}_${date}.xlsx`;

  try {
    await exportToExcel(selectedAssets, displayedColumns, filename);
    // Show toast
  } catch (error) {
    // Show error toast
  }
};
```

---

### Крок 4.6: Тестування Етапу 4

**Чеклист:**
- [ ] Експорт працює для вибраних рядків
- [ ] Експорт включає тільки видимі колонки
- [ ] Файл завантажується правильно
- [ ] Формат Excel правильний

**Git commit:**
```bash
git add .
git commit -m "feat: Add export selected functionality"
```

---

## ЕТАП 5: FIND & REPLACE

### Крок 5.1: Створити FindReplaceDialog

**Файл:** `components/asset-list/FindReplaceDialog.tsx` (НОВИЙ)

**Код:** (Див. `new-functional-update.md` секція 4)

---

### Крок 5.2: Підключити до Toolbar

**Файл:** `components/asset-list/Toolbar.tsx`

**Зміни:**
1. Додати prop `onFindReplace`
2. Підключити до пункту меню "Find & Replace"

---

### Крок 5.3: Додати handler на головній сторінці

**Файл:** `app/assets/page.tsx`

**Код:**
```typescript
const handleFindReplace = (operation: ReplaceOperation) => {
  const updatedAssets = assets.map(asset => {
    if (operation.matchedAssetIds.includes(asset.id)) {
      return {
        ...asset,
        [operation.field]: operation.replaceValue
      };
    }
    return asset;
  });
  setAssets(updatedAssets);
};
```

---

### Крок 5.4: Тестування Етапу 5

**Чеклист:**
- [ ] Find показує кількість matches
- [ ] Replace працює правильно
- [ ] Scope selection працює
- [ ] Підтвердження вимагається

**Git commit:**
```bash
git add .
git commit -m "feat: Add find & replace functionality"
```

---

## ЕТАП 6: REPORT GENERATION

### Крок 6.1: Встановити залежності

```bash
npm install jspdf jspdf-autotable
```

---

### Крок 6.2: Створити PDF generator

**Файл:** `lib/utils/pdf-generator.ts` (НОВИЙ)

**Код:** (Див. `new-functional-update.md` секція 7)

---

### Крок 6.3: Створити ReportDialog

**Файл:** `components/asset-list/ReportDialog.tsx` (НОВИЙ)

**Код:** (Див. `new-functional-update.md` секція 7)

---

### Крок 6.4: Підключити до Toolbar

**Файл:** `components/asset-list/Toolbar.tsx`

**Зміни:**
1. Додати prop `onGenerateReport`
2. Підключити до пункту меню (або окремої кнопки)

---

### Крок 6.5: Тестування Етапу 6

**Чеклист:**
- [ ] Preview показується перед генерацією
- [ ] PDF генерується правильно
- [ ] Всі опції працюють
- [ ] Файл завантажується

**Git commit:**
```bash
git add .
git commit -m "feat: Add report generation with preview"
```

---

## ЕТАП 7: POP-OUT FUNCTIONALITY

### Крок 7.1: Створити pop-out routes

**Файли:**
- `app/assets/popout/map/page.tsx` (НОВИЙ)
- `app/assets/popout/table/page.tsx` (НОВИЙ)

**Код:** (Див. `new-functional-update.md` секція 1)

---

### Крок 7.2: Додати state синхронізацію

**Файл:** `app/assets/page.tsx`

**Зміни:**
1. Додати state для popped-out sections
2. Додати BroadcastChannel для синхронізації
3. Оновити handlers для pop-out

**Код:** (Див. `new-functional-update.md` секція 1)

---

### Крок 7.3: Тестування Етапу 7

**Чеклист:**
- [ ] Pop-out Map відкривається в новому вікні
- [ ] Pop-out Table відкривається в новому вікні
- [ ] State синхронізується між вікнами
- [ ] Закриття pop-out працює правильно

**Git commit:**
```bash
git add .
git commit -m "feat: Add pop-out functionality for Map and Table"
```

---

## 🧪 ФІНАЛЬНЕ ТЕСТУВАННЯ

### Загальний чеклист:

- [ ] Всі 7 функцій працюють
- [ ] Старий функціонал не порушений
- [ ] Немає TypeScript помилок
- [ ] Немає помилок в консолі
- [ ] UI виглядає правильно
- [ ] Всі dialogs працюють
- [ ] Всі handlers працюють
- [ ] Performance прийнятний

### Тестування інтеграції:

1. **Toolbar:**
   - [ ] Filter button → Filters tab
   - [ ] Columns button → Columns tab
   - [ ] Search → Advanced search
   - [ ] Export Selected → Export dialog
   - [ ] Find & Replace → FindReplace dialog
   - [ ] Pop-out → New windows

2. **DataTable:**
   - [ ] Inline editing через kebab menu
   - [ ] Save/Cancel працюють
   - [ ] Selection працює
   - [ ] Sorting працює
   - [ ] Column reorder працює

3. **Search:**
   - [ ] Advanced search знаходить правильно
   - [ ] Всі оператори працюють
   - [ ] Комбінація з filters працює

4. **Export:**
   - [ ] Export selected працює
   - [ ] Файл завантажується
   - [ ] Формат правильний

5. **Find & Replace:**
   - [ ] Match count показується
   - [ ] Replace працює
   - [ ] Scope працює

6. **Report:**
   - [ ] Preview показується
   - [ ] PDF генерується
   - [ ] Всі опції працюють

7. **Pop-out:**
   - [ ] Вікна відкриваються
   - [ ] State синхронізується
   - [ ] Закриття працює

---

## 🚨 ВАЖЛИВІ ЗАУВАЖЕННЯ

### Backward Compatibility:

1. **Toolbar:** Старий `onOpenViewSettings` залишено для сумісності
2. **SearchDialog:** Можна додати fallback для старого формату (але не обов'язково)
3. **DataTable:** `onUpdateAsset` опціональний, тому старий код працює

### Ризики:

1. **State management:** Додавання нового state може вплинути на performance
   - **Рішення:** Використовувати `useMemo` та `useCallback` де потрібно

2. **TypeScript:** Зміни типів можуть поламати інші файли
   - **Рішення:** Додавати нові типи як опціональні, де можливо

3. **Dependencies:** Нові залежності можуть конфліктувати
   - **Рішення:** Перевіряти версії та тестувати після встановлення

### Оптимізація:

1. **Lazy loading:** Pop-out routes можна lazy load
2. **Memoization:** Використовувати `React.memo` для компонентів
3. **Code splitting:** Великі dialogs можна lazy load

---

## 📚 ДОДАТКОВІ РЕСУРСИ

- `new-functional-update.md` - детальний опис функцій
- Існуючі компоненти - для розуміння структури
- TypeScript типи - для правильних інтерфейсів

---

## ✅ КРИТЕРІЇ УСПІХУ

Реалізація вважається успішною, коли:

1. ✅ Всі 7 функцій працюють
2. ✅ Старий функціонал не порушений
3. ✅ Немає критичних помилок
4. ✅ UI виглядає професійно
5. ✅ Performance прийнятний
6. ✅ Код чистий та підтримуваний

---

**Успіхів у реалізації! 🚀**

