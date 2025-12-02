'use client';

import { Edit, Trash2, Download, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FloatingSelectionBarProps {
  selectedCount: number;
  selectedIds: string[];
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  onOpenInNewWindow: () => void;
  onClear: () => void;
}

export default function FloatingSelectionBar({
  selectedCount,
  selectedIds,
  onEdit,
  onDelete,
  onExport,
  onOpenInNewWindow,
  onClear
}: FloatingSelectionBarProps) {
  // Don't render if nothing selected
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className="fixed z-50 
                 bg-white border border-neutral-200 rounded-xl shadow-2xl
                 px-6 py-4
                 min-w-fit whitespace-nowrap"
      style={{ 
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        animation: 'fadeInUp 0.3s ease-out forwards'
      }}
    >
      <div className="flex items-center gap-4">
        {/* Selection Count Badge */}
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1">
          ✓ {selectedCount} {selectedCount === 1 ? 'asset' : 'assets'} selected
        </Badge>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="gap-2 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export Selected
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenInNewWindow}
            className="gap-2"
            title="Open each inspection in a new tab"
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Window
          </Button>

          {/* Divider */}
          <div className="h-6 w-px bg-neutral-300 mx-2" />

          {/* Clear Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="gap-2 text-neutral-600"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

