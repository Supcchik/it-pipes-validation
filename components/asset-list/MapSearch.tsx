'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Network asset interface (ESRI data)
export interface NetworkAsset {
  id: string;
  name: string;
  type: 'pipe' | 'manhole' | 'other';
  address?: string;
  lat: number;
  lng: number;
}

interface MapSearchProps {
  onAssetSelect: (asset: NetworkAsset) => void;
}

// Mock network assets (ESRI database)
const MOCK_NETWORK_ASSETS: NetworkAsset[] = [
  { id: 'net-1', name: 'S-104', type: 'pipe', address: 'Main St', lat: 40.7580, lng: -73.9860 },
  { id: 'net-2', name: 'S-105', type: 'pipe', address: 'Main St', lat: 40.7585, lng: -73.9865 },
  { id: 'net-3', name: 'MH-234', type: 'manhole', address: 'Oak Ave', lat: 40.7590, lng: -73.9870 },
  { id: 'net-4', name: 'S-106', type: 'pipe', address: 'Elm St', lat: 40.7595, lng: -73.9875 },
  { id: 'net-5', name: 'MH-235', type: 'manhole', address: 'Elm St', lat: 40.7600, lng: -73.9880 },
  { id: 'net-6', name: 'S-107', type: 'pipe', address: 'Park Ave', lat: 40.7605, lng: -73.9885 },
  { id: 'net-7', name: 'MH-236', type: 'manhole', address: 'Park Ave', lat: 40.7610, lng: -73.9890 },
];

export default function MapSearch({ onAssetSelect }: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Search network assets
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    return MOCK_NETWORK_ASSETS
      .filter(asset => 
        asset.name.toLowerCase().includes(q) ||
        asset.address?.toLowerCase().includes(q) ||
        asset.id.toLowerCase().includes(q)
      )
      .slice(0, 10); // Max 10 results
  }, [query]);

  // Close popover when result selected
  const handleSelect = (asset: NetworkAsset) => {
    onAssetSelect(asset);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 bg-white shadow-md hover:bg-neutral-50"
          aria-label="Search map network"
        >
          <Search className="h-4 w-4 text-blue-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-neutral-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search map network..."
              className="pl-9"
              autoFocus
            />
          </div>
        </div>
        
        {query.trim() && (
          <div className="max-h-64 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500">
                No results found
              </div>
            ) : (
              <div className="py-2">
                {searchResults.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => handleSelect(asset)}
                    className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors flex items-center gap-3"
                  >
                    <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 truncate">
                        {asset.name}
                      </div>
                      {asset.address && (
                        <div className="text-xs text-neutral-500 truncate">
                          {asset.address}
                        </div>
                      )}
                      <div className="text-xs text-neutral-400 capitalize">
                        {asset.type}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {!query.trim() && (
          <div className="p-4 text-center text-sm text-neutral-500">
            Type to search the city's network
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}



