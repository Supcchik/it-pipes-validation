# ITpipes Prototype - Update Plan
## Based on Roxie's Feedback - Thursday Sync Preparation

---

## 📋 Пріоритизація завдань

### ✅ ПРОСТО (Швидко) - 15-30 хв кожен

#### 1. Термінологія "Quick Code" (~15 хв)

**Що робимо:**
- Find & replace всіх згадок "Hot Button" → "Quick Code"
- Оновити всі UI labels, tooltips, та toast messages

**Де змінюємо:**
- Header секція: "Quick Actions" (можливо залишити як є, бо "Actions" - це загальна назва)
- FAB кнопка tooltip: "Quick Actions"
- Context menu: "Save as Hot Button" → "Save as Quick Code"
- Toast messages: "Hot button removed" → "Quick Code removed"
- Dialog title: "Manage Hot Buttons" → "Manage Quick Codes"
- Кнопки в UI: везде де є "Hot Button"

**Діалог створення Quick Code:**
```
Title: "Save this observation?"
Subtitle: "Create a Quick Code for observations you make frequently."
Input label: "Quick Code Name:"
Buttons: [Cancel] [Create Quick Code]
```

**UX логіка:**
- Термінологія має бути консистентною всюди
- "Quick Code" більш зрозуміло для користувачів ніж "Hot Button"
- "Template" вже використовується для чогось іншого в системі ITpipes

---

#### 2. Безпечніші Trash Icons (~20 хв)

**Що робимо:**
- Прибрати trash icon з таблиці (MoreVertical кнопка в кожному рядку)
- Залишити delete тільки в context menu (right-click)
- Зберегти Delete keyboard shortcut

**Де змінюємо:**
- Таблиця спостережень: прибрати останню колонку з MoreVertical
- Context menu: залишити опцію "Delete" з іконкою Trash2
- Keyboard shortcut (Delete key): зберегти як є

**UX логіка:**

**Проблема:** 
- Користувачі можуть випадково видалити важливі спостереження через видимі trash icons
- Роксі: "the trash cans should be less visible because that could cause users to make a big mistake"

**Рішення:**
- Ховаємо деструктивні дії за додатковий клік (context menu)

**Workflow:** 
1. Right-click на observation → Context menu → Delete → Confirmation dialog
2. Або: Select observation → Delete key → Confirmation dialog

**Переваги:** 
- Менше випадкових видалень
- Функціонал залишається доступним
- Таблиця стає чистішою

**Trade-off:** 
- +1 клік для досвідчених користувачів
- Але більше безпеки для всіх

**Візуальні зміни:**
- Таблиця стає чистішою без зайвих іконок
- Context menu стає основним способом доступу до дій над observation
- Hover на рядку показує тільки highlight, не додаткові кнопки

---

#### 3. Tab Navigation для швидкого вводу (~20 хв)

**Що робимо:**
- Додати можливість навігації Tab між полями при створенні/редагуванні observation
- Enter для збереження та переходу до наступного поля
- Escape для скасування редагування

**Де реалізуємо:**
- При створенні нового observation (Add Observation кнопка)
- При double-click редагуванні існуючого observation
- Всі editable поля: Distance, Code, Description, Grade, Value1, Value2, etc.

**UX логіка:**

**Сценарій 1: Створення нового observation**
1. Користувач натискає "Add Observation"
2. Створюється новий рядок з фокусом на полі "Code"
3. Користувач вводить код → Tab → перехід до Distance
4. Вводить distance → Tab → перехід до Description
5. І так далі через всі поля
6. Enter в останньому полі → зберігає observation
7. Escape в будь-якому полі → скасовує створення

**Сценарій 2: Редагування існуючого observation**
1. Double-click на комірку (наприклад Distance)
2. Комірка стає editable
3. Tab → переходить до наступного поля (Code)
4. Shift+Tab → повертається до попереднього поля
5. Enter → зберігає зміни в поточному полі
6. Escape → скасовує зміни

**Keyboard shortcuts:**
- `Tab` - next field
- `Shift+Tab` - previous field
- `Enter` - save current field & move to next (або save all якщо останнє поле)
- `Escape` - cancel editing

**Порядок полів для Tab navigation:**
1. Code
2. Distance
3. Description
4. Grade
5. Value1
6. Value2
7. Percent
8. Continuous
9. Joint
10. Clock1
11. Clock2
12. Remarks

**Переваги:**
- Швидше введення даних без використання миші
- Природній workflow для користувачів звичних до Excel/spreadsheets
- Менше помилок через focus management

---

#### 4. Export/Upload кнопки в Header (~25 хв)

**Що робимо:**
- Додати кнопку "Export Report" 📄 в header
- Додати кнопку "Upload Video" 📤 в header
- Базовий UI без реальної функціональності (mock functions з toast notifications)

**Де розміщуємо:**
Header inspection screen, праворуч від "Compare Mode" кнопки

**Варіант 1: Окремі кнопки в header**
```
[Pipe Segment Info] ... [Compare Mode] [Export Report] [Upload Video] [Save and Exit]
```

**Варіант 2: Dropdown "Actions" menu (якщо header переповнений)**
```
[Pipe Segment Info] ... [Compare Mode] [Actions ▼] [Save and Exit]
  └─ Export Report
  └─ Upload Video
  └─ Copy Link
  └─ Delete Inspection
```

**UX логіка:**

**Export Report:**
- **Use case:** Інспектор закінчив кодування спостережень і хоче згенерувати PDF/Excel звіт
- **Workflow:**
  1. Натискає "Export Report" 📄
  2. Показується діалог з опціями:
     - Format: [PDF] [Excel] [CSV]
     - Include: ☑ Video screenshots ☑ Observations table ☑ Pipe info ☑ Notes
     - Date range: [All] або custom range
  3. [Cancel] [Generate Report]
  4. Toast: "Report generated successfully" + download link
- **Mock function:** Показує toast "Report export started - this would generate a PDF"

**Upload Video:**
- **Use case:** Інспектор має нове відео з інспекції і хоче замінити або додати його
- **Workflow:**
  1. Натискає "Upload Video" 📤
  2. Відкривається file picker для вибору відео
  3. Показується progress bar upload
  4. Toast: "Video uploaded successfully"
  5. Відео замінюється в плеєрі
- **Mock function:** Показує toast "Video upload started - this would upload to cloud storage"

**Візуальний дизайн:**
- Export Report: Сіра кнопка з іконкою Download
- Upload Video: Сіра кнопка з іконкою Upload
- Hover: Легкий background color change
- Responsive: На mobile показувати тільки іконки без тексту

**Альтернатива - "..." More actions menu:**
- Якщо header стає переповненим, можна згрупувати в dropdown
- Кнопка "•••" (MoreHorizontal icon) → dropdown з всіма actions
- Це cleanerший UI але +1 клік для користувача

---

## 🟡 СЕРЕДНЬО (Нормально) - 45-90 хв кожен

### 5. Video/Image Toggle View (~60 хв)

**Що робимо:**
- Додати toggle switch "Video / Image" для перемикання між відео плеєром та screenshot view
- Коли Image mode - показувати screenshot обраного observation
- Коли Video mode - показувати відео плеєр як зараз

**Де розміщуємо:**
- Над відео плеєром, праворуч або зліва
- Або в header відео секції

**UX логіка:**

**Проблема (від Роксі):**
- "if I click the observation I see that screen on the video anyway. So it would be redundant to show the video frame and the screenshot at the same time"
- Користувачі хочуть іноді focus на статичному screenshot замість відео

**Рішення:**
- Toggle між Video та Image mode (як list/gallery view в іншому проекті)
- **Video mode:** Стандартний відео плеєр з контролами
- **Image mode:** Показує screenshot обраного observation в тому ж місці

**Workflow:**

**Сценарій 1: Перегляд в Image mode**
1. Користувач переключає toggle на "Image"
2. Відео плеєр ховається
3. Показується screenshot обраного observation (selectedObservation)
4. Якщо нема обраного observation → показується placeholder "Select an observation to view screenshot"
5. Під screenshot показується info: Timestamp, Distance, Code
6. Користувач клікає на інший observation → screenshot змінюється
7. Кнопки під screenshot: [Download] [Delete] [<Previous] [Next>]

**Сценарій 2: Перемикання між modes**
1. User в Video mode, обрано observation #2
2. Переключає на Image mode
3. Показується screenshot observation #2
4. Користувач переглядає screenshot, натискає Next
5. Переходить до observation #3 screenshot
6. Переключає назад на Video mode
7. Відео синхронізується з observation #3 timestamp

**Візуальний дизайн:**

**Toggle switch:**
```
[📹 Video] [🖼️ Image]
```
- Active state: Orange background
- Inactive state: Gray background
- Smooth transition animation

**Image mode layout:**
```
┌─────────────────────────────────┐
│  [📹 Video] [🖼️ Image] ← toggle │
├─────────────────────────────────┤
│                                 │
│      [Large Screenshot]         │
│                                 │
├─────────────────────────────────┤
│ Observation #2 | 1:45.000       │
│ Distance: 11ft | Code: MLWE     │
├─────────────────────────────────┤
│ [Download] [< Prev] [Next >]    │
└─────────────────────────────────┘
```

**Edge cases:**
- Якщо нема screenshots → показати placeholder "No screenshot available"
- Якщо нема обраного observation → "Select an observation to view"
- При перемиканні зберігати context (який observation обрано)

**Переваги:**
- Більше space для детального перегляду screenshot
- Не redundant - один view за раз
- Схоже на знайомий pattern list/gallery toggle
- Швидкий перегляд screenshots без video controls

---

### 6. General Notes Section (~45 хв)

**Що робимо:**
- Додати collapsible panel "Notes" для загальних приміток по інспекції
- Textarea для введення вільного тексту
- Автозбереження при втраті фокусу

**Де розміщуємо:**
- **Рекомендація:** Під відео плеєром (collapsible)
- Альтернативи: В правій колонці під таблицею або окрема вкладка

**UX логіка:**

**Use case:**
- Інспектор хоче додати загальні коментарі про інспекцію
- Не прив'язані до конкретного observation
- Наприклад: "Weather conditions: rainy", "Access was difficult", "Need follow-up inspection in 6 months"

**Workflow:**

**Сценарій 1: Додавання notes**
1. Під відео є collapsible panel "Notes" (згорнутий за замовчуванням)
2. Користувач клікає на header панелі → розгортається
3. Показується textarea з placeholder "Add general notes about this inspection..."
4. Користувач вводить текст
5. При втраті фокусу (onBlur) → автоматично зберігається
6. Toast: "Notes saved"

**Сценарій 2: Редагування notes**
1. Panel вже містить текст з попередньої сесії
2. Користувач клікає в textarea → редагує
3. onBlur → автозбереження
4. Або кнопка "Save" для manual save

**Візуальний дизайн:**

**Згорнутий стан:**
```
┌─────────────────────────────────┐
│ 📝 Notes (3 lines) [▼]          │
└─────────────────────────────────┘
```

**Розгорнутий стан:**
```
┌─────────────────────────────────┐
│ 📝 Notes [▲]                     │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Weather conditions: rainy   │ │
│ │ Access was difficult        │ │
│ │ Need follow-up in 6 months  │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│           [Clear] [Save]         │
│ Last saved: 2 minutes ago        │
└─────────────────────────────────┘
```

**Features:**
- Character counter (optional): "0/5000 characters"
- Timestamp "Last saved: X minutes ago"
- Clear button для швидкого очищення
- Save button якщо не хочемо auto-save
- Rich text formatting? (bold, italic, lists) - можна додати пізніше

**Переваги:**
- Централізоване місце для загальних коментарів
- Не захаращує основний UI (collapsible)
- Автозбереження запобігає втраті даних
- Visible під відео - легко доступно

---

### 7. Pop-out Video функція (~75 хв)

**Що робимо:**
- Додати кнопку "Pop-out" 🪟 біля відео плеєра
- При кліку відкриває відео в окремому вікні/modal
- Зберігає синхронізацію часу між основним та pop-out вікном
- Дозволяє користувачу розмістити відео на другому моніторі

**Де розміщуємо:**
- В контролах відео плеєра, поруч з fullscreen кнопкою
- Або в header відео секції

**UX логіка:**

**Use case (від Роксі):**
- "One very popular request is for the video to pop out so that users can see it full-screen on another screen"
- Інспектори часто працюють з 2+ моніторами
- Хочуть бачити відео на одному екрані, таблицю спостережень на іншому

**Workflow:**

**Сценарій 1: Opening pop-out**
1. Користувач натискає кнопку "Pop-out" 🪟
2. Відкривається нове browser window з відео
3. Основне вікно: відео зникає, показується placeholder "Video is playing in pop-out window"
4. Pop-out window: показує відео з всіма контролами
5. Обидва вікна синхронізовані - зміна часу в одному відображається в іншому

**Сценарій 2: Synced playback**
1. User грає відео в pop-out window
2. В основному вікні видно current timestamp
3. User клікає на observation в основному вікні
4. Pop-out window автоматично переходить до timestamp цього observation
5. Toast в обох вікнах: "Synced to observation"

**Сценарій 3: Closing pop-out**
1. User закриває pop-out window
2. Основне вікно: відео повертається на своє місце
3. Зберігається поточний timestamp
4. Toast: "Video returned to main window"

**Візуальний дизайн:**

**Pop-out кнопка:**
- Іконка: Maximize2 або ExternalLink
- Tooltip: "Open video in separate window"
- Розташування: В video controls, біля fullscreen

**Pop-out window layout:**
```
┌─────────────────────────────────┐
│ ITpipes - Video Player          │ ← window title
├─────────────────────────────────┤
│                                 │
│                                 │
│        [Video Player]           │
│                                 │
│                                 │
├─────────────────────────────────┤
│ [▶️] [⏮️] [⏭️] [🔊] [⛶]         │
│ ▬▬▬▬▬▬●▬▬▬▬▬▬▬▬▬▬▬▬▬▬ 1:45/2:31│
├─────────────────────────────────┤
│ Current: Observation #2         │
│ Distance: 11ft | Code: MLWE     │
└─────────────────────────────────┘
```

**Main window placeholder:**
```
┌─────────────────────────────────┐
│  🪟 Video is in pop-out window  │
│                                 │
│  Current time: 1:45 / 2:31      │
│  Playing: Observation #2        │
│                                 │
│  [Return Video to Main Window]  │
└─────────────────────────────────┘
```

**Синхронізація:**
- SharedState через localStorage або postMessage
- Двонаправна синхронізація: main ↔ popout
- Real-time updates при зміні часу або observation selection

**Edge cases:**
- Що якщо user закриє pop-out window? → Відео повертається в main
- Що якщо user відкриє кілька pop-outs? → Дозволити тільки один
- Що якщо connection lost? → Показати warning "Sync lost"

**Переваги:**
- Дуже корисно для multi-monitor setups
- Більше space для таблиці спостережень
- Popular feature request від користувачів
- Не ламає existing workflow

---

## 🔴 СКЛАДНО (Довго) - 2-4 год кожен

### 8. Comparison Mode з dual videos (~3 год)

**Що робимо:**
- Два окремі video players side-by-side для порівняння current та previous inspection
- Resizable divider між відео для adjustment proportions
- Independent або synced playback controls
- Візуальні індикатори різниці між інспекціями

**Де розміщуємо:**
- Ліва колонка розділяється на дві частини: Current (top/left) та Previous (bottom/right)
- Або горизонтальне розташування з vertical slider

**UX логіка (від Роксі):**

**Key insights:**
- "Right now they are not synced, so you would manually have to find the same spot on the pipe in the older video"
- "Because the camera can be moving slower or faster there isn't really a way to sync"
- "More than anything they are comparing the videos to see changes in the pipe over time"
- **Use case:** "When there is a defect, a crack for example. The question they are asking is, did it get a lot bigger over the past year?"

**Workflow:**

**Сценарій 1: Entering comparison mode**
1. User натискає "Compare Mode" кнопку в header
2. Інтерфейс змінюється:
   - Ліва колонка: Current video (top) + Previous video (bottom)
   - Права колонка: Дві таблиці спостережень (Current + Previous)
3. Обидва відео на паузі за замовчуванням
4. Toast: "Comparison mode active - Use independent controls to navigate"

**Сценарій 2: Comparing a defect**
1. User знаходить тріщину в current video at 1:45
2. Вручну шукає той самий spot в previous video (manually scrub timeline)
3. Бачить візуально чи тріщина стала більшою
4. Може взяти screenshots з обох відео для side-by-side comparison
5. Додає observation з remarks "Crack grew 50% since last year"

**Сценарій 3: Independent playback**
1. Current video грає від 1:00
2. Previous video на паузі на 1:30
3. User може управляти кожним відео окремо
4. Кнопка "Sync Playback" (optional) - спроба синхронізувати по distance, не по time

**Візуальний дизайн:**

**Layout - Vertical split (default):**
```
┌────────────────────┬────────────────────┐
│   Current Video    │  Current Table     │
│   [Video Player]   │  [Observations]    │
│   ▶️ 1:45 / 2:31   │                    │
├────────────────────┤                    │
│  Previous Video    │                    │
│   [Video Player]   │                    │
│   ▶️ 1:30 / 2:45   │                    │
├────────────────────┼────────────────────┤
│  [Screenshot       │  Previous Table    │
│   Comparison]      │  [Old Observations]│
└────────────────────┴────────────────────┘
```

**Layout - Horizontal split (slider option):**
```
┌─────────────────────────────────────────┐
│  Current Video    │  Previous Video     │
│  [Video Player]   │  [Video Player]     │
│  ▶️ 1:45 / 2:31   │  ▶️ 1:30 / 2:45    │
│         ◄═══╪═══►  ← draggable slider   │
└─────────────────────────────────────────┘
```

**Controls:**
- Each video має свої independent controls: ▶️ ⏮️ ⏭️ 🔊
- Toggle кнопки:
  - [Vertical Layout] [Horizontal Layout]
  - [Independent] [Synced by Distance]
- Comparison tools:
  - [Take Screenshots] - captures both videos
  - [Screenshot Slider] - before/after comparison

**Features:**

**1. Resizable divider:**
- Вертикальний або горизонтальний слайдер
- Drag to adjust video sizes
- Snap to 50/50 split
- Min/max constraints (20%/80%)

**2. Independent controls:**
- Кожне відео має свої play/pause, timeline, volume
- Можна грати одне відео while інше на паузі
- Кожне відео може бути в різних timestamp

**3. Visual indicators:**
- Labels: "Current Inspection (2024)" vs "Previous Inspection (2023)"
- Color coding: Current = orange accent, Previous = gray accent
- Timeline markers показують observations з обох інспекцій

**4. Screenshot capture:**
- Кнопка "Capture Both" 📸📸
- Зберігає screenshots з обох відео одночасно
- Автоматично відкриває Screenshot Comparison Slider

**Edge cases:**
- Що якщо previous inspection не існує? → Show message "No previous inspection available"
- Що якщо відео різної довжини? → OK, вони independent
- Що якщо user хоче synced playback? → Optional feature, але Роксі каже складно через різну швидкість камери

**Переваги:**
- Головний use case - порівняти deterioration over time
- Візуально бачити чи defect погіршився
- Можна manually знайти той самий spot на трубі
- Critical для decision making про repairs

---

### 9. Dual Tables для Comparison (~2.5 год)

**Що робимо:**
- Дві окремі таблиці спостережень: Current (top) та Previous (bottom)
- Можливість ховати/показувати Previous table (collapsible)
- Color coding для quick identification змін
- Click на observation в будь-якій таблиці синхронізує відповідне відео

**Де розміщуємо:**
- Права колонка в comparison mode
- Current table завжди видима (top)
- Previous table collapsible (bottom)

**UX логіка (від Роксі):**

**Key insight:**
- "Because the comparison inspection was done a year or more earlier, it is a brand new inspection, not modified or added to. So it probably needs to stay a separate table"
- Це НЕ same inspection з modified/new observations
- Це дві окремі інспекції, зроблені в різний час
- Користувач порівнює їх manually

**Workflow:**

**Сценарій 1: Viewing both tables**
1. User в comparison mode
2. Бачить Current table (2024 inspection) - повна таблиця
3. Бачить Previous table (2023 inspection) - collapsible, згорнута за замовчуванням
4. Клікає "Show Previous Inspection" → Previous table розгортається
5. Тепер бачить обидві таблиці для порівняння

**Сценарій 2: Finding matching observations**
1. Current table: observation "Crack at 14.2ft, Grade 3"
2. User хоче знайти той самий spot в previous inspection
3. Дивиться Previous table, шукає observation близько 14.2ft
4. Знаходить "Crack at 14.5ft, Grade 2" (трохи інша позиція через measurement variance)
5. Бачить що Grade збільшився з 2 до 3 → deterioration!

**Сценарій 3: Syncing videos with tables**
1. User клікає на observation в Current table
2. Current video синхронізується до timestamp цього observation
3. User клікає на matching observation в Previous table
4. Previous video синхронізується до свого timestamp
5. Тепер може візуально порівняти той самий spot на обох відео

**Візуальний дизайн:**

**Layout:**
```
┌──────────────────────────────────────┐
│ Current Inspection (2024)            │
├──────────────────────────────────────┤
│ Time  │ Dist │ Code │ Desc │ Grade  │
│ 1:45  │ 11ft │ MLWE │ ...  │   5    │
│ 3:00  │ 14ft │ OBR  │ ...  │   3    │← selected
│ 3:00  │ 14ft │ OBZ  │ ...  │   3    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 📋 Previous Inspection (2023) [▼]    │ ← collapsible header
├──────────────────────────────────────┤
│ Time  │ Dist │ Code │ Desc │ Grade  │
│ 1:52  │ 11ft │ MLWE │ ...  │   5    │
│ 3:15  │ 14ft │ OBR  │ ...  │   2    │← matching obs, lower grade!
│ 3:15  │ 14ft │ OBZ  │ ...  │   2    │
└──────────────────────────────────────┘
```

**Features:**

**1. Collapsible Previous Table:**
- Header: "📋 Previous Inspection (2023) [▼]"
- Згорнутий за замовчуванням для clean UI
- Клік на header → розгортається/згортається
- Показує кількість observations: "Previous Inspection (2023) - 15 observations"

**2. Visual indicators:**
- Current table: Orange accent на selected row
- Previous table: Blue/gray accent на selected row
- Matching observations: Можливо subtle highlight якщо distance близький (±1ft)
- Grade changes: Color code показує deterioration (green→yellow→red)

**3. Click interactions:**
- Click на observation в Current table:
  - Highlights row в Current table (orange)
  - Syncs Current video до timestamp
  - Toast: "Current video synced"
- Click на observation в Previous table:
  - Highlights row в Previous table (blue)
  - Syncs Previous video до timestamp
  - Toast: "Previous video synced"

**4. Comparison helpers:**
- Кнопка "Find Similar" 🔍 при hover на observation
  - Автоматично шукає близькі observations в іншій таблиці (за distance)
  - Highlights potential matches
- Distance-based sorting для easier comparison
- Filter by Code для знаходження specific defect types

**Smart comparison features:**

**1. Auto-matching suggestions:**
- При виборі observation в Current table
- Система автоматично шукає similar observations в Previous table
- Критерії: distance ±1ft та same defect code
- Highlights suggestions

**2. Deterioration indicators:**
- Показує зміну grade між інспекціями
- Visual badge: 🔺+1 (worse), 🔻-1 (better), ⚪ 0 (same)
- Example: "Grade: 3 🔺+1" означає що grade збільшився на 1 з попередньої інспекції

**Column structure (same as current):**
- Timestamp (MM:SS.MSS)
- Distance (ft)
- Code (badge with color)
- Description
- Grade (colored circle 1-5)
- Actions menu (...)

**Responsive behavior:**
- Desktop: Full dual table view
- Tablet: Collapsible Previous table (default collapsed)
- Mobile: Tabs to switch between Current/Previous

**Edge cases:**
- Що якщо Previous inspection нема? → Hide Previous table completely, show message "No previous inspection available for comparison"
- Що якщо observations не match? → OK, user manually compares
- Що якщо різна кількість observations? → Expected, show both tables as is

**Переваги:**
- Чіткий поділ між двома інспекціями
- Не confusing як single table з modified/new tags
- Легко бачити full context кожної інспекції
- Click-to-sync з відповідним відео
- Collapsible Previous table for clean default view

---

### 10. Screenshot Comparison Slider (~2 год)

**Що робимо:**
- Before/After slider overlay для порівняння screenshots з двох інспекцій
- Draggable divider для revealing more/less кожної картинки
- Можливість zoom in/out для детального огляду
- Export comparison як single image

**Де розміщуємо:**
- Modal dialog що відкривається при кліку "Compare Screenshots"
- Або в окремій секції під dual videos в comparison mode

**UX логіка:**

**Use case:**
- Інспектор хоче візуально порівняти той самий defect з двох інспекцій
- Питання: "Чи тріщина стала більша? Чи корені проросли глибше?"
- Slider дозволяє easily switch між before/after в тому самому viewpoint

**Workflow:**

**Сценарій 1: Opening comparison slider**
1. User в comparison mode
2. Має обрані observations в обох таблицях (current + previous)
3. Клікає кнопку "Compare Screenshots" 📸⚡
4. Відкривається modal з slider overlay
5. Ліва частина: Previous screenshot (2023)
6. Права частина: Current screenshot (2024)
7. Draggable slider посередині

**Сценарій 2: Comparing defect progression**
1. Slider в середній позиції (50/50 split)
2. User бачить обидві картинки partially
3. Drag slider вліво → більше Previous screenshot (before)
4. Drag slider вправо → більше Current screenshot (after)
5. Slider в крайній лівій позиції → тільки Previous
6. Slider в крайній правій позиції → тільки Current
7. Візуально бачить що тріщина стала довша на 2 inches

**Сценарій 3: Detailed inspection**
1. User бачить щось цікаве на comparison
2. Клікає кнопку "Zoom In" 🔍
3. Обидві картинки zoom in 200%
4. Може pan around для детального огляду
5. Slider продовжує працювати в zoomed mode
6. "Reset Zoom" повертає до 100%

**Сценарій 4: Exporting comparison**
1. User знаходить perfect slider position
2. Клікає "Export Comparison" 💾
3. Система генерує single image з обома screenshots
4. Options:
   - Side-by-side layout
   - Slider position layout (як user бачить)
   - With labels "Before (2023)" / "After (2024)"
5. Download PNG file

**Візуальний дизайн:**

**Slider overlay:**
```
┌──────────────────────────────────────────┐
│  Screenshot Comparison        [X Close]  │
├──────────────────────────────────────────┤
│                                          │
│   ┌──────────────┬──────────────┐       │
│   │              │              │       │
│   │   Previous   │   Current    │       │
│   │   (2023)     ║   (2024)     │       │
│   │              ║              │       │
│   │   [Image]    ║   [Image]    │       │
│   │              ║              │       │
│   └──────────────┴──────────────┘       │
│                  ║ ← draggable           │
│                                          │
├──────────────────────────────────────────┤
│ [🔍 Zoom In] [🔍 Zoom Out] [↻ Reset]    │
│ [📏 Show Grid] [💾 Export Comparison]    │
└──────────────────────────────────────────┘
```

**Slider mechanics:**
```
Previous Image          │          Current Image
████████████████████████│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
                        ↕
                   Drag handle
```

**Features:**

**1. Interactive slider:**
- Draggable vertical divider
- Percentage-based (0-100%)
- Smooth dragging without lag
- Visual handle (bright color для visibility)

**2. Visual styling:**
- Slider handle: Bright color (orange/white) для visibility
- Vertical line: 4px wide, solid white with shadow
- Hover effect: Handle grows slightly, cursor changes
- Smooth dragging: No lag, responsive

**3. Zoom functionality:**
- Zoom In: +50% кожен клік (до max 400%)
- Zoom Out: -50% кожен клік (до min 100%)
- Reset Zoom: повертає до 100%
- Pan position зберігається при zoom

**4. Grid overlay (optional):**
- Toggle кнопка "Show Grid" 📏
- Показує grid overlay на обох картинках
- Допомагає align features для accurate comparison
- Grid spacing: адаптивний до zoom level

**5. Measurement tools (advanced - optional):**
- Ruler tool для вимірювання довжини тріщини
- Annotation tools для marking specific areas
- Color difference highlighting

**Export options:**

**Layout 1: Side-by-side**
```
┌────────────────┬────────────────┐
│ Before (2023)  │ After (2024)   │
│                │                │
│  [Screenshot]  │  [Screenshot]  │
│                │                │
│ Grade: 2       │ Grade: 3       │
│ Distance: 14ft │ Distance: 14ft │
└────────────────┴────────────────┘
```

**Layout 2: Slider position (as viewed)**
```
┌──────────────────────────────────┐
│ Comparison: Distance 14ft        │
├────────────────┬─────────────────┤
│ Before (2023)  │ After (2024)    │
│                │                 │
│    [Image]     ║    [Image]      │
│                │                 │
└────────────────┴─────────────────┘
```

**Keyboard controls:**
- Arrow Left/Right: Move slider by 5%
- Plus/Minus: Zoom in/out
- R: Reset view
- G: Toggle grid
- Escape: Close modal

**Edge cases:**
- Що якщо screenshots різного розміру? → Scale to fit, maintain aspect ratio
- Що якщо немає previous screenshot? → Show placeholder "No previous screenshot available"
- Що якщо images не align perfectly? → OK, manual alignment через pan/zoom

**Переваги:**
- Дуже intuitive спосіб порівняти before/after
- Візуально impressive - "wow factor"
- Корисно для deterioration analysis
- Можна export для reports
- Роксі сказала "I think the slider is really cool"

---

## 📊 Загальний підсумок оновлень

### Швидкі wins (1-4): ~1.5 год
- ✅ Quick Code terminology
- ✅ Безпечніші trash icons  
- ✅ Tab navigation
- ✅ Export/Upload кнопки

### Середні features (5-7): ~3 год
- 🟡 Video/Image toggle
- 🟡 Notes section
- 🟡 Pop-out video

### Складні features (8-10): ~7.5 год
- 🔴 Dual video comparison
- 🔴 Dual tables
- 🔴 Screenshot slider

**ЗАГАЛЬНИЙ ЧАС:** ~12 год роботи

---

## 🎯 Рекомендація для Thursday Sync

### Must-have (Priority 1)
**Пункти 1-6** (~4.5 год)
- Всі базові UX improvements
- Key features що Роксі запитала
- Реально feasible за 1-2 дні роботи

**Що робимо:**
1. Quick Code terminology (15 хв)
2. Безпечніші trash icons (20 хв)
3. Tab navigation (20 хв)
4. Export/Upload кнопки (25 хв)
5. Video/Image toggle (60 хв)
6. Notes section (45 хв)

**Результат:**
- Чистий, безпечніший UI
- Швидше введення даних
- Основні requested features
- Готово до показу Роксі

---

### Nice-to-have (Priority 2)
**Пункт 7** (~1.5 год)
- Pop-out video functionality

**Чому важливо:**
- Very popular feature request
- Multi-monitor support
- Додає wow factor
- Якщо залишиться час після Priority 1

---

### Discuss & Plan (Priority 3)
**Пункти 8-10** (~7.5 год)
- Comparison mode з dual videos
- Dual tables для comparison
- Screenshot comparison slider

**Підхід:**
- Це окрема велика feature
- Потребує окремого sprint
- На Thursday sync можна:
  - Показати mockup/wireframe
  - Обговорити UX flow
  - Планувати implementation timeline
- Не намагатися зробити за 2 дні

---

## 📝 Ключові інсайти від Роксі

### Пріоритети користувачів:
1. **Reviewing coded observations** > Creating new ones
2. **Video visibility** - найважливіше + pop-out для другого екрану
3. **Comparison mode** - окремі таблиці, головне - порівняння відео
4. **Navigation & clarity** - головна проблема зараз

### Термінологія:
- ❌ "Hot Button" / "Template" 
- ✅ "Quick Code"

### Must-have features:
- ✅ Resizable layout
- ✅ Pop-out video
- ✅ Timeline visualization
- ✅ Screenshot comparison slider
- ✅ General notes section
- ✅ Export report
- ✅ Video upload
- ✅ Show video / Show image toggle

### Safety improvements:
- 🗑️ Trash icons менш помітними
- Більш зрозумілі іконки та навігація

### Comparison mode insights:
- "Right now they are not synced, so you would manually have to find the same spot"
- "Because the camera can be moving slower or faster there isn't really a way to sync"
- "More than anything they are comparing the videos to see changes in the pipe over time"
- Use case: "When there is a defect, a crack for example. The question they are asking is, did it get a lot bigger over the past year?"

### Pain points:
1. Difficult to navigate
2. Unclear icons
3. Don't understand how to export a report or take actions
4. Not quick to enter observations

---

## ✅ Next Steps

### До Thursday sync:
1. **Оновити прототип** з Priority 1 changes (пункти 1-6)
2. **Якщо час дозволить** - додати Priority 2 (пункт 7)
3. **Підготувати wireframes/mockups** для Priority 3 (пункти 8-10)

### На Thursday sync (9:00 AM CST):
1. Показати оновлений прототип
2. Демонстрація нових features
3. Отримати feedback
4. Обговорити Comparison mode implementation plan
5. Узгодити next steps для Figma design phase

### Після sync:
1. Інкорпорувати feedback з meeting
2. Фіналізувати Priority 1 & 2 features
3. Почати Figma design з approved changes
4. Планувати sprint для Comparison mode (Priority 3)

---

## 📌 Важливі нотатки

### Що Роксі любить:
- ✅ Resizable layout - "Yes! I love that"
- ✅ Star для Quick Code - "Yes, I love the star"
- ✅ Timeline visualization - "I like the timeline you have proposed!"
- ✅ Slider для screenshot comparison - "I think the slider is really cool"
- ✅ Загальний дизайн - "This design is FANTASTIC!! So well thought through and so creative"

### Що змінити:
- ⚠️ "Hot Button" → "Quick Code"
- ⚠️ Trash icons менш помітні
- ⚠️ Comparison mode - окремі таблиці, не single table
- ⚠️ Icons and navigation clarity

### Готовність до design phase:
- ✅ "I think this is really great"
- ✅ "If you want to do some of these minor updates then move to design but this is great work!"

---

## 🎨 Design Phase Readiness

Після Thursday sync та approval оновлень:
1. Перенести approved wireframe в Figma
2. Створити design system:
   - Colors (Orange primary, Gray secondary)
   - Typography
   - Component library
   - Spacing system
3. High-fidelity mockups для всіх screens
4. Interaction states (hover, active, disabled)
5. Responsive breakpoints
6. Developer handoff specs

---

## 📞 Contact Info для Thursday Sync

**Meeting Time:** Thursday at 9:00 AM CST (Chicago time)
**Attendees:** Roxie + Team
**Agenda:**
- Demo оновленого прототипу
- Feedback session
- Comparison mode discussion
- Next steps alignment

---

**Document Version:** 1.0  
**Last Updated:** October 15, 2025  
**Prepared for:** Thursday Sync with Roxie