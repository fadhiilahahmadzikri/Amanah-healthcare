'use client';

import React from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import type { OccupancySlot } from '@/server/contracts/schedules/doctor-schedules.dto';

export interface DoctorOccupancyConflictModalProps {
  slot?: OccupancySlot | null;
  conflictDetails?: {
    practitionerId?: string | null;
    staffProfileId?: string | null;
    practitionerName: string;
    specialty?: string | null;
    unitName?: string | null;
    avatarUrl?: string | null;
    roomName: string;
    startTime: string;
    endTime: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  targetDoctorName?: string;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  onViewDoctorSchedule?: (doctorId: string, targetSlotTime?: string) => void;
}

export function DoctorOccupancyConflictModal({
  slot,
  conflictDetails,
  isOpen,
  onClose,
  targetDoctorName,
  portalContainerRef,
  onViewDoctorSchedule
}: DoctorOccupancyConflictModalProps) {
  if (!slot && !conflictDetails) return null;

  const conflict = slot?.conflictInfo;
  const occupantDoctorName =
    conflictDetails?.practitionerName ||
    conflict?.practitionerName ||
    slot?.displayLabel ||
    'Dokter Lain';
  const occupantSpecialty =
    conflictDetails?.specialty ||
    conflict?.practitionerSpecialty ||
    conflictDetails?.unitName ||
    'Dokter Spesialis';
  const unitName = conflictDetails?.unitName || null;
  const roomName =
    conflictDetails?.roomName || conflict?.roomName || 'Ruang Praktik';
  const timeRange =
    conflictDetails?.startTime && conflictDetails?.endTime
      ? `${conflictDetails.startTime} - ${conflictDetails.endTime} WIB`
      : conflict?.startTime && conflict?.endTime
        ? `${conflict.startTime} - ${conflict.endTime} WIB`
        : slot?.startTime && slot?.endTime
          ? `${slot.startTime} - ${slot.endTime} WIB`
          : '-';

  const occupantDoctorId =
    conflictDetails?.staffProfileId ||
    conflictDetails?.practitionerId ||
    conflict?.practitionerId ||
    null;

  const initials =
    occupantDoctorName
      .replace(/^dr\.\s*/i, '')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'DR';

  const handleViewSchedule = () => {
    if (occupantDoctorId && onViewDoctorSchedule) {
      const targetSlotTime = slot?.startTime || conflictDetails?.startTime;
      onViewDoctorSchedule(occupantDoctorId, targetSlotTime);
      onClose();
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[480px]'
      showCloseButton={false}
      backdropClassName='z-[60]'
      portalContainerRef={portalContainerRef}
    >
      <div className='relative font-sans space-y-4 text-card-foreground select-none'>
        {/* Header: Doctor Avatar & Status */}
        <div className='flex items-start justify-between gap-3 pb-3 border-b border-border/40'>
          <div className='flex items-center gap-3 min-w-0'>
            <Avatar className='size-11 rounded-full border border-border/60 bg-muted shrink-0'>
              {conflictDetails?.avatarUrl && (
                <AvatarImage
                  src={conflictDetails.avatarUrl}
                  alt={occupantDoctorName}
                  className='size-full object-cover'
                />
              )}
              <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className='min-w-0'>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/60'>
                  Ruangan Terisi
                </span>
                <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'>
                  <span className='size-1.5 rounded-full bg-amber-500 animate-pulse' />
                  Sedang Digunakan
                </span>
              </div>
              <h3 className='text-base font-bold text-foreground tracking-tight truncate mt-1'>
                {occupantDoctorName}
              </h3>
              <p className='text-xs text-muted-foreground truncate'>
                {occupantSpecialty}
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0'
            aria-label='Tutup modal'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* Structured 2-Column Info Grid */}
        <div className='grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-muted/15 border border-border/50 text-xs'>
          <div>
            <span className='text-muted-foreground font-medium'>Ruang Praktik</span>
            <p className='font-semibold text-foreground mt-0.5 truncate'>{roomName}</p>
          </div>
          <div>
            <span className='text-muted-foreground font-medium'>Jam Praktik</span>
            <p className='font-mono font-bold text-foreground mt-0.5'>{timeRange}</p>
          </div>
          <div>
            <span className='text-muted-foreground font-medium'>Spesialisasi / Poli</span>
            <p className='font-semibold text-foreground mt-0.5 truncate'>
              {unitName ? `${occupantSpecialty} (${unitName})` : occupantSpecialty}
            </p>
          </div>
          <div>
            <span className='text-muted-foreground font-medium'>Status Ruangan</span>
            <p className='font-semibold text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1.5'>
              <span className='size-1.5 rounded-full bg-amber-500' />
              Sedang Digunakan
            </p>
          </div>
        </div>

        {/* Context Narrative */}
        <div className='rounded-lg bg-muted/30 p-3 border border-border/40 text-xs text-muted-foreground leading-relaxed'>
          Slot pada jam ini tidak dapat dijadwalkan untuk{' '}
          <span className='font-semibold text-foreground'>{targetDoctorName || 'dokter ini'}</span>{' '}
          karena ruangan sedang dipakai oleh dokter lain. Anda dapat memilih jam lain atau menjadwalkan di ruangan yang berbeda.
        </div>

        {/* Actions Footer */}
        <div className='flex items-center justify-end gap-2.5 pt-2 border-t border-border/40'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onClose}
            className='cursor-pointer text-xs font-semibold'
          >
            Tutup
          </Button>

          {occupantDoctorId && onViewDoctorSchedule && (
            <Button
              type='button'
              size='sm'
              onClick={handleViewSchedule}
              className='cursor-pointer text-xs font-semibold gap-1.5'
            >
              <Icons.calendar className='size-3.5' />
              Lihat Detail Jadwal
            </Button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
