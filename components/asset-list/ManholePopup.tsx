'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Manhole } from '@/lib/mock-data/mockMapData';

interface ManholePopupProps {
  manhole: Manhole;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function ManholePopup({ manhole, position, onClose }: ManholePopupProps) {
  return (
    <div
      className="fixed bg-white rounded-lg shadow-2xl border border-neutral-200 p-4 z-50"
      style={{
        left: `${position.x + 10}px`,
        top: `${position.y + 10}px`,
        minWidth: '250px',
        maxWidth: '300px',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm">Manhole</h3>
          <p className="text-lg font-bold text-blue-600">{manhole.name}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600">Type:</span>
          <span className="font-medium capitalize">{manhole.type}</span>
        </div>
        {manhole.elevation && (
          <div className="flex justify-between">
            <span className="text-neutral-600">Elevation:</span>
            <span className="font-medium">{manhole.elevation} ft</span>
          </div>
        )}
        {manhole.material && (
          <div className="flex justify-between">
            <span className="text-neutral-600">Material:</span>
            <span className="font-medium">{manhole.material}</span>
          </div>
        )}
        {manhole.lastInspected && (
          <div className="flex justify-between">
            <span className="text-neutral-600">Last Inspected:</span>
            <span className="font-medium">{manhole.lastInspected}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-neutral-600">Coordinates:</span>
          <span className="font-medium text-xs">
            {manhole.coordinates.lat.toFixed(4)}, {manhole.coordinates.lng.toFixed(4)}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-200">
        <Button size="sm" className="w-full">
          View Details
        </Button>
      </div>
    </div>
  );
}

