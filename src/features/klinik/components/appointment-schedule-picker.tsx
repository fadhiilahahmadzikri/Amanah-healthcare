'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '@/components/icons';
import {
  initialDoctorSchedules,
  isDoctorOnLeaveOnDay
} from '@/constants/mock-api-doctor-schedules';
import type {
  DoctorSchedule,
  ScheduleDayStatus,
  DoctorDailySession
} from '@/features/jadwal-dokter/api/types';
import { cn } from '@/lib/utils';

export interface AppointmentSchedulePickerProps {
  doctorName: string;
  selectedDateStr: string;
  selectedTimeSlot: string;
  onSelectSchedule: (dateStr: string, timeSlot: string, sessionInfo?: string) => void;
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

export function AppointmentSchedulePicker({
  doctorName,
  selectedDateStr,
  selectedTimeSlot,
  onSelectSchedule,
  className
}: AppointmentSchedulePickerProps) {
  // Find doctor schedule details
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

  // Parse initial selected day if matching current month/year
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    if (!selectedDateStr) return today.getDate();
    const parts = selectedDateStr.split(' ');
    for (const part of parts) {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= 31) return num;
    }
    return today.getDate();
  });

  // Calculate days in month & padding for grid
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const startDayIndex = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    // Convert Sunday (0) to 6, Monday (1) to 0
    return (firstDay + 6) % 7;
  }, [currentYear, currentMonth]);

  // Resolve status for each day of the month for this doctor
  const getDayStatus = (day: number): ScheduleDayStatus => {
    if (!doctorSchedule) return 'Buka';

    const leaveInfo = isDoctorOnLeaveOnDay(doctorSchedule, day);
    if (leaveInfo.isLeave) return 'Cuti';

    const item = doctorSchedule.monthly_schedule?.find((d) => d.day === day);
    if (item) return item.status;

    if (doctorSchedule.slot_tersedia === 0 && day === today.getDate()) return 'Penuh';

    return 'Buka';
  };

  // Build sessions for the selected day
  const sessions: DoctorDailySession[] = useMemo(() => {
    if (!doctorSchedule) return [];
    return doctorSchedule.sesi_harian || [];
  }, [doctorSchedule]);

  // Generate sub-slots per session
  const generateSubSlots = (session: DoctorDailySession) => {
    const startH = parseInt(session.jam_mulai.split(':')[0], 10) || 8;
    const startM = parseInt(session.jam_mulai.split(':')[1], 10) || 0;
    const endH = parseInt(session.jam_selesai.split(':')[0], 10) || 12;

    const slots: string[] = [];
    let curMins = startH * 60 + startM;
    const endMins = endH * 60;

    while (curMins < endMins) {
      const h1 = Math.floor(curMins / 60);
      const m1 = curMins % 60;
      const nextMins = curMins + 30;
      const h2 = Math.floor(nextMins / 60);
      const m2 = nextMins % 60;

      const fmt1 = `${String(h1).padStart(2, '0')}:${String(m1).padStart(2, '0')}`;
      const fmt2 = `${String(h2).padStart(2, '0')}:${String(m2).padStart(2, '0')}`;
      slots.push(`${fmt1} - ${fmt2} WIB`);

      curMins += 30;
    }
    return slots;
  };

  const handleSelectDay = (day: number) => {
    const status = getDayStatus(day);
    if (status === 'Cuti') return; // Cannot book on leave

    setSelectedDay(day);

    // Format formatted date string: "Kamis, 20 Ags 2026"
    const dateObj = new Date(currentYear, currentMonth, day);
    const dayName = DAY_NAMES_FULL[dateObj.getDay()];
    const monthShort = MONTH_NAMES_SHORT[currentMonth];
    const newDateStr = `${dayName}, ${day} ${monthShort} ${currentYear}`;

    // If there's an existing time slot, keep it, else pick the first available
    const firstSession = sessions.find((s) => s.status_sesi !== 'Cuti') || sessions[0];
    const defaultSlots = firstSession ? generateSubSlots(firstSession) : ['09:00 - 09:30 WIB'];
    const timeToUse = selectedTimeSlot || defaultSlots[0] || '09:00 - 09:30 WIB';

    onSelectSchedule(newDateStr, timeToUse, firstSession?.nama_sesi);
  };

  const handleSelectTime = (slot: string, sessionName: string) => {
    const dateObj = new Date(currentYear, currentMonth, selectedDay);
    const dayName = DAY_NAMES_FULL[dateObj.getDay()];
    const monthShort = MONTH_NAMES_SHORT[currentMonth];
    const dateStr = `${dayName}, ${selectedDay} ${monthShort} ${currentYear}`;

    onSelectSchedule(dateStr, slot, sessionName);
  };

  const selectedDayStatus = getDayStatus(selectedDay);

  return (
    <div className={cn('space-y-4 font-sans select-none', className)}>
      {/* 1. Month Calendar Header & Navigation */}
      <div className='p-3.5 rounded-xl border border-border/70 bg-card text-card-foreground shadow-xs'>
        <div className='flex items-center justify-between pb-3 border-b border-border/50'>
          <div className='flex items-center gap-2'>
            <span className='size-2 rounded-full bg-primary-bright animate-pulse' />
            <h4 className='text-xs sm:text-sm font-bold text-foreground'>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h4>
          </div>

          {/* Month Stepper Buttons */}
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

        {/* 2. Days of Week Header */}
        <div className='grid grid-cols-7 gap-1 pt-2 pb-1 text-center text-[10px] font-bold text-muted-foreground'>
          {DAY_NAMES.map((name) => (
            <div key={name} className='py-1'>
              {name}
            </div>
          ))}
        </div>

        {/* 3. Calendar Day Cells */}
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
                  'h-10 sm:h-11 rounded-lg p-1 flex flex-col items-center justify-between border transition-all cursor-pointer select-none relative',
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
                    'bg-info-subtle border-info-border text-muted-foreground/60 opacity-60 cursor-not-allowed'
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
                      status === 'Cuti' && 'text-info'
                    )}
                  >
                    {status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 4. Calendar Legend Footer */}
        <div className='flex items-center justify-between pt-2.5 mt-2 border-t border-border/40 text-[10.5px] font-medium text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <span className='size-2 rounded-full bg-success' />
            <span className='text-success font-semibold'>Buka</span>
          </div>
          <div className='flex items-center gap-1'>
            <span className='size-2 rounded-full bg-warning' />
            <span className='text-warning font-semibold'>Penuh</span>
          </div>
          <div className='flex items-center gap-1'>
            <span className='size-2 rounded-full bg-info' />
            <span className='text-info font-semibold'>Cuti</span>
          </div>
        </div>
      </div>

      {/* 5. Shift & Jam Konsultasi Dokter (POV Kuota & Jam) */}
      <div className='space-y-2.5 pt-0.5'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-bold text-foreground'>Jadwal Sesi & Jam Praktik</span>
          <span className='text-[11px] font-medium text-primary dark:text-indigo-300'>
            {selectedDay} {MONTH_NAMES[currentMonth]} {currentYear} ({selectedDayStatus})
          </span>
        </div>

        {selectedDayStatus === 'Cuti' ? (
          <div className='p-4 rounded-xl border border-info-border bg-info-subtle text-info text-xs text-center'>
            <Icons.info className='size-4 mx-auto mb-1 opacity-80' />
            Dokter sedang cuti pada tanggal ini. Silakan pilih tanggal lain yang berstatus{' '}
            <strong>Buka</strong>.
          </div>
        ) : (
          <div className='space-y-2.5 max-h-[220px] overflow-y-auto pr-1'>
            {sessions.map((sesi) => {
              const subSlots = generateSubSlots(sesi);
              const isSessionFull = sesi.status_sesi === 'Penuh' || sesi.slot_tersedia <= 0;

              return (
                <div
                  key={sesi.id}
                  className={cn(
                    'p-3 rounded-xl border transition-all space-y-2',
                    isSessionFull
                      ? 'border-border/60 bg-muted/20 opacity-70'
                      : 'border-border bg-card hover:border-primary/40'
                  )}
                >
                  {/* Session Header */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-bold text-foreground'>{sesi.nama_sesi}</span>
                      <span className='text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50'>
                        {sesi.waktu}
                      </span>
                    </div>

                    <div className='flex items-center gap-2'>
                      <span
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                          isSessionFull
                            ? 'bg-warning-subtle text-warning border border-warning-border'
                            : 'bg-success-subtle text-success border border-success-border'
                        )}
                      >
                        {isSessionFull ? 'Kuota Penuh' : `Sisa ${sesi.slot_tersedia} slot`}
                      </span>
                    </div>
                  </div>

                  {/* Sub-slots buttons */}
                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-0.5'>
                    {subSlots.map((slot) => {
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type='button'
                          onClick={() => handleSelectTime(slot, sesi.nama_sesi)}
                          disabled={isSessionFull}
                          className={cn(
                            'py-1.5 px-2 rounded-lg text-center text-[11px] font-medium transition-all cursor-pointer select-none whitespace-nowrap',
                            isSelected
                              ? 'bg-primary dark:bg-indigo-600 text-primary-foreground font-bold shadow-2xs ring-1 ring-primary'
                              : 'border border-border bg-background text-foreground hover:border-primary/50'
                          )}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
