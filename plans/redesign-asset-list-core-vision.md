# 🎯 CORE VISION ASSET LIST - REDESIGN VISION

**Author:** Illia Suprun  
**Date:** 27.11.2025  
**Context:** Based on QA interface analysis, meeting transcripts, and project knowledge

---

## 🎭 UNDERSTANDING THE USER

### Primary Persona: **Office Reviewer (QA/QC)**
- **NOT tech-savvy** (ця інформація критична з транскриптів)
- Працює 8+ годин на день з цим інтерфейсом
- Часто потрібно перемикатися між проєктами
- Створює різні "views" для різних завдань (NASCO перевірка, звіти, пошук дефектів)
- Працює з великими datasets (1760+ items)

### Map Usage (Office Reviewers):
- **Frequent use** для контексту і швидкого пошуку
- **Asset selection** в певній географічній області
- **Context viewing** - де знаходиться pipe segment
- **Pattern recognition** - проблемні зони на карті
- **Pop-out to second monitor** для dual-screen workflows

### Secondary Use Cases:
- Field operators (мобільна версія буде окремо, але patterns повинні бути сумісні)
- Municipalities (QA/QC reviewers)
- Service teams (reviewing + reporting)

---

## 🔥 КРИТИЧНІ ПРОБЛЕМИ ПОТОЧНОГО UI

### 1. **"Glitter Bombing" Smart Tab**
**Проблема:** 30+ кольорових chips з "+" кнопками створюють overwhelming experience
```
Asset (green): 8 fields
Inspection (blue): 9 fields  
Observation (orange): 11 fields
= 28 визуальних елементів одночасно
```

**Реальна проблема:** 
- Користувачі НЕ розуміють ієрархію Asset/Inspection/Observation
- Це tax-form experience, а не column picker
- Michaela сама каже: "I don't like the setup of it right now... it's not so overwhelming at first"

### 2. **Tab Management Chaos**
- Користувачі можуть створити 20-30+ табів
- Поточний UI просто додає rows
- Немає способу організувати, приховати, або знайти потрібний tab
- Tabs з'являються як bookmarks without folders

### 3. **Toolbar Cognitive Load**
6 іконок без чіткої ієрархії:
```
[Filter] [Search] [Find/Replace] [Print] [Tools] [Smart Tab]
```
- Всі однакового розміру і важливості
- Немає візуальної group

### 4. **Filter vs Smart Tab Confusion**
Два окремих panels з подібними функціями:
- Filter = що показувати (data filtering)
- Smart Tab = які колонки (column selection)
- Користувачі плутають їх призначення

---

## 💡 МОЄ БАЧЕННЯ РЕДИЗАЙНУ

### **КОНЦЕПЦІЯ: "Workspace, Not Database"**

Замість відчуття "я працюю з database table", створюємо відчуття "я маю свій персоналізований workspace для кожного завдання".

---

## 🎨 КЛЮЧОВІ РІШЕННЯ

### **1. UNIFIED VIEW MANAGEMENT**

Замість окремих Filter + Smart Tab → **Єдиний "View Builder"**

#### Нова ментальна модель:
```
VIEW = Saved Workspace
  ├─ Which data to show (filters)
  ├─ Which columns to display (fields)
  ├─ How to sort (sort order)
  └─ Name & color (visual identity)
```

#### UI Pattern:
```
╔══════════════════════════════════════════════╗
║  Views: [NASCO Check ▼]     [+ New View]    ║
╠══════════════════════════════════════════════╣
║                                               ║
║  📊 Presets:                                 ║
║  • Standard View                             ║
║  • NASCO Check                               ║
║  • Report Ready                              ║
║  • Custom Views (3) ▼                        ║
║                                               ║
╚══════════════════════════════════════════════╝
```

**Чому це працює:**
- Один mental model замість двох
- Presets for common tasks (NASCO, Reports)
- Save entire workspace state, not just columns
- Легко перемикатися між завданнями

---

### **2. SMART TAB → "COLUMN PICKER" REDESIGN**

#### Approach: **Progressive Disclosure + Search-First**

**Phase 1: Search Bar First**
```
┌─────────────────────────────────────────────┐
│ 🔍 Add columns...                           │
└─────────────────────────────────────────────┘

Currently displayed (7):
┌─────────────────────────────────────────────┐
│ [x] Pipe Segment Reference                  │
│ [x] Street                                   │
│ [x] Upstream MH                              │
│ [x] Material                                 │
│ [x] Width                                    │
│ [x] Distance                                 │
│ [x] Grade                                    │
└─────────────────────────────────────────────┘

▼ Browse all fields
```

**Phase 2: Grouped Browsing (collapsed by default)**
```
▼ Asset Fields (5 of 8 added)
▼ Inspection Fields (2 of 9 added)
▼ Observation Fields (0 of 11 added)
```

**Чому це працює:**
- 80% use case: search "distance" → add → done
- No cognitive load from 28 colored chips
- Displayed fields є primary focus
- Grouping є secondary option для exploration

---

### **3. TAB MANAGEMENT → "VIEW TABS"**

#### Problem: 20-30 tabs без organization
#### Solution: **Favorites + Hidden Tabs**

**UI Pattern:**
```
┌──────────────────────────────────────────────┐
│ [★ NASCO] [★ Report] [★ Daily Check] [⋮ More]│
└──────────────────────────────────────────────┘

When clicking [⋮ More]:
┌─────────────────────────┐
│ ⭐ Favorites (3)        │
├─────────────────────────┤
│ 📁 All Tabs (8)         │
│   • Custom View 1       │
│   • Inspection Review   │
│   • Material Check      │
│   • [+] New Tab         │
├─────────────────────────┤
│ 🗑️  Recently Closed    │
└─────────────────────────┘
```

**Interactions:**
- Drag to reorder favorites
- Right-click → Hide/Favorite/Delete
- Search tabs by name
- Max 4-5 visible favorites

**Чому це працює:**
- Bookmark-like behavior (familiar pattern)
- Works for 5 tabs, works for 50 tabs
- Power users can organize
- Simple users see 3-4 main tabs

---

### **4. TOOLBAR REDESIGN**

#### Current: 6 equal buttons
#### New: **Primary + Secondary + Context**

**Primary Actions (always visible):**
```
[🔍 Search]  [⚙️ View Settings]  [↗ Pop-out]
```

**Secondary Actions (dropdown):**
```
[⋮ More Tools]
  ├─ Validate Inspection
  ├─ Find & Replace
  ├─ Export Project
  ├─ Copy to Project
  └─ Print
```

**Pop-out Menu:**
```
[↗ Pop-out]
  ├─ 🗺️ Pop-out Map
  ├─ 📊 Pop-out Table
  └─ 🖥️ Pop-out Both
```

**Context Actions (appear when relevant):**
- Selected rows: [Edit] [Delete] [Export Selected]
- Filtered data: [Clear Filters] [Save as View]

**Чому це працює:**
- Search є #1 action (80% use case)
- View Settings (був Smart Tab) є unified entry
- Pop-out for dual monitor workflows
- Tools згруповані як secondary
- Less visual noise
- Context-aware actions (only when relevant)

---

### **5. INLINE EDITING**

#### Per Michaela's request: "being able to edit from this screen"

**Pattern: Click to Enter "Edit Mode"**
```
Normal State:
┌──────────────────────────────┐
│ ML-001 | Main St | ... | [⋮] │
└──────────────────────────────┘

Edit Mode (after clicking [⋮] → Edit):
┌──────────────────────────────┐
│ [ML-001▼] [Main St] ... [✓] │
└──────────────────────────────┘
```

**Rules:**
- NOT inline click-to-edit (accidental changes)
- Kebab menu → Edit Row → Enter edit mode
- Save/Cancel buttons appear
- Clear visual state change

**Чому це працює:**
- No accidental data changes
- Still fast workflow
- Clear when you're editing

---

### **6. RESIZABLE SPLIT VIEW (Map + Table)**

#### Current: Fixed 50/50 split
#### New: **User-Controlled Resizable Split**

**Solution: Resizable Split with Smart Defaults**
```
Default Layout (40/60):
┌────────────┬──────────────────────────┐
│            ║                          │
│    MAP     ║        TABLE             │
│   (40%)    ║        (60%)             │
│            ║                          │
│            ║                          │
└────────────┴──────────────────────────┘
         ↕ Drag to resize
```

**Key Features:**
- **Drag divider** to adjust ratio
- **Smart snap points:** 30%, 40%, 50%, 60%, 70%
- **Minimum sizes:** Map min 280px, Table min 500px
- **Save preference** per View (NASCO view може мати 30/70, Report view - 50/50)
- **Pop-out map** to second monitor (detached window)
- **Keyboard shortcuts:** 
  - `[` - More map space
  - `]` - More table space
  - `\` - Reset to 40/60

**Use Cases:**
1. **Quick Asset Selection (30/70):**
   ```
   ┌─────┬───────────────────────────────┐
   │ MAP │         TABLE                 │
   │30%  │          70%                  │
   └─────┴───────────────────────────────┘
   ```
   → Focus on data, map for context only

2. **Geographic Analysis (60/40):**
   ```
   ┌──────────────────┬────────────────┐
   │                  │                │
   │       MAP        │     TABLE      │
   │       60%        │      40%       │
   │                  │                │
   └──────────────────┴────────────────┘
   ```
   → Focus on map patterns, table for details

3. **Balanced Review (50/50):**
   ```
   ┌──────────────┬──────────────────┐
   │              │                  │
   │     MAP      │      TABLE       │
   │     50%      │       50%        │
   │              │                  │
   └──────────────┴──────────────────┘
   ```
   → Equal attention to both

4. **Dual Monitor (Pop-out):**
   ```
   Monitor 1:              Monitor 2:
   ┌──────────────────┐   ┌──────────────────┐
   │                  │   │                  │
   │   MAP ONLY       │   │   TABLE ONLY     │
   │   (Full Screen)  │   │   (Full Screen)  │
   │                  │   │                  │
   └──────────────────┘   └──────────────────┘
   ```
   → Maximum space for both

**Map Interactions:**
- Click asset on map → Highlight & scroll to row in table
- Select row in table → Highlight on map
- Filter table → Update map highlights
- Bidirectional sync завжди active

**Чому це працює:**
- User контролює свій workspace
- Different views can have different ratios
- Works for quick context checking (30/70)
- Works for geographic analysis (60/40)
- Pop-out для dual monitor setup
- Familiar resizable pattern (VS Code, browser devtools)

---

## 🎯 MVP SCOPE (Per 25.11 Meeting)

### Core Three Must-Haves:
1. **Smart Tab (→ Column Picker)** ✅
2. **Filter (→ Part of View Builder)** ✅
3. **Search** ✅

### Additional MVP Features:
- View/Tab management
- Table with pagination
- Map (collapsible)
- Toolbar (simplified)
- Chat with Support button

### Out of Scope for MVP:
- Guided tours (на майбутнє)
- Advanced validation tools
- Bulk operations
- Custom keyboard shortcuts

---

## 🎨 VISUAL DIRECTION

### Design Principles:
1. **Calm, Not Colorful** - reduce "glitter bombing"
2. **Progressive Disclosure** - show what's needed, hide what's not
3. **Familiar Patterns** - bookmarks, folders, search-first
4. **Professional, Not Playful** - це робочий інструмент

### Color Strategy:
```
Backgrounds: Neutral grays (reduce cognitive load)
Accents: Orange #E86F25 (brand), Blue #336099
Status: Semantic only (success, warning, error)
NO: Rainbow chips for field types
```

### Typography:
```
Large, readable (не tech-savvy users)
Clear hierarchy
Sufficient contrast
```

---

## 📐 LAYOUT STRUCTURE

```
┌──────────────────────────────────────────────────────────────────┐
│ [ITpipes] [Core Vision] [Project: CityTestQA ▼] [Chat Support] │  <- Header
├──────────────────────────────────────────────────────────────────┤
│ [★ NASCO] [★ Report] [★ Daily Check] [⋮ More]                  │  <- View Tabs
├──────────────────────────────────────────────────────────────────┤
│ [🔍 Search] [⚙️ View Settings] [⋮ More Tools]    [↗ Pop-out]  │  <- Toolbar
├────────────────────────────┬─────────────────────────────────────┤
│                            ║                                     │
│          MAP               ║           TABLE                     │
│         (40%)              ║          (60%)                      │
│                            ║                                     │
│   • Asset pins             ║  Pipe Seg | Street | Upstream ...  │
│   • Color by status        ║  ML-001   | Main   | MH-100    [⋮] │
│   • Click to select        ║  ML-002   | Oak    | MH-101    [⋮] │
│   • Zoom controls          ║  ML-003   | Elm    | MH-102    [⋮] │
│   • Layer toggles          ║  ...                                │
│                            ║                                     │
│   [Basemap ▼] [Layers]     ║  [1-100 of 1,760]  [← 1 2 3 ... →] │
│                            ║                                     │
└────────────────────────────┴─────────────────────────────────────┘
                         ↕ Drag to resize
```

**Key Features:**
- **Resizable split:** 30-70% range with snap points
- **Bidirectional sync:** Map ↔ Table selection
- **Pop-out options:** Both map and table can detach
- **Saved preferences:** Each View remembers its split ratio
- **Smart defaults:** 
  - Quick checks: 30/70 (map for context)
  - Geographic work: 60/40 (map primary)
  - Balanced: 40/60 (default)

**Key Changes from Current:**
- User-controlled split ratio (not fixed 50/50)
- Pop-out capability for dual monitors
- Cleaner toolbar (grouped actions)
- View Tabs for quick context switching
- Fewer visual elements competing for attention

---

## 🔄 USER FLOWS

### Primary Flow: "I need to check NASCO compliance"
```
1. Select "NASCO Check" view from dropdown
2. Table shows: filtered data + relevant columns
3. Scan list
4. Click [⋮] → Edit Row to fix issues
5. Done
```

### Power User Flow: "Create custom inspection view"
```
1. Click [+ New View]
2. Name it "Material Inspection"
3. Click [Add Columns] → search "material, width, grade"
4. Set filters: Material = "Clay"
5. Save view
6. Now it's in favorites
```

### Common Flow: "Where is pipe ML-347?"
```
1. Click Search
2. Type "ML-347"
3. Jump to result
4. Done
```

**Metrics:**
- Current: 8+ clicks to set up custom view
- New: 3-4 clicks
- Reduced cognitive load: ~70%

---

## 🎪 ONBOARDING STRATEGY

### First Login Experience:
```
┌────────────────────────────────────┐
│  Welcome to Core Vision! 👋        │
│                                     │
│  Let's set up your first view:     │
│  ○ Standard View (recommended)     │
│  ○ NASCO Compliance                │
│  ○ Custom Setup                    │
│                                     │
│  [Get Started]  [Skip]             │
└────────────────────────────────────┘
```

**If user selects "Standard View":**
→ Loads default columns  
→ Shows brief tooltip tour (4-5 steps)  
→ Done

**If user selects "Custom Setup":**
→ Guided wizard  
→ Choose columns step-by-step  
→ Save as default

---

## 🧩 COMPONENT LIBRARY UPDATES

### New Components Needed:
1. **ViewSelector** - dropdown with presets + custom views
2. **ColumnPicker** - search + grouped browser
3. **TabManager** - favorites + hidden tabs
4. **InlineEditRow** - edit mode for table rows
5. **ResizableSplit** - draggable divider for map/table ratio
6. **PopOutWindow** - detached window for map or table
7. **MapControls** - zoom, layers, basemap selector
8. **MapTableSync** - bidirectional selection sync

### Updated Components:
- Toolbar (simplified, with pop-out actions)
- Table (with kebab menu, selection sync)
- Search (global + contextual)
- Header (with project selector, logo placement)

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Interactive Prototype (This Week)
**Goal:** Validate UX patterns before visual design

**Deliverable:** React prototype with:
- View Builder flow
- Column Picker interaction
- Tab Management
- Search behavior
- Edit row flow

**No:** Pixel-perfect design, animations, full data

### Phase 2: Visual Design (Next Week)
After feedback from Michaela + Jonas:
- Figma high-fidelity designs
- Component specs
- Design system updates

### Phase 3: Development Handoff
- Component library
- User stories
- Technical specs

---

## 💭 PHILOSOPHICAL APPROACH

### Key Insights:

1. **"Glitter Bombing" = Information Architecture Problem**
   - Not a visual design problem
   - Users need mental models, not more colors

2. **"Workspace, Not Database"**
   - Stop treating this like a SQL query builder
   - Make it feel like "my work desk"

3. **"Save The Entire Context"**
   - Views = complete workspace state
   - Not just column selection

4. **"Search-First, Browse Second"**
   - Users know what they want
   - Don't force them to browse 28 options

5. **"Non-Tech-Savvy = Need Guardrails"**
   - Progressive disclosure
   - Presets and templates
   - Guided experiences

---

## 🎯 SUCCESS METRICS

### UX Metrics:
- **Setup time:** 8 clicks → 3 clicks
- **Cognitive load:** Reduced colored elements by 70%
- **Tab management:** Works for 5 tabs AND 50 tabs
- **Search success:** 1 field, 1 search, done

### User Feedback:
- "Less overwhelming on first use"
- "Easy to find my saved views"
- "I can edit faster now"
- "Finally makes sense"

---

## 🎨 DESIGN INSPIRATION

### Pattern References:
- **Notion:** Database views (filters + columns + sorts)
- **Airtable:** View management + presets
- **Linear:** Clean toolbar, progressive disclosure
- **Chrome Bookmarks:** Tab management pattern
- **VS Code:** Search-first command palette

### What NOT to Copy:
- Excel-style complexity
- Database query builders
- Admin panels with 100 buttons

---

## 🔮 FUTURE CONSIDERATIONS (Post-MVP)

### Map Enhancements:
- **Canvas Mode:** Full-screen map з floating table panels (як Figma/Miro)
  - Draggable, resizable table overlay
  - Free positioning
  - Advanced power user feature
  - Could be Phase 2 after users master split view
- **Heat maps** для severity visualization
- **Custom layers** (asset types, inspection dates, defect clusters)
- **Drawing tools** для annotations
- **Geographic filters** (draw polygon to filter)

### Power User Features:
- Keyboard shortcuts
- Bulk operations
- Advanced filters (AND/OR logic)
- Column formulas
- Export templates

### AI Features:
- Smart column suggestions
- Auto-categorize observations
- Predict which view user needs
- Map clustering for large datasets

### Collaboration:
- Share views with team
- Comments on rows
- Activity log
- Team workspaces

---

## ✅ NEXT ACTIONS

1. **Review this vision** with Michaela + Jonas
2. **Build interactive prototype** (Next.js + shadcn)
3. **Test core interactions** (view builder, column picker, tabs)
4. **Iterate based on feedback**
5. **Move to visual design phase**

---

## 🎭 FINAL THOUGHT

**Current UI є "Feature Complete"**  
**New UI має бути "Task Complete"**

Різниця:
- Feature Complete: Має всі кнопки та функції
- Task Complete: Користувач може швидко зробити свою роботу

Ми робимо redesign для людей, які 8 годин на день дивляться в цей екран.  
Це має бути їхній **comfortable workspace**, не database admin panel.

---

**END OF VISION DOCUMENT**