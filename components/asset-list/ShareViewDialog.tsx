'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, User, Building2, Globe } from 'lucide-react';
import type { View } from '@/lib/types/asset-list';

export type ShareLevel = 'personal' | 'userRole' | 'specificUsers' | 'project' | 'companyWide';

interface ShareViewDialogProps {
  open: boolean;
  onClose: () => void;
  view: View;
  onShare: (shareLevel: ShareLevel, details: ShareDetails) => void;
}

export interface ShareDetails {
  userRoles?: string[];
  userIds?: string[];
  projectId?: string;
  canEdit?: boolean;
}

export default function ShareViewDialog({
  open,
  onClose,
  view,
  onShare
}: ShareViewDialogProps) {
  const [shareLevel, setShareLevel] = useState<ShareLevel>('personal');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [canEdit, setCanEdit] = useState(false);

  // Mock data
  const availableRoles = ['Field Operators', 'Office Reviewers', 'Admins', 'Managers'];
  const availableUsers = [
    { id: 'user-1', name: 'John Smith', email: 'john@example.com' },
    { id: 'user-2', name: 'Jane Doe', email: 'jane@example.com' },
    { id: 'user-3', name: 'Bob Wilson', email: 'bob@example.com' },
  ];
  const availableProjects = ['Project A', 'Project B', 'Project C'];

  const handleShare = () => {
    const details: ShareDetails = {
      canEdit
    };

    if (shareLevel === 'userRole') {
      details.userRoles = selectedRoles;
    } else if (shareLevel === 'specificUsers') {
      details.userIds = selectedUsers;
    } else if (shareLevel === 'project') {
      details.projectId = selectedProject;
    }

    onShare(shareLevel, details);
    onClose();
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share View: &quot;{view.name}&quot;</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup value={shareLevel} onValueChange={(val: ShareLevel) => setShareLevel(val)}>
            <div className="space-y-3">
              {/* Personal */}
              <label
                className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  shareLevel === 'personal'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-blue-300'
                }`}
              >
                <RadioGroupItem value="personal" id="personal" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="personal" className="font-semibold cursor-pointer flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Keep personal (only me)
                  </Label>
                  <p className="text-xs text-neutral-600 mt-1">
                    Only you can see and use this view
                  </p>
                </div>
              </label>

              {/* User Role */}
              <label
                className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  shareLevel === 'userRole'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-blue-300'
                }`}
              >
                <RadioGroupItem value="userRole" id="userRole" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="userRole" className="font-semibold cursor-pointer flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    User role
                  </Label>
                  <p className="text-xs text-neutral-600 mt-1">
                    Share with all users who have a specific role
                  </p>
                  {shareLevel === 'userRole' && (
                    <div className="mt-3 space-y-2">
                      {availableRoles.map(role => (
                        <label key={role} className="flex items-center gap-2 p-2 rounded hover:bg-white cursor-pointer">
                          <Checkbox
                            checked={selectedRoles.includes(role)}
                            onCheckedChange={() => toggleRole(role)}
                          />
                          <span className="text-sm">{role}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </label>

              {/* Specific Users */}
              <label
                className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  shareLevel === 'specificUsers'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-blue-300'
                }`}
              >
                <RadioGroupItem value="specificUsers" id="specificUsers" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="specificUsers" className="font-semibold cursor-pointer flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Specific users
                  </Label>
                  <p className="text-xs text-neutral-600 mt-1">
                    Select individual users to share with
                  </p>
                  {shareLevel === 'specificUsers' && (
                    <div className="mt-3 space-y-2">
                      <Input
                        placeholder="Search users..."
                        className="mb-2"
                      />
                      {availableUsers.map(user => (
                        <label key={user.id} className="flex items-center gap-2 p-2 rounded hover:bg-white cursor-pointer">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUser(user.id)}
                          />
                          <div>
                            <span className="text-sm font-medium">{user.name}</span>
                            <p className="text-xs text-neutral-500">{user.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </label>

              {/* Project */}
              <label
                className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  shareLevel === 'project'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-blue-300'
                }`}
              >
                <RadioGroupItem value="project" id="project" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="project" className="font-semibold cursor-pointer flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Project
                  </Label>
                  <p className="text-xs text-neutral-600 mt-1">
                    Share with all users in a specific project
                  </p>
                  {shareLevel === 'project' && (
                    <div className="mt-3">
                      <Select value={selectedProject} onValueChange={setSelectedProject}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProjects.map(project => (
                            <SelectItem key={project} value={project}>
                              {project}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </label>

              {/* Company-wide */}
              <label
                className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  shareLevel === 'companyWide'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-blue-300'
                }`}
              >
                <RadioGroupItem value="companyWide" id="companyWide" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="companyWide" className="font-semibold cursor-pointer flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Company-wide (all users)
                  </Label>
                  <p className="text-xs text-neutral-600 mt-1">
                    Visible to entire organization
                  </p>
                </div>
              </label>
            </div>
          </RadioGroup>

          {/* Permissions */}
          {shareLevel !== 'personal' && (
            <div className="border-t border-neutral-200 pt-4">
              <Label className="text-sm font-semibold mb-3 block">Permissions</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 rounded hover:bg-neutral-50 cursor-pointer">
                  <Checkbox checked={true} disabled />
                  <span className="text-sm">Can view</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded hover:bg-neutral-50 cursor-pointer">
                  <Checkbox
                    checked={canEdit}
                    onCheckedChange={(checked) => setCanEdit(checked as boolean)}
                  />
                  <span className="text-sm">Can edit (admins only)</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleShare}>
            Share View
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



