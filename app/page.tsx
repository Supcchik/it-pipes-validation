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
import ReportDialog from '@/components/asset-list/ReportDialog';
import ManageViewsDialog from '@/components/asset-list/ManageViewsDialog';
import ActiveFiltersBar from '@/components/asset-list/ActiveFiltersBar';
import CreateViewDialog from '@/components/asset-list/CreateViewDialog';
import { mockViews, mockAssets, mockColumnDefs } from '@/lib/mock-data/asset-list';
import type { View, Asset, ColumnDef } from '@/lib/types/asset-list';
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

    // Apply view filters
    if (activeView.filters && activeView.filters.length > 0) {
      activeView.filters.forEach(filter => {
        filtered = filtered.filter(asset => {
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
        });
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
    router.push(`/inspection/${asset.id}`);
  };

  const handleViewChange = async (viewId: string) => {
    setIsLoadingView(true);
    setActiveViewId(viewId);
    setCurrentPage(1);
    
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
    
    const mapWindow = window.open(
      `/assets/popout/map?viewId=${activeViewId}`,
      'Core Vision - Map',
      'width=800,height=600,left=100,top=100'
    );
    
    if (mapWindow) {
      setPoppedOutSections(prev => ({ ...prev, map: true }));
      
      // Listen for window close
      const checkClosed = setInterval(() => {
        if (mapWindow.closed) {
          setPoppedOutSections(prev => ({ ...prev, map: false }));
          clearInterval(checkClosed);
        }
      }, 500);
    }
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
        type: 'COLUMNS_UPDATE',
        columns: displayedColumns
      });
      
      return () => channel.close();
    }
  }, [filteredAssets, displayedColumns, poppedOutSections]);

  // Listen for messages from pop-out windows
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const channel = new BroadcastChannel('asset-list-sync');
    
    channel.onmessage = (event) => {
      if (event.data.type === 'ASSET_SELECT') {
        setSelectedRows([event.data.assetId]);
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
          onFilteredResults={setSimpleSearchResults}
          onOpenAdvancedSearch={() => setSearchOpen(true)}
          onOpenViewSettings={() => setViewSettingsOpen(true)}
          onOpenFilters={handleOpenFilters}
          onOpenColumns={handleOpenColumns}
          onPopOutMap={handlePopOutMap}
          onPopOutTable={handlePopOutTable}
          onExportSelected={handleExportSelected}
          onFindReplace={() => setFindReplaceOpen(true)}
          onGenerateReport={() => setReportDialogOpen(true)}
          onEditSelected={() => {
            // TODO: Implement bulk edit
            console.log('Edit selected:', selectedRows);
          }}
          onDeleteSelected={() => {
            // TODO: Implement bulk delete with confirmation
            if (confirm(`Delete ${selectedRows.length} selected asset(s)?`)) {
              console.log('Delete selected:', selectedRows);
              // setAssets(assets.filter(a => !selectedRows.includes(a.id)));
              setSelectedRows([]);
            }
          }}
          selectedRowsCount={selectedRows.length}
          visibleColumnsCount={displayedColumns?.length || 0}
          filters={activeView?.filters || []}
        />

        <ActiveFiltersBar
          filters={activeView?.filters || []}
          onRemoveFilter={handleRemoveFilter}
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
                  onRowSelect={setSelectedRows}
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
            <MapPanel
              assets={filteredAssets}
              selectedAssetId={selectedRows[0]}
              onAssetSelect={(id) => {
                setSelectedRows([id]);
                // Scroll to row in table
                if (typeof window !== 'undefined') {
                  setTimeout(() => {
                    const row = document.querySelector(`[data-asset-id="${id}"]`);
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
          }
        />
      </div>

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
        assets={filteredAssets}
        selectedAssetIds={selectedRows}
        onReplace={handleFindReplace}
      />

      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        assets={filteredAssets}
        selectedAssetIds={selectedRows}
        currentView={activeView}
        onGenerate={handleGenerateReport}
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

      <CreateViewDialog
        open={createViewOpen}
        onClose={() => setCreateViewOpen(false)}
        existingViews={views}
        onCreateView={handleCreateView}
      />
    </div>
  );
}
