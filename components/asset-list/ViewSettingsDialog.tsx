'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { X, Plus, ChevronDown, ChevronUp, ChevronRight, GripVertical, Hash, Calendar, Text, ListFilter, ToggleLeft, AlertCircle, Check, Info, Search, LayoutGrid, Rows3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type {
  View,
  ColumnDef,
  FilterConfig,
  Asset,
  GroupFilterState,
  SimpleFilterState,
  AdvancedFilterState,
  FilterMode,
} from '@/lib/types/asset-list';
import { mockColumnDefs } from '@/lib/mock-data/asset-list';
import {
  simpleFromLegacy,
  groupsFromSimple,
  simpleFromGroups,
  advancedFromGroups,
  groupsFromAdvanced,
  buildAdvancedFilterPreview,
  buildGroupFilterPreview,
  getFilterFieldsFromView,
} from '@/lib/utils/filter-utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useABTestOptional } from '@/lib/contexts/ab-test-context';
import { useDisplayDensityOptional } from '@/lib/contexts/display-density-context';
import { cn } from '@/lib/utils';
import FilterGroupsEditor from './FilterGroupsEditor';
import AdvancedFiltersEditor from './AdvancedFiltersEditor';

/** Рендер превʼю фільтра з підсвіченими операторами (is, and, or, contains тощо) у тултіпі. */
function SavedFilterPreviewText({ text }: { text: string }) {
  const operatorRegex = /(\b(?:is|and|or|not|contains)\b|starts with|greater than|less than)/gi;

  return (
    <div className="flex flex-col gap-0.5 text-sm leading-relaxed text-[#18181B]">
      {text.split('\n').map((line, lineIdx) => {
        if (line.trim() === '') return <div key={lineIdx} className="h-1" />;
        const parts: (string | React.ReactNode)[] = [];
        let lastIndex = 0;
        let m;
        const re = new RegExp(operatorRegex.source, 'gi');
        while ((m = re.exec(line)) !== null) {
          if (m.index > lastIndex) parts.push(line.slice(lastIndex, m.index));
          parts.push(
            <span key={`${lineIdx}-${m.index}`} className="text-[#7c3aed] font-medium">
              {m[0]}
            </span>
          );
          lastIndex = re.lastIndex;
        }
        if (lastIndex < line.length) parts.push(line.slice(lastIndex));
        return (
          <div key={lineIdx}>
            {parts}
          </div>
        );
      })}
    </div>
  );
}

interface ViewSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  currentView: View;
  onSave: (view: View) => void;
  assets?: Asset[]; // For preview count
  defaultTab?: 'columns' | 'filters'; // НОВИЙ: Встановити початкову вкладку
  /** Variant A: колонки, додані через filter notification — показувати індикатор "added via filter" */
  columnsAddedViaFilter?: string[];
  /** Щільність рядків таблиці: comfortable = 72px, compact = 44px */
  displayDensity?: 'compact' | 'comfortable';
  onDisplayDensityChange?: (density: 'compact' | 'comfortable') => void;
}

export default function ViewSettingsDialog({
  open,
  onClose,
  currentView,
  onSave,
  assets = [],
  defaultTab = 'columns', // Значення за замовчуванням для backward compatibility
  columnsAddedViaFilter = [],
  displayDensity: displayDensityProp = 'comfortable',
  onDisplayDensityChange,
}: ViewSettingsDialogProps) {
  const abTest = useABTestOptional();
  const displayDensityCtx = useDisplayDensityOptional();
  const [filtersShowColumnsPanel, setFiltersShowColumnsPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedColumns, setDisplayedColumns] = useState<string[]>(
    currentView.displayedColumns
  );
  const [filters, setFilters] = useState<FilterConfig[]>(currentView.filters || []);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    asset: false,
    inspection: false,
    observation: false
  });
  // Локальний режим фільтрів у діалозі
  const [filterMode, setFilterMode] = useState<FilterMode>('simple');
  const [groupFilters, setGroupFilters] = useState<GroupFilterState | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState | null>(null);
  // Стан для progressive hintʼа
  const [showHint, setShowHint] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  // Відстеження незбережених змін для попередження при перемиканні табів
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // Щільність відображення таблиці: контекст > пропси > локальний стан
  const [displayDensityLocal, setDisplayDensityLocal] = useState<'compact' | 'comfortable'>('comfortable');
  const displayDensity = displayDensityCtx
    ? displayDensityCtx.displayDensity
    : onDisplayDensityChange
      ? displayDensityProp
      : displayDensityLocal;
  const setDisplayDensity = displayDensityCtx
    ? displayDensityCtx.setDisplayDensity
    : onDisplayDensityChange ?? setDisplayDensityLocal;
  // Згортання секцій у табі Saved Filters
  const [savedFilterSetsOpen, setSavedFilterSetsOpen] = useState(true);
  const [savedAdvancedOpen, setSavedAdvancedOpen] = useState(true);
  // Режим «Save as» у футері: показує поле назви + Save filter / Cancel
  const [isSaveAsMode, setIsSaveAsMode] = useState(false);
  const [saveAsFilterName, setSaveAsFilterName] = useState('');
  // Тінь футера тільки при overflow контенту модалки
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const [hasContentOverflow, setHasContentOverflow] = useState(false);

  // Збережені фільтри для табу Saved Filters (state, щоб додавати нові при «Save filter»)
  const [savedFilterSets, setSavedFilterSets] = useState<Array<{ id: string; name: string; state: GroupFilterState }>>(() => [
    { id: 's1', name: 'Saved Filter Set 1', state: { type: 'groups', groups: [{ id: 'g1', name: 'Group 1', conditions: [{ id: 'c1', field: 'material', operator: 'equals', value: 'PVC', table: 'asset' }, { id: 'c2', field: 'width', operator: 'greaterThan', value: 10, table: 'asset' }] }] } },
    { id: 's2', name: 'PVC, Grade 3 Filters', state: { type: 'groups', groups: [{ id: 'g2', name: 'Group 1', conditions: [{ id: 'c3', field: 'material', operator: 'equals', value: 'PVC', table: 'asset' }, { id: 'c4', field: 'maxGrade', operator: 'equals', value: 3, table: 'observation' }] }] } },
    { id: 's3', name: 'Oak street warning', state: { type: 'groups', groups: [{ id: 'g3', name: 'Group 1', conditions: [{ id: 'c5', field: 'street', operator: 'contains', value: 'Oak', table: 'asset' }] }] } },
  ]);
  const [savedAdvancedFilters, setSavedAdvancedFilters] = useState<Array<{ id: string; name: string; state: AdvancedFilterState }>>(() => [
    {
      id: 'a1',
      name: 'Advanced Filter 1',
      state: {
        type: 'advanced',
        groups: [
          {
            id: 'ag1',
            name: 'Group 1',
            conditions: [
              { id: 'ac1', field: 'material', operator: 'equals', value: 'PVC', table: 'asset', nextOperator: 'AND' },
              { id: 'ac2', field: 'material', operator: 'equals', value: 'Clay', table: 'asset' },
            ],
          },
          {
            id: 'ag2',
            name: 'Group 2',
            conditions: [
              { id: 'ac3', field: 'maxGrade', operator: 'equals', value: 3, table: 'observation', nextOperator: 'OR' },
              { id: 'ac4', field: 'maxGrade', operator: 'equals', value: 5, table: 'observation' },
            ],
          },
          {
            id: 'ag3',
            name: 'Group 3',
            conditions: [
              { id: 'ac5', field: 'hasDefects', operator: 'equals', value: false, table: 'observation' },
            ],
          },
        ],
      },
    },
  ]);

  // Визначити overflow контенту модалки — тінь футера тільки тоді
  useEffect(() => {
    if (!open) return;
    const el = scrollContentRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setHasContentOverflow(el.scrollHeight > el.clientHeight);
    };

    checkOverflow();
    const ro = new ResizeObserver(checkOverflow);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, displayedColumns, filters, filterMode, groupFilters, advancedFilters, defaultTab]);

  // Sync state with currentView when dialog opens or view changes
  useEffect(() => {
    if (open) {
      setIsSaveAsMode(false);
      setSaveAsFilterName('');
      setDisplayedColumns(currentView.displayedColumns || []);
      // Визначаємо режим з View або fallback на 'simple'
      const initialMode: FilterMode =
        (currentView.filterMode as FilterMode) || 'simple';
      setFilterMode(initialMode);

      // Simple стан
      const initialSimple: SimpleFilterState = currentView.simpleFilters
        ? {
            type: 'simple',
            conditions: currentView.simpleFilters.conditions || [],
          }
        : simpleFromLegacy(currentView.filters || []);

      setFilters(initialSimple.conditions);

      // Groups стан, якщо вже є у View
      if (currentView.groupFilters && currentView.groupFilters.groups?.length) {
        setGroupFilters(currentView.groupFilters);
      } else {
        setGroupFilters(null);
      }

      // Advanced стан, якщо вже є у View
      if (currentView.advancedFilters && currentView.advancedFilters.groups?.length) {
        setAdvancedFilters(currentView.advancedFilters);
      } else {
        setAdvancedFilters(null);
      }

      // Скидаємо прапорець незбережених змін при відкритті
      setHasUnsavedChanges(false);

      // Відновлюємо стан hintʼа з sessionStorage
      if (typeof window !== 'undefined') {
        const key = `filterHintDismissed_${currentView.id}`;
        const dismissed = window.sessionStorage.getItem(key) === 'true';
        setHintDismissed(dismissed);
        // Показуємо hint лише якщо не відхилений і є хоча б 2 фільтри
        setShowHint(!dismissed && (currentView.filters?.length || 0) >= 2);
      } else {
        setHintDismissed(false);
        setShowHint(false);
      }
    }
  }, [open, currentView.id, currentView.displayedColumns, currentView.filters]);

  // Filter columns based on search
  const filteredColumns = useMemo(() => {
    if (!searchQuery) return mockColumnDefs;
    const query = searchQuery.toLowerCase();
    return mockColumnDefs.filter(
      col => col.label.toLowerCase().includes(query) ||
             col.field.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group columns by table
  const groupedColumns = useMemo(() => {
    const groups: Record<string, ColumnDef[]> = {
      asset: [],
      inspection: [],
      observation: []
    };
    filteredColumns.forEach(col => {
      groups[col.table].push(col);
    });
    return groups;
  }, [filteredColumns]);

  // Toggle section expansion
  const toggleSection = (table: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [table]: !prev[table]
    }));
  };

  // Add column
  const handleAddColumn = (columnId: string) => {
    if (!displayedColumns.includes(columnId)) {
      setDisplayedColumns([...displayedColumns, columnId]);
    }
  };

  // Remove column
  const handleRemoveColumn = (columnId: string) => {
    const hasActiveFilter = activeFilterColumnIds.includes(columnId);
    if (abTest?.variant === 'A' && hasActiveFilter) {
      const ok = window.confirm('This column has an active filter. Hide anyway?');
      if (!ok) return;
      setDisplayedColumns(displayedColumns.filter(id => id !== columnId));
      return;
    }
    if (abTest?.variant === 'B' && hasActiveFilter) {
      const ok = window.confirm('This column has an active filter. Hiding it will remove the filter. Continue?');
      if (!ok) return;
      setDisplayedColumns(displayedColumns.filter(id => id !== columnId));
      setFilters(filters.filter(f => f.field !== columnId));
      setGroupFilters(groupFilters ? {
        type: 'groups' as const,
        groups: groupFilters.groups.map(g => ({
          ...g,
          conditions: g.conditions.filter(c => c.field !== columnId),
        })).filter(g => g.conditions.length > 0),
      } : null);
      setAdvancedFilters(advancedFilters ? {
        type: 'advanced' as const,
        groups: advancedFilters.groups.map(g => ({
          ...g,
          conditions: g.conditions.filter(c => c.field !== columnId),
        })),
      } : null);
      setHasUnsavedChanges(true);
      const updatedView: View = {
        ...currentView,
        displayedColumns: displayedColumns.filter(id => id !== columnId),
        columnOrder: (currentView.columnOrder || []).filter(id => id !== columnId),
        filters: filters.filter(f => f.field !== columnId),
        simpleFilters: { type: 'simple', conditions: filters.filter(f => f.field !== columnId) },
        groupFilters: groupFilters ? {
          type: 'groups' as const,
          groups: groupFilters.groups.map(g => ({
            ...g,
            conditions: g.conditions.filter(c => c.field !== columnId),
          })).filter(g => g.conditions.length > 0),
        } : undefined,
        advancedFilters: advancedFilters ? {
          type: 'advanced' as const,
          groups: advancedFilters.groups.map(g => ({
            ...g,
            conditions: g.conditions.filter(c => c.field !== columnId),
          })),
        } : undefined,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      onSave(updatedView);
      return;
    }
    setDisplayedColumns(displayedColumns.filter(id => id !== columnId));
  };

  // Filter handlers
  const handleAddFilter = () => {
    const newFilter: FilterConfig = {
      id: `filter-${Date.now()}`,
      field: 'pipeSegment',
      operator: 'contains',
      value: '',
      table: 'asset'
    };
    setFilters([...filters, newFilter]);
    setHasUnsavedChanges(true);
  };

  const handleRemoveFilter = (filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId));
    setHasUnsavedChanges(true);
  };

  const handleUpdateFilter = (filterId: string, updates: Partial<FilterConfig>) => {
    setFilters(filters.map(f => 
      f.id === filterId ? { ...f, ...updates } : f
    ));
    setHasUnsavedChanges(true);
  };

  // Get available operators for field type
  const getOperatorsForField = (fieldType: string): FilterConfig['operator'][] => {
    switch (fieldType) {
      case 'text':
        return ['equals', 'contains', 'startsWith'];
      case 'number':
      case 'date':
        return ['equals', 'greaterThan', 'lessThan'];
      case 'select':
      case 'boolean':
        return ['equals'];
      default:
        return ['equals', 'contains'];
    }
  };

  // Get operator icon
  const getOperatorIcon = (operator: FilterConfig['operator']) => {
    switch (operator) {
      case 'equals':
        return <span className="text-xs font-semibold">=</span>;
      case 'greaterThan':
        return <span className="text-xs font-semibold">&gt;</span>;
      case 'lessThan':
        return <span className="text-xs font-semibold">&lt;</span>;
      case 'contains':
        return <span className="text-xs">⊃</span>;
      case 'startsWith':
        return <span className="text-xs">⊂</span>;
      default:
        return null;
    }
  };

  // Get field type color
  const getFieldTypeColor = (fieldType: string): string => {
    switch (fieldType) {
      case 'text':
        return 'border-blue-200 bg-blue-50';
      case 'number':
        return 'border-green-200 bg-green-50';
      case 'date':
        return 'border-purple-200 bg-purple-50';
      case 'select':
        return 'border-orange-200 bg-orange-50';
      case 'boolean':
        return 'border-neutral-200 bg-neutral-50';
      default:
        return 'border-neutral-200 bg-white';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Text className="w-4 h-4 text-blue-600" />;
      case 'number':
        return <Hash className="w-4 h-4 text-green-600" />;
      case 'date':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'select':
        return <ListFilter className="w-4 h-4 text-orange-600" />;
      default:
        return <ToggleLeft className="w-4 h-4 text-neutral-600" />;
    }
  };

  // Get field type from column definition
  const getFieldType = (fieldId: string, table: string): string => {
    const col = mockColumnDefs.find(c => c.id === fieldId && c.table === table);
    return col?.type || 'text';
  };

  // Variant B: тільки видимі колонки доступні для фільтрів
  const visibleFilterableColumns = useMemo(() => {
    if (abTest?.variant !== 'B') return undefined;
    const visible = currentView.displayedColumns || currentView.columnOrder || [];
    return mockColumnDefs.filter((col) => col.filterable && visible.includes(col.id));
  }, [abTest?.variant, currentView.displayedColumns, currentView.columnOrder]);

  // Колонки, по яких є активний фільтр (для індикатора в Manage Columns і для Variant B confirm)
  const activeFilterColumnIds = useMemo(() => {
    const viewLike = {
      filters,
      simpleFilters: { type: 'simple' as const, conditions: filters },
      groupFilters: groupFilters ?? undefined,
      advancedFilters: advancedFilters ?? undefined,
    };
    return getFilterFieldsFromView(viewLike);
  }, [filters, groupFilters, advancedFilters]);

  // Get filterable columns (для Simple mode і превʼю)
  const getFilterableColumns = (): ColumnDef[] => {
    if (visibleFilterableColumns && visibleFilterableColumns.length > 0) return visibleFilterableColumns;
    return mockColumnDefs.filter(col => col.filterable);
  };

  // Preview count of assets matching filters
  const previewCount = useMemo(() => {
    try {
      if (!assets || assets.length === 0 || filters.length === 0) {
        return null;
      }

      // Filter out filters with empty values
      const validFilters = filters.filter(f => {
        if (f.value === null || f.value === undefined || f.value === '') {
          return false;
        }
        return true;
      });

      if (validFilters.length === 0) {
        return null;
      }

      let filtered = [...assets];

      // Apply filters (same logic as in app/assets/page.tsx)
      validFilters.forEach(filter => {
        filtered = filtered.filter(asset => {
          try {
            // Get value based on table type
            let value: unknown;
            
            if (filter.table === 'asset') {
              value = (asset as unknown as Record<string, unknown>)[filter.field];
            } else if (filter.table === 'inspection' && asset.latestInspection) {
              value = (asset.latestInspection as unknown as Record<string, unknown>)[filter.field];
            } else if (filter.table === 'observation') {
              if (filter.field === 'observationCount') {
                value = asset.observationCount;
              } else if (filter.field === 'hasDefects') {
                value = asset.hasDefects;
              } else if (filter.field === 'maxGrade') {
                value = asset.maxGrade;
              } else {
                value = undefined;
              }
            } else {
              // If inspection/observation field but no data, filter out
              return false;
            }

            // Handle null/undefined values
            if (value === null || value === undefined) {
              return false;
            }

            // Apply operator
            switch (filter.operator) {
              case 'equals':
                // For boolean, compare directly
                if (typeof value === 'boolean' || typeof filter.value === 'boolean') {
                  return value === filter.value;
                }
                // For numbers, compare as numbers
                if (typeof value === 'number' || typeof filter.value === 'number') {
                  return Number(value) === Number(filter.value);
                }
                // For strings, case-insensitive comparison
                return String(value).toLowerCase() === String(filter.value).toLowerCase();
              
              case 'contains':
                return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
              
              case 'startsWith':
                return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
              
              case 'greaterThan':
                return Number(value) > Number(filter.value);
              
              case 'lessThan':
                return Number(value) < Number(filter.value);
              
              default:
                return true;
            }
          } catch (error) {
            console.error('Error filtering asset:', error);
            return false;
          }
        });
      });

      return filtered.length;
    } catch (error) {
      console.error('Error calculating preview count:', error);
      return null;
    }
  }, [filters, assets]);

  // Handle save
  const handleSave = () => {
    let updatedView: View = {
      ...currentView,
      displayedColumns,
      columnOrder: displayedColumns,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (filterMode === 'advanced' && advancedFilters) {
      // Advanced режим: зберігаємо повний advancedState
      const adv = {
        type: 'advanced' as const,
        groups: advancedFilters.groups || [],
      };

      // Для сумісності будуємо спрощені group/simple стани
      const groupsState = groupsFromAdvanced(adv);
      const simpleState = simpleFromGroups(groupsState) || simpleFromLegacy([]);

      updatedView = {
        ...updatedView,
        filterMode: 'advanced',
        advancedFilters: adv,
        groupFilters: groupsState,
        simpleFilters: simpleState,
        filters: simpleState.conditions,
      };
    } else if (filterMode === 'groups' && groupFilters) {
      // Зберігаємо груповий режим.
      // Legacy filters робимо сумісними: беремо умови з першої групи (як fallback).
      const simpleFromGroupsState = simpleFromGroups(groupFilters);
      const legacyFilters =
        simpleFromGroupsState?.conditions && simpleFromGroupsState.conditions.length > 0
          ? simpleFromGroupsState.conditions
          : [];

      updatedView = {
        ...updatedView,
        filterMode: 'groups',
        groupFilters: groupFilters,
        simpleFilters: simpleFromGroupsState || { type: 'simple', conditions: legacyFilters },
        filters: legacyFilters,
      };
    } else {
      // Simple режим: будуємо simple-стан з поточних filters
      const simpleState = simpleFromLegacy(filters);
      updatedView = {
        ...updatedView,
        filterMode: 'simple',
        simpleFilters: simpleState,
        filters: simpleState.conditions,
      };
    }
    onSave(updatedView);
    setHasUnsavedChanges(false);
    onClose();
  };

  // Get column definition by id
  const getColumnDef = (columnId: string): ColumnDef | undefined => {
    return mockColumnDefs.find(col => col.id === columnId);
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before activating
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for columns
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setDisplayedColumns((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Sortable Column Item Component
  function SortableColumnItem({ 
    columnId, 
    onRemove,
    isAddedViaFilter = false,
    isFilterActive = false,
  }: { 
    columnId: string; 
    onRemove: (id: string) => void;
    isAddedViaFilter?: boolean;
    isFilterActive?: boolean;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: columnId });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const col = getColumnDef(columnId);

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center justify-between p-2 rounded gap-3 hover:bg-white/80 min-h-[40px]"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-[#71717A] hover:text-[#09090B] shrink-0"
            aria-label="Drag to reorder"
            type="button"
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <span className="text-sm font-normal text-[#18181B] truncate">{col?.label}</span>
          {isAddedViaFilter && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="shrink-0 flex items-center gap-1 text-[10px] text-[#71717A] bg-[#F4F4F5] px-1.5 py-0.5 rounded">
                  <ListFilter className="h-3 w-3" />
                  added via filter
                </span>
              </TooltipTrigger>
              <TooltipContent>This column was added from the filter notification</TooltipContent>
            </Tooltip>
          )}
          {isFilterActive && !isAddedViaFilter && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="shrink-0 text-[#E86F25]" aria-label="Active filter">
                  <ListFilter className="h-3.5 w-3.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent>Active filter on this column</TooltipContent>
            </Tooltip>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0 text-[#09090B] hover:bg-neutral-100 rounded"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove(columnId);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          type="button"
          aria-label={`Remove ${col?.label}`}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  // Обробник зміни режиму через таби з попередженням про незбережені зміни
  const handleModeChange = (newMode: FilterMode) => {
    if (newMode === filterMode) return;

    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        `You have unsaved changes in ${filterMode === 'simple' ? 'Simple' : filterMode === 'groups' ? 'Filter Sets' : 'Advanced'} filters. Discard changes and switch to ${newMode === 'simple' ? 'Simple' : newMode === 'groups' ? 'Filter Sets' : 'Advanced'}?`
      );
      if (!confirmed) return;
      setHasUnsavedChanges(false);
    }

    // Якщо переходимо на Advanced і немає advancedFilters, ініціалізуємо порожній
    if (newMode === 'advanced' && !advancedFilters) {
      setAdvancedFilters({
        type: 'advanced',
        groups: [
          {
            id: `group-${Date.now()}`,
            name: 'Group 1',
            conditions: [],
          },
        ],
      });
    }

    setFilterMode(newMode);
  };

  // Обробник очищення поточного режиму
  const handleClearCurrentMode = () => {
    if (filterMode === 'simple') {
      setFilters([]);
    } else if (filterMode === 'groups') {
      setGroupFilters({ type: 'groups', groups: [] });
    } else if (filterMode === 'advanced') {
      setAdvancedFilters({ type: 'advanced', groups: [] });
    }
    setHasUnsavedChanges(true);
  };

  // Відкрити режим «Save as» у футері
  const handleSaveAsClick = () => {
    setIsSaveAsMode(true);
    setSaveAsFilterName('');
  };

  // Скасувати режим «Save as», повернути звичайний футер
  const handleSaveFilterCancel = () => {
    setIsSaveAsMode(false);
    setSaveAsFilterName('');
  };

  // Зберегти поточний фільтр під введеною назвою
  const handleSaveFilter = () => {
    const name = saveAsFilterName.trim();
    if (!name) return;

    const id = `saved-${Date.now()}`;

    if (filterMode === 'advanced' && advancedFilters) {
      const state: AdvancedFilterState = JSON.parse(JSON.stringify(advancedFilters));
      setSavedAdvancedFilters((prev) => [...prev, { id, name, state }]);
    } else {
      let groupsState: GroupFilterState;
      if (filterMode === 'simple') {
        groupsState = groupsFromSimple({ type: 'simple', conditions: filters });
      } else if (filterMode === 'groups' && groupFilters) {
        groupsState = JSON.parse(JSON.stringify(groupFilters));
      } else if (filterMode === 'saved' && currentView.filters?.length) {
        groupsState = groupsFromSimple(simpleFromLegacy(currentView.filters));
      } else {
        groupsState = { type: 'groups', groups: [] };
      }
      setSavedFilterSets((prev) => [...prev, { id, name, state: groupsState }]);
    }

    setIsSaveAsMode(false);
    setSaveAsFilterName('');
  };

  // Визначаємо, яку секцію показувати
  // Якщо defaultTab не заданий - показуємо обидві (backward compatibility)
  // Якщо defaultTab='columns' - тільки Columns
  // Якщо defaultTab='filters' - тільки Filters; Variant B може перемкнути на Columns через "Manage Columns →"
  const showColumns = !defaultTab || defaultTab === 'columns' || (defaultTab === 'filters' && abTest?.variant === 'B' && filtersShowColumnsPanel);
  const showFilters = (!defaultTab || defaultTab === 'filters') && !(defaultTab === 'filters' && abTest?.variant === 'B' && filtersShowColumnsPanel);

  const isColumnsOnly = defaultTab === 'columns';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-h-[90vh] overflow-hidden flex flex-col p-6 rounded-2xl border border-[#E4E4E7] bg-white',
          'shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(16,24,40,0.10)]',
          isColumnsOnly ? 'w-[480px] min-w-[480px] max-w-[calc(100vw-2rem)]' : defaultTab === 'filters' ? 'w-[640px] min-w-[480px] max-w-[calc(100vw-2rem)]' : 'max-w-2xl w-full'
        )}
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-[#09090B] text-lg font-semibold leading-7">
            {defaultTab === 'filters' ? 'Filters' : defaultTab === 'columns' ? 'Columns Settings' : 'View Settings'}
          </DialogTitle>
        </DialogHeader>

        <div
          ref={scrollContentRef}
          className="flex-1 flex flex-col overflow-hidden overflow-y-auto gap-4"
        >
          {/* Columns Section — макет: search, Currently displayed, All fields, Display density */}
          {showColumns && (
          <div className="flex flex-col gap-4 pb-4">
            {defaultTab === 'filters' && filtersShowColumnsPanel && (
              <Button
                variant="ghost"
                size="sm"
                className="self-start -ml-2 text-[#71717A]"
                onClick={() => setFiltersShowColumnsPanel(false)}
              >
                ← Back to Filters
              </Button>
            )}
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#09090B]" />
              <Input
                placeholder="Search columns"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-9 pl-10 pr-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white placeholder:text-[#71717A] text-sm"
              />
            </div>

            {/* Currently displayed (N): */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-[#3F3F46] leading-5">
                Currently displayed ({displayedColumns.length}):
              </h3>
              <div className="p-1 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] flex flex-col">
                {displayedColumns.length === 0 ? (
                  <p className="text-sm text-[#71717A] p-2">No columns displayed</p>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={displayedColumns}
                      strategy={verticalListSortingStrategy}
                    >
                      {displayedColumns.map((columnId) => {
                        const col = getColumnDef(columnId);
                        if (!col) return null;
                        return (
                          <SortableColumnItem
                            key={columnId}
                            columnId={columnId}
                            onRemove={handleRemoveColumn}
                            isAddedViaFilter={columnsAddedViaFilter.includes(columnId)}
                            isFilterActive={activeFilterColumnIds.includes(columnId)}
                          />
                        );
                      })}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

            <div className="h-px bg-[#E4E4E7]" />

            {/* All fields: */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-[#3F3F46] leading-5">
                All fields:
              </h3>
              <div className="flex flex-col gap-2">
                {/* Asset Fields */}
                <div className="p-1 rounded-lg border border-[#E4E4E7] flex flex-col">
                  <button
                    type="button"
                    onClick={() => toggleSection('asset')}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-white/80 gap-3"
                  >
                    <span className="text-sm font-semibold text-[#18181B]">
                      Asset Fields ({groupedColumns.asset.length})
                    </span>
                    <ChevronDown className={cn('h-4 w-4 text-[#09090B] transition-transform', expandedSections.asset && 'rotate-180')} />
                  </button>
                  {expandedSections.asset && (
                    <div className="flex flex-col">
                      {groupedColumns.asset.map((col) => {
                        const isAdded = displayedColumns.includes(col.id);
                        return (
                          <div
                            key={col.id}
                            className="flex items-center justify-between p-2 rounded gap-3 min-h-[44px]"
                          >
                            <span className="text-sm font-normal text-[#18181B] flex-1">{col.label}</span>
                            {isAdded ? (
                              <span className="px-2 py-1 rounded-lg text-sm font-medium text-[#312C29] inline-flex items-center gap-1">
                                <Check className="h-4 w-4" />
                                Added
                              </span>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-2 py-1 rounded-lg text-sm font-medium text-[#312C29] gap-2 hover:bg-neutral-100"
                                onClick={() => handleAddColumn(col.id)}
                              >
                                <Plus className="h-4 w-4" />
                                Add
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Inspection Fields */}
                <div className="p-1 rounded-lg border border-[#E4E4E7] flex flex-col">
                  <button
                    type="button"
                    onClick={() => toggleSection('inspection')}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-white/80 gap-3"
                  >
                    <span className="text-sm font-semibold text-[#18181B]">
                      Inspection Fields ({groupedColumns.inspection.length})
                    </span>
                    <ChevronDown className={cn('h-4 w-4 text-[#09090B] transition-transform', expandedSections.inspection && 'rotate-180')} />
                  </button>
                  {expandedSections.inspection && (
                    <div className="flex flex-col">
                      {groupedColumns.inspection.map((col) => {
                        const isAdded = displayedColumns.includes(col.id);
                        return (
                          <div
                            key={col.id}
                            className="flex items-center justify-between p-2 rounded gap-3 min-h-[44px]"
                          >
                            <span className="text-sm font-normal text-[#18181B] flex-1">{col.label}</span>
                            {isAdded ? (
                              <span className="px-2 py-1 rounded-lg text-sm font-medium text-[#312C29] inline-flex items-center gap-1">
                                <Check className="h-4 w-4" />
                                Added
                              </span>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-2 py-1 rounded-lg text-sm font-medium text-[#312C29] gap-2 hover:bg-neutral-100"
                                onClick={() => handleAddColumn(col.id)}
                              >
                                <Plus className="h-4 w-4" />
                                Add
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Observation Fields */}
                <div className="p-1 rounded-lg border border-[#E4E4E7] flex flex-col">
                  <button
                    type="button"
                    onClick={() => toggleSection('observation')}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-white/80 gap-3"
                  >
                    <span className="text-sm font-semibold text-[#18181B]">
                      Observation Fields ({groupedColumns.observation.length})
                    </span>
                    <ChevronDown className={cn('h-4 w-4 text-[#09090B] transition-transform', expandedSections.observation && 'rotate-180')} />
                  </button>
                  {expandedSections.observation && (
                    <div className="flex flex-col">
                      {groupedColumns.observation.map((col) => {
                        const isAdded = displayedColumns.includes(col.id);
                        return (
                          <div
                            key={col.id}
                            className="flex items-center justify-between p-2 rounded gap-3 min-h-[44px]"
                          >
                            <span className="text-sm font-normal text-[#18181B] flex-1">{col.label}</span>
                            {isAdded ? (
                              <span className="px-2 py-1 rounded-lg text-sm font-medium text-[#312C29] inline-flex items-center gap-1">
                                <Check className="h-4 w-4" />
                                Added
                              </span>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-2 py-1 rounded-lg text-sm font-medium text-[#312C29] gap-2 hover:bg-neutral-100"
                                onClick={() => handleAddColumn(col.id)}
                              >
                                <Plus className="h-4 w-4" />
                                Add
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-[#E4E4E7]" />

            {/* Display density */}
            <div className="flex flex-col gap-2 pb-4">
              <h3 className="text-sm font-semibold text-[#3F3F46] leading-5">
                Display density:
              </h3>
              <div className="flex p-1 rounded-lg bg-[#F4F4F5] w-full max-w-[400px]">
                <button
                  type="button"
                  onClick={() => setDisplayDensity('compact')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded text-sm font-medium transition-colors',
                    displayDensity === 'compact'
                      ? 'bg-white text-[#18181B] shadow-[0px_2px_4px_rgba(0,0,0,0.12)]'
                      : 'text-[#71717A] hover:text-[#3F3F46]'
                  )}
                >
                  <Rows3 className="h-4 w-4" />
                  Compact
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayDensity('comfortable')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded text-sm font-medium transition-colors',
                    displayDensity === 'comfortable'
                      ? 'bg-white text-[#18181B] shadow-[0px_2px_4px_rgba(0,0,0,0.12)]'
                      : 'text-[#71717A] hover:text-[#3F3F46]'
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Comfortable
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Filters Section — макет: таби в пілюлях, Active filters (N), картки #F3E8FF, Add filter, footer */}
          {showFilters && (
          <div className="flex flex-col gap-4">
            {abTest?.variant === 'B' && (
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA]">
                <p className="text-xs text-[#3F3F46]">
                  Filters are based on your current columns. Add more columns to unlock additional filters.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="text-[#E86F25] shrink-0"
                  onClick={() => setFiltersShowColumnsPanel(true)}
                >
                  Manage Columns →
                </Button>
              </div>
            )}
            <Tabs
              value={filterMode}
              onValueChange={(val) => handleModeChange(val as FilterMode)}
              className="w-full"
            >
              <TabsList className="w-full p-1 rounded-lg bg-[#F4F4F5] flex gap-0 h-auto">
                <TabsTrigger
                  value="simple"
                  className={cn(
                    'flex-1 py-1.5 px-3 rounded text-sm font-medium transition-colors',
                    'data-[state=inactive]:text-[#71717A] data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-[0px_2px_4px_rgba(0,0,0,0.12)]'
                  )}
                >
                  Simple
                </TabsTrigger>
                <TabsTrigger
                  value="groups"
                  className={cn(
                    'flex-1 py-1.5 px-3 rounded text-sm font-medium transition-colors',
                    'data-[state=inactive]:text-[#71717A] data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-[0px_2px_4px_rgba(0,0,0,0.12)]'
                  )}
                >
                  Filter Sets
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className={cn(
                    'flex-1 py-1.5 px-3 rounded text-sm font-medium transition-colors',
                    'data-[state=inactive]:text-[#71717A] data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-[0px_2px_4px_rgba(0,0,0,0.12)]'
                  )}
                >
                  Advanced
                </TabsTrigger>
                <TabsTrigger
                  value="saved"
                  className={cn(
                    'flex-1 py-1.5 px-3 rounded text-sm font-medium transition-colors',
                    'data-[state=inactive]:text-[#71717A] data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-[0px_2px_4px_rgba(0,0,0,0.12)]'
                  )}
                >
                  Saved Filters
                </TabsTrigger>
              </TabsList>

              <TabsContent value="simple" className="flex flex-col gap-4 pt-4 mt-0">
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-[#3F3F46] leading-5">
                    Active filters ({filters.length}):
                  </h3>
                  <div className="p-1 rounded-lg border border-[#E4E4E7] flex flex-col gap-1">
                    {filters.length === 0 ? (
                      <p className="text-sm text-[#71717A] p-2 text-center">
                        No filters applied
                      </p>
                    ) : (
                      filters.map((filter) => {
                        const col = getFilterableColumns().find(
                          c => c.id === filter.field && c.table === filter.table
                        );
                        const fieldType = col?.type || 'text';
                        const availableOperators = getOperatorsForField(fieldType);

                        return (
                          <div
                            key={filter.id}
                            className="flex items-center gap-3 p-2 rounded bg-[#F3E8FF]"
                          >
                            {/* Field Selector */}
                            <Select
                              value={`${filter.table}:${filter.field}`}
                              onValueChange={(value) => {
                                const [table, field] = value.split(':');
                                const newFieldType = getFieldType(field, table as FilterConfig['table']);
                                const newOperators = getOperatorsForField(newFieldType);
                                handleUpdateFilter(filter.id, {
                                  field,
                                  table: table as FilterConfig['table'],
                                  operator: newOperators.includes(filter.operator) 
                                    ? filter.operator 
                                    : newOperators[0],
                                  value: ''
                                });
                              }}
                            >
                              <SelectTrigger className="flex-1 min-h-9 px-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white text-sm font-normal text-[#18181B] focus:ring-[#E86F25]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getFilterableColumns().map((col) => (
                                  <SelectItem 
                                    key={`${col.table}:${col.id}`} 
                                    value={`${col.table}:${col.id}`}
                                  >
                                    {col.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* Operator Selector */}
                            <Select
                              value={filter.operator}
                              onValueChange={(value) => {
                                handleUpdateFilter(filter.id, {
                                  operator: value as FilterConfig['operator']
                                });
                              }}
                            >
                              <SelectTrigger className="w-[140px] min-h-9 px-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white text-sm font-normal text-[#18181B]">
                                <SelectValue>
                                  {filter.operator === 'equals' ? 'is' : 
                                   filter.operator === 'contains' ? 'contains' :
                                   filter.operator === 'startsWith' ? 'starts with' :
                                   filter.operator === 'greaterThan' ? 'greater than' :
                                   filter.operator === 'lessThan' ? 'less than' : filter.operator}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {availableOperators.map((op) => (
                                  <SelectItem key={op} value={op}>
                                    {op === 'equals' ? 'is' : 
                                     op === 'contains' ? 'contains' :
                                     op === 'startsWith' ? 'Starts with' :
                                     op === 'greaterThan' ? 'Greater than' :
                                     op === 'lessThan' ? 'Less than' : op}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* Value Input */}
                            {fieldType === 'select' ? (
                              <Select
                                value={String(filter.value || '')}
                                onValueChange={(value) => {
                                  handleUpdateFilter(filter.id, { value });
                                }}
                              >
                                <SelectTrigger className="w-[140px] min-h-9 px-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white text-sm font-normal text-[#18181B]">
                                  <SelectValue placeholder="Select value" />
                                </SelectTrigger>
                                <SelectContent>
                                  {filter.field === 'material' && (
                                    <>
                                      <SelectItem value="PVC">PVC</SelectItem>
                                      <SelectItem value="Clay">Clay</SelectItem>
                                      <SelectItem value="Concrete">Concrete</SelectItem>
                                      <SelectItem value="HDPE">HDPE</SelectItem>
                                    </>
                                  )}
                                  {filter.field === 'direction' && (
                                    <>
                                      <SelectItem value="Upstream">Upstream</SelectItem>
                                      <SelectItem value="Downstream">Downstream</SelectItem>
                                    </>
                                  )}
                                  {filter.field === 'hasDefects' && (
                                    <>
                                      <SelectItem value="true">Yes</SelectItem>
                                      <SelectItem value="false">No</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                            ) : fieldType === 'number' ? (
                              <Input
                                type="number"
                                value={filter.value as number || ''}
                                onChange={(e) => {
                                  handleUpdateFilter(filter.id, {
                                    value: e.target.value ? Number(e.target.value) : ''
                                  });
                                }}
                                className="w-[140px] min-h-9 px-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white text-sm font-normal text-[#18181B]"
                                placeholder="Value"
                              />
                            ) : fieldType === 'date' ? (
                              <Input
                                type="date"
                                value={filter.value as string || ''}
                                onChange={(e) => {
                                  handleUpdateFilter(filter.id, { value: e.target.value });
                                }}
                                className="w-[140px] min-h-9 px-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white text-sm"
                              />
                            ) : (
                              <Input
                                type="text"
                                value={filter.value as string || ''}
                                onChange={(e) => {
                                  handleUpdateFilter(filter.id, { value: e.target.value });
                                }}
                                className="w-[140px] min-h-9 px-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white text-sm font-normal text-[#18181B]"
                                placeholder="Value"
                              />
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 shrink-0 text-[#09090B] hover:bg-white/80 rounded"
                              onClick={() => handleRemoveFilter(filter.id)}
                              type="button"
                              aria-label="Remove filter"
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                  {/* Preview Count (залишаємо як додатковий індикатор) */}
                  {filters.length > 0 && previewCount !== null && (
                    <Card className={`border ${
                      previewCount === 0 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-green-50 border-green-200'
                    }`}>
                      <CardContent className="py-2">
                        <div className="flex items-center gap-2">
                          {previewCount === 0 ? (
                            <>
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <p className="text-xs font-medium text-red-900">
                                No assets match these filters
                              </p>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              <p className="text-xs font-medium text-green-900">
                                <span className="text-sm font-bold">{previewCount}</span>
                                {' '}asset{previewCount !== 1 ? 's' : ''} match these filters
                              </p>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Progressive hint (під списком фільтрів, над кнопкою) */}
                  {showHint && filters.length >= 2 && !hintDismissed && (
                    <div
                      className={`flex items-start gap-2 px-3 py-2 rounded-md border ${
                        filters.length >= 3
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="mt-0.5 text-sm">ℹ️</div>
                      <div className="flex-1">
                        <p className={filters.length >= 3 ? 'text-sm font-medium text-blue-900' : 'text-xs text-blue-900'}>
                          {filters.length >= 3
                            ? 'It looks like you might need OR logic between filters.'
                            : 'Need to show different types of assets?'}
                        </p>
                        <button
                          type="button"
                          className="mt-1 text-xs font-medium text-blue-700 hover:text-blue-800 underline"
                          onClick={() => handleModeChange('groups')}
                        >
                          Switch to Filter Sets →
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-blue-700 hover:text-blue-900"
                        onClick={() => {
                          setShowHint(false);
                          setHintDismissed(true);
                          if (typeof window !== 'undefined') {
                            const key = `filterHintDismissed_${currentView.id}`;
                            window.sessionStorage.setItem(key, 'true');
                          }
                        }}
                        aria-label="Dismiss hint"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Add Filter Button — макет: ghost, full width, h-10, rounded-lg, Plus зліва, текст 14px #312C29 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddFilter}
                    className="w-full h-10 px-4 py-2 rounded-lg justify-center gap-2 text-[#312C29] text-sm font-medium hover:bg-neutral-100"
                  >
                    <Plus className="h-4 w-4" />
                    Add filter
                  </Button>
              </TabsContent>

              <TabsContent value="groups" className="space-y-4 pt-4 mt-0">
                <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-900">
                    Show items matching any of the sets below (OR between sets, AND within each set).
                  </p>
                </div>
                {groupFilters ? (
                  <FilterGroupsEditor
                    state={groupFilters}
                    onChange={(next) => {
                      setGroupFilters(next);
                      setHasUnsavedChanges(true);
                    }}
                    availableColumns={visibleFilterableColumns}
                  />
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-neutral-600">
                      No filter sets yet. Create your first set below.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const simpleState: SimpleFilterState = { type: 'simple', conditions: filters };
                        const groupsState = groupsFromSimple(simpleState);
                        setGroupFilters(groupsState);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create first filter set
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="saved" className="space-y-4 pt-4 mt-0">
                {/* Секція Filter Sets — згортання, список з тултіпами */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSavedFilterSetsOpen((v) => !v)}
                    className="flex items-center justify-between w-full text-left text-sm font-semibold text-[#3F3F46] leading-5 py-1"
                  >
                    Filter Sets ({savedFilterSets.length})
                    {savedFilterSetsOpen ? (
                      <ChevronUp className="h-4 w-4 text-[#71717A]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#71717A]" />
                    )}
                  </button>
                  {savedFilterSetsOpen && (
                    <div className="flex flex-col gap-1 pl-0">
                      {savedFilterSets.map((item) => {
                        const preview = buildGroupFilterPreview(item.state);
                        return (
                          <Tooltip key={item.id}>
                            <TooltipTrigger asChild>
                              <div className="text-sm text-[#18181B] py-1.5 px-2 rounded-md hover:bg-[#F4F4F5] cursor-default w-full">
                                {item.name}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-sm">
                              <div className="font-semibold text-[#18181B] mb-1">{item.name}</div>
                              <SavedFilterPreviewText text={preview} />
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Секція Advanced filters — згортання, список з тултіпами */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSavedAdvancedOpen((v) => !v)}
                    className="flex items-center justify-between w-full text-left text-sm font-semibold text-[#3F3F46] leading-5 py-1"
                  >
                    Advanced filters ({savedAdvancedFilters.length})
                    {savedAdvancedOpen ? (
                      <ChevronUp className="h-4 w-4 text-[#71717A]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#71717A]" />
                    )}
                  </button>
                  {savedAdvancedOpen && (
                    <div className="flex flex-col gap-1 pl-0">
                      {savedAdvancedFilters.map((item) => {
                        const preview = buildAdvancedFilterPreview(item.state);
                        return (
                          <Tooltip key={item.id}>
                            <TooltipTrigger asChild>
                              <div className="text-sm text-[#18181B] py-1.5 px-2 rounded-md hover:bg-[#F4F4F5] cursor-default w-full">
                                {item.name}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-sm">
                              <div className="font-semibold text-[#18181B] mb-1">{item.name}</div>
                              <SavedFilterPreviewText text={preview} />
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 pt-4 mt-0">
                <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-900">
                    Build complex AND/OR logic within groups. Groups are combined with OR.
                  </p>
                </div>
                {advancedFilters ? (
                  <AdvancedFiltersEditor
                    state={advancedFilters}
                    onChange={(next) => {
                      setAdvancedFilters(next);
                      setHasUnsavedChanges(true);
                    }}
                    availableColumns={visibleFilterableColumns}
                  />
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-neutral-600">
                      No advanced filters yet. Create your first group below.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAdvancedFilters({
                          type: 'advanced',
                          groups: [
                            {
                              id: `group-${Date.now()}`,
                              name: 'Group 1',
                              conditions: [],
                            },
                          ],
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create first group
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          )}
        </div>

        {/* Footer — тінь тільки при overflow контенту */}
        <div
          className={cn(
            'flex flex-col justify-end pt-4 pb-6 border-t border-[#E4E4E7] mt-auto shrink-0 -mx-6 -mb-6 px-6 pb-6 bg-white',
            hasContentOverflow && 'shadow-[0px_6px_29px_rgba(100,100,111,0.20)]'
          )}
        >
          {showFilters && isSaveAsMode ? (
            /* Режим «Save as»: поле назви, Save filter (disabled поки назва порожня), Cancel */
            <div className="flex flex-1 items-start gap-4">
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <Input
                  placeholder="Enter filter name"
                  value={saveAsFilterName}
                  onChange={(e) => setSaveAsFilterName(e.target.value)}
                  className="min-h-9 px-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white text-sm text-[#18181B] placeholder:text-[#71717A]"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  disabled={!saveAsFilterName.trim()}
                  onClick={handleSaveFilter}
                  className="h-10 px-4 py-2 rounded-lg bg-[#E86F25] text-[#FAFAFA] text-sm font-medium hover:bg-[#d65a1a] disabled:opacity-50 disabled:pointer-events-none"
                >
                  Save filter
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleSaveFilterCancel}
                  className="h-10 px-4 py-2 rounded-lg border-[#E4E4E7] text-[#312C29] text-sm font-medium hover:bg-neutral-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center gap-2">
              {showFilters && (
                <Button
                  variant="link"
                  onClick={handleClearCurrentMode}
                  className="h-10 px-4 py-2 rounded-lg text-[#312C29] text-sm font-medium hover:no-underline"
                >
                  Clear
                </Button>
              )}
              {!showFilters && <div />}
              <div className="flex gap-2 ml-auto">
                {showFilters && (
                  <Button
                    variant="ghost"
                    type="button"
                    className="h-10 px-4 py-2 rounded-lg text-[#312C29] text-sm font-medium hover:bg-neutral-100"
                    onClick={handleSaveAsClick}
                  >
                    Save as
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="h-10 px-4 py-2 rounded-lg border-[#E4E4E7] text-[#312C29] text-sm font-medium hover:bg-neutral-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="h-10 px-4 py-2 rounded-lg bg-[#E86F25] text-[#FAFAFA] text-sm font-medium hover:bg-[#d65a1a]"
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
