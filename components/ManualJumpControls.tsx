'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ManualJumpControlsProps {
  onJumpBackward: () => void;
  onJumpForward: () => void;
  disabled?: boolean;
}

export function ManualJumpControls({
  onJumpBackward,
  onJumpForward,
  disabled = false,
}: ManualJumpControlsProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
      <span className="text-sm text-gray-600 mr-2">Manual navigation:</span>
      <Button
        variant="outline"
        size="sm"
        onClick={onJumpBackward}
        disabled={disabled}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        -5s
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onJumpForward}
        disabled={disabled}
        className="flex items-center gap-1"
      >
        +5s
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}



