'use client';

import React from 'react';
import type { Observation, MatchResult } from '@/types/inspection';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MultipleMatchesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matches: MatchResult[];
  currentObservation: Observation;
  onSelect: (match: MatchResult) => void;
  onUseClosest: () => void;
}

export function MultipleMatchesModal({
  open,
  onOpenChange,
  matches,
  currentObservation,
  onSelect,
  onUseClosest,
}: MultipleMatchesModalProps) {
  // Найближчий match (вищий confidence)
  const closestMatch = matches.length > 0 ? matches[0] : null;

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 4) return 'bg-red-100 text-red-800 border-red-300';
    if (grade === 3) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Multiple matches found at ~{currentObservation.distance.toFixed(1)}ft
          </DialogTitle>
          <DialogDescription>
            Знайдено кілька спостережень з кодом &quot;{currentObservation.code}&quot; в попередній інспекції.
            Виберіть одне з них або використайте найближче.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {matches.map((match, index) => (
            <Card
              key={match.observation.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                index === 0 ? 'ring-2 ring-green-500 ring-offset-2' : ''
              }`}
              onClick={() => onSelect(match)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-lg">
                        {match.observation.code}
                      </span>
                      <span className="text-sm text-gray-600">
                        {match.observation.description}
                      </span>
                      {index === 0 && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                          Найближче
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Відстань:</span>{' '}
                        <span className="font-medium">
                          {match.observation.distance.toFixed(1)} ft
                        </span>
                        <span className="text-gray-400 ml-2">
                          (різниця: {match.distanceDiff.toFixed(2)} ft)
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-500">Впевненість:</span>{' '}
                        <span className="font-medium text-green-600">
                          {formatConfidence(match.confidence)}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-500">Grade:</span>{' '}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium border ${getGradeColor(
                            match.observation.grade
                          )}`}
                        >
                          {match.observation.grade}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-500">Час:</span>{' '}
                        <span className="font-medium">
                          {match.observation.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {closestMatch && (
            <Button onClick={onUseClosest} className="bg-green-600 hover:bg-green-700">
              Use Closest ({formatConfidence(closestMatch.confidence)})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



