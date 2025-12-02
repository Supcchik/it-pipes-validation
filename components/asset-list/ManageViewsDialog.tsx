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
import { Star, Edit, Trash2, Plus, Copy } from 'lucide-react';
import type { View } from '@/lib/types/asset-list';

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Views</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
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
    </Dialog>
  );
}
