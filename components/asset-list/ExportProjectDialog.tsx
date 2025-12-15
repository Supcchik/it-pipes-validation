'use client';

import { useState } from 'react';
import { Download, FolderOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface ExportProjectDialogProps {
  open: boolean;
  onClose: () => void;
  totalAssets: number;
  filteredAssets: number;
  selectedAssets: number;
}

type ExportFormat = 'csv' | 'excel' | 'pdf' | 'zip';
type ExportScope = 'all' | 'filtered' | 'selected';

interface ExportOptions {
  format: ExportFormat;
  include: {
    inspectionData: boolean;
    observations: boolean;
    photos: boolean;
    videos: boolean;
    gisShapefiles: boolean;
    certificates: boolean;
  };
  scope: ExportScope;
}

export default function ExportProjectDialog({
  open,
  onClose,
  totalAssets,
  filteredAssets,
  selectedAssets
}: ExportProjectDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('zip');
  const [scope, setScope] = useState<ExportScope>('all');
  const [include, setInclude] = useState({
    inspectionData: true,
    observations: true,
    photos: true,
    videos: true,
    gisShapefiles: false,
    certificates: false,
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

  // Step 1: Configuration
  if (!exporting && !exportComplete) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Export Project
            </DialogTitle>
            <DialogDescription>
              Configure your export settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Export Format */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Export Format</Label>
              <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="format-csv" />
                  <Label htmlFor="format-csv" className="font-normal cursor-pointer">
                    CSV (Spreadsheet data only)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="format-excel" />
                  <Label htmlFor="format-excel" className="font-normal cursor-pointer">
                    Excel (Formatted workbook)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="format-pdf" />
                  <Label htmlFor="format-pdf" className="font-normal cursor-pointer">
                    PDF (Formatted report)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="zip" id="format-zip" />
                  <Label htmlFor="format-zip" className="font-normal cursor-pointer">
                    ZIP (Complete archive with media)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="h-px bg-neutral-200" />

            {/* Include Options */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Include in Export</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-data"
                    checked={include.inspectionData}
                    onCheckedChange={(checked) =>
                      setInclude({ ...include, inspectionData: checked as boolean })
                    }
                  />
                  <Label htmlFor="include-data" className="font-normal cursor-pointer">
                    Inspection data (pipe segments, dates)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-obs"
                    checked={include.observations}
                    onCheckedChange={(checked) =>
                      setInclude({ ...include, observations: checked as boolean })
                    }
                  />
                  <Label htmlFor="include-obs" className="font-normal cursor-pointer">
                    Observations (defects, codes)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-photos"
                    checked={include.photos}
                    onCheckedChange={(checked) =>
                      setInclude({ ...include, photos: checked as boolean })
                    }
                    disabled={format === 'csv' || format === 'excel'}
                  />
                  <Label htmlFor="include-photos" className="font-normal cursor-pointer">
                    Photos (inspection images)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-videos"
                    checked={include.videos}
                    onCheckedChange={(checked) =>
                      setInclude({ ...include, videos: checked as boolean })
                    }
                    disabled={format === 'csv' || format === 'excel'}
                  />
                  <Label htmlFor="include-videos" className="font-normal cursor-pointer">
                    Videos (inspection footage)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-gis"
                    checked={include.gisShapefiles}
                    onCheckedChange={(checked) =>
                      setInclude({ ...include, gisShapefiles: checked as boolean })
                    }
                  />
                  <Label htmlFor="include-gis" className="font-normal cursor-pointer">
                    GIS shapefiles (geographic data)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-certs"
                    checked={include.certificates}
                    onCheckedChange={(checked) =>
                      setInclude({ ...include, certificates: checked as boolean })
                    }
                  />
                  <Label htmlFor="include-certs" className="font-normal cursor-pointer">
                    Certificates (PDF documents)
                  </Label>
                </div>
              </div>
            </div>

            <div className="h-px bg-neutral-200" />

            {/* Export Scope */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Export Scope</Label>
              <RadioGroup value={scope} onValueChange={(v) => setScope(v as ExportScope)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="scope-all" />
                  <Label htmlFor="scope-all" className="font-normal cursor-pointer">
                    All assets ({totalAssets} inspections)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="filtered" id="scope-filtered" />
                  <Label htmlFor="scope-filtered" className="font-normal cursor-pointer">
                    Current view ({filteredAssets} filtered)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selected" id="scope-selected" />
                  <Label htmlFor="scope-selected" className="font-normal cursor-pointer">
                    Selected only ({selectedAssets} assets)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Estimated Size */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                💡 Estimated file size: <strong>{getEstimatedSize()}</strong>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Project →
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



