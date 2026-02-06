'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
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
import type { AdvancedFilterState, AdvancedGroup, ConditionWithOperator, FilterConfig } from '@/lib/types/asset-list';
import { mockColumnDefs } from '@/lib/mock-data/asset-list';
import { buildAdvancedFilterPreview } from '@/lib/utils/filter-utils';

interface AdvancedFiltersDialogProps {
  open: boolean;
  onClose: () => void;
  initialState?: AdvancedFilterState;
  onApply: (state: AdvancedFilterState) => void;
}

export default function AdvancedFiltersDialog({
  open,
  onClose,
  initialState,
  onApply
}: AdvancedFiltersDialogProps) {
  const [state, setState] = useState<AdvancedFilterState>({
    type: 'advanced',
    groups: [],
  });

  // Синхронізуємо локальний стейт при відкритті
  useEffect(() => {
    if (!open) return;

    if (initialState && initialState.groups && initialState.groups.length > 0) {
      // Глибока копія, щоб не мутувати пропси
      setState({
        type: 'advanced',
        groups: initialState.groups.map((g) => ({
          id: g.id,
          name: g.name,
          conditions: g.conditions.map((c) => ({ ...c })),
        })),
      });
    } else {
      setState({
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
  }, [open, initialState]);

  const groups = state.groups || [];

  const getFilterableColumns = () => mockColumnDefs.filter((col) => col.filterable);

  const getFieldType = (fieldId: string, table: string): string => {
    const col = mockColumnDefs.find((c) => c.id === fieldId && c.table === table);
    return col?.type || 'text';
  };

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

  const updateState = (nextGroups: AdvancedGroup[]) => {
    setState({
      type: 'advanced',
      groups: nextGroups,
    });
  };

  const handleAddGroup = () => {
    const index = groups.length;
    const name = `Group ${index + 1}`;
    const newGroup: AdvancedGroup = {
      id: `group-${Date.now()}`,
      name,
      conditions: [],
    };
    updateState([...groups, newGroup]);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (groups.length === 1) {
      // Не видаляємо останню групу, лише очищаємо умови
      const only = groups[0];
      const cleared: AdvancedGroup = { ...only, conditions: [] };
      updateState([cleared]);
      return;
    }
    updateState(groups.filter((g) => g.id !== groupId));
  };

  const handleAddCondition = (groupId: string) => {
    const defaultColumn = getFilterableColumns()[0];
    const baseField = defaultColumn?.field || 'pipeSegment';
    const baseTable = (defaultColumn?.table as FilterConfig['table']) || 'asset';
    const fieldType = getFieldType(baseField, baseTable);
    const operators = getOperatorsForField(fieldType);

    const newCondition: ConditionWithOperator = {
      id: `cond-${Date.now()}`,
      field: baseField,
      operator: operators[0],
      value: '',
      table: baseTable,
      nextOperator: undefined,
    };

    const nextGroups = groups.map((g) => {
      if (g.id !== groupId) return g;

      const conds = [...g.conditions, newCondition];
      // Виставляємо nextOperator попередньої умови як AND за замовчуванням
      if (conds.length > 1) {
        const prevIndex = conds.length - 2;
        conds[prevIndex] = {
          ...conds[prevIndex],
          nextOperator: conds[prevIndex].nextOperator || 'AND',
        };
      }

      return { ...g, conditions: conds };
    });

    updateState(nextGroups);
  };

  const handleDeleteCondition = (groupId: string, conditionId: string) => {
    const nextGroups = groups.map((g) => {
      if (g.id !== groupId) return g;
      const conds = g.conditions.filter((c) => c.id !== conditionId);

      // Якщо після видалення лишається хоча б 2 умови — оновлюємо nextOperator передостанньої
      if (conds.length >= 2) {
        const lastIdx = conds.length - 1;
        conds[lastIdx].nextOperator = undefined;
      } else if (conds.length === 1) {
        conds[0].nextOperator = undefined;
      }

      return { ...g, conditions: conds };
    });

    updateState(nextGroups);
  };

  const handleUpdateCondition = (
    groupId: string,
    conditionId: string,
    updates: Partial<ConditionWithOperator>
  ) => {
    const nextGroups = groups.map((g) => {
      if (g.id !== groupId) return g;
      const conds = g.conditions.map((c) =>
        c.id === conditionId ? { ...c, ...updates } : c
      );
      return { ...g, conditions: conds };
    });
    updateState(nextGroups);
  };

  const handleUpdateLinkOperator = (groupId: string, conditionId: string, op: 'AND' | 'OR') => {
    const nextGroups = groups.map((g) => {
      if (g.id !== groupId) return g;
      const conds = g.conditions.map((c) =>
        c.id === conditionId ? { ...c, nextOperator: op } : c
      );
      return { ...g, conditions: conds };
    });
    updateState(nextGroups);
  };

  const handleApply = () => {
    // Очищаємо порожні умови та групи
    const cleanedGroups: AdvancedGroup[] = groups
      .map((g) => {
        const conds = g.conditions.filter((c) => c.field && c.value !== '');
        return { ...g, conditions: conds };
      })
      .filter((g) => g.conditions.length > 0);

    if (cleanedGroups.length === 0) {
      onClose();
      return;
    }

    onApply({
      type: 'advanced',
      groups: cleanedGroups,
    });
    onClose();
  };

  const previewText = buildAdvancedFilterPreview(state);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Advanced Filter Builder</DialogTitle>
          <p className="text-sm text-neutral-600 mt-2">
            Build complex AND/OR logic within groups. Groups are combined with OR.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {groups.map((group, groupIndex) => (
            <Card key={group.id} className="border-2 border-blue-200 bg-blue-50">
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-900">
                    {group.name || `Group ${groupIndex + 1}`}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDeleteGroup(group.id)}
                  aria-label="Delete group"
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.conditions.length === 0 ? (
                  <p className="text-xs text-neutral-600">
                    No conditions yet. Add at least one condition to this group.
                  </p>
                ) : (
                  group.conditions.map((condition, index) => {
                    const col = getFilterableColumns().find(
                      (c) => c.field === condition.field && c.table === condition.table
                    );
                    const fieldType = col?.type || getFieldType(condition.field, condition.table);
                    const operators = getOperatorsForField(fieldType);

                    return (
                      <div key={condition.id} className="space-y-1">
                        {index > 0 && (
                          <div className="flex items-center gap-3 pl-1">
                            <span className="text-[11px] text-neutral-600">Link with next:</span>
                            <RadioGroup
                              value={group.conditions[index - 1].nextOperator || 'AND'}
                              onValueChange={(val: 'AND' | 'OR') =>
                                handleUpdateLinkOperator(group.id, group.conditions[index - 1].id, val)
                              }
                              className="flex flex-row gap-3"
                            >
                              <div className="flex items-center gap-1">
                                <RadioGroupItem value="AND" id={`${group.id}-${index}-and`} />
                                <Label
                                  htmlFor={`${group.id}-${index}-and`}
                                  className="text-[11px] cursor-pointer"
                                >
                                  AND
                                </Label>
                              </div>
                              <div className="flex items-center gap-1">
                                <RadioGroupItem value="OR" id={`${group.id}-${index}-or`} />
                                <Label
                                  htmlFor={`${group.id}-${index}-or`}
                                  className="text-[11px] cursor-pointer"
                                >
                                  OR
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}

                        <div className="flex items-center gap-2 bg-white p-2 rounded border border-neutral-200">
                          {/* Field */}
                          <Select
                            value={`${condition.table}:${condition.field}`}
                            onValueChange={(value) => {
                              const [table, field] = value.split(':');
                              const newFieldType = getFieldType(field, table);
                              const newOps = getOperatorsForField(newFieldType);
                              handleUpdateCondition(group.id, condition.id, {
                                field,
                                table: table as FilterConfig['table'],
                                operator: newOps.includes(condition.operator)
                                  ? condition.operator
                                  : newOps[0],
                                value: '',
                              });
                            }}
                          >
                            <SelectTrigger className="w-40 h-8 text-xs">
                              <SelectValue placeholder="Field" />
                            </SelectTrigger>
                            <SelectContent>
                              {getFilterableColumns().map((c) => (
                                <SelectItem
                                  key={`${c.table}:${c.id}`}
                                  value={`${c.table}:${c.id}`}
                                >
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Operator */}
                          <Select
                            value={condition.operator}
                            onValueChange={(value) =>
                              handleUpdateCondition(group.id, condition.id, {
                                operator: value as FilterConfig['operator'],
                              })
                            }
                          >
                            <SelectTrigger className="w-28 h-8 text-xs">
                              <SelectValue placeholder="Op" />
                            </SelectTrigger>
                            <SelectContent>
                              {operators.map((op) => (
                                <SelectItem key={op} value={op}>
                                  {op}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Value */}
                          <Input
                            type={
                              fieldType === 'number'
                                ? 'number'
                                : fieldType === 'date'
                                ? 'date'
                                : 'text'
                            }
                            value={
                              typeof condition.value === 'string' ||
                              typeof condition.value === 'number'
                                ? String(condition.value)
                                : ''
                            }
                            onChange={(e) => {
                              const val =
                                fieldType === 'number'
                                  ? e.target.value === ''
                                    ? ''
                                    : Number(e.target.value)
                                  : e.target.value;
                              handleUpdateCondition(group.id, condition.id, { value: val });
                            }}
                            className="flex-1 h-8 text-xs"
                            placeholder="Value"
                          />

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleDeleteCondition(group.id, condition.id)}
                            aria-label="Delete condition"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleAddCondition(group.id)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add condition
                </Button>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={handleAddGroup}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add group
          </Button>

          {/* Preview */}
          <Card className="border-neutral-200 bg-neutral-50 mt-2">
            <CardHeader className="py-2">
              <span className="text-xs font-semibold text-neutral-700">Preview</span>
            </CardHeader>
            <CardContent className="py-2">
              <pre className="text-xs text-neutral-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {previewText}
              </pre>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Advanced Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}




