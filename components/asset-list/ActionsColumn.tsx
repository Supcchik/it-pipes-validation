'use client';

import { useState } from 'react';
import { MoreVertical, Eye, Edit, Copy, Trash2, Save, X, History } from 'lucide-react';
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
  showShadowLeft?: boolean;
  onViewDetails: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDuplicate: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onViewActivity?: (asset: Asset) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

const STICKY_SHADOW_LEFT = '-4px 0 29px 0 rgba(100, 100, 111, 0.2)';

export function ActionsColumnHeader({ showShadowLeft = false }: { showShadowLeft?: boolean }) {
  return (
    <TableHead
      className="sticky right-0 z-20 w-[90px] px-4 py-4 bg-[#FAFAFA] border-b border-[#E4E4E7] border-l border-[#E4E4E7]"
      style={showShadowLeft ? { boxShadow: STICKY_SHADOW_LEFT } : undefined}
      scope="col"
      aria-label="Actions"
    >
      <div className="w-full h-full min-h-[51px]" />
    </TableHead>
  );
}

export function ActionsColumnCell({
  asset,
  isEditing = false,
  showShadowLeft = false,
  onViewDetails,
  onEdit,
  onDuplicate,
  onDelete,
  onViewActivity,
  onSave,
  onCancel,
}: ActionsColumnProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <TableCell
      className="sticky right-0 z-10 w-[90px] p-4 min-h-[72px] bg-white border-l border-[#E4E4E7]"
      style={showShadowLeft ? { boxShadow: STICKY_SHADOW_LEFT } : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-center gap-2 w-full">
        {isEditing ? (
          // Edit mode: Show Save and Cancel buttons
          <>
            {/* Save Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg text-[#312C29] hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onSave) {
                  onSave();
                }
              }}
              aria-label="Save changes"
              title="Save changes"
            >
              <Save className="h-5 w-5" />
            </Button>

            {/* Cancel Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg text-[#312C29] hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onCancel) {
                  onCancel();
                }
              }}
              aria-label="Cancel editing"
              title="Cancel editing"
            >
              <X className="h-5 w-5" />
            </Button>
          </>
        ) : (
          // Normal mode: Show View and More buttons
          <>
            {/* View Details Button - Primary action */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg text-[#312C29] hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onViewDetails(asset);
              }}
              aria-label={`View details for ${asset.pipeSegment || asset.id}`}
              title="View Details"
            >
              <Eye className="h-5 w-5" />
            </Button>

            {/* More Actions Button - Dropdown menu */}
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-lg text-[#312C29] hover:bg-gray-100 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`More actions for ${asset.pipeSegment || asset.id}`}
                  title="More actions"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={4}>
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
                {onViewActivity && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onViewActivity(asset);
                      setDropdownOpen(false);
                    }}
                  >
                    <History className="mr-2 h-4 w-4" />
                    View Activity
                  </DropdownMenuItem>
                )}
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
          </>
        )}
      </div>
    </TableCell>
  );
}

