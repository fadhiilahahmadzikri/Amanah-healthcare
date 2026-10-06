'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DoctorRescheduleSessionModal } from './doctor-reschedule-session-modal';
import { DoctorAddSessionModal, type ReturnDoctorContext } from './doctor-add-session-modal';
import { isDoctorOnLeaveOnDay } from '../api/service';
import { SCHEDULE_STATUS, type ScheduleStatus } from '../constants/schedule-shift.constants';
import { useScheduleReferenceOptions } from '../hooks/useScheduleReferenceOptions';
import { DoctorGanttSessionLane } from './timeline/doctor-gantt-session-lane';
import { cn } from '@/lib/utils';
import type { DoctorSchedule, DoctorDailySession, TimelineInterval } from '../api/types';

export interface DoctorGanttTimelineProps {
  doctor?: DoctorSchedule;
  selectedDay?: number;
  onSelectDay?: (day: number) => void;
  currentMonth?: number;
  onMonthChange?: (month: number) => void;
  currentYear?: number;
  onYearChange?: (year: number) => void;
  modalContainerRef?: React.RefObject<HTMLElement | null>;
  readOnly?: boolean;
  onViewDoctorSchedule?: (
    doctorId: string,
    targetSlotTime?: string,
    returnContext?: ReturnDoctorContext
  ) => void;
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

function deriveIntervalsForSession(
  session: DoctorDailySession,
  consultationDuration: number
): TimelineInterval[] {
  if (consultationDuration <= 0) return [];

  const [startH, startM] = session.jam_mulai.split(':').map((v) => parseInt(v, 10) || 0);
  const [endH, endM] = session.jam_selesai.split(':').map((v) => parseInt(v, 10) || 0);

  const startTotalMinutes = startH * 60 + startM;
  let endTotalMinutes = endH * 60 + endM;
  if (endTotalMinutes <= startTotalMinutes) {
    endTotalMinutes += 24 * 60;
  }

  const duration = consultationDuration;
  const intervals: TimelineInterval[] = [];
  let currentMin = startTotalMinutes;
  let idx = 0;

  const occupiedCount = Math.max(0, session.kuota_pasien - session.slot_tersedia);

  while (currentMin + duration <= endTotalMinutes) {
    const nextMin = currentMin + duration;
    const sH = Math.floor((currentMin % (24 * 60)) / 60);
    const sM = currentMin % 60;
    const eH = Math.floor((nextMin % (24 * 60)) / 60);
    const eM = nextMin % 60;

    const startTime = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;
    const endTime = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;

    const isOccupied = session.status_sesi === SCHEDULE_STATUS.OCCUPIED || idx < occupiedCount;
    const isClosed =
      session.status_sesi === SCHEDULE_STATUS.CLOSED ||
      session.status_sesi === SCHEDULE_STATUS.CUTI;

    const status: ScheduleStatus = isClosed
      ? SCHEDULE_STATUS.CLOSED
      : isOccupied
        ? SCHEDULE_STATUS.OCCUPIED
        : SCHEDULE_STATUS.OPEN;

    intervals.push({
      intervalIndex: idx + 1,
      startTime,
      endTime,
      status,
      displayLabel: `${startTime} - ${endTime}`,
      isOccupied: status === SCHEDULE_STATUS.OCCUPIED,
      appointmentRef:
        status === 'OCCUPIED'
          ? {
              appointmentId: `APT-${session.id.slice(-4)}-${idx + 1}`,
              queueNumber: idx + 1,
              status: 'CONFIRMED'
            }
          : null,
      closedReason: isClosed ? (session.status_sesi === 'Cuti' ? 'Cuti' : 'Tutup') : null
    });

    currentMin = nextMin;
    idx++;
  }

  return intervals;
}

export function DoctorGanttTimeline({
  doctor,
  selectedDay: selectedDayProp,
  onSelectDay,
  currentMonth: currentMonthProp,
  onMonthChange,
  currentYear: currentYearProp,
  onYearChange,
  modalContainerRef,
  readOnly = false,
  onViewDoctorSchedule,
  className
}: DoctorGanttTimelineProps) {
  const { shifts, effectiveConsultationDurationMinutes } = useScheduleReferenceOptions();
  const policyDuration = effectiveConsultationDurationMinutes ?? shifts[0]?.durationMinutes ?? 0;

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

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedSessionForReschedule, setSelectedSessionForReschedule] =
    useState<DoctorDailySession | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReasonOpen, setIsReasonOpen] = useState(false);

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

  const activeSessions: DoctorDailySession[] = useMemo(() => {
    return doctor?.sesi_harian || [];
  }, [doctor?.sesi_harian]);

  const totalCapacity =
    doctor?.kapasitas_per_hari || activeSessions.reduce((acc, s) => acc + s.kuota_pasien, 0);
  const totalSlots = isDayCuti
    ? 0
    : (doctor?.slot_tersedia ?? activeSessions.reduce((acc, s) => acc + s.slot_tersedia, 0));

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

  const handleOpenReschedule = (session: DoctorDailySession) => {
    setSelectedSessionForReschedule(session);
    setIsRescheduleOpen(true);
  };

  const formattedDateParam = `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(activeDay).padStart(2, '0')}`;

  return (
    <>
      <div
        className={cn(
          'w-full bg-card text-card-foreground border border-border/50 rounded-2xl shadow-xs font-sans overflow-hidden flex flex-col select-none',
          className
        )}
      >
        <div className='p-3.5 sm:p-4 border-b border-border/40 flex items-center justify-between gap-3 bg-muted/10'>
          <div className='min-w-0'>
            <div className='flex items-center gap-2'>
              <h2 className='text-sm sm:text-base font-bold text-foreground tracking-tight truncate'>
                {formattedSelectedDate}
              </h2>
            </div>
            <div className='text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 font-normal'>
              {isDayCuti ? (
                <span className='text-sky-600 dark:text-sky-400 font-semibold'>
                  Praktik Ditutup (Cuti)
                </span>
              ) : totalCapacity === 0 && activeSessions.length === 0 ? (
                <span className='text-muted-foreground font-medium'>
                  Belum ada jadwal praktik diatur (0 Kuota)
                </span>
              ) : (
                <span className='font-mono'>
                  <strong className='text-primary font-semibold'>{totalSlots}</strong> /{' '}
                  {totalCapacity} slot tersedia
                  {totalSlots <= 0 && totalCapacity > 0 && (
                    <span className='ml-1.5 text-sky-600 dark:text-sky-400 font-bold'>
                      (Terisi Penuh)
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

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
                onClick={() => setIsAddModalOpen(true)}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-dashed border-border/80 hover:border-primary/70 bg-background hover:bg-primary/5 text-foreground/80 hover:text-primary transition-all shadow-2xs cursor-pointer select-none shrink-0'
              >
                <Icons.add className='size-3.5' />
                <span>Tambah Sesi</span>
              </button>
            )}
          </div>
        </div>

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
                <span>Lihat keterangan dokter cuti</span>
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
                <div className='flex items-start gap-3'>
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
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-xs sm:text-[13px] font-bold text-foreground truncate'>
                      {doctor?.nama_dokter}
                    </h4>
                    <p className='text-[11px] text-muted-foreground mt-0.5 font-normal'>
                      {doctor?.spesialisasi} • {doctor?.ruang_praktik}
                    </p>
                    <p className='mt-2 text-xs text-foreground/90 leading-relaxed font-normal'>
                      Dokter sedang dalam masa{' '}
                      <strong className='font-semibold text-foreground'>{dayLeaveReason}</strong>.
                      Seluruh antrian dan aktivitas praktik ditutup sementara pada tanggal ini.
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className='p-3.5 sm:p-4 space-y-4'>
          {activeSessions.length === 0 ? (
            <div className='py-12 px-4 text-center rounded-xl border border-dashed border-border/60 bg-background/50 space-y-2'>
              <Icons.calendar className='size-8 text-muted-foreground/60 mx-auto' />
              <h3 className='text-sm font-bold text-foreground'>
                Belum ada sesi praktik terdaftar
              </h3>
              <p className='text-xs text-muted-foreground max-w-sm mx-auto'>
                Dokter ini belum memiliki sesi shift praktik pada tanggal ini. Tekan tombol
                &quot;Tambah Sesi&quot; untuk menambahkan jadwal.
              </p>
              {!readOnly && !isDayCuti && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  shape='pill'
                  onClick={() => setIsAddModalOpen(true)}
                  className='mt-2 text-xs'
                >
                  <Icons.add className='size-3.5 mr-1.5' />
                  Tambah Sesi Sekarang
                </Button>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {activeSessions.map((session, sIdx) => {
                const intervals: TimelineInterval[] =
                  doctor?.timeline_intervals && doctor.timeline_intervals.length > 0
                    ? (() => {
                        const filtered = doctor.timeline_intervals.filter(
                          (i) =>
                            i.startTime >= session.jam_mulai && i.endTime <= session.jam_selesai
                        );
                        return filtered.length > 0
                          ? filtered
                          : deriveIntervalsForSession(session, policyDuration);
                      })()
                    : deriveIntervalsForSession(session, policyDuration);

                return (
                  <DoctorGanttSessionLane
                    key={session.id || sIdx}
                    session={session}
                    intervals={intervals}
                    readOnly={readOnly}
                    onOpenReschedule={handleOpenReschedule}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className='px-4 py-3 border-t border-border/30 bg-muted/5 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-bold'>
          <div className='flex items-center gap-2'>
            <span className='size-2.5 rounded-full bg-emerald-500' />
            <span className='text-emerald-700 dark:text-emerald-400'>Buka (Tersedia)</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='size-2.5 rounded-full bg-sky-500' />
            <span className='text-sky-700 dark:text-sky-400'>Terisi (Ada Antrian Pasien)</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='size-2.5 rounded-full bg-slate-400' />
            <span className='text-muted-foreground'>Tutup (Cuti / Non-Aktif)</span>
          </div>
        </div>
      </div>

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
          initialDate={formattedDateParam}
          onViewDoctorSchedule={onViewDoctorSchedule}
        />
      )}

      {doctor && (
        <DoctorAddSessionModal
          doctor={doctor}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          portalContainerRef={modalContainerRef}
          targetDate={formattedDateParam}
          onViewDoctorSchedule={onViewDoctorSchedule}
        />
      )}
    </>
  );
}
