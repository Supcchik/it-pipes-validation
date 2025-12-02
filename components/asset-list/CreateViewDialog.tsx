'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Check, Star, FileText, Filter } from 'lucide-react';
import type { View } from '@/lib/types/asset-list';

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${step === 'welcome' ? 'bg-orange-500' : 'bg-neutral-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'name' ? 'bg-orange-500' : 'bg-neutral-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'template' ? 'bg-orange-500' : 'bg-neutral-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'confirm' ? 'bg-orange-500' : 'bg-neutral-300'}`} />
        </div>

        {/* Step 1: Welcome */}
        {step === 'welcome' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Create New View</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-6 overflow-y-auto flex-1 min-h-0">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-orange-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Views help you organize your work
                  </h3>
                  <p className="text-sm text-neutral-600 mt-2 max-w-md mx-auto">
                    A view is a custom workspace with specific columns and filters. 
                    You can create different views for different tasks like NASCO checks, 
                    reporting, or daily reviews.
                  </p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What you&apos;ll set up:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">View Name</p>
                      <p className="text-xs text-neutral-600">A descriptive name for your view</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Filter className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Starting Template</p>
                      <p className="text-xs text-neutral-600">Start from scratch or copy an existing view</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Customize Later</p>
                      <p className="text-xs text-neutral-600">Add columns and filters after creation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep('name')}>
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 2: Name */}
        {step === 'name' && (
          <>
            <DialogHeader>
              <DialogTitle>Name Your View</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-6 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-2">
                <Label htmlFor="view-name">View Name</Label>
                <Input
                  id="view-name"
                  placeholder="e.g., NASCO Check, Material Review, Weekly Report"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-neutral-600">
                  Choose a descriptive name that reflects the purpose of this view
                </p>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-blue-900">
                    <strong>💡 Tip:</strong> Good view names describe the task, 
                    like &quot;NASCO Compliance Check&quot; or &quot;Defect Report Review&quot;
                  </p>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('welcome')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={() => setStep('template')}
                disabled={!canProceedToTemplate}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 3: Template Selection */}
        {step === 'template' && (
          <>
            <DialogHeader>
              <DialogTitle>Choose a Starting Point</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-6 overflow-y-auto flex-1 min-h-0">
              <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
                {/* Blank Template */}
                <Card 
                  className={`cursor-pointer transition-colors ${
                    selectedTemplate === 'blank' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'hover:border-neutral-300'
                  }`}
                  onClick={() => setSelectedTemplate('blank')}
                >
                  <CardHeader className="flex-row items-start space-y-0 gap-4">
                    <RadioGroupItem value="blank" id="blank" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="blank" className="cursor-pointer">
                        <CardTitle className="text-base">Start from Scratch</CardTitle>
                        <CardDescription>
                          Create a blank view with default columns. You can customize it later.
                        </CardDescription>
                      </Label>
                    </div>
                  </CardHeader>
                </Card>

                {/* Existing Views as Templates */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-neutral-700">Or copy from existing view:</p>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {existingViews.slice(0, 5).map((view) => (
                    <Card
                      key={view.id}
                      className={`cursor-pointer transition-colors ${
                        selectedTemplate === view.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'hover:border-neutral-300'
                      }`}
                      onClick={() => setSelectedTemplate(view.id)}
                    >
                      <CardHeader className="flex-row items-start space-y-0 gap-4 py-3">
                        <RadioGroupItem value={view.id} id={view.id} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={view.id} className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              {view.isFavorite && <Star className="w-3 h-3 fill-orange-500 text-orange-500" />}
                              <span className="font-medium text-sm">{view.name}</span>
                            </div>
                            <p className="text-xs text-neutral-600 mt-1">
                              {view.displayedColumns.length} columns, 
                              {' '}
                              {view.filters.length} filter{view.filters.length !== 1 ? 's' : ''}
                            </p>
                          </Label>
                        </div>
                      </CardHeader>
                    </Card>
                    ))}
                  </div>
                </div>
              </RadioGroup>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-blue-900">
                    <strong>💡 Tip:</strong> Copying from an existing view preserves its 
                    columns, filters, and layout settings.
                  </p>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('name')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => setStep('confirm')}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 4: Confirm */}
        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle>Review and Create</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-6 overflow-y-auto flex-1 min-h-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">View Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Name:</span>
                    <span className="text-sm font-medium">{viewName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Template:</span>
                    <span className="text-sm font-medium">
                      {selectedTemplate === 'blank' 
                        ? 'Blank View' 
                        : existingViews.find(v => v.id === selectedTemplate)?.name
                      }
                    </span>
                  </div>
                  {selectedTemplate !== 'blank' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">Columns:</span>
                        <span className="text-sm font-medium">
                          {existingViews.find(v => v.id === selectedTemplate)?.displayedColumns.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">Filters:</span>
                        <span className="text-sm font-medium">
                          {existingViews.find(v => v.id === selectedTemplate)?.filters.length || 0}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="make-default"
                  checked={makeDefault}
                  onChange={(e) => setMakeDefault(e.target.checked)}
                  className="rounded border-neutral-300"
                />
                <Label htmlFor="make-default" className="text-sm cursor-pointer">
                  Make this my default view (opens automatically)
                </Label>
              </div>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-green-900">
                    <strong>✨ Almost there!</strong> After creating, you can customize 
                    columns and filters using View Settings.
                  </p>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('template')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={!canCreate}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Create View
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}


