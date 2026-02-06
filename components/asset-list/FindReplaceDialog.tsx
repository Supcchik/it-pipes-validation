'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
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
import { cn } from '@/lib/utils';
import type { Asset, ColumnDef } from '@/lib/types/asset-list';

export interface ReplaceOperation {
  field: string;
  findValue: string;
  replaceValue: string;
  scope: 'selection' | 'entireView' | 'project';
  matchedAssetIds: string[];
}

interface FindReplaceDialogProps {
  open: boolean;
  onClose: () => void;
  columns: ColumnDef[];
  assets: Asset[];
  selectedAssetIds: string[];
  filteredAssets?: Asset[]; // Assets after filters applied (for "Entire view" scope)
  onReplace: (updates: ReplaceOperation) => void;
}

export default function FindReplaceDialog({
  open,
  onClose,
  columns,
  assets,
  selectedAssetIds,
  filteredAssets,
  onReplace
}: FindReplaceDialogProps) {
  const [field, setField] = useState('');
  const [operator, setOperator] = useState<'equals' | 'contains'>('contains');
  const [findValue, setFindValue] = useState('');
  const [replaceValue, setReplaceValue] = useState('');
  const [scope, setScope] = useState<'selection' | 'entireView' | 'project'>('selection');

  // Calculate matches
  const matchedAssets = useMemo(() => {
    if (!field || !findValue) return [];

    // Determine which assets to search based on scope
    let assetsToSearch: Asset[];
    if (scope === 'selection') {
      assetsToSearch = assets.filter(a => selectedAssetIds.includes(a.id));
    } else if (scope === 'entireView') {
      // Use filtered assets (after filters applied) or fallback to all assets
      assetsToSearch = filteredAssets || assets;
    } else {
      // 'project' scope - all assets
      assetsToSearch = assets;
    }

    return assetsToSearch.filter(asset => {
      // Get value based on field - only asset fields for now
      const value = String((asset as unknown as Record<string, unknown>)[field] || '');
      
      if (operator === 'equals') {
        return value.toLowerCase() === findValue.toLowerCase();
      } else {
        return value.toLowerCase().includes(findValue.toLowerCase());
      }
    });
  }, [assets, filteredAssets, field, operator, findValue, scope, selectedAssetIds]);

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

  // Get editable columns (exclude IDs, computed fields, non-asset fields)
  const editableColumns = columns.filter(col =>
    col.table === 'asset' &&
    col.field !== 'id' &&
    col.field !== 'pipeSegment' &&
    col.type !== 'date'
  );

  const viewCount = (filteredAssets || assets).length;
  const canReplace = matchedAssets.length > 0 && !!replaceValue;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl w-full min-w-[680px] p-6 gap-4 rounded-2xl border border-[#E4E4E7] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(16,24,40,0.10)] overflow-hidden flex flex-col"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        <DialogTitle className="text-[18px] font-semibold leading-7 text-[#09090B] m-0">
          Find & Replace
        </DialogTitle>

        <div className="flex flex-col gap-4">
          {/* Find */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold leading-5 text-[#3F3F46]">
                Find
              </span>
              <div className="flex flex-wrap items-stretch gap-2">
                <Select value={field} onValueChange={setField}>
                  <SelectTrigger className="flex-1 min-h-9 h-9 px-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white text-sm font-normal text-[#71717A] placeholder:text-[#71717A] [&>span]:text-[#71717A] data-[state=open]:text-[#18181B]">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {editableColumns.map(col => (
                      <SelectItem key={col.id} value={col.field}>
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={operator}
                  onValueChange={(val: 'equals' | 'contains') => setOperator(val)}
                >
                  <SelectTrigger className="w-[140px] min-h-9 h-9 px-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="equals">Equals</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={findValue}
                  onChange={(e) => setFindValue(e.target.value)}
                  placeholder="Value"
                  className="w-[140px] min-h-9 h-9 px-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white text-sm text-[#18181B] placeholder:text-[#71717A]"
                />
              </div>
            </div>
          </div>

          {/* Replace with */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold leading-5 text-[#3F3F46]">
              Replace with
            </span>
            <Input
              value={replaceValue}
              onChange={(e) => setReplaceValue(e.target.value)}
              placeholder="Value"
              disabled={!field || !findValue}
              className="flex-1 min-h-9 h-9 px-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white text-sm text-[#18181B] placeholder:text-[#71717A] disabled:opacity-50"
            />
          </div>

          {/* Divider */}
          <div className="h-px self-stretch bg-[#E4E4E7]" />

          {/* Replace in */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold leading-5 text-[#3F3F46]">
              Replace in
            </span>
            <div className="flex flex-nowrap items-center gap-1 py-1">
              <button
                type="button"
                onClick={() => setScope('selection')}
                className={cn(
                  'h-10 px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap shrink-0',
                  scope === 'selection'
                    ? 'bg-[#FFEDD5] border-[#E86F25] text-[#E86F25] font-semibold'
                    : 'bg-white border-[#E4E4E7] text-[#18181B] font-medium hover:bg-neutral-50'
                )}
              >
                Selected rows ({selectedAssetIds.length})
              </button>
              <button
                type="button"
                onClick={() => setScope('entireView')}
                className={cn(
                  'h-10 px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap shrink-0',
                  scope === 'entireView'
                    ? 'bg-[#FFEDD5] border-[#E86F25] text-[#E86F25] font-semibold'
                    : 'bg-white border-[#E4E4E7] text-[#18181B] font-medium hover:bg-neutral-50'
                )}
              >
                Entire view ({viewCount} in view)
              </button>
              <button
                type="button"
                onClick={() => setScope('project')}
                className={cn(
                  'h-10 px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap shrink-0',
                  scope === 'project'
                    ? 'bg-[#FFEDD5] border-[#E86F25] text-[#E86F25] font-semibold'
                    : 'bg-white border-[#E4E4E7] text-[#18181B] font-medium hover:bg-neutral-50'
                )}
              >
                Project ({assets.length} in project)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-start gap-2 pt-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 px-4 py-2 rounded-lg border border-[#E4E4E7] text-sm font-medium text-[#312C29] hover:bg-neutral-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReplace}
            disabled={!canReplace}
            className="h-10 px-4 py-2 rounded-lg bg-[#E86F25] text-sm font-medium text-[#FAFAFA] hover:bg-[#d65a1a] disabled:opacity-50"
          >
            Replace
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

