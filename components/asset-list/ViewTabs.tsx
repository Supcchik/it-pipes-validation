'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { View } from '@/lib/types/asset-list';

interface ViewTabsProps {
  views: View[];
  activeViewId: string;
  onViewChange: (viewId: string) => void;
  onCreateView: () => void;
  onManageViews: () => void;
}

export default function ViewTabs({
  views,
  activeViewId,
  onViewChange,
  onCreateView,
  onManageViews,
}: ViewTabsProps) {
  const favoriteViews = views
    .filter((v) => v.isFavorite)
    .slice(0, 5);

  const otherViews = views.filter(
    (v) => !v.isFavorite || !favoriteViews.includes(v)
  );

  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-2 bg-white',
        'border-b border-[#E4E4E7]'
      )}
    >
      {/* Ліва частина: пілюлі вʼю + More */}
      <div className="flex items-center gap-3">
        {favoriteViews.map((view) => {
          const isActive = activeViewId === view.id;
          return (
            <button
              key={view.id}
              type="button"
              onClick={() => onViewChange(view.id)}
              className={cn(
                'h-10 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors',
                isActive
                  ? 'bg-[#FFEDD5] border border-[#E86F25] text-[#E86F25] font-semibold'
                  : 'bg-white border border-[#E4E4E7] text-[#18181B] font-medium hover:bg-neutral-50'
              )}
            >
              {view.name}
            </button>
          );
        })}

        {/* More (N) — ghost-кнопка з шевроном */}
        {otherViews.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-4 py-2 rounded-lg text-[#3F3F46] font-medium hover:bg-neutral-100 hover:text-[#18181B] gap-2"
              >
                More ({otherViews.length})
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {otherViews.map((view) => (
                <DropdownMenuItem
                  key={view.id}
                  onClick={() => onViewChange(view.id)}
                >
                  {view.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onManageViews}>
                Manage Views...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Права частина: New View */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateView}
          className="h-10 px-4 py-2 rounded-lg text-[#312C29] font-medium hover:bg-neutral-100 gap-2"
        >
          <Plus className="h-4 w-4" />
          New View
        </Button>
      </div>
    </div>
  );
}
