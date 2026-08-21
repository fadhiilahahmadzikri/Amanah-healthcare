'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';

// ============================================================================
// 1. ATOMIC COMPONENTS (Atoms & Molecules)
// ============================================================================

/**
 * Atom: Status Badge Pill with indicator dot (reusing design-system StatusBadge)
 */
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

/**
 * Atom: Specialty Badge (reusing design-system Badge)
 */
export interface DoctorSpecialtyBadgeProps {
  specialty: string;
  className?: string;
}

export function DoctorSpecialtyBadge({ specialty, className }: DoctorSpecialtyBadgeProps) {
  return (
    <Badge
      variant='secondary'
      style={{
        backgroundColor: 'color-mix(in oklab, var(--primary) 12%, transparent)',
        color: 'var(--primary)',
        borderColor: 'color-mix(in oklab, var(--primary) 24%, transparent)'
      }}
      className={cn(
        'px-2.5 py-1 rounded-lg text-[11.5px] font-semibold w-fit select-none shadow-none transition-colors border',
        className
      )}
    >
      {specialty}
    </Badge>
  );
}

/**
 * Atom: Quick Phone Call Action Button
 */
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

/**
 * Atom: Doctor Transparent Cutout Image with Fade Compositing
 */
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

/**
 * Atom: Reusable Metadata Information Row
 */
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

/**
 * Helper to determine the upcoming/active session time based on real-time hour
 */
export function getUpcomingScheduleTime(
  scheduleTime: string,
  sessions?: DoctorDailySession[]
): { labelTime: string; sessionName?: string } {
  if (!sessions || sessions.length === 0) {
    return { labelTime: scheduleTime };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTimeToMinutes = (timeStr: string): number => {
    const clean = timeStr.replace('.', ':');
    const [h, m] = clean.split(':').map((v) => parseInt(v, 10) || 0);
    return h * 60 + m;
  };

  const availableSessions = sessions.filter((s) => s.status_sesi !== 'Cuti');

  if (availableSessions.length === 0) {
    const firstSession = sessions[0];
    return {
      labelTime: firstSession?.waktu || scheduleTime,
      sessionName: firstSession?.nama_sesi
    };
  }

  // 1. Cek apakah saat ini sedang dalam sesi aktif yang sedang berlangsung
  const ongoingSession = availableSessions.find((s) => {
    const start = parseTimeToMinutes(s.jam_mulai);
    const end = parseTimeToMinutes(s.jam_selesai);
    if (end > start) {
      return currentMinutes >= start && currentMinutes <= end;
    }
    // Shift lintas malam / dini hari (misal 23:00 - 06:00)
    return currentMinutes >= start || currentMinutes <= end;
  });

  if (ongoingSession) {
    return {
      labelTime: ongoingSession.waktu,
      sessionName: ongoingSession.nama_sesi
    };
  }

  // 2. Cari sesi paling awal yang akan datang hari ini (jam mulai > jam sekarang)
  const upcomingToday = availableSessions.find((s) => {
    const start = parseTimeToMinutes(s.jam_mulai);
    return start > currentMinutes;
  });

  if (upcomingToday) {
    return {
      labelTime: upcomingToday.waktu,
      sessionName: upcomingToday.nama_sesi
    };
  }

  // 3. Jika semua sesi hari ini sudah lewat, ambil sesi awal untuk siklus jadwal berikutnya
  const nextCycleSession = availableSessions[0] || sessions[0];
  return {
    labelTime: nextCycleSession?.waktu || scheduleTime,
    sessionName: nextCycleSession?.nama_sesi
  };
}

/**
 * Molecule: Schedule Time & Slot Availability Block (Clean 2-Column)
 */
export interface DoctorScheduleStatsProps {
  scheduleTime: string;
  availableSlots: number;
  totalCapacity: number;
  sessions?: DoctorDailySession[];
  className?: string;
}

export function DoctorScheduleStats({
  scheduleTime,
  availableSlots,
  totalCapacity,
  sessions,
  className
}: DoctorScheduleStatsProps) {
  const { labelTime } = getUpcomingScheduleTime(scheduleTime, sessions);
  const isLongTime = (labelTime || '').length > 14;

  return (
    <div
      className={cn(
        'grid gap-3 pt-3.5 mt-3.5 border-t border-border/50 relative z-20',
        isLongTime ? 'grid-cols-1' : 'grid-cols-2',
        className
      )}
    >
      {/* Schedule Time Column (Upcoming Schedule) */}
      <div className='flex flex-col min-w-0'>
        <div className='flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground'>
          <Icons.clock className='size-3.5 shrink-0 text-muted-foreground/80' />
          <span>Jadwal Praktik</span>
        </div>
        <span
          className={cn(
            'font-bold text-foreground font-mono mt-1 tracking-tight break-words leading-tight',
            isLongTime ? 'text-[13px]' : 'text-[15.5px]'
          )}
        >
          {labelTime}
        </span>
      </div>

      {/* Available Slots Column */}
      <div className='flex flex-col min-w-0'>
        <div className='flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground'>
          <Icons.teams className='size-3.5 shrink-0 text-muted-foreground/80' />
          <span>Slot Tersedia</span>
        </div>
        <div className='flex items-center gap-1.5 text-[15.5px] font-bold text-foreground font-mono mt-1 tracking-tight'>
          <Icons.user className='size-3.5 text-foreground shrink-0' />
          <span>
            {availableSlots}/{totalCapacity}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Molecule: Cuti Status Notice Banner
 */
export interface DoctorCutiNoticeProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function DoctorCutiNotice({
  title = 'Dokter sedang cuti',
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

/**
 * Molecule: Card Action Buttons (Reschedule & Detail)
 */
export interface DoctorCardActionsProps {
  onReschedule?: (e: React.MouseEvent) => void;
  onDetail?: (e: React.MouseEvent) => void;
  rescheduleLabel?: string;
  detailLabel?: string;
  className?: string;
}

export function DoctorCardActions({
  onReschedule,
  onDetail,
  rescheduleLabel = 'Reschedule',
  detailLabel = 'Detail',
  className
}: DoctorCardActionsProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 pt-3 mt-auto border-t border-border/40 relative z-20',
        className
      )}
    >
      <Button
        type='button'
        variant='outline'
        size='card-action'
        shape='pill'
        onClick={onReschedule}
        className='font-semibold'
        leadingIcon={<Icons.calendar className='size-3.5 text-muted-foreground' />}
      >
        {rescheduleLabel}
      </Button>

      <Button
        type='button'
        variant='default'
        size='card-action'
        shape='pill'
        withTrailingCircleIcon
        onClick={onDetail}
        className='font-bold'
      >
        {detailLabel}
      </Button>
    </div>
  );
}

// ============================================================================
// 3. MAIN ORGANISM COMPONENT: DoctorScheduleCard
// ============================================================================

export interface DoctorScheduleCardProps {
  doctor: DoctorSchedule;
  onOpenDetail?: (doctor: DoctorSchedule) => void;
  onOpenEdit?: (doctor: DoctorSchedule) => void;
  onCall?: (doctor: DoctorSchedule) => void;
  variant?: 'default' | 'compact' | 'flat' | 'elevated';
  showActions?: boolean;
  showCallButton?: boolean;
  showStats?: boolean;
  className?: string;
}

export function getDoctorCardStatus(doctor: DoctorSchedule): 'Buka' | 'Cuti' | 'Penuh' {
  if (doctor.is_cuti || doctor.status_dokter === 'Cuti' || doctor.status_jadwal === 'Cuti')
    return 'Cuti';
  if (doctor.slot_tersedia <= 0 || doctor.status_jadwal === 'Penuh') return 'Penuh';
  return 'Buka';
}

export function DoctorScheduleCard({
  doctor,
  onOpenDetail,
  onOpenEdit,
  onCall,
  variant = 'default',
  showActions = true,
  showCallButton = true,
  showStats = true,
  className
}: DoctorScheduleCardProps) {
  const statusLabel = getDoctorCardStatus(doctor);
  const isCuti = statusLabel === 'Cuti';

  // Handle Call action
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCall) {
      onCall(doctor);
    } else if (doctor.nomor_telepon) {
      window.open(`tel:${doctor.nomor_telepon.replace(/\s+/g, '')}`, '_self');
    }
  };

  // Handle Reschedule action (opens edit modal)
  const handleReschedule = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenEdit?.(doctor);
  };

  // Handle Detail action (opens detail modal/sheet)
  const handleDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetail?.(doctor);
  };

  return (
    <div
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 100% 0%, color-mix(in oklab, var(--primary) 18%, transparent) 0%, color-mix(in oklab, var(--primary) 5%, transparent) 45%, transparent 80%), var(--card)'
      }}
      className={cn(
        'group relative overflow-hidden rounded-[24px] border border-border font-sans flex flex-col justify-between select-none transition-all duration-200 hover:border-primary/60 hover:shadow-md p-5 sm:p-6 min-h-[340px] text-card-foreground',
        variant === 'elevated' && 'shadow-sm',
        variant === 'flat' && 'border-transparent shadow-none',
        className
      )}
    >
      {/* 1. Transparent Doctor Cutout Image */}
      <DoctorCardImage src={doctor.avatar} alt={doctor.nama_dokter} />

      {/* 2. Top Header: Status Badge & Quick Phone Button */}
      <div className='flex items-center justify-between gap-3 relative z-20'>
        <DoctorStatusBadge status={statusLabel} />
        {showCallButton && (
          <DoctorQuickCallButton phoneNumber={doctor.nomor_telepon} onClick={handleCall} />
        )}
      </div>

      {/* 3. Main Identity & Metadata Section */}
      <div className='flex flex-col relative z-20 mt-3'>
        <DoctorSpecialtyBadge specialty={doctor.spesialisasi} />

        <h3
          onClick={handleDetail}
          title={doctor.nama_dokter}
          className='text-[18px] sm:text-[19px] font-bold text-card-foreground tracking-tight leading-snug cursor-pointer hover:text-primary transition-colors pr-24 sm:pr-28 mt-2 mb-2.5 line-clamp-1'
        >
          {doctor.nama_dokter}
        </h3>

        {/* Location Row */}
        <DoctorInfoRow
          icon={<Icons.stethoscope className='size-4 text-muted-foreground' />}
          text={doctor.ruang_praktik}
        />

        {/* Date Row (rendered when not cuti or date is provided) */}
        {!isCuti && doctor.tanggal_praktik && (
          <DoctorInfoRow
            icon={<Icons.calendar className='size-4 text-muted-foreground' />}
            text={doctor.tanggal_praktik}
            className='mt-1.5'
          />
        )}
      </div>

      {/* 4. Schedule Stats (Active) OR Cuti Notice (Leave) */}
      {showStats &&
        (isCuti ? (
          <DoctorCutiNotice
            title='Dokter sedang cuti'
            subtitle={doctor.cuti_reason || 'Tidak ada jadwal praktik'}
          />
        ) : (
          <DoctorScheduleStats
            scheduleTime={doctor.jadwal_hari_ini}
            availableSlots={doctor.slot_tersedia}
            totalCapacity={doctor.kapasitas_per_hari}
            sessions={doctor.sesi_harian}
          />
        ))}

      {/* 5. Action Footer Buttons (Reschedule & Detail) */}
      {showActions && (
        <div
          className={cn(
            'flex items-center justify-end gap-2 pt-3 mt-auto border-t border-border/40 relative z-20'
          )}
        >
          {!isCuti && (
            <Button
              type='button'
              variant='outline'
              size='card-action'
              shape='pill'
              onClick={handleReschedule}
              className='font-semibold'
              leadingIcon={<Icons.calendar className='size-3.5 text-muted-foreground' />}
            >
              Reschedule
            </Button>
          )}

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
        </div>
      )}
    </div>
  );
}

export default DoctorScheduleCard;
