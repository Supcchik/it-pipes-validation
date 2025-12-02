# 📋 ПЛАН: Переписування FloatingSelectionBar

## 🎯 МЕТА
Видалити поточну реалізацію FloatingSelectionBar і створити її наново з нуля, щоб вона працювала коректно.

---

## 📝 КРОК 1: АНАЛІЗ ПОТОЧНОГО СТАНУ

### Файли, які використовують FloatingSelectionBar:
1. ✅ `components/asset-list/FloatingSelectionBar.tsx` - сам компонент
2. ✅ `app/assets/page.tsx` - імпорт та використання
3. ✅ `components/asset-list/Toolbar.tsx` - видалено inline selection actions (вже зроблено)

### Залежності:
- `selectedRows` state в `app/assets/page.tsx`
- Handlers: `handleEditSelected`, `handleDeleteSelected`, `handleExportSelected`, `handleClearSelection`
- Імпорти: `Edit`, `Trash2`, `Download`, `X` з lucide-react
- UI компоненти: `Button`, `Badge`

---

## 🗑️ КРОК 2: ВИДАЛЕННЯ (БЕЗПЕЧНЕ)

### 2.1 Видалити імпорт FloatingSelectionBar
**Файл:** `app/assets/page.tsx`
- Знайти: `import FloatingSelectionBar from '@/components/asset-list/FloatingSelectionBar';`
- Видалити цей рядок

### 2.2 Видалити використання компонента
**Файл:** `app/assets/page.tsx`
- Знайти блок:
```tsx
{/* Floating Selection Bar */}
<FloatingSelectionBar
  selectedCount={selectedRows.length}
  onEdit={handleEditSelected}
  onDelete={handleDeleteSelected}
  onExport={handleExportSelected}
  onClear={handleClearSelection}
/>
```
- Видалити весь цей блок

### 2.3 Залишити handlers (вони можуть знадобитися)
**Файл:** `app/assets/page.tsx`
- НЕ видаляти:
  - `handleEditSelected`
  - `handleDeleteSelected`
  - `handleExportSelected`
  - `handleClearSelection`
- Вони можуть використовуватися в майбутньому

### 2.4 Видалити файл компонента
**Файл:** `components/asset-list/FloatingSelectionBar.tsx`
- Видалити весь файл

### 2.5 Перевірити, що нічого не зламалося
- Перевірити, що Toolbar працює (без inline selection actions)
- Перевірити, що вибір рядків працює (чекбокси)
- Перевірити, що `selectedRows` state оновлюється

---

## 🏗️ КРОК 3: НОВА РЕАЛІЗАЦІЯ

### 3.1 Створити новий компонент FloatingSelectionBar
**Файл:** `components/asset-list/FloatingSelectionBar.tsx`

**Структура:**
```typescript
'use client';

import { Edit, Trash2, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FloatingSelectionBarProps {
  selectedCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  onClear: () => void;
}

export default function FloatingSelectionBar({
  selectedCount,
  onEdit,
  onDelete,
  onExport,
  onClear
}: FloatingSelectionBarProps) {
  // Early return if nothing selected
  if (selectedCount === 0) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-20 z-50 ...">
      {/* Content */}
    </div>
  );
}
```

**Ключові моменти:**
- ✅ Простий компонент без portal
- ✅ Без useEffect/mounted перевірок
- ✅ Без діагностичних логів
- ✅ Просто умова `if (selectedCount === 0) return null`
- ✅ Fixed positioning з правильним z-index

### 3.2 Стилізація
```css
- fixed positioning
- left-1/2 -translate-x-1/2 (центрування)
- bottom-20 (80px від низу)
- z-50 (вище контенту)
- bg-white, border, rounded-xl, shadow-2xl
- px-6 py-4 (відступи)
```

### 3.3 Інтеграція в page.tsx
**Файл:** `app/assets/page.tsx`

1. Додати імпорт:
```typescript
import FloatingSelectionBar from '@/components/asset-list/FloatingSelectionBar';
```

2. Додати компонент після основного контенту:
```typescript
{/* Floating Selection Bar */}
<FloatingSelectionBar
  selectedCount={selectedRows.length}
  onEdit={handleEditSelected}
  onDelete={handleDeleteSelected}
  onExport={handleExportSelected}
  onClear={handleClearSelection}
/>
```

### 3.4 Перевірка handlers
Переконатися, що всі handlers існують:
- `handleEditSelected` - вже є
- `handleDeleteSelected` - вже є
- `handleExportSelected` - вже є
- `handleClearSelection` - вже є

---

## ✅ КРОК 4: ТЕСТУВАННЯ

### 4.1 Базові перевірки:
- [ ] Компонент не рендериться, коли `selectedCount === 0`
- [ ] Компонент з'являється, коли вибрано рядки
- [ ] Компонент зникає, коли вибір очищено
- [ ] Правильне позиціонування (центр, 80px від низу)
- [ ] Правильний z-index (вище контенту)

### 4.2 Функціональні перевірки:
- [ ] Кнопка "Edit" викликає `onEdit`
- [ ] Кнопка "Delete" викликає `onDelete`
- [ ] Кнопка "Export Selected" викликає `onExport`
- [ ] Кнопка "Clear" викликає `onClear` і очищає вибір

### 4.3 Візуальні перевірки:
- [ ] Правильний текст (1 asset / 2 assets)
- [ ] Правильні іконки
- [ ] Правильні кольори (червоний для Delete)
- [ ] Тінь та закруглення
- [ ] Адаптивність на різних екранах

---

## 🔧 КРОК 5: ОПТИМІЗАЦІЯ (опціонально)

### 5.1 Анімації
- Додати smooth appear/disappear анімації
- Використати CSS transitions

### 5.2 Responsive
- Адаптувати для мобільних пристроїв
- Зменшити bottom offset на малих екранах

### 5.3 Accessibility
- Додати ARIA labels
- Додати keyboard navigation

---

## 📋 ЧЕКЛИСТ ВИКОНАННЯ

### Видалення:
- [ ] Видалити імпорт з `app/assets/page.tsx`
- [ ] Видалити використання компонента з `app/assets/page.tsx`
- [ ] Видалити файл `components/asset-list/FloatingSelectionBar.tsx`
- [ ] Перевірити, що нічого не зламалося

### Створення:
- [ ] Створити новий `FloatingSelectionBar.tsx`
- [ ] Додати імпорт в `app/assets/page.tsx`
- [ ] Додати використання компонента
- [ ] Перевірити базову функціональність

### Тестування:
- [ ] Перевірити появу/зникнення
- [ ] Перевірити всі кнопки
- [ ] Перевірити позиціонування
- [ ] Перевірити стилізацію

---

## 🎯 ПРИНЦИПИ НОВОЇ РЕАЛІЗАЦІЇ

1. **Простота** - мінімум коду, без зайвих перевірок
2. **Надійність** - використовувати стандартні React паттерни
3. **Читабельність** - зрозумілий код без діагностики
4. **Продуктивність** - без зайвих re-renders

---

## 🚀 ПОЧАТИ ВИКОНАННЯ

Готовий почати? Почнемо з кроку 2 (видалення)!

