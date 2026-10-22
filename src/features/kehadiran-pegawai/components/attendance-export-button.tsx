'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ExportDialog } from '@/features/export';
import type { StaffAttendance } from '../api/types';

export interface AttendanceExportDropdownProps {
  data?: StaffAttendance[];
  buttonVariant?: 'default' | 'outline';
}

export function AttendanceExportDropdown({
  buttonVariant = 'default'
}: AttendanceExportDropdownProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={buttonVariant}
        size='sm'
        onClick={() => setIsExportDialogOpen(true)}
        className='h-9 font-medium shadow-xs gap-1.5 px-3.5'
      >
        <Icons.download className='size-3.5' />
        <span>Ekspor Data</span>
      </Button>

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        exportType='attendance'
        title='Unduh Rekapitulasi Presensi'
        subtitle='Pilih format berkas resmi dan periode bulan presensi staf'
        enableMonthPicker={true}
      />
    </>
  );
}

export interface AttendanceHeaderActionsProps {
  data: StaffAttendance[];
  onOpenGenerateQR?: () => void;
  onOpenManualAttendance?: () => void;
  onRefresh?: () => void;
  isQRVisible?: boolean;
}

export function AttendanceHeaderActions({
  data,
  onOpenGenerateQR,
  onOpenManualAttendance,
  onRefresh,
  isQRVisible = false
}: AttendanceHeaderActionsProps) {
  return (
    <div className='flex flex-wrap items-center gap-2.5'>
      {/* 1. Presensi Manual Button (Outline styling harmonis) */}
      {onOpenManualAttendance && (
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={onOpenManualAttendance}
          className='h-9 text-xs font-medium px-3.5 bg-card border-border/70 text-foreground hover:bg-muted/40 shadow-2xs gap-1.5'
        >
          <Icons.user className='size-3.5' />
          <span>Presensi Manual</span>
        </Button>
      )}

      {/* 2. Terminal Presensi QR Button */}
      {onOpenGenerateQR && (
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={onOpenGenerateQR}
          className='h-9 text-xs font-medium px-3.5 bg-card border-border/70 text-foreground hover:bg-muted/40 shadow-2xs gap-1.5'
        >
          <Icons.qrCode className='size-3.5' />
          <span>{isQRVisible ? 'Terminal Presensi QR' : 'Tampilkan QR Presensi'}</span>
        </Button>
      )}

      {/* Ekspor Data (Pipeline Asinkronus Backend) */}
      <AttendanceExportDropdown data={data} buttonVariant='default' />

      {/* Segarkan Data Icon Button */}
      {onRefresh && (
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={onRefresh}
          title='Segarkan data'
          aria-label='Segarkan data'
          className='h-9 w-9 p-0 bg-card border-border/70 text-muted-foreground hover:text-foreground shadow-2xs'
        >
          <Icons.refresh className='size-4' />
        </Button>
      )}
    </div>
  );
}

// Backward-compatibility alias
export { AttendanceHeaderActions as AttendanceExportButtons };
