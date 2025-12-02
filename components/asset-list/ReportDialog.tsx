'use client';

import { useState } from 'react';
import { Printer, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { Asset, View } from '@/lib/types/asset-list';
import type { ReportConfig } from '@/lib/utils/pdf-generator';

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  assets: Asset[];
  selectedAssetIds: string[];
  currentView?: View; // Optional для backward compatibility
  onGenerate: (config: ReportConfig) => void;
}

export default function ReportDialog({
  open,
  onClose,
  assets,
  selectedAssetIds,
  currentView,
  onGenerate
}: ReportDialogProps) {
  const [step, setStep] = useState<'config' | 'preview'>('config');
  const [config, setConfig] = useState<ReportConfig>({
    scope: 'selected',
    inspections: 'newest',
    includeMap: true,
    includePhotos: false
  });

  const assetsToInclude = config.scope === 'selected'
    ? assets.filter(a => selectedAssetIds.includes(a.id))
    : assets;

  const estimatedPages = Math.ceil(
    assetsToInclude.length * (config.includePhotos ? 2 : 1)
  );

  const handlePreview = () => {
    setStep('preview');
  };

  const handleGenerate = () => {
    onGenerate(config);
    onClose();
    setStep('config'); // Reset for next time
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 'config' ? 'Generate Report' : 'Preview Report'}
          </DialogTitle>
        </DialogHeader>

        {step === 'config' ? (
          // Configuration Step
          <div className="space-y-4 py-4 overflow-auto">
            {/* Scope Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Report Scope</Label>
              <RadioGroup 
                value={config.scope} 
                onValueChange={(val: 'selected' | 'all') => setConfig(prev => ({ ...prev, scope: val }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selected" id="selected" />
                  <Label htmlFor="selected" className="cursor-pointer">
                    Selected Assets ({selectedAssetIds.length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="cursor-pointer">
                    All Assets in View ({assets.length})
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Inspection Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Inspections</Label>
              <RadioGroup 
                value={config.inspections} 
                onValueChange={(val: 'newest' | 'all') => setConfig(prev => ({ ...prev, inspections: val }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="newest" id="newest" />
                  <Label htmlFor="newest" className="cursor-pointer">
                    Newest Inspection Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all-inspections" />
                  <Label htmlFor="all-inspections" className="cursor-pointer">
                    All Inspections
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Include</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeMap"
                    checked={config.includeMap}
                    onCheckedChange={(checked) => setConfig(prev => ({ 
                      ...prev, 
                      includeMap: checked === true
                    }))}
                  />
                  <Label htmlFor="includeMap" className="cursor-pointer">
                    Map Overview
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includePhotos"
                    checked={config.includePhotos}
                    onCheckedChange={(checked) => setConfig(prev => ({ 
                      ...prev, 
                      includePhotos: checked === true
                    }))}
                  />
                  <Label htmlFor="includePhotos" className="cursor-pointer">
                    Inspection Photos (increases file size)
                  </Label>
                </div>
              </div>
            </div>

            {/* Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Assets:</span>
                    <span className="font-medium text-blue-900">
                      {assetsToInclude.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Estimated Pages:</span>
                    <span className="font-medium text-blue-900">
                      ~{estimatedPages}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Format:</span>
                    <span className="font-medium text-blue-900">
                      PDF
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Preview Step
          <div className="space-y-4 py-4 overflow-auto flex-1">
            <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-8">
              <div className="bg-white rounded shadow-lg aspect-[8.5/11] mx-auto max-w-md p-8">
                {/* Mock Report Preview */}
                <div className="space-y-4">
                  <div className="text-center border-b pb-4">
                    <h2 className="text-xl font-bold">Asset Inspection Report</h2>
                    <p className="text-sm text-neutral-600 mt-1">
                      {currentView?.name || 'Asset List'}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Generated: {new Date().toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Total Assets:</span>
                      <span className="font-medium">{assetsToInclude.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Inspections:</span>
                      <span className="font-medium">
                        {config.inspections === 'newest' ? 'Newest Only' : 'All'}
                      </span>
                    </div>
                  </div>

                  {config.includeMap && (
                    <div className="border border-neutral-200 rounded p-2">
                      <div className="bg-neutral-100 h-32 rounded flex items-center justify-center text-xs text-neutral-500">
                        Map Overview
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {assetsToInclude.slice(0, 3).map((asset) => (
                      <div key={asset.id} className="border border-neutral-200 rounded p-2 text-xs">
                        <div className="font-medium">{asset.pipeSegment}</div>
                        <div className="text-neutral-600">{asset.street}</div>
                      </div>
                    ))}
                    {assetsToInclude.length > 3 && (
                      <div className="text-center text-xs text-neutral-500 py-2">
                        ... and {assetsToInclude.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-neutral-600 mt-4">
                Page 1 of ~{estimatedPages}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'config' ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handlePreview}
                className="gap-2"
                disabled={assetsToInclude.length === 0}
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep('config')}>
                Back to Settings
              </Button>
              <Button 
                onClick={handleGenerate}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Generate PDF
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

