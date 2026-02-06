'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/** Scope: тільки вибрані рядки або весь поточний view. */
export interface ValidationOptions {
  scope: 'selected' | 'filtered';
  rules: {
    requiredFields: boolean;
    pacpCodes: boolean;
    inspectionDates: boolean;
    certificateNumbers: boolean;
  };
  verifyMedia: boolean;
  renameMedia: boolean;
}

interface ValidationDialogProps {
  open: boolean;
  onClose: () => void;
  /** Кількість записів у поточному view (для опції "Entire view"). */
  inViewCount: number;
  selectedAssets: number;
  onStartValidation: (options: ValidationOptions) => void;
}

export default function ValidationDialog({
  open,
  onClose,
  inViewCount,
  selectedAssets,
  onStartValidation
}: ValidationDialogProps) {
  const [scope, setScope] = useState<'selected' | 'filtered'>('selected');
  const [rules, setRules] = useState({
    requiredFields: true,
    pacpCodes: true,
    inspectionDates: true,
    certificateNumbers: true,
  });
  const [verifyMedia, setVerifyMedia] = useState(true);
  const [renameMedia, setRenameMedia] = useState(false);

  const handleStart = () => {
    onStartValidation({
      scope,
      rules,
      verifyMedia,
      renameMedia
    });
  };

  const pillSelected =
    'h-10 px-4 py-2 rounded-lg bg-[#FFEDD5] border border-[#E86F25] text-[#E86F25] font-semibold text-sm';
  const pillDefault =
    'h-10 px-4 py-2 rounded-lg border border-[#E4E4E7] text-[#18181B] font-medium text-sm';

  const ruleCards = [
    { key: 'requiredFields' as const, label: 'Required fields completed' },
    { key: 'pacpCodes' as const, label: 'Valid PACP/NASCO codes' },
    { key: 'inspectionDates' as const, label: 'Inspection dates valid' },
    { key: 'certificateNumbers' as const, label: 'Certificate numbers present' },
  ];
  const actionCards = [
    { key: 'verifyMedia' as const, label: 'Verify media files exist', checked: verifyMedia, set: setVerifyMedia },
    { key: 'renameMedia' as const, label: 'Rename media files to standards', checked: renameMedia, set: setRenameMedia },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'sm:max-w-xl p-6 flex flex-col gap-4 rounded-2xl border-[#E4E4E7] overflow-hidden',
          'shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(16,24,40,0.10)]'
        )}
      >
        <DialogHeader className="gap-0">
          <DialogTitle className="text-[#09090B] text-lg font-semibold leading-7">
            Validate inspections
          </DialogTitle>
          <DialogDescription className="text-[#3F3F46] text-base font-normal leading-6 mt-0">
            Run automated validation checks to ensure data quality and compliance
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {/* Scope — пігулки */}
          <div className="flex flex-col gap-2">
            <div className="text-[#3F3F46] text-sm font-semibold leading-5">Scope</div>
            <div className="flex flex-wrap items-center gap-1 py-1">
              <button
                type="button"
                onClick={() => setScope('selected')}
                className={scope === 'selected' ? pillSelected : pillDefault}
              >
                Selected only ({selectedAssets})
              </button>
              <button
                type="button"
                onClick={() => setScope('filtered')}
                className={scope === 'filtered' ? pillSelected : pillDefault}
              >
                Entire view ({inViewCount} in view)
              </button>
            </div>
          </div>

          <div className="h-px bg-[#E4E4E7]" />

          {/* Validation rules — картки з чекбоксом */}
          <div className="flex flex-col gap-2">
            <div className="text-[#3F3F46] text-sm font-semibold leading-5">Validation rules</div>
            <div className="flex flex-col gap-3">
              {ruleCards.map(({ key, label }) => {
                const checked = rules[key];
                return (
                  <div
                    key={key}
                    role="button"
                    tabIndex={0}
                    onClick={() => setRules((prev) => ({ ...prev, [key]: !prev[key] }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setRules((prev) => ({ ...prev, [key]: !prev[key] }));
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 rounded-lg border cursor-pointer transition-colors',
                      checked
                        ? 'bg-[#FFEDD5] border-[#E86F25]'
                        : 'bg-transparent border-[#E4E4E7]'
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(val) => setRules((prev) => ({ ...prev, [key]: val === true }))}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        'rounded border-[#E4E4E7]',
                        checked && 'border-[#E86F25] data-[state=checked]:bg-[#E86F25] data-[state=checked]:border-[#E86F25]'
                      )}
                    />
                    <div
                      className={cn(
                        'text-base font-semibold leading-6',
                        checked ? 'text-[#E86F25]' : 'text-[#18181B]'
                      )}
                    >
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-[#E4E4E7]" />

          {/* Additional actions — картки */}
          <div className="flex flex-col gap-2">
            <div className="text-[#3F3F46] text-sm font-semibold leading-5">Additional actions</div>
            <div className="flex flex-col gap-3">
              {actionCards.map(({ key, label, checked, set }) => (
                <div
                  key={key}
                  role="button"
                  tabIndex={0}
                  onClick={() => set(!checked)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      set(!checked);
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg border cursor-pointer transition-colors',
                    checked ? 'bg-[#FFEDD5] border-[#E86F25]' : 'bg-transparent border-[#E4E4E7]'
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(val) => set(val === true)}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      'rounded border-[#E4E4E7]',
                      checked && 'border-[#E86F25] data-[state=checked]:bg-[#E86F25] data-[state=checked]:border-[#E86F25]'
                    )}
                  />
                  <div
                    className={cn(
                      'text-base font-semibold leading-6',
                      checked ? 'text-[#E86F25]' : 'text-[#18181B]'
                    )}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 px-4 rounded-lg border-[#E4E4E7] text-[#312C29] font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            className="h-10 px-4 rounded-lg bg-[#E86F25] text-[#FAFAFA] font-medium hover:bg-[#d66320]"
          >
            Start validation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}







