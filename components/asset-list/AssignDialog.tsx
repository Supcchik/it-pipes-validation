'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface AssignDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (assigneeId: string, notify: boolean) => void;
  selectedCount: number;
}

// Mock team members - replace with API call
const TEAM_MEMBERS = [
  { id: 'user-1', name: 'John Smith', role: 'Inspector' },
  { id: 'user-2', name: 'Jane Doe', role: 'Senior Inspector' },
  { id: 'user-3', name: 'Bob Johnson', role: 'Inspector' },
  { id: 'user-4', name: 'Alice Williams', role: 'Team Lead' },
];

export default function AssignDialog({
  open,
  onClose,
  onConfirm,
  selectedCount
}: AssignDialogProps) {
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [notify, setNotify] = useState(true);

  const handleConfirm = () => {
    if (!assigneeId) {
      alert('Please select an assignee');
      return;
    }
    onConfirm(assigneeId, notify);
    // Reset state
    setAssigneeId('');
    setNotify(true);
  };

  const handleClose = () => {
    setAssigneeId('');
    setNotify(true);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Inspections</DialogTitle>
          <DialogDescription>
            Assign {selectedCount} {selectedCount === 1 ? 'inspection' : 'inspections'} to a team member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Assignee Selector */}
          <div className="space-y-2">
            <Label htmlFor="assignee">Assign to</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger id="assignee">
                <SelectValue placeholder="Select team member..." />
              </SelectTrigger>
              <SelectContent>
                {TEAM_MEMBERS.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-neutral-500">{member.role}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notify Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="notify" 
              checked={notify}
              onCheckedChange={(checked) => setNotify(checked as boolean)}
            />
            <Label 
              htmlFor="notify"
              className="text-sm font-normal cursor-pointer"
            >
              Send email notification to assignee
            </Label>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              The selected inspections will be reassigned and the previous assignee will be notified.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!assigneeId}>
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

