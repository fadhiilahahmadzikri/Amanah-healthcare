'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { DoctorSchedule } from '../api/types';

// ============================================================================
// 1. DATA CONTRACTS (3 STATUS: Buka, Tutup, Cuti)
// ============================================================================

export type SimpleScheduleStatus = 'buka' | 'tutup' | 'cuti';

export interface DoctorTimelineCalendarProps {
  doctor?: DoctorSchedule;
  onSelectDayStatus?: (day: number, status: SimpleScheduleStatus) => void;
  readOnly?: boolean;
  className?: string;
}

// ============================================================================
// 2. CONFIG 3 STATUS: HIJAU = BUKA, MERAH = TUTUP, BIRU = CUTI
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
    cellBg: 'bg-emerald-500/5 dark:bg-emerald-950/20 hover:bg-emerald-500/10',
    border: 'border-emerald-500/25 dark:border-emerald-700/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    dotBg: 'bg-emerald-500'
  },
  // Merah = Tutup
  tutup: {
    label: 'Tutup',
    cellBg: 'bg-rose-500/5 dark:bg-rose-950/20 hover:bg-rose-500/10',
    border: 'border-rose-500/25 dark:border-rose-700/30',
    text: 'text-rose-600 dark:text-rose-400',
    dotBg: 'bg-rose-500'
  },
  // Biru = Cuti
  cuti: {
    label: 'Cuti',
    cellBg: 'bg-sky-500/5 dark:bg-sky-950/20 hover:bg-sky-500/10',
    border: 'border-sky-500/25 dark:border-sky-700/30',
    text: 'text-sky-600 dark:text-sky-400',
    dotBg: 'bg-sky-500'
  }
};

// Helper: Tentukan status 3 nilai (buka / tutup / cuti) untuk hari tertentu
function resolveDayStatus(dayNumber: number, doctor?: DoctorSchedule): SimpleScheduleStatus {
  if (doctor?.is_cuti && (dayNumber === 25 || dayNumber === 13)) return 'cuti';

  const monthlyItem = doctor?.monthly_schedule?.find((d) => d.day === dayNumber);
  const status = monthlyItem?.status;

  if (status === 'Cuti / Tutup') return 'cuti';
  if (status === 'Tutup' || status === 'Off') return 'tutup';
  if (status === 'Aktif' || status === 'Sebagian') return 'buka';

  if (doctor?.status_jadwal === 'Tutup' && dayNumber === new Date().getDate()) return 'tutup';

  return 'buka';
}

// ============================================================================
// 3. MASTER COMPONENT: STANDARD MONTHLY CALENDAR
// ============================================================================

export function DoctorTimelineCalendar({
  doctor,
  onSelectDayStatus,
  readOnly = false,
  className
}: DoctorTimelineCalendarProps) {
  // Real Date instance dari script asli
  const today = new Date();
  const realCurrentYear = today.getFullYear();
  const realCurrentMonth = today.getMonth();
  const realCurrentDay = today.getDate();

  const [currentMonth, setCurrentMonth] = useState<number>(realCurrentMonth);
  const [currentYear, setCurrentYear] = useState<number>(realCurrentYear);
  const [selectedDay, setSelectedDay] = useState<number>(realCurrentDay);

  // Optimistic local state for immediate reactive changes
  const [overrideSchedule, setOverrideSchedule] = useState<Record<number, SimpleScheduleStatus>>(
    {}
  );

  const handleStatusChange = (day: number, status: SimpleScheduleStatus) => {
    setOverrideSchedule((prev) => ({ ...prev, [day]: status }));
    onSelectDayStatus?.(day, status);
  };

  const getStatusForDay = (day: number): SimpleScheduleStatus => {
    if (overrideSchedule[day]) {
      return overrideSchedule[day];
    }
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

      {/* 2. GRID KALENDER STANDAR */}
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
                  'w-full min-h-[58px] sm:min-h-[64px] rounded-xl border p-2 flex flex-col justify-between transition-all text-left relative cursor-pointer',
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

                {/* Baris Bawah: Status Text Langsung Berwarna */}
                <div className='mt-1 flex items-center justify-between gap-1'>
                  <span
                    className={cn(
                      'text-[10px] sm:text-[11.5px] font-bold leading-none select-none tracking-tight block',
                      cfg.text
                    )}
                  >
                    {cfg.label}
                  </span>
                </div>
              </div>
            );

            if (readOnly) {
              return (
                <div key={day} onClick={() => setSelectedDay(day)}>
                  {cellContent}
                </div>
              );
            }

            return (
              <DropdownMenu key={day}>
                <DropdownMenuTrigger asChild onClick={() => setSelectedDay(day)}>
                  <button type='button' className='w-full text-left outline-none'>
                    {cellContent}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='center' className='w-40'>
                  <div className='px-2 py-1 text-[10px] font-semibold text-muted-foreground'>
                    Ubah tanggal {day} {MONTH_NAMES[currentMonth]}:
                  </div>
                  {(['buka', 'tutup', 'cuti'] as SimpleScheduleStatus[]).map((st) => {
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

      {/* 3. FOOTER LEGEND (3 STATUS) */}
      <div className='px-4 py-3 border-t border-border/30 bg-muted/5 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-bold'>
        <div className='flex items-center gap-2'>
          <span className='size-2.5 rounded-full bg-emerald-500' />
          <span className='text-emerald-700 dark:text-emerald-400'>Buka</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='size-2.5 rounded-full bg-rose-500' />
          <span className='text-rose-700 dark:text-rose-400'>Tutup</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='size-2.5 rounded-full bg-sky-500' />
          <span className='text-sky-700 dark:text-sky-400'>Cuti</span>
        </div>
      </div>
    </div>
  );
}
