'use client';

import { useState } from 'react';
import { MoreVertical, Eye, Edit, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableHead } from '@/components/ui/table';
import type { Asset } from '@/lib/types/asset-list';

interface ActionsColumnProps {
  asset: Asset;
  isEditing?: boolean;
  onViewDetails: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDuplicate: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export function ActionsColumnHeader() {
  return (
    <TableHead
      className="sticky right-0 z-20 w-[60px] bg-white border-l border-neutral-200 shadow-[inset_4px_0_6px_-2px_rgba(0,0,0,0.05)] px-2"
      scope="col"
      aria-label="Actions"
    >
      <div className="w-full h-full" />
    </TableHead>
  );
}

export function ActionsColumnCell({
  asset,
  isEditing = false,
  onViewDetails,
  onEdit,
  onDuplicate,
  onDelete,
  onSave,
  onCancel,
}: ActionsColumnProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (isEditing) {
    // During editing, show save/cancel buttons (will be handled by parent)
    return null;
  }

  return (
    <TableCell
      className="sticky right-0 z-10 w-[60px] bg-white border-l border-neutral-200 shadow-[inset_4px_0_6px_-2px_rgba(0,0,0,0.05)] px-2"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-center w-full">
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-neutral-100"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Actions for ${asset.pipeSegment || asset.id}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onViewDetails(asset);
                setDropdownOpen(false);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(asset);
                setDropdownOpen(false);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDuplicate(asset);
                setDropdownOpen(false);
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(asset);
                setDropdownOpen(false);
              }}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TableCell>
  );
}

