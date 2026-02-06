'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter } from 'lucide-react';

export interface FilterColumnMismatchItem {
  id: string;
  label: string;
}

interface FilterColumnMismatchNotificationProps {
  /** Колонки, по яких є фільтр, але вони не видимі у view */
  columns: FilterColumnMismatchItem[];
  onAddSelected: (columnIds: string[]) => void;
  onKeepHidden: () => void;
}

/**
 * Popover-сповіщення для Variant A: фільтр по прихованій колонці.
 * Фіксовано в правому нижньому кутку, помітний за рахунок тіні та анімації.
 */
export default function FilterColumnMismatchNotification({
  columns,
  onAddSelected,
  onKeepHidden,
}: FilterColumnMismatchNotificationProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(columns.map((c) => c.id)));
  const [isVisible, setIsVisible] = useState(false);
  const isSingle = columns.length === 1;
  const first = columns[0];

  useEffect(() => {
    setSelectedIds(new Set(columns.map((c) => c.id)));
    setIsVisible(false);
    const t = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(t);
  }, [columns]);

  const handleToggle = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleAdd = () => {
    if (isSingle) {
      onAddSelected([first.id]);
    } else {
      onAddSelected(Array.from(selectedIds));
    }
  };

  if (columns.length === 0) return null;

  return (
    <div
      className="notification-pulse fixed bottom-6 right-6 z-[100] w-[380px] max-w-[calc(100vw-2rem)] flex items-start gap-3 px-4 py-4 rounded-xl border-2 border-[#E86F25] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12),0_0_0_1px_rgba(232,111,37,0.2)] transition-all duration-300 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF1E1] text-[#E86F25]">
        <Filter className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#E86F25] mb-1">
          Column not visible
        </p>
        {isSingle ? (
          <p className="text-sm text-[#3F3F46]">
            You filtered by <strong>{first.label}</strong>, but this column is not visible in your current view.
          </p>
        ) : (
          <>
            <p className="text-sm text-[#3F3F46] mb-2">
              You filtered by columns that are not visible. Choose which to add:
            </p>
            <ul className="flex flex-col gap-1.5 mb-2">
              {columns.map((col) => (
                <li key={col.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`mismatch-${col.id}`}
                    checked={selectedIds.has(col.id)}
                    onCheckedChange={(checked) => handleToggle(col.id, checked === true)}
                  />
                  <label htmlFor={`mismatch-${col.id}`} className="text-sm text-[#3F3F46] cursor-pointer">
                    {col.label}
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="default"
            size="sm"
            className="bg-[#E86F25] hover:bg-[#D1621E] text-white"
            onClick={handleAdd}
            disabled={!isSingle && selectedIds.size === 0}
          >
            {isSingle ? 'Add column' : selectedIds.size === 0 ? 'Add selected' : `Add ${selectedIds.size} column${selectedIds.size > 1 ? 's' : ''}`}
          </Button>
          <Button variant="outline" size="sm" className="border-[#E4E4E7]" onClick={onKeepHidden}>
            Keep hidden
          </Button>
        </div>
      </div>
    </div>
  );
}
