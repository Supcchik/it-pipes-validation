# 🔧 CURSOR AI PROMPT: Asset List Improvements & Fixes

**Target:** Fix and enhance existing Asset List screen implementation  
**Context:** Refine current implementation, add missing features, improve UX/UI  
**Priority:** Critical bugs → UX improvements → Visual polish

---

## 📋 OVERVIEW OF CHANGES

### Critical (Must Fix):
1. ✅ Add Active Filters Bar component
2. ✅ Implement drag-to-reorder for columns
3. ✅ Add Create View Dialog with guided flow
4. ✅ Add color coding for filter types
5. ✅ Add preview count in Filters tab

### Important (Should Fix):
6. ✅ Improve Map Panel UI (controls)
7. ✅ Fix View Tabs star icons (filled vs outline)
8. ✅ Improve table header prominence
9. ✅ Add tooltips to all icon buttons
10. ✅ Improve spacing and visual hierarchy

### Nice-to-Have:
11. ✅ Better empty states
12. ✅ Loading states
13. ✅ Hover effects polish

---

## 🚨 CRITICAL FIXES

### 1. **ADD ACTIVE FILTERS BAR**

**Problem:** Коли є активні фільтри, користувач не бачить їх в toolbar. Немає швидкого способу побачити які фільтри застосовані або видалити їх.

**Solution:** Створити компонент `ActiveFiltersBar.tsx` що показує filter chips між Toolbar та Table.

**File:** `components/asset-list/ActiveFiltersBar.tsx`

```typescript
'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FilterConfig } from '@/lib/types/asset-list';

interface ActiveFiltersBarProps {
  filters: FilterConfig[];
  onRemoveFilter: (filterId: string) => void;
  onOpenViewSettings: () => void;
  maxVisible?: number; // default 3
}

export default function ActiveFiltersBar({
  filters,
  onRemoveFilter,
  onOpenViewSettings,
  maxVisible = 3
}: ActiveFiltersBarProps) {
  if (filters.length === 0) return null;

  const visibleFilters = filters.slice(0, maxVisible);
  const hiddenCount = Math.max(0, filters.length - maxVisible);

  const getOperatorSymbol = (operator: string) => {
    switch (operator) {
      case 'equals': return '=';
      case 'contains': return '⊃';
      case 'startsWith': return '⊂';
      case 'greaterThan': return '>';
      case 'lessThan': return '<';
      default: return operator;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50 border-b border-neutral-200">
      <span className="text-sm text-neutral-600 font-medium">Filters:</span>
      
      {visibleFilters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className="gap-2 pl-3 pr-2 py-1.5 bg-white border border-neutral-200 hover:border-neutral-300 transition-colors"
        >
          <span className="text-xs">
            <span className="font-medium">{filter.field}</span>
            {' '}
            <span className="text-neutral-400">{getOperatorSymbol(filter.operator)}</span>
            {' '}
            <span className="text-neutral-700">"{filter.value}"</span>
          </span>
          <button
            onClick={() => onRemoveFilter(filter.id)}
            className="hover:bg-neutral-100 rounded-sm p-0.5 transition-colors"
            aria-label={`Remove filter ${filter.field}`}
          >
            <X className="w-3 h-3 text-neutral-500" />
          </button>
        </Badge>
      ))}

      {hiddenCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenViewSettings}
          className="h-7 text-xs"
        >
          +{hiddenCount} more
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenViewSettings}
        className="ml-auto h-7 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
      >
        View all filters
      </Button>
    </div>
  );
}
```

**Integration in `app/assets/page.tsx`:**

```typescript
// Add after Toolbar component
<Toolbar
  onSearch={() => setSearchOpen(true)}
  onOpenViewSettings={() => setViewSettingsOpen(true)}
  onPopOutMap={() => {/* TODO */}}
  onPopOutTable={() => {/* TODO */}}
  selectedRowsCount={selectedRows.length}
/>

{/* ADD THIS */}
<ActiveFiltersBar
  filters={activeView.filters}
  onRemoveFilter={(filterId) => {
    const updatedView = {
      ...activeView,
      filters: activeView.filters.filter(f => f.id !== filterId),
      updatedAt: new Date().toISOString()
    };
    handleSaveView(updatedView);
  }}
  onOpenViewSettings={() => {
    setViewSettingsOpen(true);
    // TODO: Set Filters tab as active
  }}
/>

<ResizableSplit ...>
```

---

### 2. **IMPLEMENT DRAG-TO-REORDER FOR COLUMNS**

**Problem:** В View Settings → Columns tab, користувач не може перетягувати колонки для зміни порядку. Немає drag handles (≡).

**Solution:** Використати `@dnd-kit` для drag-and-drop функціоналу.

**Install dependencies:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Update `ViewSettingsDialog.tsx` - Currently Displayed section:**

```typescript
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

// Sortable Column Item Component
function SortableColumnItem({ 
  column, 
  onRemove 
}: { 
  column: ColumnDef; 
  onRemove: () => void;
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
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 bg-white border border-neutral-200 rounded-md ${
        isDragging ? 'shadow-lg z-50' : ''
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Column Label */}
      <span className="flex-1 text-sm text-neutral-700">
        {column.label}
      </span>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-sm p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// In ViewSettingsDialog component
function ViewSettingsDialog({ open, onClose, currentView, onSave }: ViewSettingsDialogProps) {
  // ... existing state ...

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = displayedColumns.findIndex((col) => col.id === active.id);
      const newIndex = displayedColumns.findIndex((col) => col.id === over.id);

      const newOrder = arrayMove(displayedColumns, oldIndex, newIndex);
      setDisplayedColumns(newOrder);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>View Settings</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="columns">Columns</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
          </TabsList>

          <TabsContent value="columns" className="space-y-4">
            {/* Search */}
            <Input
              placeholder="Search columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />

            {/* Currently Displayed - WITH DRAG AND DROP */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-neutral-700">
                Currently Displayed ({displayedColumns.length}):
              </h3>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={displayedColumns.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {displayedColumns.map((column) => (
                      <SortableColumnItem
                        key={column.id}
                        column={column}
                        onRemove={() => {
                          setDisplayedColumns(
                            displayedColumns.filter((c) => c.id !== column.id)
                          );
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Browse All Fields - existing code */}
            ...
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Helper function (add to file)
function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();
  const item = newArray.splice(from, 1)[0];
  newArray.splice(to, 0, item);
  return newArray;
}
```

**Visual feedback while dragging:**
- Dragging item: `opacity: 0.5`, `shadow-lg`, `z-50`
- Drag handle cursor: `cursor-grab`, when active: `cursor-grabbing`
- Smooth transition animation

---

### 3. **CREATE VIEW DIALOG - GUIDED FLOW**

**Problem:** Коли користувач клікає "+ New View", нічого не відбувається. Потрібен friendly guided flow для створення нового view.

**Solution:** Створити multi-step dialog що проведе користувача через процес створення view.

**File:** `components/asset-list/CreateViewDialog.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Check, Star, FileText, Filter } from 'lucide-react';
import type { View } from '@/lib/types/asset-list';

interface CreateViewDialogProps {
  open: boolean;
  onClose: () => void;
  existingViews: View[];
  onCreateView: (view: View) => void;
}

type Step = 'welcome' | 'name' | 'template' | 'confirm';

export default function CreateViewDialog({
  open,
  onClose,
  existingViews,
  onCreateView
}: CreateViewDialogProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [viewName, setViewName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [makeDefault, setMakeDefault] = useState(false);

  const handleReset = () => {
    setStep('welcome');
    setViewName('');
    setSelectedTemplate('blank');
    setMakeDefault(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleCreate = () => {
    let newView: View;

    if (selectedTemplate === 'blank') {
      // Create blank view with defaults
      newView = {
        id: `view-${Date.now()}`,
        name: viewName,
        isFavorite: false,
        isDefault: makeDefault,
        displayedColumns: ['pipeSegment', 'street', 'material', 'width', 'date'],
        columnOrder: ['pipeSegment', 'street', 'material', 'width', 'date'],
        filters: [],
        mapRatio: 40,
        itemsPerPage: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user'
      };
    } else {
      // Duplicate from template
      const template = existingViews.find(v => v.id === selectedTemplate);
      if (!template) return;

      newView = {
        ...template,
        id: `view-${Date.now()}`,
        name: viewName,
        isFavorite: false,
        isDefault: makeDefault,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    onCreateView(newView);
    handleClose();
  };

  const canProceedToName = true;
  const canProceedToTemplate = viewName.trim().length > 0;
  const canCreate = viewName.trim().length > 0 && selectedTemplate;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${step === 'welcome' ? 'bg-orange-500' : 'bg-neutral-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'name' ? 'bg-orange-500' : 'bg-neutral-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'template' ? 'bg-orange-500' : 'bg-neutral-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'confirm' ? 'bg-orange-500' : 'bg-neutral-300'}`} />
        </div>

        {/* Step 1: Welcome */}
        {step === 'welcome' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Create New View</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-orange-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Views help you organize your work
                  </h3>
                  <p className="text-sm text-neutral-600 mt-2 max-w-md mx-auto">
                    A view is a custom workspace with specific columns and filters. 
                    You can create different views for different tasks like NASCO checks, 
                    reporting, or daily reviews.
                  </p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What you'll set up:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">View Name</p>
                      <p className="text-xs text-neutral-600">A descriptive name for your view</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Filter className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Starting Template</p>
                      <p className="text-xs text-neutral-600">Start from scratch or copy an existing view</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Customize Later</p>
                      <p className="text-xs text-neutral-600">Add columns and filters after creation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep('name')}>
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 2: Name */}
        {step === 'name' && (
          <>
            <DialogHeader>
              <DialogTitle>Name Your View</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-6">
              <div className="space-y-2">
                <Label htmlFor="view-name">View Name</Label>
                <Input
                  id="view-name"
                  placeholder="e.g., NASCO Check, Material Review, Weekly Report"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-neutral-600">
                  Choose a descriptive name that reflects the purpose of this view
                </p>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-blue-900">
                    <strong>💡 Tip:</strong> Good view names describe the task, 
                    like "NASCO Compliance Check" or "Defect Report Review"
                  </p>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('welcome')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={() => setStep('template')}
                disabled={!canProceedToTemplate}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 3: Template Selection */}
        {step === 'template' && (
          <>
            <DialogHeader>
              <DialogTitle>Choose a Starting Point</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-6">
              <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
                {/* Blank Template */}
                <Card 
                  className={`cursor-pointer transition-colors ${
                    selectedTemplate === 'blank' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'hover:border-neutral-300'
                  }`}
                  onClick={() => setSelectedTemplate('blank')}
                >
                  <CardHeader className="flex-row items-start space-y-0 gap-4">
                    <RadioGroupItem value="blank" id="blank" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="blank" className="cursor-pointer">
                        <CardTitle className="text-base">Start from Scratch</CardTitle>
                        <CardDescription>
                          Create a blank view with default columns. You can customize it later.
                        </CardDescription>
                      </Label>
                    </div>
                  </CardHeader>
                </Card>

                {/* Existing Views as Templates */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-neutral-700">Or copy from existing view:</p>
                  
                  {existingViews.slice(0, 5).map((view) => (
                    <Card
                      key={view.id}
                      className={`cursor-pointer transition-colors ${
                        selectedTemplate === view.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'hover:border-neutral-300'
                      }`}
                      onClick={() => setSelectedTemplate(view.id)}
                    >
                      <CardHeader className="flex-row items-start space-y-0 gap-4 py-3">
                        <RadioGroupItem value={view.id} id={view.id} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={view.id} className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              {view.isFavorite && <Star className="w-3 h-3 fill-orange-500 text-orange-500" />}
                              <span className="font-medium text-sm">{view.name}</span>
                            </div>
                            <p className="text-xs text-neutral-600 mt-1">
                              {view.displayedColumns.length} columns, 
                              {' '}
                              {view.filters.length} filter{view.filters.length !== 1 ? 's' : ''}
                            </p>
                          </Label>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </RadioGroup>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-blue-900">
                    <strong>💡 Tip:</strong> Copying from an existing view preserves its 
                    columns, filters, and layout settings.
                  </p>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('name')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => setStep('confirm')}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 4: Confirm */}
        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle>Review and Create</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">View Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Name:</span>
                    <span className="text-sm font-medium">{viewName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Template:</span>
                    <span className="text-sm font-medium">
                      {selectedTemplate === 'blank' 
                        ? 'Blank View' 
                        : existingViews.find(v => v.id === selectedTemplate)?.name
                      }
                    </span>
                  </div>
                  {selectedTemplate !== 'blank' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">Columns:</span>
                        <span className="text-sm font-medium">
                          {existingViews.find(v => v.id === selectedTemplate)?.displayedColumns.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">Filters:</span>
                        <span className="text-sm font-medium">
                          {existingViews.find(v => v.id === selectedTemplate)?.filters.length || 0}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="make-default"
                  checked={makeDefault}
                  onChange={(e) => setMakeDefault(e.target.checked)}
                  className="rounded border-neutral-300"
                />
                <Label htmlFor="make-default" className="text-sm cursor-pointer">
                  Make this my default view (opens automatically)
                </Label>
              </div>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-green-900">
                    <strong>✨ Almost there!</strong> After creating, you can customize 
                    columns and filters using View Settings.
                  </p>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('template')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={!canCreate}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Create View
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

**Integration in `app/assets/page.tsx`:**

```typescript
// Add state
const [createViewOpen, setCreateViewOpen] = useState(false);

// Add handler
const handleCreateView = (newView: View) => {
  setViews([...views, newView]);
  setActiveViewId(newView.id);
  setCurrentPage(1);
  
  // Show success toast
  toast({
    title: "View created",
    description: `"${newView.name}" has been created successfully.`,
  });
};

// Update ViewTabs onCreateView prop
<ViewTabs
  views={views}
  activeViewId={activeViewId}
  onViewChange={handleViewChange}
  onCreateView={() => setCreateViewOpen(true)} // ← Update this
  onManageViews={() => setManageViewsOpen(true)}
/>

// Add dialog at bottom
<CreateViewDialog
  open={createViewOpen}
  onClose={() => setCreateViewOpen(false)}
  existingViews={views}
  onCreateView={handleCreateView}
/>
```

---

### 4. **ADD COLOR CODING FOR FILTER TYPES**

**Problem:** Всі фільтри виглядають однаково. Важко швидко визначити тип поля (text, number, date).

**Solution:** Додати кольорове кодування та іконки для різних типів полів.

**Update `ViewSettingsDialog.tsx` - Filters tab:**

```typescript
import { Hash, Calendar, Text, ListFilter, ToggleLeft } from 'lucide-react';

// Helper to get field type
const getFieldType = (fieldId: string): ColumnDef['type'] => {
  const column = allColumns.find(c => c.field === fieldId);
  return column?.type || 'text';
};

// Helper to get type color classes
const getTypeColorClasses = (type: ColumnDef['type']) => {
  switch (type) {
    case 'text':
      return 'bg-blue-50 border-blue-200';
    case 'number':
      return 'bg-green-50 border-green-200';
    case 'date':
      return 'bg-purple-50 border-purple-200';
    case 'select':
      return 'bg-orange-50 border-orange-200';
    default:
      return 'bg-neutral-50 border-neutral-200';
  }
};

// Helper to get type icon
const getTypeIcon = (type: ColumnDef['type']) => {
  switch (type) {
    case 'text':
      return <Text className="w-4 h-4 text-blue-600" />;
    case 'number':
      return <Hash className="w-4 h-4 text-green-600" />;
    case 'date':
      return <Calendar className="w-4 h-4 text-purple-600" />;
    case 'select':
      return <ListFilter className="w-4 h-4 text-orange-600" />;
    default:
      return <ToggleLeft className="w-4 h-4 text-neutral-600" />;
  }
};

// In filter rendering
{filters.map((filter, index) => {
  const fieldType = getFieldType(filter.field);
  const colorClasses = getTypeColorClasses(fieldType);
  const icon = getTypeIcon(fieldType);

  return (
    <div 
      key={filter.id} 
      className={`flex items-center gap-2 p-3 rounded-lg border ${colorClasses}`}
    >
      {/* Type Icon */}
      <div className="flex-shrink-0">
        {icon}
      </div>

      {/* Field Selector */}
      <Select
        value={filter.field}
        onValueChange={(value) => {
          const updatedFilters = [...filters];
          updatedFilters[index] = { ...filter, field: value };
          setFilters(updatedFilters);
        }}
      >
        <SelectTrigger className="w-40 bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allColumns.map((col) => (
            <SelectItem key={col.id} value={col.field}>
              <div className="flex items-center gap-2">
                {getTypeIcon(col.type)}
                {col.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Operator */}
      <Select
        value={filter.operator}
        onValueChange={(value) => {
          const updatedFilters = [...filters];
          updatedFilters[index] = { ...filter, operator: value as any };
          setFilters(updatedFilters);
        }}
      >
        <SelectTrigger className="w-32 bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {getOperatorsForType(fieldType).map((op) => (
            <SelectItem key={op.value} value={op.value}>
              <div className="flex items-center gap-2">
                <span className="text-neutral-500">{op.icon}</span>
                {op.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Value Input */}
      <Input
        value={filter.value}
        onChange={(e) => {
          const updatedFilters = [...filters];
          updatedFilters[index] = { ...filter, value: e.target.value };
          setFilters(updatedFilters);
        }}
        placeholder="Enter value"
        className="flex-1 bg-white"
      />

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setFilters(filters.filter((_, i) => i !== index))}
        className="hover:bg-white"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
})}

// Helper for operator icons
const getOperatorsForType = (type: ColumnDef['type']) => {
  switch (type) {
    case 'text':
      return [
        { value: 'equals', label: 'Equals', icon: '=' },
        { value: 'contains', label: 'Contains', icon: '⊃' },
        { value: 'startsWith', label: 'Starts with', icon: '⊂' },
      ];
    case 'number':
      return [
        { value: 'equals', label: 'Equals', icon: '=' },
        { value: 'greaterThan', label: 'Greater than', icon: '>' },
        { value: 'lessThan', label: 'Less than', icon: '<' },
      ];
    case 'date':
      return [
        { value: 'equals', label: 'On date', icon: '=' },
        { value: 'greaterThan', label: 'After', icon: '>' },
        { value: 'lessThan', label: 'Before', icon: '<' },
      ];
    default:
      return [
        { value: 'equals', label: 'Equals', icon: '=' },
      ];
  }
};
```

---

### 5. **ADD PREVIEW COUNT IN FILTERS TAB**

**Problem:** Користувач не бачить скільки assets відповідають його фільтрам до збереження.

**Solution:** Додати live preview count що оновлюється при зміні фільтрів.

**Update `ViewSettingsDialog.tsx`:**

```typescript
// Add helper to count matching assets
const getMatchingAssetsCount = (filters: FilterConfig[]): number => {
  if (filters.length === 0) return assets.length;

  return assets.filter((asset) => {
    return filters.every((filter) => {
      const value = getAssetFieldValue(asset, filter.field);
      
      switch (filter.operator) {
        case 'equals':
          return String(value).toLowerCase() === String(filter.value).toLowerCase();
        case 'contains':
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'startsWith':
          return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
        case 'greaterThan':
          return Number(value) > Number(filter.value);
        case 'lessThan':
          return Number(value) < Number(filter.value);
        default:
          return true;
      }
    });
  }).length;
};

// In Filters tab, add preview after "Active Filters" heading
<TabsContent value="filters" className="space-y-4">
  <div className="flex items-center justify-between">
    <h3 className="text-sm font-semibold text-neutral-700">
      Active Filters ({filters.length}):
    </h3>
    
    {filters.length > 0 && (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setFilters([])}
        className="text-xs text-neutral-600"
      >
        Clear All
      </Button>
    )}
  </div>

  {/* ADD PREVIEW COUNT */}
  {filters.length > 0 && (
    <Card className={`border-2 ${
      matchingCount === 0 
        ? 'bg-red-50 border-red-200' 
        : 'bg-green-50 border-green-200'
    }`}>
      <CardContent className="py-3">
        <div className="flex items-center gap-2">
          {matchingCount === 0 ? (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-medium text-red-900">
                No assets match these filters
              </p>
            </>
          ) : (
            <>
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-900">
                <span className="text-lg font-bold">{matchingCount}</span>
                {' '}asset{matchingCount !== 1 ? 's' : ''} match{matchingCount === 1 ? 'es' : ''} these filters
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )}

  {/* Rest of filters UI */}
  ...
</TabsContent>

// Calculate count
const matchingCount = useMemo(() => {
  return getMatchingAssetsCount(filters);
}, [filters, assets]);
```

---

## 🎨 VISUAL IMPROVEMENTS

### 6. **IMPROVE MAP PANEL UI**

**Problem:** Map placeholder має "Streets" dropdown що виглядає як filter. Немає zoom controls.

**Solution:** Додати proper map controls (basemap selector, zoom buttons).

**Update `MapPanel.tsx`:**

```typescript
'use client';

import { Map, Plus, Minus, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

export default function MapPanel({ 
  assets, 
  selectedAssetId, 
  onAssetSelect 
}: MapPanelProps) {
  const [basemap, setBasemap] = useState('streets');
  const [zoom, setZoom] = useState(14);

  return (
    <div className="relative w-full h-full bg-neutral-100 flex items-center justify-center">
      {/* Placeholder Content */}
      <div className="text-center">
        <Map className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-600">
          ESRI Map Integration
        </h3>
        <p className="text-sm text-neutral-500 mt-2">
          Map placeholder - Ready for ESRI ArcGIS SDK
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          {assets.length} assets loaded
        </p>
      </div>
      
      {/* Zoom Controls - Bottom Left */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1">
        <Button 
          size="icon" 
          variant="secondary"
          className="w-9 h-9 bg-white shadow-md hover:bg-neutral-50"
          onClick={() => setZoom(Math.min(zoom + 1, 20))}
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button 
          size="icon" 
          variant="secondary"
          className="w-9 h-9 bg-white shadow-md hover:bg-neutral-50"
          onClick={() => setZoom(Math.max(zoom - 1, 1))}
        >
          <Minus className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Basemap Selector - Top Right */}
      <div className="absolute top-4 right-4">
        <Select value={basemap} onValueChange={setBasemap}>
          <SelectTrigger className="w-36 bg-white shadow-md">
            <Layers className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="streets">Streets</SelectItem>
            <SelectItem value="satellite">Satellite</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="topo">Topographic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Current Zoom Level - Bottom Right */}
      <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-md shadow-md">
        <span className="text-xs font-medium text-neutral-600">
          Zoom: {zoom}
        </span>
      </div>
    </div>
  );
}
```

---

### 7. **FIX VIEW TABS STAR ICONS**

**Problem:** Favorite views мають таку саму зірку як non-favorites. Незрозуміло які favorites.

**Solution:** Використовувати filled star для favorites, outline для інших.

**Update `ViewTabs.tsx`:**

```typescript
import { Star } from 'lucide-react';

// In tab rendering
{favoriteViews.map((view) => (
  <button
    key={view.id}
    onClick={() => onViewChange(view.id)}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      view.id === activeViewId
        ? 'border-orange-500 text-orange-600 bg-white'
        : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
    }`}
  >
    {/* FILLED STAR for favorites */}
    <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
    {view.name}
  </button>
))}

// In More dropdown, for non-favorites
{nonFavoriteViews.map((view) => (
  <DropdownMenuItem
    key={view.id}
    onClick={() => onViewChange(view.id)}
    className="flex items-center gap-2"
  >
    {/* OUTLINE STAR for non-favorites */}
    <Star className="w-4 h-4 text-neutral-400" />
    {view.name}
  </DropdownMenuItem>
))}
```

---

### 8. **IMPROVE TABLE HEADER PROMINENCE**

**Problem:** Table headers blend in, hard to distinguish from data.

**Solution:** Зробити headers більш виразними.

**Update `DataTable.tsx`:**

```typescript
// Update header cell styling
<th
  key={column.id}
  className={`
    px-4 py-3 text-left
    text-xs font-semibold uppercase tracking-wider
    text-neutral-600 bg-neutral-50
    border-b-2 border-neutral-300
    ${column.sortable ? 'cursor-pointer hover:bg-neutral-100 group' : ''}
  `}
  onClick={() => column.sortable && onSort(column.id, 'asc')}
>
  <div className="flex items-center gap-2">
    {column.label}
    {column.sortable && (
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpDown className="w-3 h-3 text-neutral-400" />
      </div>
    )}
  </div>
</th>
```

**Additional improvements:**
```css
/* Better table contrast */
- Header background: bg-neutral-50 (was white)
- Border: border-b-2 (was border-b)
- Font: uppercase + tracking-wider (better readability)
- Hover indicator for sortable columns
```

---

### 9. **ADD TOOLTIPS TO ALL ICON BUTTONS**

**Problem:** Icon buttons без labels незрозумілі для нових користувачів.

**Solution:** Додати tooltips з описами.

**Install shadcn tooltip:**
```bash
npx shadcn-ui@latest add tooltip
```

**Update `Toolbar.tsx`:**

```typescript
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Wrap buttons in tooltips
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        onClick={onSearch}
      >
        <Search className="w-5 h-5" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Search assets</p>
      <p className="text-xs text-neutral-500">Ctrl+K</p>
    </TooltipContent>
  </Tooltip>

  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenViewSettings}
      >
        <Settings className="w-5 h-5" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>View Settings</p>
      <p className="text-xs text-neutral-500">Columns & Filters</p>
    </TooltipContent>
  </Tooltip>

  {/* More Tools */}
  <Tooltip>
    <TooltipTrigger asChild>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        {/* ... */}
      </DropdownMenu>
    </TooltipTrigger>
    <TooltipContent>
      <p>More tools</p>
    </TooltipContent>
  </Tooltip>

  {/* Pop-out */}
  <Tooltip>
    <TooltipTrigger asChild>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <ExternalLink className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        {/* ... */}
      </DropdownMenu>
    </TooltipTrigger>
    <TooltipContent>
      <p>Pop-out window</p>
      <p className="text-xs text-neutral-500">Open in new window</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Add to all icon buttons:**
- Search
- View Settings
- More Tools
- Pop-out
- Kebab menu in table rows
- Header project selector
- Chat Support

---

### 10. **IMPROVE SPACING & VISUAL HIERARCHY**

**Problem:** Деякі елементи тісно розташовані, важко сканувати очима.

**Solution:** Покращити spacing та створити чіткішу ієрархію.

**Update global spacing:**

```typescript
// In app/assets/page.tsx
<div className="flex flex-col h-screen bg-neutral-50"> {/* Changed from bg-white */}
  <Header 
    projectName="CityTestQA"
    onProjectChange={(projectId) => console.log('Project changed:', projectId)}
  />
  
  <ViewTabs
    views={views}
    activeViewId={activeViewId}
    onViewChange={handleViewChange}
    onCreateView={() => setCreateViewOpen(true)}
    onManageViews={() => setManageViewsOpen(true)}
  />
  
  {/* Add shadow to Toolbar */}
  <div className="shadow-sm">
    <Toolbar
      onSearch={() => setSearchOpen(true)}
      onOpenViewSettings={() => setViewSettingsOpen(true)}
      onPopOutMap={() => {/* TODO */}}
      onPopOutTable={() => {/* TODO */}}
      selectedRowsCount={selectedRows.length}
    />
    
    <ActiveFiltersBar
      filters={activeView.filters}
      onRemoveFilter={handleRemoveFilter}
      onOpenViewSettings={() => setViewSettingsOpen(true)}
    />
  </div>
  
  {/* Add padding around ResizableSplit */}
  <div className="flex-1 p-4"> {/* Add padding */}
    <ResizableSplit ...>
  </div>
</div>
```

**Improve DataTable spacing:**

```typescript
// Row height
<tr 
  className="h-14 hover:bg-neutral-50 transition-colors" // Increased from h-12
>
  {/* Cell padding */}
  <td className="px-4 py-3"> {/* Increased padding */}
    ...
  </td>
</tr>

// Add more breathing room between pagination and table
<div className="border-t border-neutral-200 mt-4"> {/* Add margin */}
  <Pagination ... />
</div>
```

**Update ViewSettingsDialog spacing:**

```typescript
<DialogContent className="max-w-2xl max-h-[80vh]">
  <DialogHeader className="pb-4"> {/* Add bottom padding */}
    <DialogTitle>View Settings</DialogTitle>
  </DialogHeader>

  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
    <TabsList className="w-full justify-start border-b"> {/* Full width tabs */}
      <TabsTrigger value="columns" className="flex-1">Columns</TabsTrigger>
      <TabsTrigger value="filters" className="flex-1">Filters</TabsTrigger>
    </TabsList>

    <TabsContent value="columns" className="space-y-6"> {/* Increased spacing */}
      {/* Search */}
      <Input ... />
      
      {/* Currently Displayed */}
      <div className="space-y-3"> {/* Increased spacing */}
        <h3 className="text-sm font-semibold">Currently Displayed ({displayedColumns.length}):</h3>
        <div className="space-y-2"> {/* Space between columns */}
          ...
        </div>
      </div>
      
      {/* Browse All Fields */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Browse All Fields</h3>
        ...
      </div>
    </TabsContent>
  </Tabs>

  <DialogFooter className="pt-4"> {/* Add top padding */}
    ...
  </DialogFooter>
</DialogContent>
```

---

## 🐛 MINOR FIXES & POLISH

### 11. **BETTER EMPTY STATES**

**Update DataTable empty state:**

```typescript
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mx-auto" />
        <p className="text-sm text-neutral-600">Loading assets...</p>
      </div>
    </div>
  );
}

if (data.length === 0) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
          <Database className="w-8 h-8 text-neutral-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-neutral-900">No assets found</h3>
          <p className="text-sm text-neutral-600 mt-1">
            {searchQuery 
              ? `No results for "${searchQuery}". Try adjusting your search.`
              : 'No assets match your current filters. Try removing some filters.'
            }
          </p>
        </div>
        {(searchQuery || filters.length > 0) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              // Clear filters
            }}
          >
            Clear filters and search
          </Button>
        )}
      </div>
    </div>
  );
}
```

### 12. **ADD LOADING STATES**

**Update ViewTabs when switching views:**

```typescript
const [isLoadingView, setIsLoadingView] = useState(false);

const handleViewChange = async (viewId: string) => {
  setIsLoadingView(true);
  setActiveViewId(viewId);
  setCurrentPage(1);
  
  // Simulate loading (in real app, this would fetch data)
  await new Promise(resolve => setTimeout(resolve, 300));
  setIsLoadingView(false);
};

// Show loading overlay
{isLoadingView && (
  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
      <span className="text-sm font-medium">Switching view...</span>
    </div>
  </div>
)}
```

### 13. **IMPROVE HOVER EFFECTS**

**Add subtle animations:**

```css
/* In global CSS or Tailwind config */

/* Button hover */
.button-hover {
  @apply transition-all duration-150 ease-in-out;
  @apply hover:scale-105 active:scale-95;
}

/* Table row hover */
.table-row-hover {
  @apply transition-colors duration-150;
  @apply hover:bg-neutral-50 hover:shadow-sm;
}

/* Filter chip hover */
.filter-chip-hover {
  @apply transition-all duration-150;
  @apply hover:shadow-md hover:border-neutral-300;
}
```

**Apply to components:**

```typescript
// Buttons
<Button className="transition-all hover:scale-105 active:scale-95">
  Save Changes
</Button>

// Table rows
<tr className="transition-colors hover:bg-neutral-50">
  ...
</tr>

// Filter chips
<Badge className="transition-all hover:shadow-md">
  ...
</Badge>
```

---

## 📝 TESTING CHECKLIST

After implementing all changes, test:

### Critical Features:
- [ ] Active Filters Bar показується коли є фільтри
- [ ] Drag-to-reorder колонок працює плавно
- [ ] Create View Dialog проходить всі 4 кроки
- [ ] Color coding для фільтрів відображається правильно
- [ ] Preview count оновлюється в real-time

### Visual Polish:
- [ ] Map controls виглядають професійно
- [ ] Favorite stars filled, non-favorites outline
- [ ] Table headers виразні та readable
- [ ] Tooltips показуються на всіх icon buttons
- [ ] Spacing natural, не тісно і не занадто розріджено

### UX:
- [ ] Empty states показують helpful messages
- [ ] Loading states smooth, не jumpy
- [ ] Hover effects subtle але помітні
- [ ] Все interactive має cursor pointer
- [ ] Keyboard navigation працює

---

## 🎯 PRIORITY ORDER

### Must Do (Critical):
1. Active Filters Bar
2. Drag-to-reorder columns
3. Create View Dialog
4. Color coding filters
5. Preview count

### Should Do (Important):
6. Map controls
7. Star icons fix
8. Table headers
9. Tooltips
10. Spacing improvements

### Nice to Have:
11. Empty states
12. Loading states
13. Hover effects

---

## 💡 IMPLEMENTATION TIPS

### For Cursor AI Agent:
1. Implement changes **in order** (critical → important → nice-to-have)
2. Test each component **before** moving to next
3. Keep existing code structure and patterns
4. Use shadcn/ui components for consistency
5. Follow TypeScript types strictly
6. Add comments for complex logic
7. Test responsive behavior at 1280px, 1920px, 2560px

### Code Quality:
- Keep components under 300 lines
- Extract repeated logic to helpers
- Use meaningful variable names
- Add JSDoc comments for props
- Handle edge cases (empty arrays, null values)

---

## 🚀 FINAL RESULT

After all improvements, the Asset List screen should:

✅ **Look professional** - polished UI, proper spacing, clear hierarchy  
✅ **Feel responsive** - smooth animations, instant feedback  
✅ **Be intuitive** - tooltips, empty states, guided flows  
✅ **Work seamlessly** - drag-and-drop, live previews, filters  
✅ **Match vision** - implements all designs from original prompt

---

**END OF IMPROVEMENT PROMPT**

Good luck! This should bring the Asset List screen from "functional" to "production-ready". 🎉