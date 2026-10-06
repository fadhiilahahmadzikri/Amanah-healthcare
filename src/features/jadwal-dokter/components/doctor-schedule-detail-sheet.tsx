'use client';

import { useQuery } from '@tanstack/react-query';
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
import { getStatusConfig } from '@/styles/clinical-tokens';
import { useUpdateDoctorDayStatusMutation } from '../api/mutations';
import { doctorScheduleDetailQueryOptions } from '../api/queries';
import type { DoctorSchedule, ScheduleDayStatus } from '../api/types';
import {
  DOCTOR_CARD_STATUS,
  getDoctorCardStatus,
  parseDateToIso
} from '../utils/doctor-schedule-card-utils';
import { useDoctorConflictNavigation } from '../model/useDoctorConflictNavigation';
import { INSPECTION_PHASE } from '../constants/doctor-dialog.constants';
import type { ReturnDoctorContext } from './doctor-add-session-modal';
import { DoctorDailyHourlyGrid } from './doctor-daily-hourly-grid';
import {
  DoctorScheduleSheetContentSkeleton,
  DoctorScheduleSheetSkeleton
} from './doctor-schedule-sheet-skeleton';
import { DoctorTimelineCalendar } from './doctor-timeline-calendar';
import { DoctorScheduleInfoTab } from './sheet/doctor-schedule-info-tab';

import {
  DOCTOR_DETAIL_TAB,
  type DoctorDetailTab,
  useDoctorDetailDrawerStore
} from '../model/useDoctorDetailDrawerStore';

export { DOCTOR_DETAIL_TAB, type DoctorDetailTab };

export interface DoctorScheduleDetailSheetProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (doctor: DoctorSchedule) => void;
  selectedDate?: string;
  highlightSlotTime?: string;
  onClearHighlightSlotTime?: () => void;
  onReturnToSourceModal?: () => void;
  returnDoctorName?: string;
  returnContext?: ReturnDoctorContext | null;
  onClearReturnContext?: () => void;
  onViewDoctorSchedule?: (
    doctorId: string,
    targetSlotTime?: string,
    returnContext?: ReturnDoctorContext
  ) => void;
  openPatientsModal?: boolean;
  onClearOpenPatients?: () => void;
}

function getInitialDoctorDate(
  selectedDate?: string,
  returnContext?: ReturnDoctorContext | null
): Date {
  if (returnContext?.sourceDate) {
    const parsed = new Date(`${returnContext.sourceDate}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  if (selectedDate) {
    const iso = parseDateToIso(selectedDate);
    if (iso) {
      const parsed = new Date(`${iso}T00:00:00`);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }
  return new Date();
}

export function DoctorScheduleDetailSheet({
  doctor: selectedDoctor,
  isOpen,
  onClose,
  onOpenEdit: _onOpenEdit,
  selectedDate,
  highlightSlotTime,
  onClearHighlightSlotTime,
  openPatientsModal,
  onClearOpenPatients,
  onReturnToSourceModal,
  returnDoctorName,
  returnContext,
  onClearReturnContext,
  onViewDoctorSchedule
}: DoctorScheduleDetailSheetProps) {
  const updateDayMutation = useUpdateDoctorDayStatusMutation();
  const conflictNav = useDoctorConflictNavigation();
  const isConflictReturning = conflictNav.phase === INSPECTION_PHASE.RETURNING;
  const shouldShowKuotaTab = Boolean(
    highlightSlotTime ||
    openPatientsModal ||
    conflictNav.pendingReopen ||
    conflictNav.isInspecting ||
    isConflictReturning ||
    returnContext
  );

  const [activeTab, setActiveTab] = React.useState<DoctorDetailTab>(() =>
    shouldShowKuotaTab ? DOCTOR_DETAIL_TAB.KUOTA : DOCTOR_DETAIL_TAB.KALENDER
  );

  const initialDate = React.useMemo(
    () => getInitialDoctorDate(selectedDate, returnContext),
    [selectedDate, returnContext]
  );

  const [selectedDay, setSelectedDay] = React.useState<number>(initialDate.getDate());
  const [currentMonth, setCurrentMonth] = React.useState<number>(initialDate.getMonth());
  const [currentYear, setCurrentYear] = React.useState<number>(initialDate.getFullYear());
  const [pendingStatusDay, setPendingStatusDay] = React.useState<number | null>(null);

  const resetFocusState = React.useCallback(() => {
    const targetDate = getInitialDoctorDate(selectedDate, returnContext);
    setSelectedDay(targetDate.getDate());
    setCurrentMonth(targetDate.getMonth());
    setCurrentYear(targetDate.getFullYear());
    setActiveTab(shouldShowKuotaTab ? DOCTOR_DETAIL_TAB.KUOTA : DOCTOR_DETAIL_TAB.KALENDER);
    setPendingStatusDay(null);
  }, [selectedDate, returnContext, shouldShowKuotaTab]);

  React.useEffect(() => {
    if (isOpen) {
      resetFocusState();
    }
  }, [isOpen, resetFocusState]);

  React.useEffect(() => {
    if (conflictNav.pendingReopen && isOpen) {
      setActiveTab(DOCTOR_DETAIL_TAB.KUOTA);
      if (conflictNav.pendingReopen.sourceDate) {
        const parts = conflictNav.pendingReopen.sourceDate.split('-').map(Number);
        if (parts.length === 3 && !Number.isNaN(parts[0])) {
          setCurrentYear(parts[0]);
          setCurrentMonth(parts[1] - 1);
          setSelectedDay(parts[2]);
        }
      }
    }
  }, [conflictNav.pendingReopen, isOpen]);

  React.useEffect(() => {
    if ((highlightSlotTime || conflictNav.isInspecting) && isOpen) {
      setActiveTab(DOCTOR_DETAIL_TAB.KUOTA);
    }
  }, [highlightSlotTime, conflictNav.isInspecting, isOpen]);

  const handleClose = React.useCallback(() => {
    if (conflictNav.phase === INSPECTION_PHASE.RETURNING) return;
    resetFocusState();
    onClose();
  }, [onClose, resetFocusState, conflictNav.phase]);

  const detailParams = React.useMemo(() => {
    const month = formatMonthParam(currentYear, currentMonth);
    return {
      month,
      date: formatDateParam(currentYear, currentMonth, selectedDay)
    };
  }, [currentMonth, currentYear, selectedDay]);

  const cachedDoctor = useDoctorDetailDrawerStore((s) => s.cachedDoctor);
  const setCachedDoctor = useDoctorDetailDrawerStore((s) => s.setCachedDoctor);
  const targetStoreDoctorId = useDoctorDetailDrawerStore((s) => s.targetDoctorId);
  const lastDoctorRef = React.useRef<DoctorSchedule | null>(null);

  const effectiveDoctorId =
    selectedDoctor?.id || targetStoreDoctorId || '';

  const detailQuery = useQuery({
    ...doctorScheduleDetailQueryOptions(effectiveDoctorId, detailParams),
    enabled: isOpen && Boolean(effectiveDoctorId)
  });

  React.useEffect(() => {
    if (detailQuery.data?.nama_dokter) {
      setCachedDoctor(detailQuery.data);
      lastDoctorRef.current = detailQuery.data;
    }
  }, [detailQuery.data, setCachedDoctor]);

  React.useEffect(() => {
    if (selectedDoctor?.nama_dokter) {
      setCachedDoctor(selectedDoctor);
      lastDoctorRef.current = selectedDoctor;
    }
  }, [selectedDoctor, setCachedDoctor]);

  // Persist last valid doctor during exit transitions so drawer close never collapses into skeleton
  const doctor =
    (detailQuery.data?.nama_dokter ? detailQuery.data : null) ??
    (selectedDoctor?.nama_dokter ? selectedDoctor : null) ??
    (cachedDoctor?.nama_dokter ? cachedDoctor : null) ??
    lastDoctorRef.current;

  const isDetailLoading = detailQuery.isLoading && !detailQuery.data && !doctor;

  if (!doctor) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && !isConflictReturning && handleClose()}>
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

  const activeTargetDate = formatDateParam(currentYear, currentMonth, selectedDay);
  const doctorStatus = getDoctorCardStatus(doctor, undefined, activeTargetDate);
  const doctorStatusConfig = doctorStatus ? getStatusConfig(doctorStatus) : null;
  const isUnconfigured = doctorStatus === DOCTOR_CARD_STATUS.BELUM_DIATUR;

  const initials = doctor.nama_dokter
    .replace('dr. ', '')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleDayStatusChange = (day: number, status: ScheduleDayStatus, notes?: string) => {
    setPendingStatusDay(day);
    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    updateDayMutation.mutate(
      {
        doctorId: doctor.id,
        date: formattedDate,
        status,
        reason: notes
      },
      {
        onSettled: () => {
          setPendingStatusDay(null);
        }
      }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && !isConflictReturning && handleClose()}>
      <SheetContent
        side='right'
        showCloseButton={false}
        className='w-full sm:max-w-[680px] lg:max-w-[760px] p-0 flex flex-col gap-0 overflow-hidden border-l border-border/50 bg-card text-card-foreground shadow-2xl font-sans'
      >
        <div className='relative w-full shrink-0 border-b border-border/40 bg-card'>
          <div className='relative w-full h-24 sm:h-28 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--primary-bright,var(--primary))_28%,transparent)_0%,color-mix(in_oklab,var(--primary-bright,var(--primary))_10%,transparent)_60%,transparent_100%)] overflow-hidden'>
            <button
              type='button'
              onClick={
                conflictNav.isInspecting ||
                returnContext ||
                conflictNav.pendingReopen ||
                isConflictReturning
                  ? () => {
                      if (onReturnToSourceModal) {
                        onReturnToSourceModal();
                      } else {
                        conflictNav.returnToSourceWizard();
                      }
                    }
                  : handleClose
              }
              className='absolute top-3 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/85 hover:bg-background text-foreground/90 hover:text-foreground text-xs font-semibold backdrop-blur-md border border-border/50 shadow-2xs transition-all cursor-pointer select-none'
            >
              <Icons.chevronLeft className='size-3.5' />
              <span>
                {conflictNav.isInspecting ||
                returnContext ||
                conflictNav.pendingReopen ||
                isConflictReturning
                  ? returnDoctorName ||
                    conflictNav.returnContext?.sourceDoctorName ||
                    conflictNav.pendingReopen?.sourceDoctorName
                    ? `Kembali ke Pemilihan Ruang (${returnDoctorName || conflictNav.returnContext?.sourceDoctorName || conflictNav.pendingReopen?.sourceDoctorName})`
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
                    doctorStatus === DOCTOR_CARD_STATUS.CUTI
                      ? 'bg-sky-500'
                      : doctorStatus === DOCTOR_CARD_STATUS.TERISI
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
                  Jadwal & Kuota
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
                  pendingDay={pendingStatusDay}
                  isUpdatingDay={updateDayMutation.isPending}
                  onNavigateToDailyGrid={(day) => {
                    setSelectedDay(day);
                    setActiveTab(DOCTOR_DETAIL_TAB.KUOTA);
                  }}
                  onSelectDayStatus={(day, st, notes) => handleDayStatusChange(day, st, notes)}
                  className='h-full flex-1'
                />
              </TabsContent>

              <TabsContent
                value={DOCTOR_DETAIL_TAB.KUOTA}
                className='m-0 space-y-3 outline-none animate-in fade-in-50 duration-200'
              >
                {isUnconfigured && !conflictNav.pendingReopen && !returnContext ? (
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
                  <DoctorDailyHourlyGrid
                    key={`grid-${doctor.id}-${selectedDay}-${currentMonth}-${currentYear}-${highlightSlotTime || ''}`}
                    doctor={doctor}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                    currentYear={currentYear}
                    onYearChange={setCurrentYear}
                    highlightSlotTime={highlightSlotTime}
                    onClearHighlightSlotTime={onClearHighlightSlotTime}
                    openPatientsModal={openPatientsModal}
                    onClearOpenPatients={onClearOpenPatients}
                    onReturnToSourceModal={onReturnToSourceModal}
                    returnDoctorName={returnDoctorName}
                    returnContext={returnContext}
                    onClearReturnContext={onClearReturnContext}
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

function formatMonthParam(year: number, zeroBasedMonth: number): string {
  return `${year}-${String(zeroBasedMonth + 1).padStart(2, '0')}`;
}

function formatDateParam(year: number, zeroBasedMonth: number, day: number): string {
  const daysInMonth = new Date(year, zeroBasedMonth + 1, 0).getDate();
  const safeDay = Math.min(Math.max(day, 1), daysInMonth);

  return `${formatMonthParam(year, zeroBasedMonth)}-${String(safeDay).padStart(2, '0')}`;
}
