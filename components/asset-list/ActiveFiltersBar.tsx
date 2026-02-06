'use client';

import { X, Bookmark, Filter as FilterIcon, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type {
  FilterConfig,
  GroupFilterState,
  AdvancedFilterState,
  FilterMode,
} from '@/lib/types/asset-list';
import { mockColumnDefs } from '@/lib/mock-data/asset-list';
import { buildAdvancedFilterPreview } from '@/lib/utils/filter-utils';

interface ActiveFiltersBarProps {
  filterMode: FilterMode | undefined;
  simpleFilters: FilterConfig[]; // from simpleFilters.conditions / legacy
  groupFilters?: GroupFilterState | null;
  advancedFilters?: AdvancedFilterState | null;
  temporaryFilters: FilterConfig[]; // Temporary filters (not saved)
  onRemoveTemporaryFilter: (filterId: string) => void;
  onRemoveSimpleFilter?: (filterId: string) => void; // НОВИЙ: для видалення збережених Simple фільтрів
  onRemoveGroupFilter?: (groupId: string) => void; // НОВИЙ: для видалення Filter Set
  onRemoveAdvancedFilter?: () => void; // НОВИЙ: для видалення Advanced фільтра
  onOpenViewSettings: () => void;
  onClearAll?: () => void; // Очистити всі фільтри (simple + temporary)
  maxVisibleSimple?: number; // default 3
}

export default function ActiveFiltersBar({
  filterMode,
  simpleFilters,
  groupFilters,
  advancedFilters,
  temporaryFilters,
  onRemoveTemporaryFilter,
  onRemoveSimpleFilter,
  onRemoveGroupFilter,
  onRemoveAdvancedFilter,
  onOpenViewSettings,
  onClearAll,
  maxVisibleSimple = 3,
}: ActiveFiltersBarProps) {
  const mode: FilterMode = filterMode || 'simple';

  const hasAny =
    (simpleFilters && simpleFilters.length > 0) ||
    (groupFilters && groupFilters.groups && groupFilters.groups.length > 0) ||
    (advancedFilters && advancedFilters.groups && advancedFilters.groups.length > 0) ||
    temporaryFilters.length > 0;

  if (!hasAny) return null;

  const getOperatorSymbol = (operator: string) => {
    switch (operator) {
      case 'equals':
        return '=';
      case 'contains':
        return '⊃';
      case 'startsWith':
        return '⊂';
      case 'greaterThan':
        return '>';
      case 'lessThan':
        return '<';
      default:
        return operator;
    }
  };

  const getFieldLabel = (fieldId: string): string => {
    const column = mockColumnDefs.find((col) => col.field === fieldId);
    return column?.label || fieldId;
  };

  /** Підпис оператора для відображення (читається як речення). Spec: is, contains, greater than, less than. */
  const getOperatorLabel = (operator: FilterConfig['operator']): string => {
    switch (operator) {
      case 'equals':
        return 'is';
      case 'contains':
        return 'contains';
      case 'startsWith':
        return 'starts with';
      case 'greaterThan':
        return 'greater than';
      case 'lessThan':
        return 'less than';
      default:
        return String(operator);
    }
  };

  // SIMPLE MODE: пілюлі за макетом (фон #F3E8FF, оператор #A855F7)
  if (mode === 'simple') {
    const allFilters = [
      ...simpleFilters.map((f) => ({ ...f, isFromView: true })),
      ...temporaryFilters.map((f) => ({ ...f, isFromView: false })),
    ];

    if (allFilters.length === 0) return null;

    const visibleFilters = allFilters.slice(0, maxVisibleSimple);
    const hiddenCount = Math.max(0, allFilters.length - maxVisibleSimple);

    return (
      <div className="flex items-center justify-between px-6 py-2 border-b border-[#E4E4E7] bg-white">
        <div className="flex items-center gap-4 flex-wrap">
          {visibleFilters.map((filter) => (
            <div
              key={filter.id}
              className="h-6 px-3 py-0.5 rounded-full bg-[#F3E8FF] flex items-center justify-center gap-2"
            >
              <div className="flex items-center gap-1">
                <span className="text-[#18181B] text-xs font-medium">
                  {getFieldLabel(filter.field)}
                </span>
                <span className="text-[#A855F7] text-xs font-medium">
                  {getOperatorLabel(filter.operator)}
                </span>
                {filter.value !== undefined && filter.value !== '' && (
                  <span className="text-[#18181B] text-xs font-medium">
                    &quot;{String(filter.value)}&quot;
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (filter.isFromView && onRemoveSimpleFilter) {
                    onRemoveSimpleFilter(filter.id);
                  } else {
                    onRemoveTemporaryFilter(filter.id);
                  }
                }}
                className="flex items-center justify-center w-4 h-4 rounded hover:bg-[#E9D5FF] transition-colors text-[#71717A]"
                aria-label={`Remove filter ${filter.field}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {hiddenCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenViewSettings}
              className="h-7 text-xs text-[#312C29]"
            >
              +{hiddenCount} more
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onClearAll) onClearAll();
              else {
                temporaryFilters.forEach((f) => onRemoveTemporaryFilter(f.id));
                simpleFilters.forEach((f) => onRemoveSimpleFilter?.(f.id));
              }
            }}
            className="px-2 py-1 rounded-lg gap-2 text-[#312C29] text-sm font-medium hover:bg-neutral-100 h-auto"
            aria-label="Clear all filters"
          >
            <Trash2 className="w-4 h-4" />
            Clear all
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenViewSettings}
          className="px-2 py-1 rounded-lg gap-2 text-[#312C29] text-sm font-medium hover:bg-neutral-100 h-auto"
          aria-label="Edit filters"
        >
          Edit
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // GROUPS MODE: chip на групу + OR між chipʼами
  if (mode === 'groups' && groupFilters && groupFilters.groups.length > 0) {
    const groups = groupFilters.groups;

    return (
      <div className="flex items-center justify-between px-6 py-2 border-b border-[#E4E4E7] bg-white flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1 text-sm text-[#18181B] font-medium">
            <FilterIcon className="w-4 h-4 text-[#A855F7]" />
            Filter sets:
          </span>
          {groups.map((group, index) => (
              <div key={group.id} className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={onOpenViewSettings}
                      onKeyDown={(e) => e.key === 'Enter' && onOpenViewSettings()}
                      className="h-6 px-3 py-0.5 rounded-full bg-[#F3E8FF] flex items-center gap-2 cursor-pointer hover:bg-[#E9D5FF] transition-colors"
                    >
                      <span className="text-xs font-medium text-[#18181B]">
                        {group.name || `Filter Set ${index + 1}`}:{' '}
                        {group.conditions.length} filter
                        {group.conditions.length === 1 ? '' : 's'}
                      </span>
                      {onRemoveGroupFilter && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveGroupFilter(group.id);
                          }}
                          className="flex items-center justify-center w-4 h-4 rounded hover:bg-[#E9D5FF] transition-colors text-[#71717A]"
                          aria-label={`Remove filter set ${group.name || index + 1}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md flex flex-col gap-1">
                    <div className="text-[#18181B] text-sm font-semibold leading-5">
                      {group.name || `Filter Set ${index + 1}`}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {group.conditions?.map((cond, condIndex) => (
                        <div key={cond.id} className="text-sm font-medium leading-5 text-[#18181B]">
                          {condIndex > 0 ? (
                            <span className="text-[#18181B]">and {getFieldLabel(cond.field)} </span>
                          ) : (
                            <span className="text-[#18181B]">{getFieldLabel(cond.field)} </span>
                          )}
                          <span className="text-[#A855F7]">
                            {getOperatorLabel(cond.operator)}
                          </span>
                          <span className="text-[#18181B]"> &quot;{String(cond.value)}&quot;</span>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
                {index < groups.length - 1 && (
                  <span className="text-[11px] text-neutral-600 font-semibold px-1">
                    OR
                  </span>
                )}
              </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenViewSettings}
          className="px-2 py-1 rounded-lg gap-2 text-[#312C29] text-sm font-medium hover:bg-neutral-100 h-auto"
        >
          Edit
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // ADVANCED MODE: один summary chip + preview в тултіпі
  if (mode === 'advanced' && advancedFilters && advancedFilters.groups.length > 0) {
    const totalConditions = advancedFilters.groups.reduce(
      (sum, g) => sum + (g.conditions?.length || 0),
      0
    );
    const preview = buildAdvancedFilterPreview(advancedFilters);

    return (
      <div className="flex items-center justify-between px-6 py-2 border-b border-[#E4E4E7] bg-white">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1 text-sm text-[#18181B] font-medium">
            <FilterIcon className="w-4 h-4 text-[#A855F7]" />
            Advanced filter:
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                role="button"
                tabIndex={0}
                onClick={onOpenViewSettings}
                onKeyDown={(e) => e.key === 'Enter' && onOpenViewSettings()}
                className="h-6 px-3 py-0.5 rounded-full bg-[#F3E8FF] flex items-center gap-2 cursor-pointer hover:bg-[#E9D5FF] transition-colors max-w-[320px] truncate"
              >
                <span className="text-xs font-medium text-[#18181B] truncate">
                  Complex filter: {totalConditions} condition
                  {totalConditions === 1 ? '' : 's'}
                </span>
                {onRemoveAdvancedFilter && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveAdvancedFilter();
                    }}
                    className="flex items-center justify-center w-4 h-4 rounded hover:bg-[#E9D5FF] transition-colors text-[#71717A] shrink-0"
                    aria-label="Remove advanced filter"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-lg">
              <pre className="text-xs whitespace-pre-wrap text-neutral-100">
                {preview}
              </pre>
            </TooltipContent>
          </Tooltip>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenViewSettings}
          className="px-2 py-1 rounded-lg gap-2 text-[#312C29] text-sm font-medium hover:bg-neutral-100 h-auto"
        >
          Edit
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // fallback
  return null;
}
