'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Asset } from '@/lib/types/asset-list';

const MOVE_OPTIONS = [
  { key: 'inspectionData' as const, title: 'Inspection data', description: 'Pipe segments, dates' },
  { key: 'observations' as const, title: 'Observations', description: 'Defects, codes' },
  { key: 'mediaFiles' as const, title: 'Media files', description: 'Inspection images and recordings' },
  { key: 'moveAssignments' as const, title: 'Assigments', description: 'User assignments and workflow status' },
];

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
    moveAssignments: false,
  });
  const [moving, setMoving] = useState(false);
  const [moveComplete, setMoveComplete] = useState(false);

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMove = async () => {
    if (!destinationProject) {
      alert('Please select a destination project');
      return;
    }
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
      setMoveComplete(true);
      onMoveComplete();
    } catch (error) {
      console.error('Move failed:', error);
      alert('Failed to move assets. Please try again.');
      setMoving(false);
    }
  };

  const handleClose = () => {
    setMoveComplete(false);
    setDestinationProject('');
    onClose();
  };

  const selectedProject = PROJECTS.find(p => p.id === destinationProject);

  // Success State
  if (moveComplete) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md p-6 gap-4 rounded-2xl border border-[#E4E4E7] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(16,24,40,0.10)] flex flex-col">
          <DialogTitle className="flex items-center gap-2 text-[18px] font-semibold leading-7 text-[#09090B] m-0">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Assets Moved Successfully
          </DialogTitle>
          <p className="text-sm text-[#3F3F46]">
            {selectedAssets.length} assets moved to {selectedProject?.name}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} className="h-10 px-4 py-2 rounded-lg border-[#E4E4E7] text-[#312C29]">
              Close
            </Button>
            <Button onClick={handleClose} className="h-10 px-4 py-2 rounded-lg bg-[#E86F25] text-[#FAFAFA]">
              View in {selectedProject?.name}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Main Dialog — стилі з Figma
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-xl p-6 gap-4 rounded-2xl border border-[#E4E4E7] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(16,24,40,0.10)] overflow-hidden flex flex-col"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        <DialogTitle className="text-[18px] font-semibold leading-7 text-[#09090B] m-0">
          Move to Project
        </DialogTitle>

        <div className="flex flex-col gap-4">
          {/* Destination project */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold leading-5 text-[#3F3F46]">
              Destination project
            </span>
            <Select value={destinationProject} onValueChange={setDestinationProject}>
              <SelectTrigger className="min-h-9 h-9 px-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white text-sm placeholder:text-[#71717A]">
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

          <div className="h-px self-stretch bg-[#E4E4E7]" />

          {/* Move options — картки як у Figma */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold leading-5 text-[#3F3F46]">
              Move options
            </span>
            <div className="flex flex-col gap-3">
              {MOVE_OPTIONS.map(({ key, title, description }) => {
                const checked = options[key];
                return (
                  <div
                    key={key}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleOption(key)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleOption(key);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 min-h-[84px] px-4 py-2 rounded-lg border text-left transition-colors cursor-pointer',
                      checked
                        ? 'bg-[#FFEDD5] border-[#E86F25]'
                        : 'bg-white border-[#E4E4E7] hover:bg-neutral-50'
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleOption(key)}
                      onClick={e => e.stopPropagation()}
                      className={cn(
                        'h-4 w-4 rounded border-2',
                        checked ? 'border-[#E86F25] bg-[#E86F25]' : 'border-[#E4E4E7]'
                      )}
                    />
                    <div className="flex flex-1 flex-col gap-1">
                      <span
                        className={cn(
                          'text-base font-semibold leading-6',
                          checked ? 'text-[#E86F25]' : 'text-[#18181B]'
                        )}
                      >
                        {title}
                      </span>
                      <span
                        className={cn(
                          'text-sm font-medium leading-5',
                          checked ? 'text-[#E86F25]' : 'text-[#18181B]'
                        )}
                      >
                        {description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-px self-stretch bg-[#E4E4E7]" />

          {/* Warning — amber блок з Figma */}
          <div className="flex items-start gap-2 px-4 py-2.5 rounded-lg bg-[#FEF3C7] border border-[#F59E0B]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#C2410C] mt-0.5" />
            <p className="text-sm font-normal leading-5 text-[#B45309]">
              Assets will be removed from current project. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={moving}
            className="h-10 px-4 py-2 rounded-lg border-[#E4E4E7] text-sm font-medium text-[#312C29] hover:bg-neutral-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={!destinationProject || moving}
            className="h-10 px-4 py-2 rounded-lg bg-[#E86F25] text-sm font-medium text-[#FAFAFA] hover:bg-[#d65a1a] disabled:opacity-50"
          >
            {moving ? 'Moving...' : 'Move to project'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

