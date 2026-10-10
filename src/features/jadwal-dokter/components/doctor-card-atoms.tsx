'use client';

import Image from 'next/image';
import type React from 'react';
import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

export interface DoctorStatusBadgeProps {
  status: string;
  className?: string;
  customLabel?: string;
}

export function DoctorStatusBadge({ status, className, customLabel }: DoctorStatusBadgeProps) {
  return (
    <StatusBadge
      status={status}
      variant='pill'
      size='md'
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
        'text-xs sm:text-[12.5px] font-medium text-muted-foreground tracking-tight line-clamp-1',
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

export function DoctorCardSettingsButton({
  onClick,
  className
}: DoctorCardSettingsButtonProps) {
  return (
    <Button
      variant='outline'
      size='icon'
      shape='pill'
      onClick={onClick}
      title='Atur Jadwal & Roster Dokter'
      aria-label='Atur Jadwal & Roster Dokter'
      className={cn('size-9 shadow-2xs z-20 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/80', className)}
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
  className?: string;
}

export function DoctorCutiNotice({
  title = 'Dokter sedang isOnLeave',
  subtitle = 'Tidak ada jadwal praktik',
  className
}: DoctorCutiNoticeProps) {
  return (
    <div className={cn('flex items-center gap-3.5 pt-3.5 mt-3.5 relative z-20', className)}>
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
        <span className='text-[14px] font-bold text-foreground leading-tight'>{title}</span>
        <span className='text-[12px] font-medium text-muted-foreground mt-0.5'>{subtitle}</span>
      </div>
    </div>
  );
}
