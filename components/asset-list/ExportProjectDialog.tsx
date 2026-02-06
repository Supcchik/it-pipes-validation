'use client';

import { useState } from 'react';
import { Download, FolderOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ExportProjectDialogProps {
  open: boolean;
  onClose: () => void;
  totalAssets: number;
  filteredAssets: number;
  selectedAssets: number;
}

type ExportFormat = 'csv' | 'excel' | 'pdf' | 'zip';
type ExportScope = 'all' | 'filtered' | 'selected';

/** Опції "Include in export" за макетом Figma (без Certificates). */
const INCLUDE_OPTIONS = [
  { key: 'inspectionData' as const, title: 'Inspection data', description: 'Pipe segments, dates' },
  { key: 'observations' as const, title: 'Observations', description: 'Defects, codes' },
  { key: 'photos' as const, title: 'Photos', description: 'Inspection images' },
  { key: 'videos' as const, title: 'Videos', description: 'Inspection recordings' },
  { key: 'gisShapefiles' as const, title: 'GIS shape-files', description: 'Geographic data' },
] as const;

export default function ExportProjectDialog({
  open,
  onClose,
  totalAssets,
  filteredAssets,
  selectedAssets
}: ExportProjectDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [scope, setScope] = useState<ExportScope>('selected');
  const [include, setInclude] = useState({
    inspectionData: true,
    observations: false,
    photos: false,
    videos: false,
    gisShapefiles: false,
  });
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportedFile, setExportedFile] = useState<{
    name: string;
    size: string;
    stats: {
      inspections: number;
      observations: number;
      photos: number;
      videos: number;
    };
  } | null>(null);

  const getAssetCount = () => {
    switch (scope) {
      case 'all': return totalAssets;
      case 'filtered': return filteredAssets;
      case 'selected': return selectedAssets;
    }
  };

  const getEstimatedSize = () => {
    const count = getAssetCount();
    const baseSize = count * 0.5; // 500KB per asset (data)
    const mediaSize = include.photos ? count * 2 : 0; // 2MB per asset (photos)
    const videoSize = include.videos ? count * 50 : 0; // 50MB per asset (videos)
    const total = baseSize + mediaSize + videoSize;
    
    if (total > 1000) return `~${(total / 1000).toFixed(1)} GB`;
    return `~${Math.round(total)} MB`;
  };

  const handleExport = async () => {
    setExporting(true);
    setProgress(0);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/export/project', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     format,
      //     scope,
      //     include,
      //     assetCount: getAssetCount()
      //   })
      // });
      // const { jobId } = await response.json();

      // Simulate export progress
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 5, 100);
          
          if (newProgress >= 100) {
            clearInterval(interval);
            setExportedFile({
              name: `Project_Export_${new Date().toISOString().split('T')[0]}.zip`,
              size: getEstimatedSize(),
              stats: {
                inspections: getAssetCount(),
                observations: Math.floor(getAssetCount() * 2.2),
                photos: Math.floor(getAssetCount() * 1.6),
                videos: Math.floor(getAssetCount() * 0.3)
              }
            });
            setExporting(false);
            setExportComplete(true);
          }
          
          return newProgress;
        });
      }, 200);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
      setExporting(false);
    }
  };

  const handleOpenFolder = () => {
    // Open downloads folder - handled by browser automatically
    onClose();
  };

  const handleClose = () => {
    setExporting(false);
    setExportComplete(false);
    setExportedFile(null);
    setProgress(0);
    onClose();
  };

  // Стилі пігулок за Figma: вибраний (orange) / за замовчуванням
  const pillSelected =
    'h-10 px-4 py-2 rounded-lg bg-[#FFEDD5] border border-[#E86F25] text-[#E86F25] font-semibold text-sm';
  const pillDefault =
    'h-10 px-4 py-2 rounded-lg border border-[#E4E4E7] text-[#18181B] font-medium text-sm';

  // Step 1: Configuration (Figma layout)
  if (!exporting && !exportComplete) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className={cn(
            'max-w-4xl w-full min-w-[680px] p-6 flex flex-col gap-4 rounded-2xl border-[#E4E4E7] overflow-hidden',
            'shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(16,24,40,0.10)]'
          )}
        >
          <DialogHeader className="gap-0">
            <DialogTitle className="text-[#09090B] text-lg font-semibold leading-7">
              Export Project
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Export format */}
            <div className="flex flex-col gap-2">
              <div className="text-[#3F3F46] text-sm font-semibold leading-5">
                Export format
              </div>
              <div className="flex flex-wrap items-center gap-1 py-1">
                {(['csv', 'excel', 'pdf', 'zip'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={cn(
                      'capitalize',
                      format === f ? pillSelected : pillDefault
                    )}
                  >
                    {f === 'csv' ? 'CSV' : f === 'excel' ? 'Excel' : f === 'pdf' ? 'PDF' : 'Zip'}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#E4E4E7]" />

            {/* Include in export — картки з чекбоксом */}
            <div className="flex flex-col gap-2">
              <div className="text-[#3F3F46] text-sm font-semibold leading-5">
                Include in export
              </div>
              <div className="flex flex-col gap-3">
                {INCLUDE_OPTIONS.map((opt) => {
                  const checked = include[opt.key];
                  const disabled =
                    (opt.key === 'photos' || opt.key === 'videos') &&
                    (format === 'csv' || format === 'excel');
                  return (
                    <div
                      key={opt.key}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (!disabled) {
                          setInclude((prev) => ({ ...prev, [opt.key]: !prev[opt.key] }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (!disabled) {
                            setInclude((prev) => ({ ...prev, [opt.key]: !prev[opt.key] }));
                          }
                        }
                      }}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2 rounded-lg border min-h-[84px] cursor-pointer transition-colors',
                        checked && !disabled
                          ? 'bg-[#FFEDD5] border-[#E86F25]'
                          : 'bg-transparent border-[#E4E4E7]',
                        disabled && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(val) => {
                          if (!disabled) {
                            setInclude((prev) => ({ ...prev, [opt.key]: val === true }));
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          'rounded border-[#E4E4E7]',
                          checked && !disabled && 'border-[#E86F25] data-[state=checked]:bg-[#E86F25] data-[state=checked]:border-[#E86F25]'
                        )}
                      />
                      <div className="flex flex-1 flex-col gap-1">
                        <div
                          className={cn(
                            'text-base font-semibold leading-6',
                            checked && !disabled ? 'text-[#E86F25]' : 'text-[#18181B]'
                          )}
                        >
                          {opt.title}
                        </div>
                        <div
                          className={cn(
                            'text-sm font-medium leading-5',
                            checked && !disabled ? 'text-[#E86F25]' : 'text-[#18181B]'
                          )}
                        >
                          {opt.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-[#E4E4E7]" />

            {/* Export scope */}
            <div className="flex flex-col gap-2">
              <div className="text-[#3F3F46] text-sm font-semibold leading-5">
                Export scope
              </div>
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
                  Entire view ({filteredAssets} in view)
                </button>
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={scope === 'all' ? pillSelected : pillDefault}
                >
                  All assets ({totalAssets} in project)
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              className="h-10 px-4 rounded-lg border-[#E4E4E7] text-[#312C29] font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              className="h-10 px-4 rounded-lg bg-[#E86F25] text-[#FAFAFA] font-medium hover:bg-[#d66320]"
            >
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 2: Progress
  if (exporting) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              Exporting Project...
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <Progress value={progress} className="h-3" />

            <div className="space-y-2 text-sm">
              <p className="font-medium">
                Preparing data... ({Math.floor(progress / 20)}/5 steps)
              </p>
              <div className="space-y-1 text-neutral-600">
                <div>✓ Collecting inspection data</div>
                <div>✓ Gathering observations</div>
                <div>{progress > 40 ? '✓' : '→'} Compressing media files</div>
                <div>{progress > 70 ? '✓' : '⋯'} Creating archive</div>
                <div>{progress > 90 ? '✓' : '⋯'} Finalizing export</div>
              </div>
            </div>

            <div className="text-sm text-neutral-600">
              <p>Processed: {Math.floor(getAssetCount() * progress / 100)} of {getAssetCount()} inspections</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 3: Success
  if (exportComplete && exportedFile) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              Export Complete
            </DialogTitle>
            <DialogDescription>
              Your project has been exported successfully
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-2xl">📦</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{exportedFile.name}</p>
                  <p className="text-xs text-neutral-600">{exportedFile.size}</p>
                </div>
              </div>

              <div className="h-px bg-neutral-200 my-2" />

              <div className="text-sm space-y-1">
                <p className="font-medium mb-2">📁 Contains:</p>
                <p className="text-neutral-600">• {exportedFile.stats.inspections} inspection records</p>
                <p className="text-neutral-600">• {exportedFile.stats.observations} observations</p>
                <p className="text-neutral-600">• {exportedFile.stats.photos} photos</p>
                <p className="text-neutral-600">• {exportedFile.stats.videos} videos</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={handleOpenFolder}>
              <FolderOpen className="w-4 h-4 mr-2" />
              Open Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}







