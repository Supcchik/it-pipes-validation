'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Header from '@/components/asset-list/Header';
import { ACTIVITY_MOCK_ENTRIES, ACTIVITY_USERS, ACTIVITY_ACTION_TYPES, ACTIVITY_ENTITY_TYPES } from '@/lib/data/activity-mock';
import type { ActivityEntry, ActivityUser, ActivityDiffRow } from '@/lib/types/activity';
import { Search, Settings, Inbox } from 'lucide-react';
import { toast } from 'sonner';

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

/** Формат дати для тултіпу (наприклад "6 Feb 2026") */
function formatDateTooltip(dateKey: string): string {
  const d = new Date(dateKey);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Один ряд diff: або чіпи old/new, або вільний текст */
function ActivityDiffRowView({ row }: { row: ActivityDiffRow }) {
  if (row.text) {
    return <span className="text-[#3F3F46]">{row.text}</span>;
  }
  const hasOldNew = row.old !== undefined || row.new !== undefined;
  if (hasOldNew) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {row.field && <span className="text-[#71717A]">{row.field}:</span>}
        {row.old != null && row.old !== '' && (
          <span
            className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-[#FEE2E2] text-[#991B1B] line-through"
          >
            {row.old}
          </span>
        )}
        {row.old != null && row.new != null && (
          <span className="text-[#71717A]">→</span>
        )}
        {row.new != null && row.new !== '' && (
          <span
            className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-[#D1FAE5] text-[#065F46]"
          >
            {row.new}
          </span>
        )}
      </div>
    );
  }
  return null;
}

const DATE_PRESETS = ['Today', 'Last 7 days', 'Last 30 days', 'Custom range'] as const;

function formatDayLabel(dateKey: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateKey);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  const formatted = d.toLocaleDateString('en-US', options);
  if (diffDays === 0) return `Today — ${formatted}`;
  if (diffDays === 1) return `Yesterday — ${formatted}`;
  return formatted;
}

function filterByDateRange(dateKey: string, preset: string): boolean {
  if (preset === 'Today') {
    const today = new Date().toISOString().split('T')[0];
    return dateKey === today;
  }
  if (preset === 'Last 7 days' || preset === 'Last 30 days') {
    const days = preset === 'Last 7 days' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffKey = cutoff.toISOString().split('T')[0];
    return dateKey >= cutoffKey;
  }
  return true;
}

function ActivityPageContent() {
  const searchParams = useSearchParams();
  const assetFromUrl = searchParams.get('asset') ?? '';

  const [searchText, setSearchText] = useState('');
  const [userFilter, setUserFilter] = useState<string>('All');
  const [actionFilter, setActionFilter] = useState<string>('All');
  const [entityFilter, setEntityFilter] = useState<string>('All');
  const [datePreset, setDatePreset] = useState<string>('Last 30 days');
  const [loadMoreCount, setLoadMoreCount] = useState(15);

  const filteredEntries = useMemo(() => {
    let list = [...ACTIVITY_MOCK_ENTRIES];
    if (assetFromUrl) {
      list = list.filter((e) => e.assetIds.some((id) => id === assetFromUrl));
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (e) =>
          e.userName.toLowerCase().includes(q) ||
          e.assetIds.some((id) => id.toLowerCase().includes(q)) ||
          e.diffRows.some((r) => (r.text ?? '').toLowerCase().includes(q) || (r.field ?? '').toLowerCase().includes(q))
      );
    }
    if (userFilter !== 'All') list = list.filter((e) => e.userName === userFilter);
    if (actionFilter !== 'All') list = list.filter((e) => e.actionType === actionFilter);
    if (entityFilter !== 'All') list = list.filter((e) => e.entityType === entityFilter);
    if (datePreset !== 'Custom range') list = list.filter((e) => filterByDateRange(e.dateKey, datePreset));
    return list;
  }, [assetFromUrl, searchText, userFilter, actionFilter, entityFilter, datePreset]);

  const displayedEntries = filteredEntries.slice(0, loadMoreCount);
  const hasMore = filteredEntries.length > loadMoreCount;

  const groupedByDay = useMemo(() => {
    const map = new Map<string, ActivityEntry[]>();
    displayedEntries.forEach((e) => {
      const list = map.get(e.dateKey) ?? [];
      list.push(e);
      map.set(e.dateKey, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => (b > a ? 1 : -1));
  }, [displayedEntries]);

  const clearFilters = () => {
    setSearchText('');
    setUserFilter('All');
    setActionFilter('All');
    setEntityFilter('All');
    setDatePreset('Last 30 days');
  };

  const handleLoadMore = () => {
    setLoadMoreCount((n) => Math.min(n + 15, filteredEntries.length));
    toast.info('Loading older entries...');
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-50 pt-14">
      <Header
        projectName="CityTestQA"
        onProjectChange={() => {}}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-[#18181B]">Activity Log</h1>
            <p className="text-sm text-[#71717A] mt-1">
              Track all changes made across assets, inspections, and observations
            </p>
          </header>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
              <Input
                placeholder="Search by asset, user, or change..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 h-9 rounded-md border-[#E4E4E7]"
              />
            </div>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[180px] h-9 border-[#E4E4E7]">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All users</SelectItem>
                {ACTIVITY_USERS.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[160px] h-9 border-[#E4E4E7]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_ACTION_TYPES.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[160px] h-9 border-[#E4E4E7]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_ENTITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={datePreset} onValueChange={setDatePreset}>
              <SelectTrigger className="w-[160px] h-9 border-[#E4E4E7]">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                {DATE_PRESETS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-9 border-[#E4E4E7]" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-[#E4E4E7] bg-white">
              <Inbox className="h-12 w-12 text-[#A1A1AA] mb-4" />
              <p className="text-lg font-medium text-[#3F3F46]">No changes match your filters</p>
              <Button variant="outline" className="mt-4 border-[#E4E4E7]" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {groupedByDay.map(([dateKey, entries]) => (
                  <section key={dateKey}>
                    <h2 className="text-sm font-semibold text-[#71717A] mb-3 pb-2 border-b border-[#E4E4E7]">
                      {formatDayLabel(dateKey)}
                    </h2>
                    <ul className="space-y-0">
                      {entries.map((entry, idx) => {
                        const avatarStyle = getAvatarStyle(entry.userName);
                        const isLast = idx === entries.length - 1;
                        return (
                          <li key={entry.id} className="flex gap-4">
                            {/* Колонка аватара + вертикальна лінія таймлайну */}
                            <div className="flex flex-col items-center shrink-0">
                              {entry.userName === 'System' ? (
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: avatarStyle.bg, color: avatarStyle.text }}
                                >
                                  <Settings className="h-5 w-5" />
                                </div>
                              ) : (
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                                  style={{ backgroundColor: avatarStyle.bg, color: avatarStyle.text }}
                                >
                                  {entry.userName.split(' ').map((n) => n[0]).join('')}
                                </div>
                              )}
                              {!isLast && (
                                <div className="w-0.5 flex-1 min-h-[20px] bg-[#E4E4E7] mt-1" aria-hidden />
                              )}
                            </div>
                            {/* Контент: один ряд (ім'я + дія + час) + картка деталей */}
                            <div className="flex-1 min-w-0 pb-6">
                              <p className="text-sm text-[#18181B]">
                                <span className="font-semibold">{entry.userName}</span>
                                {' '}
                                {entry.actionType.toLowerCase()}
                                {' '}
                                <span className="font-medium text-[#E86F25]">
                                  {entry.entityType.toLowerCase()} {entry.assetIds.join(', ')}
                                </span>
                                {' · '}
                                <span
                                  className="text-[#71717A]"
                                  title={`${formatDateTooltip(entry.dateKey)} — ${entry.timestampDisplay}`}
                                >
                                  {entry.timestampDisplay}
                                </span>
                              </p>
                              <p className="text-xs text-[#71717A] mt-0.5">
                                {entry.assetIds.map((id) => (
                                  <Link
                                    key={id}
                                    href={`/?asset=${id}`}
                                    className="text-[#E86F25] hover:underline mr-2"
                                  >
                                    {id}
                                  </Link>
                                ))}
                              </p>
                              {entry.diffRows.length > 0 && (
                                <div className="mt-2 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] p-3 text-xs space-y-2">
                                  {entry.diffRows.map((row, i) => (
                                    <ActivityDiffRowView key={i} row={row} />
                                  ))}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>

              <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#E4E4E7]">
                <span className="text-sm text-[#71717A]">
                  Showing {displayedEntries.length} of {filteredEntries.length} changes
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#E4E4E7]"
                  onClick={handleLoadMore}
                  disabled={!hasMore}
                >
                  Load more
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-neutral-50">Loading...</div>}>
      <ActivityPageContent />
    </Suspense>
  );
}
