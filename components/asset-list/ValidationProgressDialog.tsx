'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ValidationProgressDialogProps {
  open: boolean;
  onCancel: () => void;
  jobId: string;
  /** Кількість inspections для прогресу "X of total complete". */
  totalCount: number;
}

interface ProgressData {
  current: number;
  total: number;
  percentage: number;
  errorsFound: number;
  estimatedTimeRemaining: number; // seconds
}

export default function ValidationProgressDialog({
  open,
  onCancel,
  jobId,
  totalCount
}: ValidationProgressDialogProps) {
  const [progress, setProgress] = useState<ProgressData>({
    current: 0,
    total: totalCount,
    percentage: 0,
    errorsFound: 0,
    estimatedTimeRemaining: 0
  });

  useEffect(() => {
    if (!open || !jobId || totalCount <= 0) {
      setProgress({
        current: 0,
        total: totalCount,
        percentage: 0,
        errorsFound: 0,
        estimatedTimeRemaining: 0
      });
      return;
    }

    setProgress({
      current: 0,
      total: totalCount,
      percentage: 0,
      errorsFound: 0,
      estimatedTimeRemaining: Math.max(10, Math.round(totalCount * 8))
    });

    const total = totalCount;
    const stepMs = 400;
    const step = Math.max(1, Math.ceil(total / 25));
    let current = 0;
    let errorsFound = 0;

    const interval = setInterval(() => {
      current = Math.min(current + step, total);
      if (Math.random() > 0.75) errorsFound += 1;
      const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
      const estimatedTimeRemaining = total > 0
        ? Math.max(0, Math.round((total - current) * (stepMs / 1000)))
        : 0;

      setProgress({
        current,
        total,
        percentage,
        errorsFound,
        estimatedTimeRemaining
      });

      if (current >= total) {
        clearInterval(interval);
      }
    }, stepMs);

    return () => clearInterval(interval);
  }, [open, jobId, totalCount]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `~${seconds} seconds`;
    const minutes = Math.ceil(seconds / 60);
    return `~${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  const statRow = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between items-center w-full">
      <span className="text-[#18181B] text-sm font-medium leading-5">{label}</span>
      <span className="text-[#18181B] text-base font-semibold leading-6">{value}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent
        className={cn(
          'sm:max-w-md p-6 flex flex-col gap-4 rounded-2xl border-[#E4E4E7] overflow-hidden',
          'shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(16,24,40,0.10)]'
        )}
      >
        <DialogHeader className="gap-0">
          <DialogTitle className="text-[#09090B] text-lg font-semibold leading-7">
            Validating inspections
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {/* Progress bar: висота 16px, фон #F4F4F5, заповнення #E86F25 */}
          <Progress
            value={progress.percentage}
            className="h-4 w-full overflow-hidden rounded-full bg-[#F4F4F5] [&>div]:bg-[#E86F25]"
          />

          <div className="h-px bg-[#E4E4E7]" />

          {/* Статистика: Status, Progress, Errors found, Estimated time */}
          <div className="flex flex-col gap-2">
            {statRow('Status:', 'Processing inspections')}
            {statRow('Progress:', `${progress.current} of ${progress.total} complete`)}
            {statRow('Errors found:', progress.errorsFound)}
            {statRow('Estimated time:', formatTime(progress.estimatedTimeRemaining))}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onCancel}
            className="h-10 px-4 rounded-lg border-[#E4E4E7] text-[#312C29] font-medium"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

