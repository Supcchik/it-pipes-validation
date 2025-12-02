'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, X, Settings2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Asset } from '@/lib/types/asset-list';

interface SearchBarProps {
  assets: Asset[];
  onFilteredResults: (assets: Asset[] | null) => void; // null = no search, [] = no results, [assets] = results
  onOpenAdvancedSearch: () => void;
}

// Fields to search in asset object
const ASSET_FIELDS = [
  'pipeSegment', 
  'street', 
  'upstreamMH', 
  'downstreamMH', 
  'material'
];

export default function SearchBar({ 
  assets, 
  onFilteredResults, 
  onOpenAdvancedSearch 
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  // Live filtering
  const filtered = useMemo(() => {
    if (!query.trim()) return assets;
    
    const q = query.toLowerCase();
    return assets.filter(asset => {
      // Search in asset fields
      if (ASSET_FIELDS.some(field => {
        const value = (asset as unknown as Record<string, unknown>)[field];
        return String(value || '').toLowerCase().includes(q);
      })) {
        return true;
      }
      
      // Search in latestInspection fields
      if (asset.latestInspection) {
        // certificateNumber
        if (asset.latestInspection.certificateNumber?.toLowerCase().includes(q)) {
          return true;
        }
        // surveyedBy
        if (asset.latestInspection.surveyedBy?.toLowerCase().includes(q)) {
          return true;
        }
      }
      
      return false;
    });
  }, [query, assets]);

  // Update parent with filtered results
  useEffect(() => {
    // If query is empty, pass null to indicate no search is active (parent will use all assets)
    // Otherwise pass the filtered results (even if empty array = no matches found)
    if (!query.trim()) {
      onFilteredResults(null); // null signals parent to use all assets
    } else {
      onFilteredResults(filtered);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, query]); // onFilteredResults is stable, no need to include

  return (
    <div className="relative w-96">
      {/* Search icon (left) */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      
      {/* Input */}
      <Input
        type="text"
        placeholder="Search pipe, street, material..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-20 h-9"
        aria-label="Search assets"
      />

      {/* Right side icons */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {/* Clear button (only when has text) */}
        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-1 hover:bg-neutral-100 rounded transition-colors"
            aria-label="Clear search"
            type="button"
          >
            <X className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
          </button>
        )}
        
        {/* Advanced search button (always visible) */}
        <button
          onClick={onOpenAdvancedSearch}
          className="p-1 hover:bg-neutral-100 rounded transition-colors"
          title="Advanced search"
          aria-label="Open advanced search"
          type="button"
        >
          <Settings2 className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
        </button>
      </div>
    </div>
  );
}

