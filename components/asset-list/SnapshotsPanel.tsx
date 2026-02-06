'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select';
import type { Asset, AssetType } from '@/lib/types/asset-list';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

// Snapshot data interface
export interface SnapshotData {
  id: string;
  distance: number; // in feet
  code: string; // PACP/NASSCO code
  codeDescription?: string; // Full name of code
  grade: 0 | 1 | 2 | 3 | 4 | 5;
  thumbnailUrl: string;
  inspectionId: string;
  assetId?: string; // Asset ID for multi-select
  assetName?: string; // Asset name/pipeSegment for multi-select
  inspectionDate?: string; // Inspection date for display
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
  assetType?: AssetType; // Active asset type (ML, MH, or L)
}

// Distance as feet+inches string (e.g. 8'11", 27'2")
function formatDistance(feet: number): string {
  const f = Math.floor(feet);
  const inches = Math.round((feet - f) * 12);
  return inches > 0 ? `${f}'${inches}"` : `${f}'`;
}

// Mock snapshots data generator (Figma-style: OBR, BSV, distances 8'11", 27'2", 45'8", etc.)
function generateMockSnapshots(asset: Asset): SnapshotData[] {
  if (!asset.latestInspection) return [];
  const snapshots: SnapshotData[] = [];
  const codes = ['OBR', 'BSV', 'OBR', 'CRK'];
  const codeDescriptions: Record<string, string> = {
    OBR: 'Broken Pipe',
    BSV: 'Displaced Joint',
    CRK: 'Crack',
    TBD: 'To Be Determined',
    ROOT: 'Root Intrusion',
    SAGG: 'Sagging',
    DEP: 'Depression',
  };
  const distances = [8 + 11 / 12, 27 + 2 / 12, 45 + 8 / 12];
  const observationCount = Math.max(asset.observationCount ?? 3, 3);
  for (let i = 0; i < observationCount; i++) {
    const distance = distances[i % distances.length] || (i + 1) * 12;
    const code = codes[i % codes.length];
    const grade = (i % 3 === 0 ? 2 : i % 3 === 1 ? 3 : 2) as 0 | 1 | 2 | 3 | 4 | 5;
    snapshots.push({
      id: `snapshot-${asset.id}-${i}`,
      distance,
      code,
      codeDescription: codeDescriptions[code] || code,
      grade,
      thumbnailUrl: 'https://placehold.co/160x90',
      inspectionId: asset.latestInspection.id,
    });
  }
  return snapshots;
}

const GRADE_COLORS: Record<number, { bg: string; text: string }> = {
  0: { bg: 'bg-[#16A34A]', text: 'text-[#BBF7D0]' },
  1: { bg: 'bg-[#16A34A]', text: 'text-[#BBF7D0]' },
  2: { bg: 'bg-[#FCD34D]', text: 'text-[#B45309]' },
  3: { bg: 'bg-[#FCD34D]', text: 'text-[#B45309]' },
  4: { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' },
  5: { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' },
};

const CODE_PILL_BG: Record<string, string> = {
  OBR: 'bg-[#BFDBFE]',
  BSV: 'bg-[#FED7AA]',
  default: 'bg-[#8CBAF4]',
};

export default function SnapshotsPanel({
  asset,
  selectedAssets = [],
  onClose,
  onSnapshotClick,
  highlightedSnapshotId,
  onAssign,
  onViewInspection,
  onClearSelection,
  assetType = 'ML',
}: SnapshotsPanelProps) {
  const [gradeMin, setGradeMin] = useState(1);
  const [gradeMax, setGradeMax] = useState(3);
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(false);
  const [assignedUser, setAssignedUser] = useState<{ id: string; name: string } | null>(null);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<'min' | 'max' | null>(null);

  const isMultipleSelection = selectedAssets.length > 1 || (selectedAssets.length === 0 && !asset);
  const users = [
    { id: 'user1', name: 'John Smith' },
    { id: 'user2', name: 'Mary Johnson' },
    { id: 'user3', name: 'Bob Wilson' },
  ];

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (asset || selectedAssets.length > 0)) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [asset, selectedAssets.length, onClose]);

  // Завершити перетягування слайдера при pointerup/pointercancel поза елементом
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      draggingRef.current = null;
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, []);

  if (!asset && selectedAssets.length === 0) return null;

  const showSnapshots = assetType === 'ML' || assetType === 'L';
  const showDetails = assetType === 'MH';

  let allSnapshots: SnapshotData[] = [];
  if (showSnapshots) {
    if (isMultipleSelection && selectedAssets.length > 0) {
      selectedAssets.forEach((selectedAsset) => {
        const assetSnapshots = generateMockSnapshots(selectedAsset);
        const snapshotsWithAssetInfo = assetSnapshots.map((s) => ({
          ...s,
          assetId: selectedAsset.id,
          assetName: selectedAsset.pipeSegment || selectedAsset.lateralId || selectedAsset.id,
          inspectionDate: selectedAsset.latestInspection?.date || undefined,
        }));
        allSnapshots = [...allSnapshots, ...snapshotsWithAssetInfo];
      });
    } else if (asset) {
      allSnapshots = generateMockSnapshots(asset);
    }
  }

  const filteredSnapshots = allSnapshots.filter((s) => s.grade >= gradeMin && s.grade <= gradeMax);

  const positionToGrade = useCallback((clientX: number): number => {
    const el = sliderTrackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const p = (clientX - rect.left) / rect.width;
    const raw = p * 5;
    return Math.max(0, Math.min(5, Math.round(raw)));
  }, []);

  const handlePointerDown = (thumb: 'min' | 'max', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = thumb;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggingRef.current === null) return;
      const el = sliderTrackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const p = (e.clientX - rect.left) / rect.width;
      const g = Math.max(0, Math.min(5, Math.round(p * 5)));
      if (draggingRef.current === 'min') {
        setGradeMin((prev) => {
          const next = Math.min(gradeMax, g);
          return next !== prev ? next : prev;
        });
      } else {
        setGradeMax((prev) => {
          const next = Math.max(gradeMin, g);
          return next !== prev ? next : prev;
        });
      }
    },
    [gradeMin, gradeMax]
  );
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (draggingRef.current !== null) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
    draggingRef.current = null;
  }, []);

  const handleAssign = (userId: string | null) => {
    if (userId === null || userId === 'unassign') {
      setAssignedUser(null);
      onAssign?.('');
    } else {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setAssignedUser(user);
        onAssign?.(userId);
      }
    }
    setAssignDropdownOpen(false);
  };

  const getAssignButtonText = () => (assignedUser ? `Assigned to ${assignedUser.name}` : 'Unassigned');

  const title = isMultipleSelection
    ? `${selectedAssets.length} selected`
    : (asset?.pipeSegment || asset?.lateralId || asset?.manholeId || asset?.id || 'Selected');

  return (
    <div
      className="flex h-full max-h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_6px_29px_rgba(100,100,111,0.20)]"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#E4E4E7] bg-white px-4 py-2">
        <h3 className="text-[#18181B] text-2xl font-semibold leading-10">{title}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4 text-[#312C29]" />
        </Button>
      </div>

      {(isMultipleSelection || asset) && showSnapshots ? (
        <>
          {/* Scrollable middle: Visual Grade + Snapshots */}
          <div className="min-h-0 flex-1 overflow-auto">
          {/* Visual Grade */}
          <div className="flex shrink-0 items-center justify-center gap-2.5 border-b border-[#E4E4E7] bg-white px-4 py-2">
            <div className="flex flex-1 flex-col gap-2">
              <span className="text-[#3F3F46] text-sm font-semibold leading-5">Visual Grade</span>
              <div className="relative flex flex-col gap-0.5">
                <div
                  ref={sliderTrackRef}
                  className="relative h-2 w-full overflow-visible rounded-full bg-[#F4F4F5]"
                >
                  <div className="flex h-full w-full items-center justify-between px-0.5">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#D4D4D8]" />
                    ))}
                  </div>
                  <div
                    className="absolute top-0 h-2 rounded-full bg-[#E86F25]"
                    style={{
                      left: `${(gradeMin / 5) * 100}%`,
                      width: `${Math.max(0, (gradeMax - gradeMin) / 5) * 100}%`,
                    }}
                  />
                  <div
                    role="slider"
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-valuenow={gradeMin}
                    tabIndex={0}
                    className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 cursor-grab rounded-full border-2 border-[#E86F25] bg-white touch-none select-none active:cursor-grabbing"
                    style={{ left: `${(gradeMin / 5) * 100}%` }}
                    onPointerDown={(e) => handlePointerDown('min', e)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  />
                  <div
                    role="slider"
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-valuenow={gradeMax}
                    tabIndex={0}
                    className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 cursor-grab rounded-full border-2 border-[#E86F25] bg-white touch-none select-none active:cursor-grabbing"
                    style={{ left: `${(gradeMax / 5) * 100}%` }}
                    onPointerDown={(e) => handlePointerDown('max', e)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  />
                </div>
                <div className="flex w-full justify-between text-[#71717A] text-xs font-medium leading-4">
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Snapshots row */}
          <div className="flex flex-col border-b border-[#E4E4E7] bg-white px-4 py-2">
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {filteredSnapshots.length === 0 ? (
                <p className="py-4 text-center text-sm text-[#71717A]">No snapshots in this grade range</p>
              ) : (
                filteredSnapshots.map((snapshot) => {
                  const isHighlighted = highlightedSnapshotId === snapshot.id;
                  const gradeStyle = GRADE_COLORS[snapshot.grade] ?? GRADE_COLORS[2];
                  const codeBg = CODE_PILL_BG[snapshot.code] ?? CODE_PILL_BG.default;
                  return (
                    <div
                      key={snapshot.id}
                      data-snapshot-id={snapshot.id}
                      onClick={() => onSnapshotClick(snapshot.id)}
                      className={cn(
                        'flex shrink-0 flex-col overflow-hidden rounded-lg border bg-white',
                        isHighlighted ? 'border-[#E86F25] ring-2 ring-[#E86F25]/30' : 'border-[#E4E4E7]'
                      )}
                    >
                      <div className="relative h-[90px] w-[160px] shrink-0 bg-[#F4F4F5]">
                        <img src={snapshot.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                        <span
                          className={cn(
                            'absolute right-1 top-1 flex h-[22px] items-center justify-center rounded-lg px-3 text-xs font-medium',
                            gradeStyle.bg,
                            gradeStyle.text
                          )}
                        >
                          {snapshot.grade}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-right text-[#09090B] text-xs font-medium leading-4">
                            {formatDistance(snapshot.distance)}
                          </span>
                          <span className={cn('rounded-lg px-3 py-0.5 text-xs font-medium text-[#18181B]', codeBg)}>
                            {snapshot.code}
                          </span>
                        </div>
                        <span className="text-right text-[#3F3F46] text-xs font-normal leading-4">
                          {snapshot.codeDescription}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex justify-center border-t border-[#E4E4E7] bg-white px-2 py-1">
              <div className="h-2 w-[120px] rounded-[26px] bg-[#E1E1E1]" />
            </div>
          </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-end justify-between gap-2 border-t border-[#E4E4E7] bg-white px-4 pb-6 pt-4">
            <Select
              open={assignDropdownOpen}
              onOpenChange={setAssignDropdownOpen}
              value={assignedUser?.id ?? 'unassigned'}
              onValueChange={(v) => (v === 'unassign' ? handleAssign(null) : handleAssign(v))}
            >
              <SelectTrigger className="h-10 w-auto min-w-0 rounded-lg border-[#E4E4E7] bg-white px-4 text-[#312C29] text-sm font-medium">
                <SelectValue>{getAssignButtonText()}</SelectValue>
                <ChevronDown className="ml-1 h-4 w-4 text-[#09090B]" />
              </SelectTrigger>
              <SelectContent>
                {assignedUser && (
                  <>
                    <SelectItem value="unassign">Unassign</SelectItem>
                    <SelectSeparator />
                  </>
                )}
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isMultipleSelection ? (
              <Button variant="outline" className="h-10 rounded-lg border-[#E4E4E7] text-[#312C29] text-sm font-medium" onClick={onClearSelection}>
                Clear selection
              </Button>
            ) : (
              <Button variant="outline" className="h-10 rounded-lg border-[#E4E4E7] text-[#312C29] text-sm font-medium" onClick={onViewInspection}>
                View inspection
              </Button>
            )}
          </div>
        </>
      ) : showDetails ? (
        <>
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-white">
              {isMultipleSelection ? (
                /* Multi-select: Show details for all selected manholes */
                <div className="space-y-4">
                  {selectedAssets.map(selectedAsset => (
                    <div key={selectedAsset.id} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                      <h4 className="text-sm font-semibold text-neutral-900 mb-3">
                        {selectedAsset.manholeId || selectedAsset.id}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-neutral-500">Depth</Label>
                          <div className="text-sm font-medium text-neutral-900">
                            {selectedAsset.depth ? `${selectedAsset.depth} ft` : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-neutral-500">Cover Type</Label>
                          <div className="text-sm font-medium text-neutral-900">
                            {selectedAsset.coverType || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-neutral-500">Frame Type</Label>
                          <div className="text-sm font-medium text-neutral-900">
                            {selectedAsset.frameType || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-neutral-500">Condition</Label>
                          <div className="text-sm font-medium text-neutral-900">
                            {selectedAsset.condition || 'N/A'}
                          </div>
                        </div>
                        {selectedAsset.latestInspection && (
                          <>
                            <div>
                              <Label className="text-xs text-neutral-500">Inspection Date</Label>
                              <div className="text-sm font-medium text-neutral-900">
                                {selectedAsset.latestInspection.date}
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-neutral-500">Certificate</Label>
                              <div className="text-sm font-medium text-neutral-900">
                                {selectedAsset.latestInspection.certificateNumber}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : asset ? (
                /* Single-select: Show details for one manhole */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-neutral-500">Depth</Label>
                      <div className="text-sm font-medium text-neutral-900 mt-1">
                        {asset.depth ? `${asset.depth} ft` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-neutral-500">Cover Type</Label>
                      <div className="text-sm font-medium text-neutral-900 mt-1">
                        {asset.coverType || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-neutral-500">Frame Type</Label>
                      <div className="text-sm font-medium text-neutral-900 mt-1">
                        {asset.frameType || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-neutral-500">Condition</Label>
                      <div className="text-sm font-medium text-neutral-900 mt-1">
                        {asset.condition || 'N/A'}
                      </div>
                    </div>
                    {asset.street && (
                      <div>
                        <Label className="text-xs text-neutral-500">Street</Label>
                        <div className="text-sm font-medium text-neutral-900 mt-1">
                          {asset.street}
                        </div>
                      </div>
                    )}
                    {asset.city && (
                      <div>
                        <Label className="text-xs text-neutral-500">City</Label>
                        <div className="text-sm font-medium text-neutral-900 mt-1">
                          {asset.city}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {asset.latestInspection && (
                    <div className="pt-4 border-t border-neutral-200">
                      <h4 className="text-sm font-semibold text-neutral-900 mb-3">Latest Inspection</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-neutral-500">Date</Label>
                          <div className="text-sm font-medium text-neutral-900 mt-1">
                            {asset.latestInspection.date}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-neutral-500">Certificate Number</Label>
                          <div className="text-sm font-medium text-neutral-900 mt-1">
                            {asset.latestInspection.certificateNumber}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-neutral-500">Purpose</Label>
                          <div className="text-sm font-medium text-neutral-900 mt-1">
                            {asset.latestInspection.purpose}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-neutral-500">Surveyed By</Label>
                          <div className="text-sm font-medium text-neutral-900 mt-1">
                            {asset.latestInspection.surveyedBy}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          {/* MH Footer */}
          <div className="flex shrink-0 items-end justify-between gap-2 border-t border-[#E4E4E7] bg-white px-4 pb-6 pt-4">
            <Select
              open={assignDropdownOpen}
              onOpenChange={setAssignDropdownOpen}
              value={assignedUser?.id ?? 'unassigned'}
              onValueChange={(v) => (v === 'unassign' ? handleAssign(null) : handleAssign(v))}
            >
              <SelectTrigger className="h-10 w-auto min-w-0 rounded-lg border-[#E4E4E7] bg-white px-4 text-[#312C29] text-sm font-medium">
                <SelectValue>{getAssignButtonText()}</SelectValue>
                <ChevronDown className="ml-1 h-4 w-4 text-[#09090B]" />
              </SelectTrigger>
              <SelectContent>
                {assignedUser && (
                  <>
                    <SelectItem value="unassign">Unassign</SelectItem>
                    <SelectSeparator />
                  </>
                )}
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isMultipleSelection ? (
              <Button variant="outline" className="h-10 rounded-lg border-[#E4E4E7] text-[#312C29] text-sm font-medium" onClick={onClearSelection}>
                Clear selection
              </Button>
            ) : (
              <Button variant="outline" className="h-10 rounded-lg border-[#E4E4E7] text-[#312C29] text-sm font-medium" onClick={onViewInspection}>
                View inspection
              </Button>
            )}
          </div>
        </>
          ) : null}
    </div>
  );
}



