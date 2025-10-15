# Cursor Plan - Big Update 1
## Поетапна реалізація покращень ITpipes Prototype

---

## 🎯 Загальна стратегія

**Підхід:** Поетапна реалізація з тестуванням після кожного етапу
**Ціль:** Безпечні зміни без ламання існуючого функціоналу
**Методологія:** Incremental development з можливістю rollback

---

## 📋 ЕТАП 1: Швидкі UX покращення (1-2 години)

### Завдання 1.1: Термінологія "Quick Code" (15 хв)
**Файли для зміни:**
- `app/page.tsx` - всі згадки "Hot Button" → "Quick Code"

**Зміни:**
```typescript
// Знайти та замінити:
"Hot Button" → "Quick Code"
"Hot Buttons" → "Quick Codes"
"hotButton" → "quickCode" (в назвах змінних)
"HotButton" → "QuickCode" (в типах)

// Конкретні місця:
- Dialog title: "Manage Hot Buttons" → "Manage Quick Codes"
- Context menu: "Save as Hot Button" → "Save as Quick Code"
- Toast: "Hot button created" → "Quick Code created"
- Button text: "Create New" → "Create New Quick Code"
```

**Тестування:**
- [ ] Перевірити всі діалоги відкриваються
- [ ] Перевірити всі toast повідомлення
- [ ] Перевірити context menu опції

---

### Завдання 1.2: Безпечніші Trash Icons (20 хв)
**Файли для зміни:**
- `app/page.tsx` - видалити MoreVertical кнопку з таблиці

**Зміни:**
```typescript
// Видалити з таблиці спостережень:
<td className="px-3 py-3 text-center">
  <button 
    className="p-1 hover:bg-gray-200 rounded"
    onClick={(e) => handleContextMenu(e, obs)}
  >
    <MoreVertical className="w-4 h-4 text-gray-500" />
  </button>
</td>

// Залишити тільки:
- Right-click context menu
- Delete keyboard shortcut
- Hover кнопка "Save as Quick Code"
```

**Тестування:**
- [ ] Перевірити що context menu працює через right-click
- [ ] Перевірити Delete keyboard shortcut
- [ ] Перевірити що таблиця стала чистішою

---

### Завдання 1.3: Tab Navigation (20 хв)
**Файли для зміни:**
- `app/page.tsx` - додати Tab navigation для полів

**Зміни:**
```typescript
// Додати новий state:
const [tabOrder, setTabOrder] = useState([
  'code', 'distance', 'description', 'grade', 'value1', 'value2', 
  'percent', 'continuous', 'joint', 'clock1', 'clock2', 'remarks'
]);

// Модифікувати handleCellKeyDown:
const handleCellKeyDown = (e: React.KeyboardEvent, obsId: number, field: string, value: any) => {
  if (e.key === 'Enter') {
    handleCellEdit(obsId, field, value);
    // Перехід до наступного поля
    const currentIndex = tabOrder.indexOf(field);
    if (currentIndex < tabOrder.length - 1) {
      const nextField = tabOrder[currentIndex + 1];
      setEditingCell({ id: obsId, field: nextField });
    } else {
      setEditingCell(null);
    }
  }
  if (e.key === 'Tab') {
    e.preventDefault();
    handleCellEdit(obsId, field, value);
    const currentIndex = tabOrder.indexOf(field);
    const nextField = tabOrder[currentIndex + 1];
    if (nextField) {
      setEditingCell({ id: obsId, field: nextField });
    } else {
      setEditingCell(null);
    }
  }
};
```

**Тестування:**
- [ ] Перевірити Tab navigation між полями
- [ ] Перевірити Enter для збереження та переходу
- [ ] Перевірити Shift+Tab для повернення назад

---

### Завдання 1.4: Export/Upload кнопки (25 хв)
**Файли для зміни:**
- `app/page.tsx` - додати кнопки в header

**Зміни:**
```typescript
// Додати функції:
const exportReport = () => {
  showToast('Report export started - this would generate a PDF', 'info');
};

const uploadVideo = () => {
  showToast('Video upload started - this would upload to cloud storage', 'info');
};

// Додати в header після Compare Mode кнопки:
<div className="flex items-center gap-2">
  <button 
    onClick={exportReport}
    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
  >
    <Download className="w-4 h-4" />
    <span className="hidden sm:inline">Export Report</span>
  </button>
  <button 
    onClick={uploadVideo}
    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
  >
    <Upload className="w-4 h-4" />
    <span className="hidden sm:inline">Upload Video</span>
  </button>
</div>
```

**Тестування:**
- [ ] Перевірити що кнопки з'являються в header
- [ ] Перевірити що показують toast повідомлення
- [ ] Перевірити responsive поведінку (іконки на mobile)

---

## 📋 ЕТАП 2: Середні функції (2-3 години)

### Завдання 2.1: Video/Image Toggle (60 хв)
**Файли для зміни:**
- `app/page.tsx` - додати toggle switch та image mode

**Зміни:**
```typescript
// Додати новий state:
const [viewMode, setViewMode] = useState<'video' | 'image'>('video');

// Додати toggle над відео плеєром:
<div className="flex items-center gap-2 mb-4">
  <div className="flex bg-gray-100 rounded-lg p-1">
    <button
      onClick={() => setViewMode('video')}
      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
        viewMode === 'video' 
          ? 'bg-orange-500 text-white' 
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      📹 Video
    </button>
    <button
      onClick={() => setViewMode('image')}
      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
        viewMode === 'image' 
          ? 'bg-orange-500 text-white' 
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      🖼️ Image
    </button>
  </div>
</div>

// Замінити відео плеєр на умовний рендеринг:
{viewMode === 'video' ? (
  // Існуючий відео плеєр
) : (
  // Image mode
  <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
    {selectedObservation ? (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📸</div>
          <div className="text-lg font-semibold">Screenshot View</div>
          <div className="text-sm text-gray-300 mt-2">
            Observation #{selectedObservation} - {observations.find(o => o.id === selectedObservation)?.timestamp}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Distance: {observations.find(o => o.id === selectedObservation)?.distance}ft
          </div>
        </div>
      </div>
    ) : (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">👆</div>
          <div className="text-lg font-semibold">Select an observation</div>
          <div className="text-sm text-gray-300 mt-2">to view screenshot</div>
        </div>
      </div>
    )}
  </div>
)}
```

**Тестування:**
- [ ] Перевірити перемикання між Video/Image режимами
- [ ] Перевірити що показується правильна інформація в Image mode
- [ ] Перевірити що при виборі observation змінюється контент

---

### Завдання 2.2: General Notes Section (45 хв)
**Файли для зміни:**
- `app/page.tsx` - додати collapsible notes panel

**Зміни:**
```typescript
// Додати новий state:
const [showNotes, setShowNotes] = useState(false);
const [inspectionNotes, setInspectionNotes] = useState('');

// Додати функцію збереження:
const saveNotes = () => {
  showToast('Notes saved', 'success');
  setShowNotes(false);
};

// Додати після відео плеєра:
<div className="mt-4">
  <div className="bg-white border border-gray-200 rounded-lg">
    <button
      onClick={() => setShowNotes(!showNotes)}
      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">📝</span>
        <span className="font-medium">Notes</span>
        {inspectionNotes && (
          <span className="text-sm text-gray-500">
            ({inspectionNotes.split('\n').length} lines)
          </span>
        )}
      </div>
      {showNotes ? (
        <ChevronUp className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      )}
    </button>
    
    {showNotes && (
      <div className="px-4 pb-4 border-t border-gray-200">
        <textarea
          value={inspectionNotes}
          onChange={(e) => setInspectionNotes(e.target.value)}
          onBlur={saveNotes}
          placeholder="Add general notes about this inspection..."
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {inspectionNotes.length}/5000 characters
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setInspectionNotes('')}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={saveNotes}
              className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
```

**Тестування:**
- [ ] Перевірити розгортання/згортання notes panel
- [ ] Перевірити збереження тексту при втраті фокусу
- [ ] Перевірити лічильник символів та кнопки Clear/Save

---

## 📋 ЕТАП 3: Складні функції (4-6 годин)

### Завдання 3.1: Pop-out Video (75 хв)
**Файли для зміни:**
- `app/page.tsx` - додати pop-out функціональність

**Зміни:**
```typescript
// Додати нові state:
const [popoutWindow, setPopoutWindow] = useState<Window | null>(null);
const [isVideoPopedOut, setIsVideoPopedOut] = useState(false);

// Додати функції:
const openVideoPopout = () => {
  const newWindow = window.open('', 'videoPopout', 'width=800,height=600');
  if (newWindow) {
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ITpipes - Video Player</title>
          <style>
            body { margin: 0; padding: 20px; background: #000; color: white; font-family: system-ui; }
            .video-container { width: 100%; max-width: 800px; margin: 0 auto; }
            .controls { display: flex; gap: 10px; margin-top: 10px; justify-content: center; }
            button { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
            .play-btn { background: #f97316; color: white; }
            .info { text-align: center; margin-top: 10px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="video-container">
            <div style="width: 100%; aspect-ratio: 16/9; background: #333; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">🎥</div>
                <div>Video Player</div>
                <div style="font-size: 14px; margin-top: 5px;">Time: ${Math.floor(videoTime / 60)}:${String(videoTime % 60).padStart(2, '0')}</div>
              </div>
            </div>
            <div class="controls">
              <button class="play-btn" onclick="parent.togglePlay()">${isPlaying ? '⏸️ Pause' : '▶️ Play'}</button>
              <button onclick="parent.seekVideo(-5)">⏮️ -5s</button>
              <button onclick="parent.seekVideo(5)">⏭️ +5s</button>
            </div>
            <div class="info">
              ${selectedObservation ? `Current: Observation #${selectedObservation}` : 'No observation selected'}
            </div>
          </div>
        </body>
      </html>
    `);
    setPopoutWindow(newWindow);
    setIsVideoPopedOut(true);
    showToast('Video opened in pop-out window', 'info');
  }
};

const closeVideoPopout = () => {
  if (popoutWindow) {
    popoutWindow.close();
    setPopoutWindow(null);
    setIsVideoPopedOut(false);
    showToast('Video returned to main window', 'info');
  }
};

// Додати кнопку в відео контроли:
<button 
  onClick={isVideoPopedOut ? closeVideoPopout : openVideoPopout}
  className="w-8 h-8 text-white/80 hover:text-white"
  title={isVideoPopedOut ? "Return video to main window" : "Open video in separate window"}
>
  {isVideoPopedOut ? <Minimize className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
</button>

// Замінити відео плеєр на умовний рендеринг:
{isVideoPopedOut ? (
  <div className="relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
    <div className="text-center text-white">
      <div className="text-6xl mb-4">🪟</div>
      <div className="text-lg font-semibold">Video is in pop-out window</div>
      <div className="text-sm text-gray-300 mt-2">
        Current time: {Math.floor(videoTime / 60)}:{String(videoTime % 60).padStart(2, '0')} / 2:31
      </div>
      <div className="text-sm text-gray-400 mt-1">
        Playing: {selectedObservation ? `Observation #${selectedObservation}` : 'No observation'}
      </div>
      <button
        onClick={closeVideoPopout}
        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        Return Video to Main Window
      </button>
    </div>
  </div>
) : (
  // Існуючий відео плеєр
)}
```

**Тестування:**
- [ ] Перевірити відкриття pop-out вікна
- [ ] Перевірити що основний відео зникає
- [ ] Перевірити закриття pop-out вікна
- [ ] Перевірити повернення відео в основний інтерфейс

---

## 📋 ЕТАП 4: Comparison Mode (8-10 годин)

### Завдання 4.1: Dual Video Players (3 години)
**Файли для зміни:**
- `app/page.tsx` - реалізувати dual video layout

**Зміни:**
```typescript
// Розширити comparisonState:
interface ComparisonState {
  isActive: boolean;
  selectedInspection: Inspection | null;
  layout: 'vertical' | 'horizontal';
  syncedPlayback: boolean;
  currentVideoTime: number;
  previousVideoTime: number;
  currentVideoPlaying: boolean;
  previousVideoPlaying: boolean;
}

// Додати mock дані для previous inspection:
const [previousInspection] = useState<Inspection>({
  id: 2,
  date: '2023-10-15',
  observations: [
    { id: 101, timestamp: '1:45.000', distance: 11, code: 'MLWE', description: 'Minor leak', grade: 2, status: 'same', continuous: 'No', value1: '-', value2: '-', percent: '5%', joint: false, clock1: '3 o\'clock', clock2: '9 o\'clock', remarks: 'Small leak' },
    { id: 102, timestamp: '3:00.000', distance: 14, code: 'OBR', description: 'Tree roots', grade: 2, status: 'same', continuous: 'Yes', value1: '2', value2: '4', percent: '15%', joint: false, clock1: '12 o\'clock', clock2: '6 o\'clock', remarks: 'Root intrusion' },
  ]
});

// Модифікувати comparison layout:
{comparisonState.isActive ? (
  <div className={`${comparisonState.layout === 'vertical' ? 'grid grid-rows-2' : 'grid grid-cols-2'} gap-4`}>
    {/* Current Video */}
    <div className="relative">
      <div className="text-sm font-medium text-gray-700 mb-2">Current Inspection (2024)</div>
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {/* Current video player content */}
        <div className="absolute bottom-4 left-4 text-white text-sm">
          ▶️ {Math.floor(comparisonState.currentVideoTime / 60)}:{String(comparisonState.currentVideoTime % 60).padStart(2, '0')} / 2:31
        </div>
      </div>
    </div>
    
    {/* Previous Video */}
    <div className="relative">
      <div className="text-sm font-medium text-gray-700 mb-2">Previous Inspection (2023)</div>
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {/* Previous video player content */}
        <div className="absolute bottom-4 left-4 text-white text-sm">
          ▶️ {Math.floor(comparisonState.previousVideoTime / 60)}:{String(comparisonState.previousVideoTime % 60).padStart(2, '0')} / 2:45
        </div>
      </div>
    </div>
    
    {/* Resizable divider for horizontal layout */}
    {comparisonState.layout === 'horizontal' && (
      <div className="absolute inset-y-0 left-1/2 w-1 bg-white cursor-col-resize transform -translate-x-1/2 z-10"
           onMouseDown={handleComparisonDividerMouseDown}>
        <div className="w-4 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
             style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        </div>
      </div>
    )}
  </div>
) : (
  // Існуючий single video player
)}
```

**Тестування:**
- [ ] Перевірити перемикання в comparison mode
- [ ] Перевірити vertical/horizontal layouts
- [ ] Перевірити resizable divider
- [ ] Перевірити independent video controls

---

### Завдання 4.2: Dual Tables (2.5 години)
**Файли для зміни:**
- `app/page.tsx` - додати окремі таблиці для порівняння

**Зміни:**
```typescript
// Додати state для previous table:
const [showPreviousTable, setShowPreviousTable] = useState(false);

// Модифікувати праву колонку в comparison mode:
{comparisonState.isActive ? (
  <div className="space-y-6">
    {/* Current Observations Table */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Current Inspection (2024)</h3>
        <button 
          onClick={addNewObservation}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Observation
        </button>
      </div>
      {/* Існуюча таблиця спостережень */}
    </div>
    
    {/* Previous Observations Table - Collapsible */}
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setShowPreviousTable(!showPreviousTable)}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <span className="font-medium">Previous Inspection (2023)</span>
          <span className="text-sm text-gray-500">
            ({previousInspection.observations.length} observations)
          </span>
        </div>
        {showPreviousTable ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      {showPreviousTable && (
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Time</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Distance</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Code</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Description</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previousInspection.observations.map((obs) => (
                  <tr 
                    key={obs.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      // Sync previous video to this observation
                      const timeParts = obs.timestamp.split(':');
                      const minutes = parseInt(timeParts[0]);
                      const seconds = parseFloat(timeParts[1]);
                      setComparisonState(prev => ({
                        ...prev,
                        previousVideoTime: minutes * 60 + seconds
                      }));
                      showToast('Previous video synced to observation', 'info');
                    }}
                  >
                    <td className="px-3 py-2 font-mono text-xs">{obs.timestamp}</td>
                    <td className="px-3 py-2">{obs.distance}ft</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {obs.code}
                      </span>
                    </td>
                    <td className="px-3 py-2">{obs.description}</td>
                    <td className="px-3 py-2 text-center">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: obs.grade >= 4 ? '#ef4444' : obs.grade >= 3 ? '#f59e0b' : '#10b981' }}
                      >
                        {obs.grade}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  </div>
) : (
  // Існуюча таблиця спостережень
)}
```

**Тестування:**
- [ ] Перевірити відображення двох таблиць
- [ ] Перевірити collapsible previous table
- [ ] Перевірити click-to-sync для previous observations
- [ ] Перевірити візуальні відмінності між таблицями

---

### Завдання 4.3: Screenshot Comparison Slider (2 години)
**Файли для зміни:**
- `app/page.tsx` - додати modal з slider comparison

**Зміни:**
```typescript
// Додати нові state:
const [showComparisonModal, setShowComparisonModal] = useState(false);
const [sliderPosition, setSliderPosition] = useState(50);

// Додати функції:
const openComparisonModal = () => {
  if (selectedObservation && showPreviousTable) {
    setShowComparisonModal(true);
  } else {
    showToast('Please select an observation and open previous table first', 'warning');
  }
};

const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSliderPosition(parseInt(e.target.value));
};

// Додати кнопку "Compare Screenshots":
<button 
  onClick={openComparisonModal}
  className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
>
  📸⚡ Compare Screenshots
</button>

// Додати modal в кінці компонента:
{showComparisonModal && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowComparisonModal(false)}>
    <div className="relative max-w-4xl max-h-[90vh] w-full mx-4 bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Screenshot Comparison</h3>
        <button 
          onClick={() => setShowComparisonModal(false)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="relative" style={{ aspectRatio: '16/9' }}>
          {/* Previous Screenshot */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
              <div className="text-center text-blue-800">
                <div className="text-4xl mb-2">📸</div>
                <div className="font-semibold">Previous (2023)</div>
                <div className="text-sm">Grade: 2</div>
              </div>
            </div>
          </div>
          
          {/* Current Screenshot */}
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <div className="w-full h-full bg-gradient-to-r from-orange-100 to-orange-200 flex items-center justify-center">
              <div className="text-center text-orange-800">
                <div className="text-4xl mb-2">📸</div>
                <div className="font-semibold">Current (2024)</div>
                <div className="text-sm">Grade: 3 🔺+1</div>
              </div>
            </div>
          </div>
          
          {/* Slider */}
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Slider Input */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
          />
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Distance: {observations.find(o => o.id === selectedObservation)?.distance}ft
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Previous</span>
            <span className="text-sm font-medium">{sliderPosition}%</span>
            <span className="text-sm text-gray-600">Current</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
```

**Тестування:**
- [ ] Перевірити відкриття comparison modal
- [ ] Перевірити роботу slider
- [ ] Перевірити візуальні ефекти перекриття
- [ ] Перевірити закриття modal

---

## 🚀 План виконання

### День 1 (4 години)
- **Ранок (2 год):** Етап 1 - Швидкі UX покращення
- **Після обіду (2 год):** Етап 2.1 - Video/Image Toggle

### День 2 (4 години)  
- **Ранок (2 год):** Етап 2.2 - Notes Section
- **Після обіду (2 год):** Етап 3.1 - Pop-out Video

### День 3 (6 годин)
- **Ранок (3 год):** Етап 4.1 - Dual Video Players
- **Після обіду (3 год):** Етап 4.2 - Dual Tables

### День 4 (2 години)
- **Ранок (2 год):** Етап 4.3 - Screenshot Comparison Slider

---

## ✅ Критерії успіху

### Етап 1 ✅
- [ ] Вся термінологія змінена на "Quick Code"
- [ ] Trash icons приховані з таблиці
- [ ] Tab navigation працює між полями
- [ ] Export/Upload кнопки показують toast

### Етап 2 ✅
- [ ] Video/Image toggle перемикає режими
- [ ] Notes section зберігає текст
- [ ] Pop-out video відкриває окреме вікно

### Етап 3 ✅
- [ ] Comparison mode показує два відео
- [ ] Dual tables відображають окремі інспекції
- [ ] Screenshot slider порівнює зображення

---

## 🔧 Технічні нотатки

### State Management
- Використовувати існуючі useState hooks
- Додавати нові state тільки при необхідності
- Зберігати backward compatibility

### Performance
- Lazy loading для складних компонентів
- Memoization для важких обчислень
- Debouncing для slider interactions

### Error Handling
- Try-catch для pop-out window operations
- Validation для user inputs
- Graceful fallbacks для missing data

### Testing Strategy
- Тестувати після кожного етапу
- Перевіряти responsive behavior
- Тестувати keyboard shortcuts
- Перевіряти edge cases

---

## 📝 Документація

### Кожен етап включає:
1. **Опис завдання** - що робимо
2. **Технічні деталі** - як реалізуємо  
3. **Код зміни** - конкретні модифікації
4. **Тестування** - що перевіряємо
5. **Критерії успіху** - коли готово

### Git Workflow
```bash
# Для кожного етапу:
git checkout -b feature/etap-X-description
# Реалізувати зміни
git add .
git commit -m "feat: implement etap X - description"
git push origin feature/etap-X-description
# Створити PR для review
```

---

**Готовність до початку:** ✅  
**Очікуваний час:** 16 годин  
**Складність:** Середня  
**Ризики:** Низькі (поетапний підхід)
