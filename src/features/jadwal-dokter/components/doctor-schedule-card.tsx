'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { DoctorSchedule } from '../api/types';

// ============================================================================
// 1. CONFIGURATION & TOKEN SYSTEM (Config-based paradigm)
// ============================================================================

export type DoctorStatusVariant =
  | 'Aktif'
  | 'Pending'
  | 'Selesai'
  | 'Terkoneksi'
  | 'Cuti'
  | 'Libur'
  | string;

export interface StatusStyleConfig {
  pillBg: string;
  pillBorder: string;
  dotColor: string;
  textColor: string;
  label: string;
}

export const DOCTOR_STATUS_STYLES: Record<string, StatusStyleConfig> = {
  aktif: {
    pillBg: 'bg-[#ECFDF5] dark:bg-emerald-950/40',
    pillBorder: 'border-[#A7F3D0] dark:border-emerald-800/50',
    dotColor: 'bg-[#10B981]',
    textColor: 'text-[#059669] dark:text-emerald-300',
    label: 'Aktif'
  },
  pending: {
    pillBg: 'bg-[#FFFBEB] dark:bg-amber-950/40',
    pillBorder: 'border-[#FDE68A] dark:border-amber-800/50',
    dotColor: 'bg-[#F59E0B]',
    textColor: 'text-[#D97706] dark:text-amber-300',
    label: 'Pending'
  },
  selesai: {
    pillBg: 'bg-[#EFF6FF] dark:bg-blue-950/40',
    pillBorder: 'border-[#BFDBFE] dark:border-blue-800/50',
    dotColor: 'bg-[#3B82F6]',
    textColor: 'text-[#2563EB] dark:text-blue-300',
    label: 'Selesai'
  },
  terkoneksi: {
    pillBg: 'bg-[#FAF5FF] dark:bg-purple-950/40',
    pillBorder: 'border-[#E9D5FF] dark:border-purple-800/50',
    dotColor: 'bg-[#8B5CF6]',
    textColor: 'text-[#7C3AED] dark:text-purple-300',
    label: 'Terkoneksi'
  },
  cuti: {
    pillBg: 'bg-[#FEF2F2] dark:bg-rose-950/40',
    pillBorder: 'border-[#FECACA] dark:border-rose-800/50',
    dotColor: 'bg-[#EF4444]',
    textColor: 'text-[#DC2626] dark:text-rose-300',
    label: 'Cuti'
  },
  libur: {
    pillBg: 'bg-slate-100 dark:bg-slate-800/60',
    pillBorder: 'border-slate-300 dark:border-slate-700',
    dotColor: 'bg-slate-400 dark:bg-slate-500',
    textColor: 'text-slate-700 dark:text-slate-200',
    label: 'Libur'
  }
};

export function getDoctorStatusStyle(status: string): StatusStyleConfig {
  const key = (status || '').toLowerCase().trim();
  if (DOCTOR_STATUS_STYLES[key]) {
    return DOCTOR_STATUS_STYLES[key];
  }
  return {
    pillBg: 'bg-slate-50 dark:bg-slate-800/50',
    pillBorder: 'border-slate-200 dark:border-slate-700',
    dotColor: 'bg-slate-400',
    textColor: 'text-slate-700 dark:text-slate-300',
    label: status || 'Aktif'
  };
}

// ============================================================================
// 2. ATOMIC COMPONENTS (Atoms & Molecules)
// ============================================================================

/**
 * Atom: Status Badge Pill with indicator dot
 */
export interface DoctorStatusBadgeProps {
  status: string;
  className?: string;
  dotClassName?: string;
  customLabel?: string;
}

export function DoctorStatusBadge({
  status,
  className,
  dotClassName,
  customLabel
}: DoctorStatusBadgeProps) {
  const config = getDoctorStatusStyle(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-semibold border backdrop-blur-xs select-none transition-colors shadow-none',
        config.pillBg,
        config.pillBorder,
        config.textColor,
        className
      )}
    >
      <span className={cn('size-1.5 rounded-full shrink-0', config.dotColor, dotClassName)} />
      <span>{customLabel || config.label}</span>
    </span>
  );
}

/**
 * Atom: Specialty Badge
 */
export interface DoctorSpecialtyBadgeProps {
  specialty: string;
  className?: string;
}

export function DoctorSpecialtyBadge({ specialty, className }: DoctorSpecialtyBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-lg text-[11.5px] font-semibold bg-[#F3E8FF] text-[#7E22CE] dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40 w-fit select-none',
        className
      )}
    >
      {specialty}
    </span>
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
    <button
      type='button'
      onClick={onClick}
      title={phoneNumber ? `Hubungi: ${phoneNumber}` : 'Hubungi dokter'}
      aria-label='Hubungi dokter'
      className={cn(
        'size-9 rounded-full bg-white dark:bg-card border border-slate-200/80 dark:border-border flex items-center justify-center text-slate-700 dark:text-foreground shadow-2xs hover:bg-slate-50 dark:hover:bg-accent transition-all cursor-pointer z-20 shrink-0',
        className
      )}
    >
      <Icons.phone className='size-4 text-slate-700 dark:text-slate-200' />
    </button>
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
        'flex items-center gap-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300',
        className
      )}
    >
      <span className='shrink-0 text-slate-500 dark:text-slate-400'>{icon}</span>
      <span className='truncate'>{text}</span>
    </div>
  );
}

/**
 * Molecule: Schedule Time & Slot Availability Block
 */
export interface DoctorScheduleStatsProps {
  scheduleTime: string;
  availableSlots: number;
  totalCapacity: number;
  className?: string;
}

export function DoctorScheduleStats({
  scheduleTime,
  availableSlots,
  totalCapacity,
  className
}: DoctorScheduleStatsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4 pt-3.5 mt-3.5 border-t border-slate-100 dark:border-border/50 relative z-20',
        className
      )}
    >
      {/* Schedule Time Column */}
      <div className='flex flex-col'>
        <div className='flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500 dark:text-slate-400'>
          <Icons.clock className='size-3.5 shrink-0 text-slate-400 dark:text-slate-500' />
          <span>Jadwal Hari Ini</span>
        </div>
        <span className='text-[15.5px] font-bold text-[#0B0F3B] dark:text-white font-mono mt-1 tracking-tight'>
          {scheduleTime}
        </span>
      </div>

      {/* Available Slots Column */}
      <div className='flex flex-col'>
        <div className='flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500 dark:text-slate-400'>
          <Icons.teams className='size-3.5 shrink-0 text-slate-400 dark:text-slate-500' />
          <span>Slot Tersedia</span>
        </div>
        <div className='flex items-center gap-1.5 text-[15.5px] font-bold text-[#0B0F3B] dark:text-white font-mono mt-1 tracking-tight'>
          <Icons.user className='size-3.5 text-[#0B0F3B] dark:text-white shrink-0' />
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
      <div className='size-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-900/40 flex items-center justify-center shrink-0 shadow-2xs'>
        <Icons.calendar className='size-5 text-red-500 dark:text-red-400' />
      </div>
      <div className='flex flex-col'>
        <span className='text-[14px] font-bold text-[#0B0F3B] dark:text-white leading-tight'>
          {title}
        </span>
        <span className='text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-0.5'>
          {subtitle}
        </span>
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
    <div className={cn('flex items-center gap-2.5 pt-4 mt-auto relative z-20', className)}>
      <button
        type='button'
        onClick={onReschedule}
        className='flex-1 h-10 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border text-[#1E293B] dark:text-foreground font-semibold text-[13px] hover:bg-slate-50 dark:hover:bg-accent transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer select-none'
      >
        <Icons.calendar className='size-3.5 text-slate-600 dark:text-slate-300 shrink-0' />
        <span>{rescheduleLabel}</span>
      </button>

      <button
        type='button'
        onClick={onDetail}
        className='flex-1 h-10 rounded-xl bg-[#0B0F3B] dark:bg-primary text-white font-semibold text-[13px] hover:bg-[#151A66] dark:hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer select-none'
      >
        <span>{detailLabel}</span>
        <Icons.arrowRight className='size-3.5 text-white shrink-0' />
      </button>
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
  const isCuti = doctor.is_cuti || doctor.status_dokter === 'Cuti';
  const statusLabel = doctor.status_dokter || (isCuti ? 'Cuti' : 'Aktif');

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
      className={cn(
        'group relative overflow-hidden rounded-[24px] border border-[#E2E8F0] dark:border-border/60 font-sans flex flex-col justify-between select-none transition-all duration-200 hover:shadow-md hover:border-primary/30',
        'bg-[radial-gradient(ellipse_75%_55%_at_100%_0%,#E9E3FF_0%,#F5F2FF_40%,#FFFFFF_80%)] dark:bg-[radial-gradient(ellipse_75%_55%_at_100%_0%,rgba(88,28,135,0.25)_0%,rgba(46,16,101,0.1)_40%,var(--card)_80%)] bg-white dark:bg-card p-5 sm:p-6 min-h-[340px]',
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
          className='text-[18px] sm:text-[19px] font-bold text-[#0B0F3B] dark:text-white tracking-tight leading-snug cursor-pointer hover:text-primary transition-colors pr-24 sm:pr-28 mt-2 mb-2.5 line-clamp-1'
        >
          {doctor.nama_dokter}
        </h3>

        {/* Location Row */}
        <DoctorInfoRow
          icon={<Icons.stethoscope className='size-4 text-slate-500 dark:text-slate-400' />}
          text={doctor.ruang_praktik}
        />

        {/* Date Row (rendered when not cuti or date is provided) */}
        {!isCuti && doctor.tanggal_praktik && (
          <DoctorInfoRow
            icon={<Icons.calendar className='size-4 text-slate-500 dark:text-slate-400' />}
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
          />
        ))}

      {/* 5. Action Footer Buttons (Reschedule & Detail) */}
      {showActions && !isCuti && (
        <DoctorCardActions onReschedule={handleReschedule} onDetail={handleDetail} />
      )}
    </div>
  );
}

export default DoctorScheduleCard;
