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
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { STATUS_OPTIONS } from '../config/appointment-filter-options';
import { useClinicFilterOptions, type FilterOption } from '../hooks/use-clinic-filter-options';
import {
  buildMonthOptions,
  isAppointmentFilterActive,
  isSameDay
} from '../model/appointment-filters.rules';
import type { AppointmentFilterActions } from './appointment-filters';
import type { AppointmentFilterState } from '../model/appointmentViewModel';
import { cn } from '@/lib/utils';
import { formatClinicDate } from '@/lib/date-format';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import {
  useStateSearchEngine,
  SearchEngineTrigger,
  SearchEngineDialog,
  type SearchEngineResultItem
} from '@/components/search-engine';

export interface AppointmentKlinikMobileFilterToolbarProps {
  filters: AppointmentFilterState;
  actions: AppointmentFilterActions;
  totalAppointments?: number;
  filteredCount?: number;
  serviceOptions?: FilterOption[];
  onOpenCheckIn?: () => void;
  onOpenCreate?: () => void;
  className?: string;
}

type DrawerFilterType = 'date' | 'month' | 'service' | 'status' | null;

export function AppointmentKlinikMobileFilterToolbar({
  filters,
  actions,
  totalAppointments: _totalAppointments,
  filteredCount: _filteredCount,
  serviceOptions: discreteServiceOptions,
  onOpenCheckIn,
  onOpenCreate,
  className
}: AppointmentKlinikMobileFilterToolbarProps) {
  const [openDrawer, setOpenDrawer] = useState<DrawerFilterType>(null);
  const clinicFilterData = useClinicFilterOptions();
  const availableServices = discreteServiceOptions ?? clinicFilterData.serviceOptions;

  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const items: SearchEngineResultItem[] = [];

    // 1. Doctors from backend options
    clinicFilterData.doctorOptions.forEach((doc, idx) => {
      items.push({
        id: `doc-${idx}-${doc.value}`,
        title: doc.label,
        subtitle: 'Dokter Spesialis / Umum',
        category: 'Dokter',
        icon: Icons.userCheck,
        queryValue: doc.label
      });
    });

    // 2. Services from catalog
    availableServices.forEach((srv, idx) => {
      items.push({
        id: `srv-${idx}-${srv.value}`,
        title: srv.label,
        subtitle: 'Layanan Medis Klinik',
        category: 'Layanan',
        icon: Icons.plusCircle,
        queryValue: srv.label
      });
    });

    // 3. Poliklinik units
    clinicFilterData.poliOptions.forEach((poli, idx) => {
      items.push({
        id: `poli-${idx}-${poli.value}`,
        title: poli.label,
        subtitle: 'Unit Poliklinik',
        category: 'Poliklinik',
        icon: Icons.mapPin,
        queryValue: poli.label
      });
    });

    return items;
  }, [availableServices, clinicFilterData.doctorOptions, clinicFilterData.poliOptions]);

  // 1. Centralized dynamic search engine adapter registration
  const searchEngine = useStateSearchEngine({
    query: filters.searchQuery,
    onQueryChange: actions.changeSearch,
    id: 'klinik-janji-temu',
    title: 'Pencarian Janji Temu',
    description: 'Cari janji temu berdasarkan nama dokter, pasien, atau layanan',
    placeholder: 'Ketik nama dokter, spesialis, atau layanan...',
    indexItems
  });

  const today = useMemo(() => new Date(), []);
  const hasDateFilter = Boolean(filters.dateFilter && !isSameDay(filters.dateFilter, today));
  const hasMonthFilter = Boolean(filters.monthFilter && filters.monthFilter !== 'ALL');
  const hasServicesFilter = filters.selectedServices.length > 0;
  const hasStatusesFilter = filters.selectedStatuses.length > 0;

  const isFiltered = isAppointmentFilterActive(filters, today);
  const monthOptions = useMemo(() => buildMonthOptions(), []);

  const dateIso = useMemo(() => {
    if (!filters.dateFilter) return '';
    const y = filters.dateFilter.getFullYear();
    const m = String(filters.dateFilter.getMonth() + 1).padStart(2, '0');
    const d = String(filters.dateFilter.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [filters.dateFilter]);

  const handleReset = () => {
    searchEngine.clearQuery();
    actions.resetFilters();
  };

  return (
    <>
      <div className={cn('flex flex-col gap-2 font-sans select-none', className)}>
        {/* Minimalist Horizontal Filter Dock */}
        <div className='flex items-center justify-between gap-1.5 w-full overflow-x-auto scrollbar-none py-0.5'>
          <div className='flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-none'>
            {/* 1. Dynamic Search Engine Icon Trigger */}
            <SearchEngineTrigger
              config={searchEngine.config}
              isOpen={searchEngine.isOpen}
              onOpen={searchEngine.open}
              ariaLabel='Cari janji temu klinik'
            />

            {/* 2. Date Filter Icon Button */}
            <Button
              type='button'
              variant={hasDateFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('date')}
              aria-label='Filter Tanggal Janji Temu'
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

            {/* 3. Month Filter Icon Button */}
            <Button
              type='button'
              variant={hasMonthFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('month')}
              aria-label='Filter Bulan'
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

            {/* 4. Layanan / Poli Filter Icon Button */}
            <Button
              type='button'
              variant={hasServicesFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('service')}
              aria-label='Filter Layanan Poliklinik'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasServicesFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.plusCircle className='size-4' />
              {hasServicesFilter && (
                <span className='absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-mono font-bold flex items-center justify-center leading-none ring-1 ring-card'>
                  {filters.selectedServices.length}
                </span>
              )}
            </Button>

            {/* 5. Status Filter Icon Button */}
            <Button
              type='button'
              variant={hasStatusesFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('status')}
              aria-label='Filter Status Janji Temu'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasStatusesFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.activity className='size-4' />
              {hasStatusesFilter && (
                <span className='absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-mono font-bold flex items-center justify-center leading-none ring-1 ring-card'>
                  {filters.selectedStatuses.length}
                </span>
              )}
            </Button>
          </div>

          <div className='flex items-center gap-1.5 shrink-0'>
            {/* Quick Action: Check-In */}
            {onOpenCheckIn && (
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={onOpenCheckIn}
                aria-label='Check-In Pasien'
                className='size-8.5 rounded-xl cursor-pointer shrink-0'
                title='Check-In Pasien'
              >
                <Icons.qrCode className='size-4' />
              </Button>
            )}

            {/* Quick Action: Tambah Janji Temu */}
            {onOpenCreate && (
              <Button
                type='button'
                variant='primary'
                size='icon'
                onClick={onOpenCreate}
                aria-label='Tambah Janji Temu'
                className='size-8.5 rounded-xl cursor-pointer shrink-0 shadow-2xs'
                title='Tambah Janji Temu'
              >
                <Icons.add className='size-4' />
              </Button>
            )}

            {/* Global Reset Filter Button on Dock */}
            {isFiltered && (
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
        {isFiltered && (
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
            {hasDateFilter && filters.dateFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Tgl: {formatClinicDate(filters.dateFilter, { style: 'human_short' })}</span>
                <button
                  type='button'
                  onClick={() => actions.changeDateFilter(new Date())}
                  aria-label='Kembali ke hari ini'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasMonthFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Bulan: {filters.monthFilter}</span>
                <button
                  type='button'
                  onClick={() => actions.changeMonthFilter('ALL')}
                  aria-label='Hapus filter bulan'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasServicesFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Layanan: {filters.selectedServices.length}</span>
                <button
                  type='button'
                  onClick={() => actions.changeSelectedServices([])}
                  aria-label='Hapus filter layanan'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasStatusesFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Status: {filters.selectedStatuses.length}</span>
                <button
                  type='button'
                  onClick={() => actions.changeSelectedStatuses([])}
                  aria-label='Hapus filter status'
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
            <DrawerTitle>Pilih Tanggal Janji Temu</DrawerTitle>
            <DrawerDescription>Tampilkan jadwal janji temu berdasarkan tanggal yang dipilih</DrawerDescription>
          </DrawerHeader>
          <div className='p-4 pt-1'>
            <CustomCalendar
              value={dateIso}
              onChange={(_isoStr, dateObj) => {
                actions.changeDateFilter(dateObj);
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
                actions.changeDateFilter(new Date());
                setOpenDrawer(null);
              }}
              className='px-6 font-semibold text-xs cursor-pointer'
            >
              Hari Ini
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer 2: Month Filter */}
      <Drawer
        open={openDrawer === 'month'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Pilih Bulan Janji Temu</DrawerTitle>
            <DrawerDescription>Tampilkan antrean jadwal pada bulan tertentu</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-col gap-1.5 p-4 pt-1 max-h-[50vh] overflow-y-auto'>
            {monthOptions.map((opt) => {
              const isSelected =
                filters.monthFilter === opt.value ||
                (!filters.monthFilter && opt.value === 'ALL');
              return (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => {
                    actions.changeMonthFilter(opt.value);
                    setOpenDrawer(null);
                  }}
                  className={cn(
                    'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors flex items-center justify-between cursor-pointer select-none',
                    isSelected
                      ? 'bg-primary/10 text-primary border-primary/40 font-semibold'
                      : 'bg-card border-border/40 hover:bg-muted/50 text-foreground'
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Icons.check className='size-4 text-primary' />}
                </button>
              );
            })}
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

      {/* Drawer 3: Layanan Filter */}
      <Drawer
        open={openDrawer === 'service'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Filter Layanan Poliklinik</DrawerTitle>
            <DrawerDescription>Pilih satu atau beberapa layanan medis untuk ditampilkan</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-wrap gap-2 p-4 pt-1 max-h-[50vh] overflow-y-auto'>
            {availableServices.map((srv) => {
              const isSelected = filters.selectedServices.includes(srv.value);
              return (
                <button
                  key={srv.value}
                  type='button'
                  onClick={() =>
                    actions.changeSelectedServices(toggleItem(filters.selectedServices, srv.value))
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none flex items-center gap-1.5',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-foreground border-border/60 hover:bg-muted'
                  )}
                >
                  <span>{srv.label}</span>
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

      {/* Drawer 4: Status Filter */}
      <Drawer
        open={openDrawer === 'status'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Filter Status Janji Temu</DrawerTitle>
            <DrawerDescription>Pilih satu atau beberapa status janji temu untuk ditampilkan</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-wrap gap-2 p-4 pt-1'>
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = filters.selectedStatuses.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() =>
                    actions.changeSelectedStatuses(toggleItem(filters.selectedStatuses, opt.value))
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none flex items-center gap-1.5',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-foreground border-border/60 hover:bg-muted'
                  )}
                >
                  <span className={cn('size-2 rounded-full', opt.dotColor)} />
                  <span>{opt.label}</span>
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
