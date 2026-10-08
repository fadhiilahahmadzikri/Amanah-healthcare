'use client';

import { useState, useMemo } from 'react';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import type {
  OccupancyShift,
  OccupancySlot
} from '@/server/contracts/schedules/doctor-schedules.dto';
import { buildShiftsFromTimelineIntervals } from '../utils/shift-slot-builder';
import { overlaySessionsOnShifts } from '../utils/shift-slot-overlay';
import { isDoctorOnLeaveOnDay } from '../api/service';
import { resolveDayStatus } from '../components/doctor-timeline-calendar';
import { isSlotOccupiedOrBooked } from '../utils/doctor-schedule-predicates';
import {
  SHIFT_OPERATIONAL_STATUS,
  AVAILABILITY_STATE,
  TEMPORAL_STATE,
  EFFECTIVE_SLOT_STATUS,
  SLOT_ACTION_TYPE
} from '../constants/schedule-shift.constants';
import { useDoctorHourlyGridModals } from './useDoctorHourlyGridModals';
import { DEFAULT_FALLBACK_CAPACITY } from '@/features/klinik/constants/queue-load.constants';

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

export interface UseDoctorHourlyGridProps {
  doctor?: DoctorSchedule;
  selectedDay?: number;
  onSelectDay?: (day: number) => void;
  currentMonth?: number;
  onMonthChange?: (month: number) => void;
  currentYear?: number;
  onYearChange?: (year: number) => void;
  onAddSchedule?: () => void;
  readOnly?: boolean;
}

export function useDoctorHourlyGrid({
  doctor,
  selectedDay: selectedDayProp,
  onSelectDay,
  currentMonth: currentMonthProp,
  onMonthChange,
  currentYear: currentYearProp,
  onYearChange,
  onAddSchedule,
  readOnly = false
}: UseDoctorHourlyGridProps) {
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
    if (slot.temporalState === TEMPORAL_STATE.PAST) return true;
    if (slot.effectiveStatus === EFFECTIVE_SLOT_STATUS.EXPIRED) return true;
    if (slot.status === EFFECTIVE_SLOT_STATUS.EXPIRED) return true;
    return false;
  };

  const leaveInfo = isDoctorOnLeaveOnDay(doctor, activeDay);
  const dayStatus = resolveDayStatus(activeDay, doctor);
  const isDayCuti = dayStatus === 'cuti';
  const isDayClosed = dayStatus === 'tutup';
  const dayLeaveReason = leaveInfo.reason || doctor?.cuti_reason || 'Cuti Operasional';

  const activeSessions: DoctorDailySession[] = useMemo(
    () => doctor?.sesi_harian || [],
    [doctor?.sesi_harian]
  );

  const displayedShifts: OccupancyShift[] = useMemo(() => {
    let baseShifts: OccupancyShift[] = [];
    if (doctor?.shifts && doctor.shifts.length > 0) {
      baseShifts = doctor.shifts;
    } else if (doctor?.context_projections && doctor.context_projections.length > 0) {
      baseShifts = doctor.context_projections;
    } else if (doctor?.timeline_intervals && doctor.timeline_intervals.length > 0) {
      baseShifts = buildShiftsFromTimelineIntervals(
        doctor.timeline_intervals,
        activeSessions,
        dayStatus
      );
    }

    if (baseShifts.length === 0) {
      return [];
    }
    return overlaySessionsOnShifts(baseShifts, activeSessions, dayStatus);
  }, [
    doctor?.shifts,
    doctor?.context_projections,
    doctor?.timeline_intervals,
    activeSessions,
    dayStatus
  ]);

  const overallMetrics = useMemo(() => {
    if (doctor?.summary) return doctor.summary;
    if (doctor?.metrics) return doctor.metrics;

    const totalShifts = displayedShifts.length > 0 ? displayedShifts.length : 3;
    const scheduledSessions = activeSessions.filter(
      (s) => s.status_sesi !== 'Tutup' && s.status_sesi !== 'CLOSED'
    ).length;
    const unscheduledShifts = Math.max(0, totalShifts - scheduledSessions);

    let totalCapacity = 0;
    let totalBooked = 0;

    for (const s of activeSessions) {
      const cap = s.kuota_pasien ?? DEFAULT_FALLBACK_CAPACITY;
      totalCapacity += cap;
      totalBooked += s.pasien_terdaftar ?? 0;
    }

    if (totalCapacity === 0) {
      totalCapacity = DEFAULT_FALLBACK_CAPACITY * Math.max(1, scheduledSessions);
    }

    const occupancyPercentage =
      totalCapacity > 0 ? Number(((totalBooked / totalCapacity) * 100).toFixed(1)) : 0;
    const coveragePercentage =
      totalShifts > 0 ? Number(((scheduledSessions / totalShifts) * 100).toFixed(1)) : 0;

    return {
      totalSlots: totalShifts,
      scheduledSlots: scheduledSessions,
      unscheduledSlots: unscheduledShifts,
      availableSlots: Math.max(0, totalCapacity - totalBooked),
      occupiedSlots: totalBooked,
      closedSlots: 0,
      activeBookableSlots: totalCapacity,
      occupancy: {
        occupied: totalBooked,
        capacity: totalCapacity,
        percentage: occupancyPercentage,
        displayText: `Keterisian Kuota: ${totalBooked}/${totalCapacity} Pasien (${occupancyPercentage}%)`
      },
      patientOccupancy: {
        occupied: totalBooked,
        capacity: totalCapacity,
        percentage: occupancyPercentage,
        displayText: `Keterisian Kuota: ${totalBooked}/${totalCapacity} Pasien (${occupancyPercentage}%)`
      },
      scheduleCoverage: {
        scheduled: scheduledSessions,
        total: totalShifts,
        percentage: coveragePercentage,
        displayText: `Alokasi Praktik: ${scheduledSessions}/${totalShifts} Sesi (${coveragePercentage}%)`
      },
      unscheduledNotice:
        unscheduledShifts > 0
          ? `${unscheduledShifts} sesi belum dibuka`
          : 'Semua sesi telah aktif'
    };
  }, [doctor?.summary, doctor?.metrics, displayedShifts, activeSessions]);

  const modals = useDoctorHourlyGridModals({
    doctor,
    formattedSelectedDate,
    isDayCuti,
    onAddSchedule
  });

  const handleSlotClick = (slot: OccupancySlot) => {
    if (isDayCuti) return;

    const matchingSession = activeSessions.find(
      (s) =>
        (slot.sessionId && s.id === slot.sessionId) ||
        (slot.startTime >= s.jam_mulai && slot.startTime < s.jam_selesai) ||
        slot.startTime === s.jam_mulai ||
        (slot.conflictInfo?.sessionId && s.id === slot.conflictInfo.sessionId)
    );

    const hasBookedPatient = isSlotOccupiedOrBooked(slot);

    if (matchingSession && hasBookedPatient) {
      modals.handleOpenPatientDetail(matchingSession, slot);
      return;
    }

    if (isSlotFinished(slot)) return;

    if (slot.actionType === SLOT_ACTION_TYPE.ADD_SESSION) {
      modals.openAddSessionModal(slot.startTime, slot.endTime);
      return;
    }

    if (matchingSession) {
      modals.handleOpenSlotModal(slot, matchingSession);
      return;
    }

    if (!isDayClosed && !readOnly && slot.isClickable !== false) {
      modals.openAddSessionModal(slot.startTime, slot.endTime);
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

  const handleSelectDate = (date: Date) => {
    setActiveDay(date.getDate());
    setActiveMonth(date.getMonth());
    setActiveYear(date.getFullYear());
  };

  return {
    activeDay,
    activeMonth,
    activeYear,
    totalDaysInMonth,
    dateObj,
    formattedSelectedDate,
    isCurrentDayToday,
    currentTimeString,
    isPastDay,
    isSlotFinished,
    isDayCuti,
    isDayClosed,
    dayLeaveReason,
    activeSessions,
    displayedShifts,
    overallMetrics,
    initials,
    handlePrevDay,
    handleNextDay,
    handleToday,
    handleSelectDate,
    handleSlotClick,
    ...modals
  };
}
