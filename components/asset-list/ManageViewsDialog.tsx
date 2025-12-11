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
import { Label } from '@/components/ui/label';
import { Star, Edit, Trash2, Plus, Copy, Share2, Download, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import ShareViewDialog from './ShareViewDialog';
import type { View } from '@/lib/types/asset-list';
import type { ShareLevel, ShareDetails } from './ShareViewDialog';

interface ManageViewsDialogProps {
  open: boolean;
  onClose: () => void;
  views: View[];
  onUpdateViews: (views: View[]) => void;
  onCreateNewView?: () => void; // НОВИЙ: callback для відкриття CreateViewDialog
}

export default function ManageViewsDialog({
  open,
  onClose,
  views,
  onUpdateViews,
  onCreateNewView
}: ManageViewsDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [selectedViews, setSelectedViews] = useState<string[]>([]);
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

  // Create new view
  const handleCreateNew = () => {
    if (onCreateNewView) {
      onCreateNewView();
    }
  };

  // Bulk actions
  const handleSelectAll = (checked: boolean) => {
    setSelectedViews(checked ? views.map(v => v.id) : []);
  };

  const handleSelectView = (viewId: string, checked: boolean) => {
    setSelectedViews(prev =>
      checked ? [...prev, viewId] : prev.filter(id => id !== viewId)
    );
  };

  const handleBulkShare = () => {
    if (selectedViews.length === 0) return;
    // For bulk share, use first selected view as template
    const firstView = views.find(v => v.id === selectedViews[0]);
    if (firstView) {
      setViewToShare(firstView);
      setShareDialogOpen(true);
    }
  };

  const handleBulkDelete = () => {
    if (selectedViews.length === 0) return;
    if (confirm(`Delete ${selectedViews.length} view(s)?`)) {
      const updated = views.filter(v => !selectedViews.includes(v.id));
      onUpdateViews(updated);
      setSelectedViews([]);
    }
  };

  const handleBulkDuplicate = () => {
    if (selectedViews.length === 0) return;
    const viewsToDuplicate = views.filter(v => selectedViews.includes(v.id));
    const duplicated = viewsToDuplicate.map(view => ({
      ...view,
      id: `view-${Date.now()}-${Math.random()}`,
      name: `${view.name} - Copy`,
      isFavorite: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }));
    onUpdateViews([...views, ...duplicated]);
    setSelectedViews([]);
  };

  const handleShare = (shareLevel: ShareLevel, details: ShareDetails) => {
    // TODO: Implement sharing logic
    console.log('Sharing view:', viewToShare?.name, shareLevel, details);
    setShareDialogOpen(false);
    setViewToShare(null);
  };

  const handleOpenShare = (view: View) => {
    setViewToShare(view);
    setShareDialogOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Views</DialogTitle>
        </DialogHeader>

        {/* Bulk Actions Bar */}
        {selectedViews.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border-b border-blue-200">
            <span className="text-sm font-medium text-blue-900">
              {selectedViews.length} view{selectedViews.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Bulk Actions
                    <MoreVertical className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleBulkShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share...
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBulkDuplicate}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => console.log('Export')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleBulkDelete} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedViews([])}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-6 p-4">
          {/* Select All */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <Checkbox
              checked={selectedViews.length === views.length && views.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label className="text-sm font-medium">Select All</Label>
          </div>

          {/* Favorites Section */}
          {favoriteViews.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                Favorites ({favoriteViews.length})
              </h3>
              <div className="space-y-2 border rounded-md p-2">
                {favoriteViews.map((view) => (
                  <div
                    key={view.id}
                    className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded"
                  >
                    {editingId === view.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                          className="flex-1"
                        />
                        <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox
                            checked={selectedViews.includes(view.id)}
                            onCheckedChange={(checked) => handleSelectView(view.id, checked as boolean)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Star
                            className="h-4 w-4 fill-yellow-400 text-yellow-400 cursor-pointer"
                            onClick={() => handleToggleFavorite(view.id)}
                          />
                          <span className="text-sm">{view.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenShare(view)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(view)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(view)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(view.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Views Section */}
          <div>
            <h3 className="text-sm font-medium text-neutral-700 mb-2">
              All Views ({views.length})
            </h3>
            <div className="space-y-2 border rounded-md p-2">
              {otherViews.map((view) => (
                <div
                  key={view.id}
                  className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded"
                >
                  {editingId === view.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        <Checkbox
                          checked={selectedViews.includes(view.id)}
                          onCheckedChange={(checked) => handleSelectView(view.id, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Star
                          className="h-4 w-4 text-neutral-400 cursor-pointer hover:text-yellow-400"
                          onClick={() => handleToggleFavorite(view.id)}
                        />
                        <span className="text-sm">{view.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenShare(view)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(view)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(view)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(view.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Create New Button */}
          <div>
            <Button onClick={handleCreateNew} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create New View
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
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
