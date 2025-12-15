'use client';

import { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Asset } from '@/lib/types/asset-list';

// Snapshot data interface
export interface SnapshotData {
  id: string;
  distance: number; // in feet
  code: string; // PACP/NASSCO code
  codeDescription?: string; // Full name of code
  grade: 0 | 1 | 2 | 3 | 4 | 5;
  thumbnailUrl: string;
  inspectionId: string;
}

interface SnapshotsPanelProps {
  asset: Asset | null;
  onClose: () => void;
  onSnapshotClick: (snapshotId: string) => void;
}

// Mock snapshots data generator
function generateMockSnapshots(asset: Asset): SnapshotData[] {
  if (!asset.latestInspection) return [];
  
  const snapshots: SnapshotData[] = [];
  const codes = ['TBD', 'CRK', 'ROOT', 'SAGG', 'DEP'];
  const codeDescriptions: Record<string, string> = {
    'TBD': 'To Be Determined',
    'CRK': 'Crack',
    'ROOT': 'Root Intrusion',
    'SAGG': 'Sagging',
    'DEP': 'Depression'
  };
  
  // Generate snapshots based on observationCount
  for (let i = 0; i < asset.observationCount; i++) {
    const distance = (i + 1) * 12; // 12', 24', 36', etc.
    const code = codes[i % codes.length];
    const grade = Math.min(5, Math.max(0, Math.floor(Math.random() * 6))) as 0 | 1 | 2 | 3 | 4 | 5;
    
    snapshots.push({
      id: `snapshot-${asset.id}-${i}`,
      distance,
      code,
      codeDescription: codeDescriptions[code],
      grade,
      thumbnailUrl: `https://via.placeholder.com/120x90?text=${code}+${distance}'`,
      inspectionId: asset.latestInspection.id
    });
  }
  
  return snapshots;
}

export default function SnapshotsPanel({
  asset,
  onClose,
  onSnapshotClick
}: SnapshotsPanelProps) {
  const [visibleGrades, setVisibleGrades] = useState<number[]>([0, 1, 2, 3, 4, 5]);

  if (!asset) return null;

  const snapshots = generateMockSnapshots(asset);
  const filteredSnapshots = snapshots.filter(s => visibleGrades.includes(s.grade));

  const toggleGrade = (grade: number) => {
    setVisibleGrades(prev =>
      prev.includes(grade)
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    );
  };

  const getGradeColor = (grade: number): string => {
    if (grade <= 1) return 'bg-green-500';
    if (grade === 2) return 'bg-yellow-500';
    if (grade === 3) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div 
      className="w-full bg-white border-t border-neutral-200 shadow-lg"
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center justify-between bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
          <h3 className="text-sm font-semibold text-neutral-900">
            {asset.pipeSegment || asset.id}
          </h3>
          {asset.latestInspection && (
            <span className="text-xs text-neutral-500">
              • {filteredSnapshots.length} snapshot{filteredSnapshots.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-neutral-100"
          onClick={onClose}
          aria-label="Close snapshots panel"
        >
          <X className="h-4 w-4 text-neutral-500" />
        </Button>
      </div>

      {/* Visible Grades Filter */}
      <div className="px-4 py-2.5 bg-neutral-50/50 border-b border-neutral-200">
        <Label className="text-xs font-medium text-neutral-700 mb-1.5 block">
          Visible Grades:
        </Label>
        <div className="flex items-center gap-2.5 flex-wrap">
          {[0, 1, 2, 3, 4, 5].map(grade => (
            <label
              key={grade}
              htmlFor={`grade-${grade}`}
              className="flex items-center gap-1.5 cursor-pointer group"
            >
              <Checkbox
                id={`grade-${grade}`}
                checked={visibleGrades.includes(grade)}
                onCheckedChange={() => toggleGrade(grade)}
                className="h-3.5 w-3.5"
              />
              <span className="text-xs text-neutral-700 group-hover:text-neutral-900 flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${getGradeColor(grade)} shadow-sm`} />
                {grade === 0 ? '0-1' : grade.toString()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Snapshots Grid */}
      <div className="px-4 py-3 bg-white">
        {filteredSnapshots.length === 0 ? (
          <div className="text-center py-6 text-sm text-neutral-500">
            No snapshots match the selected grades
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {filteredSnapshots.map(snapshot => (
              <div
                key={snapshot.id}
                className="flex-shrink-0 w-[130px] cursor-pointer group"
                onClick={() => onSnapshotClick(snapshot.id)}
              >
                <div className="bg-white rounded-lg overflow-hidden border-2 border-neutral-200 group-hover:border-orange-500 group-hover:shadow-md transition-all duration-200">
                  {/* Thumbnail */}
                  <div className="relative w-full h-[100px] bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-neutral-400" />
                    <div className="absolute top-2 right-2">
                      <span className={`w-3 h-3 rounded-full ${getGradeColor(snapshot.grade)} block shadow-sm border border-white/50`} />
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-colors" />
                  </div>
                  
                  {/* Info */}
                  <div className="p-2.5 space-y-1 bg-white">
                    <div className="text-xs font-semibold text-neutral-900 flex items-center gap-1">
                      <span>{snapshot.distance}'</span>
                    </div>
                    <div className="text-xs font-medium text-neutral-700">
                      {snapshot.code}
                    </div>
                    {snapshot.codeDescription && (
                      <div className="text-xs text-neutral-500 truncate leading-tight">
                        {snapshot.codeDescription}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


