'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ValidationError } from './ValidationErrorsView';

interface BulkFixDialogProps {
  open: boolean;
  onClose: () => void;
  errors: ValidationError[];
  onApplyFixes: (fixes: BulkFix[]) => void;
}

export interface BulkFix {
  field: string;
  value: string;
  mode: 'manual' | 'auto';
}

export default function BulkFixDialog({
  open,
  onClose,
  errors,
  onApplyFixes
}: BulkFixDialogProps) {
  // Group errors by field
  const errorsByField = errors.reduce((acc, error) => {
    error.errors.forEach(err => {
      if (!acc[err.field]) {
        acc[err.field] = [];
      }
      acc[err.field].push(error);
    });
    return acc;
  }, {} as Record<string, ValidationError[]>);

  const [fixes, setFixes] = useState<Record<string, BulkFix>>({});

  const handleApply = () => {
    const fixesArray = Object.values(fixes);
    onApplyFixes(fixesArray);
  };

  const updateFix = (field: string, fix: BulkFix) => {
    setFixes(prev => ({
      ...prev,
      [field]: fix
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Bulk Fix Validation Errors</DialogTitle>
          <DialogDescription>
            Fixing {errors.length} selected inspections
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="h-px bg-neutral-200" />

          {Object.entries(errorsByField).map(([field, fieldErrors]) => {
            const errorCount = fieldErrors.length;
            const currentFix = fixes[field] || { field, value: '', mode: 'manual' };

            return (
              <div key={field} className="space-y-3">
                <div>
                  <Label className="text-sm font-semibold">
                    Missing Field: {field} ({errorCount} inspections)
                  </Label>
                </div>

                {field === 'certificateNumber' ? (
                  <div className="space-y-3">
                    <RadioGroup
                      value={currentFix.mode}
                      onValueChange={(mode) => 
                        updateFix(field, { ...currentFix, mode: mode as 'manual' | 'auto' })
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="manual" id={`${field}-manual`} />
                        <Label htmlFor={`${field}-manual`} className="font-normal cursor-pointer">
                          Manual:
                        </Label>
                      </div>
                      <div className="ml-6">
                        <Input
                          placeholder="CERT-2025-________"
                          value={currentFix.mode === 'manual' ? currentFix.value : ''}
                          onChange={(e) => 
                            updateFix(field, { ...currentFix, value: e.target.value, mode: 'manual' })
                          }
                          disabled={currentFix.mode === 'auto'}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="auto" id={`${field}-auto`} />
                        <Label htmlFor={`${field}-auto`} className="font-normal cursor-pointer">
                          Auto-generate: CERT-{new Date().getFullYear()}-{'{INSP_ID}'}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                ) : (
                  <div>
                    <Select
                      value={currentFix.value}
                      onValueChange={(value) => 
                        updateFix(field, { ...currentFix, value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select value..." />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Common values based on field */}
                        {field === 'surveyedBy' && (
                          <>
                            <SelectItem value="John Smith">John Smith</SelectItem>
                            <SelectItem value="Jane Doe">Jane Doe</SelectItem>
                            <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                          </>
                        )}
                        {field === 'preCleaning' && (
                          <>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </>
                        )}
                        {field === 'direction' && (
                          <>
                            <SelectItem value="Upstream">Upstream</SelectItem>
                            <SelectItem value="Downstream">Downstream</SelectItem>
                          </>
                        )}
                        {field === 'inspectionStatus' && (
                          <>
                            <SelectItem value="Complete">Complete</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            );
          })}

          <div className="h-px bg-neutral-200" />

          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <span className="text-sm text-orange-800">
              This will update {errors.length} inspections
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Fixes →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

