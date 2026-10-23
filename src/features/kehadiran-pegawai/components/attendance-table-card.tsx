'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AttendanceDigitalClock } from './attendance-digital-clock';
import { useCheckoutAttendanceMutation } from '../api/mutations';
import { DataTableBulkActions } from '@/components/ui/table/data-table-bulk-actions';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { ExportDialog } from '@/features/export';
import type {
  StaffAttendance,
  AttendanceFilterParams,
  AvailableAttendanceFilters,
  FilterOption
} from '../api/types';

interface AttendanceTableCardProps {
  records: StaffAttendance[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  params: AttendanceFilterParams;
  onFilterChange: (newParams: Partial<AttendanceFilterParams>) => void;
  onResetFilter: () => void;
  availableFilters?: AvailableAttendanceFilters;
  headerExtra?: React.ReactNode;
  className?: string;
}

type TabFilter = 'all' | 'active' | 'completed';

export function AttendanceTableCard({
  records,
  total,
  page,
  limit,
  totalPages,
  params,
  onFilterChange,
  onResetFilter,
  availableFilters,
  headerExtra,
  className
}: AttendanceTableCardProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [exportRow, setExportRow] = useState<StaffAttendance | null>(null);
  const checkoutMutation = useCheckoutAttendanceMutation();

  const isFiltered = Boolean(
    params.search ||
    (params.shift && params.shift !== 'all') ||
    (params.status && params.status !== 'all') ||
    (params.category && params.category !== 'all')
  );

  // Dynamic filter options from DB SSOT
  const shiftOptions: FilterOption[] = useMemo(() => {
    if (availableFilters?.shifts?.length) return availableFilters.shifts;
    const unique = Array.from(new Set(records.map((r) => r.shift).filter(Boolean)));
    return [{ label: 'Semua Shift', value: 'all' }, ...unique.map((s) => ({ label: s, value: s }))];
  }, [availableFilters?.shifts, records]);

  const statusOptions: FilterOption[] = useMemo(() => {
    if (availableFilters?.statuses?.length) return availableFilters.statuses;
    const unique = Array.from(new Set(records.map((r) => r.status).filter(Boolean)));
    return [
      { label: 'Semua Status', value: 'all' },
      ...unique.map((st) => ({ label: st, value: st }))
    ];
  }, [availableFilters?.statuses, records]);

  const categoryOptions: FilterOption[] = useMemo(() => {
    if (availableFilters?.categories?.length) return availableFilters.categories;
    const unique = Array.from(new Set(records.map((r) => r.kategori).filter(Boolean)));
    return [
      { label: 'Semua Kategori', value: 'all' },
      ...unique.map((c) => ({ label: c, value: c }))
    ];
  }, [availableFilters?.categories, records]);

  // Tab-filtered records
  const displayedRecords = useMemo(() => {
    if (activeTab === 'active') return records.filter((r) => !r.checkOutAt);
    if (activeTab === 'completed') return records.filter((r) => Boolean(r.checkOutAt));
    return records;
  }, [records, activeTab]);

  const counts = useMemo(() => {
    const active = records.filter((r) => !r.checkOutAt).length;
    const completed = records.filter((r) => Boolean(r.checkOutAt)).length;
    return { all: records.length, active, completed };
  }, [records]);

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
      {/* 1. Harmonized Toolbar & Tab Navigation */}
      <div className='shrink-0 flex flex-wrap items-center justify-between gap-2.5'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          {/* 3 Status Filter Tabs */}
          <div className='inline-flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/50 text-xs font-medium'>
            <button
              type='button'
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer text-xs',
                activeTab === 'all'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Semua</span>
              <span className='px-1.5 py-0.2 rounded-full text-[10px] bg-muted text-muted-foreground font-mono'>
                {counts.all}
              </span>
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('active')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer text-xs',
                activeTab === 'active'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className='size-1.5 rounded-full bg-amber-500 animate-pulse' />
              <span>Sedang Dinas</span>
              <span className='px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono'>
                {counts.active}
              </span>
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('completed')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer text-xs',
                activeTab === 'completed'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className='size-1.5 rounded-full bg-emerald-500' />
              <span>Selesai Dinas</span>
              <span className='px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono'>
                {counts.completed}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className='relative flex-1 min-w-[160px] max-w-[220px]'>
            <Icons.search className='absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none' />
            <Input
              value={params.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
              placeholder='Cari nama / ID staf...'
              className='h-8 pl-8 pr-7 text-xs bg-background border-border/70 rounded-md shadow-2xs'
            />
            {params.search && (
              <button
                type='button'
                onClick={() => onFilterChange({ search: '', page: 1 })}
                className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer'
              >
                <Icons.close className='size-3' />
              </button>
            )}
          </div>

          {/* Date Picker */}
          <div className='flex items-center h-8 px-2.5 bg-background border border-dashed border-border/70 rounded-md shadow-2xs gap-1.5 text-xs text-foreground shrink-0'>
            <Icons.calendar className='size-3.5 text-muted-foreground shrink-0' />
            <input
              type='date'
              value={params.date || ''}
              onChange={(e) => onFilterChange({ date: e.target.value, page: 1 })}
              className='bg-transparent text-xs text-foreground border-none outline-hidden cursor-pointer font-sans'
              aria-label='Filter tanggal presensi'
            />
          </div>

          {/* Shift Filter */}
          <Select
            value={params.shift || 'all'}
            onValueChange={(val) => onFilterChange({ shift: val === 'all' ? null : val, page: 1 })}
          >
            <SelectTrigger className='h-8 text-xs w-auto min-w-[115px] px-2.5 gap-1.5 bg-background border-border/70 border-dashed rounded-md shadow-2xs'>
              <SelectValue placeholder='Shift' />
            </SelectTrigger>
            <SelectContent>
              {shiftOptions.map((s) => (
                <SelectItem key={s.value} value={s.value} className='text-xs'>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Kategori Filter */}
          <Select
            value={params.category || 'all'}
            onValueChange={(val) =>
              onFilterChange({ category: val === 'all' ? null : val, page: 1 })
            }
          >
            <SelectTrigger className='h-8 text-xs w-auto min-w-[125px] px-2.5 gap-1.5 bg-background border-border/70 border-dashed rounded-md shadow-2xs'>
              <SelectValue placeholder='Kategori' />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((c) => (
                <SelectItem key={c.value} value={c.value} className='text-xs'>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Button */}
          {isFiltered && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onResetFilter}
              className='h-8 text-xs border-dashed border-border/70 px-2.5 gap-1.5 rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground'
            >
              <Icons.refresh className='size-3' />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* Right Toolbar Extra Actions & Digital Clock */}
        <div className='flex items-center gap-1.5 shrink-0'>
          <AttendanceDigitalClock />
          {headerExtra}
        </div>
      </div>

      {/* 2. Structured Data Table with Explicit Check-In and Check-Out Columns */}
      <div className='relative flex flex-1 min-h-0'>
        <div className='absolute inset-0 flex overflow-hidden rounded-xl border border-border/40 bg-card shadow-xs'>
          <ScrollArea className='h-full w-full'>
            <Table>
              <TableHeader className='bg-muted/40 sticky top-0 z-20 border-b border-border/40 backdrop-blur-xs'>
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
                  <TableHead className='h-10 w-24 px-3 text-right'>
                    <span className='sr-only'>Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className='h-[340px] p-6 text-center'>
                      <EmptyState
                        icon={Icons.inbox}
                        title='Belum ada data presensi'
                        description='Data presensi pegawai akan ditampilkan di sini setelah scan atau input tercatat.'
                        className='min-h-[300px] border-0 bg-transparent'
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedRecords.map((row) => {
                    const initials = row.nama_staf
                      .replace('dr. ', '')
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    const isDoctor = row.kategori === 'Dokter';
                    const isSelected = selectedIds.includes(row.id);
                    const isLate = row.rawStatus === 'late' || row.status === 'Terlambat';
                    const isPresent = row.rawStatus === 'present' || row.status === 'Hadir';

                    // Parse formatted check-in & check-out times
                    const jamMasuk = row.checkInAt
                      ? new Date(row.checkInAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : row.waktu_presensi || row.waktu || '-';

                    const jamPulang = row.checkOutAt
                      ? new Date(row.checkOutAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : null;

                    const durasiStr = row.validatedDurationHours
                      ? `${row.validatedDurationHours} jam`
                      : row.checkOutAt
                        ? '-'
                        : 'Sedang dinas';

                    return (
                      <TableRow
                        key={row.id}
                        data-state={isSelected && 'selected'}
                        className={cn(
                          'border-b border-border/40 transition-colors cursor-pointer',
                          isSelected ? 'bg-muted/40' : 'hover:bg-muted/25'
                        )}
                        onClick={() => toggleSelectRow(row.id)}
                      >
                        {/* Checkbox */}
                        <TableCell
                          className='px-2.5 text-center'
                          onClick={(e) => e.stopPropagation()}
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
                              {row.avatar && <AvatarImage src={row.avatar} alt={row.nama_staf} />}
                              <AvatarFallback className='bg-primary/10 text-primary font-bold text-[11px] rounded-md'>
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className='min-w-0'>
                              <span className='truncate font-semibold block text-xs'>
                                {row.nama_staf}
                              </span>
                              <span className='text-[10px] text-muted-foreground font-mono'>
                                {row.id_staf}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Kategori */}
                        <TableCell className='px-3 py-2.5'>
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-semibold border',
                              isDoctor
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                                : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20'
                            )}
                          >
                            {row.kategori}
                          </span>
                        </TableCell>

                        {/* Jam Masuk */}
                        <TableCell className='px-3 py-2.5 font-mono text-xs font-semibold text-foreground'>
                          {jamMasuk}
                        </TableCell>

                        {/* Jam Pulang */}
                        <TableCell className='px-3 py-2.5'>
                          {jamPulang ? (
                            <div className='flex items-center gap-1.5'>
                              <span className='font-mono text-xs font-semibold text-foreground'>
                                {jamPulang}
                              </span>
                              {row.isEarlyDeparture && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 cursor-help'>
                                      <Icons.alertCircle className='size-2.5 shrink-0 text-amber-600 dark:text-amber-400' />
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

                        {/* Status Presensi with Clear Semantic Tooltip */}
                        <TableCell className='px-3 py-2.5'>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-bold border cursor-help',
                                  isLate
                                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                                    : isPresent
                                      ? 'bg-success-subtle text-success border-success-border'
                                      : 'bg-muted text-muted-foreground border-border/50'
                                )}
                              >
                                <span
                                  className={cn(
                                    'size-1.5 rounded-full shrink-0',
                                    isLate
                                      ? 'bg-amber-500'
                                      : isPresent
                                        ? 'bg-success'
                                        : 'bg-muted-foreground'
                                  )}
                                />
                                <span>{row.status}</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side='top' className='text-xs max-w-xs'>
                              {isLate
                                ? 'Presensi masuk melewati toleransi keterlambatan shift yang ditentukan klinik.'
                                : isPresent
                                  ? 'Presensi masuk tepat waktu dalam jendela kehadiran shift.'
                                  : `Status presensi: ${row.status}`}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>

                        {/* Shift */}
                        <TableCell className='px-3 py-2.5 font-semibold text-primary-bright text-xs'>
                          {row.shift}
                        </TableCell>

                        {/* Aksi Checkout & Unduh Laporan */}
                        <TableCell
                          className='px-2.5 text-right'
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
                              <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border/50'>
                                <Icons.check className='size-2.5 text-emerald-500' />
                                <span>Selesai</span>
                              </span>
                            ) : (
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                disabled={checkoutMutation.isPending}
                                onClick={() =>
                                  checkoutMutation.mutate({
                                    staffId: row.id_staf,
                                    staffName: row.nama_staf
                                  })
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

      {/* 3. Pagination */}
      {total > 0 && (
        <div className='flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted-foreground'>
          <div className='text-xs text-muted-foreground whitespace-nowrap'>
            {selectedIds.length > 0 ? (
              <>
                <span className='font-semibold text-foreground'>{selectedIds.length}</span> dari{' '}
                {total} baris dipilih.
              </>
            ) : (
              <>{total} data presensi tercatat.</>
            )}
          </div>

          <div className='flex items-center gap-2 sm:gap-4'>
            <div className='hidden items-center space-x-1.5 sm:flex'>
              <p className='text-xs font-medium text-muted-foreground'>Baris:</p>
              <Select
                value={`${limit}`}
                onValueChange={(val) => onFilterChange({ limit: Number(val), page: 1 })}
              >
                <SelectTrigger className='h-7 w-14 text-xs bg-background border-border/70 text-foreground'>
                  <SelectValue placeholder={limit} />
                </SelectTrigger>
                <SelectContent side='top'>
                  {[8, 16, 24, 32].map((s) => (
                    <SelectItem key={s} value={`${s}`} className='text-xs'>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='text-xs font-medium text-foreground whitespace-nowrap'>
              Halaman {page} dari {totalPages || 1}
            </div>

            <div className='flex items-center space-x-1'>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='size-7'
                onClick={() => onFilterChange({ page: Math.max(1, page - 1) })}
                disabled={page <= 1}
              >
                <Icons.chevronLeft className='size-3.5' />
              </Button>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='size-7'
                onClick={() => onFilterChange({ page: Math.min(totalPages, page + 1) })}
                disabled={page >= totalPages}
              >
                <Icons.chevronRight className='size-3.5' />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bulk Actions */}
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
              toast.info('Semua staf terpilih sudah checkout dinas.');
              return;
            }
            for (const t of targets) {
              await checkoutMutation.mutateAsync({ staffId: t.id_staf, staffName: t.nama_staf });
            }
            setSelectedIds([]);
          }}
          className='h-7 text-xs font-semibold px-2.5 gap-1.5 rounded-lg'
        >
          <Icons.logout className='size-3 text-primary' />
          <span>Checkout Terpilih</span>
        </Button>
      </DataTableBulkActions>

      {/* 5. Modal Unduh Laporan Riwayat Presensi Staf Individu (Per-Record) */}
      <ExportDialog
        open={Boolean(exportRow)}
        onOpenChange={(open) => !open && setExportRow(null)}
        exportType='attendance'
        entityName={exportRow?.nama_staf}
        parameters={{
          staffProfileId: exportRow?.staffProfileId || exportRow?.id_staf
        }}
        enableMonthPicker={true}
      />
    </div>
  );
}
