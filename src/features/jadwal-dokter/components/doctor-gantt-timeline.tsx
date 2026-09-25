'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DoctorRescheduleSessionModal } from './doctor-reschedule-session-modal';
import { DoctorAddSessionModal } from './doctor-add-session-modal';
import { DoctorEditSessionModal } from './doctor-edit-session-modal';
import { isDoctorOnLeaveOnDay } from '../api/service';
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

/**
 * Helper to generate serialized interval slices for a session
 * when backend hasn't pre-sliced them (30-min default increment)
 */
function deriveIntervalsForSession(
  session: DoctorDailySession,
  consultationDuration: number = 30
): TimelineInterval[] {
  const [startH, startM] = session.jam_mulai.split(':').map((v) => parseInt(v, 10) || 0);
  const [endH, endM] = session.jam_selesai.split(':').map((v) => parseInt(v, 10) || 0);

  const startTotalMinutes = startH * 60 + startM;
  let endTotalMinutes = endH * 60 + endM;
  if (endTotalMinutes <= startTotalMinutes) {
    endTotalMinutes += 24 * 60; // Handle overnight shift
  }

  const duration = consultationDuration > 0 ? consultationDuration : 30;
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

    const isOccupied = session.status_sesi === 'Penuh' || idx < occupiedCount;
    const isClosed = session.status_sesi === 'Tutup' || session.status_sesi === 'Cuti';

    const status: 'OPEN' | 'OCCUPIED' | 'CLOSED' = isClosed
      ? 'CLOSED'
      : isOccupied
        ? 'OCCUPIED'
        : 'OPEN';

    intervals.push({
      intervalIndex: idx + 1,
      startTime,
      endTime,
      status,
      displayLabel: `${startTime} - ${endTime}`,
      isOccupied: status === 'OCCUPIED',
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
  className
}: DoctorGanttTimelineProps) {
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

  // Modals state
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedSessionForReschedule, setSelectedSessionForReschedule] =
    useState<DoctorDailySession | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<DoctorDailySession | null>(null);
  const [isReasonOpen, setIsReasonOpen] = useState(false);

  // Leave status
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

  // Aggregate totals
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

  const handleOpenEditSession = (session: DoctorDailySession) => {
    setEditingSession(session);
    setIsEditModalOpen(true);
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
        {/* 1. Header Toolbar: Tanggal & Day Navigation Toolbox */}
        <div className='p-3.5 sm:p-4 border-b border-border/40 flex items-center justify-between gap-3 bg-muted/10'>
          {/* Left: Typographic Date & Quota */}
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
                onClick={() => setIsAddModalOpen(true)}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-dashed border-border/80 hover:border-primary/70 bg-background hover:bg-primary/5 text-foreground/80 hover:text-primary transition-all shadow-2xs cursor-pointer select-none shrink-0'
              >
                <Icons.add className='size-3.5' />
                <span>Tambah Sesi</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Collapsible: Alasan Cuti (jika dokter cuti) */}
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

        {/* 3. Gantt Chart Body: Y-Axis (Sesi & Ruang) & X-Axis (Milestone Intervals) */}
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
                // Determine intervals for this session:
                // Use backend projected intervals if provided, or derive accurately with 30-min default slices
                const intervals: TimelineInterval[] =
                  doctor?.timeline_intervals && doctor.timeline_intervals.length > 0
                    ? (() => {
                        const filtered = doctor.timeline_intervals.filter(
                          (i) =>
                            i.startTime >= session.jam_mulai && i.endTime <= session.jam_selesai
                        );
                        return filtered.length > 0
                          ? filtered
                          : deriveIntervalsForSession(session, 30);
                      })()
                    : deriveIntervalsForSession(session, 30);

                return (
                  <div
                    key={session.id || sIdx}
                    className='rounded-xl border border-border/60 bg-card overflow-hidden shadow-2xs'
                  >
                    {/* Session Lane Header (Y-Axis Identity & Actions) */}
                    <div className='p-3 bg-muted/20 border-b border-border/40 flex flex-wrap items-center justify-between gap-3'>
                      <div className='flex items-center gap-2.5 flex-wrap min-w-0'>
                        <div className='flex items-center gap-1.5'>
                          <span className='size-2 rounded-full bg-primary' />
                          <h4 className='text-xs sm:text-[13px] font-bold text-foreground tracking-tight'>
                            {session.nama_sesi}
                          </h4>
                        </div>
                        <span className='font-mono text-xs px-2 py-0.5 rounded-md bg-background border border-border/50 text-foreground font-semibold'>
                          {session.waktu || `${session.jam_mulai} - ${session.jam_selesai}`}
                        </span>
                        <span className='text-xs text-muted-foreground truncate'>
                          • {session.ruang || doctor?.ruang_praktik}
                        </span>
                      </div>

                      {/* Lane Actions */}
                      <div className='flex items-center gap-2 shrink-0'>
                        {!readOnly && (
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            shape='pill'
                            onClick={() => handleOpenEditSession(session)}
                            className='h-7 px-3 text-xs font-semibold text-foreground/85 hover:text-foreground'
                            leadingIcon={
                              <Icons.settings className='size-3.5 text-muted-foreground' />
                            }
                          >
                            Atur Sesi
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Gantt Milestone Serialized Timeline (X-Axis) with Horizontal Scroll */}
                    <div className='overflow-x-auto p-3'>
                      <div className='min-w-max flex items-stretch gap-2'>
                        {intervals.map((interval) => {
                          const isOccupied = interval.status === 'OCCUPIED';
                          const isOpen = interval.status === 'OPEN';
                          const isClosed = interval.status === 'CLOSED';

                          const block = (
                            <div
                              className={cn(
                                'w-32 shrink-0 rounded-xl border p-2.5 flex flex-col justify-between gap-2.5 transition-all text-left relative select-none',
                                isOpen &&
                                  'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200 hover:border-emerald-500/50',
                                isOccupied &&
                                  'bg-sky-500/10 border-sky-500/30 text-sky-900 dark:text-sky-200 hover:border-sky-500/50 cursor-pointer shadow-2xs',
                                isClosed &&
                                  'bg-muted/40 border-border/60 text-muted-foreground opacity-80'
                              )}
                            >
                              {/* Top Bar: Clean 24-hour Range & Status Dot */}
                              <div className='flex items-center justify-between gap-1'>
                                <span className='text-[11px] font-mono font-bold leading-none tracking-tight text-foreground'>
                                  {interval.startTime} - {interval.endTime}
                                </span>
                                <span
                                  className={cn(
                                    'size-2 rounded-full shrink-0',
                                    isOpen && 'bg-emerald-500',
                                    isOccupied && 'bg-sky-500 ring-2 ring-sky-500/20',
                                    isClosed && 'bg-slate-400'
                                  )}
                                />
                              </div>

                              {/* Bottom Status & Queue Badge */}
                              <div className='mt-auto pt-1.5 border-t border-current/15 flex items-center justify-between'>
                                <span className='text-[11px] font-bold leading-none'>
                                  {isOpen && 'Buka'}
                                  {isOccupied && 'Terisi'}
                                  {isClosed && (interval.closedReason || 'Tutup')}
                                </span>

                                {isOccupied && interval.appointmentRef?.queueNumber && (
                                  <span className='px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-sky-500 text-white shadow-2xs'>
                                    #{interval.appointmentRef.queueNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          );

                          // If OCCUPIED, make it interactive with a Popover to inspect upstream mobile booking info
                          if (isOccupied && interval.appointmentRef) {
                            return (
                              <Popover key={interval.intervalIndex}>
                                <PopoverTrigger asChild>
                                  <button
                                    type='button'
                                    className='outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl'
                                  >
                                    {block}
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  align='center'
                                  className='w-64 p-3.5 font-sans space-y-2 text-left'
                                  portalContainer={modalContainerRef?.current ?? undefined}
                                >
                                  <div className='flex items-center justify-between border-b border-border/40 pb-2'>
                                    <div className='flex items-center gap-1.5'>
                                      <span className='size-2 rounded-full bg-sky-500' />
                                      <span className='text-xs font-bold text-foreground'>
                                        Antrian Terisi #{interval.appointmentRef.queueNumber}
                                      </span>
                                    </div>
                                    <span className='text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 font-bold'>
                                      {interval.appointmentRef.status || 'CONFIRMED'}
                                    </span>
                                  </div>

                                  <div className='space-y-1.5 text-xs text-muted-foreground'>
                                    <div className='flex items-center justify-between'>
                                      <span>ID Janji:</span>
                                      <span className='font-mono font-semibold text-foreground'>
                                        {interval.appointmentRef.appointmentId}
                                      </span>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                      <span>Waktu Konsultasi:</span>
                                      <span className='font-mono font-semibold text-foreground'>
                                        {interval.startTime} - {interval.endTime}
                                      </span>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                      <span>Sumber Booking:</span>
                                      <span className='font-semibold text-primary'>
                                        Pasien Mobile App
                                      </span>
                                    </div>
                                  </div>

                                  <div className='pt-1 text-[10px] text-muted-foreground/80 italic border-t border-border/30'>
                                    Data antrian sinkron otomatis dari upstream mobile dokter.
                                  </div>
                                </PopoverContent>
                              </Popover>
                            );
                          }

                          return <div key={interval.intervalIndex}>{block}</div>;
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Footer Legend (Buka, Terisi, Tutup) */}
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

      {/* Reschedule Session Modal */}
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
        />
      )}

      {/* Add Session Modal */}
      {doctor && (
        <DoctorAddSessionModal
          doctor={doctor}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          portalContainerRef={modalContainerRef}
          targetDate={formattedDateParam}
        />
      )}

      {/* Edit Session Modal */}
      {doctor && editingSession && (
        <DoctorEditSessionModal
          doctor={doctor}
          session={editingSession}
          isOpen={isEditModalOpen}
          targetDate={formattedDateParam}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingSession(null);
          }}
          onOpenReschedule={(sess) => {
            handleOpenReschedule(sess);
          }}
          portalContainerRef={modalContainerRef}
        />
      )}
    </>
  );
}
