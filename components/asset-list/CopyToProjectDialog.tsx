'use client';

import { useState } from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
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

const COPY_OPTIONS = [
  { key: 'inspectionData' as const, title: 'Inspection data', description: 'Pipe segments, dates' },
  { key: 'observations' as const, title: 'Observations', description: 'Defects, codes' },
  { key: 'mediaFiles' as const, title: 'Media files', description: 'Inspection images and recordings' },
  { key: 'copyAssignments' as const, title: 'Assigments', description: 'User assignments and workflow status' },
];

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
    copyAssignments: false,
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

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Main Dialog — стилі з Figma
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-xl p-6 gap-4 rounded-2xl border border-[#E4E4E7] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(16,24,40,0.10)] overflow-hidden flex flex-col"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        <DialogTitle className="text-[18px] font-semibold leading-7 text-[#09090B] m-0">
          Copy to Project
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

          {/* Copy options — картки як у Figma */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold leading-5 text-[#3F3F46]">
              Copy options
            </span>
            <div className="flex flex-col gap-3">
              {COPY_OPTIONS.map(({ key, title, description }) => {
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

          {/* Info — sky blue блок */}
          <div className="flex items-start gap-2 px-4 py-2.5 rounded-lg bg-[#E0F2FE] border border-[#7DD3FC]">
            <Info className="w-4 h-4 shrink-0 text-[#0284C7] mt-0.5" />
            <p className="text-sm font-normal leading-5 text-[#0284C7]">
              Assets will remain in current project. Copies will be independent duplicates.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-0">
          <Button
            variant="outline"
            onClick={handleClose}
            className="h-10 px-4 py-2 rounded-lg border-[#E4E4E7] text-sm font-medium text-[#312C29] hover:bg-neutral-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCopy}
            disabled={!destinationProject || copying}
            className="h-10 px-4 py-2 rounded-lg bg-[#E86F25] text-sm font-medium text-[#FAFAFA] hover:bg-[#d65a1a] disabled:opacity-50"
          >
            {copying ? 'Copying...' : 'Copy to project'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}







