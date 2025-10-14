# Inspection Interface - Функціональність

## 🎯 Огляд

Інтерфейс для інспекції труб з відео синхронізацією та управлінням спостереженнями (observations).

## ✨ Основні функції

### 1. **Відео плеєр**
- ▶️ Відтворення/Пауза відео
- ⏮️ ⏭️ Перемотування вперед/назад
- 📸 Знімок екрану
- 💾 Завантаження відео
- 🎯 Синхронізація з спостереженнями

### 2. **Управління спостереженнями (Observations)**

#### Додавання:
- **Quick Actions** - швидке додавання з шаблонів (Hot Buttons)
- **Add Observation** - створення нового запису
- **Duplicate** - дублювання існуючого спостереження

#### Редагування:
- **Double-click** на комірку для редагування
- Поля: Distance, Code, Description, Grade
- Автоматичне збереження при втраті фокусу

#### Видалення:
- **Delete** клавіша - видалення обраного
- **Context Menu** → Delete
- Підтвердження видалення

### 3. **Hot Buttons (Швидкі шаблони)**
- 🔨 Broken Pipe
- 🌿 Roots
- ⚡ Crack
- Управління шаблонами через діалог
- Збереження нових з існуючих observations

### 4. **Синхронізація відео**
- Клік на observation → перехід до timestamp у відео
- Візуалізація на Timeline (Pipe Segment Overview)
- Кольорове кодування по grade:
  - 🔴 Grade 4-5: Red (критичний)
  - 🟡 Grade 3: Yellow (помірний)
  - 🟢 Grade 1-2: Green (нормальний)

### 5. **Comparison Mode**
- Порівняння з попередніми інспекціями
- Візуальні індикатори змін:
  - 🟩 Нові спостереження (зелений фон)
  - ⬜ Незмінні (білий фон)

### 6. **Keyboard Shortcuts**

| Клавіша | Дія |
|---------|-----|
| `Space` | Play/Pause відео |
| `Delete` | Видалити обране спостереження |
| `Esc` | Скасувати редагування / Зняти виділення |
| `Double-click` | Редагувати комірку |
| `Right-click` | Контекстне меню |

### 7. **Context Menu (Правий клік)**
- 📋 Duplicate - дублювати запис
- ⭐ Save as Hot Button - зберегти як шаблон
- 🗑️ Delete - видалити

### 8. **Toast Notifications**
- ✅ Успішні операції (зелений)
- ℹ️ Інформаційні (синій)
- Автоматичне зникнення через 3 сек

## 🏗️ Технічна інформація

### Стек:
- **Next.js 15** (App Router)
- **TypeScript** - повна типізація
- **Tailwind CSS** - стилізація
- **Lucide React** - іконки
- **shadcn/ui** - готові до використання

### Типи даних:

```typescript
interface Observation {
  id: number;
  timestamp: string;
  distance: number;
  code: string;
  description: string;
  grade: number;
  status: 'new' | 'same' | 'modified';
}

interface HotButton {
  id: number;
  name: string;
  code: string;
  icon: string;
}
```

### Структура компонентів:
```
app/page.tsx          - Головний компонент
types/inspection.ts   - TypeScript типи
components/ui/        - shadcn/ui компоненти
```

## 📝 Використання

### Базовий workflow:

1. **Відкрийте проект:**
   ```bash
   npm run dev
   ```

2. **Відкрийте http://localhost:3000**

3. **Робота з observations:**
   - Використайте Quick Actions для швидкого додавання
   - Або створіть новий через "Add Observation"
   - Double-click для редагування
   - Right-click для додаткових опцій

4. **Навігація по відео:**
   - Клік на observation → синхронізація відео
   - Space для play/pause
   - Використовуйте timeline для візуалізації

5. **Збереження:**
   - Всі зміни зберігаються автоматично
   - "Save and Exit" для завершення

## 🔄 Майбутні покращення

- [ ] Інтеграція з реальним відео API
- [ ] Експорт звітів у PDF
- [ ] Багатомовність (UA/EN)
- [ ] Offline режим
- [ ] Історія змін (undo/redo)
- [ ] Collaborative editing

