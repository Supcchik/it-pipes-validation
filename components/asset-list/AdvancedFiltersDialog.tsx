'use client';

import { useState } from 'react';
import { Plus, X, GripVertical, Trash2 } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { FilterGroup, FilterCondition, ComplexFilter } from '@/lib/types/asset-list';
import { mockColumnDefs } from '@/lib/mock-data/asset-list';

interface AdvancedFiltersDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (filter: ComplexFilter) => void;
  initialFilter?: ComplexFilter;
}

export default function AdvancedFiltersDialog({
  open,
  onClose,
  onApply,
  initialFilter
}: AdvancedFiltersDialogProps) {
  // Initialize with one empty group if no initial filter
  const [groups, setGroups] = useState<FilterGroup[]>(
    initialFilter?.groups || [
      {
        id: `group-${Date.now()}`,
        conditions: [],
        operator: 'AND'
      }
    ]
  );
  const [groupOperator, setGroupOperator] = useState<'AND' | 'OR'>(
    initialFilter?.groupOperator || 'OR'
  );

  // Add new group
  const handleAddGroup = () => {
    setGroups([...groups, {
      id: `group-${Date.now()}`,
      conditions: [],
      operator: 'AND'
    }]);
  };

  // Delete group
  const handleDeleteGroup = (groupId: string) => {
    if (groups.length === 1) {
      // Keep at least one group, just clear conditions
      setGroups([{
        id: groups[0].id,
        conditions: [],
        operator: 'AND'
      }]);
    } else {
      setGroups(groups.filter(g => g.id !== groupId));
    }
  };

  // Add condition to group
  const handleAddCondition = (groupId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: [...group.conditions, {
            id: `condition-${Date.now()}`,
            field: '',
            operator: 'equals',
            value: ''
          }]
        };
      }
      return group;
    }));
  };

  // Delete condition from group
  const handleDeleteCondition = (groupId: string, conditionId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: group.conditions.filter(c => c.id !== conditionId)
        };
      }
      return group;
    }));
  };

  // Update condition
  const handleUpdateCondition = (
    groupId: string,
    conditionId: string,
    updates: Partial<FilterCondition>
  ) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: group.conditions.map(c =>
            c.id === conditionId ? { ...c, ...updates } : c
          )
        };
      }
      return group;
    }));
  };

  // Update group operator
  const handleUpdateGroupOperator = (groupId: string, operator: 'AND' | 'OR') => {
    setGroups(groups.map(group =>
      group.id === groupId ? { ...group, operator } : group
    ));
  };

  // Get editable columns
  const editableColumns = mockColumnDefs.filter(col =>
    col.table === 'asset' &&
    col.field !== 'id' &&
    col.field !== 'pipeSegment'
  );

  // Apply filters
  const handleApply = () => {
    // Filter out empty groups and conditions
    const validGroups = groups
      .map(group => ({
        ...group,
        conditions: group.conditions.filter(c => c.field && c.value !== '')
      }))
      .filter(group => group.conditions.length > 0);

    if (validGroups.length === 0) {
      onClose();
      return;
    }

    onApply({
      groups: validGroups,
      groupOperator
    });
    onClose();
  };

  const getGroupColor = (index: number): string => {
    const colors = [
      'bg-blue-50 border-blue-200',
      'bg-green-50 border-green-200',
      'bg-yellow-50 border-yellow-200',
      'bg-purple-50 border-purple-200',
      'bg-pink-50 border-pink-200'
    ];
    return colors[index % colors.length];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
          <p className="text-sm text-neutral-600 mt-2">
            Create grouped filter conditions with AND/OR logic
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {groups.map((group, groupIndex) => (
            <div key={group.id} className="space-y-3">
              {/* Group Header */}
              <div className={`flex items-center justify-between p-3 rounded-lg border-2 ${getGroupColor(groupIndex)}`}>
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-neutral-400" />
                  <Label className="text-sm font-semibold">
                    Group {groupIndex + 1}
                  </Label>
                  <div className="flex items-center gap-2">
                    <RadioGroup
                      value={group.operator}
                      onValueChange={(val: 'AND' | 'OR') => handleUpdateGroupOperator(group.id, val)}
                      className="flex-row gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="AND" id={`${group.id}-and`} />
                        <Label htmlFor={`${group.id}-and`} className="text-xs cursor-pointer">AND</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="OR" id={`${group.id}-or`} />
                        <Label htmlFor={`${group.id}-or`} className="text-xs cursor-pointer">OR</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDeleteGroup(group.id)}
                  aria-label="Delete group"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>

              {/* Conditions in Group */}
              <div className="space-y-2 pl-8">
                {group.conditions.length === 0 ? (
                  <div className="text-sm text-neutral-500 italic py-2">
                    No conditions yet. Click &quot;+ Add Condition&quot; to start.
                  </div>
                ) : (
                  group.conditions.map((condition, conditionIndex) => (
                    <div key={condition.id} className="flex items-center gap-2">
                      {conditionIndex > 0 && (
                        <span className="text-xs font-medium text-neutral-500 w-12 text-center">
                          {group.operator}
                        </span>
                      )}
                      <div className="flex-1 flex items-center gap-2 bg-white p-2 rounded border border-neutral-200">
                        {/* Field */}
                        <Select
                          value={condition.field}
                          onValueChange={(value) => handleUpdateCondition(group.id, condition.id, { field: value })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Field..." />
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
                          value={condition.operator}
                          onValueChange={(value: FilterCondition['operator']) =>
                            handleUpdateCondition(group.id, condition.id, { operator: value })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">=</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="startsWith">Starts with</SelectItem>
                            <SelectItem value="greaterThan">&gt;</SelectItem>
                            <SelectItem value="lessThan">&lt;</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Value */}
                        <Input
                          value={String(condition.value || '')}
                          onChange={(e) => handleUpdateCondition(group.id, condition.id, { value: e.target.value })}
                          placeholder="Value..."
                          className="flex-1"
                        />

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteCondition(group.id, condition.id)}
                          aria-label="Delete condition"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}

                {/* Add Condition Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddCondition(group.id)}
                  className="ml-12"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Condition
                </Button>
              </div>
            </div>
          ))}

          {/* Between Groups Operator */}
          {groups.length > 1 && (
            <div className="flex items-center justify-center py-2">
              <RadioGroup
                value={groupOperator}
                onValueChange={(val: 'AND' | 'OR') => setGroupOperator(val)}
                className="flex-row gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="AND" id="group-and" />
                  <Label htmlFor="group-and" className="text-sm font-medium cursor-pointer">AND</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="OR" id="group-or" />
                  <Label htmlFor="group-or" className="text-sm font-medium cursor-pointer">OR</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Add Group Button */}
          <Button
            variant="outline"
            onClick={handleAddGroup}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Group
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
