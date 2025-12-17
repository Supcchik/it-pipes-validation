'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
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

export interface ValidationOptions {
  scope: 'all' | 'selected';
  rules: {
    requiredFields: boolean;
    pacpCodes: boolean;
    accessPoints: boolean;
    inspectionDates: boolean;
    certificateNumbers: boolean;
  };
  verifyMedia: boolean;
  renameMedia: boolean;
}

interface ValidationDialogProps {
  open: boolean;
  onClose: () => void;
  totalAssets: number;
  selectedAssets: number;
  onStartValidation: (options: ValidationOptions) => void;
}

export default function ValidationDialog({
  open,
  onClose,
  totalAssets,
  selectedAssets,
  onStartValidation
}: ValidationDialogProps) {
  const [scope, setScope] = useState<'all' | 'selected'>('all');
  const [rules, setRules] = useState({
    requiredFields: true,
    pacpCodes: true,
    accessPoints: true,
    inspectionDates: true,
    certificateNumbers: true,
  });
  const [verifyMedia, setVerifyMedia] = useState(false);
  const [renameMedia, setRenameMedia] = useState(false);

  const handleStart = () => {
    onStartValidation({
      scope,
      rules,
      verifyMedia,
      renameMedia
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Validate Inspections
          </DialogTitle>
          <DialogDescription>
            Run automated validation checks to ensure data quality and compliance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Scope Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Scope</Label>
            <RadioGroup value={scope} onValueChange={(v) => setScope(v as 'all' | 'selected')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="scope-all" />
                <Label htmlFor="scope-all" className="font-normal cursor-pointer">
                  All assets in current view ({totalAssets})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="scope-selected" />
                <Label htmlFor="scope-selected" className="font-normal cursor-pointer">
                  Selected assets only ({selectedAssets})
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="h-px bg-neutral-200" />

          {/* Validation Rules */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Validation Rules</Label>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rule-fields"
                  checked={rules.requiredFields}
                  onCheckedChange={(checked) => 
                    setRules({ ...rules, requiredFields: checked as boolean })
                  }
                />
                <Label htmlFor="rule-fields" className="font-normal cursor-pointer">
                  Required fields completed
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rule-pacp"
                  checked={rules.pacpCodes}
                  onCheckedChange={(checked) => 
                    setRules({ ...rules, pacpCodes: checked as boolean })
                  }
                />
                <Label htmlFor="rule-pacp" className="font-normal cursor-pointer">
                  Valid PACP/NASCO codes
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rule-access"
                  checked={rules.accessPoints}
                  onCheckedChange={(checked) => 
                    setRules({ ...rules, accessPoints: checked as boolean })
                  }
                />
                <Label htmlFor="rule-access" className="font-normal cursor-pointer">
                  Access points present (minimum 2)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rule-dates"
                  checked={rules.inspectionDates}
                  onCheckedChange={(checked) => 
                    setRules({ ...rules, inspectionDates: checked as boolean })
                  }
                />
                <Label htmlFor="rule-dates" className="font-normal cursor-pointer">
                  Inspection dates valid
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rule-cert"
                  checked={rules.certificateNumbers}
                  onCheckedChange={(checked) => 
                    setRules({ ...rules, certificateNumbers: checked as boolean })
                  }
                />
                <Label htmlFor="rule-cert" className="font-normal cursor-pointer">
                  Certificate numbers present
                </Label>
              </div>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Additional Actions</Label>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="action-verify"
                  checked={verifyMedia}
                  onCheckedChange={(checked) => setVerifyMedia(checked as boolean)}
                />
                <Label htmlFor="action-verify" className="font-normal cursor-pointer">
                  Verify media files exist
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="action-rename"
                  checked={renameMedia}
                  onCheckedChange={(checked) => setRenameMedia(checked as boolean)}
                />
                <Label htmlFor="action-rename" className="font-normal cursor-pointer">
                  Rename media files to standards
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleStart}>
            Start Validation →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}




