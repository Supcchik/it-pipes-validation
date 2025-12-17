'use client';

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

interface RemoveFilterConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  filterType: 'group' | 'advanced';
  filterName?: string;
}

export default function RemoveFilterConfirmDialog({
  open,
  onClose,
  onConfirm,
  filterType,
  filterName,
}: RemoveFilterConfirmDialogProps) {
  const isGroup = filterType === 'group';
  const title = isGroup ? 'Remove Filter Set' : 'Remove Advanced Filter';
  const description = isGroup
    ? `Are you sure you want to remove "${filterName || 'this filter set'}"?`
    : 'Are you sure you want to remove the advanced filter?';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-2">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-900">
              {isGroup
                ? 'This filter set will be removed from the view. You can always recreate it later.'
                : 'The advanced filter will be removed from the view. You can always recreate it later.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


