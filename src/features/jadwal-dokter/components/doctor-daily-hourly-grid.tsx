'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DoctorAddSessionModal } from './doctor-add-session-modal';
import { DoctorEditSessionModal } from './doctor-edit-session-modal';
import { DoctorRescheduleSessionModal } from './doctor-reschedule-session-modal';
import { DoctorSessionDetailModal } from './doctor-session-detail-modal';
import { isDoctorOnLeaveOnDay } from '../api/service';
import { resolveDayStatus, type SimpleScheduleStatus } from './doctor-timeline-calendar';
import { cn } from '@/lib/utils';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import type { OccupancyShift, OccupancySlot } from '@/server/contracts/schedules/doctor-schedules.dto';

// ============================================================================
// 1. DATA CONTRACTS & STATUS CONFIG
// ============================================================================

export type HourlySlotStatus = 'buka' | 'terisi' | 'tutup' | 'cuti';

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
  string,
  {
    label: string;
    cellBg: string;
    border: string;
    text: string;
    dotBg: string;
  }
> = {
  AVAILABLE: {
    label: 'Buka',
    cellBg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dotBg: 'bg-emerald-500'
  },
  OCCUPIED_BY_SELF: {
    label: 'Terisi',
    cellBg: 'bg-sky-500/10 hover:bg-sky-500/20',
    border: 'border-sky-500/30',
    text: 'text-sky-700 dark:text-sky-400',
    dotBg: 'bg-sky-500'
  },
  OCCUPIED_BY_OTHER: {
    label: 'Terisi Lain',
    cellBg: 'bg-sky-500/10 hover:bg-sky-500/20',
    border: 'border-sky-500/30',
    text: 'text-sky-700 dark:text-sky-400',
    dotBg: 'bg-sky-500'
  },
  CLOSED_LEAVE: {
    label: 'Cuti',
    cellBg: 'bg-sky-500/10 hover:bg-sky-500/20',
    border: 'border-sky-500/30',
    text: 'text-sky-700 dark:text-sky-400',
    dotBg: 'bg-sky-500'
  },
  CLOSED: {
    label: 'Tutup',
    cellBg: 'bg-muted/20 hover:bg-muted/40',
    border: 'border-border/50',
    text: 'text-muted-foreground',
    dotBg: 'bg-muted-foreground/30'
  }
};

// Helper to construct standard slots for client rendering aligned with SSOT day & session status
function buildLocalFallbackShifts(
  sessions: DoctorDailySession[] = [],
  dayStatus: SimpleScheduleStatus = 'buka'
): OccupancyShift[] {
  const configs = [
    { contextId: 'early_morning', contextLabel: 'Dini Hari', startH: 0, endH: 6, timeRange: '00:00 - 06:00 WIB' },
    { contextId: 'morning', contextLabel: 'Pagi', startH: 6, endH: 12, timeRange: '06:00 - 12:00 WIB' },
    { contextId: 'afternoon', contextLabel: 'Siang / Sore', startH: 12, endH: 18, timeRange: '12:00 - 18:00 WIB' },
    { contextId: 'night', contextLabel: 'Malam', startH: 18, endH: 24, timeRange: '18:00 - 24:00 WIB' }
  ];

  const isDayClosed = dayStatus === 'tutup';
  const isDayCuti = dayStatus === 'cuti';

  return configs.map((cfg) => {
    const slots: OccupancySlot[] = [];
    const totalMinutes = (cfg.endH - cfg.startH) * 60;
    const duration = 30;
    const totalSlots = Math.floor(totalMinutes / duration);
    let availableCount = 0;
    let occupiedCount = 0;

    let idx = 1;
    for (let m = 0; m < totalMinutes; m += duration) {
      const sMin = cfg.startH * 60 + m;
      const eMin = sMin + duration;
      const sH = Math.floor(sMin / 60);
      const sM = sMin % 60;
      const eH = Math.floor(eMin / 60);
      const eM = eMin % 60;

      const startTime = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;
      const endTime = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;

      // Check if slot falls in any active session
      const matching = sessions.find(
        (s) => startTime >= s.jam_mulai && startTime < s.jam_selesai
      );

      if (isDayCuti) {
        slots.push({
          slotIndex: idx++,
          startTime,
          endTime,
          timeRange: `${startTime} - ${endTime} WIB`,
          isAvailable: false,
          status: 'CLOSED_LEAVE',
          displayLabel: 'Cuti',
          conflictInfo: matching ? { type: 'SELF', sessionId: matching.id } : null
        });
      } else if (isDayClosed) {
        slots.push({
          slotIndex: idx++,
          startTime,
          endTime,
          timeRange: `${startTime} - ${endTime} WIB`,
          isAvailable: false,
          status: 'CLOSED',
          displayLabel: 'Tutup',
          conflictInfo: matching ? { type: 'SELF', sessionId: matching.id } : null
        });
        if (matching) {
          occupiedCount++;
        }
      } else if (matching) {
        const rawStatus = (matching.status_sesi || '').toUpperCase();
        let slotStatus: OccupancySlot['status'] = 'OCCUPIED_BY_SELF';
        let displayLabel = `Jadwal Dokter (${matching.nama_sesi})`;

        if (rawStatus === 'TUTUP' || rawStatus === 'CLOSED') {
          slotStatus = 'CLOSED';
          displayLabel = 'Tutup';
          occupiedCount++;
        } else if (rawStatus === 'CUTI' || rawStatus === 'LEAVE') {
          slotStatus = 'CLOSED_LEAVE';
          displayLabel = 'Cuti';
          occupiedCount++;
        } else if (rawStatus === 'BUKA' || rawStatus === 'OPEN') {
          if (matching.slot_tersedia > 0) {
            slotStatus = 'AVAILABLE';
            displayLabel = 'Buka';
            availableCount += matching.slot_tersedia;
          } else {
            slotStatus = 'OCCUPIED_BY_SELF';
            displayLabel = 'Terisi';
            occupiedCount++;
          }
        } else {
          slotStatus = 'OCCUPIED_BY_SELF';
          displayLabel = 'Terisi';
          occupiedCount++;
        }

        slots.push({
          slotIndex: idx++,
          startTime,
          endTime,
          timeRange: `${startTime} - ${endTime} WIB`,
          isAvailable: slotStatus === 'AVAILABLE',
          status: slotStatus,
          displayLabel,
          conflictInfo: { type: 'SELF', sessionId: matching.id }
        });
      } else {
        // Slot di luar jadwal praktik dokter (Tutup / Di Luar Jam)
        slots.push({
          slotIndex: idx++,
          startTime,
          endTime,
          timeRange: `${startTime} - ${endTime} WIB`,
          isAvailable: false,
          status: 'CLOSED',
          displayLabel: 'Tutup',
          conflictInfo: null
        });
      }
    }

    const shiftSessions = sessions.filter(
      (s) =>
        s.jam_mulai >= `${String(cfg.startH).padStart(2, '0')}:00` &&
        s.jam_mulai < `${String(cfg.endH).padStart(2, '0')}:00`
    );
    const shiftTotalCapacity = shiftSessions.reduce((acc, s) => acc + (s.kuota_pasien || 1), 0);
    const shiftAvailableSlots =
      isDayClosed || isDayCuti
        ? 0
        : shiftSessions.reduce(
            (acc, s) => acc + (s.status_sesi === 'Buka' ? s.slot_tersedia : 0),
            0
          );

    return {
      contextId: cfg.contextId,
      contextLabel: cfg.contextLabel,
      sessionShift: cfg.contextId,
      timeRange: cfg.timeRange,
      boundaryStartTime: `${String(cfg.startH).padStart(2, '0')}:00`,
      boundaryEndTime: `${String(cfg.endH).padStart(2, '0')}:00`,
      totalSlots,
      availableSlotsCount: shiftAvailableSlots,
      occupiedSlotsCount: shiftTotalCapacity - shiftAvailableSlots,
      slots
    };
  });
}

// ============================================================================
// 2. MASTER COMPONENT: 24-HOUR DAILY HOURLY GRID (SSOT OCCUPANCY PARADIGM)
// ============================================================================

export function DoctorDailyHourlyGrid({
  doctor,
  selectedDay: selectedDayProp,
  onSelectDay,
  currentMonth: currentMonthProp,
  onMonthChange,
  currentYear: currentYearProp,
  onYearChange,
  onSelectHourStatus: _onSelectHourStatus,
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

  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const currentTimeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

  // Dynamic day status check for activeDay via SSOT
  const leaveInfo = isDoctorOnLeaveOnDay(doctor, activeDay);
  const dayStatus = resolveDayStatus(activeDay, doctor);
  const isDayCuti = dayStatus === 'cuti';
  const isDayClosed = dayStatus === 'tutup';
  const dayLeaveReason = leaveInfo.reason || doctor?.cuti_reason || 'Cuti Operasional';

  // Sessions directly from doctor schedule (Single Source of Truth from backend)
  const activeSessions: DoctorDailySession[] = useMemo(
    () => doctor?.sesi_harian || [],
    [doctor?.sesi_harian]
  );

  // Directly construct discrete shifts from doctor's activeSessions & SSOT dayStatus
  const displayedShifts: OccupancyShift[] = useMemo(() => {
    return buildLocalFallbackShifts(activeSessions, dayStatus);
  }, [activeSessions, dayStatus]);

  // Modals state
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<DoctorDailySession | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedSessionForReschedule, setSelectedSessionForReschedule] = useState<DoctorDailySession | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<DoctorDailySession | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addSessionInitialTime, setAddSessionInitialTime] = useState<string | undefined>(undefined);

  const [isReasonOpen, setIsReasonOpen] = useState(false);

  const handleOpenSessionDetail = (session: DoctorDailySession) => {
    setSelectedSessionDetail(session);
    setIsDetailModalOpen(true);
  };

  const handleOpenReschedule = (session: DoctorDailySession) => {
    setIsDetailModalOpen(false);
    setSelectedSessionForReschedule(session);
    setIsRescheduleOpen(true);
  };

  const handleOpenEditSession = (session: DoctorDailySession) => {
    setIsDetailModalOpen(false);
    setEditingSession(session);
    setIsEditModalOpen(true);
  };

  const openAddSessionModal = (initialTime?: string) => {
    if (isDayCuti) return;
    onAddSchedule?.();
    setAddSessionInitialTime(initialTime);
    setIsAddModalOpen(true);
  };

  const handleSlotClick = (slot: OccupancySlot) => {
    if (isDayCuti) return;

    // Find matching session from activeSessions if any exists on this slot
    const matchingSession = activeSessions.find(
      (s) =>
        (slot.startTime >= s.jam_mulai && slot.startTime < s.jam_selesai) ||
        slot.startTime === s.jam_mulai ||
        (slot.conflictInfo?.sessionId && s.id === slot.conflictInfo.sessionId)
    );

    if (matchingSession) {
      handleOpenSessionDetail(matchingSession);
    } else if (!isDayClosed && !readOnly) {
      openAddSessionModal(slot.startTime);
    }
  };

  const initials = doctor?.nama_dokter
    ? doctor.nama_dokter
        .replace(/^(dr\.\s*|drg\.\s*|prof\.\s*)/g, '')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'DR';

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
        {/* 1. Header Grid: Judul Tanggal & Day Navigation Controls */}
        <div className='p-3.5 sm:p-4 border-b border-border/40 flex items-center justify-between gap-3 bg-muted/10'>
          {/* Left: Clear Typographic Hierarchy (Date + Operational Context) */}
          <div className='min-w-0'>
            <h2 className='text-sm sm:text-base font-bold text-foreground tracking-tight truncate'>
              {formattedSelectedDate}
            </h2>
            <div className='text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 font-normal'>
              {isDayCuti ? (
                <span className='text-sky-600 dark:text-sky-400 font-semibold'>
                  Praktik Ditutup (Cuti)
                </span>
              ) : isDayClosed ? (
                <span className='text-destructive dark:text-destructive font-semibold'>
                  Praktik Ditutup pada tanggal ini
                </span>
              ) : activeSessions.length === 0 ? (
                <span className='text-muted-foreground font-medium'>
                  Belum ada jadwal praktik diatur pada tanggal ini
                </span>
              ) : (
                <span className='text-muted-foreground font-medium'>
                  {activeSessions.length} sesi shift aktif • Klik slot jadwal untuk kelola sesi
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

            {!readOnly && !isDayCuti && !isDayClosed && (
              <button
                type='button'
                onClick={() => openAddSessionModal()}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-dashed border-border/80 hover:border-primary/70 bg-background hover:bg-primary/5 text-foreground/80 hover:text-primary transition-all shadow-2xs cursor-pointer select-none shrink-0'
              >
                <Icons.add className='size-3.5' />
                <span>Tambah jadwal</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. ACCORDION / COLLAPSIBLE: "Lihat kenapa dokter ini cuti [chevron]" */}
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

                    <div className='mt-2 text-xs text-foreground/90 leading-relaxed font-normal'>
                      Dokter sedang dalam masa{' '}
                      <strong className='font-semibold text-foreground'>{dayLeaveReason}</strong>.
                      Seluruh aktivitas praktik dan konsultasi ditutup sementara pada periode
                      terkait.
                    </div>

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

        {/* 3. Empty Schedule Notice when no sessions are configured */}
        {activeSessions.length === 0 && !isDayCuti && !isDayClosed && (
          <div className='px-4 py-3 bg-muted/20 border-b border-border/40 flex items-center justify-between gap-3 text-xs text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <Icons.info className='size-4 shrink-0 text-muted-foreground' />
              <span>
                Dokter ini belum memiliki sesi praktik pada tanggal ini. Klik slot jam untuk menambahkan sesi.
              </span>
            </div>
            {!readOnly && (
              <button
                type='button'
                onClick={() => openAddSessionModal()}
                className='font-bold text-primary hover:underline cursor-pointer shrink-0'
              >
                + Tambah jadwal
              </button>
            )}
          </div>
        )}

        {/* 4. Body Grid: Discrete 30-min Consultation Slots per Shift (Backend SSOT) */}
        <div className='p-3.5 sm:p-4 space-y-4.5 overflow-x-auto'>
          {displayedShifts.map((shift) => {
            return (
              <div key={shift.contextId} className='space-y-2'>
                {/* Y-Axis Shift Header: Shift Name, Time Range & Slot Metrics SSOT */}
                <div className='flex items-center justify-between text-xs pb-1.5 border-b border-border/30'>
                  <div className='flex items-center gap-2'>
                    <span className='text-foreground font-bold text-xs sm:text-[13px]'>
                      {shift.contextLabel}
                    </span>
                    <span className='font-mono font-medium text-[11px] text-muted-foreground/70'>
                      {shift.timeRange}
                    </span>
                  </div>

                  {/* Indikator Kuota / Slot Khusus Sesi Shift Ini (Backend SSOT) */}
                  <div className='flex items-center gap-2'>
                    {isDayCuti ? (
                      <span className='text-[11px] font-semibold text-sky-600 dark:text-sky-400'>
                        Praktik Cuti
                      </span>
                    ) : isDayClosed ? (
                      <span className='text-[11px] font-semibold text-muted-foreground'>
                        Praktik Ditutup
                      </span>
                    ) : (
                      <span className='font-mono text-xs text-muted-foreground'>
                        {shift.availableSlotsCount} slot tersedia
                      </span>
                    )}
                  </div>
                </div>

                {/* X-Axis: Discrete Consultation Slots Grid (Serial 30-menit) */}
                <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5'>
                  {shift.slots.map((slot) => {
                    let effectiveStatus = slot.status;
                    if (isDayCuti) {
                      effectiveStatus = 'CLOSED_LEAVE';
                    }

                    const cfg = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.AVAILABLE;
                    const isNow =
                      currentTimeString >= slot.startTime && currentTimeString < slot.endTime;
                    const hasSession = Boolean(slot.conflictInfo?.sessionId);
                    const isClickable = !isDayCuti && (hasSession || (!isDayClosed && !readOnly));

                    return (
                      <button
                        key={`${shift.contextId}-${slot.slotIndex}-${slot.startTime}`}
                        type='button'
                        onClick={() => handleSlotClick(slot)}
                        disabled={!isClickable}
                        className={cn(
                          'w-full min-h-[52px] sm:min-h-[56px] rounded-xl border p-2 flex flex-col justify-between transition-all text-left relative outline-none',
                          cfg.cellBg,
                          cfg.border,
                          !isClickable
                            ? 'cursor-default opacity-80'
                            : 'cursor-pointer hover:shadow-xs hover:border-primary/50',
                          isNow && 'ring-1.5 ring-primary font-bold'
                        )}
                      >
                        {/* Baris Atas: Jam Mulai & Indikator Titik */}
                        <div className='flex items-center justify-between'>
                          <span
                            className={cn(
                              'text-xs sm:text-[12.5px] font-mono font-bold leading-none',
                              isNow ? 'text-primary font-black' : 'text-foreground'
                            )}
                          >
                            {slot.startTime}
                          </span>
                          <span className={cn('size-2 rounded-full shrink-0', cfg.dotBg)} />
                        </div>

                        {/* Baris Bawah: Status Label Kanonikal */}
                        <div className='mt-1 flex items-end justify-between gap-1'>
                          <span
                            className={cn(
                              'text-[10px] sm:text-[10.5px] font-bold leading-none select-none tracking-tight block truncate',
                              cfg.text
                            )}
                          >
                            {cfg.label}
                          </span>

                          <span className='text-[9px] font-mono text-muted-foreground/70 font-semibold shrink-0'>
                            {slot.endTime}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Tombol Tambah Jadwal di Bawah Grid */}
          {!readOnly && !isDayCuti && !isDayClosed && (
            <div className='pt-1'>
              <button
                type='button'
                onClick={() => openAddSessionModal()}
                className='w-full py-2.5 px-3 rounded-xl border border-dashed border-border/70 hover:border-primary/60 bg-muted/5 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer shadow-2xs group select-none'
              >
                <Icons.add className='size-3.5 group-hover:scale-110 transition-transform' />
                <span>Tambah jadwal praktik baru</span>
              </button>
            </div>
          )}
        </div>

        {/* 5. Footer Legend Ringkas & Standar Desain Sistem */}
        <div className='px-4 py-3 border-t border-border/30 bg-muted/5 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-bold'>
          <div className='flex items-center gap-2'>
            <span className='size-2.5 rounded-full bg-emerald-500' />
            <span className='text-emerald-700 dark:text-emerald-400'>Buka (Tersedia)</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='size-2.5 rounded-full bg-sky-500' />
            <span className='text-sky-700 dark:text-sky-400'>Terisi (Jadwal Dokter)</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='size-2.5 rounded-full bg-muted-foreground/40' />
            <span className='text-muted-foreground'>Tutup (Di luar jam / Cuti)</span>
          </div>
        </div>
      </div>

      {/* Modal Detail & Aksi Sesi (Menggantikan Redundansi List di Bawah Grid) */}
      {doctor && selectedSessionDetail && (
        <DoctorSessionDetailModal
          doctor={doctor}
          session={selectedSessionDetail}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedSessionDetail(null);
          }}
          onOpenReschedule={(sess) => handleOpenReschedule(sess)}
          onOpenEdit={(sess) => handleOpenEditSession(sess)}
          portalContainerRef={modalContainerRef}
        />
      )}

      {/* Modal Tambah Sesi Jadwal Praktik */}
      {doctor && (
        <DoctorAddSessionModal
          doctor={doctor}
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setAddSessionInitialTime(undefined);
          }}
          portalContainerRef={modalContainerRef}
          targetDate={`${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(activeDay).padStart(2, '0')}`}
          initialStartTime={addSessionInitialTime}
        />
      )}

      {/* Modal Edit Sesi Jadwal Praktik (In-Place Edit) */}
      {doctor && editingSession && (
        <DoctorEditSessionModal
          doctor={doctor}
          session={editingSession}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingSession(null);
          }}
          onOpenReschedule={(sess) => {
            setIsEditModalOpen(false);
            handleOpenReschedule(sess);
          }}
          portalContainerRef={modalContainerRef}
        />
      )}

      {/* Modal Reschedule Sesi (Atomic Move & Migration) */}
      {doctor && selectedSessionForReschedule && (
        <DoctorRescheduleSessionModal
          doctor={doctor}
          session={selectedSessionForReschedule}
          isOpen={isRescheduleOpen}
          onClose={() => {
            setIsRescheduleOpen(false);
            setSelectedSessionForReschedule(null);
          }}
          portalContainerRef={modalContainerRef}
          initialDate={`${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(activeDay).padStart(2, '0')}`}
        />
      )}
    </>
  );
}
