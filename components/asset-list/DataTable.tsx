'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreVertical, Eye, Edit, Copy, Trash2, ArrowUpDown, GripVertical, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Asset, ColumnDef, AssetType } from '@/lib/types/asset-list';
import { isFilterApplicable } from '@/lib/utils/asset-type-utils';
import { ActionsColumnHeader, ActionsColumnCell } from './ActionsColumn';
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
  onStartEditing?: (assetId: string) => void; // НОВИЙ: для bulk edit з FloatingSelectionBar
  onDuplicate?: (asset: Asset) => void; // НОВИЙ: для duplicate action
  onDelete?: (asset: Asset) => void; // НОВИЙ: для delete action
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
  onStartEditing,
  onDuplicate,
  onDelete,
  loading = false
}: DataTableProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null); // null = full row edit, string = single field edit
  const [editingValues, setEditingValues] = useState<Partial<Asset>>({});
  const [savingField, setSavingField] = useState<string | null>(null);
  const [savedField, setSavedField] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);

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

  // Check if column field is applicable to asset type
  const isFieldApplicable = (asset: Asset, column: ColumnDef): boolean => {
    // For asset_type column, always applicable
    if (column.field === 'asset_type') return true;
    
    // Check if field is applicable to this asset type
    const filterConfig = {
      id: column.id,
      field: column.field,
      operator: 'equals' as const,
      value: '',
      table: column.table
    };
    return isFilterApplicable(filterConfig, asset.asset_type);
  };

  // Get cell value based on column field
  const getCellValue = (asset: Asset, column: ColumnDef): string | number | boolean | null => {
    // If field is not applicable to asset type, return null (will show as "-")
    if (!isFieldApplicable(asset, column)) {
      return null;
    }
    
    if (column.table === 'asset') {
      const value = (asset as unknown as Record<string, unknown>)[column.field];
      if (value === null || value === undefined) {
        // Handle empty values - show empty string or appropriate fallback
        return '';
      }
      // Format specific fields for display
      if (column.field === 'depth' && typeof value === 'number') {
        // Format depth as "X ft Y in" or "X ft"
        const feet = Math.floor(value);
        const inches = Math.round((value - feet) * 12);
        if (inches > 0) {
          return `${feet} ft ${inches} in` as unknown as string | number | boolean;
        }
        return `${feet} ft` as unknown as string | number | boolean;
      }
      if (column.field === 'width' && typeof value === 'number') {
        // Format width as "X in"
        return `${value} in` as unknown as string | number | boolean;
      }
      if (column.field === 'length' && typeof value === 'number') {
        // Format length as "X ft"
        return `${value} ft` as unknown as string | number | boolean;
      }
      return value as string | number | boolean;
    } else if (column.table === 'inspection' && asset.latestInspection) {
      const value = (asset.latestInspection as unknown as Record<string, unknown>)[column.field];
      if (value === null || value === undefined) return '';
      return value as string | number | boolean;
    } else if (column.table === 'observation') {
      if (column.field === 'observationCount') return asset.observationCount ?? 0;
      if (column.field === 'hasDefects') return asset.hasDefects ?? false;
      if (column.field === 'maxGrade') return asset.maxGrade ?? '';
    }
    return '';
  };

  // Get current editing value for a field
  const getEditingValue = (column: ColumnDef): unknown => {
    if (editingField === null) {
      // Full row edit - get from editingValues
      return editingValues[column.field as keyof Asset];
    } else {
      // Single field edit
      return editingValues[column.field as keyof Asset];
    }
  };

  // Get options for select fields (simple mock options)
  const getSelectOptions = (field: string, table: string): string[] => {
    // Mock options based on field name
    if (field === 'material') {
      return ['PVC', 'Concrete', 'Clay', 'HDPE', 'Ductile Iron', 'Other'];
    }
    if (field === 'preCleaning') {
      return ['Yes', 'No'];
    }
    if (field === 'direction') {
      return ['Upstream', 'Downstream', 'Both'];
    }
    if (field === 'weather') {
      return ['Clear', 'Cloudy', 'Rain', 'Snow'];
    }
    if (field === 'hasDefects') {
      return ['Yes', 'No'];
    }
    // Manhole specific fields
    if (field === 'coverType') {
      return ['Solid', 'Vented', 'Keyed'];
    }
    if (field === 'frameType') {
      return ['Standard', 'Heavy Duty', 'Custom'];
    }
    if (field === 'condition') {
      return ['Excellent', 'Good', 'Fair', 'Poor', 'Failed'];
    }
    // Lateral specific fields
    if (field === 'serviceType') {
      return ['Residential', 'Commercial', 'Industrial'];
    }
    return [];
  };

  // Inline editing handlers
  // Full row edit mode (from Edit menu)
  const startEditing = (asset: Asset) => {
    // If another row is in edit mode, cancel it first
    if (editingRowId && editingRowId !== asset.id) {
      cancelEditing();
    }
    setEditingRowId(asset.id);
    setEditingField(null); // null = full row edit
    
    // Collect all editable values from asset
    const allValues: Partial<Asset> = { ...asset };
    if (asset.latestInspection) {
      // Add inspection fields to editing values
      Object.keys(asset.latestInspection).forEach(key => {
        (allValues as unknown as Record<string, unknown>)[key] = 
          (asset.latestInspection as unknown as Record<string, unknown>)[key];
      });
    }
    // Add observation fields
    allValues.observationCount = asset.observationCount;
    allValues.hasDefects = asset.hasDefects;
    allValues.maxGrade = asset.maxGrade;
    
    setEditingValues(allValues);
  };

  // Single field edit mode (from clicking on field)
  const startFieldEdit = (asset: Asset, column: ColumnDef) => {
    // If another row is in edit mode, cancel it first
    if (editingRowId && editingRowId !== asset.id) {
      cancelEditing();
    }
    setEditingRowId(asset.id);
    setEditingField(column.field); // specific field
    
    // Get current value based on table type
    let currentValue: unknown;
    if (column.table === 'asset') {
      currentValue = (asset as unknown as Record<string, unknown>)[column.field];
    } else if (column.table === 'inspection' && asset.latestInspection) {
      currentValue = (asset.latestInspection as unknown as Record<string, unknown>)[column.field];
    } else if (column.table === 'observation') {
      if (column.field === 'observationCount') currentValue = asset.observationCount;
      else if (column.field === 'hasDefects') currentValue = asset.hasDefects;
      else if (column.field === 'maxGrade') currentValue = asset.maxGrade;
      else currentValue = '';
    } else {
      currentValue = '';
    }
    
    setEditingValues({ [column.field]: currentValue });
  };

  // Expose startEditing for external calls (bulk edit from FloatingSelectionBar)
  useEffect(() => {
    const handleExternalEdit = () => {
      if (selectedRows.length > 0 && !editingRowId) {
        const firstSelected = data.find(asset => asset.id === selectedRows[0]);
        if (firstSelected) {
          startEditing(firstSelected);
          // Scroll to the editing row
          setTimeout(() => {
            const row = document.querySelector(`[data-asset-id="${firstSelected.id}"]`);
            if (row) {
              row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      }
    };
    
    // Store handler for external calls
    if (typeof window !== 'undefined') {
      (window as Window & { __startEditingSelected?: () => void }).__startEditingSelected = handleExternalEdit;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as Window & { __startEditingSelected?: () => void }).__startEditingSelected;
      }
    };
  }, [selectedRows, data, editingRowId]);

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditingField(null);
    setEditingValues({});
    setSavingField(null);
    setSavedField(null);
    setErrorField(null);
  };

  // Save all changes in edit mode
  const handleSaveAll = async () => {
    if (!editingRowId || !onUpdateAsset) return;

    // If single field edit, save that field and exit
    if (editingField !== null) {
      const value = editingValues[editingField as keyof Asset];
      const success = await handleSaveCell(editingField, value);
      // handleSaveCell already exits edit mode for single field edit
      return;
    }

    // Full row edit: save all modified fields
    try {
      // Validate all fields
      const hasErrors = Object.keys(editingValues).some(field => {
        const value = editingValues[field as keyof Asset];
        return !validateField(field, value);
      });

      if (hasErrors) {
        // Show error, don't save
        setErrorField('multiple');
        setTimeout(() => setErrorField(null), 3000);
        return;
      }

      // Show saving indicator
      setSavingField('all');

      // Save all fields
      const result = onUpdateAsset(editingRowId, editingValues);
      if (result && typeof (result as { then?: unknown }).then === 'function') {
        await (result as Promise<void>);
      }
      
      // Clear saving indicator
      setSavingField(null);
      
      // Exit edit mode
      cancelEditing();
      
      // Show success indicator
      setSavedField('all');
      setTimeout(() => setSavedField(null), 500);
      
      // Show success toast
      toast.success('Збережено', {
        description: 'Всі зміни успішно збережено',
      });
    } catch (error) {
      console.error('Save failed:', error);
      setSavingField(null);
      setErrorField('multiple');
      setTimeout(() => setErrorField(null), 3000);
      
      // Show error toast
      toast.error('Помилка збереження', {
        description: 'Не вдалося зберегти зміни',
      });
    }
  };

  // Auto-save handler for single field
  const handleSaveCell = async (field: string, value: unknown): Promise<boolean> => {
    if (!editingRowId || !onUpdateAsset) return false;

    // Validate field (basic validation)
    const isValid = validateField(field, value);
    if (!isValid) {
      setErrorField(field);
      setTimeout(() => setErrorField(null), 3000);
      return false;
    }

    // Clear previous states
    setErrorField(null);
    setSavingField(field);

    try {
      // Update local state optimistically
      const updatedValues = { ...editingValues, [field]: value };
      setEditingValues(updatedValues);

      // Call update handler (wrap in Promise if needed)
      if (onUpdateAsset) {
        const result = onUpdateAsset(editingRowId, { [field]: value });
        // Handle both sync and async updates
        if (result && typeof (result as { then?: unknown }).then === 'function') {
          await result;
        }
      }

      // Show success indicator
      setSavingField(null);
      setSavedField(field);
      setTimeout(() => {
        setSavedField(null);
        // Exit edit mode after successful save
        // If single field edit, exit completely. If full row edit, stay in edit mode
        if (editingField === field) {
          // Single field edit: exit completely
          setEditingRowId(null);
          setEditingField(null);
          setEditingValues({});
        }
        // Full row edit: stay in edit mode, just clear the saved indicator
      }, 500);
      
      // Show success toast
      toast.success('Збережено', {
        description: 'Зміни успішно збережено',
      });
      
      // Return success status
      return true;
    } catch (error) {
      // Rollback on error
      setSavingField(null);
      setErrorField(field);
      setTimeout(() => setErrorField(null), 3000);
      console.error('Save failed:', error);
      
      // Show error toast
      toast.error('Помилка збереження', {
        description: 'Не вдалося зберегти зміни',
      });
      
      return false;
    }
  };

  // Basic field validation
  const validateField = (field: string, value: unknown): boolean => {
    // Add validation rules as needed
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
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
      target.closest('select') ||
      target.closest('[role="checkbox"]') ||
      target.closest('span[class*="cursor-pointer"]') || // Ignore clicks on editable text
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
    // Start full row edit mode
    startEditing(asset);
  };

  const handleDuplicate = (asset: Asset) => {
    if (onDuplicate) {
      onDuplicate(asset);
    } else {
      console.log('Duplicate asset:', asset.id);
    }
  };

  const handleDelete = (asset: Asset) => {
    if (onDelete) {
      onDelete(asset);
    } else {
      console.log('Delete asset:', asset.id);
    }
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

      {/* Actions column - Fixed sticky column */}
      <ActionsColumnHeader />
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
            const isFullRowEdit = isEditing && editingField === null;
            return (
              <TableRow
                key={asset.id}
                data-asset-id={asset.id}
                tabIndex={isSelected ? 0 : -1}
                aria-selected={isSelected}
                aria-label={`Asset ${asset.pipeSegment || asset.id}`}
                className={cn(
                  'h-14 transition-colors',
                  isFullRowEdit 
                    ? 'bg-yellow-50 border-yellow-300 border-2' 
                    : isEditing
                    ? 'bg-blue-50' // Single field edit - subtle background
                    : 'cursor-pointer',
                  !isEditing && index % 2 === 0 ? 'bg-white' : !isEditing ? 'bg-neutral-50' : '',
                  !isEditing && isSelected && 'bg-gray-100',
                  !isEditing && 'hover:bg-gray-50',
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
                  // All fields are editable except:
                  // - id (never editable)
                  // - asset_type (read-only in combined view)
                  // - fields not applicable to this asset type (will show "-")
                  const isFieldApplicableToAsset = isFieldApplicable(asset, column);
                  const isEditable = column.field !== 'id' && column.field !== 'asset_type' && isFieldApplicableToAsset;

                  const isEditingThisField = editingRowId === asset.id && 
                                            (editingField === null || editingField === column.field);
                  const isSaving = savingField === column.field;
                  const isSaved = savedField === column.field;
                  const hasError = errorField === column.field;

                  // Handle click on editable field text only
                  const handleFieldClick = (e: React.MouseEvent) => {
                    if (isEditable && !isEditingThisField) {
                      e.stopPropagation();
                      startFieldEdit(asset, column);
                    }
                  };

                  return (
                    <TableCell 
                      key={column.id} 
                      className="px-4 py-3 text-sm"
                    >
                      {isEditingThisField && isEditable ? (
                        // Edit mode input with auto-save - different input types based on column type
                        <div className="relative flex items-center gap-2">
                          {column.type === 'select' ? (
                            // Select dropdown
                            <Select
                              value={(() => {
                                const val = getEditingValue(column);
                                if (typeof val === 'boolean') {
                                  return val ? 'Yes' : 'No';
                                }
                                return String(val || '');
                              })()}
                              onValueChange={(value) => {
                                // Convert string to boolean if needed
                                let convertedValue: unknown = value;
                                if (column.field === 'hasDefects' || column.field === 'preCleaning') {
                                  convertedValue = value === 'Yes' || value === 'true';
                                }
                                updateField(column.field, convertedValue);
                                // Auto-save on change for select
                                setTimeout(() => {
                                  handleSaveCell(column.field, convertedValue);
                                }, 100);
                              }}
                            >
                              <SelectTrigger 
                                className={cn(
                                  "h-8 text-sm w-full",
                                  hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
                                  !hasError && "border-blue-500 focus:border-blue-500 focus:ring-blue-500"
                                )}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isSaving}
                              >
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                {getSelectOptions(column.field, column.table).map(option => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : column.type === 'date' ? (
                            // Date input
                            <Input
                              type="date"
                              value={(() => {
                                const val = getEditingValue(column);
                                if (!val) return '';
                                // Convert to YYYY-MM-DD format
                                if (typeof val === 'string') {
                                  return val.split('T')[0]; // Remove time if present
                                }
                                return '';
                              })()}
                              onChange={(e) => updateField(column.field, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveCell(column.field, getEditingValue(column));
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  cancelEditing();
                                }
                              }}
                              onBlur={() => {
                                if (editingField === column.field) {
                                  handleSaveCell(column.field, getEditingValue(column));
                                }
                              }}
                              className={cn(
                                "h-8 text-sm",
                                hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
                                !hasError && "border-blue-500 focus:border-blue-500 focus:ring-blue-500"
                              )}
                              autoFocus={true}
                              onClick={(e) => e.stopPropagation()}
                              disabled={isSaving}
                              data-field={column.field}
                            />
                          ) : column.type === 'number' ? (
                            // Number input
                            <Input
                              type="number"
                              value={getEditingValue(column) || ''}
                              onChange={(e) => {
                                const numValue = e.target.value === '' ? null : Number(e.target.value);
                                updateField(column.field, numValue);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveCell(column.field, getEditingValue(column));
                                  // In full row edit mode, move to next field
                                  if (editingField === null) {
                                    const currentIndex = columns.findIndex(col => col.id === column.id);
                                    const nextEditable = columns.slice(currentIndex + 1).find(col => col.field !== 'id');
                                    if (nextEditable) {
                                      setTimeout(() => {
                                        const nextInput = document.querySelector(`[data-field="${nextEditable.field}"]`) as HTMLInputElement;
                                        nextInput?.focus();
                                      }, 100);
                                    }
                                  }
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  cancelEditing();
                                } else if (e.key === 'Tab' && editingField === null) {
                                  e.preventDefault();
                                  handleSaveCell(column.field, getEditingValue(column));
                                }
                              }}
                              data-field={column.field}
                              className={cn(
                                "h-8 text-sm",
                                hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
                                !hasError && "border-blue-500 focus:border-blue-500 focus:ring-blue-500"
                              )}
                              autoFocus={true}
                              onFocus={(e) => e.target.select()}
                              onClick={(e) => e.stopPropagation()}
                              disabled={isSaving}
                            />
                          ) : (
                            // Text input (default)
                            <Input
                              type="text"
                              value={String(getEditingValue(column) || '')}
                              onChange={(e) => updateField(column.field, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveCell(column.field, getEditingValue(column));
                                  // In full row edit mode, move to next field
                                  if (editingField === null) {
                                    const currentIndex = columns.findIndex(col => col.id === column.id);
                                    const nextEditable = columns.slice(currentIndex + 1).find(col => col.field !== 'id');
                                    if (nextEditable) {
                                      setTimeout(() => {
                                        const nextInput = document.querySelector(`[data-field="${nextEditable.field}"]`) as HTMLInputElement;
                                        nextInput?.focus();
                                      }, 100);
                                    }
                                  }
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  cancelEditing();
                                } else if (e.key === 'Tab' && editingField === null) {
                                  e.preventDefault();
                                  handleSaveCell(column.field, getEditingValue(column));
                                }
                              }}
                              data-field={column.field}
                              onBlur={() => {
                                if (editingField === column.field) {
                                  handleSaveCell(column.field, getEditingValue(column));
                                }
                              }}
                              className={cn(
                                "h-8 text-sm",
                                hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
                                !hasError && "border-blue-500 focus:border-blue-500 focus:ring-blue-500"
                              )}
                              autoFocus={true}
                              onFocus={(e) => e.target.select()}
                              onClick={(e) => e.stopPropagation()}
                              disabled={isSaving}
                            />
                          )}
                          {/* Visual feedback indicators */}
                          {isSaving && (
                            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                          )}
                          {isSaved && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                          {hasError && (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      ) : (
                        // Display mode - clickable text only
                        <span
                          className={cn(
                            "inline-block",
                            isEditable && !isEditingThisField && column.field !== 'asset_type' && "cursor-pointer hover:bg-blue-50 hover:underline px-1 py-0.5 rounded transition-colors"
                          )}
                          onClick={isEditable && !isEditingThisField && column.field !== 'asset_type' ? handleFieldClick : undefined}
                          title={isEditable && !isEditingThisField && column.field !== 'asset_type' ? "Click to edit" : undefined}
                        >
                          {(() => {
                            // Special handling for asset_type column (combined view)
                            if (column.field === 'asset_type') {
                              const type = asset.asset_type;
                              const typeColors = {
                                'ML': 'bg-blue-100 text-blue-700',
                                'MH': 'bg-red-100 text-red-700',
                                'L': 'bg-green-100 text-green-700'
                              };
                              const typeLabels = {
                                'ML': 'ML',
                                'MH': 'MH',
                                'L': 'L'
                              };
                              return (
                                <span className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                  typeColors[type] || 'bg-neutral-100 text-neutral-700'
                                )}>
                                  {typeLabels[type] || type}
                                </span>
                              );
                            }
                            
                            const value = getCellValue(asset, column);
                            
                            // Show "-" for fields not applicable to this asset type
                            if (value === null) {
                              return (
                                <span className="text-neutral-400 italic">—</span>
                              );
                            }
                            
                            if (typeof value === 'boolean') {
                              return value ? 'Yes' : 'No';
                            }
                            return value;
                          })()}
                        </span>
                      )}
                    </TableCell>
                  );
                })}

                {/* Actions - Fixed sticky column */}
                <ActionsColumnCell
                  asset={asset}
                  isEditing={isEditing}
                  onViewDetails={handleViewDetails}
                  onEdit={onUpdateAsset ? () => startEditing(asset) : handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onSave={isEditing && onUpdateAsset ? handleSaveAll : undefined}
                  onCancel={isEditing ? cancelEditing : undefined}
                />
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
      ) : (
        <div className="overflow-x-auto">
          {onColumnReorder && isMounted ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              {tableContent}
            </DndContext>
          ) : (
            tableContent
          )}
        </div>
      )}
    </div>
  );
}
