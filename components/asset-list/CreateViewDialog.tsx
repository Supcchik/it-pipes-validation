'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Info } from 'lucide-react';
import type { View } from '@/lib/types/asset-list';
import { cn } from '@/lib/utils';

interface CreateViewDialogProps {
  open: boolean;
  onClose: () => void;
  existingViews: View[];
  onCreateView: (view: View) => void;
}

type Step = 'welcome' | 'name' | 'template' | 'confirm';

export default function CreateViewDialog({
  open,
  onClose,
  existingViews,
  onCreateView
}: CreateViewDialogProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [viewName, setViewName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [makeDefault, setMakeDefault] = useState(false);

  const handleReset = () => {
    setStep('welcome');
    setViewName('');
    setSelectedTemplate('blank');
    setMakeDefault(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleCreate = () => {
    let newView: View;

    if (selectedTemplate === 'blank') {
      // Create blank view with defaults
      newView = {
        id: `view-${Date.now()}`,
        name: viewName,
        isFavorite: false,
        isDefault: makeDefault,
        displayedColumns: ['pipeSegment', 'street', 'material', 'width', 'date'],
        columnOrder: ['pipeSegment', 'street', 'material', 'width', 'date'],
        filters: [],
        mapRatio: 40,
        itemsPerPage: 100,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'current-user'
      };
    } else {
      // Duplicate from template
      const template = existingViews.find(v => v.id === selectedTemplate);
      if (!template) return;

      newView = {
        ...template,
        id: `view-${Date.now()}`,
        name: viewName,
        isFavorite: false,
        isDefault: makeDefault,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
    }

    onCreateView(newView);
    handleClose();
  };

  const canProceedToName = true;
  const canProceedToTemplate = viewName.trim().length > 0;
  const canCreate = viewName.trim().length > 0 && selectedTemplate;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border-[#E4E4E7] p-6 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(16,24,40,0.10)]"
      >
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${step === 'welcome' ? 'bg-orange-500' : 'bg-neutral-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'name' ? 'bg-orange-500' : 'bg-neutral-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'template' ? 'bg-orange-500' : 'bg-neutral-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'confirm' ? 'bg-orange-500' : 'bg-neutral-300'}`} />
        </div>

        {/* Step 1: Welcome — перший крок створення в'ю */}
        {step === 'welcome' && (
          <>
            <DialogHeader className="gap-2">
              <DialogTitle className="text-[#09090B] text-xl font-semibold leading-8">
                Create New View
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-2">
                <h3 className="text-[#09090B] text-base font-semibold leading-6">
                  Views help you organize your work
                </h3>
                <p className="text-[#3F3F46] text-sm leading-5">
                  A view is a custom workspace with specific columns and filters. You can create
                  different views for different tasks like NASCO checks, reporting, or daily reviews.
                </p>
              </div>

              <div className="rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-4">
                <p className="text-[#3F3F46] text-sm font-semibold leading-5 mb-3">
                  What you&apos;ll set up:
                </p>
                <ul className="space-y-3">
                  <li>
                    <p className="text-[#18181B] text-sm font-medium">View Name</p>
                    <p className="text-[#71717A] text-xs mt-0.5">A descriptive name for your view</p>
                  </li>
                  <li>
                    <p className="text-[#18181B] text-sm font-medium">Starting Point</p>
                    <p className="text-[#71717A] text-xs mt-0.5">
                      Start from scratch or copy from existing tab
                    </p>
                  </li>
                  <li>
                    <p className="text-[#18181B] text-sm font-medium">Customize Later</p>
                    <p className="text-[#71717A] text-xs mt-0.5">
                      Add columns and filters after creation
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2 border-t border-[#E4E4E7] pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="rounded-lg border-[#E4E4E7] text-[#312C29] text-sm font-medium"
              >
                Cancel
              </Button>
              <Button onClick={() => setStep('name')} className="rounded-lg text-sm font-medium">
                Get started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 2: View name */}
        {step === 'name' && (
          <>
            <DialogHeader className="gap-0">
              <DialogTitle className="text-[#09090B] text-lg font-semibold leading-7">
                Create New View
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-0">
              <div className="flex flex-col gap-1">
                <Label htmlFor="view-name" className="text-[#18181B] text-sm font-medium leading-5">
                  View name
                </Label>
                <Input
                  id="view-name"
                  placeholder="e.g., NASCO Check, Material Review, Weekly Report"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  autoFocus
                  className="min-h-9 rounded-md border-[#E4E4E7] px-3 py-2.5 text-[#18181B] text-sm font-normal leading-5"
                />
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-[#7DD3FC] bg-[#E0F2FE] px-4 py-2.5">
                <Info className="h-4 w-4 shrink-0 text-[#0284C7] mt-0.5" />
                <p className="text-[#0284C7] text-sm font-normal leading-5">
                  Good view names describe the task, like &quot;NASCO Compliance Check&quot; or &quot;Defect Report Review&quot;
                </p>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2 border-t border-[#E4E4E7] pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="h-10 rounded-lg border-[#E4E4E7] px-4 text-[#312C29] text-sm font-medium leading-5"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep('template')}
                disabled={!canProceedToTemplate}
                className="h-10 rounded-lg bg-[#E86F25] px-4 text-[#FAFAFA] text-sm font-medium leading-5 hover:bg-[#d6621f]"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 3: Starting Point */}
        {step === 'template' && (
          <>
            <DialogHeader className="gap-0">
              <DialogTitle className="text-[#09090B] text-lg font-semibold leading-7">
                Create New View
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-0">
              {/* Start from Scratch */}
              <button
                type="button"
                onClick={() => setSelectedTemplate('blank')}
                className={cn(
                  'flex min-h-[104px] w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2 text-left transition-colors',
                  selectedTemplate === 'blank'
                    ? 'border border-[#E86F25] bg-[#FFEDD5]'
                    : 'border border-[#E4E4E7] bg-white hover:border-[#E86F25] hover:bg-[#FFF7ED]'
                )}
              >
                <div className="flex flex-1 flex-col gap-1">
                  <span
                    className={cn(
                      'text-base font-semibold leading-6',
                      selectedTemplate === 'blank' ? 'text-[#E86F25]' : 'text-[#18181B]'
                    )}
                  >
                    Start from Scratch
                  </span>
                  <span
                    className={cn(
                      'text-sm font-medium leading-5',
                      selectedTemplate === 'blank' ? 'text-[#E86F25]' : 'text-[#18181B]'
                    )}
                  >
                    Create a blank view with default columns. You can customize it later.
                  </span>
                </div>
              </button>

              <div className="h-px shrink-0 bg-[#E4E4E7]" />

              {/* Or use existing view */}
              <div className="flex flex-col gap-2">
                <span className="text-[#3F3F46] text-sm font-semibold leading-5">
                  Or use existing view:
                </span>
                <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                  {existingViews.slice(0, 5).map((view) => (
                    <button
                      key={view.id}
                      type="button"
                      onClick={() => setSelectedTemplate(view.id)}
                      className={cn(
                        'flex min-h-[84px] w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-2 text-left transition-colors',
                        selectedTemplate === view.id
                          ? 'border-[#E86F25] bg-[#FFEDD5]'
                          : 'border-[#E4E4E7] bg-white hover:border-[#E86F25] hover:bg-[#FFF7ED]'
                      )}
                    >
                      <div className="flex flex-1 flex-col gap-1">
                        <span className="text-[#18181B] text-base font-semibold leading-6">
                          {view.name}
                        </span>
                        <span className="text-[#18181B] text-sm font-medium leading-5">
                          {view.displayedColumns.length} columns,{' '}
                          {view.filters.length} filter{view.filters.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-[#7DD3FC] bg-[#E0F2FE] px-4 py-2.5">
                <Info className="h-4 w-4 shrink-0 text-[#0284C7] mt-0.5" />
                <p className="text-[#0284C7] text-sm font-normal leading-5">
                  Copying from an existing tab preserves its columns, filters, and layout settings.
                  Filters will be saved in the new view.
                </p>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2 border-t border-[#E4E4E7] pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="h-10 rounded-lg border-[#E4E4E7] px-4 text-[#312C29] text-sm font-medium leading-5"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep('confirm')}
                className="h-10 rounded-lg bg-[#E86F25] px-4 text-[#FAFAFA] text-sm font-medium leading-5 hover:bg-[#d6621f]"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 4: Confirm — View summary */}
        {step === 'confirm' && (
          <>
            <DialogHeader className="gap-0">
              <DialogTitle className="text-[#09090B] text-lg font-semibold leading-7">
                Create New View
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-0">
              <div className="flex flex-col gap-2">
                <span className="text-[#3F3F46] text-sm font-semibold leading-5">
                  View summary
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-[#18181B] text-sm font-medium leading-5">Name:</span>
                  <span className="text-[#18181B] text-base font-semibold leading-6">{viewName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#18181B] text-sm font-medium leading-5">Starting point:</span>
                  <span className="text-[#18181B] text-base font-semibold leading-6">
                    {selectedTemplate === 'blank'
                      ? 'Blank view'
                      : existingViews.find((v) => v.id === selectedTemplate)?.name ?? 'Existing view'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#18181B] text-sm font-medium leading-5">Columns:</span>
                  <span className="text-[#18181B] text-base font-semibold leading-6">
                    {selectedTemplate === 'blank'
                      ? 8
                      : existingViews.find((v) => v.id === selectedTemplate)?.displayedColumns.length ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#18181B] text-sm font-medium leading-5">Filters:</span>
                  <span className="text-[#18181B] text-base font-semibold leading-6">
                    {selectedTemplate === 'blank'
                      ? 0
                      : existingViews.find((v) => v.id === selectedTemplate)?.filters.length ?? 0}
                  </span>
                </div>
              </div>

              <div className="h-px shrink-0 bg-[#E4E4E7]" />

              <label
                htmlFor="make-default"
                className="flex cursor-pointer items-start gap-2"
              >
                <Checkbox
                  id="make-default"
                  checked={makeDefault}
                  onCheckedChange={(checked) => setMakeDefault(checked === true)}
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0 rounded border-[1.25px] border-[#E4E4E7]',
                    'data-[state=checked]:border-[#E86F25] data-[state=checked]:bg-[#E86F25] data-[state=checked]:text-white'
                  )}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#18181B] text-sm font-medium leading-5">
                    Make as default
                  </span>
                  <span className="text-[#71717A] text-sm font-normal leading-5">
                    This view opens automatically
                  </span>
                </div>
              </label>
            </div>

            <DialogFooter className="flex justify-end gap-2 border-t border-[#E4E4E7] pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="h-10 rounded-lg border-[#E4E4E7] px-4 text-[#312C29] text-sm font-medium leading-5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!canCreate}
                className="h-10 rounded-lg bg-[#E86F25] px-4 text-[#FAFAFA] text-sm font-medium leading-5 hover:bg-[#d6621f]"
              >
                Create View
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}


