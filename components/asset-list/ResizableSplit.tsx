'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ResizableSplitProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultRatio: number; // 40 = 40% map, 60% table
  minLeftWidth: number;
  minRightWidth: number;
  onRatioChange: (ratio: number) => void;
}

export default function ResizableSplit({
  leftPanel,
  rightPanel,
  defaultRatio,
  minLeftWidth,
  minRightWidth,
  onRatioChange
}: ResizableSplitProps) {
  const [ratio, setRatio] = useState(defaultRatio);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const snapPoints = [30, 40, 50, 60, 70];
  const snapThreshold = 3; // 3% threshold

  // Calculate snap point
  const getSnappedRatio = useCallback((rawRatio: number): number => {
    for (const snapPoint of snapPoints) {
      if (Math.abs(rawRatio - snapPoint) <= snapThreshold) {
        return snapPoint;
      }
    }
    return rawRatio;
  }, [snapPoints, snapThreshold]);

  // Handle mouse down on divider
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const newLeftWidth = (e.clientX / containerWidth) * 100;

      // Constrain to min/max based on min widths
      const minLeftPercent = (minLeftWidth / containerWidth) * 100;
      const minRightPercent = (minRightWidth / containerWidth) * 100;
      const maxLeftPercent = 100 - minRightPercent;

      const constrainedWidth = Math.max(minLeftPercent, Math.min(maxLeftPercent, newLeftWidth));
      const snappedRatio = getSnappedRatio(constrainedWidth);
      setRatio(snappedRatio);
      onRatioChange(snappedRatio);
    },
    [isDragging, minLeftWidth, minRightWidth, getSnappedRatio, onRatioChange]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Ignore if typing in input
      }

      if (e.key === '[') {
        // Increase map width by 10%
        const newRatio = Math.min(70, ratio + 10);
        setRatio(newRatio);
        onRatioChange(newRatio);
      } else if (e.key === ']') {
        // Increase table width by 10%
        const newRatio = Math.max(30, ratio - 10);
        setRatio(newRatio);
        onRatioChange(newRatio);
      } else if (e.key === '\\') {
        // Reset to default
        setRatio(defaultRatio);
        onRatioChange(defaultRatio);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ratio, defaultRatio, onRatioChange]);

  // Add mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex h-full relative">
      {/* Left Panel */}
      <div
        className="h-full overflow-hidden transition-all duration-200"
        style={{ width: rightPanel ? `${ratio}%` : '100%' }}
      >
        {leftPanel}
      </div>

      {/* Divider - only show if rightPanel exists */}
      {rightPanel && (
        <div
          className={cn(
            'relative flex items-center justify-center cursor-col-resize group',
            'w-1.5 bg-neutral-300 hover:bg-orange-400 transition-colors',
            isDragging && 'bg-orange-500 w-2'
          )}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-0" />
        </div>
      )}

      {/* Right Panel */}
      {rightPanel && (
        <div
          className="h-full overflow-hidden transition-all duration-200"
          style={{ width: `${100 - ratio}%` }}
        >
          {rightPanel}
        </div>
      )}
    </div>
  );
}
