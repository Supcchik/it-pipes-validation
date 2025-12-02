'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FilterConfig } from '@/lib/types/asset-list';
import { mockColumnDefs } from '@/lib/mock-data/asset-list';

interface ActiveFiltersBarProps {
  filters: FilterConfig[];
  onRemoveFilter: (filterId: string) => void;
  onOpenViewSettings: () => void;
  maxVisible?: number; // default 3
}

export default function ActiveFiltersBar({
  filters,
  onRemoveFilter,
  onOpenViewSettings,
  maxVisible = 3
}: ActiveFiltersBarProps) {
  if (filters.length === 0) return null;

  const visibleFilters = filters.slice(0, maxVisible);
  const hiddenCount = Math.max(0, filters.length - maxVisible);

  const getOperatorSymbol = (operator: string) => {
    switch (operator) {
      case 'equals': return '=';
      case 'contains': return '⊃';
      case 'startsWith': return '⊂';
      case 'greaterThan': return '>';
      case 'lessThan': return '<';
      default: return operator;
    }
  };

  const getFieldLabel = (fieldId: string): string => {
    const column = mockColumnDefs.find(col => col.field === fieldId);
    return column?.label || fieldId;
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-200">
      <span className="text-sm text-neutral-700 font-medium">Filters:</span>
      
      {visibleFilters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className="gap-2 pl-3 pr-2 py-1.5 bg-white border border-neutral-200 hover:border-neutral-300 transition-colors"
        >
          <span className="text-xs">
            <span className="font-medium">{getFieldLabel(filter.field)}</span>
            {' '}
            <span className="text-neutral-400">{getOperatorSymbol(filter.operator)}</span>
            {' '}
            <span className="text-neutral-700">&quot;{String(filter.value)}&quot;</span>
          </span>
          <button
            onClick={() => onRemoveFilter(filter.id)}
            className="hover:bg-neutral-100 rounded-sm p-0.5 transition-colors"
            aria-label={`Remove filter ${filter.field}`}
          >
            <X className="w-3 h-3 text-neutral-500" />
          </button>
        </Badge>
      ))}

      {hiddenCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenViewSettings}
          className="h-7 text-xs"
        >
          +{hiddenCount} more
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenViewSettings}
        className="ml-auto h-7 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-100"
      >
        View all →
      </Button>
    </div>
  );
}
