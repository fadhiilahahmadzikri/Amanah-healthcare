'use client';

import React, { useState, useMemo } from 'react';
import type { Table } from '@tanstack/react-table';
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
import { APPOINTMENT_STATUS_OPTIONS } from '../constants/options';
import type { Option } from '@/types/data-table';
import type { AdminAppointment } from '../api/types';
import { cn } from '@/lib/utils';
import { getClinicTodayDateString } from '@/lib/date-format';
import { AppointmentExportButton } from './appointment-export-button';
import {
  useTanStackSearchEngine,
  SearchEngineTrigger,
  SearchEngineDialog,
  type SearchEngineResultItem
} from '@/components/search-engine';

export interface AppointmentMobileFilterToolbarProps {
  table: Table<AdminAppointment>;
  onReset?: () => void;
  className?: string;
}

type DrawerFilterType = 'date' | 'status' | 'doctor' | 'room' | null;

export function AppointmentMobileFilterToolbar({
  table,
  onReset,
  className
}: AppointmentMobileFilterToolbarProps) {
  const [openDrawer, setOpenDrawer] = useState<DrawerFilterType>(null);

  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const items: SearchEngineResultItem[] = [];
    const rows = table.getCoreRowModel().rows;
    const seenPatients = new Set<string>();
    const seenQueues = new Set<string>();

    rows.forEach((row) => {
      const apt = row.original;
      if (apt.patientName && !seenPatients.has(apt.patientName)) {
        seenPatients.add(apt.patientName);
        items.push({
          id: `pat-${apt.id}`,
          title: apt.patientName,
          subtitle: `Antrean ${apt.queueNumber || '-'} • ${apt.layananName || apt.poliklinikName || '-'}`,
          category: 'Pasien',
          icon: Icons.user,
          queryValue: apt.patientName
        });
      }
      if (apt.queueNumber && !seenQueues.has(apt.queueNumber)) {
        seenQueues.add(apt.queueNumber);
        items.push({
          id: `q-${apt.id}`,
          title: `Antrean ${apt.queueNumber}`,
          subtitle: apt.patientName,
          category: 'Nomor Antrean',
          icon: Icons.ticket,
          queryValue: apt.queueNumber
        });
      }
    });

    return items;
  }, [table]);

  const searchEngine = useTanStackSearchEngine({
    table,
    columnId: 'patientName',
    id: 'appointment-pasien-admin',
    title: 'Pencarian Antrean Pasien',
    description: 'Cari antrean berdasarkan nama pasien atau nomor antrean',
    placeholder: 'Ketik nama pasien atau no antrean...',
    indexItems
  });

  const patientCol = table.getColumn('patientName');
  const dateCol = table.getColumn('scheduledDate');
  const statusCol = table.getColumn('status');
  const doctorCol = table.getColumn('doctorId');
  const roomCol = table.getColumn('roomName');

  const searchValue = searchEngine.query;
  const dateValue = (dateCol?.getFilterValue() as string) ?? '';
  const statusValue = (statusCol?.getFilterValue() as string[]) ?? [];
  const doctorValue = doctorCol?.getFilterValue() as string | string[] | undefined;
  const roomValue = roomCol?.getFilterValue() as string | string[] | undefined;

  const doctorOptions = useMemo<Option[]>(() => {
    return (doctorCol?.columnDef.meta as { options?: Option[] } | undefined)?.options ?? [];
  }, [doctorCol]);

  const roomOptions = useMemo<Option[]>(() => {
    return (roomCol?.columnDef.meta as { options?: Option[] } | undefined)?.options ?? [];
  }, [roomCol]);

  const hasDateFilter = Boolean(dateValue && String(dateValue).trim().length > 0);
  const hasStatusFilter = Array.isArray(statusValue) && statusValue.length > 0;
  const hasDoctorFilter = Boolean(
    doctorValue &&
      (Array.isArray(doctorValue) ? doctorValue.length > 0 : String(doctorValue).trim().length > 0)
  );
  const hasRoomFilter = Boolean(
    roomValue &&
      (Array.isArray(roomValue) ? roomValue.length > 0 : String(roomValue).trim().length > 0)
  );

  const isFiltered =
    Boolean(searchValue) ||
    hasDateFilter ||
    hasStatusFilter ||
    hasDoctorFilter ||
    hasRoomFilter ||
    table.getState().columnFilters.length > 0;

  const todayIso = useMemo(() => getClinicTodayDateString(), []);

  const handleToggleStatus = (val: string) => {
    const current = Array.isArray(statusValue) ? [...statusValue] : [];
    const idx = current.indexOf(val);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(val);
    }
    statusCol?.setFilterValue(current.length > 0 ? current : undefined);
  };

  const handleReset = () => {
    searchEngine.clearQuery();
    patientCol?.setFilterValue(undefined);
    dateCol?.setFilterValue(undefined);
    statusCol?.setFilterValue(undefined);
    doctorCol?.setFilterValue(undefined);
    roomCol?.setFilterValue(undefined);
    table.resetColumnFilters();
    onReset?.();
  };

  return (
    <>
      <div className={cn('flex flex-col gap-2 font-sans select-none', className)}>
        {/* Minimalist Horizontal Filter Dock */}
        <div className='flex items-center justify-between gap-1.5 w-full overflow-x-auto scrollbar-none py-0.5'>
          <div className='flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-none'>
            {/* 1. Search Engine Icon Trigger */}
            <SearchEngineTrigger
              config={searchEngine.config}
              isOpen={searchEngine.isOpen}
              onOpen={searchEngine.open}
              ariaLabel='Cari antrean pasien'
            />

            {/* 2. Date Filter Icon Button */}
            <Button
              type='button'
              variant={hasDateFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('date')}
              aria-label='Filter Tanggal Booking'
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

            {/* 3. Status Filter Icon Button */}
            <Button
              type='button'
              variant={hasStatusFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('status')}
              aria-label='Filter Status Antrean'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasStatusFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.activity className='size-4' />
              {hasStatusFilter && (
                <span className='absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-mono font-bold flex items-center justify-center leading-none ring-1 ring-card'>
                  {statusValue.length}
                </span>
              )}
            </Button>

            {/* 4. Doctor Filter Icon Button */}
            <Button
              type='button'
              variant={hasDoctorFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('doctor')}
              aria-label='Filter Dokter'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasDoctorFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.stethoscope className='size-4' />
              {hasDoctorFilter && (
                <span className='absolute -top-1 -right-1 size-2 rounded-full bg-primary-foreground ring-2 ring-primary' />
              )}
            </Button>

            {/* 5. Room Filter Icon Button */}
            <Button
              type='button'
              variant={hasRoomFilter ? 'primary' : 'outline'}
              size='icon'
              onClick={() => setOpenDrawer('room')}
              aria-label='Filter Ruangan'
              className={cn(
                'size-8.5 rounded-xl relative cursor-pointer shrink-0',
                hasRoomFilter && 'shadow-2xs font-bold'
              )}
            >
              <Icons.mapPin className='size-4' />
              {hasRoomFilter && (
                <span className='absolute -top-1 -right-1 size-2 rounded-full bg-primary-foreground ring-2 ring-primary' />
              )}
            </Button>

            {/* 6. Export Button */}
            <AppointmentExportButton variant='icon' />
          </div>

          {/* 7. Reset Filter Button (Global on Dock) */}
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
            {hasDateFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Tgl: {dateValue}</span>
                <button
                  type='button'
                  onClick={() => dateCol?.setFilterValue(undefined)}
                  aria-label='Hapus filter tanggal'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasStatusFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Status: {statusValue.length}</span>
                <button
                  type='button'
                  onClick={() => statusCol?.setFilterValue(undefined)}
                  aria-label='Hapus filter status'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasDoctorFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Dokter</span>
                <button
                  type='button'
                  onClick={() => doctorCol?.setFilterValue(undefined)}
                  aria-label='Hapus filter dokter'
                  className='hover:text-destructive cursor-pointer'
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            )}
            {hasRoomFilter && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0'>
                <span>Ruangan</span>
                <button
                  type='button'
                  onClick={() => roomCol?.setFilterValue(undefined)}
                  aria-label='Hapus filter ruangan'
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

      {/* Drawer 1: Calendar Date Picker (Alur Reservasi Kanonikal) */}
      <Drawer
        open={openDrawer === 'date'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Pilih Tanggal Janji Temu</DrawerTitle>
            <DrawerDescription>Tampilkan antrean berdasarkan tanggal kunjungan klinik</DrawerDescription>
          </DrawerHeader>
          <div className='p-4 pt-1'>
            <CustomCalendar
              value={dateValue || ''}
              onChange={(isoStr) => {
                dateCol?.setFilterValue(isoStr);
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
                dateCol?.setFilterValue(todayIso);
                setOpenDrawer(null);
              }}
              className='px-6 font-semibold text-xs cursor-pointer'
            >
              Hari Ini
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer 2: Status Multi-Select Filter */}
      <Drawer
        open={openDrawer === 'status'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Filter Status Antrean</DrawerTitle>
            <DrawerDescription>Pilih satu atau beberapa status antrean untuk ditampilkan</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-wrap gap-2 p-4 pt-1'>
            {APPOINTMENT_STATUS_OPTIONS.map((opt) => {
              const isSelected = statusValue.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => handleToggleStatus(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none flex items-center gap-1.5',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-foreground border-border/60 hover:bg-muted'
                  )}
                >
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

      {/* Drawer 3: Doctor Filter */}
      <Drawer
        open={openDrawer === 'doctor'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Pilih Dokter</DrawerTitle>
            <DrawerDescription>Tampilkan antrean yang ditangani dokter tertentu</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-col gap-1.5 p-4 pt-1 max-h-[50vh] overflow-y-auto'>
            <button
              type='button'
              onClick={() => {
                doctorCol?.setFilterValue(undefined);
                setOpenDrawer(null);
              }}
              className={cn(
                'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors flex items-center justify-between cursor-pointer select-none',
                !doctorValue
                  ? 'bg-primary/10 text-primary border-primary/40 font-semibold'
                  : 'bg-card border-border/40 hover:bg-muted/50 text-foreground'
              )}
            >
              <span>Semua Dokter</span>
              {!doctorValue && <Icons.check className='size-4 text-primary' />}
            </button>
            {doctorOptions.map((doc) => {
              const isSelected =
                doctorValue === doc.value ||
                (Array.isArray(doctorValue) && doctorValue.includes(doc.value));
              return (
                <button
                  key={doc.value}
                  type='button'
                  onClick={() => {
                    doctorCol?.setFilterValue(doc.value);
                    setOpenDrawer(null);
                  }}
                  className={cn(
                    'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors flex items-center justify-between cursor-pointer select-none',
                    isSelected
                      ? 'bg-primary/10 text-primary border-primary/40 font-semibold'
                      : 'bg-card border-border/40 hover:bg-muted/50 text-foreground'
                  )}
                >
                  <div className='flex items-center gap-2'>
                    {doc.value === 'unassigned' ? (
                      <Icons.userX className='size-4 text-amber-500' />
                    ) : (
                      <Icons.stethoscope className='size-4 text-primary' />
                    )}
                    <span>{doc.label}</span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    {doc.count !== undefined && (
                      <span className='px-1.5 py-0.5 rounded-full bg-muted text-[11px] font-mono text-muted-foreground'>
                        {doc.count}
                      </span>
                    )}
                    {isSelected && <Icons.check className='size-4 text-primary' />}
                  </div>
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

      {/* Drawer 4: Room Filter */}
      <Drawer
        open={openDrawer === 'room'}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)}
      >
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Pilih Ruangan</DrawerTitle>
            <DrawerDescription>Tampilkan antrean pada ruangan poliklinik tertentu</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-col gap-1.5 p-4 pt-1 max-h-[50vh] overflow-y-auto'>
            <button
              type='button'
              onClick={() => {
                roomCol?.setFilterValue(undefined);
                setOpenDrawer(null);
              }}
              className={cn(
                'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors flex items-center justify-between cursor-pointer select-none',
                !roomValue
                  ? 'bg-primary/10 text-primary border-primary/40 font-semibold'
                  : 'bg-card border-border/40 hover:bg-muted/50 text-foreground'
              )}
            >
              <span>Semua Ruangan</span>
              {!roomValue && <Icons.check className='size-4 text-primary' />}
            </button>
            {roomOptions.map((room) => {
              const isSelected =
                roomValue === room.value ||
                (Array.isArray(roomValue) && roomValue.includes(room.value));
              return (
                <button
                  key={room.value}
                  type='button'
                  onClick={() => {
                    roomCol?.setFilterValue(room.value);
                    setOpenDrawer(null);
                  }}
                  className={cn(
                    'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors flex items-center justify-between cursor-pointer select-none',
                    isSelected
                      ? 'bg-primary/10 text-primary border-primary/40 font-semibold'
                      : 'bg-card border-border/40 hover:bg-muted/50 text-foreground'
                  )}
                >
                  <div className='flex items-center gap-2'>
                    <Icons.mapPin className='size-4 text-primary' />
                    <span>{room.label}</span>
                  </div>
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
    </>
  );
}
