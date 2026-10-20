'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PixelTexture } from '@/components/ui/pixel-texture';
import { cn } from '@/lib/utils';
import { getStatusConfig } from '@/styles/clinical-tokens';
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

  // Derive operational status strictly from backend contract & centralized clinical tokens
  const cardStatus = getDoctorCardStatus(doctor);
  const statusConfig = getStatusConfig(cardStatus);
  const isPending = cardStatus === DOCTOR_CARD_STATUS.PENDING;

  // Dedicated status lip (bibir tiket atas) styling: soft-tinted in light mode, deep dark hue in dark mode
  const lipStyle = React.useMemo(() => {
    switch (cardStatus) {
      case DOCTOR_CARD_STATUS.OPEN:
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-950/80',
          text: 'text-emerald-700 dark:text-emerald-400 font-bold',
          border: 'border-b border-emerald-500/20 dark:border-emerald-900/50',
          hex: 'var(--success)'
        };
      case DOCTOR_CARD_STATUS.CLOSED:
        return {
          bg: 'bg-muted/60 dark:bg-zinc-900/85',
          text: 'text-muted-foreground dark:text-zinc-400 font-bold',
          border: 'border-b border-border/40 dark:border-zinc-800/60',
          hex: 'var(--muted-foreground)'
        };
      case DOCTOR_CARD_STATUS.ON_LEAVE:
        return {
          bg: 'bg-sky-500/10 dark:bg-sky-950/80',
          text: 'text-sky-700 dark:text-sky-400 font-bold',
          border: 'border-b border-sky-500/20 dark:border-sky-900/50',
          hex: 'var(--info)'
        };
      case DOCTOR_CARD_STATUS.PENDING:
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-950/80',
          text: 'text-amber-700 dark:text-amber-400 font-bold',
          border: 'border-b border-amber-500/20 dark:border-amber-900/50',
          hex: 'var(--warning)'
        };
      default:
        return {
          bg: 'bg-muted/60 dark:bg-zinc-900/85',
          text: 'text-muted-foreground dark:text-zinc-400 font-bold',
          border: 'border-b border-border/40 dark:border-zinc-800/60',
          hex: 'var(--muted-foreground)'
        };
    }
  }, [cardStatus]);

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
      className={cn(
        'group relative font-sans flex flex-col rounded-[20px] sm:rounded-[18px] border border-border bg-card text-card-foreground shadow-xs transition-all duration-200 hover:border-primary/60 hover:shadow-md overflow-hidden select-none cursor-pointer',
        isPending ? 'opacity-75 border-dashed bg-muted/20' : '',
        isSelected &&
          'ring-2 ring-primary/40 ring-offset-2 ring-offset-background border-primary/50 shadow-md',
        variant === 'elevated' && 'shadow-sm',
        variant === 'flat' && 'border-transparent shadow-none',
        className
      )}
    >
      {/* 1. TOP STATUS LIP (Bibir Status Atas - Terbalik dari Tiket Pasien, deep dark pada mode gelap) */}
      <div
        className={cn(
          'relative w-full h-8.5 sm:h-9 px-3 flex items-center justify-center overflow-hidden select-none transition-colors',
          lipStyle.bg,
          lipStyle.border
        )}
      >
        {/* Left Pixel Texture (Fades in from left to center) */}
        <div className='absolute left-0 top-0 bottom-0 w-28 sm:w-32 overflow-hidden pointer-events-none'>
          <PixelTexture
            colorMode='primary'
            primaryColor={lipStyle.hex}
            maskGradient='linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)'
            pixelSize={3.2}
            gap={1.2}
            opacity={0.65}
            className='opacity-55 dark:opacity-85'
          />
        </div>

        {/* Center Status Text (Natural casing, kontras tinggi di mode terang maupun gelap) */}
        <span
          className={cn(
            'text-[11.5px] sm:text-xs tracking-tight relative z-10 select-none drop-shadow-[0_0.5px_1px_rgba(0,0,0,0.05)]',
            lipStyle.text
          )}
        >
          {statusConfig.label}
        </span>

        {/* Right Pixel Texture (Fades in from right to center) */}
        <div className='absolute right-0 top-0 bottom-0 w-28 sm:w-32 overflow-hidden pointer-events-none'>
          <PixelTexture
            colorMode='primary'
            primaryColor={lipStyle.hex}
            maskGradient='linear-gradient(to left, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)'
            pixelSize={3.2}
            gap={1.2}
            opacity={0.65}
            className='opacity-55 dark:opacity-85'
          />
        </div>
      </div>

      {/* 2. MAIN CARD BODY (With Inner Dashed Stitch Frame / Motif Jahitan) */}
      <div className='p-1.5 sm:p-2 flex flex-col flex-1'>
        {/* Optional Doctor Trailing Avatar Background */}
        {showTrailingAvatar && <DoctorCardImage src={doctor.avatar} alt={doctor.nama_dokter} />}

        {/* Inner Dashed Stitch Frame (Motif Jahitan seperti di Flutter AmanahPermissionCard) */}
        <div className='rounded-[15px] sm:rounded-[13px] border border-dashed border-border/80 dark:border-white/10 p-3.5 sm:p-4 flex flex-col justify-between flex-1 min-h-[162px] sm:min-h-[158px] bg-card dark:bg-card/40 transition-colors'>
          {/* Section 1: Avatar + Nama Dokter & Spesialisasi */}
          <div className='flex items-center gap-3 sm:gap-2.5 relative z-20 min-w-0'>
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

          {/* Section 2: Antrean Pasien / Status Cuti */}
          <div className='mt-2.5 sm:mt-2 relative z-20 min-w-0'>
            {doctor.is_on_leave ? (
              <span className='inline-flex items-center gap-1.5 px-2.5 sm:px-2 py-0.5 rounded-md text-[11px] sm:text-[10.5px] xl:text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 truncate'>
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

          {/* Section 3: Footer Actions (Rata Kanan dengan rounded undang praktisi & trailing Apple squircle) */}
          {showActions && (
            <div className='flex items-center justify-end gap-2 sm:gap-1.5 pt-2.5 sm:pt-2 mt-auto border-t border-border/40 relative z-20'>
              {onOpenSettings && !isPending && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleSettings}
                  title='Lihat Jadwal Dokter'
                  aria-label='Lihat Jadwal Dokter'
                  className='h-10 sm:h-8.5 xl:h-8 px-3.5 sm:px-2.5 xl:px-2 rounded-lg sm:rounded-md text-xs sm:text-[11.5px] xl:text-[11px] font-semibold text-muted-foreground hover:text-foreground shrink-0 gap-1.5 shadow-2xs'
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onCardClick?.(doctor);
                  }}
                  title='Profil Medis Dokter'
                  aria-label='Profil Medis Dokter'
                  className='h-10 sm:h-8.5 xl:h-8 px-3.5 sm:px-2.5 xl:px-2 rounded-lg sm:rounded-md text-xs sm:text-[11px] xl:text-[10.5px] font-bold shrink-0 gap-1.5 shadow-2xs'
                >
                  <Icons.user className='size-3.5 sm:size-3.5 xl:size-3 text-muted-foreground shrink-0' />
                  <span>Profil Medis</span>
                </Button>
              ) : (
                <Button
                  type='button'
                  variant='default'
                  onClick={handleDetail}
                  title='Lihat Pasien'
                  aria-label='Lihat Pasien'
                  className='h-10 sm:h-8.5 xl:h-8 pl-3.5 pr-1.5 sm:pl-3 sm:pr-1.5 xl:pl-2.5 xl:pr-1 rounded-lg sm:rounded-md text-xs sm:text-[11.5px] xl:text-[11px] font-bold shrink-0 gap-2 sm:gap-1.5 shadow-xs'
                >
                  <span>Lihat Pasien</span>
                  <span className='size-6 sm:size-5.5 xl:size-5 rounded-[6px] sm:rounded-[5px] bg-primary-foreground text-primary flex items-center justify-center shrink-0 shadow-2xs'>
                    <Icons.arrowUpRight className='size-3.5 sm:size-3 xl:size-2.5 stroke-[2.5]' />
                  </span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
