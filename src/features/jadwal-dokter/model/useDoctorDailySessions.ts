'use client';

import { useState, useMemo } from 'react';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import { isDoctorOnLeaveOnDay } from '../api/service';
import { resolveDayStatus } from '../components/doctor-timeline-calendar';
import { useDoctorSessionModals } from './useDoctorSessionModals';

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

export interface UseDoctorDailySessionsProps {
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

export function useDoctorDailySessions({
  doctor,
  selectedDay: selectedDayProp,
  onSelectDay,
  currentMonth: currentMonthProp,
  onMonthChange,
  currentYear: currentYearProp,
  onYearChange,
  onAddSchedule,
  readOnly = false
}: UseDoctorDailySessionsProps) {
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

  const leaveInfo = isDoctorOnLeaveOnDay(doctor, activeDay);
  const dayStatus = resolveDayStatus(activeDay, doctor);
  const isDayCuti = dayStatus === 'isOnLeave';
  const isDayClosed = dayStatus === 'tutup';
  const dayLeaveReason = leaveInfo.reason || doctor?.cuti_reason || 'isOnLeave Operasional';

  const activeSessions: DoctorDailySession[] = useMemo(
    () => doctor?.sesi_harian || [],
    [doctor?.sesi_harian]
  );

  const modals = useDoctorSessionModals({
    doctor,
    formattedSelectedDate,
    isDayCuti,
    onAddSchedule
  });

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
    isDayCuti,
    isDayClosed,
    dayLeaveReason,
    activeSessions,
    initials,
    handlePrevDay,
    handleNextDay,
    handleToday,
    handleSelectDate,
    ...modals
  };
}
