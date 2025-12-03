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
  CheckCircle,
  FileSearch,
  Download,
  Copy,
  Printer,
  Filter,
  Columns,
  MoveRight
} from 'lucide-react';
import type { FilterConfig, Asset } from '@/lib/types/asset-list';
import SearchBar from './SearchBar';

interface ToolbarProps {
  assets: Asset[]; // НОВИЙ: для SearchBar
  onFilteredResults: (assets: Asset[]) => void; // НОВИЙ: результат simple search
  onOpenAdvancedSearch: () => void; // НОВИЙ: відкрити advanced search modal
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
}

export default function Toolbar({
  assets,
  onFilteredResults,
  onOpenAdvancedSearch,
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
  visibleColumnsCount
}: ToolbarProps) {
  const activeFiltersCount = filters.length;
  return (
    <TooltipProvider>
      <div className="min-h-14 bg-white border-b border-neutral-200 flex flex-col">
        {/* Top Row: Primary Actions */}
        <div className="h-14 flex items-center justify-between px-4 gap-2">
          {/* Group 1: Search Bar */}
          <div className="flex items-center gap-2">
            <SearchBar
              assets={assets}
              onFilteredResults={onFilteredResults}
              onOpenAdvancedSearch={onOpenAdvancedSearch}
            />
          </div>

          {/* Visual Separator */}
          <div className="h-6 w-px bg-neutral-300 mx-2" />

          {/* Group 2: Filter + Columns */}
          <div className="flex items-center gap-2">
            {onOpenFilters ? (
              <Button
                variant="ghost"
                className="gap-2 px-3 h-9 hover:bg-neutral-100 text-neutral-700"
                onClick={onOpenFilters}
                aria-label="Filter"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 bg-orange-500 text-white text-xs h-5 px-1.5">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            ) : null}

            {onOpenColumns ? (
              <Button
                variant="ghost"
                className="gap-2 px-3 h-9 hover:bg-neutral-100 text-neutral-700"
                onClick={onOpenColumns}
                aria-label="Columns"
              >
                <Columns className="w-4 h-4" />
                <span className="text-sm">Columns</span>
                {visibleColumnsCount !== undefined && (
                  <span className="text-xs text-neutral-500 ml-1">
                    ({visibleColumnsCount})
                  </span>
                )}
              </Button>
            ) : null}

            {/* Fallback: Settings button if new props not provided */}
            {(!onOpenFilters || !onOpenColumns) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onOpenViewSettings}
                    className="h-10 w-10"
                    aria-label="View Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Settings</p>
                  <p className="text-xs text-neutral-500">Columns & Filters</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Visual Separator */}
          <div className="h-6 w-px bg-neutral-300 mx-2" />

          {/* Group 3: Report + More */}
          <div className="flex items-center gap-2">
            {/* REPORT BUTTON - Equal visual weight with Filter/Columns */}
            {onGenerateReport && (
              <Button
                variant="ghost"
                className="gap-2 px-3 h-9 hover:bg-neutral-100 text-neutral-700"
                onClick={onGenerateReport}
                aria-label="Generate PDF report"
              >
                <Printer className="w-4 h-4" />
                <span className="text-sm">Report</span>
              </Button>
            )}

            {/* More Tools Dropdown */}
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={onValidateInspections} disabled={!onValidateInspections}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Validate Inspections
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onFindReplace} disabled={!onFindReplace}>
                      <FileSearch className="mr-2 h-4 w-4" />
                      Find & Replace
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onExportProject} disabled={!onExportProject}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Project
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onMoveToProject} disabled={!onMoveToProject}>
                      <MoveRight className="mr-2 h-4 w-4" />
                      Move to Project
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onCopyToProject} disabled={!onCopyToProject}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>More tools</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Auto-spacer */}
          <div className="flex-1" />

          {/* Group 4: Pop-out */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <ExternalLink className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onPopOutMap}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Pop-out Map
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onPopOutTable}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Pop-out Table
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        if (onPopOutMap && onPopOutTable) {
                          onPopOutMap();
                          setTimeout(() => onPopOutTable(), 100);
                        }
                      }}
                      disabled={!onPopOutMap || !onPopOutTable}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Pop-out Both
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pop-out window</p>
                <p className="text-xs text-neutral-500">Open in new window</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
