'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { resolveDayStatus, type SimpleScheduleStatus } from '../utils/leave-calculator';
import type { DoctorSchedule } from '../api/types';

// ============================================================================
// 1. DATA CONTRACTS (Binary Admin: Buka vs Tutup; Cuti = Data Dokter)
// ============================================================================

export interface DoctorTimelineCalendarProps {
  doctor?: DoctorSchedule;
  selectedDay?: number;
  onSelectDay?: (day: number) => void;
  currentMonth?: number;
  onMonthChange?: (month: number) => void;
  currentYear?: number;
  onYearChange?: (year: number) => void;
  onSelectDayStatus?: (day: number, status: 'buka' | 'tutup', notes?: string) => void;
  onNavigateToDailyGrid?: (day: number) => void;
  readOnly?: boolean;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

// ============================================================================
// 2. CONFIG 3 STATUS: HIJAU = BUKA, BIRU = CUTI, ABU = TUTUP (PENUH ELIMINATED)
// ============================================================================

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

const AVAILABLE_YEARS = [2024, 2025, 2026, 2027];
const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const STATUS_CONFIG: Record<
  SimpleScheduleStatus,
  {
    label: string;
    cellBg: string;
    border: string;
    text: string;
    dotBg: string;
  }
> = {
  // Hijau = Buka
  buka: {
    label: 'Buka',
    cellBg: 'bg-success-subtle hover:bg-success-subtle/80',
    border: 'border-success-border',
    text: 'text-success',
    dotBg: 'bg-success'
  },
  // Biru/Info = Cuti
  cuti: {
    label: 'Cuti',
    cellBg: 'bg-info-subtle hover:bg-info-subtle/80',
    border: 'border-info-border',
    text: 'text-info',
    dotBg: 'bg-info'
  },
  // Abu = Tutup (Tidak Beroperasi / Belum Diatur)
  tutup: {
    label: 'Tutup',
    cellBg: 'bg-muted/30 hover:bg-muted/40',
    border: 'border-border/50',
    text: 'text-muted-foreground',
    dotBg: 'bg-muted-foreground/40'
  }
};

// Helper & Status Types: Tentukan status nilai (buka / cuti / tutup) untuk hari tertentu
export { resolveDayStatus, type SimpleScheduleStatus };


// ============================================================================
// 3. MASTER COMPONENT: STANDARD MONTHLY CALENDAR
// ============================================================================

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
  className
}: DoctorTimelineCalendarProps) {
  // Real Date instance dari script asli
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

  const handleStatusChange = (day: number, status: 'buka' | 'tutup') => {
    if (status === 'tutup') {
      setClosingDay(day);
      setCloseNotes('');
      setIsCloseModalOpen(true);
    } else {
      onSelectDayStatus?.(day, 'buka');
    }
  };

  const handleConfirmClose = () => {
    if (closingDay !== null) {
      onSelectDayStatus?.(closingDay, 'tutup', closeNotes.trim() || undefined);
    }
    setIsCloseModalOpen(false);
    setClosingDay(null);
    setCloseNotes('');
  };

  const getStatusForDay = (day: number): SimpleScheduleStatus => {
    return resolveDayStatus(day, doctor);
  };

  // Dynamic calendar calculations
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  // Convert Sunday (0) to 6, Monday (1) to 0
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

  // Helper untuk mengecek apakah suatu tanggal sudah berlalu (Past Date)
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
        'w-full bg-card text-card-foreground border border-border/50 rounded-2xl shadow-xs font-sans overflow-hidden flex flex-col select-none',
        className
      )}
    >
      {/* 1. HEADER KALENDER DENGAN TOOLBOX */}
      <div className='p-3.5 sm:p-4 border-b border-border/40 flex flex-wrap items-center justify-between gap-3 bg-muted/10'>
        {/* Left: Teks Bulan & Tahun + Tombol Hari Ini */}
        <div className='flex items-center gap-3'>
          <h2 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <button
            type='button'
            onClick={handleToday}
            className='px-3 py-1 text-xs font-semibold rounded-full border border-border/60 bg-background hover:bg-muted text-foreground/85 hover:text-foreground transition-colors shadow-2xs cursor-pointer'
          >
            Hari Ini
          </button>
        </div>

        {/* Right: Toolbox Pemilih Bulan, Tahun & Navigasi Panah */}
        <div className='flex items-center gap-2 flex-wrap'>
          {/* Dropdown Bulan */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type='button'
                className='inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border/50 bg-background hover:bg-muted text-xs font-semibold text-foreground/90 shadow-2xs transition-colors cursor-pointer'
              >
                <span>{MONTH_NAMES[currentMonth]}</span>
                <Icons.chevronDown className='size-3 text-muted-foreground' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-36 max-h-56 overflow-y-auto'>
              {MONTH_NAMES.map((name, index) => (
                <DropdownMenuItem
                  key={name}
                  onClick={() => setCurrentMonth(index)}
                  className={cn(
                    'text-xs font-medium cursor-pointer',
                    currentMonth === index && 'bg-primary/10 text-primary font-bold'
                  )}
                >
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dropdown Tahun */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type='button'
                className='inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border/50 bg-background hover:bg-muted text-xs font-semibold text-foreground/90 shadow-2xs transition-colors cursor-pointer'
              >
                <span>{currentYear}</span>
                <Icons.chevronDown className='size-3 text-muted-foreground' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-28'>
              {AVAILABLE_YEARS.map((year) => (
                <DropdownMenuItem
                  key={year}
                  onClick={() => setCurrentYear(year)}
                  className={cn(
                    'text-xs font-medium cursor-pointer',
                    currentYear === year && 'bg-primary/10 text-primary font-bold'
                  )}
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tombol Panah Prev / Next */}
          <div className='flex items-center border border-border/50 rounded-lg bg-background p-0.5 shadow-2xs'>
            <button
              type='button'
              onClick={handlePrevMonth}
              className='size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
              aria-label='Bulan Sebelumnya'
            >
              <Icons.chevronLeft className='size-4' />
            </button>
            <button
              type='button'
              onClick={handleNextMonth}
              className='size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
              aria-label='Bulan Berikutnya'
            >
              <Icons.chevronRight className='size-4' />
            </button>
          </div>
        </div>
      </div>

      {/* 2. ACCORDION / COLLAPSIBLE SEGMENTED: "Lihat kenapa dokter ini cuti [chevron]" */}
      {isDoctorCuti && (
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
                  {/* Corner Badge Icon */}
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

                  {/* Leave Message Text */}
                  <div className='mt-2 text-xs text-foreground/90 leading-relaxed font-normal'>
                    Dokter sedang dalam masa{' '}
                    <strong className='font-semibold text-foreground'>
                      {doctor?.cuti_reason || 'Cuti Operasional'}
                    </strong>
                    . Seluruh aktivitas praktik dan konsultasi ditutup sementara pada periode
                    terkait.
                  </div>

                  {/* Context Date Pill */}
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

      {/* 3. GRID KALENDER STANDAR */}
      <div className='p-3.5 sm:p-4 space-y-2.5'>
        {/* Header Nama Hari */}
        <div className='grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-muted-foreground pb-1.5 border-b border-border/40'>
          {DAY_NAMES.map((d) => (
            <div key={d} className='py-1'>
              {d}
            </div>
          ))}
        </div>

        {/* Kotak Tanggal (7 Kolom) */}
        <div className='grid grid-cols-7 gap-1.5'>
          {/* Kotak kosong awal bulan */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className='min-h-[58px] sm:min-h-[64px] rounded-xl border border-dashed border-border/25 bg-muted/5 opacity-30'
            />
          ))}

          {/* Hari Kalender */}
          {Array.from({ length: totalDays }, (_, i) => {
            const day = i + 1;
            const status = getStatusForDay(day);
            const cfg = STATUS_CONFIG[status];
            const isPast = checkIsPast(day);
            const isSelected = selectedDay === day;

            // 1. Tanggal yang Sudah Berlalu (Disable)
            if (isPast) {
              return (
                <div
                  key={day}
                  className='w-full min-h-[58px] sm:min-h-[64px] rounded-xl border border-border/20 bg-muted/10 p-2 flex flex-col justify-between text-left opacity-35 cursor-not-allowed select-none'
                  title='Tanggal telah berlalu'
                >
                  <div className='flex items-center justify-between'>
                    <span className='text-xs sm:text-sm tabular-nums font-medium text-muted-foreground'>
                      {day}
                    </span>
                    <span className='size-1.5 rounded-full bg-muted-foreground/40' />
                  </div>
                  <span className='text-[10px] sm:text-[11px] font-medium text-muted-foreground/60'>
                    Selesai
                  </span>
                </div>
              );
            }

            // 2. Tanggal Aktif / Mendatang (Semua seragam dengan status warnanya)
            const cellContent = (
              <div
                className={cn(
                  'w-full min-h-[58px] sm:min-h-[64px] rounded-xl border p-2 flex flex-col justify-between transition-all text-left relative cursor-pointer group/cell',
                  cfg.cellBg,
                  cfg.border,
                  isSelected && 'ring-2 ring-primary/40 shadow-xs'
                )}
              >
                {/* Baris Atas: Tanggal & Indikator Titik */}
                <div className='flex items-center justify-between'>
                  <span className='text-xs sm:text-sm tabular-nums font-bold leading-none text-foreground'>
                    {day}
                  </span>
                  <span className={cn('size-2 rounded-full shrink-0', cfg.dotBg)} />
                </div>

                {/* Baris Bawah: Status Text Berwarna + Tombol Icon Diagonal Arrow ↗ */}
                <div className='mt-1 flex items-center justify-between gap-1'>
                  <span
                    className={cn(
                      'text-[10px] sm:text-[11.5px] font-bold leading-none select-none tracking-tight block',
                      cfg.text
                    )}
                  >
                    {cfg.label}
                  </span>

                  {onNavigateToDailyGrid && (
                    <span
                      role='button'
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDay(day);
                        onNavigateToDailyGrid(day);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          setSelectedDay(day);
                          onNavigateToDailyGrid(day);
                        }
                      }}
                      title={`Buka Jadwal & Kuota tanggal ${day}`}
                      className='size-4 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-primary hover:bg-background/90 transition-all opacity-60 group-hover/cell:opacity-100 cursor-pointer shrink-0'
                    >
                      <Icons.arrowUpRight className='size-3 stroke-[2.5]' />
                    </span>
                  )}
                </div>
              </div>
            );

            if (readOnly) {
              return (
                <button
                  key={day}
                  type='button'
                  onClick={() => setSelectedDay(day)}
                  className='w-full text-left outline-none'
                >
                  {cellContent}
                </button>
              );
            }

            return (
              <DropdownMenu key={day}>
                <DropdownMenuTrigger asChild onClick={() => setSelectedDay(day)}>
                  <button type='button' className='w-full text-left outline-none'>
                    {cellContent}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='center' className='w-44'>
                  {onNavigateToDailyGrid && (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedDay(day);
                          onNavigateToDailyGrid(day);
                        }}
                        className='text-xs font-bold text-primary flex items-center justify-between cursor-pointer'
                      >
                        <span>Lihat Jadwal Harian</span>
                        <Icons.arrowUpRight className='size-3.5 stroke-[2.2]' />
                      </DropdownMenuItem>
                      <div className='h-px bg-border/40 my-1' />
                    </>
                  )}
                  <div className='px-2 py-1 text-[10px] font-semibold text-muted-foreground'>
                    Ubah status tanggal {day} {MONTH_NAMES[currentMonth]}:
                  </div>
                  {(['buka', 'tutup'] as const).map((st) => {
                    const itemCfg = STATUS_CONFIG[st];
                    return (
                      <DropdownMenuItem
                        key={st}
                        onClick={() => handleStatusChange(day, st)}
                        className='text-xs font-bold flex items-center justify-between cursor-pointer'
                      >
                        <div className='flex items-center gap-2'>
                          <span className={cn('size-2 rounded-full', itemCfg.dotBg)} />
                          <span className={itemCfg.text}>{itemCfg.label}</span>
                        </div>
                        {status === st && <span className='text-primary'>✓</span>}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </div>
      </div>

      {/* 3. FOOTER LEGEND (3 STATUS: BUKA, CUTI, TUTUP) */}
      <div className='px-4 py-3 border-t border-border/30 bg-muted/5 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-bold'>
        <div className='flex items-center gap-2'>
          <span className='size-2.5 rounded-full bg-emerald-500' />
          <span className='text-emerald-700 dark:text-emerald-400'>Buka</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='size-2.5 rounded-full bg-sky-500' />
          <span className='text-sky-700 dark:text-sky-400'>Cuti</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='size-2.5 rounded-full bg-muted-foreground/50' />
          <span className='text-muted-foreground'>Tutup</span>
        </div>
      </div>

      {/* 4. MODAL KONFIRMASI PENUTUPAN HARI */}
      <ModalWrapper
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        maxWidth='max-w-[480px]'
        showCloseButton={false}
        portalContainerRef={portalContainerRef}
      >
        <div className='relative font-sans space-y-4 text-left'>
          {/* Header */}
          <div className='flex items-start justify-between gap-3 pb-3 border-b border-border/40'>
            <div className='space-y-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-destructive/20 bg-destructive/10 text-destructive'>
                  <Icons.warning className='size-3' />
                  <span>Konfirmasi Tutup Hari</span>
                </span>
              </div>
              <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
                Tutup Jadwal Tanggal {closingDay} {MONTH_NAMES[currentMonth]} {currentYear}
              </h3>
              <p className='text-xs text-muted-foreground'>
                {doctor?.nama_dokter || 'Dokter'}
              </p>
            </div>
            <button
              type='button'
              onClick={() => setIsCloseModalOpen(false)}
              aria-label='Tutup'
              className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0'
            >
              <Icons.close className='size-4' />
            </button>
          </div>

          {/* Warning Banner */}
          <div className='rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 space-y-2 text-xs text-foreground/90'>
            <div className='flex items-start gap-2.5'>
              <Icons.alertCircle className='size-4 text-destructive shrink-0 mt-0.5' />
              <div className='space-y-1 leading-relaxed'>
                <p className='font-semibold text-destructive'>
                  Perhatian: Tindakan ini berdampak pada sesi & antrean aktif.
                </p>
                <p className='text-muted-foreground text-[11.5px] leading-normal'>
                  Menutup hari ini akan menonaktifkan seluruh sesi shift dokter dan secara otomatis
                  membatalkan (soft-delete) antrean pasien yang telah terdaftar pada tanggal ini.
                </p>
              </div>
            </div>
          </div>

          {/* Notes Input */}
          <div className='space-y-1.5'>
            <Label htmlFor='close-day-notes' className='text-xs font-semibold text-foreground'>
              Catatan Penutupan <span className='text-muted-foreground font-normal'>(Opsional)</span>
            </Label>
            <Input
              id='close-day-notes'
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              placeholder='Contoh: Dokter ada keperluan mendadak / Cuti operasional'
              className='text-xs h-9'
            />
            <p className='text-[10.5px] text-muted-foreground'>
              Catatan ini akan dicatat dalam riwayat audit dan alasan pembatalan sesi antrean.
            </p>
          </div>

          {/* Footer Actions */}
          <div className='flex items-center justify-end gap-2 pt-2 border-t border-border/40'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setIsCloseModalOpen(false)}
              className='text-xs font-semibold'
            >
              Batal
            </Button>
            <Button
              type='button'
              variant='destructive'
              size='sm'
              onClick={handleConfirmClose}
              className='text-xs font-semibold gap-1.5'
            >
              <Icons.trash className='size-3.5' />
              <span>Konfirmasi Tutup Jadwal</span>
            </Button>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
}
