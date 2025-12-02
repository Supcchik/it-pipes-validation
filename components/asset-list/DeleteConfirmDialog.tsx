'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Asset } from '@/lib/types/asset-list';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedAssets: Asset[];
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  selectedAssets
}: DeleteConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText === 'DELETE';

  const handleConfirm = () => {
    if (!isConfirmed) return;
    onConfirm();
    setConfirmText(''); // Reset for next time
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete {selectedAssets.length} Assets</DialogTitle>
              <DialogDescription>
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-900 font-medium mb-2">
              You are about to permanently delete:
            </p>
            <ul className="text-xs text-red-800 space-y-1 ml-4">
              {selectedAssets.slice(0, 5).map(asset => (
                <li key={asset.id}>• {asset.pipeSegment} - {asset.street || asset.id}</li>
              ))}
              {selectedAssets.length > 5 && (
                <li>• ... and {selectedAssets.length - 5} more</li>
              )}
            </ul>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type <strong>DELETE</strong> to confirm
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
            />
          </div>

          {/* Additional Info */}
          <p className="text-xs text-neutral-600">
            All inspection data, observations, and media associated with these assets will also be deleted.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed}
          >
            Delete Assets
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

