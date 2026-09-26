'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { doctorScheduleDetailQueryOptions } from '../api/queries';
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

function parseTimeToMinutes(timeStr: string): number {
  const clean = timeStr.replace('.', ':');
  const [h, m] = clean.split(':').map((v) => Number.parseInt(v, 10) || 0);
  return h * 60 + m;
}

const UNCONFIGURED_SCHEDULE_VALUES = new Set(['', '-', 'belum diatur', 'belum dijadwalkan']);

export function hasConfiguredDoctorSchedule(doctor: DoctorSchedule): boolean {
  if (doctor.sesi_harian && doctor.sesi_harian.length > 0) {
    return true;
  }

  const scheduleTime = doctor.jadwal_hari_ini?.trim().toLowerCase() ?? '';
  return !UNCONFIGURED_SCHEDULE_VALUES.has(scheduleTime);
}

/**
 * Helper to determine the upcoming available green slot time based on real-time hour
 */
export interface UpcomingScheduleResult {
  labelTime: string;
  sessionName?: string;
  activeTime?: string;
  upcomingTime?: string;
  hasActive?: boolean;
  isActiveClosed?: boolean;
}

export function isSlotClosed(slot: {
  status?: string | null;
  availabilityState?: string | null;
  effectiveStatus?: string | null;
  uiStatus?: string | null;
  closure?: unknown;
  closureInfo?: unknown;
  closedReason?: string | null;
}): boolean {
  const status = (slot.status || '').toUpperCase();
  const avail = (slot.availabilityState || '').toUpperCase();
  const eff = (slot.effectiveStatus || '').toUpperCase();
  const ui = (slot.uiStatus || '').toUpperCase();
  return (
    status === 'CLOSED' ||
    status === 'CLOSED_LEAVE' ||
    status === 'TUTUP' ||
    avail === 'CLOSED' ||
    eff === 'CLOSED' ||
    ui.startsWith('CLOSED') ||
    Boolean(slot.closure) ||
    Boolean(slot.closureInfo) ||
    Boolean(slot.closedReason)
  );
}

export function isSlotAvailable(slot: {
  isAvailable?: boolean;
  status?: string | null;
  availabilityState?: string | null;
  effectiveStatus?: string | null;
  isOccupied?: boolean;
}): boolean {
  if (slot.isOccupied) return false;
  if (typeof slot.isAvailable === 'boolean') return slot.isAvailable;
  const status = (slot.status || '').toUpperCase();
  const avail = (slot.availabilityState || '').toUpperCase();
  const eff = (slot.effectiveStatus || '').toUpperCase();
  return (
    status === 'AVAILABLE' ||
    status === 'OPEN' ||
    status === 'BUKA' ||
    avail === 'AVAILABLE' ||
    eff === 'AVAILABLE'
  );
}

export function formatUpcomingFallback(text?: string): string | undefined {
  if (!text || text.trim() === '' || text === 'Belum diatur' || text === 'Tidak Ada Jadwal') {
    return undefined;
  }
  const match = text.match(/(\d{1,2})[:.](\d{2})\s*-\s*(\d{1,2})[:.](\d{2})/);
  if (match) {
    const startH = Number.parseInt(match[1], 10);
    const startM = Number.parseInt(match[2], 10);
    const totalStartMin = startH * 60 + startM;
    const totalEndMin = totalStartMin + 30;
    const sTime = `${String(Math.floor(totalStartMin / 60)).padStart(2, '0')}.${String(totalStartMin % 60).padStart(2, '0')}`;
    const eTime = `${String(Math.floor(totalEndMin / 60)).padStart(2, '0')}.${String(totalEndMin % 60).padStart(2, '0')}`;
    return `${sTime} – ${eTime}`;
  }
  return text.replace(/:/g, '.');
}

export function parseDateToIso(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const MONTHS: Record<string, string> = {
    jan: '01',
    feb: '02',
    mar: '03',
    apr: '04',
    mei: '05',
    may: '05',
    jun: '06',
    jul: '07',
    agu: '08',
    aug: '08',
    sep: '09',
    okt: '10',
    oct: '10',
    nov: '11',
    des: '12',
    dec: '12'
  };
  const match = dateStr.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const monthKey = match[2].toLowerCase().slice(0, 3);
    const month = MONTHS[monthKey] || '01';
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  return undefined;
}

export function getUpcomingScheduleTime(
  scheduleTime: string,
  sessions?: DoctorDailySession[],
  doctor?: DoctorSchedule,
  referenceDate?: Date
): UpcomingScheduleResult {
  const now = referenceDate ?? new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 1. First priority: Check doctor's timeline_intervals or shifts for discrete 30-min slots
  const allSlots: Array<{
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    isOpen: boolean;
    sessionName?: string;
  }> = [];

  if (doctor?.shifts && doctor.shifts.length > 0) {
    for (const shift of doctor.shifts) {
      for (const slot of shift.slots) {
        const closed = isSlotClosed(slot);
        allSlots.push({
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: !closed && isSlotAvailable(slot),
          isOpen: !closed,
          sessionName: shift.contextLabel
        });
      }
    }
  } else if (doctor?.timeline_intervals && doctor.timeline_intervals.length > 0) {
    for (const it of doctor.timeline_intervals) {
      const closed = isSlotClosed(it);
      allSlots.push({
        startTime: it.startTime,
        endTime: it.endTime,
        isAvailable: !closed && isSlotAvailable(it),
        isOpen: !closed
      });
    }
  } else if (sessions && sessions.length > 0) {
    const sorted = sessions.toSorted(
      (a, b) => parseTimeToMinutes(a.jam_mulai) - parseTimeToMinutes(b.jam_mulai)
    );
    for (const s of sorted) {
      const isSessionOpen =
        s.status_sesi?.toUpperCase() === 'OPEN' || s.status_sesi?.toUpperCase() === 'BUKA';
      const hasSlot = (s.slot_tersedia ?? 1) > 0;
      const sMin = parseTimeToMinutes(s.jam_mulai);
      const eMin = parseTimeToMinutes(s.jam_selesai);
      for (let m = sMin; m < eMin; m += 30) {
        const slotStart = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
        const slotEndMin = m + 30;
        const slotEnd = `${String(Math.floor(slotEndMin / 60)).padStart(2, '0')}:${String(slotEndMin % 60).padStart(2, '0')}`;
        allSlots.push({
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable: isSessionOpen && hasSlot,
          isOpen: isSessionOpen,
          sessionName: s.nama_sesi
        });
      }
    }
  }

  // Check if there is an active slot or session right now
  let activeTime: string | undefined;
  let hasActive = false;
  let isActiveClosed = false;

  const currentMatchingSlot = allSlots.find(
    (slot) =>
      parseTimeToMinutes(slot.startTime) <= currentMinutes &&
      parseTimeToMinutes(slot.endTime) > currentMinutes
  );

  if (currentMatchingSlot) {
    hasActive = true;
    activeTime = `${currentMatchingSlot.startTime.replace(':', '.')} – ${currentMatchingSlot.endTime.replace(':', '.')}`;
    isActiveClosed = !currentMatchingSlot.isOpen || !currentMatchingSlot.isAvailable;
  } else if (sessions && sessions.length > 0 && allSlots.length === 0) {
    const activeSession = sessions.find(
      (s) =>
        parseTimeToMinutes(s.jam_mulai) <= currentMinutes &&
        parseTimeToMinutes(s.jam_selesai) > currentMinutes
    );
    if (activeSession) {
      hasActive = true;
      isActiveClosed =
        activeSession.status_sesi?.toUpperCase() === 'CLOSED' ||
        activeSession.status_sesi?.toUpperCase() === 'TUTUP' ||
        activeSession.status_sesi?.toUpperCase() === 'CUTI';
      const sStart = parseTimeToMinutes(activeSession.jam_mulai);
      const offset = Math.floor((currentMinutes - sStart) / 30) * 30;
      const winStart = sStart + offset;
      const winEnd = winStart + 30;
      const sTime = `${String(Math.floor(winStart / 60)).padStart(2, '0')}.${String(winStart % 60).padStart(2, '0')}`;
      const eTime = `${String(Math.floor(winEnd / 60)).padStart(2, '0')}.${String(winEnd % 60).padStart(2, '0')}`;
      activeTime = `${sTime} – ${eTime}`;
    }
  }

  // Cari slot tersedia (hijau) di masa mendatang (lewat dari jam saat ini)
  // Skip semua slot yang tutup atau tidak tersedia hingga menemukan slot terdekat berikutnya
  const futureAvailableSlot = allSlots.find(
    (slot) =>
      slot.isAvailable &&
      slot.isOpen === true &&
      parseTimeToMinutes(slot.startTime) > currentMinutes
  );

  if (futureAvailableSlot) {
    const sTime = futureAvailableSlot.startTime.replace(':', '.');
    const eTime = futureAvailableSlot.endTime.replace(':', '.');
    const formattedUpcoming = `${sTime} – ${eTime}`;
    return {
      labelTime: formattedUpcoming,
      upcomingTime: formattedUpcoming,
      sessionName: futureAvailableSlot.sessionName,
      activeTime,
      hasActive,
      isActiveClosed
    };
  }

  // Jika hari ini sudah tidak ada slot di masa depan, gunakan slot pertama yang tersedia pada siklus jadwal
  const firstAvailableSlot = allSlots.find((slot) => slot.isAvailable && slot.isOpen === true);
  if (firstAvailableSlot) {
    const sTime = firstAvailableSlot.startTime.replace(':', '.');
    const eTime = firstAvailableSlot.endTime.replace(':', '.');
    const formattedUpcoming = `${sTime} – ${eTime}`;
    return {
      labelTime: formattedUpcoming,
      upcomingTime: formattedUpcoming,
      sessionName: firstAvailableSlot.sessionName,
      activeTime,
      hasActive,
      isActiveClosed
    };
  }

  // Fallback: Jika ada sesi, ambil 30 menit pertama dari sesi mendatang yang buka
  if (sessions && sessions.length > 0) {
    const upcomingSession =
      sessions.find(
        (s) =>
          parseTimeToMinutes(s.jam_mulai) > currentMinutes &&
          s.status_sesi?.toUpperCase() !== 'CLOSED' &&
          s.status_sesi?.toUpperCase() !== 'TUTUP'
      ) ||
      sessions.find(
        (s) => s.status_sesi?.toUpperCase() !== 'CLOSED' && s.status_sesi?.toUpperCase() !== 'TUTUP'
      ) ||
      sessions[0];

    if (upcomingSession) {
      const sMin = parseTimeToMinutes(upcomingSession.jam_mulai);
      const eMin = sMin + 30;
      const sTime = upcomingSession.jam_mulai.replace(':', '.');
      const eTime = `${String(Math.floor(eMin / 60)).padStart(2, '0')}.${String(eMin % 60).padStart(2, '0')}`;
      const formattedUpcoming = `${sTime} – ${eTime}`;
      return {
        labelTime: formattedUpcoming,
        upcomingTime: formattedUpcoming,
        sessionName: upcomingSession.nama_sesi,
        activeTime,
        hasActive,
        isActiveClosed
      };
    }
  }

  // Clean fallback (convert 08:00 - 12:00 to 08.00 - 08.30 if 30-min duration)
  if (scheduleTime && scheduleTime.trim() !== '') {
    const parts = scheduleTime.split('-').map((p) => p.trim());
    if (parts.length === 2 && parts[0]) {
      const sMin = parseTimeToMinutes(parts[0]);
      const eMin = sMin + 30;
      const sTime = parts[0].replace(':', '.');
      const eTime = `${String(Math.floor(eMin / 60)).padStart(2, '0')}.${String(eMin % 60).padStart(2, '0')}`;
      const formattedUpcoming = `${sTime} – ${eTime}`;
      return {
        labelTime: formattedUpcoming,
        upcomingTime: formattedUpcoming,
        activeTime,
        hasActive,
        isActiveClosed
      };
    }
    const cleanTime = scheduleTime.replace(/:/g, '.');
    return {
      labelTime: cleanTime,
      upcomingTime: cleanTime,
      activeTime,
      hasActive,
      isActiveClosed
    };
  }

  return {
    labelTime: 'Belum diatur',
    upcomingTime: 'Belum diatur',
    activeTime,
    hasActive,
    isActiveClosed
  };
}

/**
 * Molecule: Schedule Time & Slot Availability Block (Horizontal 2 or 3-Column)
 */
export interface DoctorScheduleStatsProps {
  scheduleTime: string;
  availableSlots: number;
  totalCapacity: number;
  displaySlot?: string;
  upcomingScheduleTime?: string;
  sessions?: DoctorDailySession[];
  doctor?: DoctorSchedule;
  className?: string;
}

export function DoctorScheduleStats({
  scheduleTime,
  availableSlots,
  totalCapacity,
  displaySlot: _displaySlot,
  upcomingScheduleTime,
  sessions,
  doctor,
  className
}: DoctorScheduleStatsProps) {
  const { labelTime, activeTime, upcomingTime, hasActive, isActiveClosed } =
    getUpcomingScheduleTime(scheduleTime, sessions, doctor);
  const resolvedUpcoming =
    upcomingTime || labelTime || formatUpcomingFallback(upcomingScheduleTime) || 'Belum diatur';

  // Capacity / Slot calculation: [pasien booking]/[total slot yang dijadwalkan]
  const effectiveTotal =
    totalCapacity > 0
      ? totalCapacity
      : sessions && sessions.length > 0
        ? sessions.reduce((acc, s) => acc + (s.kuota_pasien || 0), 0)
        : 0;

  const bookedCount =
    typeof doctor?.slot_terisi_akumulasi === 'number'
      ? doctor.slot_terisi_akumulasi
      : typeof doctor?.metrics?.occupiedSlots === 'number'
        ? doctor.metrics.occupiedSlots
        : Math.max(0, effectiveTotal - availableSlots);

  const slotDisplay = effectiveTotal > 0 ? `${bookedCount}/${effectiveTotal}` : '0/0';

  if (hasActive && activeTime) {
    return (
      <div
        className={cn(
          'grid grid-cols-3 gap-2 sm:gap-2.5 pt-3 mt-3.5 border-t border-border/50 relative z-20',
          className
        )}
      >
        {/* Kolom 1: Sedang Aktif / Tutup */}
        <div className='flex flex-col min-w-0'>
          {isActiveClosed ? (
            <div className='flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400'>
              <span className='size-1.5 rounded-full bg-rose-500 shrink-0' />
              <span className='truncate'>Tutup</span>
            </div>
          ) : (
            <div className='flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400'>
              <span className='size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0' />
              <span className='truncate'>Sedang Aktif</span>
            </div>
          )}
          <span className='font-bold text-foreground font-mono mt-1 text-[13px] sm:text-[13.5px] tracking-tight truncate'>
            {activeTime}
          </span>
        </div>

        {/* Kolom 2: Jadwal Mendatang */}
        <div className='flex flex-col min-w-0'>
          <div className='flex items-center gap-1 text-[11px] font-medium text-muted-foreground'>
            <Icons.clock className='size-3 shrink-0 text-muted-foreground/80' />
            <span className='truncate'>Jadwal Mendatang</span>
          </div>
          <span className='font-bold text-foreground font-mono mt-1 text-[13px] sm:text-[13.5px] tracking-tight truncate'>
            {resolvedUpcoming}
          </span>
        </div>

        {/* Kolom 3: Slot Tersedia [pasien booking]/[total slot] */}
        <div className='flex flex-col min-w-0'>
          <div className='flex items-center gap-1 text-[11px] font-medium text-muted-foreground'>
            <Icons.teams className='size-3 shrink-0 text-muted-foreground/80' />
            <span className='truncate'>Slot Tersedia</span>
          </div>
          <div className='flex items-center gap-1 text-[13px] sm:text-[13.5px] font-bold text-foreground font-mono mt-1 tracking-tight'>
            <Icons.user className='size-3 text-foreground shrink-0' />
            <span>{slotDisplay}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 pt-3.5 mt-3.5 border-t border-border/50 relative z-20',
        className
      )}
    >
      {/* Kolom 1: Jadwal Mendatang */}
      <div className='flex flex-col min-w-0'>
        <div className='flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground'>
          <Icons.clock className='size-3.5 shrink-0 text-muted-foreground/80' />
          <span>Jadwal Mendatang</span>
        </div>
        <span className='font-bold text-foreground font-mono mt-1 text-[15px] sm:text-[15.5px] tracking-tight truncate'>
          {resolvedUpcoming}
        </span>
      </div>

      {/* Kolom 2: Slot Tersedia [pasien booking]/[total slot] */}
      <div className='flex flex-col min-w-0'>
        <div className='flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground'>
          <Icons.teams className='size-3.5 shrink-0 text-muted-foreground/80' />
          <span>Slot Tersedia</span>
        </div>
        <div className='flex items-center gap-1.5 text-[15px] sm:text-[15.5px] font-bold text-foreground font-mono mt-1 tracking-tight'>
          <Icons.user className='size-3.5 text-foreground shrink-0' />
          <span>{slotDisplay}</span>
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
  date?: string;
  onOpenDetail?: (doctor: DoctorSchedule) => void;
  onOpenEdit?: (doctor: DoctorSchedule) => void;
  onOpenReschedule?: (doctor: DoctorSchedule) => void;
  onCall?: (doctor: DoctorSchedule) => void;
  variant?: 'default' | 'compact' | 'flat' | 'elevated';
  showActions?: boolean;
  showCallButton?: boolean;
  showStats?: boolean;
  className?: string;
}

export function getDoctorCardStatus(
  doctor: DoctorSchedule
): 'Buka' | 'Cuti' | 'Terisi' | 'Belum Diatur' | 'Tutup' {
  const statusDokter = (doctor.status_dokter || '').trim().toUpperCase();
  const statusJadwal = (doctor.status_jadwal || '').trim().toUpperCase();

  if (doctor.is_cuti || statusDokter === 'CUTI' || statusJadwal === 'CUTI') {
    return 'Cuti';
  }

  if (
    statusDokter === 'CLOSED' ||
    statusDokter === 'TUTUP' ||
    statusJadwal === 'CLOSED' ||
    statusJadwal === 'TUTUP'
  ) {
    return 'Tutup';
  }

  if (!hasConfiguredDoctorSchedule(doctor)) {
    return 'Belum Diatur';
  }

  if (
    statusDokter === 'OCCUPIED' ||
    statusDokter === 'TERISI' ||
    statusJadwal === 'OCCUPIED' ||
    statusJadwal === 'TERISI' ||
    doctor.slot_tersedia <= 0
  ) {
    return 'Terisi';
  }

  return 'Buka';
}

export function DoctorScheduleCard({
  doctor,
  date,
  onOpenDetail,
  onOpenEdit,
  onOpenReschedule,
  onCall,
  variant = 'default',
  showActions = true,
  showCallButton = true,
  showStats = true,
  className
}: DoctorScheduleCardProps) {
  const detailQuery = useQuery({
    ...doctorScheduleDetailQueryOptions(doctor.id, {
      date: date || parseDateToIso(doctor.tanggal_praktik)
    }),
    enabled: Boolean(!doctor.timeline_intervals && !doctor.shifts && doctor.id)
  });
  const effectiveDoctor = detailQuery.data ? { ...doctor, ...detailQuery.data } : doctor;

  const statusLabel = getDoctorCardStatus(effectiveDoctor);
  const isCuti = statusLabel === 'Cuti';
  const isUnconfigured = statusLabel === 'Belum Diatur';
  const isTutup = statusLabel === 'Tutup';

  // Handle Call action
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCall) {
      onCall(doctor);
    } else if (doctor.nomor_telepon) {
      window.open(`tel:${doctor.nomor_telepon.replace(/\s+/g, '')}`, '_self');
    }
  };

  // Handle Reschedule action (triggers reschedule modal)
  const handleReschedule = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenReschedule) {
      onOpenReschedule(doctor);
    } else {
      onOpenEdit?.(doctor);
    }
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
        {showCallButton && !isUnconfigured && (
          <DoctorQuickCallButton
            phoneNumber={doctor.nomor_telepon ?? undefined}
            onClick={handleCall}
          />
        )}
      </div>

      {/* 3. Main Identity & Metadata Section */}
      <div className='flex flex-col relative z-20 mt-3'>
        <DoctorSpecialtyBadge specialty={doctor.spesialisasi} />

        <h3
          title={doctor.nama_dokter}
          className='text-[18px] sm:text-[19px] font-bold text-card-foreground tracking-tight leading-snug pr-24 sm:pr-28 mt-2 mb-2.5 line-clamp-1'
        >
          {isUnconfigured ? (
            doctor.nama_dokter
          ) : (
            <button
              type='button'
              onClick={handleDetail}
              className='text-left hover:text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline'
            >
              {doctor.nama_dokter}
            </button>
          )}
        </h3>

        {/* Location Row */}
        <DoctorInfoRow
          icon={<Icons.stethoscope className='size-4 text-muted-foreground' />}
          text={doctor.ruang_praktik}
        />

        {/* Date Row (rendered when not cuti/tutup or date is provided) */}
        {!isCuti && !isUnconfigured && !isTutup && doctor.tanggal_praktik && (
          <DoctorInfoRow
            icon={<Icons.calendar className='size-4 text-muted-foreground' />}
            text={doctor.tanggal_praktik}
            className='mt-1.5'
          />
        )}
      </div>

      {/* 4. Schedule Stats (Active) OR Cuti / Closed / Unconfigured Notice */}
      {showStats &&
        (isCuti ? (
          <DoctorCutiNotice
            title='Dokter sedang cuti'
            subtitle={doctor.cuti_reason || 'Tidak ada jadwal praktik'}
          />
        ) : isTutup ? (
          <DoctorCutiNotice
            title='Praktik Ditutup'
            subtitle='Tidak ada jadwal praktik aktif pada tanggal ini.'
          />
        ) : isUnconfigured ? (
          <DoctorCutiNotice
            title='Belum ada jadwal praktik'
            subtitle='Dokter ini belum memiliki sesi praktik yang diatur.'
          />
        ) : (
          <DoctorScheduleStats
            scheduleTime={effectiveDoctor.jadwal_hari_ini || 'Belum diatur'}
            availableSlots={effectiveDoctor.slot_tersedia}
            totalCapacity={effectiveDoctor.kapasitas_per_hari}
            displaySlot={effectiveDoctor.display_akumulasi_slot}
            upcomingScheduleTime={effectiveDoctor.jadwal_praktik_mendatang}
            sessions={effectiveDoctor.sesi_harian}
            doctor={effectiveDoctor}
          />
        ))}

      {/* 5. Action Footer Buttons (Reschedule & Detail) */}
      {showActions && !isUnconfigured && (
        <div
          className={cn(
            'flex items-center justify-end gap-2 pt-3 mt-auto border-t border-border/40 relative z-20'
          )}
        >
          {!isCuti && !isTutup && (
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
