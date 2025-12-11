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
    <div className="w-full bg-white border-b border-neutral-200 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-neutral-900">
            {asset.pipeSegment || asset.id}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
          aria-label="Close snapshots panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Visible Grades Filter */}
      <div className="px-4 py-3 border-b border-neutral-200">
        <Label className="text-xs font-medium text-neutral-600 mb-2 block">
          Visible Grades:
        </Label>
        <div className="flex items-center gap-3">
          {[0, 1, 2, 3, 4, 5].map(grade => (
            <div key={grade} className="flex items-center gap-1.5">
              <Checkbox
                id={`grade-${grade}`}
                checked={visibleGrades.includes(grade)}
                onCheckedChange={() => toggleGrade(grade)}
              />
              <Label
                htmlFor={`grade-${grade}`}
                className="text-xs cursor-pointer flex items-center gap-1"
              >
                <span className={`w-2 h-2 rounded-full ${getGradeColor(grade)}`} />
                {grade === 0 ? '0-1' : grade.toString()}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Snapshots Grid */}
      <div className="px-4 py-3">
        {filteredSnapshots.length === 0 ? (
          <div className="text-center py-8 text-sm text-neutral-500">
            No snapshots match the selected grades
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {filteredSnapshots.map(snapshot => (
              <div
                key={snapshot.id}
                className="flex-shrink-0 w-[120px] cursor-pointer group"
                onClick={() => onSnapshotClick(snapshot.id)}
              >
                <div className="bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 group-hover:border-orange-500 transition-colors">
                  {/* Thumbnail */}
                  <div className="relative w-full h-[90px] bg-neutral-200 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-neutral-400" />
                    <div className="absolute top-1 right-1">
                      <span className={`w-2 h-2 rounded-full ${getGradeColor(snapshot.grade)} block`} />
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-2 space-y-1">
                    <div className="text-xs font-medium text-neutral-900">
                      {snapshot.distance}'
                    </div>
                    <div className="text-xs text-neutral-600">
                      {snapshot.code}
                    </div>
                    {snapshot.codeDescription && (
                      <div className="text-xs text-neutral-500 truncate">
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
