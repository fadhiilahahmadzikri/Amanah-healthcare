'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { DoctorSchedule } from '../api/types';
import { DOCTOR_CARD_STATUS } from '../utils/doctor-schedule-card-utils';
import { DOCTOR_DETAIL_TAB, type DoctorDetailTab } from '../model/useDoctorDetailDrawerStore';
import {
  useDoctorScheduleDetailSheet,
  type UseDoctorScheduleDetailSheetProps
} from '../model/useDoctorScheduleDetailSheet';
import type { ReturnDoctorContext } from '../model/useDoctorConflictNavigation';
import { DoctorDailySessions } from './doctor-daily-sessions';
import {
  DoctorScheduleSheetContentSkeleton,
  DoctorScheduleSheetSkeleton
} from './doctor-schedule-sheet-skeleton';
import { DoctorTimelineCalendar } from './doctor-timeline-calendar';
import { DoctorScheduleInfoTab } from './sheet/doctor-schedule-info-tab';

export { DOCTOR_DETAIL_TAB, type DoctorDetailTab };

export interface DoctorScheduleDetailSheetProps extends UseDoctorScheduleDetailSheetProps {
  onOpenEdit: (doctor: DoctorSchedule) => void;
  onClearHighlightSlotTime?: () => void;
  onClearOpenPatients?: () => void;
  onClearReturnContext?: () => void;
  onViewDoctorSchedule?: (
    doctorId: string,
    targetSlotTime?: string,
    returnContext?: ReturnDoctorContext
  ) => void;
}

/**
 * Pure Presentation: DoctorScheduleDetailSheet
 * Decoupled from data queries and mutations via useDoctorScheduleDetailSheet.
 * Preserves in-memory visual stability during unmount transitions (zero flicker on close).
 */
export function DoctorScheduleDetailSheet(props: DoctorScheduleDetailSheetProps) {
  const {
    isOpen,
    highlightSlotTime,
    onClearHighlightSlotTime,
    openPatientsModal,
    onClearOpenPatients,
    onReturnToSourceModal,
    returnContext,
    onClearReturnContext,
    onViewDoctorSchedule
  } = props;

  const {
    doctor,
    isDetailLoading,
    activeTab,
    setActiveTab,
    dateContext,
    conflict,
    mutation,
    meta,
    handlers
  } = useDoctorScheduleDetailSheet(props);

  // If no doctor has ever been loaded (first deep-link query in flight), render accessible skeleton
  if (!doctor) {
    return (
      <Sheet
        open={isOpen}
        onOpenChange={(open) => !open && !conflict.isConflictReturning && handlers.handleClose()}
      >
        <SheetContent
          side='right'
          showCloseButton={false}
          className='w-full sm:max-w-[680px] lg:max-w-[760px] p-0 flex flex-col gap-0 border-l border-border/50 bg-card text-card-foreground shadow-2xl font-sans'
        >
          <SheetHeader className='sr-only'>
            <SheetTitle>Memuat Detail Jadwal Dokter</SheetTitle>
            <SheetDescription>Memuat informasi sesi dan jadwal praktik dokter...</SheetDescription>
          </SheetHeader>
          <DoctorScheduleSheetSkeleton activeTab={activeTab} />
        </SheetContent>
      </Sheet>
    );
  }

  const { initials, doctorStatus, doctorStatusConfig, isUnconfigured } = meta;
  const {
    selectedDay,
    currentMonth,
    currentYear,
    setSelectedDay,
    setCurrentMonth,
    setCurrentYear
  } = dateContext;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => !open && !conflict.isConflictReturning && handlers.handleClose()}
    >
      <SheetContent
        side='right'
        showCloseButton={false}
        className='w-full sm:max-w-[680px] lg:max-w-[760px] p-0 flex flex-col gap-0 overflow-hidden border-l border-border/50 bg-card text-card-foreground shadow-2xl font-sans'
      >
        {/* Profile Header Shell */}
        <div className='relative w-full shrink-0 border-b border-border/40 bg-card'>
          <div className='relative w-full h-24 sm:h-28 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--primary-bright,var(--primary))_28%,transparent)_0%,color-mix(in_oklab,var(--primary-bright,var(--primary))_10%,transparent)_60%,transparent_100%)] overflow-hidden'>
            <button
              type='button'
              onClick={
                conflict.hasReturnTarget ? handlers.handleReturnToSource : handlers.handleClose
              }
              className='absolute top-3 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/85 hover:bg-background text-foreground/90 hover:text-foreground text-xs font-semibold backdrop-blur-md border border-border/50 shadow-2xs transition-all cursor-pointer select-none'
            >
              <Icons.chevronLeft className='size-3.5' />
              <span>
                {conflict.hasReturnTarget
                  ? conflict.returnDoctorName
                    ? `Kembali ke Pemilihan Ruang (${conflict.returnDoctorName})`
                    : 'Kembali ke Pemilihan Ruang'
                  : 'Kembali'}
              </span>
            </button>
          </div>

          <SheetHeader className='px-6 pb-3.5 pt-0 space-y-0 text-left'>
            <div className='flex items-end gap-3.5 sm:gap-4 -mt-10 sm:-mt-11'>
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
                    doctorStatus === DOCTOR_CARD_STATUS.CUTI ||
                      doctorStatus === DOCTOR_CARD_STATUS.TERISI
                      ? 'bg-sky-500'
                      : doctorStatus === DOCTOR_CARD_STATUS.BELUM_DIATUR ||
                          doctorStatus === DOCTOR_CARD_STATUS.TUTUP
                        ? 'bg-slate-400'
                        : 'bg-emerald-500'
                  )}
                />
              </div>

              <div className='flex-1 min-w-0 pb-1 space-y-1.5'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <SheetTitle className='text-lg sm:text-xl font-bold text-foreground tracking-tight truncate'>
                    {doctor.nama_dokter}
                  </SheetTitle>

                  <span
                    className='inline-flex items-center justify-center size-5 rounded-full bg-[var(--primary-bright,var(--primary))] text-white shadow-2xs shrink-0'
                    title='Dokter Terverifikasi'
                  >
                    <Icons.check className='size-3 stroke-[3]' />
                  </span>
                </div>

                <div className='flex items-center gap-2 flex-wrap'>
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

                  {doctorStatusConfig && (
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
                  )}
                </div>

                <SheetDescription className='sr-only'>
                  Detail jadwal dan sesi praktik {doctor.nama_dokter}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Content Body: Adaptive Tabs or Content Skeleton */}
        {isDetailLoading ? (
          <DoctorScheduleSheetContentSkeleton activeTab={activeTab} />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as DoctorDetailTab)}
            className='flex-1 flex flex-col min-h-0 gap-0'
          >
            <div className='px-6 pt-3 pb-2 border-b border-border/40 shrink-0 bg-muted/20'>
              <TabsList className='grid w-full grid-cols-3 h-9'>
                <TabsTrigger value={DOCTOR_DETAIL_TAB.KALENDER} className='text-xs font-semibold'>
                  Kalender
                </TabsTrigger>
                <TabsTrigger value={DOCTOR_DETAIL_TAB.KUOTA} className='text-xs font-semibold'>
                  Jadwal Sesi
                </TabsTrigger>
                <TabsTrigger value={DOCTOR_DETAIL_TAB.INFORMASI} className='text-xs font-semibold'>
                  Info Dokter
                </TabsTrigger>
              </TabsList>
            </div>

            <div
              className={cn(
                'flex-1 overflow-y-auto p-4 sm:p-6 select-none',
                activeTab === DOCTOR_DETAIL_TAB.KALENDER ? 'flex flex-col min-h-0' : 'space-y-4'
              )}
            >
              <TabsContent
                value={DOCTOR_DETAIL_TAB.KALENDER}
                className='m-0 flex-1 flex flex-col min-h-0 outline-none animate-in fade-in-50 duration-200'
              >
                <DoctorTimelineCalendar
                  doctor={doctor}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                  currentMonth={currentMonth}
                  onMonthChange={setCurrentMonth}
                  currentYear={currentYear}
                  onYearChange={setCurrentYear}
                  pendingDay={mutation.pendingStatusDay}
                  isUpdatingDay={mutation.isUpdatingDay}
                  onNavigateToDailyGrid={(day) => {
                    setSelectedDay(day);
                    setActiveTab(DOCTOR_DETAIL_TAB.KUOTA);
                  }}
                  onSelectDayStatus={(day, st, notes) =>
                    mutation.handleDayStatusChange(day, st, notes)
                  }
                  className='h-full flex-1'
                />
              </TabsContent>

              <TabsContent
                value={DOCTOR_DETAIL_TAB.KUOTA}
                className='m-0 space-y-3 outline-none animate-in fade-in-50 duration-200'
              >
                {isUnconfigured && !conflict.pendingReopen && !returnContext ? (
                  <div className='flex-1 flex flex-col p-4 sm:p-6 select-none'>
                    <EmptyState
                      title='Belum ada jadwal praktik'
                      description='Dokter ini belum memiliki sesi praktik yang diatur untuk periode yang dipilih.'
                      action={
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => setActiveTab(DOCTOR_DETAIL_TAB.KALENDER)}
                          className='text-xs gap-1.5 cursor-pointer'
                        >
                          <Icons.calendar className='size-3.5' />
                          <span>Kembali ke Kalender</span>
                        </Button>
                      }
                      className='h-full min-h-[320px]'
                    />
                  </div>
                ) : (
                  <DoctorDailySessions
                    key={`sessions-${doctor.id}-${selectedDay}-${currentMonth}-${currentYear}`}
                    doctor={doctor}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                    currentYear={currentYear}
                    onYearChange={setCurrentYear}
                    onReturnToSourceModal={onReturnToSourceModal}
                    returnDoctorName={conflict.returnDoctorName}
                    returnContext={returnContext}
                    onViewDoctorSchedule={onViewDoctorSchedule}
                  />
                )}
              </TabsContent>

              <TabsContent
                value={DOCTOR_DETAIL_TAB.INFORMASI}
                className='m-0 space-y-4 outline-none'
              >
                <DoctorScheduleInfoTab doctor={doctor} />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
