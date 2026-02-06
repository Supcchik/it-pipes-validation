'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface ValidationResults {
  total: number;
  passed: number;
  failed: number;
  summary: {
    [key: string]: number;
  };
}

interface ValidationResultsDialogProps {
  open: boolean;
  onClose: () => void;
  results: ValidationResults;
  onViewErrors: () => void;
  onDownloadReport: () => void;
}

export default function ValidationResultsDialog({
  open,
  onClose,
  results,
  onViewErrors,
  onDownloadReport
}: ValidationResultsDialogProps) {
  const passedPercentage = Math.round((results.passed / results.total) * 100);
  const failedPercentage = Math.round((results.failed / results.total) * 100);

  const statRow = (label: string, value: React.ReactNode, valueClassName?: string) => (
    <div className="flex justify-between items-center w-full">
      <span className="text-[#18181B] text-sm font-medium leading-5">{label}</span>
      <span className={cn('text-[#18181B] text-base font-semibold leading-6', valueClassName)}>
        {value}
      </span>
    </div>
  );

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
            Validation Complete
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {/* Results */}
          <div className="flex flex-col gap-2">
            <div className="text-[#3F3F46] text-sm font-semibold leading-5">Results</div>
            <div className="flex flex-col gap-2">
              {statRow('Total inspections:', results.total)}
              {statRow(
                'Passed:',
                `${results.passed} of ${results.total} (${passedPercentage}%)`,
                'text-[#15803D]'
              )}
              {statRow(
                'Failed:',
                `${results.failed} of ${results.total} (${failedPercentage}%)`,
                'text-[#B91C1C]'
              )}
            </div>
          </div>

          <div className="h-px bg-[#E4E4E7]" />

          {/* Common issues */}
          <div className="flex flex-col gap-2">
            <div className="text-[#3F3F46] text-sm font-semibold leading-5">Common issues</div>
            <div className="flex flex-col gap-1">
              {Object.entries(results.summary)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([issue, count]) => (
                  <div
                    key={issue}
                    className="text-[#3F3F46] text-sm font-medium leading-5"
                  >
                    {count} inspection{count !== 1 ? 's' : ''} - {issue}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={onDownloadReport}
            className="h-10 px-4 rounded-lg border-[#E4E4E7] text-[#312C29] font-medium"
          >
            Download report
          </Button>
          <Button
            onClick={onViewErrors}
            className="h-10 px-4 rounded-lg bg-[#E86F25] text-[#FAFAFA] font-medium hover:bg-[#d66320]"
          >
            View all errors
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}







