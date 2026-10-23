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
import type { LeaveRequestItem } from '../api/types';

export interface LeaveMobileFilterToolbarProps {
  leaves: LeaveRequestItem[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedStatuses: string[];
  onSelectedStatusesChange: (statuses: string[]) => void;
  selectedStaffTypes: string[];
  onSelectedStaffTypesChange: (types: string[]) => void;
  selectedLeaveTypes: string[];
  onSelectedLeaveTypesChange: (types: string[]) => void;
  onResetAll: () => void;
  onOpenSettingsModal?: () => void;
  className?: string;
}

type DrawerFilterType = 'status' | 'staffType' | 'leaveType' | null;

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'cancelled', label: 'Dibatalkan' }
] as const;

const STAFF_TYPE_OPTIONS = [
  { value: 'doctor', label: 'Dokter' },
  { value: 'midwife', label: 'Bidan' },
  { value: 'worker', label: 'Staf Operasional' }
] as const;

const LEAVE_TYPE_OPTIONS = [
  { value: 'annual_leave', label: 'Cuti Tahunan' },
  { value: 'sick_leave', label: 'Izin Sakit' },
  { value: 'seminar_symposium', label: 'Seminar/Simposium' },
  { value: 'family_matter', label: 'Keperluan Keluarga' },
  { value: 'external_assignment', label: 'Tugas Luar' },
  { value: 'other', label: 'Lainnya' }
] as const;

export function LeaveMobileFilterToolbar({
  leaves,
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onSelectedStatusesChange,
  selectedStaffTypes,
  onSelectedStaffTypesChange,
  selectedLeaveTypes,
  onSelectedLeaveTypesChange,
  onResetAll,
  onOpenSettingsModal,
  className
}: LeaveMobileFilterToolbarProps) {
  const [openDrawer, setOpenDrawer] = useState<DrawerFilterType>(null);

  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const seen = new Set<string>();
    const items: SearchEngineResultItem[] = [];
    leaves.forEach((l) => {
      const name = l.staff?.fullName;
      if (!name || seen.has(name)) return;
      seen.add(name);
      items.push({
        id: `staff-${l.id}`,
        title: name,
        subtitle: l.staff?.profession || 'Staf',
        category: 'Staf',
        icon: Icons.users,
        queryValue: name
      });
    });
    return items;
  }, [leaves]);

  const searchEngine = useStateSearchEngine({
    query: searchQuery,
    onQueryChange: onSearchChange,
    id: 'perizinan-mobile',
    title: 'Pencarian Permohonan Izin',
    description: 'Cari izin berdasarkan nama staf atau profesi',
    placeholder: 'Ketik nama pemohon...',
    indexItems
  });

  const hasStatusFilter = selectedStatuses.length > 0;
  const hasStaffTypeFilter = selectedStaffTypes.length > 0;
  const hasLeaveTypeFilter = selectedLeaveTypes.length > 0;

  const hasActiveFilters = Boolean(
    searchQuery.trim() || hasStatusFilter || hasStaffTypeFilter || hasLeaveTypeFilter
  );

  const handleReset = () => {
    searchEngine.clearQuery();
    onResetAll();
  };

  return (
    <>
      <div className={cn('flex flex-col gap-2 font-sans select-none', className)}>
        {/* Minimalist Horizontal Filter Dock */}
        <div className='flex items-center justify-between gap-1.5 w-full overflow-x-auto scrollbar-none py-0.5'>
          {/* Left: Filters */}
          <div className='flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-none'>
            {/* 1. Dynamic Search Engine Trigger */}
            <SearchEngineTrigger
              config={searchEngine.config}
              isOpen={searchEngine.isOpen}
              onOpen={searchEngine.open}
              ariaLabel='Cari permohonan izin'
            />

            {/* 2. Status Filter Button */}
            <Button
              type='button'
              variant={hasStatusFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('status')}
              aria-label='Filter Status Izin'
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

            {/* 3. Kategori Staf Filter Button */}
            <Button
              type='button'
              variant={hasStaffTypeFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('staffType')}
              aria-label='Filter Kategori Staf'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasStaffTypeFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.users className='size-4' />
              {hasStaffTypeFilter && (
                <span className='absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-mono font-bold flex items-center justify-center leading-none ring-1 ring-card'>
                  {selectedStaffTypes.length}
                </span>
              )}
            </Button>

            {/* 4. Tipe Izin Filter Button */}
            <Button
              type='button'
              variant={hasLeaveTypeFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('leaveType')}
              aria-label='Filter Tipe Izin'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasLeaveTypeFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.calendar className='size-4' />
              {hasLeaveTypeFilter && (
                <span className='absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-mono font-bold flex items-center justify-center leading-none ring-1 ring-card'>
                  {selectedLeaveTypes.length}
                </span>
              )}
            </Button>
          </div>

          {/* Right: Actions & Reset */}
          <div className='flex items-center gap-1.5 shrink-0 ml-auto'>
            {/* Pengaturan Kebijakan Button */}
            {onOpenSettingsModal && (
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={onOpenSettingsModal}
                aria-label='Pengaturan Kebijakan'
                title='Pengaturan Kebijakan'
                className='size-8.5 rounded-xl cursor-pointer shrink-0'
              >
                <Icons.settings className='size-4' />
              </Button>
            )}

            {/* Reset Filter Button */}
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
            {hasStaffTypeFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Kategori: {selectedStaffTypes.length}</span>
                <button
                  type='button'
                  onClick={() => onSelectedStaffTypesChange([])}
                  aria-label='Hapus filter kategori'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasLeaveTypeFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Tipe Izin: {selectedLeaveTypes.length}</span>
                <button
                  type='button'
                  onClick={() => onSelectedLeaveTypesChange([])}
                  aria-label='Hapus filter tipe izin'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Centralized Search Engine Modal */}
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      {/* Drawer 1: Status Multi-Select Filter */}
      <Drawer
        open={openDrawer === 'status'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Filter Status Izin</DrawerTitle>
            <DrawerDescription>Pilih satu atau beberapa status permohonan izin</DrawerDescription>
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

      {/* Drawer 2: Kategori Staf Multi-Select Filter */}
      <Drawer
        open={openDrawer === 'staffType'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Filter Kategori Staf</DrawerTitle>
            <DrawerDescription>Pilih satu atau beberapa kategori staf pemohon</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-wrap gap-2 p-4 pt-1 max-h-[50vh] overflow-y-auto'>
            {STAFF_TYPE_OPTIONS.map((st) => {
              const isSelected = selectedStaffTypes.includes(st.value);
              return (
                <button
                  key={st.value}
                  type='button'
                  onClick={() =>
                    onSelectedStaffTypesChange(toggleItem(selectedStaffTypes, st.value))
                  }
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

      {/* Drawer 3: Tipe Izin Multi-Select Filter */}
      <Drawer
        open={openDrawer === 'leaveType'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Filter Tipe Izin</DrawerTitle>
            <DrawerDescription>Pilih satu atau beberapa tipe permohonan izin</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-wrap gap-2 p-4 pt-1 max-h-[50vh] overflow-y-auto'>
            {LEAVE_TYPE_OPTIONS.map((lt) => {
              const isSelected = selectedLeaveTypes.includes(lt.value);
              return (
                <button
                  key={lt.value}
                  type='button'
                  onClick={() =>
                    onSelectedLeaveTypesChange(toggleItem(selectedLeaveTypes, lt.value))
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none flex items-center gap-1.5',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-foreground border-border/60 hover:bg-muted'
                  )}
                >
                  <span>{lt.label}</span>
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
