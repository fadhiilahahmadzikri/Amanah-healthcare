'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { DoctorSchedule } from '../api/types';
import {
  DOCTOR_CARD_STATUS,
  type DoctorCardStatus,
  getDoctorCardStatus
} from '../utils/doctor-schedule-card-utils';
import {
  DoctorCardImage,
  DoctorCardPatientStack,
  DoctorCardSettingsButton,
  DoctorSpecialtyText,
  DoctorStatusBadge
} from './doctor-card-atoms';

export type { DoctorCardStatus };
export {
  DOCTOR_CARD_STATUS,
  DoctorCardImage,
  DoctorCardPatientStack,
  DoctorCardSettingsButton,
  DoctorSpecialtyText,
  DoctorStatusBadge,
  getDoctorCardStatus
};

export interface DoctorScheduleCardProps {
  doctor: DoctorSchedule;
  date?: string;
  isSelected?: boolean;
  onCardClick?: (doctor: DoctorSchedule) => void;
  onOpenDetail?: (doctor: DoctorSchedule) => void;
  onOpenSettings?: (doctor: DoctorSchedule) => void;
  onCall?: (doctor: DoctorSchedule) => void;
  variant?: 'default' | 'compact' | 'flat' | 'elevated';
  showActions?: boolean;
  showCallButton?: boolean;
  showStats?: boolean;
  showTrailingAvatar?: boolean;
  className?: string;
}

export function DoctorScheduleCard({
  doctor,
  isSelected,
  onCardClick,
  onOpenDetail,
  onOpenSettings,
  variant = 'default',
  showActions = true,
  showTrailingAvatar = false,
  className
}: DoctorScheduleCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isSelected]);

  // Derive operational status strictly from backend contract
  const cardStatus = getDoctorCardStatus(doctor);
  const isPending = cardStatus === DOCTOR_CARD_STATUS.PENDING;

  const initials = React.useMemo(() => {
    const raw = (doctor.nama_dokter || '').replace(/^dr\.\s*/i, '').trim();
    const parts = raw.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0]?.[0] || 'D').toUpperCase();
  }, [doctor.nama_dokter]);

  const handleContainerClick = () => {
    if (onCardClick) {
      onCardClick(doctor);
    } else {
      onOpenDetail?.(doctor);
    }
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) return;
    onOpenSettings?.(doctor);
  };

  const handleDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) return;
    onOpenDetail?.(doctor);
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: card container contains interactive action buttons
    <div
      ref={cardRef}
      role='button'
      tabIndex={0}
      onClick={handleContainerClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleContainerClick();
        }
      }}
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 100% 0%, color-mix(in oklab, var(--primary) 18%, transparent) 0%, color-mix(in oklab, var(--primary) 5%, transparent) 45%, transparent 80%), var(--card)'
      }}
      className={cn(
        'group relative overflow-hidden rounded-[20px] sm:rounded-[18px] border border-border font-sans flex flex-col justify-between select-none transition-all duration-200 p-4 sm:p-3.5 xl:p-3 min-h-[175px] sm:min-h-[162px] xl:min-h-[155px] text-card-foreground cursor-pointer',
        isPending
          ? 'opacity-65 border-dashed bg-muted/20'
          : 'hover:border-primary/60 hover:shadow-md',
        isSelected &&
          'ring-2 ring-primary/40 ring-offset-2 ring-offset-background border-primary/50 shadow-md',
        variant === 'elevated' && 'shadow-sm',
        variant === 'flat' && 'border-transparent shadow-none',
        className
      )}
    >
      {/* 1. Optional Doctor Trailing Avatar Background (if explicitly enabled) */}
      {showTrailingAvatar && <DoctorCardImage src={doctor.avatar} alt={doctor.nama_dokter} />}

      {/* 2. Section 1 (Paling Atas): Status Badge tersendiri di atas - Rata Kanan */}
      <div className='flex items-center justify-end w-full relative z-20 min-w-0'>
        <DoctorStatusBadge status={cardStatus} size='sm' />
      </div>

      {/* 3. Section 2 (Bawah Status): Avatar + Nama Dokter & Spesialisasi (Full Width) */}
      <div className='flex items-center gap-3 sm:gap-2.5 relative z-20 mt-2 min-w-0'>
        <Avatar className='size-11 sm:size-10 xl:size-9 rounded-full ring-2 ring-primary/20 shrink-0 shadow-2xs overflow-hidden'>
          {doctor.avatar ? (
            // biome-ignore lint/a11y/useAltText: doctor avatar image
            <img
              src={doctor.avatar}
              alt={doctor.nama_dokter}
              className='size-full object-cover aspect-square rounded-full'
              referrerPolicy='no-referrer'
            />
          ) : (
            <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs sm:text-[11px] uppercase'>
              {initials}
            </AvatarFallback>
          )}
        </Avatar>

        <div className='flex flex-col min-w-0 flex-1 justify-center'>
          <h3
            title={doctor.nama_dokter}
            className='text-[14.5px] sm:text-[13.5px] xl:text-[13px] font-bold text-card-foreground tracking-tight leading-snug truncate'
          >
            <button
              type='button'
              onClick={
                isPending
                  ? (e) => {
                      e.stopPropagation();
                      onCardClick?.(doctor);
                    }
                  : handleDetail
              }
              className={cn(
                'text-left transition-colors focus-visible:outline-none cursor-pointer truncate w-full block',
                isPending
                  ? 'opacity-90 hover:text-primary'
                  : 'hover:text-primary focus-visible:underline'
              )}
            >
              {doctor.nama_dokter}
            </button>
          </h3>

          <DoctorSpecialtyText
            specialty={doctor.spesialisasi}
            className='text-[12px] sm:text-[11.5px] xl:text-[11px] truncate mt-0.5'
          />
        </div>
      </div>

      {/* 4. Section 3: Antrean Pasien */}
      <div className='mt-2.5 sm:mt-2 relative z-20 min-w-0'>
        {doctor.is_on_leave ? (
          <span className='inline-flex items-center gap-1.5 px-2.5 sm:px-2 py-0.5 rounded-full text-[11px] sm:text-[10.5px] xl:text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 truncate'>
            <Icons.calendar className='size-3 sm:size-2.5 text-sky-500 shrink-0' />
            <span>Sedang Cuti</span>
            {doctor.substitute_doctor_name && (
              <span className='text-muted-foreground font-normal truncate'>
                (Ganti: {doctor.substitute_doctor_name})
              </span>
            )}
          </span>
        ) : (
          <DoctorCardPatientStack
            patients={doctor.pasien_preview}
            totalPatients={doctor.total_pasien}
            onClick={isPending ? undefined : handleDetail}
          />
        )}
      </div>

      {/* 5. Section 4: Footer Actions (Rata Kanan) */}
      {showActions && (
        <div className='flex items-center justify-end gap-2 sm:gap-1.5 pt-2.5 sm:pt-2 mt-auto border-t border-border/40 relative z-20'>
          {onOpenSettings && !isPending && (
            <Button
              type='button'
              variant='outline'
              shape='pill'
              onClick={handleSettings}
              title='Lihat Jadwal Dokter'
              aria-label='Lihat Jadwal Dokter'
              className='h-8.5 sm:h-8 xl:h-7.5 px-3 sm:px-2.5 xl:px-2 text-xs sm:text-[11.5px] xl:text-[11px] font-semibold text-muted-foreground hover:text-foreground shrink-0 gap-1.5'
            >
              <Icons.calendar className='size-3.5 sm:size-3.5 xl:size-3 text-muted-foreground shrink-0' />
              <span className='inline xl:hidden'>Lihat Jadwal</span>
              <span className='hidden xl:inline'>Jadwal</span>
            </Button>
          )}

          {isPending ? (
            <Button
              type='button'
              variant='outline'
              shape='pill'
              onClick={(e) => {
                e.stopPropagation();
                onCardClick?.(doctor);
              }}
              title='Profil Medis Dokter'
              aria-label='Profil Medis Dokter'
              className='h-8.5 sm:h-8 xl:h-7.5 px-3 sm:px-2.5 xl:px-2 text-xs sm:text-[11px] xl:text-[10.5px] font-bold shrink-0 gap-1.5'
            >
              <Icons.user className='size-3.5 sm:size-3.5 xl:size-3 text-muted-foreground shrink-0' />
              <span>Profil Medis</span>
            </Button>
          ) : (
            <Button
              type='button'
              variant='default'
              shape='pill'
              onClick={handleDetail}
              title='Lihat Pasien'
              aria-label='Lihat Pasien'
              className='h-8.5 sm:h-8 xl:h-7.5 pl-3.5 pr-2 sm:pl-3 sm:pr-1.5 xl:pl-2.5 xl:pr-1.5 text-xs sm:text-[11.5px] xl:text-[11px] font-bold shrink-0 gap-2 sm:gap-1.5 shadow-xs'
            >
              <span>Lihat Pasien</span>
              <span className='size-5.5 sm:size-5 xl:size-4.5 rounded-full bg-primary-foreground text-primary flex items-center justify-center shrink-0 shadow-2xs'>
                <Icons.arrowUpRight className='size-3.5 sm:size-3 xl:size-2.5 stroke-[2.5]' />
              </span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
