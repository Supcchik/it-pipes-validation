'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Settings,
  MoreVertical,
  ExternalLink,
  FileLock,
  FileSearch,
  FolderDown,
  Copy,
  Printer,
  Filter,
  Columns,
  FolderOutput
} from 'lucide-react';
import type { FilterConfig, Asset, AssetType } from '@/lib/types/asset-list';
import { useABTestOptional } from '@/lib/contexts/ab-test-context';
import { cn } from '@/lib/utils';
import SearchBar from './SearchBar';
import AssetTypeSelector from './AssetTypeSelector';

interface ToolbarProps {
  assets: Asset[]; // НОВИЙ: для SearchBar
  onFilteredResults: (assets: Asset[] | null) => void; // НОВИЙ: результат simple search
  onOpenViewSettings: () => void; // Залишено для backward compatibility
  onOpenFilters?: () => void; // НОВИЙ: Відкрити ViewSettings на вкладці Filters
  onOpenColumns?: () => void; // НОВИЙ: Відкрити ViewSettings на вкладці Columns
  onPopOutMap: () => void;
  onPopOutTable: () => void;
  onFindReplace?: () => void; // НОВИЙ: Find & Replace
  onGenerateReport?: () => void; // НОВИЙ: Generate Report
  onValidateInspections?: () => void; // НОВИЙ: Validate Inspections
  onExportProject?: () => void; // НОВИЙ: Export Project
  onMoveToProject?: () => void; // НОВИЙ: Move to Project
  onCopyToProject?: () => void; // НОВИЙ: Copy to Project
  filters?: FilterConfig[];
  visibleColumnsCount?: number; // НОВИЙ: Кількість видимих колонок
  onRemoveFilter?: (filterId: string) => void;
  // Asset Type Selector props
  activeAssetTypes?: AssetType[]; // Support multiple types
  assetCounts?: {
    ML: number;
    MH: number;
    L: number;
  };
  onAssetTypesChange?: (types: AssetType[]) => void; // Support multiple types
  assetTypeLoading?: boolean;
}

export default function Toolbar({
  assets,
  onFilteredResults,
  onOpenViewSettings,
  onOpenFilters,
  onOpenColumns,
  onPopOutMap,
  onPopOutTable,
  onFindReplace,
  onGenerateReport,
  onValidateInspections,
  onExportProject,
  onMoveToProject,
  onCopyToProject,
  filters = [],
  visibleColumnsCount,
  activeAssetTypes = ['ML'],
  assetCounts = { ML: 0, MH: 0, L: 0 },
  onAssetTypesChange,
  assetTypeLoading = false
}: ToolbarProps) {
  const abTest = useABTestOptional();
  const activeFiltersCount = filters.length;
  const toolbarButtonClass =
    'h-10 px-4 py-2 rounded-lg gap-2 text-[#312C29] text-sm font-medium hover:bg-neutral-100';
  const dividerClass = 'w-px h-6 bg-[#D4D4D8] shrink-0';

  return (
    <TooltipProvider>
      <div className="bg-white border-b border-[#E4E4E7] flex items-center justify-between px-6 py-2">
        {/* Ліва частина: Asset | Search | Filter | Columns | Report | More */}
        <div className="flex items-center gap-4">
          {onAssetTypesChange && (
            <>
              <AssetTypeSelector
                activeTypes={activeAssetTypes}
                counts={assetCounts}
                onTypesChange={onAssetTypesChange}
                loading={assetTypeLoading}
              />
              <div className={dividerClass} />
            </>
          )}
          <SearchBar
            assets={assets}
            onFilteredResults={onFilteredResults}
            assetType={activeAssetTypes.length === 1 ? activeAssetTypes[0] : 'ML'}
          />
          <div className={dividerClass} />
          {onOpenFilters && (
            <Button
              variant="ghost"
              className={toolbarButtonClass}
              onClick={onOpenFilters}
              aria-label="Filter"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 bg-orange-500 text-white text-xs h-5 px-1.5">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}
          {onOpenColumns && (
            <Button
              variant="ghost"
              className={toolbarButtonClass}
              onClick={onOpenColumns}
              aria-label="Columns"
            >
              <Columns className="w-4 h-4" />
              <span>Columns</span>
              {visibleColumnsCount !== undefined && (
                <span className="text-xs text-neutral-500 ml-1">({visibleColumnsCount})</span>
              )}
            </Button>
          )}
          {(!onOpenFilters || !onOpenColumns) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onOpenViewSettings}
                  className="h-10 w-10 rounded-lg"
                  aria-label="View Settings"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Settings</p>
                <p className="text-xs text-neutral-500">Columns & Filters</p>
              </TooltipContent>
            </Tooltip>
          )}
          <div className={dividerClass} />
          {onGenerateReport && (
            <Button
              variant="ghost"
              className={toolbarButtonClass}
              onClick={onGenerateReport}
              aria-label="Generate PDF report"
            >
              <Printer className="w-4 h-4" />
              <span>Report</span>
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-lg text-[#312C29]"
                    aria-label="More tools"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[200px] py-1 px-1 rounded-lg border border-[#E4E4E7] bg-white shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_4px_6px_-1px_rgba(0,0,0,0.10)] [&>div]:px-1"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <DropdownMenuItem
                    onClick={onValidateInspections}
                    disabled={!onValidateInspections}
                    className="p-2 rounded-md gap-3 text-sm font-normal text-[#18181B] focus:bg-neutral-100 [&_svg]:text-[#71717A] [&_svg]:w-4 [&_svg]:h-4"
                  >
                    <FileLock className="shrink-0" />
                    Validate inspections
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onFindReplace}
                    disabled={!onFindReplace}
                    className="p-2 rounded-md gap-3 text-sm font-normal text-[#18181B] focus:bg-neutral-100 [&_svg]:text-[#71717A] [&_svg]:w-4 [&_svg]:h-4"
                  >
                    <FileSearch className="shrink-0" />
                    Find & Replace
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-[#E4E4E7]" />
                  <DropdownMenuItem
                    onClick={onExportProject}
                    disabled={!onExportProject}
                    className="p-2 rounded-md gap-3 text-sm font-normal text-[#18181B] focus:bg-neutral-100 [&_svg]:text-[#71717A] [&_svg]:w-4 [&_svg]:h-4"
                  >
                    <FolderDown className="shrink-0" />
                    Export project
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onCopyToProject}
                    disabled={!onCopyToProject}
                    className="p-2 rounded-md gap-3 text-sm font-normal text-[#18181B] focus:bg-neutral-100 [&_svg]:text-[#71717A] [&_svg]:w-4 [&_svg]:h-4"
                  >
                    <Copy className="shrink-0" />
                    Copy to project
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onMoveToProject}
                    disabled={!onMoveToProject}
                    className="p-2 rounded-md gap-3 text-sm font-normal text-[#18181B] focus:bg-neutral-100 [&_svg]:text-[#71717A] [&_svg]:w-4 [&_svg]:h-4"
                  >
                    <FolderOutput className="shrink-0" />
                    Move to project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>
              <p>More tools</p>
            </TooltipContent>
          </Tooltip>
          {abTest && (
            <>
              <div className={dividerClass} />
              <div
                className="flex items-center h-10 gap-0 rounded-lg border border-[#8B5CF6] overflow-hidden"
                role="group"
                aria-label="UX Testing Mode"
              >
                <div className="flex items-center h-full px-3 bg-white shrink-0">
                  <span className="text-xs text-[#6D28D9] font-medium">
                    UX Testing Mode
                  </span>
                </div>
                <div className="flex h-full border-l border-[#8B5CF6]">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => abTest.setVariant('A')}
                        className={cn(
                          'h-full px-3 text-xs font-medium transition-colors',
                          abTest.variant === 'A'
                            ? 'bg-[#8B5CF6] text-white'
                            : 'bg-[#F5F3FF] text-[#6D28D9] hover:bg-[#EDE9FE]'
                        )}
                      >
                        Variant A
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[260px]">
                      <p className="font-medium text-[#18181B]">Variant A — Smart Auto-Add</p>
                      <p className="text-xs text-[#71717A] mt-0.5">
                        Filters show all fields. Filtering by a hidden column shows a notification to add it; you can add the column with highlight or keep it hidden.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => abTest.setVariant('B')}
                        className={cn(
                          'h-full px-3 text-xs font-medium transition-colors',
                          abTest.variant === 'B'
                            ? 'bg-[#8B5CF6] text-white'
                            : 'bg-[#F5F3FF] text-[#6D28D9] hover:bg-[#EDE9FE]'
                        )}
                      >
                        Variant B
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[260px]">
                      <p className="font-medium text-[#18181B]">Variant B — Context-Aware Filters</p>
                      <p className="text-xs text-[#71717A] mt-0.5">
                        Filters only show visible columns. Add columns in Manage Columns to unlock more filters; hiding a column with an active filter removes that filter.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Права частина: Pop-out Map */}
        <div className="flex items-center gap-4">
          {onPopOutMap && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-lg text-[#312C29]"
                  onClick={onPopOutMap}
                  aria-label="Pop-out Map"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pop-out Map</p>
                <p className="text-xs text-neutral-500">Open map in new tab</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
