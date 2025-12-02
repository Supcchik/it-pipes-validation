'use client';

import { useState, useMemo } from 'react';
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
import ManageViewsDialog from '@/components/asset-list/ManageViewsDialog';
import ActiveFiltersBar from '@/components/asset-list/ActiveFiltersBar';
import CreateViewDialog from '@/components/asset-list/CreateViewDialog';
import { mockViews, mockAssets, mockColumnDefs } from '@/lib/mock-data/asset-list';
import type { View, Asset, ColumnDef } from '@/lib/types/asset-list';

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
  const [assets] = useState<Asset[]>(() => {
    try {
      return mockAssets;
    } catch (error) {
      console.error('Error loading mock assets:', error);
      return [];
    }
  });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchQueryObj, setSearchQueryObj] = useState<SearchQuery | null>(null);
  const [isLoadingView, setIsLoadingView] = useState(false);

  // Dialog states
  const [viewSettingsOpen, setViewSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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

  // Filter assets based on active view filters and search query
  const filteredAssets = useMemo(() => {
    if (!assets || assets.length === 0) {
      return [];
    }
    if (!activeView) {
      return assets;
    }
    let filtered = [...assets];

    // Apply view filters
    if (activeView.filters && activeView.filters.length > 0) {
      activeView.filters.forEach(filter => {
        filtered = filtered.filter(asset => {
          // Get value based on table type
          let value: unknown;
          
          if (filter.table === 'asset') {
            value = (asset as unknown as Record<string, unknown>)[filter.field];
          } else if (filter.table === 'inspection' && asset.latestInspection) {
            value = (asset.latestInspection as Record<string, unknown>)[filter.field];
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

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(asset => {
        return (
          asset.pipeSegment.toLowerCase().includes(query) ||
          asset.street.toLowerCase().includes(query) ||
          asset.material.toLowerCase().includes(query) ||
          asset.latestInspection?.certificateNumber.toLowerCase().includes(query) ||
          asset.latestInspection?.surveyedBy.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [assets, activeView, searchQuery]);

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
    // Convert SearchQuery to simple string for backward compatibility
    setSearchQuery(query.value || '');
    setSearchQueryObj(query);
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
    const updatedView: View = {
      ...activeView,
      mapRatio: ratio,
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
          onSearch={() => setSearchOpen(true)}
          onOpenViewSettings={() => setViewSettingsOpen(true)}
          onPopOutMap={() => {
            // TODO: Pop out map
            console.log('Pop out map');
          }}
          onPopOutTable={() => {
            // TODO: Pop out table
            console.log('Pop out table');
          }}
          selectedRowsCount={selectedRows.length}
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
          defaultRatio={activeView?.mapRatio || 40}
          minLeftWidth={280}
          minRightWidth={500}
          onRatioChange={handleRatioChange}
          leftPanel={
            <MapPanel
              assets={filteredAssets}
              selectedAssetId={selectedRows[0]}
              onAssetSelect={(id) => setSelectedRows([id])}
              filters={activeView?.filters || []}
            />
          }
          rightPanel={
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
                />
              </div>

              <div className="border-t border-neutral-200 mt-4">
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
      />

      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSearch={handleSearch}
        columns={mockColumnDefs || []}
        onClearSearch={() => {
          setSearchQuery('');
          setSearchQueryObj(null);
        }}
        hasActiveSearch={searchQueryObj !== null}
      />

      <ManageViewsDialog
        open={manageViewsOpen}
        onClose={() => setManageViewsOpen(false)}
        views={views}
        onUpdateViews={setViews}
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
