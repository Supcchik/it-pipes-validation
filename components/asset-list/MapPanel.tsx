'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Map, Plus, Minus, Layers } from 'lucide-react';
import type { Asset, FilterConfig } from '@/lib/types/asset-list';

interface MapPanelProps {
  assets: Asset[];
  selectedAssetId?: string;
  onAssetSelect: (assetId: string) => void;
  onMapClick?: () => void; // НОВИЙ: для deselect при кліку на empty area
  filters?: FilterConfig[];
}

export default function MapPanel({
  assets,
  selectedAssetId: _selectedAssetId,
  onAssetSelect: _onAssetSelect,
  onMapClick
}: MapPanelProps) {
  const [basemap, setBasemap] = useState('streets');
  const [zoom, setZoom] = useState(14);

  // Handle click on map (empty area)
  const handleMapClick = (e: React.MouseEvent) => {
    // Якщо клік не на interactive element (button, select, etc.)
    const target = e.target as HTMLElement;
    if (
      !target.closest('button') &&
      !target.closest('[role="combobox"]') &&
      !target.closest('.map-marker') // Якщо буде marker
    ) {
      onMapClick?.();
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-neutral-100 flex items-center justify-center"
      onClick={handleMapClick}
      role="application"
      aria-label="Asset map view"
    >
      {/* Placeholder Content */}
      <div className="text-center">
        <Map className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-600">
          ESRI Map Integration
        </h3>
        <p className="text-sm text-neutral-500 mt-2">
          Map placeholder - Ready for ESRI ArcGIS SDK
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          {assets.length} assets loaded
        </p>
      </div>
      
      {/* Zoom Controls - Bottom Left */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1">
        <Button 
          size="icon" 
          variant="secondary"
          className="w-9 h-9 bg-white shadow-md hover:bg-neutral-50"
          onClick={() => setZoom(Math.min(zoom + 1, 20))}
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button 
          size="icon" 
          variant="secondary"
          className="w-9 h-9 bg-white shadow-md hover:bg-neutral-50"
          onClick={() => setZoom(Math.max(zoom - 1, 1))}
        >
          <Minus className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Basemap Selector - Top Right */}
      <div className="absolute top-4 right-4">
        <Select value={basemap} onValueChange={setBasemap}>
          <SelectTrigger className="w-36 bg-white shadow-md">
            <Layers className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="streets">Streets</SelectItem>
            <SelectItem value="satellite">Satellite</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="topo">Topographic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Current Zoom Level - Bottom Right */}
      <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-md shadow-md">
        <span className="text-xs font-medium text-neutral-600">
          Zoom: {zoom}
        </span>
      </div>

      {/* TODO: Integrate ESRI ArcGIS Maps SDK for JavaScript */}
    </div>
  );
}
