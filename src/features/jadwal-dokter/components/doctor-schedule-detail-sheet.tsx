'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DoctorTimelineCalendar } from './doctor-timeline-calendar';
import { DoctorDailyHourlyGrid } from './doctor-daily-hourly-grid';
import { useUpdateDoctorDayStatusMutation } from '../api/mutations';
import { cn } from '@/lib/utils';
import type { DoctorSchedule, ScheduleDayStatus } from '../api/types';

export interface DoctorScheduleDetailSheetProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (doctor: DoctorSchedule) => void;
}

export function DoctorScheduleDetailSheet({
  doctor,
  isOpen,
  onClose,
  onOpenEdit
}: DoctorScheduleDetailSheetProps) {
  const updateDayMutation = useUpdateDoctorDayStatusMutation();
  const modalContainerRef = React.useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = React.useState<'kalender' | 'kuota' | 'informasi'>('kalender');
  const [selectedDay, setSelectedDay] = React.useState<number>(new Date().getDate());
  const [currentMonth, setCurrentMonth] = React.useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = React.useState<number>(new Date().getFullYear());

  if (!doctor) return null;

  const doctorStatus =
    doctor.is_cuti || doctor.status_dokter === 'Cuti' || doctor.status_jadwal === 'Cuti'
      ? 'Cuti'
      : doctor.slot_tersedia <= 0 || doctor.status_jadwal === 'Penuh'
        ? 'Penuh'
        : 'Buka';

  const doctorStatusConfig = getStatusConfig(doctorStatus);

  const initials = doctor.nama_dokter
    .replace('dr. ', '')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleDayStatusChange = (day: number, status: ScheduleDayStatus) => {
    updateDayMutation.mutate({
      doctorId: doctor.id,
      day,
      status
    });
  };

  const doctorHandle = doctor.nama_dokter
    .toLowerCase()
    .replace(/^(dr\.\s*|drg\.\s*|prof\.\s*)/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/_$/, '');

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side='right'
        showCloseButton={false}
        className='w-full sm:max-w-[680px] lg:max-w-[760px] p-0 flex flex-col gap-0 border-l border-border/50 bg-card text-card-foreground shadow-2xl font-sans'
      >
        {/* 1. Header with Cover Banner & Profile Style */}
        <div className='relative w-full shrink-0 border-b border-border/40 bg-card'>
          {/* Top Banner with dynamic theme gradient */}
          <div className='relative w-full h-24 sm:h-28 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--primary-bright,var(--primary))_28%,transparent)_0%,color-mix(in_oklab,var(--primary-bright,var(--primary))_10%,transparent)_60%,transparent_100%)] overflow-hidden'>
            {/* Custom "<- Kembali" Button */}
            <button
              type='button'
              onClick={onClose}
              className='absolute top-3 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/85 hover:bg-background text-foreground/90 hover:text-foreground text-xs font-semibold backdrop-blur-md border border-border/50 shadow-2xs transition-all cursor-pointer select-none'
            >
              <Icons.chevronLeft className='size-3.5' />
              <span>Kembali</span>
            </button>
          </div>

          {/* Profile Identity Section overlapping banner */}
          <SheetHeader className='px-6 pb-4 pt-0 space-y-0 text-left'>
            {/* Avatar Row */}
            <div className='flex items-end justify-between -mt-10 sm:-mt-11 mb-2.5'>
              <div className='relative shrink-0 size-20 sm:size-22'>
                <Avatar className='size-20 sm:size-22 rounded-full ring-4 ring-card shadow-lg bg-card overflow-hidden shrink-0 aspect-square'>
                  {doctor.avatar && (
                    <AvatarImage
                      src={doctor.avatar}
                      alt={doctor.nama_dokter}
                      className='size-full object-cover object-top aspect-square'
                    />
                  )}
                  <AvatarFallback className='bg-primary/10 text-primary font-bold text-xl'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    'absolute bottom-1 right-1 size-4 rounded-full ring-2 ring-card shadow-xs',
                    doctorStatus === 'Cuti'
                      ? 'bg-sky-500'
                      : doctorStatus === 'Penuh'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  )}
                />
              </div>

              {/* Action: Atur Jadwal (Icon-Based Button replacing bell) */}
              <div className='pb-1'>
                <button
                  type='button'
                  onClick={() => {
                    onClose();
                    onOpenEdit(doctor);
                  }}
                  aria-label='Atur Jadwal Dokter'
                  title='Atur Jadwal Dokter'
                  className='size-9 rounded-full bg-[color-mix(in_oklab,var(--primary-bright,var(--primary))_12%,transparent)] text-[var(--primary-bright,var(--primary))] hover:bg-[var(--primary)] hover:text-primary-foreground flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95'
                >
                  <Icons.edit className='size-4' />
                </button>
              </div>
            </div>

            {/* Name + Badges */}
            <div className='space-y-1'>
              <div className='flex items-center gap-2 flex-wrap'>
                <SheetTitle className='text-lg sm:text-xl font-bold text-foreground tracking-tight'>
                  {doctor.nama_dokter}
                </SheetTitle>

                {/* Verified Badge (Theme-Aware) */}
                <span
                  className='inline-flex items-center justify-center size-5 rounded-full bg-[var(--primary-bright,var(--primary))] text-white shadow-2xs shrink-0'
                  title='Dokter Terverifikasi'
                >
                  <Icons.check className='size-3 stroke-[3]' />
                </span>

                {/* 3D Gradient Pill: Spesialisasi Dokter */}
                <span
                  className='inline-flex items-center gap-1.5 font-sans text-[11.5px] font-bold px-3 py-0.5 rounded-full text-white border select-none shadow-[inset_0_1px_0.5px_0_rgba(255,255,255,0.7),0_2px_5px_-1px_var(--pill-3d-shadow),0_1px_2px_0_rgba(0,0,0,0.1)]'
                  style={{
                    background: 'var(--pill-3d-gradient)',
                    borderColor: 'var(--pill-3d-border)'
                  }}
                >
                  <Icons.pro className='size-3.5 stroke-[2.5] text-white' />
                  <span className='tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]'>
                    {doctor.spesialisasi}
                  </span>
                </span>

                {/* Status Badge (Clinical / Theme Token) */}
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-sm select-none shadow-none',
                    doctorStatusConfig.pillBg,
                    doctorStatusConfig.pillBorder
                  )}
                >
                  <span
                    className={cn(
                      'size-1.5 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
                      doctorStatusConfig.dotGradient
                    )}
                  />
                  <span
                    className={cn(
                      'bg-clip-text text-transparent font-bold tracking-tight',
                      doctorStatusConfig.textGradient
                    )}
                  >
                    {doctorStatusConfig.label}
                  </span>
                </span>
              </div>

              {/* Meta Row: Username Handle (Left) & Lokasi Praktik (Right) */}
              <div className='pt-1.5 flex items-center justify-between gap-3 text-xs'>
                <div className='text-xs text-muted-foreground font-mono truncate'>
                  @{doctorHandle}
                </div>

                <div className='flex items-center gap-1.5 text-xs text-muted-foreground shrink-0'>
                  <Icons.location className='size-3.5 text-primary/70 shrink-0' />
                  <SheetDescription className='text-xs font-semibold text-foreground/90 truncate m-0 p-0 inline'>
                    {doctor.ruang_praktik.startsWith('Poli')
                      ? doctor.ruang_praktik
                      : `Poli ${doctor.spesialisasi}, ${doctor.ruang_praktik}`}
                  </SheetDescription>
                </div>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* 2. Tabs & Scrollable Body Content */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'kalender' | 'kuota' | 'informasi')}
          className='flex-1 flex flex-col min-h-0 gap-0'
        >
          <div className='px-6 pt-3 pb-2 border-b border-border/40 shrink-0 bg-muted/20'>
            <TabsList className='grid w-full grid-cols-3 h-9'>
              <TabsTrigger value='kalender' className='text-xs font-semibold'>
                Kalender
              </TabsTrigger>
              <TabsTrigger value='kuota' className='text-xs font-semibold'>
                Jadwal & Kuota
              </TabsTrigger>
              <TabsTrigger value='informasi' className='text-xs font-semibold'>
                Info Dokter
              </TabsTrigger>
            </TabsList>
          </div>

          <div className='flex-1 overflow-y-auto p-6 space-y-4 select-none'>
            {/* Tab 1: Standard Calendar System */}
            <TabsContent value='kalender' className='m-0 space-y-3 outline-none'>
              <DoctorTimelineCalendar
                doctor={doctor}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                currentYear={currentYear}
                onYearChange={setCurrentYear}
                onNavigateToDailyGrid={(day) => {
                  setSelectedDay(day);
                  setActiveTab('kuota');
                }}
                onSelectDayStatus={(day, st) =>
                  handleDayStatusChange(
                    day,
                    st === 'buka' ? 'Buka' : st === 'cuti' ? 'Cuti' : 'Penuh'
                  )
                }
              />
            </TabsContent>

            {/* Tab 2: Grid Jadwal & Kuota Harian (POV 24 Jam dengan X & Y Axis) */}
            <TabsContent value='kuota' className='m-0 space-y-3 outline-none'>
              <DoctorDailyHourlyGrid
                doctor={doctor}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                currentYear={currentYear}
                onYearChange={setCurrentYear}
                modalContainerRef={modalContainerRef}
              />
            </TabsContent>

            {/* Tab 3: Informasi Kontak & Ruang Praktik */}
            <TabsContent value='informasi' className='m-0 space-y-4 outline-none'>
              <div>
                <span className='text-xs font-normal text-muted-foreground/80 block mb-2'>
                  Informasi kontak & ruang praktik
                </span>
                <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
                  <div className='border-b border-border/40 pb-2'>
                    <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                      Unit fasilitas
                    </span>
                    <span className='text-sm font-medium text-foreground block truncate select-text'>
                      RS Amanah Healthcare
                    </span>
                  </div>

                  <div className='border-b border-border/40 pb-2'>
                    <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                      Spesialisasi
                    </span>
                    <span className='text-sm font-medium text-foreground block truncate select-text'>
                      {doctor.spesialisasi}
                    </span>
                  </div>

                  <div className='border-b border-border/40 pb-2'>
                    <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                      Email dokter
                    </span>
                    <span className='text-sm font-medium text-muted-foreground block truncate font-mono select-text'>
                      {doctor.email}
                    </span>
                  </div>

                  <div className='border-b border-border/40 pb-2'>
                    <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                      Nomor telepon
                    </span>
                    <span className='text-sm font-medium text-muted-foreground block truncate font-mono select-text'>
                      {doctor.nomor_telepon}
                    </span>
                  </div>

                  <div className='border-b border-border/40 pb-2'>
                    <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                      Ruang praktik
                    </span>
                    <span className='text-sm font-medium text-muted-foreground block truncate select-text'>
                      {doctor.ruang_praktik}
                    </span>
                  </div>

                  <div className='border-b border-border/40 pb-2'>
                    <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                      Status dokter
                    </span>
                    <span className='text-sm font-bold text-foreground block truncate select-text'>
                      {doctor.status_dokter}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div ref={modalContainerRef} className='contents' />
      </SheetContent>
    </Sheet>
  );
}
