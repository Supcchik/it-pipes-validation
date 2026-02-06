'use client';

import { useState, useRef } from 'react';
import { FileText, Loader2, CheckCircle2, Image, BarChart3, ShieldCheck, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

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
    scope: 'selected',
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
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  const handleCancelGenerate = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setGenerating(false);
    setCurrentStep(3);
    setProgress(0);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setProgress(0);
    setCurrentStep(4);
    progressIntervalRef.current = null;

    try {
      // TODO: Replace with actual API call
      const startTime = Date.now();
      const interval = setInterval(() => {
        progressIntervalRef.current = interval;
        setProgress(prev => {
          const newProgress = Math.min(prev + 3, 100);

          if (newProgress >= 100) {
            clearInterval(interval);
            progressIntervalRef.current = null;
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
        return <Step3Preview 
          config={config} 
          setConfig={setConfig}
          getEstimatedPages={getEstimatedPages}
          getEstimatedFileSize={getEstimatedFileSize}
          assetCount={getAssetCount()}
          inspectionCount={getInspectionCount()}
        />;
      case 4:
        if (generatedReport) {
          return <Step4Success report={generatedReport} onDownload={handleDownload} />;
        }
        return <Step4Generating progress={progress} currentPage={Math.floor(getEstimatedPages() * progress / 100)} totalPages={getEstimatedPages()} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          'sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-6 gap-4 rounded-2xl border-[#E4E4E7]',
          'shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(16,24,40,0.10)]'
        )}
      >
        <DialogHeader className="gap-0">
          <DialogTitle className="text-[#09090B] text-lg font-semibold leading-7">
            Generate Report
          </DialogTitle>
        </DialogHeader>

        {/* Step Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderStepContent()}
        </div>

        {/* Navigation: steps 1–3 */}
        {!generatedReport && !generating && (
          <div className="border-t border-[#E4E4E7] pt-4 flex justify-end gap-2">
            {currentStep !== 3 && (
              <Button
                variant="outline"
                onClick={currentStep === 1 ? handleClose : handleBack}
                className="h-10 px-4 rounded-lg border-[#E4E4E7] text-[#312C29] font-medium"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </Button>
            )}
            {currentStep < 3 && (
              <Button
                onClick={handleNext}
                className="h-10 px-4 rounded-lg bg-[#E86F25] text-[#FAFAFA] font-medium hover:bg-[#d66320]"
              >
                Next
              </Button>
            )}
            {currentStep === 3 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="h-10 px-4 rounded-lg border-[#E4E4E7] text-[#312C29] text-sm font-medium leading-5"
                >
                  Back
                </Button>
                <Button
                  onClick={handleGenerate}
                  className="h-10 px-4 rounded-lg bg-[#E86F25] text-[#FAFAFA] text-sm font-medium leading-5 hover:bg-[#d66320]"
                >
                  Generate Report
                </Button>
              </>
            )}
          </div>
        )}
        {/* Footer during generation: Cancel only */}
        {generating && (
          <div className="border-t border-[#E4E4E7] pt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={handleCancelGenerate}
              className="h-10 px-4 rounded-lg border-[#E4E4E7] text-[#312C29] text-sm font-medium leading-5"
            >
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Step 1: Report scope + Inspections filter (Figma layout)
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
  const scopeOptions: Array<{ value: ReportScope; title: string; description: string }> = [
    { value: 'selected', title: `Selected assets (${selectedAssets})`, description: 'Include only assets you selected in table' },
    { value: 'filtered', title: `All assets in view (${filteredAssets})`, description: 'Include all assets in current view with applied filters' },
    { value: 'all', title: `All assets in project (${totalAssets})`, description: 'Include all assets in the entire project' },
  ];
  const filterOptions: Array<{ value: InspectionFilter; title: string; description: string }> = [
    { value: 'newest', title: 'Newest inspections only', description: 'One inspection per asset (most recent)' },
    { value: 'all', title: 'All inspections', description: 'Include all inspections for each asset' },
  ];

  const cardSelected = 'bg-[#FFEDD5] border-[#E86F25]';
  const cardDefault = 'border-[#E4E4E7]';
  const textSelected = 'text-[#E86F25]';
  const textDefault = 'text-[#18181B]';
  const iconSelected = 'bg-[#E86F25]';
  const iconDefault = 'bg-[#71717A]';

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-3">
        <div className="text-[#3F3F46] text-sm font-semibold leading-5">Report scope</div>
        <div className="flex flex-col gap-3">
          {scopeOptions.map((opt) => {
            const selected = config.scope === opt.value;
            return (
              <div
                key={opt.value}
                role="button"
                tabIndex={0}
                onClick={() => setConfig({ ...config, scope: opt.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setConfig({ ...config, scope: opt.value });
                  }
                }}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg border min-h-[84px] cursor-pointer transition-colors',
                  selected ? cardSelected : cardDefault
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 shrink-0 rounded-full',
                    selected ? iconSelected : iconDefault
                  )}
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className={cn('text-base font-semibold leading-6', selected ? textSelected : textDefault)}>
                    {opt.title}
                  </div>
                  <div className={cn('text-sm font-medium leading-5', selected ? textSelected : textDefault)}>
                    {opt.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#E4E4E7]" />

      <div className="space-y-3">
        <div className="text-[#3F3F46] text-sm font-semibold leading-5">Inspections filter</div>
        <div className="flex flex-col gap-3">
          {filterOptions.map((opt) => {
            const selected = config.inspectionFilter === opt.value;
            return (
              <div
                key={opt.value}
                role="button"
                tabIndex={0}
                onClick={() => setConfig({ ...config, inspectionFilter: opt.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setConfig({ ...config, inspectionFilter: opt.value });
                  }
                }}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg border min-h-[84px] cursor-pointer transition-colors',
                  selected ? cardSelected : cardDefault
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 shrink-0 rounded-full',
                    selected ? iconSelected : iconDefault
                  )}
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className={cn('text-base font-semibold leading-6', selected ? textSelected : textDefault)}>
                    {opt.title}
                  </div>
                  <div className={cn('text-sm font-medium leading-5', selected ? textSelected : textDefault)}>
                    {opt.description}
                  </div>
                </div>
              </div>
            );
          })}
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

// Template Section: картки з чекбоксом, опційний чіп (Recommended / +X MB)
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
  const cardSelected = 'bg-[#FFEDD5] border-[#E86F25]';
  const cardDefault = 'border-[#E4E4E7]';
  const textSelected = 'text-[#E86F25]';
  const textDefault = 'text-[#18181B]';

  return (
    <div className="space-y-3">
      <div className="text-[#3F3F46] text-sm font-semibold leading-5">{title}</div>
      <div className="flex flex-col gap-3">
        {sections.map((section) => {
          const checked = config.sections[section.key as keyof typeof config.sections] as boolean;
          return (
            <div
              key={section.key}
              role="button"
              tabIndex={0}
              onClick={() => onToggle(section.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggle(section.key);
                }
              }}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg border min-h-[84px] cursor-pointer transition-colors',
                checked ? cardSelected : cardDefault
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => onToggle(section.key)}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  'rounded border-[#E4E4E7] shrink-0',
                  checked && 'border-[#E86F25] data-[state=checked]:bg-[#E86F25] data-[state=checked]:border-[#E86F25]'
                )}
              />
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('text-base font-semibold leading-6', checked ? textSelected : textDefault)}>
                    {section.label}
                  </span>
                  {section.recommended && (
                    <span className="px-3 py-0.5 rounded-lg bg-[#E0E7FF] text-[#1E3A8A] text-xs font-semibold leading-4">
                      Recommended
                    </span>
                  )}
                  {section.fileImpact && (
                    <span className="px-3 py-0.5 rounded-lg bg-[#FFF7ED] text-[#B45309] text-xs font-semibold leading-4">
                      {section.fileImpact}
                    </span>
                  )}
                </div>
                <span className={cn('text-sm font-medium leading-5', checked ? textSelected : textDefault)}>
                  {section.description}
                </span>
              </div>
            </div>
          );
        })}
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

  const pillSelected = 'h-10 px-4 py-2 rounded-lg bg-[#FFEDD5] border border-[#E86F25] text-[#E86F25] font-semibold text-sm';
  const pillDefault = 'h-10 px-4 py-2 rounded-lg border border-[#E4E4E7] text-[#18181B] font-medium text-sm';

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-auto">
      <h3 className="text-[#09090B] text-lg font-semibold leading-7 shrink-0">Configure Report Sections</h3>

      <div className="space-y-3 shrink-0">
        <div className="text-[#3F3F46] text-sm font-semibold leading-5">Package Preset</div>
        <div className="flex flex-wrap items-center gap-1 py-1">
          <button
            type="button"
            onClick={() => applyPreset('standard')}
            className={selectedPreset === 'standard' ? pillSelected : pillDefault}
          >
            Standard Report
          </button>
          <button
            type="button"
            onClick={() => applyPreset('compliance')}
            className={selectedPreset === 'compliance' ? pillSelected : pillDefault}
          >
            Compliance
          </button>
          <button
            type="button"
            onClick={handleCustomPreset}
            className={selectedPreset === 'custom' ? pillSelected : pillDefault}
          >
            Custom
          </button>
        </div>
      </div>

      <div className="h-px bg-[#E4E4E7] shrink-0" />

      {/* Essential sections */}
      <TemplateSection
        title="Essential sections"
        sections={[
          { key: 'coverPage', label: 'Cover page', description: 'Project title, date, inspector information', recommended: true },
          { key: 'executiveSummary', label: 'Executive Summary', description: 'Key findings, statistics, recommendations', recommended: true },
          { key: 'mapOverview', label: 'Map Overview', description: 'Geographic overview with asset locations', recommended: true },
          { key: 'assetListTable', label: 'Asset List Table', description: 'Table data with all asset information', recommended: true },
        ]}
        config={config}
        onToggle={toggleSection}
      />

      <div className="h-px bg-[#E4E4E7] shrink-0" />

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

      <div className="h-px bg-[#E4E4E7] shrink-0" />

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

      <div className="h-px bg-[#E4E4E7] shrink-0" />

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

      <div className="h-px bg-[#E4E4E7] shrink-0" />

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

      <div className="h-px bg-[#E4E4E7] shrink-0" />

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

      <div className="h-px bg-[#E4E4E7] shrink-0" />

      {/* Display Configuration: bordered blocks, card-style options */}
      <div className="space-y-4 shrink-0">
        <div className="text-[#3F3F46] text-sm font-semibold leading-5">Display Configuration</div>

        <div className="rounded-lg border border-[#E4E4E7] p-1 space-y-0">
          <div className="px-2 py-2 space-y-0.5">
            <div className="text-[#3F3F46] text-sm font-semibold leading-5">Header Style</div>
            <div className="text-[#3F3F46] text-sm font-normal leading-5">Choose how column headers are displayed in the report</div>
          </div>
          <div className="h-px bg-[#E4E4E7]" />
          {[
            { value: 'alias', label: 'Alias', desc: 'Use friendly column names' },
            { value: 'description', label: 'Description', desc: 'Use full descriptive names' },
            { value: 'code', label: 'Code', desc: 'Use technical code identifiers' },
          ].map((opt) => {
            const selected = (config.display?.headerStyle || 'alias') === opt.value;
            return (
              <div
                key={opt.value}
                role="button"
                tabIndex={0}
                onClick={() => updateDisplay('headerStyle', opt.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); updateDisplay('headerStyle', opt.value); } }}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 min-h-[84px] rounded-lg border cursor-pointer transition-colors',
                  selected ? 'bg-[#FFEDD5] border-[#E86F25]' : 'border-[#E4E4E7]'
                )}
              >
                <div className="flex-1 flex flex-col gap-1">
                  <span className={cn('text-base font-semibold leading-6', selected ? 'text-[#E86F25]' : 'text-[#18181B]')}>{opt.label}</span>
                  <span className={cn('text-sm font-medium leading-5', selected ? 'text-[#E86F25]' : 'text-[#18181B]')}>{opt.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-[#E4E4E7] p-1 space-y-0">
          <div className="px-2 py-2 space-y-0.5">
            <div className="text-[#3F3F46] text-sm font-semibold leading-5">Code Display</div>
            <div className="text-[#3F3F46] text-sm font-normal leading-5">Choose how codes are shown in the report</div>
          </div>
          <div className="h-px bg-[#E4E4E7]" />
          {[
            { value: 'code', label: 'Code Only', desc: 'Show only code values (e.g., "A1")' },
            { value: 'description', label: 'Description Only', desc: 'Show only descriptive text' },
            { value: 'both', label: 'Code & Description', desc: 'Show both code and description' },
          ].map((opt) => {
            const selected = (config.display?.codeDisplay || 'description') === opt.value;
            return (
              <div
                key={opt.value}
                role="button"
                tabIndex={0}
                onClick={() => updateDisplay('codeDisplay', opt.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); updateDisplay('codeDisplay', opt.value); } }}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 min-h-[84px] rounded-lg border cursor-pointer transition-colors',
                  selected ? 'bg-[#FFEDD5] border-[#E86F25]' : 'border-[#E4E4E7]'
                )}
              >
                <div className="flex-1 flex flex-col gap-1">
                  <span className={cn('text-base font-semibold leading-6', selected ? 'text-[#E86F25]' : 'text-[#18181B]')}>{opt.label}</span>
                  <span className={cn('text-sm font-medium leading-5', selected ? 'text-[#E86F25]' : 'text-[#18181B]')}>{opt.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-[#E4E4E7] p-1 space-y-0">
          <div className="px-2 py-2 space-y-0.5">
            <div className="text-[#3F3F46] text-sm font-semibold leading-5">Additional Options</div>
            <div className="text-[#3F3F46] text-sm font-normal leading-5">Enable extra features for enhanced reports</div>
          </div>
          <div className="h-px bg-[#E4E4E7]" />
          <div
            onClick={() => updateDisplay('showColors', !(config.display?.showColors ?? false))}
            className="flex items-center gap-3 px-4 py-2 min-h-[84px] rounded-lg border border-[#E4E4E7] cursor-pointer"
          >
            <Checkbox
              checked={config.display?.showColors ?? false}
              onCheckedChange={(c) => updateDisplay('showColors', c as boolean)}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0"
            />
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-base font-semibold leading-6 text-[#18181B]">Show color-coded severity indicators</span>
              <span className="text-sm font-medium leading-5 text-[#18181B]">Add visual color indicators for defect severity levels</span>
            </div>
          </div>
          <div
            onClick={() => updateDisplay('individualPDFs', !(config.display?.individualPDFs ?? false))}
            className="flex items-center gap-3 px-4 py-2 min-h-[84px] rounded-lg border border-[#E4E4E7] cursor-pointer"
          >
            <Checkbox
              checked={config.display?.individualPDFs ?? false}
              onCheckedChange={(c) => updateDisplay('individualPDFs', c as boolean)}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0"
            />
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-base font-semibold leading-6 text-[#18181B]">Generate individual PDFs per inspection</span>
              <span className="text-sm font-medium leading-5 text-[#18181B]">Create separate PDF file for each inspection</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-[#E4E4E7] shrink-0" />

      <div className="space-y-3 shrink-0">
        <div className="text-[#3F3F46] text-sm font-semibold leading-5">Report Details</div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="project-name" className="text-[#18181B] text-sm font-medium leading-5">Project Name</label>
            <Input
              id="project-name"
              value={config.details.projectName}
              onChange={(e) => updateDetail('projectName', e.target.value)}
              className="min-h-9 px-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="prepared-by" className="text-[#18181B] text-sm font-medium leading-5">Prepared By</label>
            <Input
              id="prepared-by"
              value={config.details.preparedBy}
              onChange={(e) => updateDetail('preparedBy', e.target.value)}
              className="min-h-9 px-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="report-date" className="text-[#18181B] text-sm font-medium leading-5">Report Date</label>
            <Input
              id="report-date"
              type="date"
              value={config.details.reportDate}
              onChange={(e) => updateDetail('reportDate', e.target.value)}
              className="min-h-9 px-3 py-2.5 rounded-md border border-[#E4E4E7] bg-white text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 3 Component - Enhanced Preview
function Step3Preview({ 
  config, 
  getEstimatedPages,
  assetCount,
}: { 
  config: ReportConfig;
  setConfig?: React.Dispatch<React.SetStateAction<ReportConfig>>;
  getEstimatedPages: () => number;
  getEstimatedFileSize?: () => string;
  assetCount: number;
  inspectionCount?: number;
}) {
  const [selectedPage] = useState(0);
  const totalPages = getEstimatedPages();
  const titillium = { fontFamily: 'var(--font-titillium), sans-serif' };

  return (
    <div className="space-y-4">
      <div className="flex flex-col h-[500px]">
        {/* Preview Thumbnail */}
        <div className="flex-1 border border-[#E4E4E7] rounded-lg bg-[#F4F4F5] flex flex-col overflow-hidden min-h-0">
          <div className="p-3 border-b border-[#E4E4E7] bg-white flex items-center justify-between">
            <span className="text-[#3F3F46] text-xs font-semibold leading-4">Preview</span>
            <span className="text-[#3F3F46] text-xs font-semibold leading-4">
              {selectedPage + 1} of {totalPages} pages
            </span>
          </div>
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
            <div className="bg-white shadow-xl p-8 w-full max-w-md aspect-[8.5/11] border border-[#E4E4E7] rounded-lg">
              <div className="text-center space-y-4">
                <h1 className="text-[#09090B] text-[32px] font-bold leading-[48px]" style={titillium}>
                  INSPECTION REPORT
                </h1>
                <p className="text-[#336099] text-[28px] font-semibold leading-9" style={titillium}>
                  {config.details.projectName || 'Project Name'}
                </p>
                <div className="space-y-1 mt-6">
                  <p className="text-[#3F3F46] text-lg font-medium leading-7">
                    Prepared by: {config.details.preparedBy || '—'}
                  </p>
                  <p className="text-[#3F3F46] text-lg font-medium leading-7">
                    Date: {config.details.reportDate ? new Date(config.details.reportDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '.') : '—'}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-[#E4E4E7] space-y-1">
                  <p className="text-[#09090B] text-lg font-medium leading-7">
                    {assetCount} assets inspected
                  </p>
                  <p className="text-[#09090B] text-lg font-medium leading-7">
                    {totalPages} pages
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4 Generating Component (Figma: Generating Report)
function Step4Generating({ 
  progress, 
  currentPage, 
  totalPages 
}: { 
  progress: number; 
  currentPage: number; 
  totalPages: number; 
}) {
  const estimatedSeconds = Math.ceil((100 - progress) / 5);

  return (
    <div className="space-y-6">
      <h3 className="text-[#09090B] text-lg font-semibold leading-7">
        Generating Report
      </h3>

      <Progress value={progress} className="h-3 bg-[#F4F4F5]" />

      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[#18181B] text-sm font-medium leading-5">Status:</span>
          <span className="text-[#18181B] text-base font-semibold leading-6">Rendering pages</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[#18181B] text-sm font-medium leading-5">Progress:</span>
          <span className="text-[#18181B] text-base font-semibold leading-6">
            {currentPage} of {totalPages} pages
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[#18181B] text-sm font-medium leading-5">Estimated time:</span>
          <span className="text-[#18181B] text-base font-semibold leading-6">
            ~{estimatedSeconds} seconds
          </span>
        </div>
      </div>
    </div>
  );
}

// Step 4 Success Component (Figma: success state)
function Step4Success({
  report,
  onDownload,
}: {
  report: { filename: string; pages: number; size: string; duration: number };
  onDownload: () => void;
}) {
  const titillium = { fontFamily: 'var(--font-titillium), sans-serif' };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[#09090B] text-lg font-semibold leading-7">
        Generating Report
      </h3>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-center gap-6">
          <div className="p-4 rounded-full bg-[#DCFCE7] flex items-center justify-center w-[80px] h-[80px]">
            <CheckCircle2 className="w-12 h-12 text-[#15803D]" />
          </div>
          <div className="flex flex-col items-center gap-2 w-full">
            <h4
              className="text-center text-black text-xl font-semibold leading-7 w-full"
              style={titillium}
            >
              Report Generated Successfully
            </h4>
            <p className="text-center text-black text-sm font-normal leading-5">
              Your inspection report is ready
            </p>
          </div>
        </div>

        <div className="px-4 py-3 rounded-lg border border-[#E4E4E7] flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 shrink-0 text-[#E86F25]" />
            <div className="flex flex-col min-w-0">
              <span className="text-[#18181B] text-base font-semibold leading-6">
                {report.filename}
              </span>
              <span className="text-[#18181B] text-sm font-medium leading-5">
                {report.pages} pages, {report.size}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-0">
        <Button
          variant="outline"
          onClick={onDownload}
          className="h-10 px-4 rounded-lg border-[#E4E4E7] text-[#312C29] text-sm font-medium leading-5"
        >
          Open
        </Button>
        <Button
          onClick={onDownload}
          className="h-10 px-4 rounded-lg bg-[#E86F25] text-[#FAFAFA] text-sm font-medium leading-5 hover:bg-[#d66320]"
        >
          Download Report
        </Button>
      </div>
    </div>
  );
}

