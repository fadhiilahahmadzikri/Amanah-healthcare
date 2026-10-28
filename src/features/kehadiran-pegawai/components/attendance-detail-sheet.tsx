'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { ExportDialog } from '@/features/export';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { STAFF_TYPES, STAFF_TYPE_LABELS, type StaffType } from '@/constants/staff-types.constant';
import {
  CANONICAL_ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_SHIFT_LABELS
} from '../constants/attendance-status.constants';
import {
  formatWorkDuration,
  formatPresenceTimestamp,
  formatLateMinutes
} from '../utils/duration-format';
import type { StaffAttendance } from '../api/types';

export interface AttendanceDetailSheetProps {
  record: StaffAttendance | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: (staffId: string, staffName: string) => void;
  isCheckoutPending?: boolean;
}

export function AttendanceDetailSheet({
  record,
  isOpen,
  onClose,
  onCheckout,
  isCheckoutPending = false
}: AttendanceDetailSheetProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  if (!record) return null;

  const isLate = record.status === CANONICAL_ATTENDANCE_STATUS.LATE;
  const isPresent = record.status === CANONICAL_ATTENDANCE_STATUS.PRESENT;
  const isDoctor = record.kategori === STAFF_TYPES.DOCTOR;
  const categoryLabel = STAFF_TYPE_LABELS[record.kategori as StaffType] || record.kategori;
  const statusLabel = ATTENDANCE_STATUS_LABELS[record.status] || record.status;
  const shiftLabel = ATTENDANCE_SHIFT_LABELS[record.shift] || record.shift;
  const lateLabel = formatLateMinutes(record.lateMinutes);

  const jamMasuk = record.checkInAt
    ? formatPresenceTimestamp(record.checkInAt, true)
    : (record.waktu_presensi ?? '-');

  const jamPulang = record.checkOutAt
    ? formatPresenceTimestamp(record.checkOutAt, true)
    : null;

  const durasiStr = formatWorkDuration({
    checkInAt: record.checkInAt,
    checkOutAt: record.checkOutAt,
    validatedHours: record.validatedDurationHours
  });

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side='right'
          showCloseButton={false}
          className='w-full sm:max-w-md p-0 flex flex-col gap-0 border-l border-border/50 bg-card text-card-foreground shadow-2xl font-sans'
        >
          {/* Header Banner */}
          <div className='relative w-full shrink-0 border-b border-border/40 bg-card'>
            <div className='relative w-full h-20 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--primary-bright,var(--primary))_22%,transparent)_0%,color-mix(in_oklab,var(--primary-bright,var(--primary))_6%,transparent)_60%,transparent_100%)] overflow-hidden'>
              <button
                type='button'
                onClick={onClose}
                className='absolute top-3 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/85 hover:bg-background text-foreground/90 hover:text-foreground text-xs font-semibold backdrop-blur-md border border-border/50 shadow-2xs transition-all cursor-pointer select-none'
              >
                <Icons.chevronLeft className='size-3.5' />
                <span>Kembali</span>
              </button>
            </div>

            <SheetHeader className='px-5 pb-4 pt-0 space-y-0 text-left'>
              <div className='flex items-end gap-3 -mt-9'>
                <Avatar className='size-16 rounded-full ring-4 ring-card shadow-lg bg-card overflow-hidden shrink-0 aspect-square'>
                  <AvatarImage
                    src={record.avatar || DEFAULT_AVATAR_PATH}
                    alt={record.nama_staf}
                    className='object-cover size-full'
                  />
                  <AvatarFallback className='rounded-full p-0 bg-transparent overflow-hidden'>
                    <Image
                      src={DEFAULT_AVATAR_PATH}
                      alt={record.nama_staf}
                      width={64}
                      height={64}
                      unoptimized
                      className='size-full object-cover'
                    />
                  </AvatarFallback>
                </Avatar>

                <div className='min-w-0 flex-1 pb-0.5'>
                  <div className='flex items-center gap-1.5'>
                    <Badge
                      variant='outline'
                      className={cn(
                        'text-[10px] font-semibold px-2 py-0.2 border',
                        isDoctor
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                          : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20'
                      )}
                    >
                      {categoryLabel}
                    </Badge>
                  </div>
                  <SheetTitle className='text-base font-bold text-foreground truncate mt-1'>
                    {record.nama_staf}
                  </SheetTitle>
                  <SheetDescription className='text-xs text-muted-foreground font-mono'>
                    {record.id_staf}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          {/* Details Body */}
          <div className='flex-1 overflow-y-auto p-5 space-y-4'>
            {/* Status Section */}
            <div className='p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-2'>
              <span className='text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider block'>
                Status Presensi Hari Ini
              </span>
              <div className='flex items-center gap-2 flex-wrap'>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
                    isLate
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                      : isPresent
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border-border/50'
                  )}
                >
                  <span
                    className={cn(
                      'size-2 rounded-full',
                      isLate ? 'bg-amber-500' : isPresent ? 'bg-emerald-500' : 'bg-muted-foreground'
                    )}
                  />
                  <span>{statusLabel}</span>
                </span>

                <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20'>
                  <Icons.clock className='size-3' />
                  <span>Shift {shiftLabel}</span>
                </span>

                {isLate && lateLabel && (
                  <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'>
                    <Icons.alertCircle className='size-3 text-amber-600 dark:text-amber-400' />
                    <span>{lateLabel}</span>
                  </span>
                )}

                {record.isEarlyDeparture && (
                  <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'>
                    <Icons.alertCircle className='size-3 text-amber-600 dark:text-amber-400' />
                    <span>Pulang Lebih Awal</span>
                  </span>
                )}
              </div>
            </div>

            {/* Replacement Banner (if any) */}
            {record.isReplacement && (
              <div className='p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1'>
                <div className='flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold text-xs'>
                  <Icons.userCheck className='size-3.5' />
                  <span>Shift Pengganti (Replacement)</span>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Bertugas menggantikan jadwal dinas{' '}
                  <span className='font-semibold text-foreground'>
                    {record.replacedStaffName || 'Dokter/Staf Lain'}
                  </span>
                  {record.replacedStaffCode ? ` (${record.replacedStaffCode})` : ''}.
                </p>
              </div>
            )}

            {/* Check-In & Check-Out Timestamps Grid */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='p-3 rounded-xl bg-muted/20 border border-border/40 space-y-1'>
                <span className='text-[10.5px] font-medium text-muted-foreground block'>
                  Jam Masuk Dinas
                </span>
                <span className='font-mono text-sm font-bold text-foreground block'>
                  {jamMasuk}
                </span>
              </div>

              <div className='p-3 rounded-xl bg-muted/20 border border-border/40 space-y-1'>
                <span className='text-[10.5px] font-medium text-muted-foreground block'>
                  Jam Pulang Dinas
                </span>
                {jamPulang ? (
                  <span className='font-mono text-sm font-bold text-foreground block'>
                    {jamPulang}
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 pt-0.5'>
                    <span className='size-1.5 rounded-full bg-amber-500 animate-pulse' />
                    <span>Sedang Dinas</span>
                  </span>
                )}
              </div>
            </div>

            {/* Validated Working Duration */}
            <div className='p-3.5 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between'>
              <div>
                <span className='text-[10.5px] font-medium text-muted-foreground block'>
                  Durasi Kerja Tervalidasi
                </span>
                <span className='text-xs font-bold text-foreground font-mono mt-0.5 block'>
                  {durasiStr}
                </span>
              </div>
              <div className='size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                <Icons.clock className='size-4' />
              </div>
            </div>

            {/* Notes Section (if any) */}
            {record.notes && (
              <div className='p-3.5 rounded-xl bg-muted/20 border border-border/40 space-y-1'>
                <span className='text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider block'>
                  Catatan Presensi
                </span>
                <p className='text-xs text-foreground font-medium leading-relaxed'>
                  {record.notes}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <SheetFooter className='p-4 border-t border-border/40 shrink-0 flex flex-row items-center justify-between gap-2 bg-muted/10'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setIsExportDialogOpen(true)}
              className='h-8.5 text-xs gap-1.5 rounded-md'
            >
              <Icons.download className='size-3.5' />
              <span>Unduh Riwayat</span>
            </Button>

            {!record.checkOutAt && onCheckout && (
              <Button
                type='button'
                size='sm'
                disabled={isCheckoutPending}
                onClick={() => onCheckout(record.staffProfileId ?? '', record.nama_staf)}
                className='h-8.5 text-xs font-semibold gap-1.5 rounded-md'
              >
                <Icons.logout className='size-3.5' />
                <span>Catat Checkout</span>
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Export Dialog for Individual Staff */}
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        exportType='attendance'
        entityName={record.nama_staf}
        parameters={{
          staffProfileId: record.staffProfileId
        }}
        enableMonthPicker={true}
      />
    </>
  );
}
