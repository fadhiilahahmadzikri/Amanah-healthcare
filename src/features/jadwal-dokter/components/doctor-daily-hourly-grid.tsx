'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DoctorAddSessionModal } from './doctor-add-session-modal';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';

// ============================================================================
// 1. DATA CONTRACTS & STATUS CONFIG
// ============================================================================

export type HourlySlotStatus = 'buka' | 'penuh' | 'tutup' | 'cuti';

export interface DoctorDailyHourlyGridProps {
  doctor?: DoctorSchedule;
  onSelectHourStatus?: (hour: number, status: HourlySlotStatus) => void;
  onAddSchedule?: () => void;
  modalContainerRef?: React.RefObject<HTMLElement | null>;
  readOnly?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<
  HourlySlotStatus,
  {
    label: string;
    cellBg: string;
    border: string;
    text: string;
    dotBg: string;
  }
> = {
  buka: {
    label: 'Buka',
    cellBg: 'bg-emerald-500/5 dark:bg-emerald-950/20 hover:bg-emerald-500/10',
    border: 'border-emerald-500/25 dark:border-emerald-700/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    dotBg: 'bg-emerald-500'
  },
  penuh: {
    label: 'Penuh',
    cellBg: 'bg-amber-500/5 dark:bg-amber-950/20 hover:bg-amber-500/10',
    border: 'border-amber-500/25 dark:border-amber-700/30',
    text: 'text-amber-600 dark:text-amber-400',
    dotBg: 'bg-amber-500'
  },
  tutup: {
    label: 'Tutup',
    cellBg: 'bg-muted/10 dark:bg-muted/5 hover:bg-muted/20',
    border: 'border-border/40 dark:border-border/30',
    text: 'text-muted-foreground/75',
    dotBg: 'bg-muted-foreground/40'
  },
  cuti: {
    label: 'Cuti',
    cellBg: 'bg-sky-500/5 dark:bg-sky-950/20 hover:bg-sky-500/10',
    border: 'border-sky-500/25 dark:border-sky-700/30',
    text: 'text-sky-600 dark:text-sky-400',
    dotBg: 'bg-sky-500'
  }
};

// 4 Shift Periode 24 Jam (Y-Axis)
const SHIFTS = [
  {
    id: 'pagi',
    name: 'Pagi',
    range: '06:00 - 12:00',
    hours: [6, 7, 8, 9, 10, 11]
  },
  {
    id: 'siang',
    name: 'Siang / Sore',
    range: '12:00 - 18:00',
    hours: [12, 13, 14, 15, 16, 17]
  },
  {
    id: 'malam',
    name: 'Malam',
    range: '18:00 - 24:00',
    hours: [18, 19, 20, 21, 22, 23]
  },
  {
    id: 'dini-hari',
    name: 'Dini Hari',
    range: '00:00 - 06:00',
    hours: [0, 1, 2, 3, 4, 5]
  }
];

// Helper: Tentukan status jam awal berdasarkan sesi dokter
function getInitialHourStatus(
  hour: number,
  doctor?: DoctorSchedule,
  extraSessions: DoctorDailySession[] = []
): HourlySlotStatus {
  const isDoctorCuti = Boolean(
    doctor?.is_cuti ||
    doctor?.status_dokter === 'Cuti' ||
    doctor?.status_jadwal === 'Cuti' ||
    doctor?.status_jadwal === 'Cuti / Tutup'
  );

  // Jika dokter berstatus cuti, maka 1 hari penuh adalah Cuti
  if (isDoctorCuti) return 'cuti';

  const allSessions = [...(doctor?.sesi_harian || []), ...extraSessions];

  // Cek apakah jam ini masuk ke salah satu sesi harian dokter
  const matchingSession = allSessions.find((s) => {
    const startHour = parseInt(s.jam_mulai.split(':')[0], 10);
    const endHour = parseInt(s.jam_selesai.split(':')[0], 10);
    return hour >= startHour && hour <= endHour;
  });

  if (matchingSession) {
    if (matchingSession.status_sesi === 'Penuh' || matchingSession.slot_tersedia <= 0)
      return 'penuh';
    if (matchingSession.status_sesi === 'Cuti') return 'tutup';
    return 'buka';
  }

  // Jika dokter memiliki sesi spesifik yang terdaftar, jam di luar sesi adalah Tutup
  if (allSessions.length > 0) {
    return 'tutup';
  }

  // Jam default aktif biasa jika dokter belum memiliki konfigurasi sesi eksplisit
  if ((hour >= 8 && hour <= 11) || (hour >= 14 && hour <= 17) || (hour >= 19 && hour <= 21)) {
    return 'buka';
  }

  return 'tutup';
}

// ============================================================================
// 2. MASTER COMPONENT: 24-HOUR DAILY HOURLY GRID
// ============================================================================

export function DoctorDailyHourlyGrid({
  doctor,
  onSelectHourStatus,
  onAddSchedule,
  modalContainerRef,
  readOnly = false,
  className
}: DoctorDailyHourlyGridProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(new Date().getHours());
  const [hourlyOverrides, setHourlyOverrides] = useState<Record<number, HourlySlotStatus>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [extraSessions, setExtraSessions] = useState<DoctorDailySession[]>([]);
  const [isReasonOpen, setIsReasonOpen] = useState(false);

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

  const handleHourStatusChange = (hour: number, status: HourlySlotStatus) => {
    if (isDoctorCuti) return;
    setHourlyOverrides((prev) => ({ ...prev, [hour]: status }));
    onSelectHourStatus?.(hour, status);
  };

  const handleSessionAdded = (newSession: DoctorDailySession) => {
    setExtraSessions((prev) => [...prev, newSession]);
    const startHour = parseInt(newSession.jam_mulai.split(':')[0], 10);
    const endHour = parseInt(newSession.jam_selesai.split(':')[0], 10);
    const newOverrides: Record<number, HourlySlotStatus> = {};
    for (let h = startHour; h <= endHour; h++) {
      newOverrides[h] =
        newSession.status_sesi === 'Buka'
          ? 'buka'
          : newSession.status_sesi === 'Penuh'
            ? 'penuh'
            : 'tutup';
    }
    setHourlyOverrides((prev) => ({ ...prev, ...newOverrides }));
  };

  const openAddSessionModal = () => {
    if (isDoctorCuti) return;
    onAddSchedule?.();
    setIsAddModalOpen(true);
  };

  const resolveHourStatus = (hour: number): HourlySlotStatus => {
    if (isDoctorCuti) return 'cuti';
    if (hourlyOverrides[hour]) return hourlyOverrides[hour];
    return getInitialHourStatus(hour, doctor, extraSessions);
  };

  const currentHour = new Date().getHours();

  const extraCapacity = extraSessions.reduce((acc, s) => acc + s.kuota_pasien, 0);
  const extraSlots = extraSessions.reduce((acc, s) => acc + s.slot_tersedia, 0);
  const totalCapacity = (doctor?.kapasitas_per_hari || 0) + extraCapacity;
  const totalSlots = isDoctorCuti ? 0 : (doctor?.slot_tersedia || 0) + extraSlots;

  return (
    <>
      <div
        className={cn(
          'w-full bg-card text-card-foreground border border-border/50 rounded-2xl shadow-xs font-sans overflow-hidden flex flex-col select-none',
          className
        )}
      >
        {/* 1. Header Grid: Judul "Jadwal hari ini" & Teks Slot Tersedia Horisontal / Sejajar */}
        <div className='p-3.5 sm:p-4 border-b border-border/40 flex items-center justify-between gap-3 bg-muted/10'>
          <div className='flex items-center gap-2.5 sm:gap-3 flex-wrap'>
            <h2 className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
              Jadwal hari ini
            </h2>
            {!isDoctorCuti && (
              <>
                <Separator orientation='vertical' className='h-4 bg-border/70 hidden sm:block' />
                <span className='text-xs font-mono font-medium text-muted-foreground'>
                  <strong className='text-primary font-bold'>{totalSlots}</strong> / {totalCapacity}{' '}
                  slot tersedia
                </span>
              </>
            )}
          </div>

          {!readOnly && !isDoctorCuti && (
            <button
              type='button'
              onClick={openAddSessionModal}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-dashed border-border/80 hover:border-primary/70 bg-background hover:bg-primary/5 text-foreground/80 hover:text-primary transition-all shadow-2xs cursor-pointer select-none shrink-0'
            >
              <Icons.add className='size-3.5' />
              <span>Tambah jadwal</span>
            </button>
          )}
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

        {/* 3. Body Grid: X-Axis (Jam per Shift) & Y-Axis (4 Shift Periode) */}
        <div className='p-3.5 sm:p-4 space-y-4 overflow-x-auto'>
          {SHIFTS.map((shift) => (
            <div key={shift.id} className='space-y-1.5'>
              {/* Y-Axis Shift Header */}
              <div className='flex items-center justify-between text-xs font-bold text-muted-foreground pb-1 border-b border-border/30'>
                <span className='text-foreground font-bold'>{shift.name}</span>
                <span className='font-mono font-medium text-[11px] text-muted-foreground/80'>
                  {shift.range}
                </span>
              </div>

              {/* X-Axis: 6 Kolom Jam per Shift */}
              <div className='grid grid-cols-6 gap-1.5'>
                {shift.hours.map((h) => {
                  const hourStr = `${String(h).padStart(2, '0')}:00`;
                  const status = resolveHourStatus(h);
                  const cfg = STATUS_CONFIG[status];
                  const isNow = h === currentHour;
                  const isSelected = selectedHour === h;

                  const cellContent = (
                    <div
                      className={cn(
                        'w-full min-h-[52px] sm:min-h-[56px] rounded-xl border p-2 flex flex-col justify-between transition-all text-left relative',
                        cfg.cellBg,
                        cfg.border,
                        isDoctorCuti ? 'cursor-default opacity-90' : 'cursor-pointer',
                        isSelected && 'ring-2 ring-primary/40 shadow-xs',
                        isNow && 'ring-1 ring-primary font-bold'
                      )}
                    >
                      {/* Baris Atas: Jam & Indikator Titik */}
                      <div className='flex items-center justify-between'>
                        <span
                          className={cn(
                            'text-xs sm:text-[13px] font-mono font-bold leading-none',
                            isNow ? 'text-primary font-black' : 'text-foreground'
                          )}
                        >
                          {hourStr}
                        </span>
                        <span className={cn('size-2 rounded-full shrink-0', cfg.dotBg)} />
                      </div>

                      {/* Baris Bawah: Status Text Berwarna */}
                      <div className='mt-1 flex items-center justify-between'>
                        <span
                          className={cn(
                            'text-[10.5px] sm:text-[11px] font-bold leading-none select-none tracking-tight block',
                            cfg.text
                          )}
                        >
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );

                  if (readOnly || isDoctorCuti) {
                    return (
                      <button
                        key={h}
                        type='button'
                        onClick={() => setSelectedHour(h)}
                        className='w-full text-left outline-none'
                      >
                        {cellContent}
                      </button>
                    );
                  }

                  return (
                    <DropdownMenu key={h}>
                      <DropdownMenuTrigger asChild onClick={() => setSelectedHour(h)}>
                        <button type='button' className='w-full text-left outline-none'>
                          {cellContent}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='center' className='w-40'>
                        <div className='px-2 py-1 text-[10px] font-semibold text-muted-foreground'>
                          Status Jam {hourStr}:
                        </div>
                        {(['buka', 'penuh', 'tutup'] as HourlySlotStatus[]).map((st) => {
                          const itemCfg = STATUS_CONFIG[st];
                          return (
                            <DropdownMenuItem
                              key={st}
                              onClick={() => handleHourStatusChange(h, st)}
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
          ))}

          {/* 3. Placeholder Tambah Jadwal di Akhir Grid */}
          {!readOnly && !isDoctorCuti && (
            <div className='pt-1'>
              <button
                type='button'
                onClick={openAddSessionModal}
                className='w-full py-2.5 px-3 rounded-xl border border-dashed border-border/70 hover:border-primary/60 bg-muted/5 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer shadow-2xs group select-none'
              >
                <Icons.add className='size-3.5 group-hover:scale-110 transition-transform' />
                <span>Tambah jadwal</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. Footer Legend */}
        <div className='px-4 py-3 border-t border-border/30 bg-muted/5 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-bold'>
          <div className='flex items-center gap-2'>
            <span className='size-2.5 rounded-full bg-emerald-500' />
            <span className='text-emerald-700 dark:text-emerald-400'>Buka</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='size-2.5 rounded-full bg-amber-500' />
            <span className='text-amber-700 dark:text-amber-400'>Penuh</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='size-2.5 rounded-full bg-muted-foreground/60' />
            <span className='text-muted-foreground'>Tutup</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='size-2.5 rounded-full bg-sky-500' />
            <span className='text-sky-700 dark:text-sky-400'>Cuti (1 Hari)</span>
          </div>
        </div>
      </div>

      {/* Modal Tambah Sesi Jadwal Praktik */}
      {doctor && (
        <DoctorAddSessionModal
          doctor={doctor}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSessionAdded={handleSessionAdded}
          portalContainerRef={modalContainerRef}
        />
      )}
    </>
  );
}
