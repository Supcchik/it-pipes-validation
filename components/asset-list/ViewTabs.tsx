'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Star, Plus, MoreHorizontal } from 'lucide-react';
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
  onManageViews
}: ViewTabsProps) {
  // Get favorite views (max 5)
  const favoriteViews = views
    .filter(v => v.isFavorite)
    .slice(0, 5);

  // Get other views (not in favorites or beyond 5)
  const otherViews = views.filter(
    v => !v.isFavorite || !favoriteViews.includes(v)
  );

  return (
    <div className="h-12 bg-neutral-50 border-b border-neutral-200 flex items-center gap-1 px-4">
      {/* Favorite Views Tabs */}
      {favoriteViews.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={cn(
            'h-full px-4 flex items-center gap-2 text-sm transition-colors',
            'border-b-2',
            activeViewId === view.id
              ? 'bg-white border-orange-500 text-orange-600 font-medium'
              : 'bg-transparent border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          )}
        >
          <Star className={cn(
            'w-4 h-4',
            activeViewId === view.id ? 'fill-orange-500 text-orange-500' : 'text-neutral-400'
          )} />
          {view.name}
        </button>
      ))}

      {/* More Dropdown */}
      {otherViews.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 px-3 text-neutral-600 hover:text-neutral-900"
            >
              <MoreHorizontal className="h-4 w-4 mr-1" />
              More ({otherViews.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {otherViews.map((view) => (
              <DropdownMenuItem
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className="flex items-center gap-2"
              >
                <Star className="w-4 h-4 text-neutral-400" />
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

      {/* New View Button */}
      <div className="ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateView}
          className="h-10 px-3 text-neutral-600 hover:text-neutral-900"
        >
          <Plus className="h-4 w-4 mr-1" />
          New View
        </Button>
      </div>
    </div>
  );
}
