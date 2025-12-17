'use client';

import { X, Bookmark, Filter as FilterIcon } from 'lucide-react';
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

  // Форматування деталей Filter Set для tooltip
  const formatGroupDetails = (group: GroupFilterState['groups'][0]): string => {
    if (!group.conditions || group.conditions.length === 0) {
      return 'No filters in this set';
    }
    return group.conditions
      .map((cond) => {
        const fieldLabel = getFieldLabel(cond.field);
        const opSymbol = getOperatorSymbol(cond.operator);
        return `${fieldLabel} ${opSymbol} "${String(cond.value)}"`;
      })
      .join(' AND ');
  };

  // SIMPLE MODE: окремі chipʼи для кожної умови
  if (mode === 'simple') {
    const allFilters = [
      ...simpleFilters.map((f) => ({ ...f, isFromView: true })),
      ...temporaryFilters.map((f) => ({ ...f, isFromView: false })),
    ];

    if (allFilters.length === 0) return null;

    const visibleFilters = allFilters.slice(0, maxVisibleSimple);
    const hiddenCount = Math.max(0, allFilters.length - maxVisibleSimple);

    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-200">
        <span className="inline-flex items-center gap-1 text-sm text-neutral-700 font-medium">
          <FilterIcon className="w-4 h-4 text-orange-500" />
          Filters:
        </span>

        {visibleFilters.map((filter) => (
          <Badge
            key={filter.id}
            variant="secondary"
            className={
              filter.isFromView
                ? 'gap-2 pl-3 pr-2 py-1.5 bg-blue-50 border border-blue-200 hover:border-blue-300 transition-colors'
                : 'gap-2 pl-3 pr-2 py-1.5 bg-white border border-neutral-200 hover:border-neutral-300 transition-colors'
            }
          >
            {filter.isFromView && (
              <Bookmark className="w-3 h-3 text-blue-600" />
            )}
            <span className="text-xs">
              <span className="font-medium">{getFieldLabel(filter.field)}</span>{' '}
              <span className="text-neutral-400">
                {getOperatorSymbol(filter.operator)}
              </span>{' '}
              <span className="text-neutral-700">
                &quot;{String(filter.value)}&quot;
              </span>
              {filter.isFromView && (
                <span className="text-blue-600 ml-1" title="Saved in view">
                  (view)
                </span>
              )}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (filter.isFromView && onRemoveSimpleFilter) {
                  onRemoveSimpleFilter(filter.id);
                } else {
                  onRemoveTemporaryFilter(filter.id);
                }
              }}
              className="hover:bg-neutral-100 rounded-sm p-0.5 transition-colors ml-1"
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

  // GROUPS MODE: chip на групу + OR між chipʼами
  if (mode === 'groups' && groupFilters && groupFilters.groups.length > 0) {
    const groups = groupFilters.groups;

    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-200 flex-wrap">
        <span className="inline-flex items-center gap-1 text-sm text-neutral-700 font-medium">
          <FilterIcon className="w-4 h-4 text-orange-500" />
          Filter sets:
        </span>

        {groups.map((group, index) => {
          const groupDetails = formatGroupDetails(group);
          return (
            <div key={group.id} className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="gap-2 pl-3 pr-2 py-1.5 bg-blue-50 border border-blue-200 hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={onOpenViewSettings}
                  >
                    <span className="text-xs font-medium">
                      {group.name || `Filter Set ${index + 1}`}:{' '}
                      {group.conditions.length} filter
                      {group.conditions.length === 1 ? '' : 's'}
                    </span>
                    {onRemoveGroupFilter && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveGroupFilter(group.id);
                        }}
                        className="hover:bg-blue-100 rounded-sm p-0.5 transition-colors ml-1"
                        aria-label={`Remove filter set ${group.name || index + 1}`}
                      >
                        <X className="w-3 h-3 text-blue-600" />
                      </button>
                    )}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-md">
                  <div className="text-xs space-y-1">
                    <div className="font-semibold mb-1">
                      {group.name || `Filter Set ${index + 1}`}
                    </div>
                    <div className="text-neutral-300">{groupDetails}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
              {index < groups.length - 1 && (
                <span className="text-[11px] text-neutral-600 font-semibold px-1">
                  OR
                </span>
              )}
            </div>
          );
        })}

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

  // ADVANCED MODE: один summary chip + preview в тултіпі
  if (mode === 'advanced' && advancedFilters && advancedFilters.groups.length > 0) {
    const totalConditions = advancedFilters.groups.reduce(
      (sum, g) => sum + (g.conditions?.length || 0),
      0
    );
    const preview = buildAdvancedFilterPreview(advancedFilters);

    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-200">
        <span className="inline-flex items-center gap-1 text-sm text-neutral-700 font-medium">
          <FilterIcon className="w-4 h-4 text-orange-500" />
          Advanced filter:
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="gap-2 pl-3 pr-2 py-1.5 bg-purple-50 border border-purple-200 hover:border-purple-300 transition-colors cursor-pointer max-w-[320px] truncate"
              onClick={onOpenViewSettings}
            >
              <span className="text-xs font-medium text-purple-900 truncate">
                Complex filter: {totalConditions} condition
                {totalConditions === 1 ? '' : 's'}
              </span>
              {onRemoveAdvancedFilter && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveAdvancedFilter();
                  }}
                  className="hover:bg-purple-100 rounded-sm p-0.5 transition-colors ml-1"
                  aria-label="Remove advanced filter"
                >
                  <X className="w-3 h-3 text-purple-600" />
                </button>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-lg">
            <pre className="text-xs whitespace-pre-wrap text-neutral-100">
              {preview}
            </pre>
          </TooltipContent>
        </Tooltip>

        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenViewSettings}
          className="ml-auto h-7 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-100"
        >
          Edit →
        </Button>
      </div>
    );
  }

  // fallback
  return null;
}
