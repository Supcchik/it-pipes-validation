'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus, ChevronDown, ChevronRight, GripVertical, Hash, Calendar, Text, ListFilter, ToggleLeft, AlertCircle, Check } from 'lucide-react';
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
import type { View, ColumnDef, FilterConfig, Asset } from '@/lib/types/asset-list';
import { mockColumnDefs } from '@/lib/mock-data/asset-list';

interface ViewSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  currentView: View;
  onSave: (view: View) => void;
  assets?: Asset[]; // For preview count
  defaultTab?: 'columns' | 'filters'; // НОВИЙ: Встановити початкову вкладку
}

export default function ViewSettingsDialog({
  open,
  onClose,
  currentView,
  onSave,
  assets = [],
  defaultTab = 'columns' // Значення за замовчуванням для backward compatibility
}: ViewSettingsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedColumns, setDisplayedColumns] = useState<string[]>(
    currentView.displayedColumns
  );
  const [filters, setFilters] = useState<FilterConfig[]>(
    currentView.filters || []
  );
  const [activeTab, setActiveTab] = useState<'columns' | 'filters'>(defaultTab);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    asset: false,
    inspection: false,
    observation: false
  });

  // Sync state with currentView when dialog opens or view changes
  useEffect(() => {
    if (open) {
      setDisplayedColumns(currentView.displayedColumns || []);
      setFilters(currentView.filters || []);
      setActiveTab(defaultTab); // Скидати на defaultTab коли діалог відкривається
    }
  }, [open, currentView.id, currentView.displayedColumns, currentView.filters, defaultTab]);

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
  };

  const handleRemoveFilter = (filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId));
  };

  const handleUpdateFilter = (filterId: string, updates: Partial<FilterConfig>) => {
    setFilters(filters.map(f => 
      f.id === filterId ? { ...f, ...updates } : f
    ));
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

  // Get filterable columns
  const getFilterableColumns = (): ColumnDef[] => {
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
    const updatedView: View = {
      ...currentView,
      displayedColumns,
      columnOrder: displayedColumns,
      filters,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onSave(updatedView);
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
    onRemove 
  }: { 
    columnId: string; 
    onRemove: (id: string) => void;
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
        className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-neutral-200"
      >
        <div className="flex items-center gap-2 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600"
            aria-label="Drag to reorder"
            type="button"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-sm">{col?.label}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
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
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle>View Settings</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'columns' | 'filters')} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start border-b grid-cols-2">
            <TabsTrigger value="columns" className="flex-1">Columns</TabsTrigger>
            <TabsTrigger value="filters" className="flex-1">Filters</TabsTrigger>
          </TabsList>

          <TabsContent value="columns" className="flex-1 flex flex-col overflow-hidden mt-4 space-y-6">
            {/* Search */}
            <div>
              <Input
                placeholder="Search columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
              {/* Currently Displayed */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-700">
                  Currently Displayed ({displayedColumns.length}):
                </h3>
                <div className="space-y-1 border rounded-md p-2 bg-neutral-50">
                  {displayedColumns.length === 0 ? (
                    <p className="text-sm text-neutral-500 p-2">No columns displayed</p>
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
                            />
                          );
                        })}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </div>

              {/* Browse All Fields */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-700">
                  Browse All Fields
                </h3>
                <div className="space-y-2">
                  {/* Asset Fields */}
                  <div className="border rounded-md">
                    <button
                      onClick={() => toggleSection('asset')}
                      className="w-full flex items-center justify-between p-2 hover:bg-neutral-50"
                    >
                      <span className="text-sm font-medium">
                        Asset Fields ({groupedColumns.asset.length})
                      </span>
                      {expandedSections.asset ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedSections.asset && (
                      <div className="p-2 space-y-1">
                        {groupedColumns.asset.map((col) => {
                          const isAdded = displayedColumns.includes(col.id);
                          return (
                            <div
                              key={col.id}
                              className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded"
                            >
                              <span className="text-sm">{col.label}</span>
                              {!isAdded && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6"
                                  onClick={() => handleAddColumn(col.id)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
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
                  <div className="border rounded-md">
                    <button
                      onClick={() => toggleSection('inspection')}
                      className="w-full flex items-center justify-between p-2 hover:bg-neutral-50"
                    >
                      <span className="text-sm font-medium">
                        Inspection Fields ({groupedColumns.inspection.length})
                      </span>
                      {expandedSections.inspection ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedSections.inspection && (
                      <div className="p-2 space-y-1">
                        {groupedColumns.inspection.map((col) => {
                          const isAdded = displayedColumns.includes(col.id);
                          return (
                            <div
                              key={col.id}
                              className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded"
                            >
                              <span className="text-sm">{col.label}</span>
                              {!isAdded && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6"
                                  onClick={() => handleAddColumn(col.id)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
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
                  <div className="border rounded-md">
                    <button
                      onClick={() => toggleSection('observation')}
                      className="w-full flex items-center justify-between p-2 hover:bg-neutral-50"
                    >
                      <span className="text-sm font-medium">
                        Observation Fields ({groupedColumns.observation.length})
                      </span>
                      {expandedSections.observation ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedSections.observation && (
                      <div className="p-2 space-y-1">
                        {groupedColumns.observation.map((col) => {
                          const isAdded = displayedColumns.includes(col.id);
                          return (
                            <div
                              key={col.id}
                              className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded"
                            >
                              <span className="text-sm">{col.label}</span>
                              {!isAdded && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6"
                                  onClick={() => handleAddColumn(col.id)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
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
            </div>
          </TabsContent>

          <TabsContent value="filters" className="flex-1 flex flex-col overflow-hidden mt-4">
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Active Filters */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-700">
                    Active Filters ({filters.length}):
                  </h3>
                  {filters.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters([])}
                      className="h-7 text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <div className="space-y-2 border rounded-md p-2 bg-neutral-50">
                  {filters.length === 0 ? (
                    <p className="text-sm text-neutral-500 p-2 text-center">
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
                          className={`flex items-center gap-2 p-3 rounded-lg border ${getFieldTypeColor(fieldType)}`}
                        >
                          {/* Type Icon */}
                          <div className="flex-shrink-0">
                            {getTypeIcon(fieldType)}
                          </div>

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
                            <SelectTrigger className="w-40 h-7 text-xs bg-white border-0 shadow-none focus:ring-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getFilterableColumns().map((col) => (
                                <SelectItem 
                                  key={`${col.table}:${col.id}`} 
                                  value={`${col.table}:${col.id}`}
                                >
                                  <div className="flex items-center gap-2">
                                    {getTypeIcon(col.type)}
                                    {col.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Operator Selector with Icon */}
                          <Select
                            value={filter.operator}
                            onValueChange={(value) => {
                              handleUpdateFilter(filter.id, {
                                operator: value as FilterConfig['operator']
                              });
                            }}
                          >
                            <SelectTrigger className="w-32 h-7 text-xs bg-white border-0 shadow-none focus:ring-0 flex items-center gap-1">
                              <SelectValue>
                                <div className="flex items-center gap-1">
                                  {getOperatorIcon(filter.operator)}
                                  <span className="text-xs">
                                    {filter.operator === 'equals' ? '=' : 
                                     filter.operator === 'contains' ? 'contains' :
                                     filter.operator === 'startsWith' ? 'starts' :
                                     filter.operator === 'greaterThan' ? '>' :
                                     filter.operator === 'lessThan' ? '<' : filter.operator}
                                  </span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {availableOperators.map((op) => (
                                <SelectItem key={op} value={op}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-neutral-500">{getOperatorIcon(op)}</span>
                                    <span>
                                      {op === 'equals' ? 'Equals' : 
                                       op === 'contains' ? 'Contains' :
                                       op === 'startsWith' ? 'Starts with' :
                                       op === 'greaterThan' ? 'Greater than' :
                                       op === 'lessThan' ? 'Less than' : op}
                                    </span>
                                  </div>
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
                              <SelectTrigger className="flex-1 h-7 text-xs border-0 bg-transparent shadow-none focus:ring-0">
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
                              className="flex-1 h-7 text-xs border-0 bg-transparent shadow-none focus-visible:ring-0"
                              placeholder="Enter value"
                            />
                          ) : fieldType === 'date' ? (
                            <Input
                              type="date"
                              value={filter.value as string || ''}
                              onChange={(e) => {
                                handleUpdateFilter(filter.id, { value: e.target.value });
                              }}
                              className="flex-1 h-7 text-xs border-0 bg-transparent shadow-none focus-visible:ring-0"
                            />
                          ) : (
                            <Input
                              type="text"
                              value={filter.value as string || ''}
                              onChange={(e) => {
                                handleUpdateFilter(filter.id, { value: e.target.value });
                              }}
                              className="flex-1 h-7 text-xs bg-white border-0 shadow-none focus-visible:ring-0"
                              placeholder="Enter value"
                            />
                          )}

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-white"
                            onClick={() => handleRemoveFilter(filter.id)}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Preview Count */}
              {filters.length > 0 && previewCount !== null && (
                <Card className={`border-2 ${
                  previewCount === 0 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2">
                      {previewCount === 0 ? (
                        <>
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <p className="text-sm font-medium text-red-900">
                            No assets match these filters
                          </p>
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 text-green-600" />
                          <p className="text-sm font-medium text-green-900">
                            <span className="text-lg font-bold">{previewCount}</span>
                            {' '}asset{previewCount !== 1 ? 's' : ''} match{previewCount === 1 ? 'es' : ''} these filters
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Add Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddFilter}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Filter
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
