'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import DataTable from '@/components/asset-list/DataTable';
import Pagination from '@/components/asset-list/Pagination';
import type { Asset, ColumnDef } from '@/lib/types/asset-list';

function TablePopoutContent() {
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [columns, setColumns] = useState<ColumnDef[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const channel = new BroadcastChannel('asset-list-sync');
    
    channel.onmessage = (event) => {
      if (event.data.type === 'ASSETS_UPDATE') {
        setAssets(event.data.assets);
      }
      if (event.data.type === 'COLUMNS_UPDATE') {
        setColumns(event.data.columns);
      }
    };

    return () => channel.close();
  }, []);

  const handleRowClick = (asset: Asset) => {
    if (typeof window === 'undefined') return;
    
    // Open detail view in main window
    const channel = new BroadcastChannel('asset-list-sync');
    channel.postMessage({ type: 'OPEN_DETAIL', assetId: asset.id });
    channel.close();
  };

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssets = assets.slice(startIndex, endIndex);
  const totalPages = Math.ceil(assets.length / itemsPerPage);

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="bg-neutral-800 text-white px-4 py-2 flex items-center justify-between">
        <h1 className="text-sm font-semibold">Core Vision - Data Table</h1>
        <button 
          onClick={() => window.close()}
          className="text-neutral-400 hover:text-white text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <DataTable
          data={paginatedAssets}
          columns={columns}
          selectedRows={[]}
          onRowSelect={() => {}}
          onRowClick={handleRowClick}
          onSort={() => {}}
          onColumnReorder={() => {}}
        />
      </div>
      <div className="border-t border-neutral-200">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={assets.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </div>
  );
}

export default function TablePopoutPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-neutral-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-neutral-600">Loading table...</p>
        </div>
      </div>
    }>
      <TablePopoutContent />
    </Suspense>
  );
}

