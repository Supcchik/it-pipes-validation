'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/asset-list/Header';
import ViewTabs from '@/components/asset-list/ViewTabs';
import Toolbar from '@/components/asset-list/Toolbar';
import ResizableSplit from '@/components/asset-list/ResizableSplit';
import MapPanel from '@/components/asset-list/MapPanel';
import DataTable from '@/components/asset-list/DataTable';
import Pagination from '@/components/asset-list/Pagination';
import ViewSettingsDialog from '@/components/asset-list/ViewSettingsDialog';
import SearchDialog, { type SearchQuery } from '@/components/asset-list/SearchDialog';
import FindReplaceDialog, { type ReplaceOperation } from '@/components/asset-list/FindReplaceDialog';
import ReportGenerationDialog from '@/components/asset-list/ReportGenerationDialog';
import ManageViewsDialog from '@/components/asset-list/ManageViewsDialog';
import ActiveFiltersBar from '@/components/asset-list/ActiveFiltersBar';
import CreateViewDialog from '@/components/asset-list/CreateViewDialog';
import FloatingSelectionBar from '@/components/asset-list/FloatingSelectionBar';
import SnapshotsPanel from '@/components/asset-list/SnapshotsPanel';
import ValidationDialog, { type ValidationOptions } from '@/components/asset-list/ValidationDialog';
import ValidationProgressDialog from '@/components/asset-list/ValidationProgressDialog';
import ValidationResultsDialog, { type ValidationResults } from '@/components/asset-list/ValidationResultsDialog';
import ValidationErrorsView, { type ValidationError } from '@/components/asset-list/ValidationErrorsView';
import BulkFixDialog, { type BulkFix } from '@/components/asset-list/BulkFixDialog';
import ExportProjectDialog from '@/components/asset-list/ExportProjectDialog';
import MoveToProjectDialog from '@/components/asset-list/MoveToProjectDialog';
import CopyToProjectDialog from '@/components/asset-list/CopyToProjectDialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { mockViews, mockAssets, mockColumnDefs } from '@/lib/mock-data/asset-list';
import type { View, Asset, ColumnDef, FilterConfig } from '@/lib/types/asset-list';
import type { ReportConfig } from '@/lib/utils/pdf-generator';

export default function AssetListPage() {
  const router = useRouter();

  // State management
  const [views, setViews] = useState<View[]>(() => {
    try {
      return mockViews;
    } catch (error) {
      console.error('Error loading mock views:', error);
      return [];
    }
  });
  const [activeViewId, setActiveViewId] = useState<string>(() => {
    return mockViews.length > 0 ? mockViews[0].id : 'default';
  });
  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      return mockAssets;
    } catch (error) {
      console.error('Error loading mock assets:', error);
      return [];
    }
  });
  const [simpleSearchResults, setSimpleSearchResults] = useState<Asset[] | null>(null); // НОВИЙ: null = no search, [] = no results, [assets] = results
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedAssetForSnapshots, setSelectedAssetForSnapshots] = useState<Asset | null>(null);
  const [temporaryFilters, setTemporaryFilters] = useState<FilterConfig[]>([]); // Temporary filters (not saved in view)
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<SearchQuery | null>(null);
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [poppedOutSections, setPoppedOutSections] = useState<{
    map: boolean;
    table: boolean;
  }>({ map: false, table: false });

  // Dialog states
  const [viewSettingsOpen, setViewSettingsOpen] = useState(false);
  const [viewSettingsDefaultTab, setViewSettingsDefaultTab] = useState<'columns' | 'filters'>('columns');
  const [searchOpen, setSearchOpen] = useState(false);
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [manageViewsOpen, setManageViewsOpen] = useState(false);
  const [createViewOpen, setCreateViewOpen] = useState(false);
  
  // Validation dialog states
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationProgressOpen, setValidationProgressOpen] = useState(false);
  const [validationJobId, setValidationJobId] = useState<string | null>(null);
  const [validationResultsOpen, setValidationResultsOpen] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const [validationErrorsOpen, setValidationErrorsOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [bulkFixDialogOpen, setBulkFixDialogOpen] = useState(false);
  const [selectedErrorsForBulkFix, setSelectedErrorsForBulkFix] = useState<ValidationError[]>([]);
  
  // Export & Transfer dialog states
  const [exportProjectDialogOpen, setExportProjectDialogOpen] = useState(false);
  const [moveToProjectDialogOpen, setMoveToProjectDialogOpen] = useState(false);
  const [copyToProjectDialogOpen, setCopyToProjectDialogOpen] = useState(false);

  // Get active view with safe fallback
  const activeView = useMemo(() => {
    if (!views || views.length === 0) {
      // Return default view if no views available
      return {
        id: 'default',
        name: 'Default',
        isFavorite: false,
        isDefault: true,
        displayedColumns: ['pipeSegment', 'street', 'material'],
        columnOrder: ['pipeSegment', 'street', 'material'],
        filters: [],
        mapRatio: 40,
        itemsPerPage: 100,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'system'
      } as View;
    }
    
    const found = views.find(v => v.id === activeViewId);
    if (found) {
      return found;
    }
    
    // Fallback to first view if activeViewId not found
    return views[0];
  }, [views, activeViewId]);

  // Filter assets based on simple search, active view filters and advanced search query
  const filteredAssets = useMemo(() => {
    // Start with simple search results (or all assets if no simple search active)
    // simpleSearchResults === null means no search active, use all assets
    // simpleSearchResults === [] means search active but no results found (return empty)
    // simpleSearchResults === [assets] means search active with results
    let filtered: Asset[];
    if (simpleSearchResults === null) {
      // No search active, use all assets
      filtered = [...assets];
    } else {
      // Search active - use results (even if empty array)
      filtered = [...simpleSearchResults];
    }
    
    if (!filtered || filtered.length === 0) {
      return [];
    }
    if (!activeView) {
      return filtered;
    }

    // Helper function to apply a single filter
    const applyFilter = (asset: Asset, filter: FilterConfig): boolean => {
      // Get value based on table type
      let value: unknown;
      
      if (filter.table === 'asset') {
        value = (asset as unknown as Record<string, unknown>)[filter.field];
      } else if (filter.table === 'inspection' && asset.latestInspection) {
        value = (asset.latestInspection as unknown as Record<string, unknown>)[filter.field];
      } else if (filter.table === 'observation') {
        if (filter.field === 'observationCount') {
          value = asset.observationCount;
        } else if (filter.field === 'hasDefects') {
          value = asset.hasDefects;
        } else if (filter.field === 'maxGrade') {
          value = asset.maxGrade;
        } else {
          value = undefined;
        }
      } else {
        // If inspection/observation field but no data, filter out
        return false;
      }

      // Handle null/undefined values
      if (value === null || value === undefined) {
        return false;
      }

      // Apply operator
      switch (filter.operator) {
        case 'equals':
          // For boolean, compare directly
          if (typeof value === 'boolean' || typeof filter.value === 'boolean') {
            return value === filter.value;
          }
          // For numbers, compare as numbers
          if (typeof value === 'number' || typeof filter.value === 'number') {
            return Number(value) === Number(filter.value);
          }
          // For strings, case-insensitive comparison
          return String(value).toLowerCase() === String(filter.value).toLowerCase();
        
        case 'contains':
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
        
        case 'startsWith':
          return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
        
        case 'greaterThan':
          return Number(value) > Number(filter.value);
        
        case 'lessThan':
          return Number(value) < Number(filter.value);
        
        default:
          return true;
      }
    };

    // Apply view filters (from saved view)
    if (activeView.filters && activeView.filters.length > 0) {
      activeView.filters.forEach(filter => {
        filtered = filtered.filter(asset => applyFilter(asset, filter));
      });
    }

    // Apply temporary filters (on top of view filters)
    if (temporaryFilters.length > 0) {
      temporaryFilters.forEach(filter => {
        filtered = filtered.filter(asset => applyFilter(asset, filter));
      });
    }

    // Apply advanced search query
    if (searchQuery && searchQuery.value.trim()) {
      filtered = filtered.filter(asset => {
        // Get value based on searchQuery.table
        let value: unknown;
        
        if (searchQuery.table === 'asset') {
          value = (asset as unknown as Record<string, unknown>)[searchQuery.field];
        } else if (searchQuery.table === 'inspection' && asset.latestInspection) {
          value = (asset.latestInspection as unknown as Record<string, unknown>)[searchQuery.field];
        } else if (searchQuery.table === 'observation') {
          // Handle observation fields
          if (searchQuery.field === 'observationCount') {
            value = asset.observationCount;
          } else if (searchQuery.field === 'hasDefects') {
            value = asset.hasDefects;
          } else if (searchQuery.field === 'maxGrade') {
            value = asset.maxGrade;
          } else {
            value = undefined;
          }
        } else {
          // If inspection/observation field but no data, filter out
          return false;
        }

        if (value === null || value === undefined) return false;

        // Apply operator
        switch (searchQuery.operator) {
          case 'is':
            if (typeof value === 'boolean' || typeof searchQuery.value === 'boolean') {
              return value === (searchQuery.value === 'true');
            }
            if (typeof value === 'number' || typeof searchQuery.value === 'number') {
              return Number(value) === Number(searchQuery.value);
            }
            return String(value).toLowerCase() === String(searchQuery.value).toLowerCase();
          
          case 'isNot':
            if (typeof value === 'boolean' || typeof searchQuery.value === 'boolean') {
              return value !== (searchQuery.value === 'true');
            }
            if (typeof value === 'number' || typeof searchQuery.value === 'number') {
              return Number(value) !== Number(searchQuery.value);
            }
            return String(value).toLowerCase() !== String(searchQuery.value).toLowerCase();
          
          case 'contains':
            return String(value).toLowerCase().includes(String(searchQuery.value).toLowerCase());
          
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(searchQuery.value).toLowerCase());
          
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(searchQuery.value).toLowerCase());
          
          case 'greaterThan':
            return Number(value) > Number(searchQuery.value);
          
          case 'lessThan':
            return Number(value) < Number(searchQuery.value);
          
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [simpleSearchResults, activeView, searchQuery, assets]);

  // Get columns for active view in correct order
  const displayedColumns = useMemo(() => {
    if (!activeView || !activeView.displayedColumns || !mockColumnDefs) {
      return [];
    }
    try {
      // Use columnOrder if available, otherwise use displayedColumns order
      const order = activeView.columnOrder && activeView.columnOrder.length > 0
        ? activeView.columnOrder
        : activeView.displayedColumns;
      
      // Map to ColumnDef objects in the correct order
      return order
        .map(colId => mockColumnDefs.find(col => col.id === colId))
        .filter((col): col is ColumnDef => col !== undefined);
    } catch (error) {
      console.error('Error filtering columns:', error);
      return [];
    }
  }, [activeView]);

  // Calculate pagination
  const totalItems = filteredAssets.length;
  const itemsPerPage = activeView?.itemsPerPage || 100;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

  // Handlers
  const handleRowClick = (asset: Asset) => {
    // Single-select: show snapshots panel and navigate map
    // Multi-select: navigate to inspection page
    if (selectedRows.length === 1 && selectedRows[0] === asset.id) {
      // Already selected, show snapshots panel
      const selectedAsset = filteredAssets.find(a => a.id === asset.id);
      if (selectedAsset) {
        setSelectedAssetForSnapshots(selectedAsset);
      }
    } else {
      // Navigate to inspection page
      router.push(`/inspection/${asset.id}`);
    }
  };

  // Handle selection changes
  useEffect(() => {
    if (selectedRows.length === 1) {
      // Single-select: show snapshots panel
      const selectedAsset = filteredAssets.find(a => a.id === selectedRows[0]);
      if (selectedAsset) {
        setSelectedAssetForSnapshots(selectedAsset);
      }
    } else {
      // Multi-select or no selection: hide snapshots panel
      setSelectedAssetForSnapshots(null);
    }
  }, [selectedRows, filteredAssets]);

  const handleViewChange = async (viewId: string) => {
    setIsLoadingView(true);
    setActiveViewId(viewId);
    setCurrentPage(1);
    
    // Clear temporary filters when switching views (view filters are applied from the new view)
    setTemporaryFilters([]);
    
    // Simulate loading (in real app, this would fetch data)
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsLoadingView(false);
  };

  const handleSaveView = (updatedView: View) => {
    setViews(views.map(v => v.id === updatedView.id ? updatedView : v));
    if (updatedView.id === activeViewId) {
      setActiveViewId(updatedView.id);
    }
  };

  // Handle column reorder in table
  const handleColumnReorder = (newOrder: string[]) => {
    if (!activeView) return;
    
    const updatedView: View = {
      ...activeView,
      columnOrder: newOrder,
      displayedColumns: newOrder, // Синхронізувати з columnOrder
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    // Оновити views
    setViews(views.map(v => 
      v.id === activeView.id ? updatedView : v
    ));
  };

  // Handle remove filter
  const handleRemoveFilter = (filterId: string) => {
    if (!activeView) return;
    
    const updatedFilters = (activeView.filters || []).filter(f => f.id !== filterId);
    const updatedView: View = {
      ...activeView,
      filters: updatedFilters,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setViews(views.map(v => 
      v.id === activeView.id ? updatedView : v
    ));
  };

  const handleSearch = (query: SearchQuery) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (perPage: number) => {
    const updatedView: View = {
      ...activeView,
      itemsPerPage: perPage,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    handleSaveView(updatedView);
    setCurrentPage(1);
  };

  const handleRatioChange = (ratio: number) => {
    // ratio тепер = table% (left panel), map% = 100 - ratio
    const mapRatio = 100 - ratio;
    const updatedView: View = {
      ...activeView,
      mapRatio: mapRatio, // Зберігаємо mapRatio для правої панелі
      updatedAt: new Date().toISOString().split('T')[0]
    };
    handleSaveView(updatedView);
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    // TODO: Implement sorting
    console.log('Sort by:', column, direction);
  };

  const handleCreateView = (newView: View) => {
    setViews([...views, newView]);
    setActiveViewId(newView.id);
    setCurrentPage(1);
    
    // Show success notification (if toast is available)
    // toast({
    //   title: "View created",
    //   description: `"${newView.name}" has been created successfully.`,
    // });
  };

  // НОВІ handlers для Filter та Columns кнопок
  const handleOpenFilters = () => {
    setViewSettingsDefaultTab('filters');
    setViewSettingsOpen(true);
  };

  const handleOpenColumns = () => {
    setViewSettingsDefaultTab('columns');
    setViewSettingsOpen(true);
  };

  // Pop-out handlers
  const handlePopOutMap = () => {
    if (typeof window === 'undefined') return;
    
    // Open in new tab instead of popup window
    window.open(
      `/assets/popout/map?viewId=${activeViewId}`,
      '_blank'
    );
    
    // Mark map as popped out
    setPoppedOutSections(prev => ({ ...prev, map: true }));
  };

  const handlePopOutTable = () => {
    if (typeof window === 'undefined') return;
    
    const tableWindow = window.open(
      `/assets/popout/table?viewId=${activeViewId}`,
      'Core Vision - Table',
      'width=1200,height=800,left=900,top=100'
    );
    
    if (tableWindow) {
      setPoppedOutSections(prev => ({ ...prev, table: true }));
      
      const checkClosed = setInterval(() => {
        if (tableWindow.closed) {
          setPoppedOutSections(prev => ({ ...prev, table: false }));
          clearInterval(checkClosed);
        }
      }, 500);
    }
  };

  const handlePopOutBoth = () => {
    handlePopOutMap();
    setTimeout(() => handlePopOutTable(), 100);
  };

  // Handler для inline editing
  const handleUpdateAsset = (assetId: string, updates: Partial<Asset>) => {
    setAssets(assets.map(asset => 
      asset.id === assetId ? { ...asset, ...updates } : asset
    ));
    
    // TODO: Show toast notification when toast is available
    // toast({
    //   title: "Asset updated",
    //   description: "Changes saved successfully",
    // });
  };

  // Handler для експорту вибраних рядків
  const handleExportSelected = async () => {
    if (selectedRows.length === 0) return;
    if (typeof window === 'undefined') return;

    const selectedAssets = filteredAssets.filter(a => selectedRows.includes(a.id));
    const date = new Date().toISOString().split('T')[0];
    const filename = `CoreVision_Export_${activeView.name}_${date}.xlsx`;

    try {
      // Dynamic import to avoid SSR issues
      const { exportToExcel } = await import('@/lib/utils/export');
      await exportToExcel(selectedAssets, displayedColumns, filename);
      
      // TODO: Show toast notification when toast is available
      // toast({
      //   title: "Export successful",
      //   description: `Exported ${selectedAssets.length} assets to ${filename}`,
      // });

      // Clear selection after export (optional)
      // setSelectedRows([]);
    } catch (error) {
      console.error('Export failed:', error);
      // TODO: Show error toast
    }
  };

  // Validation handlers
  const handleStartValidation = async (options: ValidationOptions) => {
    setValidationDialogOpen(false);
    
    // Determine asset IDs based on scope
    const assetIds = options.scope === 'all'
      ? filteredAssets.map(a => a.id)
      : selectedRows;
    
    if (assetIds.length === 0) {
      alert('No assets selected for validation');
      return;
    }
    
    // Generate job ID
    const jobId = `validation-${Date.now()}`;
    setValidationJobId(jobId);
    setValidationProgressOpen(true);
    
    // TODO: Replace with actual API call
    // const response = await fetch('/api/validate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     assetIds,
    //     rules: options.rules
    //   })
    // });
    // const { jobId } = await response.json();
    
    // Simulate validation process
    setTimeout(() => {
      // Mock results
      const mockResults: ValidationResults = {
        total: assetIds.length,
        passed: Math.floor(assetIds.length * 0.58),
        failed: Math.floor(assetIds.length * 0.42),
        summary: {
          'missing "Surveyed By"': 156,
          'missing "Certificate Number"': 98,
          'missing access points': 67,
          'with invalid dates': 45,
          'with invalid PACP codes': 23
        }
      };
      
      // Mock errors
      const mockErrors: ValidationError[] = assetIds.slice(0, 10).map((id, idx) => ({
        assetId: id,
        assetName: `ML-${String(idx + 1).padStart(3, '0')}`,
        inspectionId: String(1000 + idx),
        inspectionDate: new Date().toLocaleDateString(),
        errors: [
          { type: 'missing', field: 'surveyedBy', message: 'Missing: Surveyed By', fixable: true },
          { type: 'missing', field: 'certificateNumber', message: 'Missing: Certificate Number', fixable: true },
          { type: 'missing', field: 'accessPoints', message: 'Access points: Need 2, found 0', fixable: false }
        ]
      }));
      
      setValidationProgressOpen(false);
      setValidationResults(mockResults);
      setValidationErrors(mockErrors);
      setValidationResultsOpen(true);
    }, 3000); // Simulate 3 second validation
  };
  
  const handleViewValidationErrors = () => {
    setValidationResultsOpen(false);
    setValidationErrorsOpen(true);
  };
  
  const handleDownloadValidationReport = () => {
    // TODO: Implement report download
    console.log('Downloading validation report...');
  };
  
  const handleExportValidationErrors = () => {
    // TODO: Implement CSV export
    console.log('Exporting validation errors to CSV...');
  };
  
  const handleBulkFix = (selectedErrors: ValidationError[]) => {
    setSelectedErrorsForBulkFix(selectedErrors);
    setBulkFixDialogOpen(true);
  };
  
  const handleApplyBulkFixes = async (fixes: BulkFix[]) => {
    // TODO: Implement bulk fix API call
    console.log('Applying bulk fixes:', fixes);
    setBulkFixDialogOpen(false);
    // Refresh validation results after fixes
  };

  // Handler для Find & Replace
  const handleFindReplace = (operation: ReplaceOperation) => {
    const updatedAssets = assets.map(asset => {
      if (operation.matchedAssetIds.includes(asset.id)) {
        return {
          ...asset,
          [operation.field]: operation.replaceValue
        } as Asset;
      }
      return asset;
    });
    setAssets(updatedAssets);
    
    // TODO: Show toast notification
    // toast({
    //   title: "Replace completed",
    //   description: `Updated ${operation.matchedAssetIds.length} assets`,
    // });
  };

  // Handler для генерації звіту
  const handleGenerateReport = async (config: ReportConfig) => {
    const assetsToInclude = config.scope === 'selected'
      ? filteredAssets.filter(a => selectedRows.includes(a.id))
      : filteredAssets;

    // Validate before generating
    if (assetsToInclude.length === 0) {
      alert('No assets to include in report. Please select assets or adjust filters.');
      return;
    }

    if (displayedColumns.length === 0) {
      alert('No columns to display. Please add columns to the view.');
      return;
    }

    try {
      // Show loading state (could use toast here)
      console.log(`Generating PDF report for ${assetsToInclude.length} assets...`);
      
      // Dynamic import to avoid SSR issues
      const { generatePDF } = await import('@/lib/utils/pdf-generator');
      
      await generatePDF(
        assetsToInclude,
        displayedColumns,
        config,
        activeView?.name || 'Asset List'
      );

      // Success - PDF should download automatically
      console.log('PDF report generated successfully');
      
      // TODO: Show toast notification when toast is available
      // toast({
      //   title: "Report generated",
      //   description: `PDF report with ${assetsToInclude.length} assets downloaded successfully.`,
      // });
    } catch (error) {
      console.error('Report generation failed:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to generate PDF. Please try again.';
      
      alert(`Report generation failed: ${errorMessage}`);
      
      // TODO: Show error toast when toast is available
      // toast({
      //   title: "Report generation failed",
      //   description: errorMessage,
      //   variant: "destructive"
      // });
    }
  };

  // State synchronization for pop-out windows
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (poppedOutSections.map || poppedOutSections.table) {
      const channel = new BroadcastChannel('asset-list-sync');
      
      channel.postMessage({
        type: 'ASSETS_UPDATE',
        assets: filteredAssets
      });
      
      channel.postMessage({
        type: 'ASSETS_SELECT',
        assetIds: selectedRows
      });
      
      channel.postMessage({
        type: 'COLUMNS_UPDATE',
        columns: displayedColumns
      });
      
      return () => channel.close();
    }
  }, [filteredAssets, displayedColumns, poppedOutSections, selectedRows]);

  // Listen for messages from pop-out windows
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const channel = new BroadcastChannel('asset-list-sync');
    
    channel.onmessage = (event) => {
      if (event.data.type === 'ASSET_SELECT') {
        // Legacy support: single asset selection
        setSelectedRows([event.data.assetId]);
      }
      if (event.data.type === 'ASSETS_SELECT') {
        // New: multiple asset selection
        setSelectedRows(event.data.assetIds || []);
      }
      if (event.data.type === 'MAP_POP_IN') {
        setPoppedOutSections(prev => ({ ...prev, map: false }));
      }
      if (event.data.type === 'OPEN_DETAIL') {
        router.push(`/inspection/${event.data.assetId}`);
      }
    };

    return () => channel.close();
  }, [router]);

  return (
    <div className="flex flex-col h-screen bg-neutral-50 pt-16">
      <Header
        projectName="CityTestQA"
        onProjectChange={(projectId) => {
          console.log('Project changed:', projectId);
        }}
      />

      <ViewTabs
        views={views}
        activeViewId={activeViewId}
        onViewChange={handleViewChange}
        onCreateView={() => setCreateViewOpen(true)}
        onManageViews={() => setManageViewsOpen(true)}
      />

      <div className="shadow-sm">
        <Toolbar
          assets={assets}
          onFilteredResults={(assets) => setSimpleSearchResults(assets)}
          onOpenAdvancedSearch={() => setSearchOpen(true)}
          onOpenViewSettings={() => setViewSettingsOpen(true)}
          onOpenFilters={handleOpenFilters}
          onOpenColumns={handleOpenColumns}
          onPopOutMap={handlePopOutMap}
          onPopOutTable={handlePopOutTable}
          onFindReplace={() => setFindReplaceOpen(true)}
          onGenerateReport={() => setReportDialogOpen(true)}
          onValidateInspections={() => setValidationDialogOpen(true)}
          onExportProject={() => setExportProjectDialogOpen(true)}
          onMoveToProject={() => setMoveToProjectDialogOpen(true)}
          onCopyToProject={() => setCopyToProjectDialogOpen(true)}
          visibleColumnsCount={displayedColumns?.length || 0}
          filters={activeView?.filters || []}
        />

        <ActiveFiltersBar
          viewFilters={activeView?.filters || []}
          temporaryFilters={temporaryFilters}
          onRemoveTemporaryFilter={(filterId) => {
            setTemporaryFilters(prev => prev.filter(f => f.id !== filterId));
          }}
          onOpenViewSettings={() => setViewSettingsOpen(true)}
        />
      </div>

      <div className="flex-1 overflow-hidden p-4 relative">
        {isLoadingView && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-3">
              <div className="w-5 h-5 border-4 border-neutral-200 border-t-orange-600 rounded-full animate-spin" />
              <span className="text-sm font-medium">Switching view...</span>
            </div>
          </div>
        )}
        <ResizableSplit
          defaultRatio={100 - (activeView?.mapRatio || 30)} // 30% map = 70% table
          minLeftWidth={500} // Мінімум для таблиці
          minRightWidth={280} // Мінімум для карти
          onRatioChange={(ratio) => {
            // Інвертуємо: ratio тепер = table%, map% = 100 - ratio
            handleRatioChange(100 - ratio);
          }}
          leftPanel={
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-auto">
                <DataTable
                  data={paginatedAssets}
                  columns={displayedColumns}
                  selectedRows={selectedRows}
                  onRowSelect={(rowIds) => {
                    setSelectedRows(rowIds);
                  }}
                  onRowClick={handleRowClick}
                  onSort={handleSort}
                  onColumnReorder={handleColumnReorder}
                  onUpdateAsset={handleUpdateAsset}
                />
              </div>

              <div className="border-t border-neutral-200">
                <Pagination
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            </div>
          }
          rightPanel={
            poppedOutSections.map ? null : (
              <div className="flex flex-col h-full">
                {/* Snapshots Panel - appears when single asset selected */}
                {selectedAssetForSnapshots && (
                  <SnapshotsPanel
                    asset={selectedAssetForSnapshots}
                    onClose={() => {
                      setSelectedAssetForSnapshots(null);
                      setSelectedRows([]);
                    }}
                    onSnapshotClick={(snapshotId) => {
                      // Navigate to inspection at specific observation
                      if (selectedAssetForSnapshots?.latestInspection) {
                        router.push(`/inspection/${selectedAssetForSnapshots.id}?observation=${snapshotId}`);
                      }
                    }}
                  />
                )}
                
                {/* Map Panel - reduced height when snapshots panel visible */}
                <div className={selectedAssetForSnapshots ? "flex-1 min-h-0" : "flex-1"}>
                  <MapPanel
                    assets={filteredAssets}
                    selectedAssetIds={selectedRows}
                    filteredAssetIds={filteredAssets.map(a => a.id)}
                    onAssetSelect={(ids) => {
                      setSelectedRows(ids);
                      // Scroll to first selected row in table
                      if (typeof window !== 'undefined' && ids.length > 0) {
                        setTimeout(() => {
                          const row = document.querySelector(`[data-asset-id="${ids[0]}"]`);
                          if (row) {
                            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            // Flash animation
                            row.classList.add('flash-highlight');
                            setTimeout(() => row.classList.remove('flash-highlight'), 1000);
                          }
                        }, 100);
                      }
                    }}
                    onMapClick={() => {
                      // Deselect при кліку на empty map area
                      setSelectedRows([]);
                    }}
                    filters={activeView?.filters || []}
                  />
                </div>
              </div>
            )
          }
        />
      </div>

      {/* Floating Selection Bar */}
      <FloatingSelectionBar
        selectedAssets={filteredAssets.filter(asset => selectedRows.includes(asset.id))}
        onClearSelection={() => setSelectedRows([])}
        onAssignComplete={async (assigneeId: string) => {
          console.log('Assigning to:', assigneeId);
          
          // API call (mock for now)
          try {
            await fetch('/api/assets/assign', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                assetIds: selectedRows,
                assigneeId
              })
            });
            
            // TODO: Show toast notification
            console.log(`Assigned ${selectedRows.length} inspections to ${assigneeId}`);
            
            // Refresh data would happen here
            // setSelectedRows([]); // Already cleared in FloatingSelectionBar
          } catch (error) {
            console.error('Assign failed:', error);
            alert('Failed to assign assets. Please try again.');
          }
        }}
        onEditComplete={() => {
          // Edit navigation is handled in FloatingSelectionBar
          // This callback is for future inline edit modal
        }}
        onDeleteComplete={async () => {
          // Remove deleted assets from state
          setAssets(prev => 
            prev.filter(asset => !selectedRows.includes(asset.id))
          );
          
          // TODO: Show toast notification
          console.log(`Deleted ${selectedRows.length} assets`);
          
          // setSelectedRows([]); // Already cleared in FloatingSelectionBar
        }}
        onExportComplete={async () => {
          // Call existing export handler
          await handleExportSelected();
          
          // TODO: Show toast notification
          console.log(`Exported ${selectedRows.length} assets`);
        }}
        onOpenCompare={() => {
          // Open compare view for exactly 2 selected inspections
          const selectedAssets = filteredAssets.filter(asset => selectedRows.includes(asset.id));
          
          if (selectedAssets.length !== 2) {
            console.warn('Open Compare requires exactly 2 selected assets');
            return;
          }
          
          const [inspection1, inspection2] = selectedAssets;
          
          // Navigate to comparison view
          router.push(`/inspection-viewer?mode=compare&current=${inspection1.id}&previous=${inspection2.id}`);
          
          // Clear selection after navigation
          setSelectedRows([]);
        }}
        onOpenInTabs={() => {
          // Legacy handler - kept for backward compatibility but not used
          const selectedAssets = filteredAssets.filter(asset => selectedRows.includes(asset.id));
          const count = selectedAssets.length;
          
          // Warning for many tabs
          if (count > 10) {
            const confirmed = confirm(
              `Open ${count} tabs? This may slow down your browser.`
            );
            if (!confirmed) return;
          }

          // Open each asset in new tab with small delay
          selectedAssets.forEach((asset, index) => {
            setTimeout(() => {
              window.open(`/inspection/${asset.id}`, '_blank');
            }, index * 100); // 100ms delay between each to avoid browser blocking
          });
        }}
      />

      {/* Dialogs */}
      <ViewSettingsDialog
        open={viewSettingsOpen}
        onClose={() => setViewSettingsOpen(false)}
        currentView={activeView || {
          id: 'default',
          name: 'Default',
          isFavorite: false,
          isDefault: true,
          displayedColumns: ['pipeSegment', 'street', 'material'],
          columnOrder: ['pipeSegment', 'street', 'material'],
          filters: [],
          mapRatio: 40,
          itemsPerPage: 100,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          createdBy: 'system'
        } as View}
        onSave={handleSaveView}
        assets={assets}
        defaultTab={viewSettingsDefaultTab}
      />

      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        columns={mockColumnDefs}
        onSearch={handleSearch}
      />

      <FindReplaceDialog
        open={findReplaceOpen}
        onClose={() => setFindReplaceOpen(false)}
        columns={mockColumnDefs}
        assets={assets} // All assets for "Project" scope
        filteredAssets={filteredAssets} // Filtered assets for "Entire view" scope
        selectedAssetIds={selectedRows}
        onReplace={handleFindReplace}
      />

      <ReportGenerationDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        totalAssets={assets.length}
        filteredAssets={filteredAssets.length}
        selectedAssets={selectedRows.length}
      />

      <ManageViewsDialog
        open={manageViewsOpen}
        onClose={() => setManageViewsOpen(false)}
        views={views}
        onUpdateViews={setViews}
        onCreateNewView={() => {
          setManageViewsOpen(false); // Закрити Manage Views dialog
          setCreateViewOpen(true); // Відкрити Create View dialog
        }}
      />

      {/* Validation Dialogs */}
      <ValidationDialog
        open={validationDialogOpen}
        onClose={() => setValidationDialogOpen(false)}
        totalAssets={filteredAssets.length}
        selectedAssets={selectedRows.length}
        onStartValidation={handleStartValidation}
      />

      <ValidationProgressDialog
        open={validationProgressOpen}
        onCancel={() => {
          setValidationProgressOpen(false);
          setValidationJobId(null);
        }}
        jobId={validationJobId || ''}
      />

      {validationResults && (
        <ValidationResultsDialog
          open={validationResultsOpen}
          onClose={() => setValidationResultsOpen(false)}
          results={validationResults}
          onViewErrors={handleViewValidationErrors}
          onDownloadReport={handleDownloadValidationReport}
        />
      )}

      {validationErrors.length > 0 && (
        <Dialog open={validationErrorsOpen} onOpenChange={setValidationErrorsOpen}>
          <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col p-0">
            <ValidationErrorsView
              errors={validationErrors}
              onBulkFix={handleBulkFix}
              onExport={handleExportValidationErrors}
            />
          </DialogContent>
        </Dialog>
      )}

      <BulkFixDialog
        open={bulkFixDialogOpen}
        onClose={() => {
          setBulkFixDialogOpen(false);
          setSelectedErrorsForBulkFix([]);
        }}
        errors={selectedErrorsForBulkFix}
        onApplyFixes={handleApplyBulkFixes}
      />

      {/* Export & Transfer Dialogs */}
      <ExportProjectDialog
        open={exportProjectDialogOpen}
        onClose={() => setExportProjectDialogOpen(false)}
        totalAssets={assets.length}
        filteredAssets={filteredAssets.length}
        selectedAssets={selectedRows.length}
      />

      <MoveToProjectDialog
        open={moveToProjectDialogOpen}
        onClose={() => setMoveToProjectDialogOpen(false)}
        selectedAssets={filteredAssets.filter(a => selectedRows.includes(a.id))}
        currentProject={activeView?.name || 'Current Project'}
        onMoveComplete={() => {
          // Remove moved assets from current view
          setAssets(prev => 
            prev.filter(asset => !selectedRows.includes(asset.id))
          );
          setSelectedRows([]);
        }}
      />

      <CopyToProjectDialog
        open={copyToProjectDialogOpen}
        onClose={() => setCopyToProjectDialogOpen(false)}
        selectedAssets={filteredAssets.filter(a => selectedRows.includes(a.id))}
        onCopyComplete={() => {
          // Optional: clear selection or refresh
          // Assets remain in current project
        }}
      />

      <CreateViewDialog
        open={createViewOpen}
        onClose={() => setCreateViewOpen(false)}
        existingViews={views}
        onCreateView={handleCreateView}
      />
    </div>
  );
}
