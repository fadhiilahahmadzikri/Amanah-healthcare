'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import {
  useStateSearchEngine,
  SearchEngineTrigger,
  SearchEngineDialog,
  type SearchEngineResultItem
} from '@/components/search-engine';
import { REPLACEMENT_STATUS_CONFIG, SESSION_CODE_LABELS } from '../constants/replacement.constants';
import type { ReplacementOpportunityItem } from '../api/types';

export interface ReplacementMobileFilterToolbarProps {
  opportunities: ReplacementOpportunityItem[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedStatuses: string[];
  onSelectedStatusesChange: (statuses: string[]) => void;
  selectedSessions: string[];
  onSelectedSessionsChange: (sessions: string[]) => void;
  onResetAll: () => void;
  className?: string;
}

type DrawerFilterType = 'status' | 'session' | null;

const STATUS_OPTIONS = [
  { value: 'open', label: REPLACEMENT_STATUS_CONFIG.open.label },
  { value: 'claimed', label: REPLACEMENT_STATUS_CONFIG.claimed.label },
  { value: 'completed', label: REPLACEMENT_STATUS_CONFIG.completed.label },
  { value: 'cancelled', label: REPLACEMENT_STATUS_CONFIG.cancelled.label }
];

const SESSION_OPTIONS = Object.entries(SESSION_CODE_LABELS).map(([value, label]) => ({
  value,
  label
}));

export function ReplacementMobileFilterToolbar({
  opportunities,
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onSelectedStatusesChange,
  selectedSessions,
  onSelectedSessionsChange,
  onResetAll,
  className
}: ReplacementMobileFilterToolbarProps) {
  const [openDrawer, setOpenDrawer] = useState<DrawerFilterType>(null);

  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const seen = new Set<string>();
    const items: SearchEngineResultItem[] = [];

    opportunities.forEach((o) => {
      const origName = o.originalStaffName;
      if (origName && !seen.has(origName)) {
        seen.add(origName);
        items.push({
          id: `orig-${o.id}`,
          title: origName,
          subtitle: `${o.originalStaffRole || 'Staf Cuti'}`,
          category: 'Staf Cuti',
          icon: Icons.user,
          queryValue: origName
        });
      }

      const claimedName = o.claimedByName;
      if (claimedName && !seen.has(claimedName)) {
        seen.add(claimedName);
        items.push({
          id: `claimed-${o.id}`,
          title: claimedName,
          subtitle: `${o.claimedByRole || 'Staf Pengganti'}`,
          category: 'Pengganti',
          icon: Icons.userCheck,
          queryValue: claimedName
        });
      }
    });

    return items;
  }, [opportunities]);

  const searchEngine = useStateSearchEngine({
    query: searchQuery,
    onQueryChange: onSearchChange,
    id: 'peluang-pengganti-mobile',
    title: 'Cari Peluang Pengganti',
    description: 'Cari berdasarkan nama staf cuti atau pengganti',
    placeholder: 'Ketik nama staf...',
    indexItems
  });

  const hasStatusFilter = selectedStatuses.length > 0;
  const hasSessionFilter = selectedSessions.length > 0;

  const hasActiveFilters = Boolean(searchQuery.trim() || hasStatusFilter || hasSessionFilter);

  const handleReset = () => {
    searchEngine.clearQuery();
    onResetAll();
  };

  return (
    <>
      <div className={cn('flex flex-col gap-2 font-sans select-none', className)}>
        <div className='flex items-center justify-between gap-1.5 w-full overflow-x-auto scrollbar-none py-0.5'>
          {/* Left: Filters */}
          <div className='flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-none'>
            {/* 1. Dynamic Search Engine Trigger */}
            <SearchEngineTrigger
              config={searchEngine.config}
              isOpen={searchEngine.isOpen}
              onOpen={searchEngine.open}
              ariaLabel='Cari peluang pengganti'
            />

            {/* 2. Status Filter Button */}
            <Button
              type='button'
              variant={hasStatusFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('status')}
              aria-label='Filter Status Peluang'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasStatusFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.activity className='size-4' />
              {hasStatusFilter && (
                <span className='absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-mono font-bold flex items-center justify-center leading-none ring-1 ring-card'>
                  {selectedStatuses.length}
                </span>
              )}
            </Button>

            {/* 3. Sesi Filter Button */}
            <Button
              type='button'
              variant={hasSessionFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('session')}
              aria-label='Filter Sesi Dinas'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasSessionFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.clock className='size-4' />
              {hasSessionFilter && (
                <span className='absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-mono font-bold flex items-center justify-center leading-none ring-1 ring-card'>
                  {selectedSessions.length}
                </span>
              )}
            </Button>
          </div>

          {/* Right: Reset */}
          <div className='flex items-center gap-1.5 shrink-0 ml-auto'>
            {hasActiveFilters && (
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={handleReset}
                aria-label='Reset Semua Filter'
                className='size-8.5 rounded-xl border-destructive/40 text-destructive bg-destructive/10 hover:bg-destructive/20 cursor-pointer shadow-2xs shrink-0'
                title='Reset Semua Filter'
              >
                <Icons.refresh className='size-3.5' />
              </Button>
            )}
          </div>
        </div>

        {/* Active Filter Summary Chips Row */}
        {hasActiveFilters && (
          <div className='flex items-center gap-1.5 flex-wrap pt-0.5 overflow-x-auto scrollbar-none'>
            {searchEngine.config.query && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Cari: &quot;{searchEngine.config.query}&quot;</span>
                <button
                  type='button'
                  onClick={() => searchEngine.clearQuery()}
                  aria-label='Hapus pencarian'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasStatusFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Status: {selectedStatuses.length}</span>
                <button
                  type='button'
                  onClick={() => onSelectedStatusesChange([])}
                  aria-label='Hapus filter status'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasSessionFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Sesi: {selectedSessions.length}</span>
                <button
                  type='button'
                  onClick={() => onSelectedSessionsChange([])}
                  aria-label='Hapus filter sesi'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      {/* Drawer 1: Status Filter */}
      <Drawer
        open={openDrawer === 'status'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Filter Status Peluang</DrawerTitle>
            <DrawerDescription>Pilih satu atau beberapa status peluang pengganti</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-wrap gap-2 p-4 pt-1 max-h-[50vh] overflow-y-auto'>
            {STATUS_OPTIONS.map((st) => {
              const isSelected = selectedStatuses.includes(st.value);
              return (
                <button
                  key={st.value}
                  type='button'
                  onClick={() => onSelectedStatusesChange(toggleItem(selectedStatuses, st.value))}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none flex items-center gap-1.5',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-foreground border-border/60 hover:bg-muted'
                  )}
                >
                  <span>{st.label}</span>
                  {isSelected && <Icons.check className='size-3 stroke-[2.5]' />}
                </button>
              );
            })}
          </div>
          <DrawerFooter className='pt-2.5 pb-4 px-4 border-t border-border/40'>
            <Button
              type='button'
              variant='primary'
              size='card-action'
              shape='pill'
              onClick={() => setOpenDrawer(null)}
              className='w-full font-semibold text-xs cursor-pointer'
            >
              Selesai
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer 2: Sesi Filter */}
      <Drawer
        open={openDrawer === 'session'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Filter Sesi Dinas</DrawerTitle>
            <DrawerDescription>Pilih satu atau beberapa sesi dinas</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-wrap gap-2 p-4 pt-1 max-h-[50vh] overflow-y-auto'>
            {SESSION_OPTIONS.map((so) => {
              const isSelected = selectedSessions.includes(so.value);
              return (
                <button
                  key={so.value}
                  type='button'
                  onClick={() => onSelectedSessionsChange(toggleItem(selectedSessions, so.value))}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none flex items-center gap-1.5',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-foreground border-border/60 hover:bg-muted'
                  )}
                >
                  <span>{so.label}</span>
                  {isSelected && <Icons.check className='size-3 stroke-[2.5]' />}
                </button>
              );
            })}
          </div>
          <DrawerFooter className='pt-2.5 pb-4 px-4 border-t border-border/40'>
            <Button
              type='button'
              variant='primary'
              size='card-action'
              shape='pill'
              onClick={() => setOpenDrawer(null)}
              className='w-full font-semibold text-xs cursor-pointer'
            >
              Selesai
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
