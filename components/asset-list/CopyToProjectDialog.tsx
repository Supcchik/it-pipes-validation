'use client';

import { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Asset } from '@/lib/types/asset-list';

interface CopyToProjectDialogProps {
  open: boolean;
  onClose: () => void;
  selectedAssets: Asset[];
  onCopyComplete: () => void;
}

const PROJECTS = [
  { id: 'proj-1', name: 'Project Alpha', assetCount: 234 },
  { id: 'proj-2', name: 'Project Beta', assetCount: 156 },
  { id: 'proj-3', name: 'Project Gamma', assetCount: 89 },
];

export default function CopyToProjectDialog({
  open,
  onClose,
  selectedAssets,
  onCopyComplete
}: CopyToProjectDialogProps) {
  const [destinationProject, setDestinationProject] = useState<string>('');
  const [options, setOptions] = useState({
    inspectionData: true,
    observations: true,
    mediaFiles: true,
    copyTimestamps: true,
    copyAssignments: false,
    linkToOriginal: false,
  });
  const [copying, setCopying] = useState(false);
  const [copyComplete, setCopyComplete] = useState(false);

  const handleCopy = async () => {
    if (!destinationProject) {
      alert('Please select a destination project');
      return;
    }

    setCopying(true);

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/assets/copy', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     assetIds: selectedAssets.map(a => a.id),
      //     destinationProjectId: destinationProject,
      //     options
      //   })
      // });

      // Simulate copy
      await new Promise(resolve => setTimeout(resolve, 1500));

      setCopying(false);
      setCopyComplete(true);
      onCopyComplete();
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy assets. Please try again.');
      setCopying(false);
    }
  };

  const handleClose = () => {
    setCopyComplete(false);
    setDestinationProject('');
    onClose();
  };

  const selectedProject = PROJECTS.find(p => p.id === destinationProject);

  // Success State
  if (copyComplete) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Assets Copied Successfully
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-neutral-700">
              {selectedAssets.length} assets copied to {selectedProject?.name}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={() => {
              // TODO: Navigate to destination project
              handleClose();
            }}>
              View in {selectedProject?.name}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Main Dialog
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-blue-600" />
            Copy to Project
          </DialogTitle>
          <DialogDescription>
            Copy {selectedAssets.length} assets to another project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Destination Project */}
          <div className="space-y-2">
            <Label>Destination Project</Label>
            <Select value={destinationProject} onValueChange={setDestinationProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                {PROJECTS.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} ({project.assetCount} assets)
                  </SelectItem>
                ))}
                <SelectItem value="new">+ Create New Project</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-px bg-neutral-200" />

          {/* Copy Options */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Copy Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copy-data"
                  checked={options.inspectionData}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, inspectionData: checked as boolean })
                  }
                />
                <Label htmlFor="copy-data" className="font-normal cursor-pointer">
                  Copy inspection data
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copy-obs"
                  checked={options.observations}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, observations: checked as boolean })
                  }
                />
                <Label htmlFor="copy-obs" className="font-normal cursor-pointer">
                  Copy observations
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copy-media"
                  checked={options.mediaFiles}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, mediaFiles: checked as boolean })
                  }
                />
                <Label htmlFor="copy-media" className="font-normal cursor-pointer">
                  Copy media files
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copy-time"
                  checked={options.copyTimestamps}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, copyTimestamps: checked as boolean })
                  }
                />
                <Label htmlFor="copy-time" className="font-normal cursor-pointer">
                  Copy timestamps
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copy-assign"
                  checked={options.copyAssignments}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, copyAssignments: checked as boolean })
                  }
                />
                <Label htmlFor="copy-assign" className="font-normal cursor-pointer">
                  Copy assignments
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copy-link"
                  checked={options.linkToOriginal}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, linkToOriginal: checked as boolean })
                  }
                />
                <Label htmlFor="copy-link" className="font-normal cursor-pointer">
                  Link to original (reference only)
                </Label>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              💡 <strong>Info:</strong> Assets will remain in current project.
              Copies will be independent duplicates.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCopy} disabled={!destinationProject || copying}>
            <Copy className="w-4 h-4 mr-2" />
            {copying ? 'Copying...' : 'Copy Assets →'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}




