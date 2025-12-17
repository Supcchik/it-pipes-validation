'use client';

import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { GroupFilterState, NewFilterGroup, FilterConfig, ColumnDef } from '@/lib/types/asset-list';
import { mockColumnDefs } from '@/lib/mock-data/asset-list';

interface FilterGroupsEditorProps {
  state: GroupFilterState;
  onChange: (next: GroupFilterState) => void;
}

/**
 * Простий редактор груп фільтрів для PoC.
 *
 * OR між групами, AND всередині групи.
 */
export default function FilterGroupsEditor({ state, onChange }: FilterGroupsEditorProps) {
  const groups = state.groups || [];

  const getFilterableColumns = (): ColumnDef[] => {
    return mockColumnDefs.filter((col) => col.filterable);
  };

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

  const handleUpdateGroup = (groupId: string, updater: (group: NewFilterGroup) => NewFilterGroup) => {
    const nextGroups = groups.map((g) => (g.id === groupId ? updater(g) : g));
    onChange({ ...state, groups: nextGroups });
  };

  const handleAddGroup = () => {
    const index = groups.length;
    const name = `Filter Set ${index + 1}`; // Filter Set 1, Filter Set 2, ...
    const newGroup: NewFilterGroup = {
      id: `group-${Date.now()}`,
      name,
      conditions: [],
    };
    onChange({ ...state, groups: [...groups, newGroup] });
  };

  const handleRemoveGroup = (groupId: string) => {
    const nextGroups = groups.filter((g) => g.id !== groupId);
    onChange({ ...state, groups: nextGroups });
  };

  const handleAddCondition = (groupId: string) => {
    const defaultColumn = getFilterableColumns()[0];
    const newCondition: FilterConfig = {
      id: `filter-${Date.now()}`,
      field: defaultColumn?.field || 'pipeSegment',
      operator: 'contains',
      value: '',
      table: (defaultColumn?.table as FilterConfig['table']) || 'asset',
    };
    handleUpdateGroup(groupId, (group) => ({
      ...group,
      conditions: [...group.conditions, newCondition],
    }));
  };

  const handleUpdateCondition = (
    groupId: string,
    conditionId: string,
    updates: Partial<FilterConfig>
  ) => {
    handleUpdateGroup(groupId, (group) => ({
      ...group,
      conditions: group.conditions.map((c) => (c.id === conditionId ? { ...c, ...updates } : c)),
    }));
  };

  const handleRemoveCondition = (groupId: string, conditionId: string) => {
    handleUpdateGroup(groupId, (group) => ({
      ...group,
      conditions: group.conditions.filter((c) => c.id !== conditionId),
    }));
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-600">
        Show assets that match <span className="font-semibold">any filter set</span> below
        (OR between sets, AND within each set).
      </p>

      <div className="space-y-6">
        {groups.map((group, index) => (
          <div key={group.id} className="space-y-2">
            <Card className="border-neutral-300 bg-neutral-50">
              <CardContent className="pt-3 pb-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-800">
                    {group.name || `Filter Set ${index + 1}`}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveGroup(group.id)}
                    aria-label={`Remove ${group.name || `Filter Set ${index + 1}`}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {group.conditions.length === 0 ? (
                    <p className="text-xs text-neutral-500">
                      No filters in this set yet. Add at least one filter.
                    </p>
                  ) : (
                    group.conditions.map((filter) => {
                      const col = getFilterableColumns().find(
                        (c) => c.id === filter.field && c.table === filter.table
                      );
                      const fieldType = col?.type || getFieldType(filter.field, filter.table);
                      const operators = getOperatorsForField(fieldType);

                      return (
                        <div
                          key={filter.id}
                          className={`flex items-center gap-2 p-2 rounded border ${getFieldTypeColor(
                            fieldType
                          )}`}
                        >
                          {/* Field selector */}
                          <Select
                            value={`${filter.table}:${filter.field}`}
                            onValueChange={(value) => {
                              const [table, field] = value.split(':');
                              const newFieldType = getFieldType(field, table);
                              const newOps = getOperatorsForField(newFieldType);
                              handleUpdateCondition(group.id, filter.id, {
                                field,
                                table: table as FilterConfig['table'],
                                operator: newOps.includes(filter.operator)
                                  ? filter.operator
                                  : newOps[0],
                                value: '',
                              });
                            }}
                          >
                            <SelectTrigger className="w-40 h-7 text-xs bg-white border-0 shadow-none focus:ring-0">
                              <SelectValue placeholder="Field" />
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

                          {/* Operator */}
                          <Select
                            value={filter.operator}
                            onValueChange={(value) => {
                              handleUpdateCondition(group.id, filter.id, {
                                operator: value as FilterConfig['operator'],
                              });
                            }}
                          >
                            <SelectTrigger className="w-28 h-7 text-xs bg-white border-0 shadow-none focus:ring-0">
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
                            type={fieldType === 'number' ? 'number' : fieldType === 'date' ? 'date' : 'text'}
                            value={
                              typeof filter.value === 'string' || typeof filter.value === 'number'
                                ? String(filter.value)
                                : ''
                            }
                            onChange={(e) => {
                              const val =
                                fieldType === 'number'
                                  ? e.target.value === ''
                                    ? ''
                                    : Number(e.target.value)
                                  : e.target.value;
                              handleUpdateCondition(group.id, filter.id, { value: val });
                            }}
                            className="flex-1 h-7 text-xs bg-white border-0 shadow-none focus-visible:ring-0"
                            placeholder="Value"
                          />

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveCondition(group.id, filter.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-1"
                  onClick={() => handleAddCondition(group.id)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add to this set
                </Button>
              </CardContent>
            </Card>

            {/* OR divider між групами */}
            {index < groups.length - 1 && (
              <div className="flex items-center justify-center text-[11px] text-neutral-500 uppercase tracking-wide">
                <span className="px-2">OR</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full mt-2"
        onClick={handleAddGroup}
      >
        <Plus className="w-4 h-4 mr-1" />
        Add another group
      </Button>
    </div>
  );
}


