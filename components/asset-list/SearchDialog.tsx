'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import type { ColumnDef } from '@/lib/types/asset-list';

export interface SearchQuery {
  table: 'asset' | 'inspection' | 'observation';
  field: string;
  operator: 'is' | 'isNot' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  value: string;
}

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  columns: ColumnDef[];
  onSearch: (query: SearchQuery) => void;
}

function getOperatorsForType(type: string) {
  switch (type) {
    case 'text':
      return [
        { value: 'is', label: 'Is' },
        { value: 'isNot', label: 'Is Not' },
        { value: 'contains', label: 'Contains' },
        { value: 'startsWith', label: 'Starts With' },
        { value: 'endsWith', label: 'Ends With' },
      ];
    case 'number':
      return [
        { value: 'is', label: 'Is' },
        { value: 'isNot', label: 'Is Not' },
        { value: 'greaterThan', label: 'Greater Than' },
        { value: 'lessThan', label: 'Less Than' },
      ];
    case 'date':
      return [
        { value: 'is', label: 'On Date' },
        { value: 'greaterThan', label: 'After' },
        { value: 'lessThan', label: 'Before' },
      ];
    default:
      return [
        { value: 'is', label: 'Is' },
        { value: 'isNot', label: 'Is Not' },
      ];
  }
}

export default function SearchDialog({
  open,
  onClose,
  columns,
  onSearch
}: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    table: 'asset',
    field: 'pipeSegment',
    operator: 'contains',
    value: ''
  });
  const [recentSearches, setRecentSearches] = useState<SearchQuery[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('asset-list-recent-searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Get columns for selected table
  const tableColumns = columns.filter(col => col.table === searchQuery.table);

  // Get operators based on field type
  const selectedColumn = columns.find(col => col.field === searchQuery.field && col.table === searchQuery.table);
  const operators = getOperatorsForType(selectedColumn?.type || 'text');

  // Reset field when table changes
  useEffect(() => {
    if (tableColumns.length > 0 && !tableColumns.find(col => col.field === searchQuery.field)) {
      setSearchQuery(prev => ({
        ...prev,
        field: tableColumns[0].field,
        operator: 'contains'
      }));
    }
  }, [searchQuery.table, tableColumns]);

  const handleSearch = () => {
    if (!searchQuery.field || !searchQuery.value.trim()) return;

    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => 
      !(s.table === searchQuery.table && s.field === searchQuery.field && s.value === searchQuery.value)
    )].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('asset-list-recent-searches', JSON.stringify(updated));

    // Execute search
    onSearch(searchQuery);
    onClose();
  };

  const handleClear = () => {
    setSearchQuery({
      table: 'asset',
      field: tableColumns.length > 0 ? tableColumns[0].field : '',
      operator: 'contains',
      value: ''
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex-wrap">
            {/* Table Selector */}
            <Select
              value={searchQuery.table}
              onValueChange={(value: 'asset' | 'inspection' | 'observation') => {
                const newTableColumns = columns.filter(col => col.table === value);
                setSearchQuery(prev => ({
                  ...prev,
                  table: value,
                  field: newTableColumns.length > 0 ? newTableColumns[0].field : '',
                  operator: 'contains'
                }));
              }}
            >
              <SelectTrigger className="w-40 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">Asset</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="observation">Observation</SelectItem>
              </SelectContent>
            </Select>

            {/* Field Selector */}
            <Select
              value={searchQuery.field}
              onValueChange={(value) => {
                const col = columns.find(c => c.field === value && c.table === searchQuery.table);
                const newOperators = getOperatorsForType(col?.type || 'text');
                setSearchQuery(prev => ({
                  ...prev,
                  field: value,
                  operator: (newOperators.find(op => op.value === prev.operator) 
                    ? prev.operator 
                    : newOperators[0]?.value || 'contains') as SearchQuery['operator']
                }));
              }}
            >
              <SelectTrigger className="flex-1 bg-white min-w-[180px]">
                <SelectValue placeholder="Select field..." />
              </SelectTrigger>
              <SelectContent>
                {tableColumns.map(col => (
                  <SelectItem key={col.id} value={col.field}>
                    {col.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Operator Selector */}
            <Select
              value={searchQuery.operator}
              onValueChange={(value: SearchQuery['operator']) => {
                setSearchQuery(prev => ({ ...prev, operator: value }));
              }}
            >
              <SelectTrigger className="w-40 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map(op => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Value Input */}
            <Input
              value={searchQuery.value}
              onChange={(e) => {
                setSearchQuery(prev => ({ ...prev, value: e.target.value }));
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter value..."
              className="flex-1 bg-white min-w-[200px]"
              autoFocus
            />

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={!searchQuery.field || !searchQuery.value.trim()}
              size="icon"
              className="flex-shrink-0"
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Clear Button */}
            <Button
              onClick={handleClear}
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-neutral-700">Recent Searches</h4>
              <div className="space-y-1">
                {recentSearches.map((search, index) => {
                  const col = columns.find(c => c.field === search.field && c.table === search.table);
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(search);
                        handleSearch();
                      }}
                      className="w-full text-left text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 p-2 rounded"
                    >
                      <span className="font-medium">{col?.label || search.field}</span>
                      {' '}
                      <span className="text-neutral-500">
                        {search.operator} &quot;{search.value}&quot;
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <span className="text-lg">💡</span>
            <p className="text-sm text-blue-900 flex-1">
              <strong>Tip:</strong> Use advanced search to find specific assets based on field values. 
              Results will be highlighted in the table.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSearch}
            disabled={!searchQuery.field || !searchQuery.value.trim()}
          >
            Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
