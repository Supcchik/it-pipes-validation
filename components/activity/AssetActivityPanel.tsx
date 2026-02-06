'use client';

import React from 'react';
import Link from 'next/link';
import { X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ACTIVITY_MOCK_ENTRIES } from '@/lib/data/activity-mock';
import type { ActivityUser, ActivityDiffRow } from '@/lib/types/activity';

/** Приглушені кольори аватарів по користувачу (фон + текст) */
function getAvatarStyle(userName: ActivityUser): { bg: string; text: string } {
  switch (userName) {
    case 'Roxie Robertson':
      return { bg: '#FFF1E1', text: '#9A3412' };
    case 'Michaela McCue':
      return { bg: '#E0E7FF', text: '#3730A3' };
    case 'Illia Suprun':
      return { bg: '#D1FAE5', text: '#065F46' };
    case 'System':
      return { bg: '#F4F4F5', text: '#71717A' };
    default:
      return { bg: '#F4F4F5', text: '#71717A' };
  }
}

function DiffRowView({ row }: { row: ActivityDiffRow }) {
  if (row.text) {
    return <span className="text-[#3F3F46] text-xs">{row.text}</span>;
  }
  if (row.old !== undefined || row.new !== undefined) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {row.field && <span className="text-[#71717A]">{row.field}:</span>}
        {row.old != null && row.old !== '' && (
          <span className="inline-flex rounded px-1.5 py-0.5 text-xs font-medium bg-[#FEE2E2] text-[#991B1B] line-through">
            {row.old}
          </span>
        )}
        {row.old != null && row.new != null && <span className="text-[#71717A]">→</span>}
        {row.new != null && row.new !== '' && (
          <span className="inline-flex rounded px-1.5 py-0.5 text-xs font-medium bg-[#D1FAE5] text-[#065F46]">
            {row.new}
          </span>
        )}
      </div>
    );
  }
  return null;
}

interface AssetActivityPanelProps {
  assetId: string;
  onClose: () => void;
}

export default function AssetActivityPanel({ assetId, onClose }: AssetActivityPanelProps) {
  const entries = React.useMemo(
    () =>
      ACTIVITY_MOCK_ENTRIES.filter((e) => e.assetIds.includes(assetId)).sort(
        (a, b) => (b.dateKey + b.id).localeCompare(a.dateKey + a.id)
      ),
    [assetId]
  );

  return (
    <div className="slide-in-right flex flex-col h-full bg-white border-l border-[#E4E4E7] shadow-lg w-full max-w-[400px] min-w-[320px]">
      {/* Заголовок і кнопка закриття */}
      <div className="flex items-center justify-between shrink-0 px-4 py-3 border-b border-[#E4E4E7] bg-[#FAFAFA]">
        <h2 className="text-base font-semibold text-[#18181B]">Activity — {assetId}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-[#71717A] hover:bg-[#E4E4E7]"
          onClick={onClose}
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Список записів (компактний) */}
      <div className="flex-1 overflow-auto p-3">
        {entries.length === 0 ? (
          <p className="text-sm text-[#71717A] py-4 text-center">No activity for this asset yet.</p>
        ) : (
          <ul className="space-y-0">
            {entries.map((entry, idx) => {
              const style = getAvatarStyle(entry.userName);
              const isLast = idx === entries.length - 1;
              return (
                <li key={entry.id} className="flex gap-3 py-2">
                  <div className="flex flex-col items-center shrink-0">
                    {entry.userName === 'System' ? (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: style.bg, color: style.text }}
                      >
                        <Settings className="h-4 w-4" />
                      </div>
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                        style={{ backgroundColor: style.bg, color: style.text }}
                      >
                        {entry.userName.split(' ').map((n) => n[0]).join('')}
                      </div>
                    )}
                    {!isLast && (
                      <div className="w-0.5 flex-1 min-h-[12px] bg-[#E4E4E7] mt-1" aria-hidden />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <p className="text-xs text-[#18181B]">
                      <span className="font-semibold">{entry.userName}</span>
                      {' '}
                      {entry.actionType.toLowerCase()}
                      {' '}
                      <span className="text-[#71717A]">{entry.timestampDisplay}</span>
                    </p>
                    {entry.diffRows.length > 0 && (
                      <div className="mt-1.5 rounded-md bg-[#FAFAFA] border border-[#E4E4E7] p-2 space-y-1">
                        {entry.diffRows.map((row, i) => (
                          <DiffRowView key={i} row={row} />
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Посилання на повний лог */}
      <div className="shrink-0 px-4 py-3 border-t border-[#E4E4E7] bg-[#FAFAFA]">
        <Link
          href={`/activity?asset=${encodeURIComponent(assetId)}`}
          className="text-sm font-medium text-[#E86F25] hover:underline"
        >
          View full Activity Log →
        </Link>
      </div>
    </div>
  );
}
