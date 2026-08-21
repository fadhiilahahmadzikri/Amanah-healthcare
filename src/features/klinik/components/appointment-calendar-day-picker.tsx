'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '@/components/icons';
import {
  initialDoctorSchedules,
  isDoctorOnLeaveOnDay
} from '@/constants/mock-api-doctor-schedules';
import type { DoctorSchedule, ScheduleDayStatus } from '@/features/jadwal-dokter/api/types';
import { cn } from '@/lib/utils';

export interface AppointmentCalendarDayPickerProps {
  doctorName: string;
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
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

const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Ags',
  'Sep',
  'Okt',
  'Nov',
  'Des'
];

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const DAY_NAMES_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function AppointmentCalendarDayPicker({
  doctorName,
  selectedDateStr,
  onSelectDate,
  className
}: AppointmentCalendarDayPickerProps) {
  const doctorSchedule: DoctorSchedule | undefined = useMemo(() => {
    return (
      initialDoctorSchedules.find(
        (d) => d.nama_dokter.toLowerCase() === doctorName.toLowerCase()
      ) || initialDoctorSchedules[0]
    );
  }, [doctorName]);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());

  const [selectedDay, setSelectedDay] = useState<number>(() => {
    if (!selectedDateStr) return today.getDate();
    const parts = selectedDateStr.split(' ');
    for (const part of parts) {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= 31) return num;
    }
    return today.getDate();
  });

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const startDayIndex = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    return (firstDay + 6) % 7; // Monday = 0
  }, [currentYear, currentMonth]);

  const getDayStatus = (day: number): ScheduleDayStatus => {
    if (!doctorSchedule) return 'Buka';

    const leaveInfo = isDoctorOnLeaveOnDay(doctorSchedule, day);
    if (leaveInfo.isLeave) return 'Cuti';

    const item = doctorSchedule.monthly_schedule?.find((d) => d.day === day);
    if (item) return item.status;

    if (doctorSchedule.slot_tersedia === 0 && day === today.getDate()) return 'Penuh';

    return 'Buka';
  };

  const handleSelectDay = (day: number) => {
    const status = getDayStatus(day);
    if (status === 'Cuti') return;

    setSelectedDay(day);

    const dateObj = new Date(currentYear, currentMonth, day);
    const dayName = DAY_NAMES_FULL[dateObj.getDay()];
    const monthShort = MONTH_NAMES_SHORT[currentMonth];
    const newDateStr = `${dayName}, ${day} ${monthShort} ${currentYear}`;

    onSelectDate(newDateStr);
  };

  return (
    <div className={cn('space-y-3 font-sans select-none', className)}>
      {/* Month Calendar Navigation */}
      <div className='p-3.5 rounded-xl border border-border/70 bg-card text-card-foreground shadow-xs'>
        <div className='flex items-center justify-between pb-3 border-b border-border/50'>
          <div className='flex items-center gap-2'>
            <span className='size-2 rounded-full bg-primary-bright animate-pulse' />
            <h4 className='text-xs sm:text-sm font-bold text-foreground'>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h4>
          </div>

          <div className='flex items-center gap-1'>
            <button
              type='button'
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear((y) => y - 1);
                } else {
                  setCurrentMonth((m) => m - 1);
                }
              }}
              aria-label='Bulan sebelumnya'
              className='size-7 rounded-lg border border-border bg-background hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
            >
              <Icons.chevronLeft className='size-3.5' />
            </button>
            <button
              type='button'
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0);
                  setCurrentYear((y) => y + 1);
                } else {
                  setCurrentMonth((m) => m + 1);
                }
              }}
              aria-label='Bulan selanjutnya'
              className='size-7 rounded-lg border border-border bg-background hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
            >
              <Icons.chevronRight className='size-3.5' />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className='grid grid-cols-7 gap-1 pt-2 pb-1 text-center text-[10px] font-bold text-muted-foreground'>
          {DAY_NAMES.map((name) => (
            <div key={name} className='py-1'>
              {name}
            </div>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className='grid grid-cols-7 gap-1'>
          {Array.from({ length: startDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className='h-10 sm:h-11 rounded-lg opacity-20' />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const status = getDayStatus(dayNum);
            const isSelected = selectedDay === dayNum;
            const isToday =
              dayNum === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();

            return (
              <button
                key={`day-${dayNum}`}
                type='button'
                onClick={() => handleSelectDay(dayNum)}
                disabled={status === 'Cuti'}
                className={cn(
                  'h-10 sm:h-11 rounded-lg p-1 flex flex-col items-center justify-between border transition-all select-none relative cursor-pointer',
                  isSelected &&
                    'ring-2 ring-primary dark:ring-indigo-400 border-primary-bright font-bold scale-[1.03] z-10 shadow-xs',
                  !isSelected &&
                    status === 'Buka' &&
                    'bg-success-subtle hover:bg-success-subtle/80 border-success-border text-foreground',
                  !isSelected &&
                    status === 'Penuh' &&
                    'bg-warning-subtle hover:bg-warning-subtle/80 border-warning-border text-foreground',
                  !isSelected &&
                    status === 'Cuti' &&
                    'bg-info-subtle/40 border-info-border/50 text-muted-foreground/50 opacity-50 cursor-not-allowed'
                )}
              >
                <div className='w-full flex items-center justify-between text-[11px] leading-none'>
                  <span
                    className={cn(
                      'font-semibold',
                      isSelected
                        ? 'text-primary dark:text-indigo-300 font-bold'
                        : 'text-foreground',
                      isToday && 'underline decoration-primary decoration-2 underline-offset-2'
                    )}
                  >
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className='size-1.5 rounded-full bg-primary shrink-0' title='Hari ini' />
                  )}
                </div>

                <div className='w-full flex items-center justify-center'>
                  <span
                    className={cn(
                      'text-[9px] font-bold px-1 py-0.2 rounded-full leading-none truncate max-w-full',
                      status === 'Buka' && 'text-success',
                      status === 'Penuh' && 'text-warning',
                      status === 'Cuti' && 'text-muted-foreground'
                    )}
                  >
                    {status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend Footer */}
        <div className='flex items-center justify-between pt-2.5 mt-2 border-t border-border/40 text-[10.5px] font-medium text-muted-foreground'>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-success' />
            <span className='text-success font-semibold'>Buka / Tersedia</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-warning' />
            <span className='text-warning font-semibold'>Penuh</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-info' />
            <span className='text-info font-semibold'>Cuti</span>
          </div>
        </div>
      </div>
    </div>
  );
}
