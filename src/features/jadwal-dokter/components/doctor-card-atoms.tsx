'use client';

import Image from 'next/image';
import type React from 'react';
import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { DoctorCardPatientPreview } from '../api/types';

export interface DoctorStatusBadgeProps {
  status: string;
  className?: string;
  customLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export function DoctorStatusBadge({
  status,
  className,
  customLabel,
  size = 'sm'
}: DoctorStatusBadgeProps) {
  return (
    <StatusBadge
      status={status}
      variant='pill'
      size={size}
      label={customLabel}
      className={className}
    />
  );
}

export interface DoctorSpecialtyTextProps {
  specialty: string;
  className?: string;
}

export function DoctorSpecialtyText({ specialty, className }: DoctorSpecialtyTextProps) {
  return (
    <p
      className={cn(
        'text-[12px] sm:text-[11.5px] xl:text-[11px] font-medium text-muted-foreground tracking-tight line-clamp-1',
        className
      )}
    >
      {specialty}
    </p>
  );
}

export interface DoctorSpecialtyBadgeProps {
  specialty: string;
  className?: string;
}

export function DoctorSpecialtyBadge({ specialty, className }: DoctorSpecialtyBadgeProps) {
  return <DoctorSpecialtyText specialty={specialty} className={className} />;
}

export interface ActiveSessionIndicatorProps {
  time: string;
  isClosed?: boolean;
  className?: string;
}

export function ActiveSessionIndicator({ time, isClosed, className }: ActiveSessionIndicatorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 font-bold font-mono text-foreground min-w-0',
        className
      )}
      title={isClosed ? 'Tutup' : 'Sedang Aktif'}
    >
      <span
        className={cn(
          'size-2 rounded-full shrink-0',
          isClosed ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
        )}
      />
      <span className='truncate text-xs sm:text-[13px]'>{time}</span>
    </div>
  );
}

export interface UpcomingScheduleIndicatorProps {
  time: string;
  className?: string;
}

export function UpcomingScheduleIndicator({ time, className }: UpcomingScheduleIndicatorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 font-bold font-mono text-foreground min-w-0 text-xs sm:text-[13px]',
        className
      )}
      title='Jadwal Mendatang'
    >
      <Icons.clock className='size-3.5 text-muted-foreground shrink-0' />
      <span className='truncate'>{time}</span>
    </div>
  );
}

export interface DoctorQuickCallButtonProps {
  phoneNumber?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export function DoctorQuickCallButton({
  phoneNumber,
  onClick,
  className
}: DoctorQuickCallButtonProps) {
  return (
    <Button
      variant='outline'
      size='icon'
      shape='pill'
      onClick={onClick}
      title={phoneNumber ? `Hubungi: ${phoneNumber}` : 'Hubungi dokter'}
      aria-label='Hubungi dokter'
      className={cn('size-9 shadow-2xs z-20 shrink-0', className)}
    >
      <Icons.phone className='size-4 text-foreground' />
    </Button>
  );
}

export interface DoctorCardSettingsButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export function DoctorCardSettingsButton({ onClick, className }: DoctorCardSettingsButtonProps) {
  return (
    <Button
      variant='outline'
      size='icon'
      shape='pill'
      onClick={onClick}
      title='Atur Jadwal & Roster Dokter'
      aria-label='Atur Jadwal & Roster Dokter'
      className={cn(
        'size-9 shadow-2xs z-20 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/80',
        className
      )}
    >
      <Icons.settings className='size-4' />
    </Button>
  );
}

export interface DoctorCardImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export function DoctorCardImage({ src, alt, className }: DoctorCardImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute right-2 sm:right-3 top-6 sm:top-6 w-[155px] sm:w-[175px] h-[232px] sm:h-[262px] pointer-events-none z-10 select-none flex items-start justify-end',
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes='(max-width: 768px) 155px, 175px'
        onError={() => setHasError(true)}
        className='object-contain object-top-right [mask-image:linear-gradient(to_bottom,black_45%,transparent_92%)] [-webkit-mask-image:linear-gradient(to_bottom,black_45%,transparent_92%)]'
      />
    </div>
  );
}

export interface DoctorInfoRowProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
}

export function DoctorInfoRow({ icon, text, className }: DoctorInfoRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-[12.5px] font-medium text-muted-foreground',
        className
      )}
    >
      <span className='shrink-0 text-muted-foreground/80'>{icon}</span>
      <span className='truncate'>{text}</span>
    </div>
  );
}

export interface DoctorCutiNoticeProps {
  title?: string;
  subtitle?: string;
  leaveType?: string | null;
  substituteDoctorName?: string | null;
  className?: string;
}

export function DoctorCutiNotice({
  title = 'Dokter sedang Cuti',
  subtitle = 'Tidak ada jadwal praktik',
  leaveType,
  substituteDoctorName,
  className
}: DoctorCutiNoticeProps) {
  return (
    <div className={cn('flex flex-col gap-2.5 pt-3.5 mt-3.5 relative z-20', className)}>
      <div className='flex items-center gap-3.5'>
        <div
          className='size-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/40 dark:border-white/20 shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.7),0_3px_8px_-1px_var(--pill-3d-shadow),0_1px_2px_0_rgba(0,0,0,0.1)]'
          style={{
            background: 'var(--pill-3d-gradient)',
            borderColor: 'var(--pill-3d-border)'
          }}
        >
          <Icons.calendar className='size-6 text-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)] stroke-[2.2]' />
        </div>
        <div className='flex flex-col'>
          <div className='flex items-center gap-2'>
            <span className='text-[14px] font-bold text-foreground leading-tight'>{title}</span>
            {leaveType && (
              <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'>
                {leaveType}
              </span>
            )}
          </div>
          <span className='text-[12px] font-medium text-muted-foreground mt-0.5'>{subtitle}</span>
        </div>
      </div>
      {substituteDoctorName && (
        <div className='flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/50 text-[11.5px] font-medium text-muted-foreground'>
          <Icons.userCheck className='size-3.5 text-primary shrink-0' />
          <span>
            Dokter Pengganti: <strong className='text-foreground'>{substituteDoctorName}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

export interface DoctorCardPatientStackProps {
  patients?: DoctorCardPatientPreview[];
  totalPatients?: number;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export function DoctorCardPatientStack({
  patients = [],
  totalPatients = 0,
  onClick,
  className
}: DoctorCardPatientStackProps) {
  const visiblePatients = patients.slice(0, 3);
  const effectiveTotal = Math.max(totalPatients, patients.length);
  const overflowCount = effectiveTotal > 3 ? effectiveTotal - 3 : 0;

  if (effectiveTotal === 0) {
    return (
      <div
        className={cn(
          'text-[11px] sm:text-[10.5px] xl:text-[10px] text-muted-foreground/75 font-normal select-none truncate',
          className
        )}
      >
        <span>Belum ada antrean</span>
      </div>
    );
  }

  return (
    <button
      type='button'
      onClick={onClick}
      title={`Lihat detail ${effectiveTotal} pasien`}
      className={cn(
        'group/patient-stack inline-flex items-center gap-2 sm:gap-1.5 xl:gap-1.5 text-left cursor-pointer select-none focus-visible:outline-none transition-transform active:scale-[0.98] min-w-0',
        className
      )}
    >
      {/* Overlapping Avatar Stack (WhatsApp-style) */}
      <div className='flex items-center -space-x-1.5 sm:-space-x-1.5 rtl:space-x-reverse overflow-hidden py-0.5 pl-0.5 shrink-0'>
        {visiblePatients.map((patient, index) => (
          <Avatar
            key={patient.id || patient.patientId || index}
            title={patient.name}
            className='size-6 sm:size-5.5 xl:size-5 rounded-full ring-1.5 ring-card shadow-2xs border border-border/40 shrink-0 transition-transform group-hover/patient-stack:scale-105'
          >
            {patient.avatarUrl && <AvatarImage src={patient.avatarUrl} alt={patient.name} />}
            <AvatarFallback className='bg-primary/10 text-primary font-bold text-[9px] sm:text-[8.5px] xl:text-[8px] uppercase tracking-tight'>
              {patient.initials || 'P'}
            </AvatarFallback>
          </Avatar>
        ))}

        {overflowCount > 0 && (
          <div
            title={`${overflowCount} pasien lainnya`}
            className='size-6 sm:size-5.5 xl:size-5 rounded-full ring-1.5 ring-card bg-muted/90 text-muted-foreground font-bold text-[9px] sm:text-[8.5px] xl:text-[8px] flex items-center justify-center shrink-0 border border-border/50 shadow-2xs group-hover/patient-stack:bg-muted transition-colors'
          >
            +{overflowCount}
          </div>
        )}
      </div>

      {/* Aggregate Label */}
      <div className='flex flex-col min-w-0 leading-tight'>
        <span className='text-xs sm:text-[11px] xl:text-[10.5px] font-semibold text-foreground/90 group-hover/patient-stack:text-primary transition-colors truncate'>
          {effectiveTotal} Pasien
        </span>
        <span className='text-[10px] sm:text-[9.5px] xl:text-[9px] text-muted-foreground/80 font-normal truncate'>
          Antrean aktif
        </span>
      </div>
    </button>
  );
}
