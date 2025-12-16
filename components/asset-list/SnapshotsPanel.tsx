'use client';

import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, ChevronDown, ArrowRight, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select';
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
  selectedAssets?: Asset[]; // For multiple selection
  onClose: () => void;
  onSnapshotClick: (snapshotId: string) => void;
  highlightedSnapshotId?: string | null;
  onAssign?: (userId: string) => void;
  onViewInspection?: () => void;
  onClearSelection?: () => void;
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
  selectedAssets = [],
  onClose,
  onSnapshotClick,
  highlightedSnapshotId,
  onAssign,
  onViewInspection,
  onClearSelection
}: SnapshotsPanelProps) {
  const [visibleGrades, setVisibleGrades] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(false);
  const [assignedUser, setAssignedUser] = useState<{ id: string; name: string } | null>(null);

  const isMultipleSelection = selectedAssets.length > 1 || (selectedAssets.length === 0 && !asset);
  const displayAssets = isMultipleSelection ? selectedAssets : (asset ? [asset] : []);

  // Mock users list
  const users = [
    { id: 'user1', name: 'John Smith' },
    { id: 'user2', name: 'Mary Johnson' },
    { id: 'user3', name: 'Bob Wilson' },
  ];

  // Close panel on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (asset || selectedAssets.length > 0)) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [asset, selectedAssets.length, onClose]);

  if (!asset && selectedAssets.length === 0) return null;

  const snapshots = asset ? generateMockSnapshots(asset) : [];
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

  const handleAssign = (userId: string | null) => {
    if (userId === null || userId === 'unassign') {
      // Unassign
      setAssignedUser(null);
      if (onAssign) {
        onAssign(''); // Empty string for unassign
      }
    } else {
      const user = users.find(u => u.id === userId);
      if (user) {
        setAssignedUser(user);
        if (onAssign) {
          onAssign(userId);
        }
      }
    }
    setAssignDropdownOpen(false);
  };

  const getAssignButtonText = () => {
    if (assignedUser) {
      return `Assigned to ${assignedUser.name}`;
    }
    return 'Unassigned';
  };

  return (
    <div 
      className="w-full bg-white border-t border-neutral-200 shadow-lg transform transition-transform duration-300 ease-out flex flex-col"
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      {/* Drag Handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 bg-neutral-300 rounded-full" />
      </div>

      {/* Header */}
      <div className="px-4 h-12 flex items-center justify-between border-b border-neutral-200 shrink-0">
        <h3 className="text-base font-semibold text-neutral-900">
          {isMultipleSelection 
            ? `${selectedAssets.length} selected`
            : (asset?.pipeSegment || asset?.id || 'Selected')}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-neutral-100"
          onClick={onClose}
          aria-label="Close snapshots panel"
        >
          <X className="h-4 w-4 text-neutral-500" />
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {isMultipleSelection ? (
          /* Multiple Selection: List of IDs */
          <div className="px-4 py-3 max-h-[150px] overflow-y-auto">
            <div className="space-y-1">
              {displayAssets.map((a) => (
                <div key={a.id} className="text-sm text-neutral-700 py-1">
                  • {a.pipeSegment || a.id}
                </div>
              ))}
            </div>
          </div>
        ) : asset ? (
          /* Single Selection: Snapshots */
          <>
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
                  {filteredSnapshots.map(snapshot => {
                    const isHighlighted = highlightedSnapshotId === snapshot.id;
                    return (
                    <div
                      key={snapshot.id}
                      data-snapshot-id={snapshot.id}
                      className="flex-shrink-0 w-[120px] cursor-pointer group"
                      onClick={() => onSnapshotClick(snapshot.id)}
                    >
                      <div className={`bg-white rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        isHighlighted 
                          ? 'border-orange-500 shadow-lg ring-2 ring-orange-300' 
                          : 'border-neutral-200 group-hover:border-orange-500 group-hover:shadow-md'
                      }`}>
                        {/* Thumbnail */}
                        <div className="relative w-full h-[120px] bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
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
                  );
                  })}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {/* Actions Bar */}
      <div className="px-4 py-3 border-t border-neutral-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          {/* Assign Button */}
          <div className="relative flex-1">
            <Select 
              open={assignDropdownOpen} 
              onOpenChange={setAssignDropdownOpen}
              value={assignedUser?.id || 'unassigned'}
              onValueChange={(value) => {
                if (value === 'unassign') {
                  handleAssign(null);
                } else {
                  handleAssign(value);
                }
              }}
            >
              <SelectTrigger className="h-11 bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-300">
                <SelectValue>
                  {getAssignButtonText()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-full">
                <div className="px-2 py-1.5 text-xs font-semibold text-neutral-500">
                  Assign {isMultipleSelection ? selectedAssets.length : 1} to:
                </div>
                {assignedUser && (
                  <>
                    <SelectItem value="unassign">
                      <span className="text-neutral-500">Unassign</span>
                    </SelectItem>
                    <SelectSeparator />
                  </>
                )}
                {users.map(user => (
                  <SelectItem 
                    key={user.id} 
                    value={user.id}
                  >
                    👤 {user.name}
                  </SelectItem>
                ))}
                <SelectSeparator />
                <SelectItem value="create" onSelect={() => {
                  console.log('Create work order');
                  setAssignDropdownOpen(false);
                }}>
                  <div className="flex items-center gap-2">
                    <span>+</span>
                    <span>Create Work Order</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View/Clear Button */}
          {isMultipleSelection ? (
            <Button
              variant="outline"
              className="h-11 px-4 border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
              onClick={onClearSelection}
            >
              Clear Selection
            </Button>
          ) : (
            <Button
              variant="outline"
              className="h-11 px-4 border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
              onClick={onViewInspection}
            >
              <span className="flex items-center gap-2">
                <span>View Inspection</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}



