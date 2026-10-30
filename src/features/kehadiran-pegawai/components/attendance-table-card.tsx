'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { DataTableBulkActions } from '@/components/ui/table/data-table-bulk-actions';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { ExportDialog } from '@/features/export';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog, type useStateSearchEngine } from '@/components/search-engine';
import {
  CANONICAL_ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LABELS
} from '../constants/attendance-status.constants';
import { formatWorkDuration, formatPresenceTimestamp } from '../utils/duration-format';
import { useCheckoutAttendanceMutation } from '../api/mutations';
import { EarlyCheckoutModal } from './early-checkout-modal';
import { AttendanceMobileCards } from './attendance-mobile-cards';
import { AttendanceDetailSheet } from './attendance-detail-sheet';
import type { useAttendanceFilterState } from '../model/useAttendanceFilterState';
import type { useAttendanceDynamicOptions } from '../model/useAttendanceDynamicOptions';
import type { StaffAttendance } from '../api/types';

interface AttendanceTableCardProps {
  records: StaffAttendance[];
  total: number;
  filterState: ReturnType<typeof useAttendanceFilterState>;
  dynamicOptions: ReturnType<typeof useAttendanceDynamicOptions>;
  searchEngine: ReturnType<typeof useStateSearchEngine>;
  isCompact?: boolean;
  headerExtra?: React.ReactNode;
  className?: string;
}

export function AttendanceTableCard({
  records: _records,
  total,
  filterState,
  dynamicOptions,
  searchEngine,
  isCompact = false,
  headerExtra,
  className
}: AttendanceTableCardProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exportRow, setExportRow] = useState<StaffAttendance | null>(null);
  const [detailRow, setDetailRow] = useState<StaffAttendance | null>(null);
  const [earlyCheckoutTarget, setEarlyCheckoutTarget] = useState<{
    staffId: string;
    staffName: string;
  } | null>(null);

  const checkoutMutation = useCheckoutAttendanceMutation();

  const handleTriggerCheckout = async (staffId: string, staffName: string, notes?: string) => {
    try {
      await checkoutMutation.mutateAsync({ staffId, staffName, notes });
      setEarlyCheckoutTarget(null);
      setDetailRow(null);
    } catch (err: unknown) {
      const errObj = err as
        | {
            code?: string;
            problemDetails?: {
              code?: string;
              requiresNotes?: boolean;
              details?: { requiresNotes?: boolean };
            };
          }
        | undefined;
      const errCode = errObj?.code || errObj?.problemDetails?.code;
      if (
        errCode === 'EARLY_DEPARTURE_NOTES_REQUIRED' ||
        errObj?.problemDetails?.requiresNotes ||
        errObj?.problemDetails?.details?.requiresNotes
      ) {
        setDetailRow(null);
        setEarlyCheckoutTarget({ staffId, staffName });
      }
    }
  };

  const displayedRecords = filterState.displayedRecords;

  const isAllSelected =
    displayedRecords.length > 0 && displayedRecords.every((r) => selectedIds.includes(r.id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedRecords.map((r) => r.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div
      className={cn(
        'flex flex-1 flex-col h-full min-h-0 overflow-hidden font-sans select-none gap-2.5',
        className
      )}
    >
      {/* 1. Generic Master Responsive Facet Toolbox (Hanya muncul jika bukan mode compact, karena pada mode compact kontrol sudah dipindahkan ke header atas) */}
      {!isCompact && (
        <ResponsiveFacetToolbox
          searchQuery={filterState.params.search || ''}
          onSearchChange={(q) => filterState.changeFilter({ search: q })}
          searchPlaceholder='Cari nama / ID staf...'
          onOpenSearchDialog={searchEngine.open}
          dateFilter={{
            label: 'Tanggal',
            selectedDate: filterState.dateFilterObj,
            onSelectDate: filterState.setDateFilterObj,
            resetLabel: 'Hari Ini'
          }}
          facets={dynamicOptions.facetGroups}
          isFiltered={filterState.isFiltered}
          onResetAll={filterState.resetFilter}
          activeFilterCount={filterState.activeFilterCount}
          extraRightSlot={headerExtra}
          isCompact={false}
        />
      )}

      {/* 3. Search Engine Dialog (Shared with Doctor Schedule) */}
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      {/* 4. Desktop View: Data Table with Sticky Right Action Column */}
      <div className='hidden md:flex relative flex-1 min-h-0'>
        <div className='absolute inset-0 flex overflow-hidden rounded-[var(--radius)] border border-border/40 bg-card shadow-xs'>
          <ScrollArea className='h-full w-full'>
            <Table>
              <TableHeader className='bg-muted sticky top-0 z-20 border-b border-border/40'>
                <TableRow className='hover:bg-transparent border-b border-border/40'>
                  <TableHead className='h-10 w-10 px-2.5 text-center'>
                    <Checkbox
                      checked={isAllSelected || (isSomeSelected && 'indeterminate')}
                      onCheckedChange={toggleSelectAll}
                      aria-label='Pilih semua'
                    />
                  </TableHead>
                  <TableHead className='h-10 px-3 text-xs font-semibold text-muted-foreground min-w-[170px]'>
                    Nama Staf
                  </TableHead>
                  <TableHead className='h-10 px-3 text-xs font-semibold text-muted-foreground min-w-[95px]'>
                    Kategori
                  </TableHead>
                  <TableHead className='h-10 px-3 text-xs font-semibold text-muted-foreground min-w-[100px]'>
                    Jam Masuk
                  </TableHead>
                  <TableHead className='h-10 px-3 text-xs font-semibold text-muted-foreground min-w-[110px]'>
                    Jam Pulang
                  </TableHead>
                  <TableHead className='h-10 px-3 text-xs font-semibold text-muted-foreground min-w-[90px]'>
                    Durasi
                  </TableHead>
                  <TableHead className='h-10 px-3 text-xs font-semibold text-muted-foreground min-w-[110px]'>
                    Status
                  </TableHead>
                  <TableHead className='h-10 px-3 text-xs font-semibold text-muted-foreground min-w-[85px]'>
                    Shift
                  </TableHead>
                  {/* Sticky Right Action Header (100% Solid Opacity dengan Pill Total Staf) */}
                  <TableHead className='sticky right-0 bg-muted z-30 shadow-[-6px_0_10px_-2px_rgba(0,0,0,0.1)] h-10 min-w-[105px] px-2.5 text-right'>
                    <div className='flex items-center justify-end'>
                      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold font-mono bg-background/80 border border-border/70 text-muted-foreground shadow-2xs whitespace-nowrap'>
                        {filterState.isFiltered
                          ? `${displayedRecords.length}/${total}`
                          : `${total}`}{' '}
                        staf
                      </span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {displayedRecords.length === 0 ? (
                  <TableRow className='hover:bg-transparent'>
                    <TableCell colSpan={9} className='h-full p-4 sm:p-8 text-center align-middle'>
                      <EmptyState
                        icon={Icons.inbox}
                        title='Belum ada data presensi'
                        description='Data presensi pegawai akan ditampilkan di sini setelah scan atau input tercatat.'
                        className='size-full border-0 bg-transparent py-10 sm:py-16'
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedRecords.map((row) => {
                    const isSelected = selectedIds.includes(row.id);
                    const isLate = row.status === CANONICAL_ATTENDANCE_STATUS.LATE;
                    const isPresent = row.status === CANONICAL_ATTENDANCE_STATUS.PRESENT;
                    const roleName = row.roleName || row.kategori;
                    const statusLabel = ATTENDANCE_STATUS_LABELS[row.status] || row.status;
                    const shiftLabel = row.shiftLabel || '-';

                    const jamMasuk = row.checkInAt
                      ? formatPresenceTimestamp(row.checkInAt, true)
                      : (row.waktu_presensi ?? '-');

                    const outTime = row.checkOutAt
                      ? formatPresenceTimestamp(row.checkOutAt, true)
                      : null;

                    const durasiStr = formatWorkDuration({
                      checkInAt: row.checkInAt,
                      checkOutAt: row.checkOutAt,
                      validatedHours: row.validatedDurationHours
                    });

                    return (
                      <TableRow
                        key={row.id}
                        data-state={isSelected && 'selected'}
                        className={cn(
                          'border-b border-border/40 transition-colors cursor-pointer group',
                          isSelected ? 'bg-muted/40' : 'hover:bg-muted/25'
                        )}
                        onClick={() => setDetailRow(row)}
                      >
                        {/* Checkbox */}
                        <TableCell
                          className='px-2.5 text-center'
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectRow(row.id);
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelectRow(row.id)}
                            aria-label={`Pilih ${row.nama_staf}`}
                          />
                        </TableCell>

                        {/* Nama Staf */}
                        <TableCell className='px-3 py-2.5 font-medium text-foreground'>
                          <div className='flex items-center gap-2.5'>
                            <Avatar className='size-7 rounded-md ring-1 ring-border/40 shrink-0'>
                              <AvatarImage
                                src={row.avatar || DEFAULT_AVATAR_PATH}
                                alt={row.nama_staf}
                                className='rounded-md object-cover'
                              />
                              <AvatarFallback className='rounded-md p-0 bg-transparent overflow-hidden'>
                                <Image
                                  src={DEFAULT_AVATAR_PATH}
                                  alt={row.nama_staf}
                                  width={28}
                                  height={28}
                                  unoptimized
                                  className='size-full rounded-md object-cover'
                                />
                              </AvatarFallback>
                            </Avatar>
                            <div className='min-w-0'>
                              <div className='flex items-center gap-1.5'>
                                <span className='truncate font-semibold block text-xs'>
                                  {row.nama_staf}
                                </span>
                                {row.isReplacement && (
                                  <span
                                    title={
                                      row.replacedStaffName
                                        ? `Menggantikan ${row.replacedStaffName}`
                                        : 'Shift Pengganti'
                                    }
                                    className='inline-flex items-center px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25 shrink-0'
                                  >
                                    Pengganti
                                  </span>
                                )}
                              </div>
                              <span className='text-[10px] text-muted-foreground font-mono'>
                                {row.id_staf}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Kategori / Peran */}
                        <TableCell className='px-3 py-2.5'>
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-semibold border',
                              row.isClinical
                                ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20'
                                : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                            )}
                          >
                            {roleName}
                          </span>
                        </TableCell>

                        {/* Jam Masuk */}
                        <TableCell className='px-3 py-2.5 font-mono text-xs font-semibold text-foreground'>
                          {jamMasuk}
                        </TableCell>

                        {/* Jam Pulang */}
                        <TableCell className='px-3 py-2.5'>
                          {outTime ? (
                            <div className='flex items-center gap-1.5'>
                              <span className='font-mono text-xs font-semibold text-foreground'>
                                {outTime}
                              </span>
                              {row.isEarlyDeparture && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className='inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 cursor-help'>
                                      <Icons.alertCircle className='size-3 shrink-0' />
                                      <span>Pulang Cepat</span>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side='top' className='text-xs max-w-xs'>
                                    <p className='font-semibold'>
                                      Pulang Lebih Awal (Early Departure)
                                    </p>
                                    <p className='text-muted-foreground mt-0.5'>
                                      {row.notes
                                        ? `Alasan: ${row.notes}`
                                        : 'Dicatat sebelum jendela kepulangan dinas.'}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          ) : (
                            <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'>
                              <span className='size-1.5 rounded-full bg-amber-500 animate-pulse' />
                              <span>Sedang Dinas</span>
                            </span>
                          )}
                        </TableCell>

                        {/* Durasi */}
                        <TableCell className='px-3 py-2.5 text-xs text-muted-foreground font-medium'>
                          {durasiStr}
                        </TableCell>

                        {/* Status Presensi */}
                        <TableCell className='px-3 py-2.5'>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-bold border',
                              isLate
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                                : isPresent
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                                  : 'bg-muted text-muted-foreground border-border/50'
                            )}
                          >
                            <span
                              className={cn(
                                'size-1.5 rounded-full shrink-0',
                                isLate
                                  ? 'bg-amber-500'
                                  : isPresent
                                    ? 'bg-emerald-500'
                                    : 'bg-muted-foreground'
                              )}
                            />
                            <span>{statusLabel}</span>
                          </span>
                        </TableCell>

                        {/* Shift */}
                        <TableCell className='px-3 py-2.5 font-semibold text-primary text-xs'>
                          {shiftLabel}
                        </TableCell>

                        {/* Sticky Right Action Column (100% Solid Opacity - Zero See-Through) */}
                        <TableCell
                          className={cn(
                            'sticky right-0 z-10 shadow-[-6px_0_10px_-2px_rgba(0,0,0,0.1)] px-2.5 text-right transition-colors',
                            isSelected ? 'bg-muted' : 'bg-card group-hover:bg-muted'
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className='flex items-center justify-end gap-1'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => setExportRow(row)}
                              title={`Unduh Laporan Riwayat Presensi ${row.nama_staf}`}
                              className='size-7 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10'
                            >
                              <Icons.download className='size-3.5' />
                            </Button>

                            {row.checkOutAt ? (
                              <span className='inline-flex items-center gap-1 text-xs font-medium text-muted-foreground pr-1'>
                                <Icons.check className='size-3 text-emerald-500' />
                                <span>Selesai</span>
                              </span>
                            ) : (
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                disabled={checkoutMutation.isPending}
                                onClick={() =>
                                  handleTriggerCheckout(row.staffProfileId ?? '', row.nama_staf)
                                }
                                className='h-6.5 text-[11px] font-semibold px-2 rounded-md border-border/70 hover:bg-primary/10 hover:text-primary gap-1 cursor-pointer'
                                title={`Catat presensi pulang untuk ${row.nama_staf}`}
                              >
                                <Icons.logout className='size-3 text-primary' />
                                <span>Checkout</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </div>
      </div>

      {/* 5. Mobile View: Responsive Master Cards (Hidden on Desktop) */}
      <div className='block md:hidden flex-1 overflow-y-auto min-h-0'>
        <AttendanceMobileCards
          records={displayedRecords}
          onTriggerCheckout={(staffId, staffName) => handleTriggerCheckout(staffId, staffName)}
          isCheckoutPending={checkoutMutation.isPending}
        />
      </div>

      {/* 6. Bulk Actions */}
      <DataTableBulkActions
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        entityName='staf'
      >
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={checkoutMutation.isPending}
          onClick={async () => {
            const targets = displayedRecords.filter(
              (r) => selectedIds.includes(r.id) && !r.checkOutAt
            );
            if (targets.length === 0) {
              return;
            }
            for (const t of targets) {
              await handleTriggerCheckout(t.staffProfileId ?? '', t.nama_staf);
            }
            setSelectedIds([]);
          }}
          className='h-7 text-xs font-semibold px-2.5 gap-1.5 rounded-lg'
        >
          <Icons.logout className='size-3 text-primary' />
          <span>Checkout Terpilih</span>
        </Button>
      </DataTableBulkActions>

      {/* 7. Modal Unduh Laporan Riwayat Presensi Staf Individu */}
      <ExportDialog
        open={Boolean(exportRow)}
        onOpenChange={(open) => !open && setExportRow(null)}
        exportType='attendance'
        entityName={exportRow?.nama_staf}
        parameters={{
          staffProfileId: exportRow?.staffProfileId
        }}
        enableMonthPicker={true}
      />

      {/* 8. Slide-Over Detail Record Pegawai */}
      <AttendanceDetailSheet
        record={detailRow}
        isOpen={Boolean(detailRow)}
        onClose={() => setDetailRow(null)}
        onCheckout={(staffId, staffName) => handleTriggerCheckout(staffId, staffName)}
        isCheckoutPending={checkoutMutation.isPending}
      />

      {/* 9. Modal Presensi Pulang Lebih Awal */}
      <EarlyCheckoutModal
        isOpen={Boolean(earlyCheckoutTarget)}
        onClose={() => setEarlyCheckoutTarget(null)}
        staffId={earlyCheckoutTarget?.staffId || ''}
        staffName={earlyCheckoutTarget?.staffName || ''}
        isLoading={checkoutMutation.isPending}
        onConfirm={async (notes) => {
          if (earlyCheckoutTarget) {
            await handleTriggerCheckout(
              earlyCheckoutTarget.staffId,
              earlyCheckoutTarget.staffName,
              notes
            );
          }
        }}
      />
    </div>
  );
}
