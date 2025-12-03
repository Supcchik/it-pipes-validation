'use client';

import { useState } from 'react';
import { MoveRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
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

interface MoveToProjectDialogProps {
  open: boolean;
  onClose: () => void;
  selectedAssets: Asset[];
  currentProject: string;
  onMoveComplete: () => void;
}

interface Project {
  id: string;
  name: string;
  assetCount: number;
}

// Mock projects - replace with API call
const PROJECTS: Project[] = [
  { id: 'proj-1', name: 'Project Alpha', assetCount: 234 },
  { id: 'proj-2', name: 'Project Beta', assetCount: 156 },
  { id: 'proj-3', name: 'Project Gamma', assetCount: 89 },
];

export default function MoveToProjectDialog({
  open,
  onClose,
  selectedAssets,
  currentProject,
  onMoveComplete
}: MoveToProjectDialogProps) {
  const [destinationProject, setDestinationProject] = useState<string>('');
  const [options, setOptions] = useState({
    inspectionData: true,
    observations: true,
    mediaFiles: true,
    preserveTimestamps: true,
    moveAssignments: false,
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [moving, setMoving] = useState(false);
  const [moveComplete, setMoveComplete] = useState(false);

  const handleMove = () => {
    if (!destinationProject) {
      alert('Please select a destination project');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmMove = async () => {
    setMoving(true);

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/assets/move', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     assetIds: selectedAssets.map(a => a.id),
      //     destinationProjectId: destinationProject,
      //     options
      //   })
      // });

      // Simulate move
      await new Promise(resolve => setTimeout(resolve, 1500));

      setMoving(false);
      setShowConfirm(false);
      setMoveComplete(true);
      onMoveComplete();
    } catch (error) {
      console.error('Move failed:', error);
      alert('Failed to move assets. Please try again.');
      setMoving(false);
    }
  };

  const handleClose = () => {
    setShowConfirm(false);
    setMoveComplete(false);
    setDestinationProject('');
    onClose();
  };

  const selectedProject = PROJECTS.find(p => p.id === destinationProject);

  // Success State
  if (moveComplete) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Assets Moved Successfully
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-neutral-700">
              {selectedAssets.length} assets moved to {selectedProject?.name}
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

  // Confirmation State
  if (showConfirm) {
    return (
      <Dialog open={open} onOpenChange={() => setShowConfirm(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <DialogTitle>Confirm Move</DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-neutral-700">
              You are about to move <strong>{selectedAssets.length} assets</strong> from{' '}
              <strong>&quot;{currentProject}&quot;</strong> to <strong>&quot;{selectedProject?.name}&quot;</strong>
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm font-medium text-orange-900 mb-2">
                These assets will be:
              </p>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Removed from {currentProject}</li>
                <li>• Added to {selectedProject?.name}</li>
                <li>• Keep all data and media</li>
              </ul>
            </div>

            <p className="text-sm text-neutral-600">
              ⚠️ This action cannot be undone.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={moving}>
              Cancel
            </Button>
            <Button onClick={handleConfirmMove} disabled={moving}>
              {moving ? 'Moving...' : 'Confirm Move'}
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
            <MoveRight className="w-5 h-5 text-blue-600" />
            Move to Project
          </DialogTitle>
          <DialogDescription>
            Move {selectedAssets.length} assets to another project
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

          {/* Transfer Options */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Transfer Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="opt-data"
                  checked={options.inspectionData}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, inspectionData: checked as boolean })
                  }
                />
                <Label htmlFor="opt-data" className="font-normal cursor-pointer">
                  Move inspection data
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="opt-obs"
                  checked={options.observations}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, observations: checked as boolean })
                  }
                />
                <Label htmlFor="opt-obs" className="font-normal cursor-pointer">
                  Move observations
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="opt-media"
                  checked={options.mediaFiles}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, mediaFiles: checked as boolean })
                  }
                />
                <Label htmlFor="opt-media" className="font-normal cursor-pointer">
                  Move media files
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="opt-time"
                  checked={options.preserveTimestamps}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, preserveTimestamps: checked as boolean })
                  }
                />
                <Label htmlFor="opt-time" className="font-normal cursor-pointer">
                  Preserve timestamps
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="opt-assign"
                  checked={options.moveAssignments}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, moveAssignments: checked as boolean })
                  }
                />
                <Label htmlFor="opt-assign" className="font-normal cursor-pointer">
                  Move assignments
                </Label>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-900">
              ⚠️ <strong>Warning:</strong> Assets will be removed from current project.
              This action cannot be undone.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!destinationProject}>
            <MoveRight className="w-4 h-4 mr-2" />
            Move Assets →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

