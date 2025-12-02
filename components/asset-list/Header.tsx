'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle } from 'lucide-react';
import CoreVisionLogo from '@/components/CoreVisionLogo';

interface HeaderProps {
  projectName: string;
  onProjectChange: (projectId: string) => void;
}

export default function Header({ projectName, onProjectChange }: HeaderProps) {
  // Mock projects list
  const projects = [
    { id: 'citytestqa', name: 'CityTestQA' },
    { id: 'project2', name: 'Project 2' },
    { id: 'project3', name: 'Project 3' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left: Logo */}
        <div className="flex items-center">
          <CoreVisionLogo width={124} />
        </div>

        {/* Center-Right: Project Selector */}
        <div className="flex items-center gap-4">
          <Select value={projectName} onValueChange={onProjectChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.name}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Right: Chat Support */}
          <Button
            variant="outline"
            size="default"
            onClick={() => {
              // TODO: Open chat support
              console.log('Chat support clicked');
            }}
            className="gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Chat Support
          </Button>
        </div>
      </div>
    </header>
  );
}
