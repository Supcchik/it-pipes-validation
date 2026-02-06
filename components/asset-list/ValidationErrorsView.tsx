'use client';

import { useState } from 'react';
import * as React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface ValidationError {
  assetId: string;
  assetName: string;
  inspectionId: string;
  inspectionDate: string;
  /** Вулиця для колонки STREET (опційно). */
  street?: string;
  errors: Array<{
    type: 'missing' | 'invalid' | 'warning';
    field: string;
    message: string;
    fixable: boolean;
  }>;
}

/** Один фікс: inspection + поле + нове значення. */
export interface ValidationErrorFix {
  assetId: string;
  field: string;
  value: string;
}

interface ValidationErrorsViewProps {
  errors: ValidationError[];
  onClose: () => void;
  /** Зберегти внесені зміни (inline edits). Після виклику батько показує toast і закриває або оновлює список. */
  onApplyFixes: (fixes: ValidationErrorFix[]) => void;
  onExport: () => void;
}

const MOCK_USERS = ['User A', 'User B', 'User C'];

/** Поля, які можна редагувати в таблиці помилок. */
type EditableField = 'certificateNumber' | 'surveyedBy' | 'inspectionDate' | 'pacpCode';

/** Локальні правки по рядках. */
type EditsMap = Record<string, Partial<Record<EditableField, string>>>;

export default function ValidationErrorsView({
  errors,
  onClose,
  onApplyFixes,
  onExport
}: ValidationErrorsViewProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [edits, setEdits] = useState<EditsMap>({});

  const editableFields: EditableField[] = ['certificateNumber', 'surveyedBy', 'inspectionDate', 'pacpCode'];
  const hasEdits = Object.entries(edits).some(([, v]) =>
    editableFields.some((f) => (v[f]?.trim() ?? '') !== '')
  );

  const setEdit = (assetId: string, field: EditableField, value: string) => {
    setEdits(prev => {
      const next = { ...prev };
      if (!next[assetId]) next[assetId] = {};
      next[assetId] = { ...next[assetId], [field]: value };
      return next;
    });
  };

  const getEdit = (assetId: string, field: EditableField): string => {
    return edits[assetId]?.[field] ?? '';
  };

  const handleApplyFixes = () => {
    const fixes: ValidationErrorFix[] = [];
    Object.entries(edits).forEach(([assetId, v]) => {
      editableFields.forEach((field) => {
        const val = v[field]?.trim();
        if (val !== undefined && val !== '') {
          fixes.push({ assetId, field, value: val });
        }
      });
    });
    if (fixes.length === 0) return;
    onApplyFixes(fixes);
  };

  const filteredErrors = React.useMemo(() => {
    let list = errors;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        e =>
          e.assetName.toLowerCase().includes(q) ||
          e.inspectionId.toLowerCase().includes(q) ||
          (e.street ?? '').toLowerCase().includes(q)
      );
    }
    if (filterType !== 'all') {
      list = list.filter(e => e.errors.some(err => err.type === filterType));
    }
    return list;
  }, [errors, searchQuery, filterType]);

  // Додаткові колонки з полів помилок (окрім surveyedBy, certificateNumber — вони вже є)
  const FIELD_LABELS: Record<string, string> = {
    inspectionDate: 'Inspection date',
    pacpCode: 'PACP code',
  };
  const extraColumns = React.useMemo(() => {
    const seen = new Set<string>();
    errors.forEach((e) => {
      e.errors.forEach((err) => {
        if (err.field !== 'surveyedBy' && err.field !== 'certificateNumber' && FIELD_LABELS[err.field]) {
          seen.add(err.field);
        }
      });
    });
    return Array.from(seen).map((key) => ({ key, label: FIELD_LABELS[key] ?? key }));
  }, [errors]);

  return (
    <div className="flex flex-col h-full w-full min-w-0 p-6 gap-4 rounded-2xl border border-[#E4E4E7] overflow-hidden shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(16,24,40,0.10)]">
      {/* Title */}
      <h2 className="text-[#09090B] text-lg font-semibold leading-7 shrink-0">
        Validation Errors ({errors.length} inspections)
      </h2>

      <div className="flex flex-col gap-3 flex-1 min-h-0">
        {/* Toolbar: filter + search (left), Export errors (right) */}
        <div className="h-14 border-b border-[#E4E4E7] flex justify-between items-center gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-10 px-4 rounded-lg border-[#E4E4E7] text-[#312C29] font-medium w-[140px]">
                <SelectValue placeholder="All errors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All errors</SelectItem>
                <SelectItem value="missing">Missing Fields</SelectItem>
                <SelectItem value="invalid">Invalid Codes</SelectItem>
                <SelectItem value="warning">Warnings</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-px h-6 bg-[#D4D4D8]" />
            <div className="relative w-full max-w-[360px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#71717A]" />
              <Input
                placeholder="Search inspections"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-10 rounded-md border-[#E4E4E7] bg-white text-[#18181B] placeholder:text-[#71717A]"
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onExport}
            className="h-10 px-4 rounded-lg border-[#E4E4E7] text-[#312C29] font-medium shrink-0"
          >
            Export errors
          </Button>
        </div>

        {/* Table: Pipe Segment (sticky) | middle cols | Notes (sticky); горизонтальний скрол */}
        <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-[#E4E4E7]">
          <table
            className="border-collapse"
            style={{ minWidth: 140 + 180 + 160 + 160 + extraColumns.length * 140 + 240 }}
          >
            <thead className="sticky top-0 z-10 bg-[#FAFAFA] border-b border-[#E4E4E7]">
              <tr>
                <th className="sticky left-0 z-20 w-[140px] min-w-[140px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#4D505A] leading-5 bg-[#FAFAFA] border-r border-[#E4E4E7]">
                  Pipe Segment
                </th>
                <th className="w-[180px] min-w-[180px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#4D505A] leading-5">
                  Street
                </th>
                <th className="w-[160px] min-w-[160px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#4D505A] leading-5">
                  Certificate Number
                </th>
                <th className="w-[160px] min-w-[160px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#4D505A] leading-5">
                  Surveyed by
                </th>
                {extraColumns.map((col) => (
                  <th
                    key={col.key}
                    className="w-[140px] min-w-[140px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#4D505A] leading-5"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="sticky right-0 z-20 w-[240px] min-w-[240px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#4D505A] leading-5 bg-[#FAFAFA] border-l border-[#E4E4E7]">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredErrors.map((error) => (
                <tr
                  key={error.assetId}
                  className="border-b border-[#E4E4E7] bg-white hover:bg-neutral-50/50 min-h-[72px]"
                >
                  <td className="sticky left-0 z-20 px-4 py-4 align-middle bg-white border-r border-[#E4E4E7] [tr:hover_&]:bg-neutral-50/50">
                    <button
                      type="button"
                      className="text-[#446CEE] hover:underline font-medium text-sm leading-5 text-left"
                      onClick={() => {}}
                    >
                      {error.assetName}
                    </button>
                  </td>
                  <td className="px-4 py-4 align-middle text-sm font-medium leading-5 text-[#18181B]">
                    {error.street ?? '—'}
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <Input
                      placeholder="Enter value"
                      value={getEdit(error.assetId, 'certificateNumber')}
                      onChange={(e) => setEdit(error.assetId, 'certificateNumber', e.target.value)}
                      className={cn(
                        'h-9 min-w-[120px] px-2 rounded border-0 bg-transparent text-sm font-medium leading-5',
                        getEdit(error.assetId, 'certificateNumber')
                          ? 'text-[#09090B]'
                          : 'text-[#4D505A] placeholder:text-[#4D505A]'
                      )}
                    />
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <Select
                      value={getEdit(error.assetId, 'surveyedBy') || '__placeholder__'}
                      onValueChange={(v) => setEdit(error.assetId, 'surveyedBy', v === '__placeholder__' ? '' : v)}
                    >
                      <SelectTrigger
                        className={cn(
                          'h-9 w-full rounded border-0 bg-transparent text-sm font-medium leading-5 [&>span]:font-medium',
                          !getEdit(error.assetId, 'surveyedBy')
                            ? 'text-[#4D505A]'
                            : 'text-[#09090B]'
                        )}
                      >
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__placeholder__">Select user</SelectItem>
                        {MOCK_USERS.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  {extraColumns.map((col) => {
                    const err = error.errors.find((e) => e.field === col.key);
                    const isEditable = col.key === 'inspectionDate' || col.key === 'pacpCode';
                    if (isEditable) {
                      const value = getEdit(error.assetId, col.key as EditableField);
                      return (
                        <td key={col.key} className="px-4 py-4 align-middle">
                          <Input
                            type={col.key === 'inspectionDate' ? 'date' : 'text'}
                            placeholder={col.key === 'pacpCode' ? 'Enter PACP code' : undefined}
                            value={value}
                            onChange={(e) =>
                              setEdit(error.assetId, col.key as EditableField, e.target.value)
                            }
                            className={cn(
                              'h-9 min-w-[120px] px-2 rounded border border-[#E4E4E7] text-sm font-medium leading-5',
                              value ? 'text-[#09090B]' : 'text-[#4D505A] placeholder:text-[#4D505A]'
                            )}
                          />
                        </td>
                      );
                    }
                    return (
                      <td key={col.key} className="px-4 py-4 align-middle text-sm font-medium leading-5 text-[#B45309]">
                        {err ? err.message : '—'}
                      </td>
                    );
                  })}
                  <td className="sticky right-0 z-20 px-4 py-4 align-middle bg-white border-l border-[#E4E4E7] [tr:hover_&]:bg-neutral-50/50">
                    <div className="flex flex-col gap-1 min-w-[200px]">
                      {error.errors.map((err, idx) => (
                        <span
                          key={idx}
                          className="text-sm font-medium leading-5 text-[#B45309]"
                        >
                          {err.message}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer: Close, Apply fixes (disabled opacity 0.5 when no edits) */}
      <div className="pt-4 pb-6 px-0 border-t border-[#E4E4E7] bg-white flex justify-end gap-2 shrink-0 shadow-[0px_6px_29px_rgba(100,100,111,0.20)] -mx-6 -mb-6 px-6">
        <Button
          variant="outline"
          onClick={onClose}
          className="h-10 px-4 rounded-lg border-[#E4E4E7] text-[#312C29] font-medium"
        >
          Close
        </Button>
        <Button
          onClick={handleApplyFixes}
          disabled={!hasEdits}
          className={cn(
            'h-10 px-4 rounded-lg bg-[#E86F25] text-[#FAFAFA] font-medium hover:bg-[#d66320]',
            !hasEdits && 'opacity-50 cursor-not-allowed'
          )}
        >
          Apply fixes
        </Button>
      </div>
    </div>
  );
}

