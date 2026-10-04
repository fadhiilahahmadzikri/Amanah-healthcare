'use client';

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import type { ScheduleSlotModalData } from './useDoctorScheduleSlotModal';
import type {
  OccupancyShift,
  OccupancySlot,
  BookedPatientItem
} from '@/server/contracts/schedules/doctor-schedules.dto';
import type { GridSlotData } from '../components/grid/doctor-grid-slot-item';
import { doctorScheduleKeys } from '../api/queries';
import {
  buildShiftsFromTimelineIntervals,
  buildLocalFallbackShifts
} from '../utils/shift-slot-builder';
import { overlaySessionsOnShifts } from '../utils/shift-slot-overlay';
import { isDoctorOnLeaveOnDay, getSessionPatients } from '../api/service';
import { resolveDayStatus } from '../components/doctor-timeline-calendar';
import { useUpdateDoctorSessionMutation } from '../api/mutations';
import {
  SCHEDULE_STATUS,
  SCHEDULE_MUTATION_NOTES,
  SHIFT_OPERATIONAL_STATUS,
  AVAILABILITY_STATE,
  TEMPORAL_STATE,
  EFFECTIVE_SLOT_STATUS,
  SLOT_ACTION_TYPE
} from '../constants/schedule-shift.constants';

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
    let baseShifts: OccupancyShift[];
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
    } else {
      baseShifts = buildLocalFallbackShifts(activeSessions, dayStatus);
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

    let totalSlots = 0;
    let scheduledSlots = 0;
    let unscheduledSlots = 0;
    let availableSlots = 0;
    let occupiedSlots = 0;
    let closedSlots = 0;
    let activeBookableSlots = 0;

    let futureUnscheduledSlots = 0;

    for (const shift of displayedShifts) {
      if (shift.metrics) {
        totalSlots += shift.metrics.totalSlots ?? 12;
        scheduledSlots += shift.metrics.scheduledSlots;
        availableSlots += shift.metrics.availableSlots;
        occupiedSlots += shift.metrics.occupiedSlots;
        closedSlots += shift.metrics.closedSlots;
        activeBookableSlots += shift.metrics.activeBookableSlots;
      } else {
        totalSlots += shift.totalSlots ?? 12;
        availableSlots += shift.availableSlotsCount ?? 0;
        occupiedSlots += shift.occupiedSlotsCount ?? 0;
      }

      if (shift.operationalStatus !== SHIFT_OPERATIONAL_STATUS.NO_PRACTICE) {
        const remaining = (shift.slots || []).filter(
          (s) =>
            s.availabilityState === AVAILABILITY_STATE.UNSCHEDULED &&
            s.temporalState !== TEMPORAL_STATE.PAST
        ).length;
        futureUnscheduledSlots += remaining;
      }
    }

    unscheduledSlots = futureUnscheduledSlots;

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
        unscheduledSlots > 0
          ? `${unscheduledSlots} slot belum dijadwalkan`
          : 'Semua slot telah terjadwal'
    };
  }, [doctor?.summary, doctor?.metrics, displayedShifts]);

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedSessionForReschedule, setSelectedSessionForReschedule] =
    useState<DoctorDailySession | null>(null);
  const [selectedSlotStartTime, setSelectedSlotStartTime] = useState<string | undefined>(undefined);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addSessionInitialTime, setAddSessionInitialTime] = useState<string | undefined>(undefined);
  const [addSessionInitialEndTime, setAddSessionInitialEndTime] = useState<string | undefined>(
    undefined
  );

  const queryClient = useQueryClient();
  const [isPatientsModalOpen, setIsPatientsModalOpen] = useState(false);
  const [selectedSessionForPatients, setSelectedSessionForPatients] =
    useState<DoctorDailySession | null>(null);
  const [selectedSlotForPatients, setSelectedSlotForPatients] = useState<
    { startTime: string; endTime: string } | undefined
  >(undefined);
  const [selectedPatientForDetail, setSelectedPatientForDetail] =
    useState<BookedPatientItem | null>(null);
  const [isPatientDetailOpen, setIsPatientDetailOpen] = useState(false);
  const [patientDetailSession, setPatientDetailSession] =
    useState<DoctorDailySession | null>(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [selectedSlotModalData, setSelectedSlotModalData] =
    useState<ScheduleSlotModalData | null>(null);
  const [isReasonOpen, setIsReasonOpen] = useState(false);

  const updateSessionMutation = useUpdateDoctorSessionMutation();

  const [closingSession, setClosingSession] = useState<DoctorDailySession | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  const handleRequestCloseSession = (session: DoctorDailySession) => {
    setClosingSession(session);
    setIsCloseModalOpen(true);
  };

  const handleConfirmCloseSession = () => {
    if (!doctor?.id || !closingSession?.id) return;
    setPendingSessionId(closingSession.id);
    updateSessionMutation.mutate(
      {
        doctorId: doctor.id,
        sessionId: closingSession.id,
        payload: {
          status: SCHEDULE_STATUS.CLOSED,
          status_sesi: SCHEDULE_STATUS.CLOSED,
          notes: SCHEDULE_MUTATION_NOTES.CLOSE_SESSION
        }
      },
      {
        onSuccess: () => {
          setIsCloseModalOpen(false);
          setClosingSession(null);
        },
        onSettled: () => {
          setPendingSessionId(null);
        }
      }
    );
  };

  const handleToggleSessionStatus = (session: DoctorDailySession) => {
    if (!doctor?.id || !session?.id) return;
    const isSessionClosed = session.status_sesi === SCHEDULE_STATUS.CLOSED;

    if (!isSessionClosed) {
      handleRequestCloseSession(session);
      return;
    }

    setPendingSessionId(session.id);
    updateSessionMutation.mutate(
      {
        doctorId: doctor.id,
        sessionId: session.id,
        payload: {
          status: SCHEDULE_STATUS.OPEN,
          status_sesi: SCHEDULE_STATUS.OPEN,
          notes: SCHEDULE_MUTATION_NOTES.OPEN_SESSION
        }
      },
      {
        onSettled: () => {
          setPendingSessionId(null);
        }
      }
    );
  };

  const handleOpenPatients = (
    session: DoctorDailySession,
    slotStartTime?: string,
    slotEndTime?: string
  ) => {
    setSelectedSessionForPatients(session);
    setSelectedSlotForPatients(
      slotStartTime
        ? { startTime: slotStartTime, endTime: slotEndTime || '' }
        : undefined
    );
    setIsPatientsModalOpen(true);
  };

  const handleOpenReschedule = (session: DoctorDailySession, slotStartTime?: string) => {
    setSelectedSessionForReschedule(session);
    setSelectedSlotStartTime(slotStartTime);
    setIsRescheduleOpen(true);
  };

  const openAddSessionModal = (initialTime?: string, initialEndTime?: string) => {
    if (isDayCuti) return;
    onAddSchedule?.();
    setAddSessionInitialTime(initialTime);
    setAddSessionInitialEndTime(initialEndTime);
    setIsAddModalOpen(true);
  };

  const handleOpenPatientDetail = async (
    session: DoctorDailySession,
    slot: OccupancySlot | GridSlotData
  ) => {
    if (!doctor) return;

    setPatientDetailSession(session);

    const doctorId = doctor.id || doctor.practitioner_id || '';
    const cachedData = queryClient.getQueryData<{ patients?: BookedPatientItem[] }>(
      doctorScheduleKeys.sessionPatients(doctorId, session.id, {})
    );

    let foundPatient: BookedPatientItem | undefined;
    if (cachedData?.patients) {
      foundPatient = cachedData.patients.find(
        (p) =>
          (slot.appointmentRef?.appointmentId && p.appointmentId === slot.appointmentRef.appointmentId) ||
          p.timeSlot?.startsWith(slot.startTime) ||
          p.timeSlot?.includes(slot.startTime)
      );
    }

    if (foundPatient) {
      setSelectedPatientForDetail(foundPatient);
      setIsPatientDetailOpen(true);
      return;
    }

    try {
      const fetched = await queryClient.fetchQuery({
        queryKey: doctorScheduleKeys.sessionPatients(doctorId, session.id, {}),
        queryFn: () => getSessionPatients(doctorId, session.id, {}),
        staleTime: 5 * 1000
      });
      if (fetched?.patients) {
        const matched = fetched.patients.find(
          (p) =>
            (slot.appointmentRef?.appointmentId && p.appointmentId === slot.appointmentRef.appointmentId) ||
            p.timeSlot?.startsWith(slot.startTime) ||
            p.timeSlot?.includes(slot.startTime)
        );
        if (matched) {
          setSelectedPatientForDetail(matched);
          setIsPatientDetailOpen(true);
        }
      }
    } catch {
      // Query failed or cancelled
    }
  };

  const handleClosePatientDetail = () => {
    setIsPatientDetailOpen(false);
    setSelectedPatientForDetail(null);
    setPatientDetailSession(null);
  };

  const handleOpenSlotModal = (slot: OccupancySlot, session: DoctorDailySession) => {
    if (!doctor) return;
    setSelectedSlotModalData({
      doctor,
      session,
      slot,
      date: formattedSelectedDate,
      onOpenPatients: handleOpenPatients,
      onOpenPatientDetail: handleOpenPatientDetail,
      onOpenReschedule: handleOpenReschedule,
      onToggleSessionStatus: handleToggleSessionStatus
    });
    setIsSlotModalOpen(true);
  };

  const handleCloseSlotModal = () => {
    setIsSlotModalOpen(false);
    setSelectedSlotModalData(null);
  };

  const handleSlotClick = (slot: OccupancySlot) => {
    if (isDayCuti || isSlotFinished(slot)) return;

    if (slot.actionType === SLOT_ACTION_TYPE.ADD_SESSION) {
      openAddSessionModal(slot.startTime, slot.endTime);
      return;
    }

    const matchingSession = activeSessions.find(
      (s) =>
        (slot.sessionId && s.id === slot.sessionId) ||
        (slot.startTime >= s.jam_mulai && slot.startTime < s.jam_selesai) ||
        slot.startTime === s.jam_mulai ||
        (slot.conflictInfo?.sessionId && s.id === slot.conflictInfo.sessionId)
    );

    if (matchingSession) {
      handleOpenSlotModal(slot, matchingSession);
      return;
    }

    if (!isDayClosed && !readOnly && slot.isClickable !== false) {
      openAddSessionModal(slot.startTime, slot.endTime);
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
    handleOpenPatients,
    handleOpenReschedule,
    openAddSessionModal,
    handleToggleSessionStatus,
    handleConfirmCloseSession,
    isRescheduleOpen,
    setIsRescheduleOpen,
    selectedSessionForReschedule,
    setSelectedSessionForReschedule,
    selectedSlotStartTime,
    setSelectedSlotStartTime,
    isAddModalOpen,
    setIsAddModalOpen,
    addSessionInitialTime,
    setAddSessionInitialTime,
    addSessionInitialEndTime,
    setAddSessionInitialEndTime,
    isPatientsModalOpen,
    setIsPatientsModalOpen,
    selectedSessionForPatients,
    setSelectedSessionForPatients,
    selectedSlotForPatients,
    setSelectedSlotForPatients,
    selectedPatientForDetail,
    setSelectedPatientForDetail,
    isPatientDetailOpen,
    setIsPatientDetailOpen,
    patientDetailSession,
    handleOpenPatientDetail,
    handleClosePatientDetail,
    isSlotModalOpen,
    setIsSlotModalOpen,
    selectedSlotModalData,
    handleOpenSlotModal,
    handleCloseSlotModal,
    isReasonOpen,
    setIsReasonOpen,
    isCloseModalOpen,
    setIsCloseModalOpen,
    closingSession,
    setClosingSession,
    pendingSessionId,
    updateSessionMutation
  };
}
