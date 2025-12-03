'use client';

import { CheckCircle2, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Validation Complete
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Results Card */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
            <h3 className="font-semibold mb-3">📊 Validation Results</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Total Inspections:</span>
                <span className="font-medium">{results.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">✓ Passed:</span>
                <span className="font-medium text-green-600">
                  {results.passed} ({passedPercentage}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">⚠️ Failed:</span>
                <span className="font-medium text-orange-600">
                  {results.failed} ({failedPercentage}%)
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-neutral-200" />

          {/* Common Issues */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Common Issues Found:</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(results.summary)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([issue, count]) => (
                  <div key={issue} className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span className="text-neutral-700">
                      {count} inspections {issue}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onDownloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button onClick={onViewErrors}>
            <Eye className="w-4 h-4 mr-2" />
            View All Errors →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

