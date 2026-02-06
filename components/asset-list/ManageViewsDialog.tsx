'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pin, Pencil, Trash2, Plus, Copy, Share2 } from 'lucide-react';
import ShareViewDialog from './ShareViewDialog';
import type { View } from '@/lib/types/asset-list';
import type { ShareLevel, ShareDetails } from './ShareViewDialog';
import { cn } from '@/lib/utils';

interface ManageViewsDialogProps {
  open: boolean;
  onClose: () => void;
  views: View[];
  onUpdateViews: (views: View[]) => void;
  onCreateNewView?: () => void; // НОВИЙ: callback для відкриття CreateViewDialog
}

// Chip label and style for share level
function getShareChip(view: View): { label: string; className: string } {
  if (!view.shareLevel || view.shareLevel === 'personal') {
    return { label: 'Personal', className: 'bg-[#E0E7FF] text-[#1E3A8A]' };
  }
  if (view.shareLevel === 'companyWide') {
    return { label: 'Shared: Company', className: 'bg-[#DCFCE7] text-[#166534]' };
  }
  return { label: 'Shared: Admins', className: 'bg-[#DCFCE7] text-[#166534]' };
}

export default function ManageViewsDialog({
  open,
  onClose,
  views,
  onUpdateViews,
  onCreateNewView,
}: ManageViewsDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [viewToShare, setViewToShare] = useState<View | null>(null);

  // Separate favorites from all views
  const favoriteViews = views.filter(v => v.isFavorite);
  const otherViews = views.filter(v => !v.isFavorite);

  // Toggle favorite
  const handleToggleFavorite = (viewId: string) => {
    const updated = views.map(v =>
      v.id === viewId ? { ...v, isFavorite: !v.isFavorite } : v
    );
    onUpdateViews(updated);
  };

  // Start editing
  const handleStartEdit = (view: View) => {
    setEditingId(view.id);
    setEditName(view.name);
  };

  // Save edit
  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;
    const updated = views.map(v =>
      v.id === editingId ? { ...v, name: editName.trim() } : v
    );
    onUpdateViews(updated);
    setEditingId(null);
    setEditName('');
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  // Delete view
  const handleDelete = (viewId: string) => {
    if (confirm('Are you sure you want to delete this view?')) {
      const updated = views.filter(v => v.id !== viewId);
      onUpdateViews(updated);
    }
  };

  // Duplicate view
  const handleDuplicate = (view: View) => {
    const newView: View = {
      ...view,
      id: `view-${Date.now()}`,
      name: `${view.name} - Copy`,
      isFavorite: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateViews([...views, newView]);
  };

  const handleCreateNew = () => {
    onCreateNewView?.();
  };

  const handleShare = (shareLevel: ShareLevel, details: ShareDetails) => {
    if (!viewToShare) return;
    
    // Update view with sharing information
    const updated = views.map(v =>
      v.id === viewToShare.id
        ? {
            ...v,
            shareLevel,
            sharedWith: details
          }
        : v
    );
    onUpdateViews(updated);
    
    setShareDialogOpen(false);
    setViewToShare(null);
  };

  const handleOpenShare = (view: View) => {
    setViewToShare(view);
    setShareDialogOpen(true);
  };

  const renderViewRow = (view: View) => {
    const chip = getShareChip(view);
    const isPinned = view.isFavorite;
    if (editingId === view.id) {
      return (
        <div key={view.id} className="flex items-center gap-3 px-2 py-2 rounded">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            autoFocus
            className="flex-1 h-9 rounded-md border-[#E4E4E7]"
          />
          <Button size="sm" onClick={handleSaveEdit} className="h-9">Save</Button>
          <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-9 border-[#E4E4E7]">Cancel</Button>
        </div>
      );
    }
    return (
      <div
        key={view.id}
        className="flex items-center gap-3 px-2 py-2 rounded hover:bg-[#F4F4F5] transition-colors"
      >
        <button
          type="button"
          onClick={() => handleToggleFavorite(view.id)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-[#F4F4F5]"
          aria-label={isPinned ? 'Unpin' : 'Pin'}
        >
          <Pin
            className={cn('h-4 w-4', isPinned ? 'fill-[#09090B] text-[#09090B]' : 'text-[#71717A]')}
          />
        </button>
        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <span className="text-[#18181B] text-sm font-semibold leading-5 truncate">{view.name}</span>
          <span className={cn('inline-flex h-[22px] items-center justify-center rounded-lg px-3 py-0.5 text-xs font-semibold leading-4 w-fit', chip.className)}>
            {chip.label}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => handleStartEdit(view)}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[#F4F4F5] text-[#18181B]"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDuplicate(view)}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[#F4F4F5] text-[#18181B]"
            aria-label="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenShare(view)}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[#F4F4F5] text-[#18181B]"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(view.id)}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[#FEF2F2] text-[#EF4444]"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'flex max-h-[90vh] w-full max-w-[420px] flex-col gap-4 overflow-hidden rounded-2xl border-[#E4E4E7] p-6',
          'shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(16,24,40,0.10)]'
        )}
      >
        <DialogHeader className="gap-0">
          <DialogTitle className="text-[#09090B] text-lg font-semibold leading-7">
            Manage Views
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
          {/* Favorites */}
          <div className="flex flex-col gap-2">
            <div className="text-[#3F3F46] text-sm font-semibold leading-5">
              Favorites ({favoriteViews.length})
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-[#E4E4E7] p-1">
              {favoriteViews.length === 0 ? (
                <p className="px-2 py-3 text-sm text-[#71717A]">No favorites</p>
              ) : (
                favoriteViews.map(renderViewRow)
              )}
            </div>
          </div>

          <div className="h-px shrink-0 bg-[#E4E4E7]" />

          {/* Other views */}
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
            <div className="text-[#3F3F46] text-sm font-semibold leading-5">
              Other views ({otherViews.length})
            </div>
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto rounded-lg border border-[#E4E4E7] p-1">
              {otherViews.map(renderViewRow)}
              <div className="h-px shrink-0 bg-[#E4E4E7]" />
              <button
                type="button"
                onClick={handleCreateNew}
                className="flex h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-[#312C29] text-sm font-medium leading-5 hover:bg-[#F4F4F5]"
              >
                <Plus className="h-4 w-4 text-[#09090B]" />
                Create view
              </button>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-[#E4E4E7] pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-lg border-[#E4E4E7] px-4 text-[#312C29] text-sm font-medium leading-5"
          >
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Share View Dialog */}
      {viewToShare && (
        <ShareViewDialog
          open={shareDialogOpen}
          onClose={() => {
            setShareDialogOpen(false);
            setViewToShare(null);
          }}
          view={viewToShare}
          onShare={handleShare}
        />
      )}
    </Dialog>
  );
}
