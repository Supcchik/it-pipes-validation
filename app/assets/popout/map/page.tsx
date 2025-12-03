'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import MapPanel from '@/components/asset-list/MapPanel';
import type { Asset } from '@/lib/types/asset-list';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CoreVisionLogo from '@/components/CoreVisionLogo';

function MapPopoutContent() {
  
  // Sync state with parent window via BroadcastChannel
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Listen for updates from main window
    const channel = new BroadcastChannel('asset-list-sync');
    
    channel.onmessage = (event) => {
      if (event.data.type === 'ASSETS_UPDATE') {
        setAssets(event.data.assets);
      }
      if (event.data.type === 'ASSET_SELECT') {
        // Support both old (single) and new (array) format
        if (Array.isArray(event.data.assetIds)) {
          setSelectedAssetIds(event.data.assetIds);
        } else if (event.data.assetId) {
          setSelectedAssetIds([event.data.assetId]);
        }
      }
      if (event.data.type === 'ASSETS_SELECT') {
        setSelectedAssetIds(event.data.assetIds || []);
      }
    };

    return () => channel.close();
  }, []);

  const handleAssetSelect = (ids: string[]) => {
    if (typeof window === 'undefined') return;
    
    // Broadcast to main window
    const channel = new BroadcastChannel('asset-list-sync');
    channel.postMessage({ type: 'ASSETS_SELECT', assetIds: ids });
    channel.close();
  };

  const handlePopIn = () => {
    if (typeof window === 'undefined') return;
    
    // Send pop-in message to main window
    const channel = new BroadcastChannel('asset-list-sync');
    channel.postMessage({ type: 'MAP_POP_IN' });
    channel.close();
    
    // Close this tab
    window.close();
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <CoreVisionLogo height={28} />
        <Button
          variant="outline"
          size="sm"
          onClick={handlePopIn}
          className="h-8 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to main view
        </Button>
      </div>
      <div className="flex-1">
        <MapPanel
          assets={assets}
          selectedAssetIds={selectedAssetIds}
          filteredAssetIds={assets.map(a => a.id)}
          onAssetSelect={handleAssetSelect}
          filters={[]}
        />
      </div>
    </div>
  );
}

export default function MapPopoutPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-neutral-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-neutral-600">Loading map...</p>
        </div>
      </div>
    }>
      <MapPopoutContent />
    </Suspense>
  );
}

