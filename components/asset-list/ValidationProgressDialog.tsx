'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface ValidationProgressDialogProps {
  open: boolean;
  onCancel: () => void;
  jobId: string;
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
  jobId
}: ValidationProgressDialogProps) {
  const [progress, setProgress] = useState<ProgressData>({
    current: 0,
    total: 0,
    percentage: 0,
    errorsFound: 0,
    estimatedTimeRemaining: 0
  });

  useEffect(() => {
    if (!open || !jobId) {
      // Reset progress when dialog closes
      setProgress({
        current: 0,
        total: 0,
        percentage: 0,
        errorsFound: 0,
        estimatedTimeRemaining: 0
      });
      return;
    }

    // Initialize progress
    setProgress({
      current: 0,
      total: 100, // Mock total
      percentage: 0,
      errorsFound: 0,
      estimatedTimeRemaining: 50
    });

    // Poll for progress updates
    const interval = setInterval(async () => {
      try {
        // TODO: Replace with actual API endpoint
        // const response = await fetch(`/api/validate/${jobId}/progress`);
        // const data = await response.json();
        
        // Mock progress for now
        setProgress(prev => {
          const newCurrent = Math.min(prev.current + 5, prev.total);
          const newPercentage = Math.round((newCurrent / prev.total) * 100);
          const newErrorsFound = prev.errorsFound + (Math.random() > 0.7 ? 1 : 0);
          const newEstimatedTime = prev.total > 0 
            ? Math.max(0, Math.round((prev.total - newCurrent) * 0.5))
            : 0;
          
          const mockProgress: ProgressData = {
            current: newCurrent,
            total: prev.total,
            percentage: newPercentage,
            errorsFound: newErrorsFound,
            estimatedTimeRemaining: newEstimatedTime
          };

          // Stop polling if complete
          if (newPercentage >= 100) {
            clearInterval(interval);
          }
          
          return mockProgress;
        });
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      }
    }, 1000); // Poll every second

    return () => clearInterval(interval);
  }, [open, jobId]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `~${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    return `~${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            Validating Inspections...
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Bar */}
          <Progress value={progress.percentage} className="h-3" />

          {/* Stats */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Status:</span>
              <span className="font-medium">Processing inspections</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Progress:</span>
              <span className="font-medium">
                {progress.current} of {progress.total} completed
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Errors found:</span>
              <span className="font-medium text-orange-600">
                {progress.errorsFound}
              </span>
            </div>
            {progress.estimatedTimeRemaining > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Estimated time:</span>
                <span className="font-medium">
                  {formatTime(progress.estimatedTimeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

