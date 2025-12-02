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

export interface ReplaceOperation {
  field: string;
  findValue: string;
  replaceValue: string;
  scope: 'selection' | 'project';
  matchedAssetIds: string[];
}

interface FindReplaceDialogProps {
  open: boolean;
  onClose: () => void;
  columns: ColumnDef[];
  assets: Asset[];
  selectedAssetIds: string[];
  onReplace: (updates: ReplaceOperation) => void;
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
      // Get value based on field - only asset fields for now
      const value = String((asset as unknown as Record<string, unknown>)[field] || '');
      
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

  // Get editable columns (exclude IDs, computed fields, non-asset fields)
  const editableColumns = columns.filter(col => 
    col.table === 'asset' &&
    col.field !== 'id' && 
    col.field !== 'pipeSegment' && // Key field
    col.type !== 'date' // Dates need special handling
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
                onValueChange={(val: 'equals' | 'contains') => setOperator(val)}
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
            
            <RadioGroup value={scope} onValueChange={(val: 'selection' | 'project') => setScope(val)}>
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

