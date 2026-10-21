'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export interface LeaveManagementToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  staffTypeFilter: string;
  onStaffTypeFilterChange: (value: string) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onOpenPayroll: () => void;
  onOpenSettings: () => void;
}

export function LeaveManagementToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  staffTypeFilter,
  onStaffTypeFilterChange,
  hasActiveFilters,
  onResetFilters,
  onOpenPayroll,
  onOpenSettings
}: LeaveManagementToolbarProps) {
  return (
    <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0'>
      {/* Left: Filters & Search */}
      <div className='flex flex-wrap items-center gap-2 flex-1 min-w-0'>
        {/* Search */}
        <div className='relative w-full sm:w-64'>
          <Icons.search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Cari staf, ID, atau alasan...'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-8 h-9 text-xs'
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className='h-9 text-xs w-[140px]'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all' className='text-xs'>
              Semua Status
            </SelectItem>
            <SelectItem value='pending' className='text-xs'>
              Menunggu
            </SelectItem>
            <SelectItem value='approved' className='text-xs'>
              Disetujui
            </SelectItem>
            <SelectItem value='rejected' className='text-xs'>
              Ditolak
            </SelectItem>
            <SelectItem value='cancelled' className='text-xs'>
              Dibatalkan
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Staff Category Filter */}
        <Select value={staffTypeFilter} onValueChange={onStaffTypeFilterChange}>
          <SelectTrigger className='h-9 text-xs w-[150px]'>
            <SelectValue placeholder='Kategori' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all' className='text-xs'>
              Semua Kategori
            </SelectItem>
            <SelectItem value='doctor' className='text-xs'>
              Dokter
            </SelectItem>
            <SelectItem value='midwife' className='text-xs'>
              Bidan
            </SelectItem>
            <SelectItem value='worker' className='text-xs'>
              Staf Operasional
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <Button
            variant='ghost'
            size='sm'
            onClick={onResetFilters}
            className='h-9 text-xs gap-1 text-muted-foreground hover:text-foreground px-2.5'
          >
            <Icons.close className='size-3.5' />
            Reset
          </Button>
        )}
      </div>

      {/* Right: Actions */}
      <div className='flex items-center gap-2 shrink-0 justify-end'>
        <Button
          variant='outline'
          size='sm'
          onClick={onOpenPayroll}
          className='h-9 gap-1.5 text-xs'
          title='Kalkulasi Payroll & Rekapitulasi Dinas'
        >
          <Icons.calendar className='size-4 text-primary' />
          <span>Kalkulasi Payroll</span>
        </Button>

        <Button
          variant='outline'
          size='sm'
          onClick={onOpenSettings}
          className='h-9 gap-1.5 text-xs'
          title='Pengaturan Kebijakan Cuti'
        >
          <Icons.settings className='size-4 text-muted-foreground' />
          <span>Pengaturan Kebijakan</span>
        </Button>
      </div>
    </div>
  );
}
