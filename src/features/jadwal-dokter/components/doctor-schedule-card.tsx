'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
        'group relative overflow-hidden rounded-[22px] border border-border font-sans flex flex-col justify-between select-none transition-all duration-200 p-4 sm:p-5 min-h-[168px] sm:min-h-[175px] text-card-foreground cursor-pointer',
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

      {/* 2. Header: Status Badge and Quick Actions */}
      <div className='flex items-center justify-between gap-3 relative z-20'>
        <DoctorStatusBadge status={cardStatus} />
        <div className='flex items-center gap-1.5'>
          {onCardClick && (
            <Button
              type='button'
              variant='outline'
              size='icon'
              shape='pill'
              onClick={(e) => {
                e.stopPropagation();
                onCardClick(doctor);
              }}
              title='Lihat & Edit Profil Dokter'
              aria-label='Lihat & Edit Profil Dokter'
              className='size-8 shadow-2xs z-20 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/80'
            >
              <Icons.user className='size-3.5' />
            </Button>
          )}
          {onOpenSettings && !isPending && <DoctorCardSettingsButton onClick={handleSettings} />}
        </div>
      </div>

      {/* 3. Core Identity: Inline Avatar Beside Name, Specialty & Patient Stack */}
      <div className='flex flex-col relative z-20 mt-2.5 min-w-0'>
        <div className='flex items-start gap-3 min-w-0'>
          <Avatar className='size-10 sm:size-11 rounded-full ring-2 ring-primary/20 shrink-0 shadow-2xs'>
            {doctor.avatar ? (
              <AvatarImage src={doctor.avatar} alt={doctor.nama_dokter} className='object-cover' />
            ) : null}
            <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs uppercase'>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className='flex flex-col min-w-0 flex-1 justify-center'>
            <h3
              title={doctor.nama_dokter}
              className='text-[15px] sm:text-[16.5px] font-bold text-card-foreground tracking-tight leading-snug line-clamp-1'
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
                  'text-left transition-colors focus-visible:outline-none cursor-pointer',
                  isPending
                    ? 'opacity-90 hover:text-primary'
                    : 'hover:text-primary focus-visible:underline'
                )}
              >
                {doctor.nama_dokter}
              </button>
            </h3>

            <DoctorSpecialtyText specialty={doctor.spesialisasi} className='mt-0.5' />
          </div>
        </div>

        {/* Patient queue stack or Cuti notice */}
        {doctor.is_on_leave ? (
          <div className='mt-2'>
            <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'>
              <Icons.calendar className='size-3 text-sky-500' />
              <span>Sedang Cuti</span>
              {doctor.substitute_doctor_name && (
                <span className='text-muted-foreground font-normal'>
                  (Ganti: {doctor.substitute_doctor_name})
                </span>
              )}
            </span>
          </div>
        ) : (
          <DoctorCardPatientStack
            patients={doctor.pasien_preview}
            totalPatients={doctor.total_pasien}
            onClick={isPending ? undefined : handleDetail}
            className='mt-2'
          />
        )}
      </div>

      {/* 4. Footer Actions: Detail */}
      {showActions && (
        <div className='flex items-center justify-end gap-2 pt-2.5 mt-auto border-t border-border/40 relative z-20'>
          {isPending ? (
            <Button
              type='button'
              variant='outline'
              size='card-action'
              shape='pill'
              onClick={(e) => {
                e.stopPropagation();
                onCardClick?.(doctor);
              }}
              className='font-bold text-xs'
            >
              <Icons.user className='size-3 mr-1' />
              Profil Medis
            </Button>
          ) : (
            <Button
              type='button'
              variant='default'
              size='card-action'
              shape='pill'
              withTrailingCircleIcon
              onClick={handleDetail}
              className='font-bold'
            >
              Detail
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
