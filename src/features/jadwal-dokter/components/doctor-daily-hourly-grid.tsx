'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DoctorAddSessionModal } from './doctor-add-session-modal';
import { isDoctorOnLeaveOnDay } from '@/constants/mock-api-doctor-schedules';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';

// ============================================================================
// 1. DATA CONTRACTS & STATUS CONFIG
// ============================================================================

export type HourlySlotStatus = 'buka' | 'penuh' | 'tutup' | 'cuti';

export interface DoctorDailyHourlyGridProps {
  doctor?: DoctorSchedule;
  selectedDay?: number;
  onSelectDay?: (day: number) => void;
  currentMonth?: number;
  onMonthChange?: (month: number) => void;
  currentYear?: number;
  onYearChange?: (year: number) => void;
  onSelectHourStatus?: (hour: number, status: HourlySlotStatus) => void;
  onAddSchedule?: () => void;
  modalContainerRef?: React.RefObject<HTMLElement | null>;
  readOnly?: boolean;
  className?: string;
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

const DAY_NAMES_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const STATUS_CONFIG: Record<
  HourlySlotStatus,
  {
    label: string;
    cellBg: string;
    border: string;
    text: string;
    dotBg: string;
  }
> = {
  buka: {
    label: 'Buka',
    cellBg: 'bg-success-subtle hover:bg-success-subtle/80',
    border: 'border-success-border',
    text: 'text-success',
    dotBg: 'bg-success'
  },
  penuh: {
    label: 'Penuh',
    cellBg: 'bg-warning-subtle hover:bg-warning-subtle/80',
    border: 'border-warning-border',
    text: 'text-warning',
    dotBg: 'bg-warning'
  },
  tutup: {
    label: 'Tutup',
    cellBg: 'bg-muted/30 hover:bg-muted/50',
    border: 'border-border/60',
    text: 'text-muted-foreground',
    dotBg: 'bg-muted-foreground/40'
  },
  cuti: {
    label: 'Cuti',
    cellBg: 'bg-info-subtle hover:bg-info-subtle/80',
    border: 'border-info-border',
    text: 'text-info',
    dotBg: 'bg-info'
  }
};

// 4 Shift Periode 24 Jam (Y-Axis)
const SHIFTS = [
  {
    id: 'pagi',
    name: 'Pagi',
    range: '06:00 - 12:00',
    hours: [6, 7, 8, 9, 10, 11]
  },
  {
    id: 'siang',
    name: 'Siang / Sore',
    range: '12:00 - 18:00',
    hours: [12, 13, 14, 15, 16, 17]
  },
  {
    id: 'malam',
    name: 'Malam',
    range: '18:00 - 24:00',
    hours: [18, 19, 20, 21, 22, 23]
  },
  {
    id: 'dini-hari',
    name: 'Dini Hari',
    range: '00:00 - 06:00',
    hours: [0, 1, 2, 3, 4, 5]
  }
];

// Helper: Tentukan status jam awal berdasarkan sesi dokter & hari aktif
function getInitialHourStatus(
  hour: number,
  doctor?: DoctorSchedule,
  dayNumber?: number,
  extraSessions: DoctorDailySession[] = []
): HourlySlotStatus {
  const leaveInfo = isDoctorOnLeaveOnDay(doctor, dayNumber);
  if (leaveInfo.isLeave) return 'cuti';

  // Check if monthly_schedule specifies status for this day
  const monthlyItem = doctor?.monthly_schedule?.find((d) => d.day === dayNumber);
  if (monthlyItem?.status === 'Penuh') {
    return 'penuh';
  }

  const allSessions = [...(doctor?.sesi_harian || []), ...extraSessions];

  // Cek apakah jam ini masuk ke salah satu sesi harian dokter
  const matchingSession = allSessions.find((s) => {
    const startHour = parseInt(s.jam_mulai.split(':')[0], 10);
    const endHour = parseInt(s.jam_selesai.split(':')[0], 10);
    return hour >= startHour && hour <= endHour;
  });

  if (matchingSession) {
    if (matchingSession.status_sesi === 'Penuh' || matchingSession.slot_tersedia <= 0)
      return 'penuh';
    if (matchingSession.status_sesi === 'Cuti') return 'tutup';
    return 'buka';
  }

  // Jika dokter memiliki sesi spesifik yang terdaftar, jam di luar sesi adalah Tutup
  if (allSessions.length > 0) {
    return 'tutup';
  }

  // Jam default aktif biasa jika dokter belum memiliki konfigurasi sesi eksplisit
  if ((hour >= 8 && hour <= 11) || (hour >= 14 && hour <= 17) || (hour >= 19 && hour <= 21)) {
    return 'buka';
  }

  return 'tutup';
}

// ============================================================================
// 2. MASTER COMPONENT: 24-HOUR DAILY HOURLY GRID
// ============================================================================

export function DoctorDailyHourlyGrid({
  doctor,
  selectedDay: selectedDayProp,
  onSelectDay,
  currentMonth: currentMonthProp,
  onMonthChange,
  currentYear: currentYearProp,
  onYearChange,
  onSelectHourStatus,
  onAddSchedule,
  modalContainerRef,
  readOnly = false,
  className
}: DoctorDailyHourlyGridProps) {
  const today = new Date();
  const realCurrentYear = today.getFullYear();
  const realCurrentMonth = today.getMonth();
  const realCurrentDay = today.getDate();

  const [internalDay, setInternalDay] = useState<number>(realCurrentDay);
  const [internalMonth, setInternalMonth] = useState<number>(realCurrentMonth);
  const [internalYear, setInternalYear] = useState<number>(realCurrentYear);

  const activeDay = selectedDayProp !== undefined ? selectedDayProp : internalDay;
  const activeMonth = currentMonthProp !== undefined ? currentMonthProp : internalMonth;
  const activeYear = currentYearProp !== undefined ? currentYearProp : internalYear;

  const setActiveDay = (d: number) => {
    setInternalDay(d);
    onSelectDay?.(d);
  };
  const setActiveMonth = (m: number | ((prev: number) => number)) => {
    const nextVal = typeof m === 'function' ? m(activeMonth) : m;
    setInternalMonth(nextVal);
    onMonthChange?.(nextVal);
  };
  const setActiveYear = (y: number | ((prev: number) => number)) => {
    const nextVal = typeof y === 'function' ? y(activeYear) : y;
    setInternalYear(nextVal);
    onYearChange?.(nextVal);
  };

  const totalDaysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
  const dateObj = new Date(activeYear, activeMonth, activeDay);
  const dayName = DAY_NAMES_FULL[dateObj.getDay()] || 'Hari';
  const formattedSelectedDate = `${dayName}, ${activeDay} ${MONTH_NAMES[activeMonth]} ${activeYear}`;

  const isCurrentDayToday =
    activeDay === realCurrentDay &&
    activeMonth === realCurrentMonth &&
    activeYear === realCurrentYear;

  const [selectedHour, setSelectedHour] = useState<number | null>(new Date().getHours());
  const [hourlyOverrides, setHourlyOverrides] = useState<Record<string, HourlySlotStatus>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [extraSessions, setExtraSessions] = useState<DoctorDailySession[]>([]);
  const [isReasonOpen, setIsReasonOpen] = useState(false);

  // Dynamic leave check for activeDay
  const leaveInfo = isDoctorOnLeaveOnDay(doctor, activeDay);
  const isDayCuti = leaveInfo.isLeave;
  const dayLeaveReason = leaveInfo.reason || doctor?.cuti_reason || 'Cuti Operasional';

  const initials = doctor?.nama_dokter
    ? doctor.nama_dokter
        .replace(/^(dr\.\s*|drg\.\s*|prof\.\s*)/g, '')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'DR';

  const handleHourStatusChange = (hour: number, status: HourlySlotStatus) => {
    if (isDayCuti) return;
    const overrideKey = `${activeYear}-${activeMonth}-${activeDay}-${hour}`;
    setHourlyOverrides((prev) => ({ ...prev, [overrideKey]: status }));
    onSelectHourStatus?.(hour, status);
  };

  const handleSessionAdded = (newSession: DoctorDailySession) => {
    setExtraSessions((prev) => [...prev, newSession]);
    const startHour = parseInt(newSession.jam_mulai.split(':')[0], 10);
    const endHour = parseInt(newSession.jam_selesai.split(':')[0], 10);
    const newOverrides: Record<string, HourlySlotStatus> = {};
    for (let h = startHour; h <= endHour; h++) {
      const overrideKey = `${activeYear}-${activeMonth}-${activeDay}-${h}`;
      newOverrides[overrideKey] =
        newSession.status_sesi === 'Buka'
          ? 'buka'
          : newSession.status_sesi === 'Penuh'
            ? 'penuh'
            : 'tutup';
    }
    setHourlyOverrides((prev) => ({ ...prev, ...newOverrides }));
  };

  const openAddSessionModal = () => {
    if (isDayCuti) return;
    onAddSchedule?.();
    setIsAddModalOpen(true);
  };

  const resolveHourStatus = (hour: number): HourlySlotStatus => {
    if (isDayCuti) return 'cuti';
    const overrideKey = `${activeYear}-${activeMonth}-${activeDay}-${hour}`;
    if (hourlyOverrides[overrideKey]) return hourlyOverrides[overrideKey];
    return getInitialHourStatus(hour, doctor, activeDay, extraSessions);
  };

  const currentHour = new Date().getHours();

  const extraCapacity = extraSessions.reduce((acc, s) => acc + s.kuota_pasien, 0);
  const extraSlots = extraSessions.reduce((acc, s) => acc + s.slot_tersedia, 0);
  const totalCapacity = (doctor?.kapasitas_per_hari || 0) + extraCapacity;
  const totalSlots = isDayCuti ? 0 : (doctor?.slot_tersedia || 0) + extraSlots;

  const handlePrevDay = () => {
    if (activeDay > 1) {
      setActiveDay(activeDay - 1);
    } else if (activeMonth > 0) {
      const prevMonthDays = new Date(activeYear, activeMonth, 0).getDate();
      setActiveMonth(activeMonth - 1);
      setActiveDay(prevMonthDays);
    }
  };

  const handleNextDay = () => {
    if (activeDay < totalDaysInMonth) {
      setActiveDay(activeDay + 1);
    } else if (activeMonth < 11) {
      setActiveMonth(activeMonth + 1);
      setActiveDay(1);
    }
  };

  const handleToday = () => {
    setActiveDay(realCurrentDay);
    setActiveMonth(realCurrentMonth);
    setActiveYear(realCurrentYear);
  };

  return (
    <>
      <div
        className={cn(
          'w-full bg-card text-card-foreground border border-border/50 rounded-2xl shadow-xs font-sans overflow-hidden flex flex-col select-none',
          className
        )}
      >
        {/* 1. Header Grid: Judul Tanggal & Day Navigation Toolbox */}
        <div className='p-3.5 sm:p-4 border-b border-border/40 flex items-center justify-between gap-3 bg-muted/10'>
          {/* Left: Clear Typographic Hierarchy (Date + Slot / Status) */}
          <div className='min-w-0'>
            <h2 className='text-sm sm:text-base font-bold text-foreground tracking-tight truncate'>
              {formattedSelectedDate}
            </h2>
            <div className='text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 font-normal'>
              {isDayCuti ? (
                <span className='text-sky-600 dark:text-sky-400 font-semibold'>
                  Praktik Ditutup (Cuti)
                </span>
              ) : (
                <span className='font-mono'>
                  <strong className='text-primary font-semibold'>{totalSlots}</strong> /{' '}
                  {totalCapacity} slot tersedia
                </span>
              )}
            </div>
          </div>

          {/* Right: Grouped Navigation & Action Controls */}
          <div className='flex items-center gap-2 shrink-0 flex-wrap justify-end'>
            <button
              type='button'
              onClick={handleToday}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg border border-border/60 bg-background hover:bg-muted text-foreground/85 hover:text-foreground transition-colors shadow-2xs cursor-pointer',
                isCurrentDayToday && 'border-primary/50 bg-primary/10 text-primary font-bold'
              )}
            >
              Hari Ini
            </button>

            <div className='flex items-center border border-border/50 rounded-lg bg-background p-0.5 shadow-2xs'>
              <button
                type='button'
                onClick={handlePrevDay}
                disabled={activeDay <= 1 && activeMonth <= 0}
                className='size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer'
                aria-label='Hari Sebelumnya'
                title='Hari Sebelumnya'
              >
                <Icons.chevronLeft className='size-4' />
              </button>
              <button
                type='button'
                onClick={handleNextDay}
                disabled={activeDay >= totalDaysInMonth && activeMonth >= 11}
                className='size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer'
                aria-label='Hari Berikutnya'
                title='Hari Berikutnya'
              >
                <Icons.chevronRight className='size-4' />
              </button>
            </div>

            {!readOnly && !isDayCuti && (
              <button
                type='button'
                onClick={openAddSessionModal}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-dashed border-border/80 hover:border-primary/70 bg-background hover:bg-primary/5 text-foreground/80 hover:text-primary transition-all shadow-2xs cursor-pointer select-none shrink-0'
              >
                <Icons.add className='size-3.5' />
                <span>Tambah jadwal</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. ACCORDION / COLLAPSIBLE SEGMENTED: "Lihat kenapa dokter ini cuti [chevron]" */}
        {isDayCuti && (
          <Collapsible
            open={isReasonOpen}
            onOpenChange={setIsReasonOpen}
            className='border-b border-border/40 bg-card transition-all'
          >
            <CollapsibleTrigger asChild>
              <button
                type='button'
                className='w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer select-none'
              >
                <span>Lihat kenapa dokter ini cuti</span>
                <Icons.chevronDown
                  className={cn(
                    'size-3.5 text-muted-foreground transition-transform duration-200 shrink-0',
                    isReasonOpen && 'rotate-180'
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className='px-3.5 sm:px-4 pb-3.5 pt-2.5 border-t border-border/30 bg-muted/5'>
              <div className='relative rounded-xl p-3 sm:p-3.5 border border-border/60 bg-card text-card-foreground shadow-none'>
                {/* Top Right Status Tag */}
                <div className='absolute top-3 right-3 flex items-center gap-1.5 z-10'>
                  <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border border-sky-300/80 dark:border-sky-600/50 bg-sky-500/10 text-sky-700 dark:text-sky-300 select-none'>
                    <span className='size-1.5 rounded-full bg-sky-500 shrink-0' />
                    <span>Cuti</span>
                  </span>
                </div>

                {/* Layout Composition (Avatar + Content Body) */}
                <div className='flex items-start gap-3'>
                  {/* Column 1: Avatar with Corner Icon */}
                  <div className='relative size-9 sm:size-10 shrink-0'>
                    <Avatar className='size-full rounded-full ring-1 ring-border/60 bg-muted overflow-hidden'>
                      {doctor?.avatar && (
                        <AvatarImage
                          src={doctor.avatar}
                          alt={doctor.nama_dokter}
                          className='size-full object-cover object-top'
                        />
                      )}
                      <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {/* Corner Badge Icon */}
                    <div className='absolute -bottom-1 -right-1 size-4.5 rounded-full bg-sky-500 text-white flex items-center justify-center ring-2 ring-card shadow-2xs z-10'>
                      <Icons.calendar className='size-2.5 stroke-[2.5]' />
                    </div>
                  </div>

                  {/* Column 2: Notification-style Content */}
                  <div className='flex-1 min-w-0 pr-16 sm:pr-20'>
                    <div>
                      <h4 className='text-xs sm:text-[13px] font-bold text-foreground truncate leading-snug'>
                        {doctor?.nama_dokter}
                      </h4>
                      <p className='text-[11px] text-muted-foreground mt-0.5 font-normal truncate'>
                        {doctor?.spesialisasi} • {doctor?.ruang_praktik}
                      </p>
                    </div>

                    {/* Leave Message Text */}
                    <div className='mt-2 text-xs text-foreground/90 leading-relaxed font-normal'>
                      Dokter sedang dalam masa{' '}
                      <strong className='font-semibold text-foreground'>{dayLeaveReason}</strong>.
                      Seluruh aktivitas praktik dan konsultasi ditutup sementara pada periode
                      terkait.
                    </div>

                    {/* Context Date Pill */}
                    {doctor?.cuti_start && doctor?.cuti_end && (
                      <div className='mt-2.5'>
                        <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/60 bg-muted/30 text-foreground text-[11px] font-medium'>
                          <Icons.calendar className='size-3.5 shrink-0 text-sky-600 dark:text-sky-400' />
                          <span>
                            {doctor.cuti_start} – {doctor.cuti_end}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* 3. Body Grid: X-Axis (Jam per Shift) & Y-Axis (4 Shift Periode) */}
        <div className='p-3.5 sm:p-4 space-y-4 overflow-x-auto'>
          {SHIFTS.map((shift) => (
            <div key={shift.id} className='space-y-1.5'>
              {/* Y-Axis Shift Header */}
              <div className='flex items-center justify-between text-xs font-bold text-muted-foreground pb-1 border-b border-border/30'>
                <span className='text-foreground font-bold'>{shift.name}</span>
                <span className='font-mono font-medium text-[11px] text-muted-foreground/80'>
                  {shift.range}
                </span>
              </div>

              {/* X-Axis: 6 Kolom Jam per Shift */}
              <div className='grid grid-cols-6 gap-1.5'>
                {shift.hours.map((h) => {
                  const hourStr = `${String(h).padStart(2, '0')}:00`;
                  const status = resolveHourStatus(h);
                  const cfg = STATUS_CONFIG[status];
                  const isNow = h === currentHour;
                  const isSelected = selectedHour === h;

                  const cellContent = (
                    <div
                      className={cn(
                        'w-full min-h-[52px] sm:min-h-[56px] rounded-xl border p-2 flex flex-col justify-between transition-all text-left relative',
                        cfg.cellBg,
                        cfg.border,
                        isDayCuti ? 'cursor-default opacity-90' : 'cursor-pointer',
                        isSelected && 'ring-2 ring-primary/40 shadow-xs',
                        isNow && 'ring-1 ring-primary font-bold'
                      )}
                    >
                      {/* Baris Atas: Jam & Indikator Titik */}
                      <div className='flex items-center justify-between'>
                        <span
                          className={cn(
                            'text-xs sm:text-[13px] font-mono font-bold leading-none',
                            isNow ? 'text-primary font-black' : 'text-foreground'
                          )}
                        >
                          {hourStr}
                        </span>
                        <span className={cn('size-2 rounded-full shrink-0', cfg.dotBg)} />
                      </div>

                      {/* Baris Bawah: Status Text Berwarna */}
                      <div className='mt-1 flex items-center justify-between'>
                        <span
                          className={cn(
                            'text-[10.5px] sm:text-[11px] font-bold leading-none select-none tracking-tight block',
                            cfg.text
                          )}
                        >
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );

                  if (readOnly || isDayCuti) {
                    return (
                      <button
                        key={h}
                        type='button'
                        onClick={() => setSelectedHour(h)}
                        className='w-full text-left outline-none'
                      >
                        {cellContent}
                      </button>
                    );
                  }

                  return (
                    <DropdownMenu key={h}>
                      <DropdownMenuTrigger asChild onClick={() => setSelectedHour(h)}>
                        <button type='button' className='w-full text-left outline-none'>
                          {cellContent}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='center' className='w-40'>
                        <div className='px-2 py-1 text-[10px] font-semibold text-muted-foreground'>
                          Status Jam {hourStr}:
                        </div>
                        {(['buka', 'penuh', 'tutup'] as HourlySlotStatus[]).map((st) => {
                          const itemCfg = STATUS_CONFIG[st];
                          return (
                            <DropdownMenuItem
                              key={st}
                              onClick={() => handleHourStatusChange(h, st)}
                              className='text-xs font-bold flex items-center justify-between cursor-pointer'
                            >
                              <div className='flex items-center gap-2'>
                                <span className={cn('size-2 rounded-full', itemCfg.dotBg)} />
                                <span className={itemCfg.text}>{itemCfg.label}</span>
                              </div>
                              {status === st && <span className='text-primary'>✓</span>}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                })}
              </div>
            </div>
          ))}

          {/* 3. Placeholder Tambah Jadwal di Akhir Grid */}
          {!readOnly && !isDayCuti && (
            <div className='pt-1'>
              <button
                type='button'
                onClick={openAddSessionModal}
                className='w-full py-2.5 px-3 rounded-xl border border-dashed border-border/70 hover:border-primary/60 bg-muted/5 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer shadow-2xs group select-none'
              >
                <Icons.add className='size-3.5 group-hover:scale-110 transition-transform' />
                <span>Tambah jadwal</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. Footer Legend */}
        <div className='px-4 py-3 border-t border-border/30 bg-muted/5 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-bold'>
          <div className='flex items-center gap-2'>
            <span className='size-2.5 rounded-full bg-emerald-500' />
            <span className='text-emerald-700 dark:text-emerald-400'>Buka</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='size-2.5 rounded-full bg-amber-500' />
            <span className='text-amber-700 dark:text-amber-400'>Penuh</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='size-2.5 rounded-full bg-muted-foreground/60' />
            <span className='text-muted-foreground'>Tutup</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='size-2.5 rounded-full bg-sky-500' />
            <span className='text-sky-700 dark:text-sky-400'>Cuti (1 Hari)</span>
          </div>
        </div>
      </div>

      {/* Modal Tambah Sesi Jadwal Praktik */}
      {doctor && (
        <DoctorAddSessionModal
          doctor={doctor}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSessionAdded={handleSessionAdded}
          portalContainerRef={modalContainerRef}
        />
      )}
    </>
  );
}
