'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PipeSegment } from '@/lib/mock-data/mockMapData';

interface PipeSegmentPopupProps {
  pipe: PipeSegment;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function PipeSegmentPopup({ pipe, position, onClose }: PipeSegmentPopupProps) {
  const getGradeColor = (grade?: string) => {
    switch (grade) {
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'F': return 'text-red-600';
      default: return 'text-neutral-600';
    }
  };

  return (
    <div
      className="fixed bg-white rounded-lg shadow-2xl border border-neutral-200 p-4 z-50"
      style={{
        left: `${position.x + 10}px`,
        top: `${position.y + 10}px`,
        minWidth: '280px',
        maxWidth: '320px',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm">Pipe Segment</h3>
          <p className="text-lg font-bold text-blue-600">{pipe.name}</p>
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
          <span className="text-neutral-600">Material:</span>
          <span className="font-medium">{pipe.material}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Diameter:</span>
          <span className="font-medium">{pipe.diameter} in</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Length:</span>
          <span className="font-medium">{pipe.length} ft</span>
        </div>
        {pipe.grade && (
          <div className="flex justify-between">
            <span className="text-neutral-600">Grade:</span>
            <span className={`font-bold ${getGradeColor(pipe.grade)}`}>
              {pipe.grade}
            </span>
          </div>
        )}
        {pipe.lastInspected && (
          <div className="flex justify-between">
            <span className="text-neutral-600">Last Inspected:</span>
            <span className="font-medium">{pipe.lastInspected}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-200 flex gap-2">
        <Button size="sm" className="flex-1">
          View Details
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          View Video
        </Button>
      </div>
    </div>
  );
}

