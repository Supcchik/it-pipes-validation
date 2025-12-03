'use client';

import { useState } from 'react';
import { FileText, Loader2, CheckCircle2, Download, Eye, Target, Settings, Eye as EyeIcon, CheckCircle, Share2, RotateCcw, Filter, List, Image, BarChart3, ShieldCheck, FileCheck, Calendar, User } from 'lucide-react';
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
    // Essential
    coverPage: boolean;
    executiveSummary: boolean;
    mapOverview: boolean;
    assetListTable: boolean;
    
    // Project Information
    projectInformation: boolean;
    projectSummary: boolean;
    
    // Inclination Analysis
    inclinationGraph: boolean;
    inclinationDepth: boolean;
    inclinationTabular: boolean;
    
    // Defect Reports
    defectListing: boolean;
    defectPlotCenter: boolean;
    defectPlotCenterWithImages: boolean;
    defectPlotLeft: boolean;
    defectPlotLeftScaled: boolean;
    defectPlotLeftWithImages: boolean;
    
    // Inspection Photos
    images4PerPage: boolean;
    images2PerPage: boolean;
    images1PerPage: boolean;
    
    // Compliance
    pacpCompliance: boolean;
    pacpConditions: boolean;
  };
  display: {
    headerStyle: 'alias' | 'description' | 'code';
    codeDisplay: 'code' | 'description' | 'both';
    showColors: boolean;
    individualPDFs: boolean;
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
  const [selectedPreset, setSelectedPreset] = useState<'custom' | 'standard' | 'compliance' | 'visual' | 'executive'>('custom');
  const [config, setConfig] = useState<ReportConfig>({
    scope: 'filtered',
    inspectionFilter: 'newest',
    sections: {
      // Essential
      coverPage: true,
      executiveSummary: true,
      mapOverview: true,
      assetListTable: true,
      
      // Project Information
      projectInformation: false,
      projectSummary: false,
      
      // Inclination Analysis
      inclinationGraph: false,
      inclinationDepth: false,
      inclinationTabular: false,
      
      // Defect Reports
      defectListing: true,
      defectPlotCenter: false,
      defectPlotCenterWithImages: false,
      defectPlotLeft: false,
      defectPlotLeftScaled: false,
      defectPlotLeftWithImages: false,
      
      // Inspection Photos
      images4PerPage: false,
      images2PerPage: false,
      images1PerPage: false,
      
      // Compliance
      pacpCompliance: true,
      pacpConditions: false,
    },
    display: {
      headerStyle: 'alias',
      codeDisplay: 'description',
      showColors: false,
      individualPDFs: false,
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
    const assetCount = getAssetCount();
    const inspectionCount = getInspectionCount();
    let pages = 0;
    
    // Essential sections
    if (config.sections.coverPage) pages += 1;
    if (config.sections.executiveSummary) pages += 2;
    if (config.sections.mapOverview) pages += 1;
    if (config.sections.assetListTable) pages += Math.ceil(assetCount / 30); // 30 assets per page
    
    // Project Information
    if (config.sections.projectInformation) pages += 2;
    if (config.sections.projectSummary) pages += 1;
    
    // Inclination Analysis
    if (config.sections.inclinationGraph) pages += Math.ceil(inspectionCount / 4); // 4 graphs per page
    if (config.sections.inclinationDepth) pages += Math.ceil(inspectionCount / 4);
    if (config.sections.inclinationTabular) pages += Math.ceil(inspectionCount / 10); // 10 per page
    
    // Defect Reports
    if (config.sections.defectListing) pages += Math.ceil(inspectionCount / 5); // 5 per page
    if (config.sections.defectPlotCenter) pages += inspectionCount; // 1 per inspection
    if (config.sections.defectPlotCenterWithImages) pages += inspectionCount * 2; // More space for images
    if (config.sections.defectPlotLeft) pages += inspectionCount;
    if (config.sections.defectPlotLeftScaled) pages += inspectionCount;
    if (config.sections.defectPlotLeftWithImages) pages += inspectionCount * 2;
    
    // Inspection Photos
    if (config.sections.images4PerPage) pages += Math.ceil(inspectionCount * 4 / 4); // Avg 4 photos per inspection
    if (config.sections.images2PerPage) pages += Math.ceil(inspectionCount * 4 / 2);
    if (config.sections.images1PerPage) pages += inspectionCount * 4;
    
    // Compliance
    if (config.sections.pacpCompliance) pages += Math.ceil(inspectionCount / 10);
    if (config.sections.pacpConditions) pages += Math.ceil(inspectionCount / 8);
    
    return pages;
  };

  const getEstimatedFileSize = () => {
    const inspectionCount = getInspectionCount();
    const pages = getEstimatedPages();
    let sizeMB = 0.5; // Base PDF overhead
    
    // Base page size
    sizeMB += pages * 0.1; // 100KB per page
    
    // Add size for image-heavy sections
    if (config.sections.mapOverview) sizeMB += 1; // Map image
    if (config.sections.defectPlotCenterWithImages) sizeMB += inspectionCount * 0.5; // 500KB per inspection
    if (config.sections.defectPlotLeftWithImages) sizeMB += inspectionCount * 0.5;
    
    // Photo sections (major file size impact)
    if (config.sections.images4PerPage) sizeMB += inspectionCount * 2; // ~2MB per inspection (4 photos)
    if (config.sections.images2PerPage) sizeMB += inspectionCount * 3; // ~3MB per inspection (larger photos)
    if (config.sections.images1PerPage) sizeMB += inspectionCount * 5; // ~5MB per inspection (full page)
    
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
        return <Step2Options 
          config={config} 
          setConfig={setConfig} 
          selectedPreset={selectedPreset}
          setSelectedPreset={setSelectedPreset}
          getEstimatedPages={getEstimatedPages} 
          getEstimatedFileSize={getEstimatedFileSize}
          assetCount={getAssetCount()}
          inspectionCount={getInspectionCount()}
        />;
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
function Step1Scope({ 
  config, 
  setConfig, 
  totalAssets, 
  filteredAssets, 
  selectedAssets 
}: {
  config: ReportConfig;
  setConfig: React.Dispatch<React.SetStateAction<ReportConfig>>;
  totalAssets: number;
  filteredAssets: number;
  selectedAssets: number;
}) {
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
          onValueChange={(value) => setConfig({ ...config, scope: value as ReportScope })}
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
          onValueChange={(value) => setConfig({ ...config, inspectionFilter: value as InspectionFilter })}
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

// Package Presets
const PACKAGE_PRESETS = {
  standard: {
    name: 'Standard Report',
    sections: {
      coverPage: true,
      executiveSummary: true,
      mapOverview: true,
      assetListTable: true,
      defectListing: true,
      pacpCompliance: true,
    },
  },
  compliance: {
    name: 'Compliance Report',
    sections: {
      coverPage: true,
      projectInformation: true,
      assetListTable: true,
      defectListing: true,
      pacpConditions: true,
      pacpCompliance: true,
    },
  },
  visual: {
    name: 'Visual Report',
    sections: {
      coverPage: true,
      mapOverview: true,
      defectPlotCenterWithImages: true,
      inclinationGraph: true,
      images2PerPage: true,
    },
  },
  executive: {
    name: 'Executive Summary',
    sections: {
      coverPage: true,
      executiveSummary: true,
      mapOverview: true,
      projectSummary: true,
    },
  },
};

// Template Section Component
interface TemplateSectionProps {
  title: string;
  sections: Array<{
    key: string;
    label: string;
    description: string;
    recommended?: boolean;
    fileImpact?: string;
  }>;
  config: ReportConfig;
  onToggle: (key: string) => void;
}

function TemplateSection({ title, sections, config, onToggle }: TemplateSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">{title}</Label>
      </div>
      
      <div className="space-y-2">
        {sections.map((section) => (
          <div key={section.key} className="border border-neutral-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
            <div className="flex items-start space-x-3">
              <Checkbox
                id={section.key}
                checked={config.sections[section.key as keyof typeof config.sections] as boolean}
                onCheckedChange={() => onToggle(section.key)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor={section.key} className="font-medium cursor-pointer">
                    {section.label}
                  </Label>
                  {section.recommended && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                      Recommended
                    </span>
                  )}
                  {section.fileImpact && (
                    <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                      {section.fileImpact}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-600 mt-1">
                  {section.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Step 2 Component
function Step2Options({ 
  config, 
  setConfig, 
  selectedPreset,
  setSelectedPreset,
  getEstimatedPages, 
  getEstimatedFileSize,
  assetCount,
  inspectionCount
}: {
  config: ReportConfig;
  setConfig: React.Dispatch<React.SetStateAction<ReportConfig>>;
  selectedPreset: 'custom' | 'standard' | 'compliance' | 'visual' | 'executive';
  setSelectedPreset: (preset: 'custom' | 'standard' | 'compliance' | 'visual' | 'executive') => void;
  getEstimatedPages: () => number;
  getEstimatedFileSize: () => string;
  assetCount: number;
  inspectionCount: number;
}) {
  const toggleSection = (key: string) => {
    setConfig({
      ...config,
      sections: {
        ...config.sections,
        [key]: !(config.sections[key as keyof typeof config.sections] as boolean),
      },
    });
    setSelectedPreset('custom');
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

  const updateDisplay = (key: keyof typeof config.display, value: string | boolean) => {
    setConfig({
      ...config,
      display: {
        headerStyle: config.display?.headerStyle || 'alias',
        codeDisplay: config.display?.codeDisplay || 'description',
        showColors: config.display?.showColors || false,
        individualPDFs: config.display?.individualPDFs || false,
        [key]: value,
      },
    });
  };

  const applyPreset = (presetKey: 'standard' | 'compliance' | 'visual' | 'executive') => {
    const preset = PACKAGE_PRESETS[presetKey];
    setSelectedPreset(presetKey);
    
    // Reset all sections to false, then apply preset
    const newSections = { ...config.sections };
    (Object.keys(newSections) as Array<keyof typeof newSections>).forEach(key => {
      newSections[key] = false;
    });
    
    // Apply preset sections
    (Object.keys(preset.sections) as Array<keyof typeof preset.sections>).forEach(key => {
      if (key in newSections) {
        newSections[key] = preset.sections[key] as boolean;
      }
    });
    
    setConfig({
      ...config,
      sections: newSections,
    });
  };

  const handleCustomPreset = () => {
    setSelectedPreset('custom');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Configure Report Sections</h3>
        <p className="text-sm text-neutral-600">
          Select report templates and configure display options
        </p>
      </div>

      <div className="h-px bg-neutral-200" />

      {/* Package Presets */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Package Presets</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedPreset === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={handleCustomPreset}
          >
            Custom
          </Button>
          <Button
            variant={selectedPreset === 'standard' ? 'default' : 'outline'}
            size="sm"
            onClick={() => applyPreset('standard')}
          >
            Standard Report
          </Button>
          <Button
            variant={selectedPreset === 'compliance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => applyPreset('compliance')}
          >
            Compliance
          </Button>
          <Button
            variant={selectedPreset === 'visual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => applyPreset('visual')}
          >
            Visual
          </Button>
          <Button
            variant={selectedPreset === 'executive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => applyPreset('executive')}
          >
            Executive
          </Button>
        </div>
      </div>

      <div className="h-px bg-neutral-200" />

      {/* Essential Sections */}
      <TemplateSection
        title="Essential Sections"
        sections={[
          {
            key: 'coverPage',
            label: 'Cover Page',
            description: 'Project title, date, inspector information',
            recommended: true,
          },
          {
            key: 'executiveSummary',
            label: 'Executive Summary',
            description: 'Key findings, statistics, recommendations',
            recommended: true,
          },
          {
            key: 'mapOverview',
            label: 'Map Overview',
            description: 'Geographic overview with asset locations',
            recommended: true,
          },
          {
            key: 'assetListTable',
            label: 'Asset List Table',
            description: 'Tabular data with all asset information',
            recommended: true,
          },
        ]}
        config={config}
        onToggle={toggleSection}
      />

      <div className="h-px bg-neutral-200" />

      {/* Project Information */}
      <TemplateSection
        title="Project Information"
        sections={[
          {
            key: 'projectInformation',
            label: 'Project Information',
            description: 'Detailed project metadata and specifications',
          },
          {
            key: 'projectSummary',
            label: 'Project Summary',
            description: 'High-level project overview and scope',
          },
        ]}
        config={config}
        onToggle={toggleSection}
      />

      <div className="h-px bg-neutral-200" />

      {/* Inclination Analysis */}
      <TemplateSection
        title="Inclination Analysis"
        sections={[
          {
            key: 'inclinationGraph',
            label: 'Inclination Graph',
            description: 'Visual graph showing pipe inclination changes',
          },
          {
            key: 'inclinationDepth',
            label: 'Inclination Depth Chart',
            description: 'Depth-based inclination visualization',
          },
          {
            key: 'inclinationTabular',
            label: 'Inclination Tabular',
            description: 'Tabular inclination data with measurements',
          },
        ]}
        config={config}
        onToggle={toggleSection}
      />

      <div className="h-px bg-neutral-200" />

      {/* Defect Reports */}
      <TemplateSection
        title="Defect Reports"
        sections={[
          {
            key: 'defectListing',
            label: 'Defect Listing',
            description: 'Comprehensive table of all defects found',
          },
          {
            key: 'defectPlotCenter',
            label: 'Defect Plot Center',
            description: 'Center-aligned defect location plot',
          },
          {
            key: 'defectPlotCenterWithImages',
            label: 'Defect Plot Center with Images',
            description: 'Center plot with embedded defect photos',
            fileImpact: '+10MB',
          },
          {
            key: 'defectPlotLeft',
            label: 'Defect Plot Left',
            description: 'Left-aligned defect location visualization',
          },
          {
            key: 'defectPlotLeftScaled',
            label: 'Defect Plot Left Scaled',
            description: 'Scaled left-aligned plot for better detail',
          },
          {
            key: 'defectPlotLeftWithImages',
            label: 'Defect Plot Left with Images',
            description: 'Left plot with embedded defect photos',
            fileImpact: '+10MB',
          },
        ]}
        config={config}
        onToggle={toggleSection}
      />

      <div className="h-px bg-neutral-200" />

      {/* Inspection Photos */}
      <TemplateSection
        title="Inspection Photos"
        sections={[
          {
            key: 'images4PerPage',
            label: 'Images - 4 Per Page',
            description: 'Standard photo layout (smaller thumbnails)',
            fileImpact: '+8MB',
          },
          {
            key: 'images2PerPage',
            label: 'Images - 2 Per Page',
            description: 'Detailed photo layout (medium size)',
            fileImpact: '+12MB',
          },
          {
            key: 'images1PerPage',
            label: 'Images - 1 Per Page',
            description: 'High-quality photo layout (full page)',
            fileImpact: '+20MB',
          },
        ]}
        config={config}
        onToggle={toggleSection}
      />

      <div className="h-px bg-neutral-200" />

      {/* Compliance & Standards */}
      <TemplateSection
        title="Compliance & Standards"
        sections={[
          {
            key: 'pacpCompliance',
            label: 'PACP/NASCO Compliance',
            description: 'Include compliance scores and validation results',
            recommended: true,
          },
          {
            key: 'pacpConditions',
            label: 'PACP Conditions Report',
            description: 'Detailed PACP condition assessments',
          },
        ]}
        config={config}
        onToggle={toggleSection}
      />

      <div className="h-px bg-neutral-200" />

      {/* Display Configuration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-neutral-600" />
          <Label className="text-sm font-semibold">Display Configuration</Label>
        </div>
        
        {/* Header Style */}
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-neutral-700">Header Style</Label>
            <p className="text-xs text-neutral-500">Choose how column headers are displayed in the report</p>
            <RadioGroup
              value={config.display?.headerStyle || 'alias'}
              onValueChange={(value) => updateDisplay('headerStyle', value)}
              className="space-y-2"
            >
              <label
                htmlFor="header-alias"
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  config.display?.headerStyle === 'alias'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-blue-300 hover:bg-neutral-50'
                }`}
              >
                <RadioGroupItem value="alias" id="header-alias" />
                <div className="flex-1">
                  <Label htmlFor="header-alias" className="font-medium cursor-pointer text-sm">
                    Alias
                  </Label>
                  <p className="text-xs text-neutral-600 mt-0.5">Use friendly column names</p>
                </div>
              </label>
              <label
                htmlFor="header-desc"
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  config.display?.headerStyle === 'description'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-blue-300 hover:bg-neutral-50'
                }`}
              >
                <RadioGroupItem value="description" id="header-desc" />
                <div className="flex-1">
                  <Label htmlFor="header-desc" className="font-medium cursor-pointer text-sm">
                    Description
                  </Label>
                  <p className="text-xs text-neutral-600 mt-0.5">Use full descriptive names</p>
                </div>
              </label>
              <label
                htmlFor="header-code"
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  config.display?.headerStyle === 'code'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-blue-300 hover:bg-neutral-50'
                }`}
              >
                <RadioGroupItem value="code" id="header-code" />
                <div className="flex-1">
                  <Label htmlFor="header-code" className="font-medium cursor-pointer text-sm">
                    Code
                  </Label>
                  <p className="text-xs text-neutral-600 mt-0.5">Use technical code identifiers</p>
                </div>
              </label>
            </RadioGroup>
          </div>
        </div>
        
        {/* Code Display */}
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-neutral-700">Code Display</Label>
            <p className="text-xs text-neutral-500">Choose how codes are shown in the report</p>
            <RadioGroup
              value={config.display?.codeDisplay || 'description'}
              onValueChange={(value) => updateDisplay('codeDisplay', value)}
              className="space-y-2"
            >
              <label
                htmlFor="code-code"
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  config.display?.codeDisplay === 'code'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-blue-300 hover:bg-neutral-50'
                }`}
              >
                <RadioGroupItem value="code" id="code-code" />
                <div className="flex-1">
                  <Label htmlFor="code-code" className="font-medium cursor-pointer text-sm">
                    Code Only
                  </Label>
                  <p className="text-xs text-neutral-600 mt-0.5">Show only code values (e.g., &quot;A1&quot;)</p>
                </div>
              </label>
              <label
                htmlFor="code-desc"
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  config.display?.codeDisplay === 'description'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-blue-300 hover:bg-neutral-50'
                }`}
              >
                <RadioGroupItem value="description" id="code-desc" />
                <div className="flex-1">
                  <Label htmlFor="code-desc" className="font-medium cursor-pointer text-sm">
                    Description Only
                  </Label>
                  <p className="text-xs text-neutral-600 mt-0.5">Show only descriptive text</p>
                </div>
              </label>
              <label
                htmlFor="code-both"
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  config.display?.codeDisplay === 'both'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-blue-300 hover:bg-neutral-50'
                }`}
              >
                <RadioGroupItem value="both" id="code-both" />
                <div className="flex-1">
                  <Label htmlFor="code-both" className="font-medium cursor-pointer text-sm">
                    Code & Description
                  </Label>
                  <p className="text-xs text-neutral-600 mt-0.5">Show both code and description</p>
                </div>
              </label>
            </RadioGroup>
          </div>
        </div>
        
        {/* Additional Options */}
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-neutral-700">Additional Options</Label>
            <p className="text-xs text-neutral-500">Enable extra features for enhanced reports</p>
            <div className="space-y-2">
              <label
                htmlFor="show-colors"
                className="flex items-start space-x-3 p-3 rounded-lg border border-neutral-200 hover:border-blue-300 hover:bg-neutral-50 cursor-pointer transition-all"
              >
                <Checkbox
                  id="show-colors"
                  checked={config.display?.showColors || false}
                  onCheckedChange={(checked) => updateDisplay('showColors', checked as boolean)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor="show-colors" className="font-medium cursor-pointer text-sm">
                    Show color-coded severity indicators
                  </Label>
                  <p className="text-xs text-neutral-600 mt-0.5">Add visual color indicators for defect severity levels</p>
                </div>
              </label>
              <label
                htmlFor="individual-pdfs"
                className="flex items-start space-x-3 p-3 rounded-lg border border-neutral-200 hover:border-blue-300 hover:bg-neutral-50 cursor-pointer transition-all"
              >
                <Checkbox
                  id="individual-pdfs"
                  checked={config.display?.individualPDFs || false}
                  onCheckedChange={(checked) => updateDisplay('individualPDFs', checked as boolean)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor="individual-pdfs" className="font-medium cursor-pointer text-sm">
                    Generate individual PDFs per inspection
                  </Label>
                  <p className="text-xs text-neutral-600 mt-0.5">Create separate PDF file for each inspection</p>
                </div>
              </label>
            </div>
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-3">Live Preview</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-neutral-600 mb-1">Estimated Pages</p>
            <p className="text-2xl font-bold text-blue-700">
              ~{getEstimatedPages()}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 mb-1">File Size</p>
            <p className="text-2xl font-bold text-blue-700">
              {getEstimatedFileSize()}
            </p>
          </div>
        </div>
        {(config.sections.images4PerPage || config.sections.images2PerPage || config.sections.images1PerPage || 
          config.sections.defectPlotCenterWithImages || config.sections.defectPlotLeftWithImages) && (
          <p className="text-xs text-orange-600 mt-2">⚠️ Image sections will significantly increase file size</p>
        )}
      </div>
    </div>
  );
}

// Step 3 Component
function Step3Preview({ config }: { config: ReportConfig }) {
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
function Step4Generating({ 
  progress, 
  currentPage, 
  totalPages 
}: { 
  progress: number; 
  currentPage: number; 
  totalPages: number; 
}) {
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
function Step4Success({ 
  report, 
  onDownload 
}: { 
  report: { filename: string; pages: number; size: string; duration: number }; 
  onDownload: () => void; 
}) {
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

