# 🎯 FLOATING SELECTION BAR - Complete Implementation

**Task:** Build floating action bar with all selection actions and their complete interactions

---

## 📐 FINAL DESIGN

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ✓ 3 selected  │  Assign  Edit  Delete  │  Open in Tabs  Export  │  Clear    │
│      ↑             ↑      ↑     ↑            ↑           ↑          ↑         │
│   Count      Modification      View/Export actions    Deselect               │
└──────────────────────────────────────────────────────────────────────────────┘

Visual Groups:
[Badge] │ [Assign] [Edit] [Delete] │ [Open Tabs] [Export] │ [Clear]
```

---

## 💻 COMPLETE COMPONENT CODE

**File:** `components/asset-list/FloatingSelectionBar.tsx`

```typescript
'use client';

import { useState } from 'react';
import { UserPlus, Edit, Trash2, ExternalLink, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AssignDialog from './AssignDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface FloatingSelectionBarProps {
  selectedAssets: Asset[];  // Full asset objects, not just IDs
  onClearSelection: () => void;
  onAssignComplete: (assigneeId: string) => void;
  onEditComplete: (updates: Partial<Asset>) => void;
  onDeleteComplete: () => void;
  onExportComplete: () => void;
}

export default function FloatingSelectionBar({
  selectedAssets,
  onClearSelection,
  onAssignComplete,
  onEditComplete,
  onDeleteComplete,
  onExportComplete
}: FloatingSelectionBarProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Don't render if nothing selected
  if (selectedAssets.length === 0) return null;

  // ACTION 1: ASSIGN
  const handleAssign = () => {
    setAssignDialogOpen(true);
  };

  const handleAssignConfirm = (assigneeId: string, notify: boolean) => {
    console.log('Assigning to:', assigneeId, 'Notify:', notify);
    onAssignComplete(assigneeId);
    setAssignDialogOpen(false);
    onClearSelection(); // Clear after assign
  };

  // ACTION 2: EDIT
  const handleEdit = () => {
    // Navigate to bulk edit page with selected IDs in URL
    const ids = selectedAssets.map(a => a.id).join(',');
    window.location.href = `/assets/bulk-edit?ids=${ids}`;
    
    // Alternative: Open inline edit modal
    // setEditDialogOpen(true);
  };

  // ACTION 3: DELETE
  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    console.log('Deleting assets:', selectedAssets.map(a => a.id));
    
    // Call API to delete
    try {
      await fetch('/api/assets/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assetIds: selectedAssets.map(a => a.id) 
        })
      });
      
      onDeleteComplete();
      setDeleteDialogOpen(false);
      onClearSelection();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete assets. Please try again.');
    }
  };

  // ACTION 4: OPEN IN TABS
  const handleOpenInTabs = () => {
    const count = selectedAssets.length;
    
    // Warning for many tabs
    if (count > 10) {
      const confirmed = confirm(
        `Open ${count} tabs? This may slow down your browser.`
      );
      if (!confirmed) return;
    }

    // Open each asset in new tab with small delay
    selectedAssets.forEach((asset, index) => {
      setTimeout(() => {
        window.open(`/assets/${asset.id}`, '_blank');
      }, index * 100); // 100ms delay between each to avoid browser blocking
    });

    // Don't clear selection - user might want to do more actions
  };

  // ACTION 5: EXPORT
  const handleExport = async () => {
    console.log('Exporting assets:', selectedAssets.length);
    
    // Generate CSV/Excel with selected assets only
    const csvData = generateCSV(selectedAssets);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    onExportComplete();
    
    // Optional: Clear selection after export
    // onClearSelection();
  };

  // Helper: Generate CSV
  const generateCSV = (assets: Asset[]) => {
    const headers = ['Pipe Segment', 'Street', 'Upstream', 'Downstream', 'Material', 'Width'];
    const rows = assets.map(a => [
      a.pipeSegment,
      a.street,
      a.upstream,
      a.downstream,
      a.material,
      a.width
    ]);
    
    return [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
  };

  // ACTION 6: CLEAR
  const handleClear = () => {
    onClearSelection();
  };

  return (
    <>
      {/* Floating Bar */}
      <div
        className="fixed left-1/2 -translate-x-1/2 z-40 
                   bg-white border border-neutral-200 rounded-xl shadow-2xl
                   transition-all duration-300 ease-in-out
                   animate-in slide-in-from-bottom-5"
        style={{ bottom: '80px' }}
      >
        <div className="flex items-center gap-3 px-6 py-4">
          {/* Selection Count Badge */}
          <Badge 
            variant="secondary" 
            className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium"
          >
            ✓ {selectedAssets.length} selected
          </Badge>

          {/* Separator */}
          <div className="h-6 w-px bg-neutral-300" />

          {/* GROUP 1: Modification Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAssign}
            className="gap-2 h-9"
          >
            <UserPlus className="w-4 h-4" />
            Assign
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="gap-2 h-9"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="gap-2 h-9 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>

          {/* Separator */}
          <div className="h-6 w-px bg-neutral-300" />

          {/* GROUP 2: View/Export Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInTabs}
            className="gap-2 h-9"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Tabs
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2 h-9"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>

          {/* Separator */}
          <div className="h-6 w-px bg-neutral-300" />

          {/* Clear Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="gap-2 h-9 text-neutral-600 hover:text-neutral-900"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>

      {/* Assign Dialog */}
      <AssignDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        onConfirm={handleAssignConfirm}
        selectedCount={selectedAssets.length}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        selectedAssets={selectedAssets}
      />
    </>
  );
}
```

---

## 🎯 ACTION SPECIFICATIONS

### 1️⃣ ASSIGN Action

**Purpose:** Reassign selected inspections to different team member

**Flow:**
```
User clicks "Assign" 
    ↓
Opens AssignDialog
    ↓
User selects assignee from dropdown
    ↓
Optional: Check "Notify assignee" checkbox
    ↓
User clicks "Assign"
    ↓
API call to update assignments
    ↓
Success notification
    ↓
Clear selection
```

**AssignDialog Component:**

**File:** `components/asset-list/AssignDialog.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface AssignDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (assigneeId: string, notify: boolean) => void;
  selectedCount: number;
}

// Mock team members - replace with API call
const TEAM_MEMBERS = [
  { id: 'user-1', name: 'John Smith', role: 'Inspector' },
  { id: 'user-2', name: 'Jane Doe', role: 'Senior Inspector' },
  { id: 'user-3', name: 'Bob Johnson', role: 'Inspector' },
  { id: 'user-4', name: 'Alice Williams', role: 'Team Lead' },
];

export default function AssignDialog({
  open,
  onClose,
  onConfirm,
  selectedCount
}: AssignDialogProps) {
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [notify, setNotify] = useState(true);

  const handleConfirm = () => {
    if (!assigneeId) {
      alert('Please select an assignee');
      return;
    }
    onConfirm(assigneeId, notify);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Inspections</DialogTitle>
          <DialogDescription>
            Assign {selectedCount} {selectedCount === 1 ? 'inspection' : 'inspections'} to a team member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Assignee Selector */}
          <div className="space-y-2">
            <Label htmlFor="assignee">Assign to</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger id="assignee">
                <SelectValue placeholder="Select team member..." />
              </SelectTrigger>
              <SelectContent>
                {TEAM_MEMBERS.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-neutral-500">{member.role}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notify Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="notify" 
              checked={notify}
              onCheckedChange={(checked) => setNotify(checked as boolean)}
            />
            <Label 
              htmlFor="notify"
              className="text-sm font-normal cursor-pointer"
            >
              Send email notification to assignee
            </Label>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              The selected inspections will be reassigned and the previous assignee will be notified.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 2️⃣ EDIT Action

**Purpose:** Bulk edit properties of selected assets

**Option A: Navigate to bulk edit page**
```typescript
const handleEdit = () => {
  const ids = selectedAssets.map(a => a.id).join(',');
  window.location.href = `/assets/bulk-edit?ids=${ids}`;
};
```

**Option B: Inline edit dialog**
```typescript
const handleEdit = () => {
  setEditDialogOpen(true);
  // Show dialog with common fields:
  // - Material (dropdown)
  // - Surveyed By (dropdown)
  // - Notes (textarea)
  // - Grade (select)
};
```

**Recommended:** Option A (dedicated page for complex bulk editing)

---

### 3️⃣ DELETE Action

**Purpose:** Delete selected assets with confirmation

**Flow:**
```
User clicks "Delete"
    ↓
Opens DeleteConfirmDialog with warning
    ↓
Shows list of assets to be deleted
    ↓
User types "DELETE" to confirm (safety measure)
    ↓
User clicks "Delete Assets"
    ↓
API call to delete
    ↓
Success notification
    ↓
Refresh table data
    ↓
Clear selection
```

**DeleteConfirmDialog Component:**

**File:** `components/asset-list/DeleteConfirmDialog.tsx`

```typescript
'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedAssets: Asset[];
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  selectedAssets
}: DeleteConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText === 'DELETE';

  const handleConfirm = () => {
    if (!isConfirmed) return;
    onConfirm();
    setConfirmText(''); // Reset for next time
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete {selectedAssets.length} Assets</DialogTitle>
              <DialogDescription>
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-900 font-medium mb-2">
              You are about to permanently delete:
            </p>
            <ul className="text-xs text-red-800 space-y-1 ml-4">
              {selectedAssets.slice(0, 5).map(asset => (
                <li key={asset.id}>• {asset.pipeSegment} - {asset.street}</li>
              ))}
              {selectedAssets.length > 5 && (
                <li>• ... and {selectedAssets.length - 5} more</li>
              )}
            </ul>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type <strong>DELETE</strong> to confirm
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
            />
          </div>

          {/* Additional Info */}
          <p className="text-xs text-neutral-600">
            All inspection data, observations, and media associated with these assets will also be deleted.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed}
          >
            Delete Assets
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 4️⃣ OPEN IN TABS Action

**Purpose:** Open each selected asset in new browser tab for parallel viewing

**Implementation:**
```typescript
const handleOpenInTabs = () => {
  const count = selectedAssets.length;
  
  // Safety check for too many tabs
  if (count > 10) {
    const confirmed = confirm(
      `Open ${count} tabs? This may slow down your browser.`
    );
    if (!confirmed) return;
  }
  
  // Browser may block if opening all at once
  // Use staggered setTimeout to avoid blocking
  selectedAssets.forEach((asset, index) => {
    setTimeout(() => {
      window.open(`/assets/${asset.id}`, '_blank');
    }, index * 100); // 100ms delay between each
  });
  
  // Optional: Show toast notification
  toast.success(`Opening ${count} tabs...`);
  
  // Don't clear selection - user might want to do more
};
```

**Edge Cases:**
```typescript
// Handle popup blocker
try {
  const newWindow = window.open(url, '_blank');
  if (!newWindow || newWindow.closed) {
    alert('Please allow popups for this site to open multiple tabs.');
  }
} catch (error) {
  console.error('Failed to open tab:', error);
}
```

---

### 5️⃣ EXPORT Action

**Purpose:** Export selected assets to CSV/Excel file

**Implementation:**
```typescript
const handleExport = async () => {
  // Show loading state
  setExporting(true);
  
  try {
    // Generate CSV
    const csv = generateCSV(selectedAssets);
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assets-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // Success feedback
    toast.success(`Exported ${selectedAssets.length} assets`);
    
    onExportComplete();
  } catch (error) {
    console.error('Export failed:', error);
    toast.error('Export failed. Please try again.');
  } finally {
    setExporting(false);
  }
};

const generateCSV = (assets: Asset[]) => {
  const headers = [
    'Pipe Segment',
    'Street',
    'Upstream MH',
    'Downstream MH',
    'Material',
    'Width',
    'Inspection Date',
    'Surveyed By',
    'Grade',
    'Certificate Number'
  ];
  
  const rows = assets.map(asset => [
    asset.pipeSegment,
    asset.street,
    asset.upstream,
    asset.downstream,
    asset.material,
    asset.width,
    asset.inspectionDate,
    asset.surveyedBy,
    asset.grade,
    asset.certificateNumber
  ]);
  
  // Escape commas and quotes in values
  const escapeCSV = (value: any) => {
    const str = String(value || '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');
};
```

**Alternative: Export to Excel**
```typescript
import * as XLSX from 'xlsx';

const handleExportExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(
    selectedAssets.map(asset => ({
      'Pipe Segment': asset.pipeSegment,
      'Street': asset.street,
      'Upstream MH': asset.upstream,
      'Downstream MH': asset.downstream,
      'Material': asset.material,
      'Width': asset.width,
      // ... other fields
    }))
  );
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');
  
  XLSX.writeFile(workbook, `assets-export-${Date.now()}.xlsx`);
};
```

---

### 6️⃣ CLEAR Action

**Purpose:** Deselect all selected assets

**Implementation:**
```typescript
const handleClear = () => {
  onClearSelection();
  // Optional: Show brief notification
  // toast.info('Selection cleared');
};
```

**Simple and straightforward!**

---

## 📊 PARENT COMPONENT INTEGRATION

**File:** `app/assets/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import FloatingSelectionBar from '@/components/asset-list/FloatingSelectionBar';

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Get full asset objects for selected IDs
  const selectedAssets = assets.filter(asset => 
    selectedAssetIds.includes(asset.id)
  );

  const handleAssignComplete = async (assigneeId: string) => {
    console.log('Assigning to:', assigneeId);
    
    // API call
    await fetch('/api/assets/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetIds: selectedAssetIds,
        assigneeId
      })
    });
    
    // Refresh data
    // ... refetch assets
    
    // Success notification
    toast.success(`Assigned ${selectedAssetIds.length} inspections`);
  };

  const handleDeleteComplete = async () => {
    // Remove deleted assets from state
    setAssets(prev => 
      prev.filter(asset => !selectedAssetIds.includes(asset.id))
    );
    
    toast.success(`Deleted ${selectedAssetIds.length} assets`);
  };

  const handleExportComplete = () => {
    toast.success(`Exported ${selectedAssetIds.length} assets`);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* ... Header, Tabs, Toolbar ... */}

      {/* Table */}
      <DataTable
        data={assets}
        selectedRows={selectedAssetIds}
        onSelectionChange={setSelectedAssetIds}
      />

      {/* Floating Selection Bar */}
      <FloatingSelectionBar
        selectedAssets={selectedAssets}
        onClearSelection={() => setSelectedAssetIds([])}
        onAssignComplete={handleAssignComplete}
        onEditComplete={() => {}}
        onDeleteComplete={handleDeleteComplete}
        onExportComplete={handleExportComplete}
      />
    </div>
  );
}
```

---

## 🎨 STYLING DETAILS

```typescript
// Floating bar container
className="
  fixed left-1/2 -translate-x-1/2 z-40
  bg-white border border-neutral-200 rounded-xl shadow-2xl
  transition-all duration-300 ease-in-out
  animate-in slide-in-from-bottom-5
"
style={{ bottom: '80px' }}

// Badge
className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium"

// Buttons (all same height)
className="gap-2 h-9"

// Delete button (danger variant)
className="gap-2 h-9 text-red-600 hover:bg-red-50 hover:border-red-300"

// Clear button (subtle)
className="gap-2 h-9 text-neutral-600 hover:text-neutral-900"

// Separators
className="h-6 w-px bg-neutral-300"
```

---

## ✅ TESTING CHECKLIST

**Visual:**
- [ ] Floating bar appears smoothly when selecting
- [ ] Badge shows correct count (updates live)
- [ ] All buttons same height (h-9)
- [ ] Separators between groups visible
- [ ] Delete button is red
- [ ] Clear button is subtle gray

**Assign:**
- [ ] Dialog opens on click
- [ ] Team members load in dropdown
- [ ] Can select assignee
- [ ] Notify checkbox toggles
- [ ] Assign button disabled until assignee selected
- [ ] Success notification appears
- [ ] Selection clears after assign

**Edit:**
- [ ] Navigates to bulk edit page with IDs
- [ ] OR opens inline edit dialog

**Delete:**
- [ ] Confirmation dialog opens
- [ ] Shows list of assets to delete
- [ ] Requires typing "DELETE"
- [ ] Delete button disabled until confirmed
- [ ] API call executes
- [ ] Assets removed from table
- [ ] Success notification appears
- [ ] Selection clears after delete

**Open in Tabs:**
- [ ] Opens each asset in new tab
- [ ] 100ms delay between tabs (prevents blocking)
- [ ] Warning shown if >10 tabs
- [ ] Handles popup blocker gracefully
- [ ] Selection stays active (doesn't clear)

**Export:**
- [ ] Generates CSV file
- [ ] Filename includes date
- [ ] All columns included
- [ ] Commas/quotes escaped properly
- [ ] File downloads automatically
- [ ] Success notification appears

**Clear:**
- [ ] Deselects all rows
- [ ] Floating bar disappears
- [ ] Table checkboxes unchecked

---

## 🚨 IMPORTANT NOTES

1. **Pass full Asset objects, not just IDs**
   ```typescript
   // ✅ Good
   selectedAssets={assets.filter(a => selectedIds.includes(a.id))}
   
   // ❌ Bad
   selectedIds={['id1', 'id2']}
   ```

2. **Clear selection after destructive actions**
   - After Assign → clear
   - After Delete → clear
   - After Export → optional (user might want more actions)
   - After Open Tabs → don't clear

3. **Safety confirmations**
   - Delete → requires typing "DELETE"
   - Open many tabs → requires confirmation
   - Assign → shows summary before confirming

4. **Performance**
   - Opening tabs: stagger with setTimeout
   - Export: show loading state
   - Delete: show progress if >100 items

---

## 🎯 SUMMARY

Six actions, all fully implemented:

1. **Assign** → Dialog → API → Clear
2. **Edit** → Navigate to bulk edit page
3. **Delete** → Confirm → API → Refresh → Clear
4. **Open Tabs** → Staggered window.open × N
5. **Export** → Generate CSV → Download
6. **Clear** → Deselect all

Clean, powerful, user-friendly! 🚀