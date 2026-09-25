'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { DoctorAddSessionModal } from './doctor-add-session-modal';
import { DoctorEditSessionModal } from './doctor-edit-session-modal';
import { DoctorRescheduleSessionModal } from './doctor-reschedule-session-modal';
import { DoctorSessionDetailModal } from './doctor-session-detail-modal';
import { DoctorSessionPatientsModal } from './doctor-session-patients-modal';
import { DoctorOccupancyRadialChart } from './doctor-occupancy-radial-chart';
import { isDoctorOnLeaveOnDay } from '../api/service';
import { useUpdateDoctorSessionMutation } from '../api/mutations';
import { resolveDayStatus } from './doctor-timeline-calendar';
import { cn } from '@/lib/utils';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import type {
  OccupancyShift,
  OccupancySlot
} from '@/server/contracts/schedules/doctor-schedules.dto';
import {
  STATUS_CONFIG,
  UI_VARIANT_CONFIG,
  buildShiftsFromTimelineIntervals,
  buildLocalFallbackShifts,
  type HourlySlotStatus
} from '../utils/shift-slot-builder';

export type { HourlySlotStatus };

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

  const isPastDay =
    activeYear < realCurrentYear ||
    (activeYear === realCurrentYear && activeMonth < realCurrentMonth) ||
    (activeYear === realCurrentYear &&
      activeMonth === realCurrentMonth &&
      activeDay < realCurrentDay);

  const isSlotFinished = (slot: OccupancySlot): boolean => {
    if (isPastDay) return true;
    if (isCurrentDayToday && currentTimeString >= slot.endTime) return true;
    if (slot.temporalState === 'PAST') return true;
    if (slot.effectiveStatus === 'EXPIRED') return true;
    if (slot.status === 'EXPIRED') return true;
    return false;
  };

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

  // Directly construct discrete shifts from backend shifts / timeline_intervals or activeSessions & SSOT dayStatus
  const displayedShifts: OccupancyShift[] = useMemo(() => {
    if (doctor?.shifts && doctor.shifts.length > 0) {
      return doctor.shifts;
    }
    if (doctor?.context_projections && doctor.context_projections.length > 0) {
      return doctor.context_projections;
    }
    if (doctor?.timeline_intervals && doctor.timeline_intervals.length > 0) {
      return buildShiftsFromTimelineIntervals(doctor.timeline_intervals, activeSessions, dayStatus);
    }
    return buildLocalFallbackShifts(activeSessions, dayStatus);
  }, [
    doctor?.shifts,
    doctor?.context_projections,
    doctor?.timeline_intervals,
    activeSessions,
    dayStatus
  ]);

  // Aggregate or consume whole-day projection metrics directly from backend SSOT
  const overallMetrics = useMemo(() => {
    if (doctor?.summary) return doctor.summary;
    if (doctor?.metrics) return doctor.metrics;

    let totalSlots = 0;
    let scheduledSlots = 0;
    let unscheduledSlots = 0;
    let availableSlots = 0;
    let occupiedSlots = 0;
    let closedSlots = 0;
    let activeBookableSlots = 0;

    for (const shift of displayedShifts) {
      if (shift.metrics) {
        totalSlots += shift.metrics.totalSlots ?? 12;
        scheduledSlots += shift.metrics.scheduledSlots;
        unscheduledSlots += shift.metrics.unscheduledSlots;
        availableSlots += shift.metrics.availableSlots;
        occupiedSlots += shift.metrics.occupiedSlots;
        closedSlots += shift.metrics.closedSlots;
        activeBookableSlots += shift.metrics.activeBookableSlots;
      } else {
        totalSlots += shift.totalSlots ?? 12;
        availableSlots += shift.availableSlotsCount ?? 0;
        occupiedSlots += shift.occupiedSlotsCount ?? 0;
      }
    }

    const occupancyPercentage =
      activeBookableSlots > 0
        ? Number(((occupiedSlots / activeBookableSlots) * 100).toFixed(1))
        : 0;
    const coveragePercentage =
      totalSlots > 0 ? Number(((scheduledSlots / totalSlots) * 100).toFixed(1)) : 0;

    return {
      totalSlots,
      scheduledSlots,
      unscheduledSlots,
      availableSlots,
      occupiedSlots,
      closedSlots,
      activeBookableSlots,
      occupancy: {
        occupied: occupiedSlots,
        capacity: activeBookableSlots,
        percentage: occupancyPercentage,
        displayText: `Keterisian Kuota: ${occupiedSlots}/${activeBookableSlots} Pasien (${occupancyPercentage}%)`
      },
      patientOccupancy: {
        occupied: occupiedSlots,
        capacity: activeBookableSlots,
        percentage: occupancyPercentage,
        displayText: `Keterisian Kuota: ${occupiedSlots}/${activeBookableSlots} Pasien (${occupancyPercentage}%)`
      },
      scheduleCoverage: {
        scheduled: scheduledSlots,
        total: totalSlots,
        percentage: coveragePercentage,
        displayText: `Alokasi Praktik: ${scheduledSlots}/${totalSlots} Slot (${coveragePercentage}%)`
      },
      unscheduledNotice:
        unscheduledSlots > 0 ? `${unscheduledSlots} slot belum dijadwalkan` : undefined
    };
  }, [doctor?.summary, doctor?.metrics, displayedShifts]);

  // Modals state
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<DoctorDailySession | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedSessionForReschedule, setSelectedSessionForReschedule] =
    useState<DoctorDailySession | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<DoctorDailySession | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addSessionInitialTime, setAddSessionInitialTime] = useState<string | undefined>(undefined);

  const [isPatientsModalOpen, setIsPatientsModalOpen] = useState(false);
  const [selectedSessionForPatients, setSelectedSessionForPatients] =
    useState<DoctorDailySession | null>(null);

  const [isReasonOpen, setIsReasonOpen] = useState(false);

  const updateSessionMutation = useUpdateDoctorSessionMutation();

  const [closingSession, setClosingSession] = useState<DoctorDailySession | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const handleRequestCloseSession = (session: DoctorDailySession) => {
    setClosingSession(session);
    setIsCloseModalOpen(true);
  };

  const handleConfirmCloseSession = () => {
    if (!doctor?.id || !closingSession?.id) return;
    updateSessionMutation.mutate(
      {
        doctorId: doctor.id,
        sessionId: closingSession.id,
        payload: {
          status_sesi: 'CLOSED'
        }
      },
      {
        onSuccess: () => {
          setIsCloseModalOpen(false);
          setClosingSession(null);
        }
      }
    );
  };

  const handleToggleSessionStatus = (session: DoctorDailySession) => {
    if (!doctor?.id || !session?.id) return;
    const isSessionClosed =
      (session.status_sesi || '').toUpperCase() === 'CLOSED' ||
      (session.status_sesi || '').toUpperCase() === 'TUTUP';

    if (!isSessionClosed) {
      handleRequestCloseSession(session);
      return;
    }

    updateSessionMutation.mutate({
      doctorId: doctor.id,
      sessionId: session.id,
      payload: {
        status_sesi: 'OPEN'
      }
    });
  };

  const handleOpenPatients = (session: DoctorDailySession) => {
    setIsDetailModalOpen(false);
    setSelectedSessionForPatients(session);
    setIsPatientsModalOpen(true);
  };

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
    if (isDayCuti || isSlotFinished(slot)) return;

    if (slot.actionType === 'ADD_SESSION') {
      openAddSessionModal(slot.startTime);
      return;
    }

    if (slot.actionType === 'VIEW_PATIENTS' || slot.actionType === 'VIEW_SESSION') {
      const matchingSession = activeSessions.find(
        (s) =>
          (slot.sessionId && s.id === slot.sessionId) ||
          (slot.startTime >= s.jam_mulai && slot.startTime < s.jam_selesai) ||
          slot.startTime === s.jam_mulai
      );
      if (matchingSession) {
        if (slot.actionType === 'VIEW_PATIENTS') {
          handleOpenPatients(matchingSession);
        } else {
          handleOpenSessionDetail(matchingSession);
        }
        return;
      }
    }

    // Default action fallback based on session presence
    const matchingSession = activeSessions.find(
      (s) =>
        (slot.startTime >= s.jam_mulai && slot.startTime < s.jam_selesai) ||
        slot.startTime === s.jam_mulai ||
        (slot.conflictInfo?.sessionId && s.id === slot.conflictInfo.sessionId)
    );

    if (matchingSession) {
      handleOpenSessionDetail(matchingSession);
    } else if (!isDayClosed && !readOnly && slot.isClickable !== false) {
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
            {(isDayCuti ||
              (isDayClosed && activeSessions.length === 0) ||
              activeSessions.length === 0) && (
              <div className='text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 font-normal'>
                {isDayCuti ? (
                  <span className='text-sky-600 dark:text-sky-400 font-semibold'>
                    Praktik Ditutup (Cuti)
                  </span>
                ) : isDayClosed && activeSessions.length === 0 ? (
                  <span className='text-destructive dark:text-destructive font-semibold'>
                    Praktik Ditutup pada tanggal ini
                  </span>
                ) : (
                  <span className='text-muted-foreground font-medium'>
                    Belum ada jadwal praktik diatur pada tanggal ini
                  </span>
                )}
              </div>
            )}
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
                Dokter ini belum memiliki sesi praktik pada tanggal ini. Klik slot jam untuk
                menambahkan sesi.
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

        {/* Dual Indicator Metrics Summary Bar (Backend SSOT Radial Chart) */}
        {!isDayCuti && !isDayClosed && (
          <DoctorOccupancyRadialChart
            scheduleCoverage={
              overallMetrics.scheduleCoverage ?? {
                scheduled: overallMetrics.scheduledSlots ?? 0,
                total: overallMetrics.totalSlots ?? 48,
                percentage: 0
              }
            }
            patientOccupancy={
              overallMetrics.patientOccupancy ??
              overallMetrics.occupancy ?? {
                occupied: overallMetrics.occupiedSlots ?? 0,
                capacity: overallMetrics.activeBookableSlots ?? 0,
                percentage: 0
              }
            }
            unscheduledNotice={overallMetrics.unscheduledNotice}
            unscheduledSlots={overallMetrics.unscheduledSlots}
          />
        )}

        {/* 4. Body Grid: Discrete 30-min Consultation Slots per Shift (Backend SSOT) */}
        <div className='p-3.5 sm:p-4 space-y-4.5 overflow-x-auto'>
          {displayedShifts.map((shift) => {
            const matchingShiftSessions = activeSessions.filter((s) =>
              Boolean(
                shift.boundaryStartTime &&
                shift.boundaryEndTime &&
                s.jam_mulai >= shift.boundaryStartTime &&
                s.jam_mulai < shift.boundaryEndTime
              )
            );
            const primaryShiftSession = matchingShiftSessions[0];
            const sessionBookedCount = matchingShiftSessions.reduce((acc, s) => {
              const rawStatus = (s.status_sesi || '').toUpperCase();
              if (rawStatus === 'CLOSED' || rawStatus === 'CUTI') {
                return acc;
              }
              if (s.pasien_terdaftar !== undefined) {
                return acc + s.pasien_terdaftar;
              }
              const capacity = s.kuota_pasien || 0;
              const available = s.slot_tersedia !== undefined ? s.slot_tersedia : capacity;
              return acc + Math.max(0, capacity - available);
            }, 0);

            const intervalBookedCount =
              doctor?.timeline_intervals?.filter(
                (it) =>
                  shift.boundaryStartTime &&
                  shift.boundaryEndTime &&
                  it.startTime >= shift.boundaryStartTime &&
                  it.startTime < shift.boundaryEndTime &&
                  Boolean(it.appointmentRef || (it.isOccupied && it.status === 'OCCUPIED'))
              ).length || 0;

            const shiftBookedCount =
              isDayClosed || isDayCuti ? 0 : Math.max(sessionBookedCount, intervalBookedCount);

            return (
              <div key={shift.contextId || shift.shiftId || shift.shift} className='space-y-2'>
                {/* Y-Axis Shift Header: Shift Name, Time Range & Slot Metrics SSOT */}
                <div className='flex items-center justify-between text-xs pb-1.5 border-b border-border/30'>
                  <div className='flex items-center gap-2'>
                    <span className='text-foreground font-bold text-xs sm:text-[13px]'>
                      {shift.shiftName || shift.contextLabel || shift.label}
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
                    ) : shift.operationalStatus === 'NO_PRACTICE' ? (
                      <span className='font-mono text-xs text-muted-foreground'>
                        {shift.operationalLabel || 'Tidak Ada Praktik'}
                      </span>
                    ) : (
                      <>
                        {primaryShiftSession && (
                          <button
                            type='button'
                            onClick={() => handleOpenPatients(primaryShiftSession)}
                            className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all cursor-pointer shadow-2xs'
                            title='Lihat daftar pasien terdaftar pada sesi shift ini'
                          >
                            <Icons.teams className='size-3 text-primary' />
                            <span>
                              {shift.registeredPatientsCount !== undefined
                                ? `${shift.registeredPatientsCount} Pasien`
                                : shiftBookedCount > 0
                                  ? `${shiftBookedCount} Pasien`
                                  : '0 Pasien'}
                            </span>
                          </button>
                        )}
                        <span className='font-mono text-xs text-muted-foreground'>
                          {shift.operationalLabel ||
                            (shift.metrics?.availableSlots !== undefined
                              ? `${shift.metrics.availableSlots} slot tersedia`
                              : primaryShiftSession?.slot_tersedia !== undefined
                                ? `${primaryShiftSession.slot_tersedia} slot tersedia`
                                : `${shift.availableSlotsCount ?? 0} slot tersedia`)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* X-Axis: Discrete Consultation Slots Grid (Serial 30-menit) */}
                <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5'>
                  {shift.slots.map((slot) => {
                    const isFinished = isSlotFinished(slot);
                    const variantCfg = isFinished
                      ? STATUS_CONFIG.EXPIRED
                      : (slot.uiVariant && UI_VARIANT_CONFIG[slot.uiVariant]) ||
                        (slot.status && STATUS_CONFIG[slot.status]) ||
                        UI_VARIANT_CONFIG.neutral_disabled;

                    const isNow =
                      !isFinished &&
                      isCurrentDayToday &&
                      currentTimeString >= slot.startTime &&
                      currentTimeString < slot.endTime;

                    const displayLabel = isFinished
                      ? 'Selesai'
                      : slot.uiLabel || slot.displayLabel || 'Tersedia';

                    const isClickable =
                      !isFinished &&
                      !isDayCuti &&
                      (slot.isClickable !== undefined
                        ? slot.isClickable
                        : !isDayClosed && !readOnly);

                    const isRescheduled =
                      !isFinished &&
                      (slot.uiStatus === 'RESCHEDULED' || Boolean(slot.reschedule?.isRescheduled));

                    const isClosed =
                      !isFinished &&
                      (slot.uiStatus === 'CLOSED_CLINIC' ||
                        slot.uiStatus === 'CLOSED_LEAVE' ||
                        slot.status === 'CLOSED' ||
                        slot.status === 'CLOSED_LEAVE');

                    const matchingSession = activeSessions.find(
                      (s) =>
                        (slot.sessionId && s.id === slot.sessionId) ||
                        (slot.startTime >= s.jam_mulai && slot.startTime < s.jam_selesai) ||
                        slot.startTime === s.jam_mulai ||
                        (slot.conflictInfo?.sessionId && s.id === slot.conflictInfo.sessionId)
                    );

                    const hasHoverMenu = Boolean(
                      matchingSession && !isFinished && !isDayCuti && !readOnly
                    );

                    const slotButton = (
                      <button
                        key={`${shift.contextId || shift.shiftId}-${slot.slotIndex}-${slot.startTime}`}
                        type='button'
                        onClick={() => handleSlotClick(slot)}
                        disabled={!isClickable}
                        className={cn(
                          'w-full min-h-[52px] sm:min-h-[56px] rounded-xl border p-2 flex flex-col justify-between transition-all text-left relative outline-none',
                          variantCfg.cellBg,
                          variantCfg.border,
                          !isClickable
                            ? 'cursor-default opacity-80'
                            : 'cursor-pointer hover:shadow-xs hover:border-primary/50',
                          isNow && 'ring-1.5 ring-primary font-bold'
                        )}
                      >
                        {/* Baris Atas: Jam Mulai & Indikator Titik / Reschedule / Closure */}
                        <div className='flex items-center justify-between'>
                          <span
                            className={cn(
                              'text-xs sm:text-[12.5px] font-mono font-bold leading-none',
                              isNow
                                ? 'text-primary font-black'
                                : 'timeText' in variantCfg &&
                                    typeof variantCfg.timeText === 'string'
                                  ? variantCfg.timeText
                                  : 'text-foreground'
                            )}
                          >
                            {slot.startTime}
                          </span>
                          <div className='flex items-center gap-1 shrink-0'>
                            {isRescheduled && (
                              <Icons.history
                                className='size-3 text-amber-600 dark:text-amber-400 shrink-0'
                                title={slot.reschedule?.reasonText || 'Sesi dijadwalkan ulang'}
                              />
                            )}
                            {isClosed && slot.closure && (
                              <Icons.lock
                                className='size-2.5 text-rose-600 dark:text-rose-400 shrink-0'
                                title={slot.closure.reasonText || 'Ditutup'}
                              />
                            )}
                            <span
                              className={cn('size-2 rounded-full shrink-0', variantCfg.dotBg)}
                            />
                          </div>
                        </div>

                        {/* Baris Bawah: Status Label Kanonikal & Jam Selesai */}
                        <div className='mt-1 flex items-end justify-between gap-1'>
                          <span
                            className={cn(
                              'text-[10px] sm:text-[10.5px] font-bold leading-none select-none tracking-tight block truncate',
                              variantCfg.text
                            )}
                            title={displayLabel}
                          >
                            {displayLabel}
                          </span>

                          <span className='text-[9px] font-mono text-muted-foreground/70 font-semibold shrink-0'>
                            {slot.uiSubLabel || slot.endTime}
                          </span>
                        </div>
                      </button>
                    );

                    if (hasHoverMenu && matchingSession) {
                      return (
                        <HoverCard
                          key={`${shift.contextId || shift.shiftId}-${slot.slotIndex}-${slot.startTime}`}
                          openDelay={200}
                          closeDelay={150}
                        >
                          <HoverCardTrigger asChild>{slotButton}</HoverCardTrigger>
                          <HoverCardContent
                            align='center'
                            side='top'
                            sideOffset={6}
                            className='w-48 p-1.5 rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-lg z-50 animate-in fade-in-0 zoom-in-95'
                          >
                            <div className='flex flex-col gap-0.5'>
                              <div className='px-2 py-1 text-[10.5px] font-semibold text-muted-foreground border-b border-border/30 mb-0.5 flex items-center justify-between'>
                                <span className='truncate'>{matchingSession.nama_sesi}</span>
                                <span className='font-mono text-[9.5px] shrink-0'>
                                  {slot.startTime}
                                </span>
                              </div>
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPatients(matchingSession);
                                }}
                                className='flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer text-left'
                              >
                                <Icons.teams className='size-3.5 text-sky-600 dark:text-sky-400 shrink-0' />
                                <span>Lihat Pasien</span>
                              </button>
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditSession(matchingSession);
                                }}
                                className='flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer text-left'
                              >
                                <Icons.edit className='size-3.5 text-primary shrink-0' />
                                <span>Ubah Sesi</span>
                              </button>
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReschedule(matchingSession);
                                }}
                                className='flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer text-left'
                              >
                                <Icons.history className='size-3.5 text-amber-600 dark:text-amber-400 shrink-0' />
                                <span>Reschedule</span>
                              </button>
                              {(() => {
                                const isSessionClosed =
                                  (matchingSession.status_sesi || '').toUpperCase() === 'CLOSED' ||
                                  (matchingSession.status_sesi || '').toUpperCase() === 'TUTUP';
                                return (
                                  <button
                                    type='button'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleSessionStatus(matchingSession);
                                    }}
                                    disabled={updateSessionMutation.isPending}
                                    className={cn(
                                      'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted transition-colors cursor-pointer text-left',
                                      isSessionClosed
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-rose-600 dark:text-rose-400'
                                    )}
                                  >
                                    {isSessionClosed ? (
                                      <>
                                        <Icons.check className='size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0' />
                                        <span>Buka Jadwal</span>
                                      </>
                                    ) : (
                                      <>
                                        <Icons.lock className='size-3.5 text-rose-600 dark:text-rose-400 shrink-0' />
                                        <span>Tutup Jadwal</span>
                                      </>
                                    )}
                                  </button>
                                );
                              })()}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      );
                    }

                    return slotButton;
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

        {/* 5. Footer Legend Ringkas & Standar Desain Sistem (Minimalist) */}
        <div className='px-4 py-3 border-t border-border/30 bg-muted/5 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-medium'>
          <div className='flex items-center gap-1.5'>
            <span className='size-2.5 rounded-full bg-emerald-500 shrink-0' />
            <span className='text-emerald-700 dark:text-emerald-400 font-semibold'>Tersedia</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2.5 rounded-full bg-sky-500 shrink-0' />
            <span className='text-sky-700 dark:text-sky-400 font-semibold'>Terisi</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2.5 rounded-full bg-amber-500 shrink-0' />
            <span className='text-amber-700 dark:text-amber-400 font-semibold'>
              Dijadwalkan Ulang
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2.5 rounded-full bg-rose-500 shrink-0' />
            <span className='text-rose-700 dark:text-rose-400 font-semibold'>Ditutup</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2.5 rounded-sm border border-dashed border-border/80 bg-muted/20 shrink-0' />
            <span className='text-muted-foreground font-semibold'>Belum Terjadwal</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2.5 rounded-full bg-muted-foreground/30 shrink-0' />
            <span className='text-muted-foreground/60 font-semibold'>Selesai</span>
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
          onOpenPatients={(sess) => handleOpenPatients(sess)}
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
          targetDate={`${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(activeDay).padStart(2, '0')}`}
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

      {/* Modal Daftar Pasien Terdaftar (5-Kolom Responsive Showcase Grid) */}
      {doctor && selectedSessionForPatients && (
        <DoctorSessionPatientsModal
          doctor={doctor}
          session={selectedSessionForPatients}
          isOpen={isPatientsModalOpen}
          onClose={() => {
            setIsPatientsModalOpen(false);
            setSelectedSessionForPatients(null);
          }}
          portalContainerRef={modalContainerRef}
        />
      )}

      {/* Modal Konfirmasi Tutup Jadwal Sesi */}
      <ModalWrapper
        isOpen={isCloseModalOpen}
        onClose={() => {
          setIsCloseModalOpen(false);
          setClosingSession(null);
        }}
        maxWidth='max-w-[420px]'
        portalContainerRef={modalContainerRef}
        showCloseButton={false}
      >
        <div className='relative font-sans space-y-4 text-left p-1'>
          <div className='flex items-start justify-between gap-3'>
            <div className='space-y-1 min-w-0'>
              <div className='flex items-center gap-1.5 text-rose-600 dark:text-rose-400'>
                <Icons.lock className='size-4' />
                <span className='text-xs font-bold tracking-tight'>Konfirmasi Tutup Jadwal</span>
              </div>
              <h3 className='text-sm sm:text-base font-bold text-foreground leading-snug'>
                Apakah Anda yakin ingin menutup sesi ini?
              </h3>
            </div>
            <button
              type='button'
              onClick={() => {
                setIsCloseModalOpen(false);
                setClosingSession(null);
              }}
              aria-label='Tutup dialog'
              className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0'
            >
              <Icons.close className='size-4' />
            </button>
          </div>

          {closingSession && (
            <div className='rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1.5 text-xs'>
              <div className='flex items-center justify-between font-semibold'>
                <span className='text-foreground'>{closingSession.nama_sesi}</span>
                <span className='font-mono text-muted-foreground'>
                  {closingSession.jam_mulai} - {closingSession.jam_selesai}
                </span>
              </div>
              <p className='text-[11.5px] text-muted-foreground leading-relaxed'>
                Setelah ditutup, sesi ini tidak akan dapat dipesan oleh pasien baru.
              </p>
            </div>
          )}

          <div className='flex items-center justify-end gap-2 pt-2 border-t border-border/40'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              shape='pill'
              onClick={() => {
                setIsCloseModalOpen(false);
                setClosingSession(null);
              }}
              className='text-xs px-4 font-semibold cursor-pointer'
            >
              Tidak
            </Button>
            <Button
              type='button'
              variant='destructive'
              size='sm'
              shape='pill'
              disabled={updateSessionMutation.isPending}
              onClick={handleConfirmCloseSession}
              className='text-xs px-4 font-semibold gap-1.5 cursor-pointer'
            >
              {updateSessionMutation.isPending && (
                <Icons.spinner className='size-3.5 animate-spin' />
              )}
              <span>Ya, Tutup Jadwal</span>
            </Button>
          </div>
        </div>
      </ModalWrapper>
    </>
  );
}
