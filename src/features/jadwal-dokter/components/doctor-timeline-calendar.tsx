'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { resolveDayStatus, type SimpleScheduleStatus } from '../utils/leave-calculator';
import type { DoctorSchedule } from '../api/types';
import {
  DoctorCalendarHeader,
  DoctorCalendarCutiBanner,
  DoctorCalendarDayCell,
  DoctorCalendarCloseModal,
  DoctorCalendarLegend,
  MONTH_NAMES
} from './calendar';

export { resolveDayStatus, type SimpleScheduleStatus };

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export interface DoctorTimelineCalendarProps {
  doctor?: DoctorSchedule;
  selectedDay?: number;
  onSelectDay?: (day: number) => void;
  currentMonth?: number;
  onMonthChange?: (month: number) => void;
  currentYear?: number;
  onYearChange?: (year: number) => void;
  onSelectDayStatus?: (day: number, status: 'OPEN' | 'CLOSED', notes?: string) => void;
  onNavigateToDailyGrid?: (day: number) => void;
  readOnly?: boolean;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  pendingDay?: number | null;
  isUpdatingDay?: boolean;
}

export function DoctorTimelineCalendar({
  doctor,
  selectedDay: selectedDayProp,
  onSelectDay,
  currentMonth: currentMonthProp,
  onMonthChange,
  currentYear: currentYearProp,
  onYearChange,
  onSelectDayStatus,
  onNavigateToDailyGrid,
  readOnly = false,
  portalContainerRef,
  className,
  pendingDay,
  isUpdatingDay = false
}: DoctorTimelineCalendarProps) {
  const today = new Date();
  const realCurrentYear = today.getFullYear();
  const realCurrentMonth = today.getMonth();
  const realCurrentDay = today.getDate();

  const [internalMonth, setInternalMonth] = useState<number>(realCurrentMonth);
  const [internalYear, setInternalYear] = useState<number>(realCurrentYear);
  const [internalDay, setInternalDay] = useState<number>(realCurrentDay);
  const [isReasonOpen, setIsReasonOpen] = useState(false);

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closingDay, setClosingDay] = useState<number | null>(null);
  const [closeNotes, setCloseNotes] = useState('');
  const [localUpdatingDay, setLocalUpdatingDay] = useState<number | null>(null);

  useEffect(() => {
    if (!isUpdatingDay) {
      setLocalUpdatingDay(null);
    }
  }, [isUpdatingDay]);

  const activePendingDay = pendingDay !== undefined ? pendingDay : localUpdatingDay;
  const isCellPending = isUpdatingDay || localUpdatingDay !== null;

  const currentMonth = currentMonthProp !== undefined ? currentMonthProp : internalMonth;
  const currentYear = currentYearProp !== undefined ? currentYearProp : internalYear;
  const selectedDay = selectedDayProp !== undefined ? selectedDayProp : internalDay;

  const setCurrentMonth = (m: number | ((prev: number) => number)) => {
    const nextVal = typeof m === 'function' ? m(currentMonth) : m;
    setInternalMonth(nextVal);
    onMonthChange?.(nextVal);
  };
  const setCurrentYear = (y: number | ((prev: number) => number)) => {
    const nextVal = typeof y === 'function' ? y(currentYear) : y;
    setInternalYear(nextVal);
    onYearChange?.(nextVal);
  };
  const setSelectedDay = (d: number) => {
    setInternalDay(d);
    onSelectDay?.(d);
  };

  const isDoctorCuti = Boolean(
    doctor?.is_cuti ||
    doctor?.status_dokter === 'Cuti' ||
    doctor?.status_jadwal === 'Cuti' ||
    doctor?.status_jadwal === 'Cuti / Tutup'
  );

  const initials = doctor?.nama_dokter
    ? doctor.nama_dokter
        .replace(/^(dr\.\s*|drg\.\s*|prof\.\s*)/g, '')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'DR';

  const handleStatusChange = (day: number, status: 'OPEN' | 'CLOSED') => {
    if (status === 'CLOSED') {
      setClosingDay(day);
      setCloseNotes('');
      setIsCloseModalOpen(true);
    } else {
      setLocalUpdatingDay(day);
      onSelectDayStatus?.(day, 'OPEN');
    }
  };

  const handleConfirmClose = () => {
    if (closingDay !== null) {
      setLocalUpdatingDay(closingDay);
      onSelectDayStatus?.(closingDay, 'CLOSED', closeNotes.trim() || undefined);
    }
    setIsCloseModalOpen(false);
    setClosingDay(null);
    setCloseNotes('');
  };

  const getStatusForDay = (day: number): SimpleScheduleStatus => {
    const item = doctor?.monthly_schedule?.find((m) => m.day === day);
    if (item?.dayStatus) {
      if (item.dayStatus === 'OPEN') return 'buka';
      if (item.dayStatus === 'CUTI') return 'cuti';
      if (item.dayStatus === 'CLOSED' || item.dayStatus === 'EMPTY') return 'tutup';
    }
    return resolveDayStatus(day, doctor);
  };

  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const startOffset = (firstDayOfWeek + 6) % 7;
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentMonth(realCurrentMonth);
    setCurrentYear(realCurrentYear);
    setSelectedDay(realCurrentDay);
  };

  const checkIsPast = (day: number) => {
    if (currentYear < realCurrentYear) return true;
    if (currentYear > realCurrentYear) return false;
    if (currentMonth < realCurrentMonth) return true;
    if (currentMonth > realCurrentMonth) return false;
    return day < realCurrentDay;
  };

  return (
    <div
      className={cn(
        'w-full h-full flex-1 flex flex-col bg-card text-card-foreground border border-border/50 rounded-2xl shadow-xs font-sans overflow-hidden select-none',
        className
      )}
    >
      <DoctorCalendarHeader
        currentMonth={currentMonth}
        currentYear={currentYear}
        onMonthChange={setCurrentMonth}
        onYearChange={setCurrentYear}
        onToday={handleToday}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      {isDoctorCuti && (
        <DoctorCalendarCutiBanner
          doctor={doctor}
          initials={initials}
          isOpen={isReasonOpen}
          onOpenChange={setIsReasonOpen}
        />
      )}

      <div className='p-3.5 sm:p-4 flex-1 flex flex-col min-h-0 space-y-2.5 overflow-hidden'>
        <div className='grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-muted-foreground pb-1.5 border-b border-border/40 shrink-0'>
          {DAY_NAMES.map((d) => (
            <div key={d} className='py-1'>
              {d}
            </div>
          ))}
        </div>

        <div className='grid grid-cols-7 auto-rows-fr gap-1.5 flex-1 min-h-0'>
          {Array.from({ length: startOffset }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className='min-h-[52px] sm:min-h-[58px] h-full rounded-xl border border-dashed border-border/25 bg-muted/5 opacity-30'
            />
          ))}

          {Array.from({ length: totalDays }, (_, i) => {
            const day = i + 1;
            const status = getStatusForDay(day);
            const isPast = checkIsPast(day);
            const isSelected = selectedDay === day;
            const isCellUpdating = activePendingDay === day && isCellPending;
            const isCellDisabled = isCellUpdating || isCellPending;

            return (
              <DoctorCalendarDayCell
                key={day}
                day={day}
                status={status}
                isPast={isPast}
                isSelected={isSelected}
                isCellUpdating={isCellUpdating}
                isCellDisabled={isCellDisabled}
                readOnly={readOnly}
                monthName={MONTH_NAMES[currentMonth]}
                onSelectDay={setSelectedDay}
                onStatusChange={handleStatusChange}
                onNavigateToDailyGrid={onNavigateToDailyGrid}
              />
            );
          })}
        </div>
      </div>

      <DoctorCalendarLegend />

      <DoctorCalendarCloseModal
        isOpen={isCloseModalOpen}
        closingDay={closingDay}
        doctorName={doctor?.nama_dokter}
        monthName={MONTH_NAMES[currentMonth]}
        currentYear={currentYear}
        closeNotes={closeNotes}
        isPending={isCellPending}
        onNotesChange={setCloseNotes}
        onClose={() => {
          setIsCloseModalOpen(false);
          setClosingDay(null);
          setCloseNotes('');
        }}
        onConfirm={handleConfirmClose}
        portalContainerRef={portalContainerRef}
      />
    </div>
  );
}
