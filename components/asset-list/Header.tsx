'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MessageCircle } from 'lucide-react';
import CoreVisionLogo from '@/components/CoreVisionLogo';
import { useABTestOptional } from '@/lib/contexts/ab-test-context';
import { cn } from '@/lib/utils';

interface HeaderProps {
  projectName: string;
  onProjectChange: (projectId: string) => void;
  /** Ініціали користувача для аватара (наприклад "IS") */
  userInitials?: string;
}

const navItems = [
  { label: 'Assets', href: '/' },
  { label: 'Dashboard', href: '#' },
  { label: 'Activity', href: '/activity' },
  { label: 'Users', href: '#' },
] as const;

export default function Header({
  projectName,
  onProjectChange,
  userInitials = 'IS',
}: HeaderProps) {
  const pathname = usePathname();
  const abTest = useABTestOptional();

  const projects = [
    { id: 'citytestqa', name: 'CityTestQA' },
    { id: 'project2', name: 'Project 2' },
    { id: 'project3', name: 'Project 3' },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-white border-b border-[#E4E4E7]"
      style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.12)' }}
    >
      {/* Ліва частина: лого + навігація */}
      <div className="flex items-center gap-5">
        <CoreVisionLogo width={122} height={32} />
        <nav className="flex items-center">
          {navItems.map(({ label, href }) => {
            const isActive = (href === '/' && pathname === '/') || (href === '/activity' && pathname === '/activity');
            const wrapperClass = `flex flex-col py-2 ${isActive ? 'border-b-2 border-[#E86F25]' : ''}`;
            const textClass = isActive
              ? 'text-[#E86F25] font-semibold'
              : 'text-[#3F3F46] font-medium';
            return (
              <div key={label} className={wrapperClass}>
                {href === '#' ? (
                  <span
                    className={`h-10 min-w-[72px] px-3 py-1 rounded flex items-center justify-center text-sm cursor-default ${textClass}`}
                  >
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className={`h-10 min-w-[72px] px-3 py-1 rounded flex items-center justify-center text-sm hover:text-[#18181B] ${textClass}`}
                  >
                    {label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* A/B тестування Columns–Filters (службовий елемент, не частина продукту) */}
      {abTest && (
        <div className="flex flex-col items-center gap-0.5 mr-2 px-2 py-1 rounded-md border border-[#8B5CF6] bg-[#F5F3FF]">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] text-[#6D28D9] font-medium leading-tight">
                  UX Testing Mode
                </span>
                <div
                  className="flex rounded-md border border-[#8B5CF6] bg-white p-0.5 shadow-sm"
                  role="group"
                  aria-label="A/B variant"
                >
                  <button
                    type="button"
                    onClick={() => abTest.setVariant('A')}
                    className={cn(
                      'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                      abTest.variant === 'A'
                        ? 'bg-[#8B5CF6] text-white'
                        : 'text-[#6D28D9] hover:bg-[#EDE9FE]'
                    )}
                  >
                    Variant A
                  </button>
                  <button
                    type="button"
                    onClick={() => abTest.setVariant('B')}
                    className={cn(
                      'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                      abTest.variant === 'B'
                        ? 'bg-[#8B5CF6] text-white'
                        : 'text-[#6D28D9] hover:bg-[#EDE9FE]'
                    )}
                  >
                    Variant B
                  </button>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[220px]">
              UX Testing Mode — not part of the product
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Права частина: селектор проєкту, Chat Support, аватар */}
      <div className="flex items-center gap-4">
        <Select value={projectName} onValueChange={onProjectChange}>
          <SelectTrigger
            className="w-[240px] min-h-9 px-3 py-2.5 rounded-md border-[#E4E4E7] bg-white"
          >
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

        <Button
          variant="outline"
          size="default"
          onClick={() => {
            // TODO: Open chat support
            console.log('Chat support clicked');
          }}
          className="h-10 px-4 py-2 rounded-lg border-[#E4E4E7] gap-2 text-[#312C29] text-sm font-medium"
        >
          <MessageCircle className="h-4 w-4" />
          Chat Support
        </Button>

        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium bg-[#FFF1E1] text-[#9A3412] shrink-0"
          title="User"
        >
          {userInitials}
        </div>
      </div>
    </header>
  );
}
