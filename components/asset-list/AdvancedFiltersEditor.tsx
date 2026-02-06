'use client';

import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AdvancedFilterState, AdvancedGroup, ConditionWithOperator, FilterConfig } from '@/lib/types/asset-list';
import { mockColumnDefs } from '@/lib/mock-data/asset-list';

interface AdvancedFiltersEditorProps {
  state: AdvancedFilterState;
  onChange: (next: AdvancedFilterState) => void;
}

export default function AdvancedFiltersEditor({ state, onChange }: AdvancedFiltersEditorProps) {
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
    onChange({
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

  return (
    <div className="space-y-4">
      {groups.map((group, groupIndex) => (
        <Card key={group.id} className="border border-[#E4E4E7] bg-white rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#3F3F46]">
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
                      <div className="flex items-center justify-center gap-1 py-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateLinkOperator(group.id, group.conditions[index - 1].id, 'AND')
                          }
                          className={cn(
                            'h-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                            (group.conditions[index - 1].nextOperator || 'AND') === 'AND'
                              ? 'bg-[#FFEDD5] border border-[#E86F25] text-[#E86F25] font-semibold'
                              : 'border border-[#E4E4E7] text-[#18181B] bg-transparent'
                          )}
                        >
                          AND
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateLinkOperator(group.id, group.conditions[index - 1].id, 'OR')
                          }
                          className={cn(
                            'h-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                            (group.conditions[index - 1].nextOperator || 'AND') === 'OR'
                              ? 'bg-[#FFEDD5] border border-[#E86F25] text-[#E86F25] font-semibold'
                              : 'border border-[#E4E4E7] text-[#18181B] bg-transparent'
                          )}
                        >
                          OR
                        </button>
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
    </div>
  );
}





