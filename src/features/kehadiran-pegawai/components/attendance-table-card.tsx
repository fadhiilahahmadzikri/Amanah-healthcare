'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { AttendanceDigitalClock } from './attendance-digital-clock';
import { AttendanceEditModal } from './attendance-edit-modal';
import { AttendanceDeleteModal } from './attendance-delete-modal';
import { DataTableBulkActions } from '@/components/ui/table/data-table-bulk-actions';
import { Icons } from '@/components/icons';
import { SHIFT_OPTIONS, STATUS_OPTIONS, CATEGORY_OPTIONS } from '../constants/options';
import { cn } from '@/lib/utils';
import type { StaffAttendance, AttendanceFilterParams } from '../api/types';

interface AttendanceTableCardProps {
  records: StaffAttendance[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  params: AttendanceFilterParams;
  onFilterChange: (newParams: Partial<AttendanceFilterParams>) => void;
  onResetFilter: () => void;
  headerExtra?: React.ReactNode;
  className?: string;
}

export function AttendanceTableCard({
  records,
  total,
  page,
  limit,
  totalPages,
  params,
  onFilterChange,
  onResetFilter,
  headerExtra,
  className
}: AttendanceTableCardProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedEditRecord, setSelectedEditRecord] = useState<StaffAttendance | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeleteRecord, setSelectedDeleteRecord] = useState<StaffAttendance | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isFiltered = Boolean(
    params.search ||
    (params.shift && params.shift !== 'all') ||
    (params.status && params.status !== 'all') ||
    (params.category && params.category !== 'all')
  );

  const isAllSelected = records.length > 0 && records.every((r) => selectedIds.includes(r.id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map((r) => r.id));
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
      {/* 1. Harmonized Toolbar (Dilepas langsung seperti Halaman Data Pasien) */}
      <div className='shrink-0 flex flex-wrap items-center justify-between gap-2.5'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          {/* Search Input dengan Icon */}
          <div className='relative flex-1 min-w-[180px] max-w-[240px]'>
            <Icons.search className='absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none' />
            <Input
              value={params.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
              placeholder='Cari nama / ID staf...'
              className='h-8 pl-8 pr-7 text-xs bg-background border-border/70 rounded-md shadow-2xs text-foreground placeholder:text-muted-foreground'
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

          {/* Tanggal Filter (Auto-width menyesuaikan konten) */}
          <div className='flex items-center h-8 px-3 bg-background border border-dashed border-border/70 rounded-md shadow-2xs gap-1.5 w-auto text-xs text-foreground shrink-0 cursor-default'>
            <Icons.calendar className='size-3.5 text-muted-foreground shrink-0' />
            <span className='whitespace-nowrap'>{params.date || '-'}</span>
          </div>

          {/* Shift Filter (Auto-width menyesuaikan isi) */}
          <Select
            value={params.shift || 'all'}
            onValueChange={(val) => onFilterChange({ shift: val === 'all' ? null : val, page: 1 })}
          >
            <SelectTrigger className='h-8 text-xs w-auto min-w-[120px] px-3 gap-2 bg-background border-border/70 border-dashed rounded-md shadow-2xs text-foreground whitespace-nowrap'>
              <SelectValue placeholder='Shift' />
            </SelectTrigger>
            <SelectContent>
              {SHIFT_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value} className='text-xs'>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter (Auto-width menyesuaikan isi) */}
          <Select
            value={params.status || 'all'}
            onValueChange={(val) => onFilterChange({ status: val === 'all' ? null : val, page: 1 })}
          >
            <SelectTrigger className='h-8 text-xs w-auto min-w-[125px] px-3 gap-2 bg-background border-border/70 border-dashed rounded-md shadow-2xs text-foreground whitespace-nowrap'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((st) => (
                <SelectItem key={st.value} value={st.value} className='text-xs'>
                  {st.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Kategori Filter (Auto-width menyesuaikan isi) */}
          <Select
            value={params.category || 'all'}
            onValueChange={(val) =>
              onFilterChange({ category: val === 'all' ? null : val, page: 1 })
            }
          >
            <SelectTrigger className='h-8 text-xs w-auto min-w-[135px] px-3 gap-2 bg-background border-border/70 border-dashed rounded-md shadow-2xs text-foreground whitespace-nowrap'>
              <SelectValue placeholder='Kategori' />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((c) => (
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

        {/* Right Toolbar Extra Actions & Master Digital Clock */}
        <div className='flex items-center gap-1.5 shrink-0'>
          <AttendanceDigitalClock />
          {headerExtra}
        </div>
      </div>

      {/* 2. Harmonized Data Table with Internal ScrollArea (Identical to Data Pasien) */}
      <div className='relative flex flex-1 min-h-0'>
        <div className='absolute inset-0 flex overflow-hidden rounded-xl border border-border/40 bg-card shadow-xs'>
          <ScrollArea className='h-full w-full'>
            <Table>
              <TableHeader className='bg-muted/40 sticky top-0 z-20 border-b border-border/40 backdrop-blur-xs'>
                <TableRow className='hover:bg-transparent border-b border-border/40'>
                  <TableHead className='h-10 w-12 px-3 text-center'>
                    <Checkbox
                      checked={isAllSelected || (isSomeSelected && 'indeterminate')}
                      onCheckedChange={toggleSelectAll}
                      aria-label='Pilih semua'
                    />
                  </TableHead>
                  <TableHead className='h-10 px-4 text-xs font-semibold text-muted-foreground min-w-[180px]'>
                    Nama Staf
                  </TableHead>
                  <TableHead className='h-10 px-4 text-xs font-semibold text-muted-foreground min-w-[100px]'>
                    Kategori
                  </TableHead>
                  <TableHead className='h-10 px-4 text-xs font-semibold text-muted-foreground min-w-[150px]'>
                    Waktu Presensi
                  </TableHead>
                  <TableHead className='h-10 px-4 text-xs font-semibold text-muted-foreground min-w-[100px]'>
                    Waktu
                  </TableHead>
                  <TableHead className='h-10 px-4 text-xs font-semibold text-muted-foreground min-w-[120px]'>
                    Status
                  </TableHead>
                  <TableHead className='h-10 px-4 text-xs font-semibold text-muted-foreground min-w-[90px]'>
                    Shift
                  </TableHead>
                  <TableHead className='h-10 w-12 px-3 text-right'>
                    <span className='sr-only'>Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className='h-[360px] p-6 text-center'>
                      <EmptyState
                        icon={Icons.inbox}
                        title='Belum ada data presensi'
                        description='Data presensi pegawai akan ditampilkan di sini setelah tersedia.'
                        className='min-h-[320px] border-0 bg-transparent'
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((row) => {
                    const initials = row.nama_staf
                      .replace('dr. ', '')
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    const isDoctor = row.kategori === 'Dokter';
                    const isHadir = row.status === 'Hadir';
                    const isSelected = selectedIds.includes(row.id);

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
                        {/* Checkbox Select */}
                        <TableCell
                          className='px-3 text-center'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelectRow(row.id)}
                            aria-label={`Pilih ${row.nama_staf}`}
                          />
                        </TableCell>

                        {/* Nama Staf */}
                        <TableCell className='px-4 py-3 font-medium text-foreground'>
                          <div className='flex items-center gap-3'>
                            <Avatar className='size-8 rounded-md ring-1 ring-border/40 shrink-0'>
                              {row.avatar && <AvatarImage src={row.avatar} alt={row.nama_staf} />}
                              <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs rounded-md'>
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className='min-w-0'>
                              <span className='truncate font-semibold block text-xs sm:text-sm'>
                                {row.nama_staf}
                              </span>
                              <span className='text-[10.5px] text-muted-foreground font-mono'>
                                {row.id_staf}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Kategori */}
                        <TableCell className='px-4 py-3'>
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold leading-none border',
                              isDoctor
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                                : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20'
                            )}
                          >
                            {row.kategori}
                          </span>
                        </TableCell>

                        {/* Waktu Presensi */}
                        <TableCell className='px-4 py-3 text-muted-foreground font-medium text-xs'>
                          {row.waktu_presensi}
                        </TableCell>

                        {/* Waktu */}
                        <TableCell className='px-4 py-3 font-mono font-medium text-foreground text-xs'>
                          {row.waktu}
                        </TableCell>

                        {/* Status */}
                        <TableCell className='px-4 py-3'>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border',
                              isHadir
                                ? 'bg-success-subtle text-success border-success-border'
                                : 'bg-destructive-subtle text-destructive border-destructive-border'
                            )}
                          >
                            <span
                              className={cn(
                                'size-1.5 rounded-full shrink-0',
                                isHadir ? 'bg-success' : 'bg-destructive'
                              )}
                            />
                            <span>{row.status}</span>
                          </span>
                        </TableCell>

                        {/* Shift */}
                        <TableCell className='px-4 py-3 font-semibold text-primary-bright text-xs'>
                          {row.shift}
                        </TableCell>

                        {/* Aksi MoreVert Menu */}
                        <TableCell className='px-3 text-right' onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='size-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md cursor-pointer'
                              >
                                <Icons.ellipsis className='size-3.5' />
                                <span className='sr-only'>Aksi Data Presensi</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='w-44 text-xs font-sans'>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedEditRecord(row);
                                  setIsEditModalOpen(true);
                                }}
                                className='gap-2 py-1.5 cursor-pointer font-medium'
                              >
                                <Icons.edit className='size-3.5 text-primary' />
                                <span>Ubah Presensi</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedDeleteRecord(row);
                                  setIsDeleteModalOpen(true);
                                }}
                                variant='destructive'
                                className='gap-2 py-1.5 cursor-pointer font-medium'
                              >
                                <Icons.trash className='size-3.5' />
                                <span>Hapus Presensi</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* 3. Harmonized DataTablePagination (Standar Data Pasien) */}
      {total > 0 ? (
        <div className='flex flex-wrap items-center justify-between gap-2.5 pt-2 text-xs text-muted-foreground'>
          {/* Left: Row Selection / Total Count */}
          <div className='text-xs text-muted-foreground whitespace-nowrap'>
            {selectedIds.length > 0 ? (
              <>
                <span className='font-semibold text-foreground'>{selectedIds.length}</span> dari{' '}
                {total} baris dipilih.
              </>
            ) : (
              <>{total} baris total.</>
            )}
          </div>

          {/* Right: Rows per page, Page info, & Navigation Controls */}
          <div className='flex items-center gap-2 sm:gap-6'>
            {/* Rows per page */}
            <div className='hidden items-center space-x-2 sm:flex'>
              <p className='text-xs font-medium whitespace-nowrap text-muted-foreground'>
                Baris per halaman
              </p>
              <Select
                value={`${limit}`}
                onValueChange={(val) => onFilterChange({ limit: Number(val), page: 1 })}
              >
                <SelectTrigger className='h-8 w-16 text-xs bg-background border-border/70 text-foreground'>
                  <SelectValue placeholder={limit} />
                </SelectTrigger>
                <SelectContent side='top'>
                  {[8, 16, 24, 32].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`} className='text-xs'>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Page info */}
            <div className='flex items-center justify-center text-xs font-medium whitespace-nowrap text-foreground'>
              Halaman {page} dari {totalPages || 1}
            </div>

            {/* Navigation Controls */}
            <div className='flex items-center space-x-1'>
              <Button
                type='button'
                aria-label='Halaman pertama'
                variant='outline'
                size='icon'
                className='hidden size-8 lg:flex'
                onClick={() => onFilterChange({ page: 1 })}
                disabled={page <= 1}
              >
                <Icons.chevronsLeft className='size-3.5' />
              </Button>
              <Button
                type='button'
                aria-label='Halaman sebelumnya'
                variant='outline'
                size='icon'
                className='size-8'
                onClick={() => onFilterChange({ page: Math.max(1, page - 1) })}
                disabled={page <= 1}
              >
                <Icons.chevronLeft className='size-3.5' />
              </Button>
              <Button
                type='button'
                aria-label='Halaman selanjutnya'
                variant='outline'
                size='icon'
                className='size-8'
                onClick={() => onFilterChange({ page: Math.min(totalPages, page + 1) })}
                disabled={page >= totalPages}
              >
                <Icons.chevronRight className='size-3.5' />
              </Button>
              <Button
                type='button'
                aria-label='Halaman terakhir'
                variant='outline'
                size='icon'
                className='hidden size-8 lg:flex'
                onClick={() => onFilterChange({ page: totalPages })}
                disabled={page >= totalPages}
              >
                <Icons.chevronsRight className='size-3.5' />
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 4. Floating Bulk Actions Toolbar via Unified Master Component */}
      <DataTableBulkActions
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        entityName='staf'
      >
        {/* Action 1: Ubah / Edit Presensi */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                const firstSelected = records.find((r) => selectedIds.includes(r.id));
                if (firstSelected) {
                  setSelectedEditRecord(firstSelected);
                  setIsEditModalOpen(true);
                }
              }}
              className='h-8 text-xs font-semibold px-3 gap-1.5 rounded-xl border-border/70 shadow-2xs hover:bg-muted/80'
            >
              <Icons.edit className='size-3.5 text-primary' />
              <span>Ubah</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top' className='text-xs'>
            {selectedIds.length === 1 ? 'Ubah Data Presensi' : 'Ubah Presensi Terpilih'}
          </TooltipContent>
        </Tooltip>

        {/* Action 2: Set Status Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 text-xs font-semibold px-3 gap-1.5 rounded-xl border-border/70 shadow-2xs hover:bg-muted/80'
            >
              <Icons.badgeCheck className='size-3.5 text-emerald-600 dark:text-emerald-400' />
              <span>Set Status</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='center' side='top' className='w-40 text-xs font-sans'>
            <DropdownMenuItem
              onClick={() => {
                toast.success(`Status ${selectedIds.length} pegawai diubah menjadi Hadir.`);
                setSelectedIds([]);
              }}
              className='gap-2 py-1.5 cursor-pointer font-medium'
            >
              <span className='size-2 rounded-full bg-emerald-500' />
              <span>Set Hadir</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                toast.info(`Status ${selectedIds.length} pegawai diubah menjadi Izin.`);
                setSelectedIds([]);
              }}
              className='gap-2 py-1.5 cursor-pointer font-medium'
            >
              <span className='size-2 rounded-full bg-blue-500' />
              <span>Set Izin</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                toast.info(`Status ${selectedIds.length} pegawai diubah menjadi Sakit.`);
                setSelectedIds([]);
              }}
              className='gap-2 py-1.5 cursor-pointer font-medium'
            >
              <span className='size-2 rounded-full bg-amber-500' />
              <span>Set Sakit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                toast.error(`Status ${selectedIds.length} pegawai diubah menjadi Alpha.`);
                setSelectedIds([]);
              }}
              className='gap-2 py-1.5 cursor-pointer font-medium'
            >
              <span className='size-2 rounded-full bg-rose-500' />
              <span>Set Alpha</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Action 3: Ekspor Data Terpilih */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                toast.success(`Mengekspor ${selectedIds.length} data presensi pegawai terpilih.`);
              }}
              className='h-8 text-xs font-semibold px-3 gap-1.5 rounded-xl border-border/70 shadow-2xs hover:bg-muted/80'
            >
              <Icons.download className='size-3.5' />
              <span className='hidden sm:inline'>Ekspor</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top' className='text-xs'>
            Ekspor data presensi terpilih
          </TooltipContent>
        </Tooltip>

        {/* Action 4: Hapus Data Presensi (Destructive) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='destructive'
              size='sm'
              onClick={() => {
                setSelectedDeleteRecord(null); // Triggers bulk deletion modal
                setIsDeleteModalOpen(true);
              }}
              className='h-8 text-xs font-semibold px-3 gap-1.5 rounded-xl shadow-2xs'
            >
              <Icons.trash className='size-3.5' />
              <span>Hapus</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top' className='text-xs'>
            Hapus {selectedIds.length} data presensi terpilih
          </TooltipContent>
        </Tooltip>
      </DataTableBulkActions>

      {/* Edit & Detail Presensi Modal */}
      <AttendanceEditModal
        isOpen={isEditModalOpen}
        attendance={selectedEditRecord}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEditRecord(null);
        }}
      />

      {/* Hapus Presensi Confirmation Modal (Supports Single or Bulk Delete) */}
      <AttendanceDeleteModal
        isOpen={isDeleteModalOpen}
        attendance={selectedDeleteRecord}
        attendances={
          selectedDeleteRecord
            ? [selectedDeleteRecord]
            : records.filter((r) => selectedIds.includes(r.id))
        }
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDeleteRecord(null);
        }}
        onSuccess={() => {
          setSelectedIds([]);
        }}
      />
    </div>
  );
}
