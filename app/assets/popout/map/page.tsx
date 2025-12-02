'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import MapPanel from '@/components/asset-list/MapPanel';
import type { Asset } from '@/lib/types/asset-list';

function MapPopoutContent() {
  
  // Sync state with parent window via BroadcastChannel
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Listen for updates from main window
    const channel = new BroadcastChannel('asset-list-sync');
    
    channel.onmessage = (event) => {
      if (event.data.type === 'ASSETS_UPDATE') {
        setAssets(event.data.assets);
      }
      if (event.data.type === 'ASSET_SELECT') {
        setSelectedAssetId(event.data.assetId);
      }
    };

    return () => channel.close();
  }, []);

  const handleAssetSelect = (id: string) => {
    if (typeof window === 'undefined') return;
    
    // Broadcast to main window
    const channel = new BroadcastChannel('asset-list-sync');
    channel.postMessage({ type: 'ASSET_SELECT', assetId: id });
    channel.close();
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="bg-neutral-800 text-white px-4 py-2 flex items-center justify-between">
        <h1 className="text-sm font-semibold">Core Vision - Map View</h1>
        <button 
          onClick={() => window.close()}
          className="text-neutral-400 hover:text-white text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="flex-1">
        <MapPanel
          assets={assets}
          selectedAssetId={selectedAssetId}
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

