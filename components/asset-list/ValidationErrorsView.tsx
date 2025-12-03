'use client';

import { useState } from 'react';
import * as React from 'react';
import { Download, Search, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ValidationError {
  assetId: string;
  assetName: string;
  inspectionId: string;
  inspectionDate: string;
  errors: Array<{
    type: 'missing' | 'invalid' | 'warning';
    field: string;
    message: string;
    fixable: boolean;
  }>;
}

interface ValidationErrorsViewProps {
  errors: ValidationError[];
  onBulkFix: (selectedErrors: ValidationError[]) => void;
  onExport: () => void;
}

export default function ValidationErrorsView({
  errors,
  onBulkFix,
  onExport
}: ValidationErrorsViewProps) {
  const [selectedErrors, setSelectedErrors] = useState<Set<string>>(new Set());
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = (assetId: string) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(assetId)) {
      newExpanded.delete(assetId);
    } else {
      newExpanded.add(assetId);
    }
    setExpandedErrors(newExpanded);
  };

  const toggleSelect = (assetId: string) => {
    const newSelected = new Set(selectedErrors);
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId);
    } else {
      newSelected.add(assetId);
    }
    setSelectedErrors(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedErrors.size === errors.length) {
      setSelectedErrors(new Set());
    } else {
      setSelectedErrors(new Set(errors.map(e => e.assetId)));
    }
  };

  const handleBulkFix = () => {
    if (selectedErrors.size === 0) return;
    const selected = errors.filter(e => selectedErrors.has(e.assetId));
    onBulkFix(selected);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Validation Errors ({errors.length} inspections)
          </h2>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Errors</SelectItem>
              <SelectItem value="missing">Missing Fields</SelectItem>
              <SelectItem value="invalid">Invalid Codes</SelectItem>
              <SelectItem value="warning">Warnings</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Error List */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-neutral-50 border-b border-neutral-200">
            <tr className="text-sm text-left">
              <th className="w-12 p-3">
                <Checkbox
                  checked={selectedErrors.size === errors.length && errors.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 font-medium">Asset</th>
              <th className="p-3 font-medium">Insp ID</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Errors</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((error) => (
              <React.Fragment key={error.assetId}>
                <tr
                  className="border-b border-neutral-200 hover:bg-neutral-50"
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedErrors.has(error.assetId)}
                      onCheckedChange={() => toggleSelect(error.assetId)}
                    />
                  </td>
                  <td className="p-3 font-medium">{error.assetName}</td>
                  <td className="p-3 text-neutral-600">{error.inspectionId}</td>
                  <td className="p-3 text-neutral-600 text-sm">
                    {error.inspectionDate}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleExpand(error.assetId)}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      {error.errors.length} error{error.errors.length > 1 ? 's' : ''} ▾
                    </button>
                  </td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>

                {/* Expanded Error Details */}
                {expandedErrors.has(error.assetId) && (
                  <tr className="bg-neutral-50">
                    <td colSpan={6} className="p-4">
                      <div className="space-y-2">
                        {error.errors.map((err, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-sm text-neutral-700"
                          >
                            <span className="text-orange-600 mt-0.5">⚠️</span>
                            <span>{err.message}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-neutral-200 p-4 flex items-center gap-3">
        <span className="text-sm text-neutral-600">
          {selectedErrors.size} selected
        </span>
        <Button
          onClick={handleBulkFix}
          disabled={selectedErrors.size === 0}
        >
          Bulk Fix Selected
        </Button>
        <Button variant="outline" onClick={onExport}>
          Export Errors
        </Button>
      </div>
    </div>
  );
}

