'use client';

import { useState } from 'react';
import { UserPlus, Edit, Trash2, ExternalLink, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AssignDialog from './AssignDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import type { Asset } from '@/lib/types/asset-list';

interface FloatingSelectionBarProps {
  selectedAssets: Asset[];  // Full asset objects, not just IDs
  onClearSelection: () => void;
  onAssignComplete: (assigneeId: string) => void;
  onEditComplete: (updates: Partial<Asset>) => void;
  onDeleteComplete: () => void;
  onExportComplete: () => void;
  onOpenInTabs: () => void;
}

export default function FloatingSelectionBar({
  selectedAssets,
  onClearSelection,
  onAssignComplete,
  onEditComplete,
  onDeleteComplete,
  onExportComplete,
  onOpenInTabs
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
    // Try to navigate to bulk edit page with selected IDs in URL
    const ids = selectedAssets.map(a => a.id).join(',');
    
    // For now, use inline editing for first selected row as fallback
    // TODO: Create /assets/bulk-edit page for proper bulk editing
    if (selectedAssets.length > 0 && typeof window !== 'undefined') {
      const handler = (window as any).__startEditingSelected;
      if (handler) {
        handler();
      } else {
        // Fallback: navigate to bulk edit (will show 404 if page doesn't exist)
        window.location.href = `/assets/bulk-edit?ids=${ids}`;
      }
    }
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
  // Handled by parent component via onOpenInTabs prop

  // ACTION 5: EXPORT
  // Handled by parent component via onExportComplete prop

  // ACTION 6: CLEAR
  const handleClear = () => {
    onClearSelection();
  };

  return (
    <>
      {/* Floating Bar */}
      <div
        className="fixed z-50 
                   bg-white border border-neutral-200 rounded-xl shadow-2xl
                   transition-all duration-300 ease-in-out"
        style={{ 
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'fadeInUp 0.3s ease-out forwards'
        }}
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
            onClick={onOpenInTabs}
            className="gap-2 h-9"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Tabs
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportComplete}
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
