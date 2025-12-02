# 🚀 CURSOR AI PROMPT: Core Vision Asset List - Advanced Features Implementation

**Phase:** Interactive Prototype Enhancement  
**Date:** December 2, 2025  
**Context:** Building on existing MVP prototype, adding critical features for stakeholder review

---

## 🎯 MISSION

Enhance the existing Core Vision Asset List Screen prototype with 7 critical features identified from stakeholder feedback and action plan. Focus on professional UX patterns that match enterprise software standards while maintaining our "friendly creation" principle.

---

## 📋 FEATURES TO IMPLEMENT

### ✅ Checklist Overview
- [ ] 1. Pop-out functionality (Map, Table, Both)
- [ ] 2. Advanced search with field selector and operators
- [ ] 3. Toolbar hierarchy: Split Settings into Filter + Columns buttons
- [ ] 4. Find & Replace functionality
- [ ] 5. Export Selected feature
- [ ] 6. Inline editing (safe pattern)
- [ ] 7. Report generation with preview

---

## 1️⃣ POP-OUT FUNCTIONALITY

**Priority:** 🔥 Critical  
**Reference:** Toolbar dropdown "Pop-out" button

### Requirements
Allow users to open Map, Table, or Both in separate windows for dual-monitor setups. Common workflow: video feed on one monitor, data entry on another.

### User Flow
```
User clicks Pop-out dropdown (⧉ icon)
→ Shows 3 options:
  • Pop-out Map
  • Pop-out Table  
  • Pop-out Both
→ User selects option
→ New window opens with selected content
→ Original window adjusts layout (removes popped-out section)
→ Both windows stay synchronized (shared state)
```

### Implementation

**File:** `components/asset-list/Toolbar.tsx`

Add pop-out dropdown:
```typescript
import { ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ToolbarProps {
  // ... existing props
  onPopOutMap: () => void;
  onPopOutTable: () => void;
  onPopOutBoth: () => void;
}

// In toolbar JSX:
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <ExternalLink className="w-5 h-5" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={onPopOutMap}>
      Pop-out Map
    </DropdownMenuItem>
    <DropdownMenuItem onClick={onPopOutTable}>
      Pop-out Table
    </DropdownMenuItem>
    <DropdownMenuItem onClick={onPopOutBoth}>
      Pop-out Both
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**File:** `app/assets/page.tsx`

Add pop-out handlers:
```typescript
const [poppedOutSections, setPoppedOutSections] = useState<{
  map: boolean;
  table: boolean;
}>({ map: false, table: false });

const handlePopOutMap = () => {
  // Open new window with map content
  const mapWindow = window.open(
    `/assets/popout/map?viewId=${activeViewId}`,
    'Core Vision - Map',
    'width=800,height=600,left=100,top=100'
  );
  
  if (mapWindow) {
    setPoppedOutSections(prev => ({ ...prev, map: true }));
    
    // Listen for window close
    const checkClosed = setInterval(() => {
      if (mapWindow.closed) {
        setPoppedOutSections(prev => ({ ...prev, map: false }));
        clearInterval(checkClosed);
      }
    }, 500);
  }
};

const handlePopOutTable = () => {
  const tableWindow = window.open(
    `/assets/popout/table?viewId=${activeViewId}`,
    'Core Vision - Table',
    'width=1200,height=800,left=900,top=100'
  );
  
  if (tableWindow) {
    setPoppedOutSections(prev => ({ ...prev, table: true }));
    
    const checkClosed = setInterval(() => {
      if (tableWindow.closed) {
        setPoppedOutSections(prev => ({ ...prev, table: false }));
        clearInterval(checkClosed);
      }
    }, 500);
  }
};

const handlePopOutBoth = () => {
  handlePopOutMap();
  handlePopOutTable();
};
```

**Create pop-out routes:**

`app/assets/popout/map/page.tsx`:
```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import MapPanel from '@/components/asset-list/MapPanel';

export default function MapPopoutPage() {
  const searchParams = useSearchParams();
  const viewId = searchParams.get('viewId');
  
  // Sync state with parent window via localStorage or BroadcastChannel
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    // Listen for updates from main window
    const channel = new BroadcastChannel('asset-list-sync');
    
    channel.onmessage = (event) => {
      if (event.data.type === 'ASSETS_UPDATE') {
        setAssets(event.data.assets);
      }
    };

    return () => channel.close();
  }, []);

  return (
    <div className="w-full h-screen">
      <div className="bg-neutral-800 text-white px-4 py-2 flex items-center justify-between">
        <h1 className="text-sm font-semibold">Core Vision - Map View</h1>
        <button 
          onClick={() => window.close()}
          className="text-neutral-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      <MapPanel
        assets={assets}
        selectedAssetId={null}
        onAssetSelect={(id) => {
          // Broadcast to main window
          const channel = new BroadcastChannel('asset-list-sync');
          channel.postMessage({ type: 'ASSET_SELECT', assetId: id });
          channel.close();
        }}
      />
    </div>
  );
}
```

`app/assets/popout/table/page.tsx`:
```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DataTable from '@/components/asset-list/DataTable';
import Pagination from '@/components/asset-list/Pagination';

export default function TablePopoutPage() {
  const searchParams = useSearchParams();
  const viewId = searchParams.get('viewId');
  
  const [assets, setAssets] = useState([]);
  const [columns, setColumns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const channel = new BroadcastChannel('asset-list-sync');
    
    channel.onmessage = (event) => {
      if (event.data.type === 'ASSETS_UPDATE') {
        setAssets(event.data.assets);
      }
      if (event.data.type === 'COLUMNS_UPDATE') {
        setColumns(event.data.columns);
      }
    };

    return () => channel.close();
  }, []);

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="bg-neutral-800 text-white px-4 py-2 flex items-center justify-between">
        <h1 className="text-sm font-semibold">Core Vision - Data Table</h1>
        <button 
          onClick={() => window.close()}
          className="text-neutral-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <DataTable
          data={assets}
          columns={columns}
          selectedRows={[]}
          onRowSelect={() => {}}
          onRowClick={(asset) => {
            // Open detail view in main window
            const channel = new BroadcastChannel('asset-list-sync');
            channel.postMessage({ type: 'OPEN_DETAIL', assetId: asset.id });
            channel.close();
          }}
          onColumnReorder={() => {}}
        />
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(assets.length / 100)}
        totalItems={assets.length}
        itemsPerPage={100}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={() => {}}
      />
    </div>
  );
}
```

**State Synchronization:**

In main `app/assets/page.tsx`, broadcast changes:
```typescript
useEffect(() => {
  if (poppedOutSections.map || poppedOutSections.table) {
    const channel = new BroadcastChannel('asset-list-sync');
    
    channel.postMessage({
      type: 'ASSETS_UPDATE',
      assets: paginatedAssets
    });
    
    channel.postMessage({
      type: 'COLUMNS_UPDATE',
      columns: displayedColumns
    });
    
    return () => channel.close();
  }
}, [paginatedAssets, displayedColumns, poppedOutSections]);
```

---

## 2️⃣ ADVANCED SEARCH

**Priority:** 🔥 Critical  
**Reference:** Screenshot 1 - Search bar with field selector and operators

### Requirements
Search with field-specific filtering: select field (Asset/Pipe Segment Reference/etc), operator (Is/Is Not/Contains/etc), and value.

### UI Design (from screenshot)
```
┌─────────────────────────────────────────────────────┐
│ [Asset ▾] [Pipe Segment Reference ▾] [Is Not ▾]    │ 🔍 ✕
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Implementation

**File:** `components/asset-list/SearchDialog.tsx`

Replace simple search with advanced:
```typescript
'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ColumnDef } from '@/lib/types/asset-list';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  columns: ColumnDef[];
  onSearch: (query: SearchQuery) => void;
}

interface SearchQuery {
  table: 'asset' | 'inspection' | 'observation';
  field: string;
  operator: 'is' | 'isNot' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  value: string;
}

export default function SearchDialog({
  open,
  onClose,
  columns,
  onSearch
}: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    table: 'asset',
    field: 'pipeSegment',
    operator: 'contains',
    value: ''
  });

  const handleSearch = () => {
    onSearch(searchQuery);
    onClose();
  };

  const handleClear = () => {
    setSearchQuery({
      table: 'asset',
      field: 'pipeSegment',
      operator: 'contains',
      value: ''
    });
  };

  // Get columns for selected table
  const tableColumns = columns.filter(col => col.table === searchQuery.table);

  // Get operators based on field type
  const selectedColumn = columns.find(col => col.field === searchQuery.field);
  const operators = getOperatorsForType(selectedColumn?.type || 'text');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
            {/* Table Selector */}
            <Select
              value={searchQuery.table}
              onValueChange={(value: any) => {
                setSearchQuery(prev => ({
                  ...prev,
                  table: value,
                  field: '' // Reset field when table changes
                }));
              }}
            >
              <SelectTrigger className="w-40 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">Asset</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="observation">Observation</SelectItem>
              </SelectContent>
            </Select>

            {/* Field Selector */}
            <Select
              value={searchQuery.field}
              onValueChange={(value) => {
                setSearchQuery(prev => ({ ...prev, field: value }));
              }}
            >
              <SelectTrigger className="flex-1 bg-white">
                <SelectValue placeholder="Select field..." />
              </SelectTrigger>
              <SelectContent>
                {tableColumns.map(col => (
                  <SelectItem key={col.id} value={col.field}>
                    {col.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Operator Selector */}
            <Select
              value={searchQuery.operator}
              onValueChange={(value: any) => {
                setSearchQuery(prev => ({ ...prev, operator: value }));
              }}
            >
              <SelectTrigger className="w-40 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map(op => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Value Input */}
            <Input
              value={searchQuery.value}
              onChange={(e) => {
                setSearchQuery(prev => ({ ...prev, value: e.target.value }));
              }}
              placeholder="Enter value..."
              className="flex-1 bg-white"
            />

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={!searchQuery.field || !searchQuery.value}
              size="icon"
              className="flex-shrink-0"
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Clear Button */}
            <Button
              onClick={handleClear}
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Recent Searches */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-neutral-700">Recent Searches</h4>
            <div className="space-y-1">
              {/* Show recent searches from localStorage */}
              <p className="text-xs text-neutral-500">No recent searches</p>
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>💡 Tip:</strong> Use advanced search to find specific assets based on field values. 
              Results will be highlighted in the table.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSearch}
            disabled={!searchQuery.field || !searchQuery.value}
          >
            Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getOperatorsForType(type: string) {
  switch (type) {
    case 'text':
      return [
        { value: 'is', label: 'Is' },
        { value: 'isNot', label: 'Is Not' },
        { value: 'contains', label: 'Contains' },
        { value: 'startsWith', label: 'Starts With' },
        { value: 'endsWith', label: 'Ends With' },
      ];
    case 'number':
      return [
        { value: 'is', label: 'Is' },
        { value: 'isNot', label: 'Is Not' },
        { value: 'greaterThan', label: 'Greater Than' },
        { value: 'lessThan', label: 'Less Than' },
      ];
    case 'date':
      return [
        { value: 'is', label: 'On Date' },
        { value: 'greaterThan', label: 'After' },
        { value: 'lessThan', label: 'Before' },
      ];
    default:
      return [
        { value: 'is', label: 'Is' },
        { value: 'isNot', label: 'Is Not' },
      ];
  }
}
```

---

## 3️⃣ TOOLBAR HIERARCHY: SPLIT SETTINGS BUTTON

**Priority:** 🔥 Critical  
**Reference:** Screenshot 2 - Separate Filter and Columns buttons

### Current State
```
🔍 Search  ⚙️ Settings  ⋮ More  ⧉ Pop-out
```

### New State
```
🔍 Search  🔽 Filter  📊 Columns  ⋮ More  ⧉ Pop-out
```

### Implementation

**File:** `components/asset-list/Toolbar.tsx`

Replace single Settings button with two:
```typescript
interface ToolbarProps {
  onSearch: () => void;
  onOpenFilters: () => void;      // NEW: Open to Filters tab
  onOpenColumns: () => void;       // NEW: Open to Columns tab
  // Remove: onOpenViewSettings
  // ... rest of props
}

export default function Toolbar({
  onSearch,
  onOpenFilters,
  onOpenColumns,
  // ... rest
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-neutral-200">
      {/* Search */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={onSearch}>
            <Search className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Search assets</TooltipContent>
      </Tooltip>

      {/* Filter Button - NEW */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={onOpenFilters}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add or edit filters</TooltipContent>
      </Tooltip>

      {/* Columns Button - NEW */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={onOpenColumns}
          >
            <Columns className="w-4 h-4" />
            <span className="text-sm">Columns</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Customize columns</TooltipContent>
      </Tooltip>

      {/* More Tools */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={onValidateInspection}>
            Validate Inspection
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onFindReplace}>
            Find & Replace
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExport}>
            Export Project
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCopyToProject}>
            Copy to Project
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onPrint}>
            Print
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Context Actions (when rows selected) */}
      {selectedRowsCount > 0 && (
        <>
          <div className="h-6 w-px bg-neutral-300 mx-2" />
          <span className="text-sm text-neutral-600">
            {selectedRowsCount} selected
          </span>
          <Button variant="ghost" size="sm" onClick={onEditSelected}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onDeleteSelected}>
            Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={onExportSelected}>
            Export Selected
          </Button>
        </>
      )}

      {/* Pop-out */}
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <ExternalLink className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPopOutMap}>
              Pop-out Map
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPopOutTable}>
              Pop-out Table
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPopOutBoth}>
              Pop-out Both
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
```

**Update ViewSettingsDialog:**

Add `defaultTab` prop:
```typescript
interface ViewSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  currentView: View;
  onSave: (view: View) => void;
  defaultTab?: 'columns' | 'filters'; // NEW
}

export default function ViewSettingsDialog({
  open,
  onClose,
  currentView,
  onSave,
  defaultTab = 'columns'
}: ViewSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Reset to default tab when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  // ... rest of component
}
```

**Update parent page:**

```typescript
const [viewSettingsOpen, setViewSettingsOpen] = useState(false);
const [viewSettingsDefaultTab, setViewSettingsDefaultTab] = useState<'columns' | 'filters'>('columns');

const handleOpenFilters = () => {
  setViewSettingsDefaultTab('filters');
  setViewSettingsOpen(true);
};

const handleOpenColumns = () => {
  setViewSettingsDefaultTab('columns');
  setViewSettingsOpen(true);
};

// In JSX:
<Toolbar
  onSearch={() => setSearchOpen(true)}
  onOpenFilters={handleOpenFilters}
  onOpenColumns={handleOpenColumns}
  // ...
/>

<ViewSettingsDialog
  open={viewSettingsOpen}
  onClose={() => setViewSettingsOpen(false)}
  currentView={activeView}
  onSave={handleSaveView}
  defaultTab={viewSettingsDefaultTab}
/>
```

---

## 4️⃣ FIND & REPLACE FUNCTIONALITY

**Priority:** ⚡ Important  
**Reference:** Screenshot 3 - Find/Replace bar with field selector

### UI Design (from screenshot)
```
┌──────────────────────────────────────────────────────────┐
│ 🔍 🖨 🔧 ⚙️  [Asset ▾] [Pipe Segment Reference ▾]       │
│              [Contains ▾]                       🔄        │
│                                                           │
│  Replace: ⦿Selection ⭘Entire Project           Find/replace │
│                                                ─────────  │
│                                                  ✓        │
└──────────────────────────────────────────────────────────┘
```

### Requirements
- Find assets matching criteria (field + operator + value)
- Replace value in matched assets
- Scope: Selected assets OR entire project
- Show count of matches before replacing
- Confirmation before applying changes

### Implementation

**File:** `components/asset-list/FindReplaceDialog.tsx`

```typescript
'use client';

import { useState, useMemo } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { Asset, ColumnDef } from '@/lib/types/asset-list';

interface FindReplaceDialogProps {
  open: boolean;
  onClose: () => void;
  columns: ColumnDef[];
  assets: Asset[];
  selectedAssetIds: string[];
  onReplace: (updates: ReplaceOperation) => void;
}

interface ReplaceOperation {
  field: string;
  findValue: string;
  replaceValue: string;
  scope: 'selection' | 'project';
  matchedAssetIds: string[];
}

export default function FindReplaceDialog({
  open,
  onClose,
  columns,
  assets,
  selectedAssetIds,
  onReplace
}: FindReplaceDialogProps) {
  const [field, setField] = useState('');
  const [operator, setOperator] = useState<'equals' | 'contains'>('contains');
  const [findValue, setFindValue] = useState('');
  const [replaceValue, setReplaceValue] = useState('');
  const [scope, setScope] = useState<'selection' | 'project'>('selection');

  // Calculate matches
  const matchedAssets = useMemo(() => {
    if (!field || !findValue) return [];

    const assetsToSearch = scope === 'selection' 
      ? assets.filter(a => selectedAssetIds.includes(a.id))
      : assets;

    return assetsToSearch.filter(asset => {
      const value = String(asset[field as keyof Asset] || '');
      
      if (operator === 'equals') {
        return value.toLowerCase() === findValue.toLowerCase();
      } else {
        return value.toLowerCase().includes(findValue.toLowerCase());
      }
    });
  }, [assets, field, operator, findValue, scope, selectedAssetIds]);

  const handleReplace = () => {
    if (matchedAssets.length === 0) return;

    onReplace({
      field,
      findValue,
      replaceValue,
      scope,
      matchedAssetIds: matchedAssets.map(a => a.id)
    });

    onClose();
  };

  // Get editable columns (exclude IDs, computed fields)
  const editableColumns = columns.filter(col => 
    col.field !== 'id' && 
    col.field !== 'pipeSegment' && // Assuming this is a key field
    col.type !== 'date' // Dates might need special handling
  );

  const selectedColumn = columns.find(col => col.field === field);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Find & Replace</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Find Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Find</Label>
            
            <div className="flex items-center gap-2">
              {/* Field Selector */}
              <Select value={field} onValueChange={setField}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select field..." />
                </SelectTrigger>
                <SelectContent>
                  {editableColumns.map(col => (
                    <SelectItem key={col.id} value={col.field}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Operator */}
              <Select 
                value={operator} 
                onValueChange={(val: any) => setOperator(val)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="equals">Equals</SelectItem>
                </SelectContent>
              </Select>

              {/* Find Value */}
              <Input
                value={findValue}
                onChange={(e) => setFindValue(e.target.value)}
                placeholder="Value to find..."
                className="flex-1"
              />
            </div>
          </div>

          {/* Replace Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Replace With</Label>
            
            <Input
              value={replaceValue}
              onChange={(e) => setReplaceValue(e.target.value)}
              placeholder="New value..."
              disabled={!field || !findValue}
            />
          </div>

          {/* Scope Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Replace In</Label>
            
            <RadioGroup value={scope} onValueChange={(val: any) => setScope(val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selection" id="selection" />
                <Label htmlFor="selection" className="cursor-pointer">
                  Selection ({selectedAssetIds.length} assets)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="project" id="project" />
                <Label htmlFor="project" className="cursor-pointer">
                  Entire Project ({assets.length} assets)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Preview */}
          {field && findValue && (
            <Card className={`border-2 ${
              matchedAssets.length === 0 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Search className={`w-5 h-5 ${
                    matchedAssets.length === 0 ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      matchedAssets.length === 0 ? 'text-yellow-900' : 'text-blue-900'
                    }`}>
                      {matchedAssets.length === 0 ? (
                        'No matches found'
                      ) : (
                        <>
                          <strong>{matchedAssets.length}</strong> asset
                          {matchedAssets.length !== 1 ? 's' : ''} will be updated
                        </>
                      )}
                    </p>
                    {matchedAssets.length > 0 && replaceValue && (
                      <p className="text-xs text-blue-700 mt-1">
                        "{findValue}" → "{replaceValue}" in {selectedColumn?.label}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning */}
          {matchedAssets.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-900">
                <strong>⚠️ Warning:</strong> This action cannot be undone. 
                Please verify the changes before clicking Replace.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleReplace}
            disabled={matchedAssets.length === 0 || !replaceValue}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Replace {matchedAssets.length > 0 && `(${matchedAssets.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Integrate in parent page:**

```typescript
const [findReplaceOpen, setFindReplaceOpen] = useState(false);

const handleFindReplace = (operation: ReplaceOperation) => {
  // Update assets
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

  // Show success toast
  toast({
    title: "Replace completed",
    description: `Updated ${operation.matchedAssetIds.length} assets`,
  });
};

// In JSX:
<FindReplaceDialog
  open={findReplaceOpen}
  onClose={() => setFindReplaceOpen(false)}
  columns={allColumns}
  assets={assets}
  selectedAssetIds={selectedRows}
  onReplace={handleFindReplace}
/>
```

---

## 5️⃣ EXPORT SELECTED FUNCTIONALITY

**Priority:** ⚡ Important  
**Context:** From meeting - Michaela mentioned exporting selected assets

### Requirements
- Export selected rows to Excel/CSV
- Include only visible columns in current view
- Filename: `CoreVision_Export_[ViewName]_[Date].xlsx`
- Show progress for large exports

### Implementation

**File:** `lib/utils/export.ts`

```typescript
import * as XLSX from 'xlsx';
import type { Asset, ColumnDef } from '../types/asset-list';

export async function exportToExcel(
  assets: Asset[],
  columns: ColumnDef[],
  filename: string
) {
  // Prepare data for export
  const exportData = assets.map(asset => {
    const row: any = {};
    columns.forEach(col => {
      row[col.label] = asset[col.field as keyof Asset] || '';
    });
    return row;
  });

  // Create workbook
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

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Assets');

  // Generate file
  XLSX.writeFile(wb, filename);
}

export async function exportToCSV(
  assets: Asset[],
  columns: ColumnDef[],
  filename: string
) {
  // Prepare CSV content
  const headers = columns.map(col => col.label).join(',');
  
  const rows = assets.map(asset => {
    return columns.map(col => {
      const value = asset[col.field as keyof Asset] || '';
      // Escape commas and quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csv = [headers, ...rows].join('\n');

  // Download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
```

**Install dependency:**
```bash
npm install xlsx
```

**Update Toolbar handler:**

```typescript
const handleExportSelected = async () => {
  if (selectedRows.length === 0) return;

  const selectedAssets = assets.filter(a => selectedRows.includes(a.id));
  const filename = `CoreVision_Export_${activeView.name}_${
    new Date().toISOString().split('T')[0]
  }.xlsx`;

  try {
    await exportToExcel(
      selectedAssets,
      displayedColumns,
      filename
    );

    toast({
      title: "Export successful",
      description: `Exported ${selectedAssets.length} assets to ${filename}`,
    });

    // Clear selection after export
    setSelectedRows([]);
  } catch (error) {
    toast({
      title: "Export failed",
      description: "An error occurred while exporting. Please try again.",
      variant: "destructive"
    });
  }
};
```

**Add export format selector dialog:**

```typescript
const [exportDialogOpen, setExportDialogOpen] = useState(false);
const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');

const handleExportSelected = () => {
  if (selectedRows.length === 0) return;
  setExportDialogOpen(true);
};

const confirmExport = async () => {
  const selectedAssets = assets.filter(a => selectedRows.includes(a.id));
  const date = new Date().toISOString().split('T')[0];
  const filename = `CoreVision_Export_${activeView.name}_${date}.${exportFormat}`;

  try {
    if (exportFormat === 'xlsx') {
      await exportToExcel(selectedAssets, displayedColumns, filename);
    } else {
      await exportToCSV(selectedAssets, displayedColumns, filename);
    }

    toast({
      title: "Export successful",
      description: `Exported ${selectedAssets.length} assets`,
    });

    setExportDialogOpen(false);
    setSelectedRows([]);
  } catch (error) {
    toast({
      title: "Export failed",
      description: "Please try again.",
      variant: "destructive"
    });
  }
};

// Export Dialog Component
<Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Export Selected Assets</DialogTitle>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <p className="text-sm text-neutral-600">
        Exporting <strong>{selectedRows.length}</strong> selected assets 
        with <strong>{displayedColumns.length}</strong> columns.
      </p>
      
      <div className="space-y-2">
        <Label>Export Format</Label>
        <RadioGroup value={exportFormat} onValueChange={(val: any) => setExportFormat(val)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="xlsx" id="xlsx" />
            <Label htmlFor="xlsx">Excel (.xlsx)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="csv" id="csv" />
            <Label htmlFor="csv">CSV (.csv)</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
        Cancel
      </Button>
      <Button onClick={confirmExport}>
        Export
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 6️⃣ INLINE EDITING (SAFE PATTERN)

**Priority:** ⚡ Important  
**Context:** Michaela's feedback - "being able to edit from this screen, instead of having to go into each one"

### Requirements from Meeting
- NOT direct cell click (too dangerous - accidental edits)
- Use kebab menu → Edit action
- Opens inline edit mode for that row
- Can edit multiple fields at once
- Requires explicit Save/Cancel
- Visual distinction for "editing mode"

### Implementation

**File:** `components/asset-list/DataTable.tsx`

Add edit mode state:
```typescript
interface DataTableProps {
  // ... existing props
  onUpdateAsset: (assetId: string, updates: Partial<Asset>) => void;
}

export default function DataTable({
  data,
  columns,
  selectedRows,
  onRowSelect,
  onRowClick,
  onColumnReorder,
  onSort,
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
    if (editingRowId) {
      onUpdateAsset(editingRowId, editingValues);
      setEditingRowId(null);
      setEditingValues({});
    }
  };

  const updateField = (field: string, value: any) => {
    setEditingValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="overflow-auto">
      <table className="w-full">
        <thead className="bg-neutral-50 border-b-2 border-neutral-300">
          {/* ... header rows */}
        </thead>

        <tbody>
          {data.map((asset, idx) => {
            const isEditing = editingRowId === asset.id;

            return (
              <tr
                key={asset.id}
                className={`h-14 border-b border-neutral-200 transition-colors ${
                  isEditing 
                    ? 'bg-blue-50 border-blue-300 border-2' 
                    : selectedRows.includes(asset.id) 
                    ? 'bg-orange-50' 
                    : idx % 2 === 0 
                    ? 'bg-white' 
                    : 'bg-neutral-50'
                } ${!isEditing && 'hover:bg-neutral-100 cursor-pointer'}`}
                onClick={(e) => {
                  if (isEditing) return; // Don't navigate when editing
                  const target = e.target as HTMLElement;
                  if (target.closest('button') || target.closest('input')) return;
                  onRowClick(asset);
                }}
              >
                {/* Checkbox */}
                <td className="px-4 py-3">
                  {!isEditing && (
                    <Checkbox
                      checked={selectedRows.includes(asset.id)}
                      onCheckedChange={() => handleRowSelect(asset.id)}
                    />
                  )}
                  {isEditing && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Edit className="w-3 h-3 text-white" />
                    </div>
                  )}
                </td>

                {/* Data Cells */}
                {columns.map((column) => {
                  const isEditable = column.field !== 'id' && 
                                    column.field !== 'pipeSegment' &&
                                    column.type !== 'date'; // Dates need special handling

                  return (
                    <td key={column.id} className="px-4 py-3">
                      {isEditing && isEditable ? (
                        // Edit mode input
                        <Input
                          value={editingValues[column.field as keyof Asset] || ''}
                          onChange={(e) => updateField(column.field, e.target.value)}
                          className="h-8 text-sm"
                          autoFocus={columns.indexOf(column) === 1} // Focus first editable field
                        />
                      ) : (
                        // Display mode
                        <span className="text-sm text-neutral-700">
                          {asset[column.field as keyof Asset]}
                        </span>
                      )}
                    </td>
                  );
                })}

                {/* Actions */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    // Edit mode actions
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        onClick={saveEditing}
                        className="h-7 text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditing}
                        className="h-7 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    // Normal mode actions
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onRowClick(asset)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => startEditing(asset)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Asset
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log('Duplicate', asset.id)}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => console.log('Delete', asset.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

**Parent page handler:**

```typescript
const handleUpdateAsset = (assetId: string, updates: Partial<Asset>) => {
  const updatedAssets = assets.map(asset => 
    asset.id === assetId ? { ...asset, ...updates } : asset
  );
  
  setAssets(updatedAssets);

  toast({
    title: "Asset updated",
    description: "Changes saved successfully",
  });
};

// In JSX:
<DataTable
  // ... other props
  onUpdateAsset={handleUpdateAsset}
/>
```

**Visual improvements:**

```css
/* Add to globals.css or component styles */
@keyframes editPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
}

.editing-row {
  animation: editPulse 2s ease-in-out infinite;
}
```

---

## 7️⃣ REPORT GENERATION WITH PREVIEW

**Priority:** ⚡ Important  
**Context:** Michaela loved preview idea - "I like that. Yeah, because..."

### Requirements
- Generate PDF report with selected assets or all
- Preview before generation (avoid "I didn't mean that" issues)
- Options: Selected/All assets, Newest/All inspections
- Show page thumbnails in preview
- Estimated page count

### Implementation

**File:** `components/asset-list/ReportDialog.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Printer, FileText, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import type { Asset, View } from '@/lib/types/asset-list';

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  assets: Asset[];
  selectedAssetIds: string[];
  currentView: View;
  onGenerate: (config: ReportConfig) => void;
}

interface ReportConfig {
  scope: 'selected' | 'all';
  inspections: 'newest' | 'all';
  includeMap: boolean;
  includePhotos: boolean;
}

export default function ReportDialog({
  open,
  onClose,
  assets,
  selectedAssetIds,
  currentView,
  onGenerate
}: ReportDialogProps) {
  const [step, setStep] = useState<'config' | 'preview'>('config');
  const [config, setConfig] = useState<ReportConfig>({
    scope: 'selected',
    inspections: 'newest',
    includeMap: true,
    includePhotos: false
  });

  const assetsToInclude = config.scope === 'selected'
    ? assets.filter(a => selectedAssetIds.includes(a.id))
    : assets;

  const estimatedPages = Math.ceil(
    assetsToInclude.length * (config.includePhotos ? 2 : 1)
  );

  const handlePreview = () => {
    setStep('preview');
  };

  const handleGenerate = () => {
    onGenerate(config);
    onClose();
    setStep('config'); // Reset for next time
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 'config' ? 'Generate Report' : 'Preview Report'}
          </DialogTitle>
        </DialogHeader>

        {step === 'config' ? (
          // Configuration Step
          <div className="space-y-4 py-4 overflow-auto">
            {/* Scope Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Report Scope</Label>
              <RadioGroup 
                value={config.scope} 
                onValueChange={(val: any) => setConfig(prev => ({ ...prev, scope: val }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selected" id="selected" />
                  <Label htmlFor="selected" className="cursor-pointer">
                    Selected Assets ({selectedAssetIds.length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="cursor-pointer">
                    All Assets in View ({assets.length})
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Inspection Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Inspections</Label>
              <RadioGroup 
                value={config.inspections} 
                onValueChange={(val: any) => setConfig(prev => ({ ...prev, inspections: val }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="newest" id="newest" />
                  <Label htmlFor="newest" className="cursor-pointer">
                    Newest Inspection Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all-inspections" />
                  <Label htmlFor="all-inspections" className="cursor-pointer">
                    All Inspections
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Include</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeMap"
                    checked={config.includeMap}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      includeMap: e.target.checked 
                    }))}
                    className="w-4 h-4 rounded border-neutral-300"
                  />
                  <Label htmlFor="includeMap" className="cursor-pointer">
                    Map Overview
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includePhotos"
                    checked={config.includePhotos}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      includePhotos: e.target.checked 
                    }))}
                    className="w-4 h-4 rounded border-neutral-300"
                  />
                  <Label htmlFor="includePhotos" className="cursor-pointer">
                    Inspection Photos (increases file size)
                  </Label>
                </div>
              </div>
            </div>

            {/* Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Assets:</span>
                    <span className="font-medium text-blue-900">
                      {assetsToInclude.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Estimated Pages:</span>
                    <span className="font-medium text-blue-900">
                      ~{estimatedPages}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Format:</span>
                    <span className="font-medium text-blue-900">
                      PDF
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Preview Step
          <div className="space-y-4 py-4 overflow-auto flex-1">
            <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-8">
              <div className="bg-white rounded shadow-lg aspect-[8.5/11] mx-auto max-w-md p-8">
                {/* Mock Report Preview */}
                <div className="space-y-4">
                  <div className="text-center border-b pb-4">
                    <h2 className="text-xl font-bold">Asset Inspection Report</h2>
                    <p className="text-sm text-neutral-600 mt-1">
                      {currentView.name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Generated: {new Date().toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Total Assets:</span>
                      <span className="font-medium">{assetsToInclude.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Inspections:</span>
                      <span className="font-medium">
                        {config.inspections === 'newest' ? 'Newest Only' : 'All'}
                      </span>
                    </div>
                  </div>

                  {config.includeMap && (
                    <div className="border border-neutral-200 rounded p-2">
                      <div className="bg-neutral-100 h-32 rounded flex items-center justify-center text-xs text-neutral-500">
                        Map Overview
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {assetsToInclude.slice(0, 3).map((asset, idx) => (
                      <div key={asset.id} className="border border-neutral-200 rounded p-2 text-xs">
                        <div className="font-medium">{asset.pipeSegment}</div>
                        <div className="text-neutral-600">{asset.street}</div>
                      </div>
                    ))}
                    {assetsToInclude.length > 3 && (
                      <div className="text-center text-xs text-neutral-500 py-2">
                        ... and {assetsToInclude.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-neutral-600 mt-4">
                Page 1 of ~{estimatedPages}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'config' ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handlePreview}
                className="gap-2"
                disabled={assetsToInclude.length === 0}
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep('config')}>
                Back to Settings
              </Button>
              <Button 
                onClick={handleGenerate}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Generate PDF
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**PDF Generation (using jsPDF):**

```bash
npm install jspdf jspdf-autotable
```

**File:** `lib/utils/pdf-generator.ts`

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Asset, ColumnDef, ReportConfig } from '../types/asset-list';

export async function generatePDF(
  assets: Asset[],
  columns: ColumnDef[],
  config: ReportConfig,
  viewName: string
) {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text('Asset Inspection Report', 14, 20);

  doc.setFontSize(12);
  doc.text(viewName, 14, 30);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);
  doc.text(`Total Assets: ${assets.length}`, 14, 44);

  // Add table
  const tableData = assets.map(asset => 
    columns.map(col => asset[col.field as keyof Asset] || '')
  );

  autoTable(doc, {
    head: [columns.map(col => col.label)],
    body: tableData,
    startY: 50,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [249, 115, 22] }, // Orange
  });

  // Save
  const filename = `CoreVision_Report_${viewName}_${
    new Date().toISOString().split('T')[0]
  }.pdf`;
  
  doc.save(filename);
}
```

**Integrate in parent:**

```typescript
const [reportDialogOpen, setReportDialogOpen] = useState(false);

const handleGenerateReport = async (config: ReportConfig) => {
  const assetsToInclude = config.scope === 'selected'
    ? assets.filter(a => selectedRows.includes(a.id))
    : filteredAssets;

  try {
    await generatePDF(
      assetsToInclude,
      displayedColumns,
      config,
      activeView.name
    );

    toast({
      title: "Report generated",
      description: "PDF downloaded successfully",
    });
  } catch (error) {
    toast({
      title: "Report generation failed",
      description: "Please try again.",
      variant: "destructive"
    });
  }
};
```

---

## ✅ SUCCESS CRITERIA

Implementation successful when:

1. **Pop-out works:**
   - Opens in new window
   - State syncs between windows
   - Closing pop-out restores main layout

2. **Advanced Search functional:**
   - Field/operator/value selects work
   - Search executes correctly
   - Results highlight in table

3. **Toolbar hierarchy clear:**
   - Filter and Columns separate buttons
   - Each opens correct tab in ViewSettings
   - Visual hierarchy makes sense

4. **Find & Replace safe:**
   - Shows match count before replacing
   - Confirmation required
   - Scope selection works (selected vs all)

5. **Export Selected works:**
   - Exports only selected rows
   - Includes visible columns only
   - File downloads correctly (Excel/CSV)

6. **Inline editing safe:**
   - Requires explicit Edit action (kebab menu)
   - Visual distinction in edit mode
   - Save/Cancel buttons clear
   - Can't accidentally navigate away

7. **Report generation smooth:**
   - Preview shows before generation
   - Config options all work
   - PDF generates and downloads
   - Filename follows convention

---

## 🚨 CRITICAL REMINDERS

1. **Don't make inline editing direct cell click** - use kebab menu pattern
2. **Don't skip confirmation on Find & Replace** - too dangerous
3. **Don't forget state sync for pop-out windows** - use BroadcastChannel
4. **Don't generate reports without preview** - users need to verify first
5. **Don't export without showing what will be exported** - confirmation dialog
6. **Don't allow editing of ID/key fields** - could break relationships
7. **Don't forget loading states** - especially for PDF generation

---

## 📝 FILE STRUCTURE ADDITIONS

```
components/
├── asset-list/
│   ├── ... (existing files)
│   ├── FindReplaceDialog.tsx      # NEW
│   ├── ReportDialog.tsx           # NEW
│   └── (update existing files)
lib/
├── utils/
│   ├── export.ts                  # NEW
│   └── pdf-generator.ts           # NEW
app/
├── assets/
│   ├── page.tsx                   # UPDATE
│   └── popout/
│       ├── map/
│       │   └── page.tsx           # NEW
│       └── table/
│           └── page.tsx           # NEW
```

---

## 🎯 TESTING CHECKLIST

After implementation, test:

- [ ] Pop-out Map opens in new window
- [ ] Pop-out Table opens in new window
- [ ] State syncs between windows
- [ ] Advanced search finds correct assets
- [ ] Filter button opens to Filters tab
- [ ] Columns button opens to Columns tab
- [ ] Find & Replace shows match count
- [ ] Find & Replace updates correctly
- [ ] Export Selected downloads file
- [ ] Export includes only visible columns
- [ ] Inline edit mode activates from kebab menu
- [ ] Inline edit Save updates asset
- [ ] Inline edit Cancel reverts changes
- [ ] Report preview shows before generation
- [ ] Report PDF generates correctly
- [ ] All features work with selected rows
- [ ] All features work with full dataset

---

## 🚀 PRIORITY ORDER

Implement in this order:

1. **Toolbar hierarchy** (quickest, foundational)
2. **Advanced Search** (builds on existing search)
3. **Inline Editing** (high value, medium complexity)
4. **Export Selected** (straightforward)
5. **Find & Replace** (builds on search + edit patterns)
6. **Report Generation** (most complex)
7. **Pop-out functionality** (bonus, if time permits)

---

**END OF PROMPT**

Good luck! Focus on safety patterns and clear confirmations. Every destructive action should require user confirmation. 🎯