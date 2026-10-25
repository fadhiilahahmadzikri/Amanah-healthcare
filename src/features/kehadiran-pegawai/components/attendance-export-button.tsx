'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AttendanceExportWizardModal } from './attendance-export-wizard-modal';
import { cn } from '@/lib/utils';
import type { StaffAttendance } from '../api/types';

export interface AttendanceExportDropdownProps {
  data?: StaffAttendance[];
  buttonVariant?: 'default' | 'outline';
  variant?: 'full' | 'icon';
  className?: string;
}

export function AttendanceExportDropdown({
  buttonVariant = 'outline',
  variant = 'full',
  className
}: AttendanceExportDropdownProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  return (
    <>
      {variant === 'icon' ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant={buttonVariant}
              size='icon'
              onClick={() => setIsExportDialogOpen(true)}
              aria-label='Ekspor Data Presensi'
              className={cn(
                'size-8 rounded-md bg-card border-border/70 text-foreground hover:bg-muted/40 shadow-2xs shrink-0 cursor-pointer',
                className
              )}
            >
              <Icons.download className='size-3.5' />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom' className='text-xs'>
            Ekspor Data Presensi
          </TooltipContent>
        </Tooltip>
      ) : (
        <Button
          type='button'
          variant={buttonVariant}
          size='sm'
          onClick={() => setIsExportDialogOpen(true)}
          className={cn(
            'h-8 text-xs font-medium bg-card border-border/70 text-foreground hover:bg-muted/40 shadow-2xs gap-1.5 px-3 rounded-md shrink-0 cursor-pointer',
            className
          )}
        >
          <Icons.download className='size-3.5' />
          <span>Ekspor Data</span>
        </Button>
      )}

      <AttendanceExportWizardModal
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />
    </>
  );
}

export interface AttendanceHeaderActionsProps {
  data: StaffAttendance[];
  onToggleQR?: () => void;
  onOpenManualAttendance?: () => void;
  onRefresh?: () => void;
  isQRVisible?: boolean;
  isCompact?: boolean;
  onOpenSearch?: () => void;
  isSearchActive?: boolean;
  onOpenFilter?: () => void;
  onResetFilter?: () => void;
  activeFilterCount?: number;
}

export function AttendanceHeaderActions({
  data,
  onToggleQR,
  onOpenManualAttendance,
  onRefresh,
  isQRVisible = false,
  isCompact = false,
  onOpenSearch,
  isSearchActive = false,
  onOpenFilter,
  onResetFilter,
  activeFilterCount = 0
}: AttendanceHeaderActionsProps) {
  return (
    <div className='flex items-center gap-1.5 flex-wrap w-full sm:w-auto'>
      {/* 1. Mode Compact: Tombol Search & Filter bergeser ke deretan header atas */}
      {isCompact && onOpenSearch && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='icon'
              onClick={onOpenSearch}
              aria-label='Pencarian data staf'
              className={cn(
                'size-8 rounded-md bg-card border-border/70 text-foreground hover:bg-muted/40 shadow-2xs shrink-0 cursor-pointer relative',
                isSearchActive && 'border-primary/60 text-primary'
              )}
            >
              <Icons.search className='size-3.5' />
              {isSearchActive && (
                <span className='absolute -top-1 -right-1 size-2 rounded-full bg-primary ring-2 ring-background animate-pulse' />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom' className='text-xs'>
            Pencarian Staf
          </TooltipContent>
        </Tooltip>
      )}

      {isCompact && onOpenFilter && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onOpenFilter}
              aria-label='Buka panel filter'
              className={cn(
                'h-8 px-2.5 rounded-md bg-card border-border/70 text-foreground hover:bg-muted/40 shadow-2xs gap-1.5 text-xs font-medium shrink-0 cursor-pointer',
                activeFilterCount > 0 && 'border-primary/60 text-primary font-semibold'
              )}
            >
              <Icons.filter className='size-3.5' />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className='size-4 rounded-full flex items-center justify-center text-[10px] bg-primary text-primary-foreground font-mono font-bold shrink-0'>
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom' className='text-xs'>
            {activeFilterCount > 0 ? `${activeFilterCount} filter aktif` : 'Buka Panel Filter'}
          </TooltipContent>
        </Tooltip>
      )}

      {/* Tombol Reset Filter di Luar (Ketika Filter Aktif di Mode Compact - Identik dengan Jadwal Dokter) */}
      {isCompact && activeFilterCount > 0 && onResetFilter && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={onResetFilter}
              aria-label='Reset filter'
              className='h-8 px-2.5 text-xs border border-dashed border-border text-muted-foreground hover:text-foreground shrink-0 cursor-pointer'
            >
              <Icons.close className='size-3.5 mr-1' />
              <span>Reset</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom' className='text-xs'>
            Reset Semua Filter
          </TooltipContent>
        </Tooltip>
      )}

      {/* 2. Terminal Presensi QR Icon Button (Konsisten Varian Outline) */}
      {onToggleQR && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='icon'
              onClick={onToggleQR}
              aria-label={isQRVisible ? 'Sembunyikan Terminal QR' : 'Tampilkan Terminal QR'}
              className={cn(
                'size-8 rounded-md bg-card border-border/70 text-foreground hover:bg-muted/40 shadow-2xs shrink-0 cursor-pointer',
                isQRVisible && 'border-primary/60 text-primary'
              )}
            >
              <Icons.qrCode className='size-3.5' />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom' className='text-xs'>
            {isQRVisible ? 'Sembunyikan Terminal QR' : 'Tampilkan Terminal QR'}
          </TooltipContent>
        </Tooltip>
      )}

      {/* 3. Presensi Manual Icon Button (Konsisten Varian Outline) */}
      {onOpenManualAttendance && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='icon'
              onClick={onOpenManualAttendance}
              aria-label='Presensi Manual Pegawai'
              className='size-8 rounded-md bg-card border-border/70 text-foreground hover:bg-muted/40 shadow-2xs shrink-0 cursor-pointer'
            >
              <Icons.fingerprint className='size-3.5' />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom' className='text-xs'>
            Presensi Manual Pegawai
          </TooltipContent>
        </Tooltip>
      )}

      {/* 4. Ekspor Data & 5. Segarkan Data (Anchored to Far Right) */}
      <div className='flex items-center gap-1.5 ml-auto shrink-0'>
        <AttendanceExportDropdown
          data={data}
          buttonVariant='outline'
          variant={isCompact ? 'icon' : 'full'}
        />

        {onRefresh && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={onRefresh}
                aria-label='Segarkan data presensi'
                className='size-8 rounded-md bg-card border-border/70 text-foreground hover:bg-muted/40 shadow-2xs shrink-0 cursor-pointer'
              >
                <Icons.refresh className='size-3.5' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='text-xs'>
              Segarkan data
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

// Backward-compatibility alias
export { AttendanceHeaderActions as AttendanceExportButtons };
