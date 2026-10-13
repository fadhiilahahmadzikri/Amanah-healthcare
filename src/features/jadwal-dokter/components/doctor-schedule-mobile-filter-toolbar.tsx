'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { MonthGridCalendar } from '@/components/ui/month-grid-calendar';
import { formatClinicDate } from '@/lib/date-format';
import { cn } from '@/lib/utils';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import { isToday } from '@/features/klinik/model/appointment-filters.rules';
import { doctorScheduleFilterOptionsQueryOptions } from '../api/queries';
import { DoctorExportButton } from './doctor-export-button';
import { DoctorScheduleSettingsButton } from './settings/doctor-schedule-settings-button';
import type { useDoctorScheduleView } from '../model/useDoctorScheduleView';
import type { ConfigurationCategory } from '../model/useDoctorScheduleSettingsModal';
import {
  useStateSearchEngine,
  SearchEngineTrigger,
  SearchEngineDialog,
  type SearchEngineResultItem
} from '@/components/search-engine';

export interface DoctorScheduleMobileFilterToolbarProps {
  scheduleView: ReturnType<typeof useDoctorScheduleView>;
  onOpenSettings?: (category: ConfigurationCategory, subView?: 'defs' | 'operating_days') => void;
  className?: string;
}

type DrawerFilterType = 'date' | 'month' | 'poli' | null;

export function DoctorScheduleMobileFilterToolbar({
  scheduleView,
  onOpenSettings,
  className
}: DoctorScheduleMobileFilterToolbarProps) {
  const [openDrawer, setOpenDrawer] = useState<DrawerFilterType>(null);
  const { data: filterOptionsData } = useQuery(doctorScheduleFilterOptionsQueryOptions());

  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const items: SearchEngineResultItem[] = [];

    // 1. Loaded Doctors
    scheduleView.doctors.forEach((doc) => {
      items.push({
        id: `doc-${doc.id}`,
        title: doc.nama_dokter,
        subtitle: `${doc.spesialisasi} • ${doc.status_dokter}`,
        category: 'Dokter',
        icon: Icons.stethoscope,
        queryValue: doc.nama_dokter
      });
    });

    // 2. Poliklinik Catalog
    (filterOptionsData?.poliklinik ?? []).forEach((p, idx) => {
      items.push({
        id: `poli-${idx}-${p.id}`,
        title: p.name,
        subtitle: 'Unit Poliklinik',
        category: 'Poliklinik',
        icon: Icons.mapPin,
        queryValue: p.name
      });
    });

    return items;
  }, [scheduleView.doctors, filterOptionsData?.poliklinik]);

  const searchEngine = useStateSearchEngine({
    query: scheduleView.searchQuery,
    onQueryChange: scheduleView.actions.changeSearch,
    id: 'jadwal-dokter-mobile',
    title: 'Pencarian Jadwal Dokter',
    description: 'Cari jadwal dokter berdasarkan nama dokter, spesialisasi, atau poli',
    placeholder: 'Ketik nama dokter atau unit poli...',
    indexItems
  });

  const hasDateFilter = Boolean(scheduleView.dateFilter && !isToday(scheduleView.dateFilter));
  const hasMonthFilter = Boolean(scheduleView.monthFilter && scheduleView.monthFilter !== 'ALL');
  const hasPoliFilter = scheduleView.selectedPoli.length > 0;

  const dateIso = useMemo(() => {
    if (!scheduleView.dateFilter) return '';
    const y = scheduleView.dateFilter.getFullYear();
    const m = String(scheduleView.dateFilter.getMonth() + 1).padStart(2, '0');
    const d = String(scheduleView.dateFilter.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [scheduleView.dateFilter]);

  const handleReset = () => {
    searchEngine.clearQuery();
    scheduleView.actions.resetFilters();
  };

  const poliOptions = useMemo(() => {
    return (filterOptionsData?.poliklinik ?? []).map((p) => p.name);
  }, [filterOptionsData]);

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
              ariaLabel='Cari jadwal dokter'
            />

            {/* 2. Date Filter Button */}
            <Button
              type='button'
              variant={hasDateFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('date')}
              aria-label='Filter Tanggal Jadwal'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasDateFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.calendar className='size-4' />
              {hasDateFilter && (
                <span className='absolute -top-1 -right-1 size-2.5 rounded-full bg-primary-foreground ring-2 ring-primary animate-pulse' />
              )}
            </Button>

            {/* 3. Month Filter Button */}
            <Button
              type='button'
              variant={hasMonthFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('month')}
              aria-label='Filter Bulan Jadwal'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasMonthFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.clock className='size-4' />
              {hasMonthFilter && (
                <span className='absolute -top-1 -right-1 size-2 rounded-full bg-primary-foreground ring-2 ring-primary' />
              )}
            </Button>

            {/* 4. Poli Filter Button */}
            <Button
              type='button'
              variant={hasPoliFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('poli')}
              aria-label='Filter Poliklinik'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasPoliFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.plusCircle className='size-4' />
              {hasPoliFilter && (
                <span className='absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-mono font-bold flex items-center justify-center leading-none ring-1 ring-card'>
                  {scheduleView.selectedPoli.length}
                </span>
              )}
            </Button>
          </div>

          {/* Right: Settings, Export & Reset on opposite side */}
          <div className='flex items-center gap-1.5 shrink-0 ml-auto'>
            {/* 5. Export Button */}
            <DoctorExportButton data={scheduleView.doctors} variant='icon' />

            {/* 6. Settings Button (Drawer Sheet on mobile) */}
            {onOpenSettings && (
              <DoctorScheduleSettingsButton
                onSelectCategory={onOpenSettings}
                forceMode='drawer'
                className='size-8.5 rounded-xl'
              />
            )}

            {/* 7. Reset Filter Button (Global on Dock) */}
            {scheduleView.hasActiveFilters && (
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
        {scheduleView.hasActiveFilters && (
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
            {hasDateFilter && scheduleView.dateFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Tgl: {formatClinicDate(scheduleView.dateFilter, { style: 'human_short' })}</span>
                <button
                  type='button'
                  onClick={() => scheduleView.actions.changeDateFilter(new Date())}
                  aria-label='Kembali ke hari ini'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasMonthFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Bulan: {scheduleView.monthFilter}</span>
                <button
                  type='button'
                  onClick={() => scheduleView.actions.changeMonthFilter('ALL')}
                  aria-label='Hapus filter bulan'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasPoliFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Poli: {scheduleView.selectedPoli.length}</span>
                <button
                  type='button'
                  onClick={() => scheduleView.actions.changeSelectedPoli([])}
                  aria-label='Hapus filter poli'
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

      {/* Drawer 1: Calendar Date Picker */}
      <Drawer
        open={openDrawer === 'date'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Pilih Tanggal Praktik</DrawerTitle>
            <DrawerDescription>Tampilkan jadwal praktik dokter pada tanggal yang dipilih</DrawerDescription>
          </DrawerHeader>
          <div className='p-4 pt-1'>
            <CustomCalendar
              value={dateIso}
              onChange={(_isoStr, dateObj) => {
                scheduleView.actions.changeDateFilter(dateObj);
                setOpenDrawer(null);
              }}
            />
          </div>
          <DrawerFooter className='flex-row items-center justify-between pt-2.5 pb-4 px-4 border-t border-border/40'>
            <Button
              type='button'
              variant='outline'
              size='card-action'
              shape='pill'
              onClick={() => setOpenDrawer(null)}
              className='px-6 font-semibold text-xs cursor-pointer'
            >
              Tutup
            </Button>
            <Button
              type='button'
              variant='primary'
              size='card-action'
              shape='pill'
              onClick={() => {
                scheduleView.actions.changeDateFilter(new Date());
                setOpenDrawer(null);
              }}
              className='px-6 font-semibold text-xs cursor-pointer'
            >
              Hari Ini
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer 2: Month Grid Calendar */}
      <Drawer
        open={openDrawer === 'month'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Pilih Bulan Praktik</DrawerTitle>
            <DrawerDescription>Tampilkan jadwal praktik dokter pada bulan tertentu</DrawerDescription>
          </DrawerHeader>
          <div className='p-4 pt-1'>
            <MonthGridCalendar
              value={scheduleView.monthFilter || 'ALL'}
              onChange={(val) => {
                scheduleView.actions.changeMonthFilter(val);
                setOpenDrawer(null);
              }}
            />
          </div>
          <DrawerFooter className='pt-2.5 pb-4 px-4 border-t border-border/40'>
            <Button
              type='button'
              variant='outline'
              size='card-action'
              shape='pill'
              onClick={() => setOpenDrawer(null)}
              className='w-full font-semibold text-xs cursor-pointer'
            >
              Tutup
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer 3: Poli Multi-Select Filter */}
      <Drawer
        open={openDrawer === 'poli'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Filter Unit Poliklinik</DrawerTitle>
            <DrawerDescription>Pilih satu atau beberapa unit poliklinik untuk ditampilkan</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-wrap gap-2 p-4 pt-1 max-h-[50vh] overflow-y-auto'>
            {poliOptions.map((poliName) => {
              const isSelected = scheduleView.selectedPoli.includes(poliName);
              return (
                <button
                  key={poliName}
                  type='button'
                  onClick={() =>
                    scheduleView.actions.changeSelectedPoli(
                      toggleItem(scheduleView.selectedPoli, poliName)
                    )
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none flex items-center gap-1.5',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-foreground border-border/60 hover:bg-muted'
                  )}
                >
                  <span>{poliName}</span>
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
