'use client';

import { useState } from 'react';
import { FileText, Loader2, CheckCircle2, Download, Eye, Target, Settings, Eye as EyeIcon, CheckCircle, ArrowRight, Share2, RotateCcw, Filter, List, Map, Image, BarChart3, ShieldCheck, FileCheck, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReportGenerationDialogProps {
  open: boolean;
  onClose: () => void;
  totalAssets: number;
  filteredAssets: number;
  selectedAssets: number;
}

type ReportScope = 'selected' | 'filtered' | 'all';
type InspectionFilter = 'newest' | 'all';

interface ReportConfig {
  scope: ReportScope;
  inspectionFilter: InspectionFilter;
  sections: {
    coverPage: boolean;
    executiveSummary: boolean;
    mapOverview: boolean;
    assetList: boolean;
    detailedInspections: boolean;
    inspectionPhotos: boolean;
    observationCharts: boolean;
    pacpCompliance: boolean;
  };
  details: {
    projectName: string;
    preparedBy: string;
    reportDate: string;
  };
}

type Step = 1 | 2 | 3 | 4;

export default function ReportGenerationDialog({
  open,
  onClose,
  totalAssets,
  filteredAssets,
  selectedAssets
}: ReportGenerationDialogProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [config, setConfig] = useState<ReportConfig>({
    scope: 'filtered',
    inspectionFilter: 'newest',
    sections: {
      coverPage: true,
      executiveSummary: true,
      mapOverview: true,
      assetList: true,
      detailedInspections: true,
      inspectionPhotos: false,
      observationCharts: false,
      pacpCompliance: true,
    },
    details: {
      projectName: 'CityTestQA Project',
      preparedBy: 'John Smith',
      reportDate: new Date().toISOString().split('T')[0],
    },
  });
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState<{
    filename: string;
    pages: number;
    size: string;
    duration: number;
  } | null>(null);

  const getAssetCount = () => {
    switch (config.scope) {
      case 'selected': return selectedAssets;
      case 'filtered': return filteredAssets;
      case 'all': return totalAssets;
    }
  };

  const getInspectionCount = () => {
    const assetCount = getAssetCount();
    return config.inspectionFilter === 'newest' ? assetCount : assetCount * 2; // Assume avg 2 inspections per asset
  };

  const getEstimatedPages = () => {
    let pages = 0;
    if (config.sections.coverPage) pages += 1;
    if (config.sections.executiveSummary) pages += 2;
    if (config.sections.mapOverview) pages += 1;
    if (config.sections.assetList) pages += Math.ceil(getAssetCount() / 30); // 30 per page
    if (config.sections.detailedInspections) pages += getInspectionCount(); // 1 per inspection
    if (config.sections.observationCharts) pages += 2;
    return pages;
  };

  const getEstimatedFileSize = () => {
    let sizeMB = 0.5; // Base PDF
    sizeMB += getEstimatedPages() * 0.1; // 100KB per page
    if (config.sections.inspectionPhotos) sizeMB += getInspectionCount() * 2; // 2MB per photo
    if (config.sections.mapOverview) sizeMB += 1; // Map image
    return sizeMB > 1 ? `~${sizeMB.toFixed(1)} MB` : `~${Math.round(sizeMB * 1000)} KB`;
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setProgress(0);
    setCurrentStep(4);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/reports/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     config,
      //     assetCount: getAssetCount(),
      //     inspectionCount: getInspectionCount(),
      //   }),
      // });
      // const { jobId } = await response.json();

      // Simulate generation progress
      const startTime = Date.now();
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 3, 100);
          
          if (newProgress >= 100) {
            clearInterval(interval);
            const duration = Math.round((Date.now() - startTime) / 1000);
            
            setGeneratedReport({
              filename: `${config.details.projectName.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`,
              pages: getEstimatedPages(),
              size: getEstimatedFileSize(),
              duration,
            });
            setGenerating(false);
          }
          
          return newProgress;
        });
      }, 200);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Failed to generate report. Please try again.');
      setGenerating(false);
      setCurrentStep(3);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setGenerating(false);
    setGeneratedReport(null);
    setProgress(0);
    onClose();
  };

  const handleDownload = () => {
    // TODO: Trigger actual download
    // window.location.href = `/api/reports/download/${generatedReport?.filename}`;
    console.log('Downloading:', generatedReport?.filename);
    handleClose();
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Scope config={config} setConfig={setConfig} totalAssets={totalAssets} filteredAssets={filteredAssets} selectedAssets={selectedAssets} />;
      case 2:
        return <Step2Options config={config} setConfig={setConfig} getEstimatedPages={getEstimatedPages} getEstimatedFileSize={getEstimatedFileSize} />;
      case 3:
        return <Step3Preview config={config} />;
      case 4:
        if (generatedReport) {
          return <Step4Success report={generatedReport} onDownload={handleDownload} />;
        }
        return <Step4Generating progress={progress} currentPage={Math.floor(getEstimatedPages() * progress / 100)} totalPages={getEstimatedPages()} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Generate Report
          </DialogTitle>
        </DialogHeader>

        {/* Progress Stepper */}
        {!generatedReport && (
          <div className="border-b border-neutral-200 pb-4">
            <div className="flex items-center justify-between px-4">
              {[
                { num: 1, label: 'Scope', icon: Target },
                { num: 2, label: 'Options', icon: Settings },
                { num: 3, label: 'Preview', icon: EyeIcon },
                { num: 4, label: 'Done', icon: CheckCircle }
              ].map((step, index) => {
                const Icon = step.icon;
                const isCompleted = step.num < currentStep;
                const isActive = step.num === currentStep;
                const isUpcoming = step.num > currentStep;
                
                return (
                  <div key={step.num} className="flex items-center flex-1">
                    <div className="flex items-center flex-1">
                      <button
                        onClick={() => isCompleted && setCurrentStep(step.num as Step)}
                        className={`relative flex items-center justify-center transition-all ${
                          isCompleted ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                        }`}
                        disabled={!isCompleted}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                            isCompleted
                              ? 'bg-green-100 text-green-700 ring-2 ring-green-200'
                              : isActive
                              ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300 animate-pulse'
                              : 'bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <div className="ml-2 text-xs font-medium">
                          {step.label}
                        </div>
                      </button>
                    </div>
                    {index < 3 && (
                      <div className="flex-1 mx-2 h-1 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isCompleted || isActive
                              ? 'bg-green-500'
                              : 'bg-neutral-200'
                          }`}
                          style={{
                            width: isCompleted ? '100%' : isActive ? '50%' : '0%'
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {!generatedReport && !generating && (
          <div className="border-t border-neutral-200 p-4 flex justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? handleClose : handleBack}
            >
              {currentStep === 1 ? 'Cancel' : '← Back'}
            </Button>
            <div className="flex gap-2">
              {currentStep < 3 && (
                <Button onClick={handleNext}>
                  Next →
                </Button>
              )}
              {currentStep === 3 && (
                <Button onClick={handleGenerate}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate PDF
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Step 1 Component
function Step1Scope({ config, setConfig, totalAssets, filteredAssets, selectedAssets }: any) {
  const assetCounts = {
    selected: selectedAssets,
    filtered: filteredAssets,
    all: totalAssets,
  };

  const getPreviewText = () => {
    const assetCount = assetCounts[config.scope as keyof typeof assetCounts];
    const inspectionCount = config.inspectionFilter === 'newest' ? assetCount : assetCount * 2;
    const estimatedPages = Math.ceil(inspectionCount / 5) + 4; // Base pages + inspections
    
    return {
      assets: assetCount,
      inspections: inspectionCount,
      inspectionText: config.inspectionFilter === 'newest' ? 'newest only' : 'all',
      pages: estimatedPages,
    };
  };

  const preview = getPreviewText();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Report Scope</h3>
        <p className="text-sm text-neutral-600">
          Select which assets to include in the report
        </p>
      </div>

      <div className="h-px bg-neutral-200" />

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Report Scope</Label>
        <RadioGroup
          value={config.scope}
          onValueChange={(value) => setConfig({ ...config, scope: value })}
        >
          <div className="space-y-3">
            <label
              htmlFor="scope-selected"
              className={`flex items-start space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                config.scope === 'selected'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-neutral-200 hover:border-blue-300 hover:bg-neutral-50'
              }`}
            >
              <RadioGroupItem value="selected" id="scope-selected" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <Label htmlFor="scope-selected" className="font-semibold cursor-pointer">
                    Selected Assets ({assetCounts.selected} inspections)
                  </Label>
                </div>
                <p className="text-xs text-neutral-600">
                  Include only the assets you selected in the table
                </p>
                {config.scope === 'selected' && (
                  <p className="text-xs text-blue-600 mt-1 font-medium">✓ Quick to generate</p>
                )}
              </div>
            </label>

            <label
              htmlFor="scope-filtered"
              className={`flex items-start space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                config.scope === 'filtered'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-neutral-200 hover:border-blue-300 hover:bg-neutral-50'
              }`}
            >
              <RadioGroupItem value="filtered" id="scope-filtered" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <List className="w-4 h-4 text-green-600" />
                  <Label htmlFor="scope-filtered" className="font-semibold cursor-pointer">
                    All Assets in View ({assetCounts.filtered} inspections)
                  </Label>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Recommended</span>
                </div>
                <p className="text-xs text-neutral-600">
                  Include all assets currently visible (with filters applied)
                </p>
                {config.scope === 'filtered' && (
                  <p className="text-xs text-green-600 mt-1 font-medium">✓ Best for most cases</p>
                )}
              </div>
            </label>

            <label
              htmlFor="scope-all"
              className={`flex items-start space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                config.scope === 'all'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-neutral-200 hover:border-blue-300 hover:bg-neutral-50'
              }`}
            >
              <RadioGroupItem value="all" id="scope-all" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-orange-600" />
                  <Label htmlFor="scope-all" className="font-semibold cursor-pointer">
                    All Assets in Project ({assetCounts.all} inspections)
                  </Label>
                </div>
                <p className="text-xs text-neutral-600">
                  Include every asset regardless of filters
                </p>
                {config.scope === 'all' && (
                  <p className="text-xs text-orange-600 mt-1 font-medium">⚠️ Large file size</p>
                )}
              </div>
            </label>
          </div>
        </RadioGroup>
      </div>

      <div className="h-px bg-neutral-200" />

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Inspection Filter</Label>
        <RadioGroup
          value={config.inspectionFilter}
          onValueChange={(value) => setConfig({ ...config, inspectionFilter: value })}
        >
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="newest" id="filter-newest" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="filter-newest" className="font-medium cursor-pointer">
                  Newest Inspection Only
                </Label>
                <p className="text-xs text-neutral-600 mt-1">
                  One inspection per asset (most recent)
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="all" id="filter-all" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="filter-all" className="font-medium cursor-pointer">
                  All Inspections
                </Label>
                <p className="text-xs text-neutral-600 mt-1">
                  Include every inspection for each asset
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="h-px bg-neutral-200" />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-2">📊 Preview</h4>
        <div className="space-y-1 text-sm text-neutral-700">
          <p>Assets: <strong>{preview.assets}</strong></p>
          <p>Inspections: <strong>{preview.inspections}</strong> ({preview.inspectionText})</p>
          <p>Estimated Pages: <strong>~{preview.pages}</strong></p>
        </div>
      </div>
    </div>
  );
}

// Step 2 Component
function Step2Options({ config, setConfig, getEstimatedPages, getEstimatedFileSize }: any) {
  const toggleSection = (key: keyof typeof config.sections) => {
    setConfig({
      ...config,
      sections: {
        ...config.sections,
        [key]: !config.sections[key],
      },
    });
  };

  const updateDetail = (key: keyof typeof config.details, value: string) => {
    setConfig({
      ...config,
      details: {
        ...config.details,
        [key]: value,
      },
    });
  };

  const sectionGroups = {
    essential: [
      { key: 'coverPage', title: 'Cover Page', description: 'Project title, date, inspector name', icon: FileText, recommended: true },
      { key: 'executiveSummary', title: 'Executive Summary', description: 'Key findings, statistics, recommendations', icon: BarChart3, recommended: true },
      { key: 'mapOverview', title: 'Map Overview', description: 'Geographic overview with asset locations', icon: Map, recommended: true },
      { key: 'assetList', title: 'Asset List Table', description: 'Tabular data with all asset information', icon: List, recommended: true },
    ],
    optional: [
      { key: 'detailedInspections', title: 'Detailed Inspections', description: 'One page per inspection with observations', icon: FileCheck },
      { key: 'inspectionPhotos', title: 'Inspection Photos', description: 'Embed photos in detailed pages (increases file size)', icon: Image, sizeImpact: '+15MB' },
      { key: 'observationCharts', title: 'Observation Charts', description: 'Visual charts showing defect distribution', icon: BarChart3 },
    ],
    compliance: [
      { key: 'pacpCompliance', title: 'PACP/NASCO Compliance', description: 'Include compliance scores and validation', icon: ShieldCheck, recommended: true },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Report Options</h3>
        <p className="text-sm text-neutral-600">
          Configure what to include in your report
        </p>
      </div>

      <div className="h-px bg-neutral-200" />

      <div className="space-y-6">
        {/* Essential Sections */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-semibold">Essential Sections</Label>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Recommended</span>
          </div>
          <div className="space-y-2">
            {sectionGroups.essential.map(({ key, title, description, icon: Icon, recommended }) => (
              <div key={key} className="flex items-start space-x-3 p-3 border border-neutral-200 rounded-lg hover:border-blue-300 transition-colors">
                <Checkbox
                  id={key}
                  checked={config.sections[key as keyof typeof config.sections]}
                  onCheckedChange={() => toggleSection(key as keyof typeof config.sections)}
                />
                <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={key} className="font-medium cursor-pointer">
                      {title}
                    </Label>
                    {recommended && (
                      <span className="text-xs text-blue-600">★</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Sections */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Optional Sections</Label>
          <div className="space-y-2">
            {sectionGroups.optional.map(({ key, title, description, icon: Icon, sizeImpact }) => (
              <div key={key} className="flex items-start space-x-3 p-3 border border-neutral-200 rounded-lg hover:border-blue-300 transition-colors">
                <Checkbox
                  id={key}
                  checked={config.sections[key as keyof typeof config.sections]}
                  onCheckedChange={() => toggleSection(key as keyof typeof config.sections)}
                />
                <Icon className="w-5 h-5 text-neutral-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={key} className="font-medium cursor-pointer">
                      {title}
                    </Label>
                    {sizeImpact && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{sizeImpact}</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Compliance</Label>
          <div className="space-y-2">
            {sectionGroups.compliance.map(({ key, title, description, icon: Icon, recommended }) => (
              <div key={key} className="flex items-start space-x-3 p-3 border border-green-200 bg-green-50 rounded-lg">
                <Checkbox
                  id={key}
                  checked={config.sections[key as keyof typeof config.sections]}
                  onCheckedChange={() => toggleSection(key as keyof typeof config.sections)}
                />
                <Icon className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={key} className="font-medium cursor-pointer">
                      {title}
                    </Label>
                    {recommended && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Recommended</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-neutral-200" />

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Report Details</Label>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-xs flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Project Name
            </Label>
            <Input
              id="project-name"
              value={config.details.projectName}
              onChange={(e) => updateDetail('projectName', e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prepared-by" className="text-xs flex items-center gap-2">
              <User className="w-3 h-3" />
              Prepared By
            </Label>
            <Input
              id="prepared-by"
              value={config.details.preparedBy}
              onChange={(e) => updateDetail('preparedBy', e.target.value)}
              placeholder="Inspector name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-date" className="text-xs flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Report Date
            </Label>
            <Input
              id="report-date"
              type="date"
              value={config.details.reportDate}
              onChange={(e) => updateDetail('reportDate', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-neutral-200" />

      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-semibold">Live Preview</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded p-3 border border-blue-100">
            <p className="text-xs text-neutral-600 mb-1">Estimated Pages</p>
            <p className="text-lg font-bold text-blue-600">~{getEstimatedPages()}</p>
          </div>
          <div className="bg-white rounded p-3 border border-green-100">
            <p className="text-xs text-neutral-600 mb-1">File Size</p>
            <p className="text-lg font-bold text-green-600">{getEstimatedFileSize()}</p>
          </div>
        </div>
        {config.sections.inspectionPhotos && (
          <p className="text-xs text-orange-600 mt-2">⚠️ Photos will significantly increase file size</p>
        )}
      </div>
    </div>
  );
}

// Step 3 Component
function Step3Preview({ config }: any) {
  const [selectedPage, setSelectedPage] = useState(0);

  const pages = [
    { id: 0, title: 'Cover Page', type: 'cover' },
    { id: 1, title: 'Executive Summary', type: 'summary' },
    { id: 2, title: 'Map Overview', type: 'map' },
    { id: 3, title: 'Asset List', type: 'table' },
    { id: 4, title: 'Inspection 1/234', type: 'inspection' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Preview Report</h3>
        <p className="text-sm text-neutral-600">
          Review your report before generating
        </p>
      </div>

      <div className="flex gap-4 h-[500px]">
        {/* Page List */}
        <div className="w-56 border border-neutral-200 rounded-lg overflow-hidden flex flex-col bg-neutral-50">
          <div className="p-3 border-b border-neutral-200 bg-white">
            <h4 className="text-xs font-semibold text-neutral-600">Page Navigation</h4>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPage(page.id)}
                className={`w-full text-left px-3 py-2.5 rounded text-sm transition-all flex items-center gap-2 ${
                  selectedPage === page.id
                    ? 'bg-blue-100 text-blue-700 font-medium shadow-sm border border-blue-300'
                    : 'hover:bg-neutral-100 border border-transparent'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{page.title}</span>
              </button>
            ))}
            <div className="text-xs text-neutral-500 px-3 py-2 text-center">
              ... 42 more pages
            </div>
          </div>
          <div className="p-2 border-t border-neutral-200 bg-white text-xs text-center text-neutral-600">
            Page {selectedPage + 1} of {pages.length + 42}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 border border-neutral-200 rounded-lg bg-neutral-50 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-neutral-200 bg-white flex items-center justify-between">
            <h4 className="text-xs font-semibold text-neutral-600">Preview</h4>
            <div className="flex items-center gap-2">
              <select className="text-xs border border-neutral-300 rounded px-2 py-1">
                <option>100%</option>
                <option>75%</option>
                <option>50%</option>
                <option>Fit Width</option>
                <option>Full Page</option>
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
            <div className="bg-white shadow-xl p-8 w-full max-w-md aspect-[8.5/11] border-2 border-neutral-200">
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-neutral-900">INSPECTION REPORT</h1>
                <p className="text-lg font-semibold text-blue-600">{config.details.projectName}</p>
                <div className="text-sm text-neutral-600 space-y-1 mt-6">
                  <p>Prepared by: {config.details.preparedBy}</p>
                  <p>Date: {new Date(config.details.reportDate).toLocaleDateString()}</p>
                </div>
                <div className="text-sm font-medium mt-8 pt-6 border-t border-neutral-200">
                  <p className="text-neutral-700">234 Assets Inspected</p>
                  <p className="text-neutral-700">47 Pages</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <span className="text-orange-600 text-lg">⚡</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-900 mb-1">Quick Tips</p>
            <ul className="text-xs text-orange-800 space-y-1">
              <li>• Click pages in the list to navigate</li>
              <li>• Use arrow keys to move between pages</li>
              <li>• Adjust zoom level for better preview</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4 Generating Component
function Step4Generating({ progress, currentPage, totalPages }: any) {
  const steps = [
    { label: 'Preparing data', completed: progress > 10 },
    { label: 'Generating cover page', completed: progress > 20 },
    { label: 'Creating executive summary', completed: progress > 35 },
    { label: 'Rendering map overview', completed: progress > 50 },
    { label: 'Processing inspection details', completed: progress > 70 },
    { label: 'Compiling PDF', completed: progress > 85 },
    { label: 'Finalizing document', completed: progress > 95 },
  ];

  const currentStepIndex = steps.findIndex(s => !s.completed);

  return (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Generating Report...</h3>
      </div>

      <Progress value={progress} className="h-3" />

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-neutral-600 mb-1">Status</p>
          <p className="text-sm font-semibold text-blue-700">Rendering pages</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-xs text-neutral-600 mb-1">Progress</p>
          <p className="text-sm font-semibold text-green-700">
            {currentPage} of {totalPages} pages
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <p className="text-xs text-neutral-600 mb-1">Estimated Time</p>
          <p className="text-sm font-semibold text-orange-700">~{Math.ceil((100 - progress) / 5)}s</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <p className="text-xs text-neutral-600 mb-1">Speed</p>
          <p className="text-sm font-semibold text-purple-700">
            {progress > 0 ? (currentPage / ((100 - progress) / 5)).toFixed(1) : '0'} pages/sec
          </p>
        </div>
      </div>

      <div className="h-px bg-neutral-200" />

      <div className="space-y-3">
        <p className="text-sm font-semibold">Current Step:</p>
        <div className="space-y-2">
          {steps.map((step, index) => {
            const isCompleted = step.completed;
            const isActive = index === currentStepIndex;
            
            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  isActive ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  isCompleted
                    ? 'bg-green-100 text-green-700'
                    : isActive
                    ? 'bg-blue-100 text-blue-700 animate-pulse'
                    : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {isCompleted ? '✓' : isActive ? '→' : '⋯'}
                </div>
                <span className={`text-sm ${isCompleted ? 'text-neutral-900 font-medium' : isActive ? 'text-blue-700 font-medium' : 'text-neutral-500'}`}>
                  {step.label}
                </span>
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-16 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Step 4 Success Component
function Step4Success({ report, onDownload }: any) {
  return (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold">Report Generated Successfully</h3>
        <p className="text-sm text-neutral-600 mt-2">Your inspection report is ready</p>
      </div>

      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <FileText className="w-6 h-6 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{report.filename}</p>
            <p className="text-sm text-neutral-600">
              {report.pages} pages, {report.size}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              ⏱️ Generated in {report.duration} seconds
            </p>
          </div>
        </div>

        <div className="h-px bg-neutral-200" />

        <div className="text-sm">
          <p className="font-medium mb-2">📁 Contains:</p>
          <ul className="space-y-1 text-neutral-600">
            <li>• Cover page and executive summary</li>
            <li>• Map overview with assets</li>
            <li>• Asset list table</li>
            <li>• Detailed inspection pages</li>
            <li>• PACP compliance data</li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onDownload} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button onClick={onDownload} className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            Open
          </Button>
          <Button variant="outline" onClick={onDownload} className="px-3">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 justify-center">
          <Button variant="ghost" size="sm" onClick={onDownload}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Generate Another
          </Button>
        </div>
      </div>
    </div>
  );
}

