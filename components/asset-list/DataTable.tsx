'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreVertical, Eye, Edit, Copy, Trash2, ArrowUpDown, GripVertical, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Asset, ColumnDef } from '@/lib/types/asset-list';
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
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Column Header Component (moved outside to avoid webpack issues)
function SortableColumnHeader({ 
  column,
  onSort,
  onColumnReorder,
  isMounted
}: { 
  column: ColumnDef;
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  onColumnReorder?: (newOrder: string[]) => void;
  isMounted: boolean;
}) {
  // Always call useSortable (hooks rules), but only use it after mount
  const sortable = useSortable({ id: column.id });

  const style = (isMounted && onColumnReorder) ? {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.5 : 1,
  } : {};

  return (
    <TableHead
      scope="col"
      aria-label={column.label}
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 bg-neutral-50 border-b-2 border-neutral-300',
        column.sortable && 'cursor-pointer hover:bg-neutral-100 group'
      )}
      onClick={(e) => {
        // Don't sort if clicking on drag handle
        if ((e.target as HTMLElement).closest('button[aria-label*="Drag"]')) {
          return;
        }
        if (column.sortable) {
          onSort(column.field, 'asc');
        }
      }}
    >
      <div 
        ref={(isMounted && onColumnReorder) ? sortable.setNodeRef : undefined}
        style={style}
        className="flex items-center gap-2"
      >
        {onColumnReorder && (
          <button
            {...(isMounted ? sortable.attributes : {})}
            {...(isMounted ? sortable.listeners : {})}
            className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500"
            aria-label={`Drag to reorder ${column.label}`}
            type="button"
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        {column.label}
        {column.sortable && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpDown className="w-3 h-3 text-neutral-400" />
          </div>
        )}
      </div>
    </TableHead>
  );
}

interface DataTableProps {
  data: Asset[];
  columns: ColumnDef[];
  selectedRows: string[];
  onRowSelect: (rowIds: string[]) => void;
  onRowClick: (asset: Asset) => void;
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  onColumnReorder?: (newOrder: string[]) => void;
  onUpdateAsset?: (assetId: string, updates: Partial<Asset>) => void; // НОВИЙ: для inline editing
  loading?: boolean;
}

export default function DataTable({
  data,
  columns,
  selectedRows,
  onRowSelect,
  onRowClick,
  onSort,
  onColumnReorder,
  onUpdateAsset,
  loading = false
}: DataTableProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<Asset>>({});

  // Only enable drag-to-reorder on client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Drag and drop sensors - MUST be called before any early returns
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

  // Handle keyboard navigation - MUST be called before any early returns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key: cancel editing or deselect
      if (e.key === 'Escape') {
        if (editingRowId) {
          setEditingRowId(null);
          setEditingValues({});
        } else if (selectedRows.length > 0) {
          onRowSelect([]);
        }
      }
      
      // Arrow keys: navigate between rows (when not editing)
      if (!editingRowId && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        const currentIndex = selectedRows.length > 0 
          ? data.findIndex(a => a.id === selectedRows[0])
          : -1;
        
        if (e.key === 'ArrowDown' && currentIndex < data.length - 1) {
          const nextAsset = data[currentIndex + 1];
          onRowSelect([nextAsset.id]);
          // Scroll to row
          setTimeout(() => {
            const row = document.querySelector(`[data-asset-id="${nextAsset.id}"]`);
            row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
          const prevAsset = data[currentIndex - 1];
          onRowSelect([prevAsset.id]);
          // Scroll to row
          setTimeout(() => {
            const row = document.querySelector(`[data-asset-id="${prevAsset.id}"]`);
            row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingRowId, selectedRows, data, onRowSelect]);

  // Handle drag end for columns
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id && onColumnReorder) {
      const oldIndex = columns.findIndex(col => col.id === active.id);
      const newIndex = columns.findIndex(col => col.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(columns, oldIndex, newIndex).map(col => col.id);
        onColumnReorder(newOrder);
      }
    }
  };

  // Get cell value based on column field
  const getCellValue = (asset: Asset, column: ColumnDef): string | number => {
    if (column.table === 'asset') {
      return (asset as unknown as Record<string, unknown>)[column.field] as string | number ?? '';
    } else if (column.table === 'inspection' && asset.latestInspection) {
      return (asset.latestInspection as unknown as Record<string, unknown>)[column.field] as string | number ?? '';
    } else if (column.table === 'observation') {
      if (column.field === 'observationCount') return asset.observationCount;
      if (column.field === 'hasDefects') return asset.hasDefects ? 'Yes' : 'No';
      if (column.field === 'maxGrade') return asset.maxGrade ?? '';
    }
    return '';
  };

  // Inline editing handlers
  const startEditing = (asset: Asset) => {
    setEditingRowId(asset.id);
    setEditingValues({ ...asset });
  };

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditingValues({});
  };

  const saveEditing = () => {
    if (editingRowId && onUpdateAsset) {
      onUpdateAsset(editingRowId, editingValues);
      setEditingRowId(null);
      setEditingValues({});
    }
  };

  const updateField = (field: string, value: unknown) => {
    setEditingValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle row click (ignore clicks on interactive elements)
  const handleRowClick = (asset: Asset, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('[role="checkbox"]') ||
      editingRowId === asset.id // Don't navigate when editing
    ) {
      return;
    }
    onRowClick(asset);
  };

  // Handle checkbox change
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onRowSelect(data.map(asset => asset.id));
    } else {
      onRowSelect([]);
    }
  };

  const handleSelectRow = (assetId: string, checked: boolean) => {
    if (checked) {
      onRowSelect([...selectedRows, assetId]);
    } else {
      onRowSelect(selectedRows.filter(id => id !== assetId));
    }
  };

  // Row actions
  const handleViewDetails = (asset: Asset) => {
    router.push(`/inspection/${asset.id}`);
  };

  const handleEdit = (asset: Asset) => {
    // TODO: Open edit dialog
    console.log('Edit asset:', asset.id);
  };

  const handleDuplicate = (asset: Asset) => {
    // TODO: Duplicate asset
    console.log('Duplicate asset:', asset.id);
  };

  const handleDelete = (asset: Asset) => {
    // TODO: Show delete confirmation
    console.log('Delete asset:', asset.id);
  };

  const allSelected = data.length > 0 && selectedRows.length === data.length;

  // Render header row content
  const headerRowContent = (
    <TableRow>
      {/* Checkbox column */}
      <TableHead className="w-12" scope="col">
        <Checkbox
          checked={allSelected}
          onCheckedChange={handleSelectAll}
          aria-label="Select all assets"
        />
      </TableHead>

      {/* Data columns */}
      {columns.map((column) => (
        <SortableColumnHeader
          key={column.id}
          column={column}
          onSort={onSort}
          onColumnReorder={onColumnReorder}
          isMounted={isMounted}
        />
      ))}

      {/* Actions column */}
      <TableHead className="w-12" scope="col" aria-label="Actions"></TableHead>
    </TableRow>
  );

  // Table content
  const tableContent = (
    <Table role="table" aria-label="Asset list table">
      <TableHeader className="sticky top-0 bg-white z-10">
        {onColumnReorder && isMounted ? (
          <SortableContext
            items={columns.map(col => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            {headerRowContent}
          </SortableContext>
        ) : (
          headerRowContent
        )}
      </TableHeader>
      <TableBody>
          {data.length > 0 ? data.map((asset, index) => {
            const isSelected = selectedRows.includes(asset.id);
            const isEditing = editingRowId === asset.id;
            return (
              <TableRow
                key={asset.id}
                data-asset-id={asset.id}
                tabIndex={isSelected ? 0 : -1}
                aria-selected={isSelected}
                aria-label={`Asset ${asset.pipeSegment || asset.id}`}
                className={cn(
                  'h-14 transition-colors',
                  isEditing 
                    ? 'bg-blue-50 border-blue-300 border-2' 
                    : 'cursor-pointer',
                  !isEditing && index % 2 === 0 ? 'bg-white' : !isEditing ? 'bg-neutral-50' : '',
                  !isEditing && isSelected && 'bg-orange-50',
                  !isEditing && 'hover:bg-neutral-100',
                  isSelected && 'focus:outline-2 focus:outline-orange-500 focus:outline-offset-2'
                )}
                onClick={(e) => !isEditing && handleRowClick(asset, e)}
                onKeyDown={(e) => {
                  if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRowClick(asset);
                  }
                }}
              >
                {/* Checkbox / Edit indicator */}
                <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                  {!isEditing ? (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleSelectRow(asset.id, checked as boolean)
                      }
                      aria-label={`Select asset ${asset.pipeSegment || asset.id}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Edit className="w-3 h-3 text-white" />
                    </div>
                  )}
                </TableCell>

                {/* Data cells */}
                {columns.map((column) => {
                  const isEditable = column.field !== 'id' && 
                                   column.field !== 'pipeSegment' &&
                                   column.type !== 'date' &&
                                   column.table === 'asset'; // Only allow editing asset fields for now

                  return (
                    <TableCell key={column.id} className="px-4 py-3 text-sm" onClick={(e) => isEditing && e.stopPropagation()}>
                      {isEditing && isEditable ? (
                        // Edit mode input
                        <Input
                          value={String(editingValues[column.field as keyof Asset] || '')}
                          onChange={(e) => updateField(column.field, e.target.value)}
                          className="h-8 text-sm"
                          autoFocus={columns.indexOf(column) === 1} // Focus first editable field
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        // Display mode
                        <span>{getCellValue(asset, column)}</span>
                      )}
                    </TableCell>
                  );
                })}

                {/* Actions */}
                <TableCell
                  className="w-12"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isEditing ? (
                    // Edit mode actions
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        onClick={saveEditing}
                        className="h-7 text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditing}
                        className="h-7 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    // Normal mode actions
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(asset)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {onUpdateAsset && (
                          <DropdownMenuItem onClick={() => startEditing(asset)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Asset
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDuplicate(asset)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(asset)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          }) : (
            <TableRow>
              <TableCell colSpan={columns.length + 2} className="text-center py-8 text-neutral-500">
                No assets found
              </TableCell>
            </TableRow>
          )}
      </TableBody>
    </Table>
  );


  // Wrap table in DndContext if drag-to-reorder is enabled and mounted
  return (
    <div className="w-full">
      {/* Accessibility: Status announcement for selection */}
      <div role="status" aria-live="polite" className="sr-only">
        {selectedRows.length > 0 
          ? `${selectedRows.length} asset${selectedRows.length === 1 ? '' : 's'} selected`
          : 'No assets selected'}
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-neutral-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-neutral-600">Loading assets...</p>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">No assets found</h3>
              <p className="text-sm text-neutral-600 mt-1">
                No assets match your current filters. Try removing some filters.
              </p>
            </div>
          </div>
        </div>
      ) : onColumnReorder && isMounted ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div style={{ width: '100%' }}>
            {tableContent}
          </div>
        </DndContext>
      ) : (
        tableContent
      )}
    </div>
  );
}
