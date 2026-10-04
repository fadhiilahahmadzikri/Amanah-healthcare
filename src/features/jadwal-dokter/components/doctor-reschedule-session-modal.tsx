'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryStates } from 'nuqs';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { StatusBadge } from '@/components/ui/status-badge';
import { BookingDateStep } from '@/features/klinik/components/booking/booking-date-step';
import { StepRoomSelect } from './add-session/step-room-select';
import { DoctorGridSlotItem, type GridSlotData } from './grid/doctor-grid-slot-item';
import { useRescheduleDoctorSessionMutation } from '../api/mutations';
import {
  clinicRoomsQueryOptions,
  scheduleSlotAvailabilityQueryOptions,
  rescheduleEligibilityQueryOptions,
  doctorScheduleDetailQueryOptions
} from '../api/queries';
import {
  ALL_SCHEDULE_SHIFTS,
  SCHEDULE_SHIFT,
  SCHEDULE_SHIFT_LABELS,
  SCHEDULE_SHIFT_BOUNDARIES,
  CANONICAL_TO_API_SHIFT,
  resolveShiftFromTime,
  type ScheduleShift
} from '../constants/schedule-shift.constants';
import { getTodayDateParam } from '../model/useDoctorScheduleView';
import { cn } from '@/lib/utils';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import { DOCTOR_DIALOG_TYPE, WIZARD_STEP } from '../constants/doctor-dialog.constants';
import {
  useDoctorConflictNavigation,
  type DoctorConflictReturnContext
} from '../model/useDoctorConflictNavigation';
import { computeSafeEndTime } from '../model/useDoctorAddSessionModal';

export type RescheduleStep = 'date' | 'room' | 'slot' | 'note';
export type ReturnDoctorContext = DoctorConflictReturnContext;

export interface DoctorRescheduleSessionModalProps {
  doctor: DoctorSchedule | null;
  session?: DoctorDailySession | null;
  isOpen: boolean;
  onClose: () => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  initialDate?: string;
  initialStartTime?: string;
  initialStep?: RescheduleStep;
  onViewDoctorSchedule?: (
    doctorId: string,
    targetSlotTime?: string,
    returnContext?: ReturnDoctorContext
  ) => void;
}

export function DoctorRescheduleSessionModal({
  doctor,
  session,
  isOpen,
  onClose,
  portalContainerRef,
  initialDate,
  initialStartTime,
  initialStep,
  onViewDoctorSchedule
}: DoctorRescheduleSessionModalProps) {
  const conflictNav = useDoctorConflictNavigation();
  const rescheduleMutation = useRescheduleDoctorSessionMutation();

  const [step, setStep] = useState<RescheduleStep>(() => initialStep || 'date');
  const [targetDate, setTargetDate] = useState('');
  const [targetRoomId, setTargetRoomId] = useState('');
  const [selectedShift, setSelectedShift] = useState<ScheduleShift>(SCHEDULE_SHIFT.PAGI);
  const [targetStartTime, setTargetStartTime] = useState('');
  const [targetEndTime, setTargetEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [rescheduleActiveAppointments, setRescheduleActiveAppointments] = useState(true);
  const [unscheduleSourceSlot, setUnscheduleSourceSlot] = useState(true);

  const [, setParams] = useQueryStates(
    {
      selectedDoctorId: parseAsString.withDefault(''),
      highlightSlotTime: parseAsString.withDefault(''),
      dialog: parseAsString.withDefault('')
    },
    { shallow: true }
  );

  // Fallback query doctor detail if session is not passed upfront
  const detailQuery = useQuery({
    ...doctorScheduleDetailQueryOptions(doctor?.id || '', {
      date: initialDate || getTodayDateParam()
    }),
    enabled: Boolean(isOpen && doctor?.id && !session)
  });

  const effectiveSession =
    session || doctor?.sesi_harian?.[0] || detailQuery.data?.sesi_harian?.[0] || null;

  // Initialize or reset form state whenever effectiveSession or modal opens
  useEffect(() => {
    if (effectiveSession && isOpen) {
      conflictNav.consumePendingReopen(doctor?.id);
      setStep(initialStep || 'date');
      setNotes('');
      setRescheduleActiveAppointments(true);
      setUnscheduleSourceSlot(true);
      setTargetStartTime(initialStartTime || '');
      setTargetEndTime('');

      // Default date focus: dynamically set to current date
      const today = getTodayDateParam();
      setTargetDate(initialDate || today);

      // Default shift matching the session's start time
      const initialShift = resolveShiftFromTime(initialStartTime || effectiveSession.jam_mulai);
      setSelectedShift(initialShift);
    }
  }, [effectiveSession, isOpen, initialDate, initialStartTime, initialStep]);

  // Query rooms for target date (evaluates slot occupancy in direct slot mode)
  const isDirectSlotMode = Boolean(initialStartTime);
  const directSlotStartTime = initialStartTime || targetStartTime;
  const directSlotEndTime = initialStartTime ? computeSafeEndTime(initialStartTime) : targetEndTime;

  const queryStartTime = isDirectSlotMode ? directSlotStartTime : undefined;
  const queryEndTime = isDirectSlotMode ? directSlotEndTime : undefined;
  const doctorStaffId = doctor?.practitioner_id || doctor?.id || '';

  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
    ...clinicRoomsQueryOptions({
      date: targetDate || undefined,
      startTime: queryStartTime,
      endTime: queryEndTime,
      excludePractitionerId: doctorStaffId || undefined
    }),
    enabled: Boolean(isOpen && targetDate)
  });

  // Automatically match room to session room if not yet set
  useEffect(() => {
    if (effectiveSession && rooms.length > 0 && !targetRoomId) {
      const currentRoomName = (effectiveSession.ruang ?? doctor?.ruang_praktik ?? '').trim();
      const matched = rooms.find(
        (r) =>
          r.name.toLowerCase() === currentRoomName.toLowerCase() ||
          currentRoomName.toLowerCase().startsWith(r.name.toLowerCase()) ||
          r.id.toLowerCase() === currentRoomName.toLowerCase()
      );
      if (matched) {
        setTargetRoomId(matched.id);
      }
    }
  }, [effectiveSession, doctor, rooms, targetRoomId]);

  // Query slot availability for the selected shift and room
  const { data: slotAvailability, isLoading: isLoadingSlots } = useQuery({
    ...scheduleSlotAvailabilityQueryOptions({
      date: targetDate,
      shift: CANONICAL_TO_API_SHIFT[selectedShift],
      roomId: targetRoomId,
      staffId: doctor?.id,
      excludeScheduleId: effectiveSession?.id
    }),
    enabled: Boolean(isOpen && step === 'slot' && targetDate && targetRoomId && doctor?.id)
  });

  // Filter slots for the grid (excluding past/expired slots)
  const availableSlots = useMemo(() => {
    if (!slotAvailability?.slots) return [];
    return slotAvailability.slots.filter((s) => {
      if (s.conflict?.type === 'TEMPORAL_PAST') return false;
      return true;
    });
  }, [slotAvailability?.slots]);

  // Check eligibility & active appointments for transfer note
  const hasTarget = Boolean(targetDate && targetStartTime);
  const { data: eligibilityData } = useQuery({
    ...rescheduleEligibilityQueryOptions(
      doctor?.id || '',
      effectiveSession?.id || '',
      hasTarget
        ? { targetDate, targetStartTime, targetRoomId: targetRoomId || undefined }
        : undefined
    ),
    enabled: Boolean(isOpen && doctor?.id && effectiveSession?.id && hasTarget),
    placeholderData: (previous) => previous
  });

  const hasActiveAppointments =
    (eligibilityData?.sourceSession?.activeAppointmentsCount ??
      effectiveSession?.pasien_terdaftar ??
      0) > 0;

  const targetRoom = useMemo(() => {
    return rooms.find((r) => r.id === targetRoomId) || null;
  }, [rooms, targetRoomId]);

  const targetEndTimeCalculated = useMemo(() => {
    return eligibilityData?.targetValidation?.projectedEndTime || targetEndTime || '';
  }, [eligibilityData?.targetValidation?.projectedEndTime, targetEndTime]);

  const formattedDisplayDate = useMemo(() => {
    if (!targetDate) return '';
    const parts = targetDate.split('-');
    if (parts.length !== 3) return targetDate;
    const y = parseInt(parts[0] || '0', 10);
    const m = parseInt(parts[1] || '0', 10);
    const d = parseInt(parts[2] || '0', 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return targetDate;
    return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [targetDate]);

  // Jump to occupant doctor's schedule on conflicting purple slot click
  const handleViewOccupantDoctorSchedule = useCallback(
    (occupantDoctorId?: string | null, slotTime?: string) => {
      if (!occupantDoctorId || !doctor) return;

      const context: DoctorConflictReturnContext = {
        sourceDoctorId: doctor.id,
        sourceDoctorName: doctor.nama_dokter,
        sourceDate: targetDate || initialDate,
        sourceSlotStartTime: targetStartTime || initialStartTime,
        sourceSlotEndTime: targetEndTime,
        sourceSession: effectiveSession,
        sourceSessionId: effectiveSession?.id,
        sourceRoomId: targetRoomId,
        wizardType: DOCTOR_DIALOG_TYPE.WIZARD_RESCHEDULE,
        initialStep: WIZARD_STEP.ROOM
      };

      conflictNav.inspectConflictDoctor({
        occupantDoctorId,
        targetSlotTime: slotTime,
        context,
        onNavigate: (id, time) => {
          onClose();
          if (onViewDoctorSchedule) {
            onViewDoctorSchedule(id, time, context);
          } else {
            setParams(
              {
                selectedDoctorId: id,
                highlightSlotTime: time || null,
                dialog: DOCTOR_DIALOG_TYPE.DETAIL_SHEET
              },
              { shallow: true }
            );
          }
        }
      });
    },
    [
      doctor,
      onClose,
      onViewDoctorSchedule,
      setParams,
      targetDate,
      initialDate,
      targetEndTime,
      effectiveSession,
      targetRoomId,
      conflictNav
    ]
  );

  // Stepper navigation guards
  const canProceedNext = useMemo(() => {
    if (step === 'date') return Boolean(targetDate);
    if (step === 'room') return Boolean(targetRoomId);
    if (step === 'slot') return Boolean(targetStartTime);
    if (step === 'note') return Boolean(targetDate && targetRoomId && targetStartTime);
    return false;
  }, [step, targetDate, targetRoomId, targetStartTime]);

  const handleNext = () => {
    if (step === 'date') setStep('room');
    else if (step === 'room') setStep('slot');
    else if (step === 'slot') setStep('note');
  };

  const handleBack = () => {
    if (step === 'note') setStep('slot');
    else if (step === 'slot') setStep('room');
    else if (step === 'room') setStep('date');
    else if (step === 'date') onClose();
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStartTime || !targetDate || !doctor || !effectiveSession) return;

    const finalReason = notes.trim() ? notes.trim() : undefined;
    const derivedShift = eligibilityData?.targetSimulation?.targetShift;

    rescheduleMutation.mutate(
      {
        doctorId: doctor.id,
        sessionId: effectiveSession.id,
        payload: {
          targetDate,
          targetStartTime,
          sourceStartTime: initialStartTime || undefined,
          targetShift: derivedShift,
          targetRoomId: targetRoomId || undefined,
          notes: finalReason,
          reason: finalReason,
          rescheduleActiveAppointments: hasActiveAppointments && rescheduleActiveAppointments,
          unscheduleSourceSlot
        }
      },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  const shiftBounds = SCHEDULE_SHIFT_BOUNDARIES[selectedShift];

  const stepMeta = useMemo(() => {
    const docName = doctor?.nama_dokter ? `dokter ${doctor.nama_dokter}` : 'dokter';
    switch (step) {
      case 'date':
        return {
          title: 'Pilih Tanggal Tujuan',
          subtitle: `Tentukan tanggal baru untuk memindahkan jadwal praktik ${docName}.`
        };
      case 'room':
        return {
          title: 'Pilih Ruangan Praktik',
          subtitle: `Tentukan ruangan poliklinik tempat ${docName} akan bertugas.`
        };
      case 'slot':
        return {
          title: 'Pilih Jam Mulai Baru',
          subtitle: `Pilih jam praktik dokter pada rentang ${shiftBounds.timeRange}.`
        };
      case 'note':
        return {
          title: 'Konfirmasi Pemindahan Jadwal',
          subtitle:
            'Tinjau rincian jadwal baru dan tambahkan catatan alasan perpindahan sesi dokter.'
        };
    }
  }, [step, doctor?.nama_dokter, shiftBounds.timeRange]);

  if (!doctor) return null;

  if (!effectiveSession) {
    if (detailQuery.isLoading) {
      return (
        <ModalWrapper
          isOpen={isOpen}
          onClose={onClose}
          maxWidth='max-w-[508px]'
          showCloseButton={false}
          portalContainerRef={portalContainerRef}
          className='h-auto max-h-none overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 w-full my-auto shadow-2xl'
        >
          <div className='p-6 space-y-4'>
            <Skeleton className='h-8 w-1/2' />
            <Skeleton className='h-24 w-full rounded-xl' />
            <Skeleton className='h-48 w-full rounded-xl' />
          </div>
        </ModalWrapper>
      );
    }
    return null;
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[508px]'
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
      className='h-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-5 sm:p-6 w-full my-auto shadow-2xl'
    >
      <div className='flex flex-col font-sans select-none gap-4'>
        {/* Top Header - No border-b */}
        <div className='flex items-start justify-between gap-3 shrink-0'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              {stepMeta.title}
            </h3>
            <p className='text-xs text-muted-foreground leading-relaxed'>{stepMeta.subtitle}</p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup'
            className='rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0 -mr-1 -mt-1'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* Original Session Context: ONLY in Step 1 ('date') directly below header */}
        {step === 'date' && (
          <div className='w-full p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs space-y-1.5 shrink-0'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-1.5 font-semibold text-foreground truncate'>
                <Icons.calendar className='size-3.5 text-primary shrink-0' />
                <span className='truncate'>
                  {effectiveSession.nama_sesi}
                  {initialStartTime ? (
                    <>
                      {' '}
                      &bull; <span className='font-mono'>{initialStartTime} WIB</span>
                    </>
                  ) : (
                    <>
                      {' '}
                      ({effectiveSession.jam_mulai} - {effectiveSession.jam_selesai} WIB)
                    </>
                  )}
                </span>
              </div>
              <StatusBadge status={effectiveSession.status_sesi} size='sm' className='shrink-0' />
            </div>
            <div className='text-[11.5px] text-muted-foreground flex items-center gap-1.5'>
              <Icons.location className='size-3 text-muted-foreground/70 shrink-0' />
              <span className='truncate'>
                {effectiveSession.ruang || doctor.ruang_praktik || 'Ruang Praktik'}
              </span>
            </div>
          </div>
        )}

        {/* Wizard Steps Content */}
        <div key={step} className='w-full animate-in fade-in-50 duration-200'>
          {/* STEP 1: Tanggal Tujuan */}
          {step === 'date' && (
            <BookingDateStep
              dateStr={targetDate}
              setDateStr={(d) => {
                setTargetDate(d);
                setTargetStartTime('');
                setTargetEndTime('');
              }}
              showHeader={false}
              label='Tanggal Baru*'
              placeholder='Pilih tanggal praktik...'
              id='tanggalTujuanRescheduleTrigger'
              ariaLabel='Tanggal tujuan reschedule'
              disablePastDates={true}
            />
          )}

          {/* STEP 2: Ruang Tujuan */}
          {step === 'room' && (
            <StepRoomSelect
              rooms={rooms}
              selectedRoomId={targetRoomId}
              onSelectRoomId={(id) => {
                setTargetRoomId(id);
                setTargetStartTime('');
                setTargetEndTime('');
              }}
              doctorName={doctor.nama_dokter}
              isLoading={isLoadingRooms}
              showHeader={false}
              onViewConflict={(room) => {
                const occupantId =
                  room.occupantDetails?.practitionerId || room.occupantDetails?.staffProfileId;
                const targetSlotTime = room.occupantDetails?.startTime || targetStartTime;
                if (occupantId) {
                  handleViewOccupantDoctorSchedule(occupantId, targetSlotTime);
                }
              }}
            />
          )}

          {/* STEP 3: Jam Mulai Baru (Grid-Based) */}
          {step === 'slot' && (
            <div className='space-y-3.5'>
              {/* Shift Selector Switcher */}
              <div className='grid grid-cols-4 gap-1 p-1 rounded-xl bg-muted/40 border border-border/40'>
                {ALL_SCHEDULE_SHIFTS.map((shiftKey) => {
                  const isActive = selectedShift === shiftKey;
                  return (
                    <button
                      key={shiftKey}
                      type='button'
                      onClick={() => setSelectedShift(shiftKey)}
                      className={cn(
                        'py-1.5 px-1 rounded-lg text-xs font-semibold transition-all text-center cursor-pointer truncate',
                        isActive
                          ? 'bg-card text-foreground shadow-xs font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {SCHEDULE_SHIFT_LABELS[shiftKey]}
                    </button>
                  );
                })}
              </div>

              {/* Grid of Slots */}
              {isLoadingSlots && availableSlots.length === 0 ? (
                <div className='grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[42vh] overflow-y-auto pr-1'>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className='h-[56px] w-full rounded-xl' />
                  ))}
                </div>
              ) : availableSlots.length === 0 ? (
                <EmptyState
                  animated
                  title='Tidak Ada Slot Pada Sesi Ini'
                  description='Silakan beralih ke sesi lain untuk melihat ketersediaan slot.'
                  className='border-0 bg-transparent py-2 min-h-0'
                  animationClassName='w-32 h-32 sm:w-36 sm:h-36'
                />
              ) : (
                <div className='grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[42vh] overflow-y-auto pr-1'>
                  {availableSlots.map((rawSlot) => {
                    const isSelected = targetStartTime === rawSlot.time;
                    const isPurpleConflict = rawSlot.status === 'OCCUPIED_BY_OTHER';
                    const isClickable = rawSlot.isAvailable || isPurpleConflict;

                    const occupancySlot: GridSlotData = {
                      slotIndex: rawSlot.slotIndex,
                      startTime: rawSlot.time,
                      endTime: rawSlot.endTime,
                      status: rawSlot.isAvailable
                        ? 'AVAILABLE'
                        : isPurpleConflict
                          ? 'OCCUPIED_BY_OTHER'
                          : rawSlot.status || 'CLOSED',
                      isAvailable: rawSlot.isAvailable,
                      displayLabel:
                        rawSlot.displayLabel || (rawSlot.isAvailable ? 'Tersedia' : 'Terisi'),
                      isClickable,
                      uiVariant: rawSlot.isAvailable
                        ? 'available'
                        : isPurpleConflict
                          ? 'purple_other'
                          : 'neutral_disabled',
                      uiStatus: rawSlot.isAvailable
                        ? 'AVAILABLE'
                        : isPurpleConflict
                          ? 'OCCUPIED_BY_OTHER'
                          : 'CLOSED',
                      conflictInfo: rawSlot.conflict
                        ? {
                            type: rawSlot.conflict.type,
                            occupantName: rawSlot.conflict.occupantName ?? undefined
                          }
                        : null
                    };

                    return (
                      <DoctorGridSlotItem
                        key={`${rawSlot.slotIndex}-${rawSlot.time}`}
                        slot={occupancySlot}
                        isFinished={false}
                        isNow={false}
                        isClickable={isClickable}
                        isSelected={isSelected}
                        onSlotClick={() => {
                          if (rawSlot.isAvailable) {
                            setTargetStartTime(rawSlot.time);
                            setTargetEndTime(rawSlot.endTime);
                          } else if (isPurpleConflict) {
                            const occupantId =
                              rawSlot.conflict?.practitionerId ||
                              rawSlot.conflict?.staffId ||
                              targetRoom?.occupantDetails?.practitionerId ||
                              targetRoom?.occupantDetails?.staffProfileId;
                            if (occupantId) {
                              handleViewOccupantDoctorSchedule(occupantId, rawSlot.time);
                            }
                          }
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Selected Slot Information Display without redundant calculated input */}
              {targetStartTime && (
                <div className='flex items-center justify-between p-2.5 rounded-xl border border-primary/30 bg-primary/5 text-xs'>
                  <span className='font-semibold text-foreground'>Slot Terpilih:</span>
                  <span className='font-mono font-bold text-primary'>
                    {targetStartTime} - {targetEndTime || targetEndTimeCalculated || '--:--'} WIB
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Catatan Perpindahan & Konfirmasi */}
          {step === 'note' && (
            <div className='space-y-3.5'>
              {/* Summary Card */}
              <div className='p-3 rounded-xl bg-muted/20 border border-border/50 text-xs space-y-2'>
                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div>
                    <span className='text-[11px] text-muted-foreground block'>Tanggal Baru</span>
                    <span className='font-semibold text-foreground truncate block'>
                      {formattedDisplayDate}
                    </span>
                  </div>
                  <div>
                    <span className='text-[11px] text-muted-foreground block'>Ruangan Baru</span>
                    <span className='font-semibold text-foreground truncate block'>
                      {targetRoom?.name || 'Ruang Praktik'}
                    </span>
                  </div>
                </div>

                <div className='pt-1.5 border-t border-border/30 flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>Jam Praktik Baru</span>
                  <span className='font-mono font-bold text-primary'>
                    {targetStartTime} - {targetEndTime || targetEndTimeCalculated || '--:--'} WIB
                  </span>
                </div>
              </div>

              {/* Notes Textarea */}
              <div className='space-y-1.5'>
                <Label htmlFor='reschedule-notes' className='text-xs font-semibold text-foreground'>
                  Catatan Pemindahan{' '}
                  <span className='text-muted-foreground font-normal'>(Opsional)</span>
                </Label>
                <Textarea
                  id='reschedule-notes'
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder='Contoh: Penyesuaian shift operasional dokter'
                  rows={2}
                  className='text-xs min-h-[64px]'
                />
              </div>

              {/* Auto Transfer Checkbox */}
              {hasActiveAppointments && (
                <div className='flex items-start gap-2.5 p-3 rounded-xl border border-border/50 bg-muted/20'>
                  <Checkbox
                    id='reschedule-active'
                    checked={rescheduleActiveAppointments}
                    onCheckedChange={(checked) => setRescheduleActiveAppointments(Boolean(checked))}
                    className='mt-0.5'
                  />
                  <div className='space-y-0.5'>
                    <Label
                      htmlFor='reschedule-active'
                      className='text-xs font-bold text-foreground cursor-pointer'
                    >
                      Alihkan antrean pasien terdaftar secara otomatis
                    </Label>
                    <p className='text-[11px] text-muted-foreground leading-relaxed'>
                      Seluruh janji temu pasien yang sudah booking pada jam ini akan otomatis
                      dialihkan ke jadwal baru.
                    </p>
                  </div>
                </div>
              )}

              {/* Unschedule Source Slot Checkbox */}
              <div className='flex items-start gap-2.5 p-3 rounded-xl border border-border/50 bg-muted/20'>
                <Checkbox
                  id='unschedule-source-slot'
                  checked={unscheduleSourceSlot}
                  onCheckedChange={(checked) => setUnscheduleSourceSlot(Boolean(checked))}
                  className='mt-0.5'
                />
                <div className='space-y-0.5'>
                  <Label
                    htmlFor='unschedule-source-slot'
                    className='text-xs font-bold text-foreground cursor-pointer'
                  >
                    Ubah slot asal (
                    {initialStartTime || session?.jam_mulai?.slice(0, 5) || 'jam asal'}) menjadi
                    Belum Terjadwal
                  </Label>
                  <p className='text-[11px] text-muted-foreground leading-relaxed'>
                    Tutup slot waktu asal agar tidak dapat dipesan lagi. Jika tidak dicentang, slot
                    waktu asal akan tetap tersedia (Available) untuk pasien lain.
                  </p>
                </div>
              </div>

              {/* Error notice if mutation failed */}
              {rescheduleMutation.isError && (
                <div className='p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1'>
                  <div className='flex items-center gap-1.5 font-bold'>
                    <Icons.warning className='size-3.5 shrink-0' />
                    <span>Gagal Reschedule</span>
                  </div>
                  <p className='text-[11px]'>
                    {(rescheduleMutation.error as Error)?.message ||
                      'Terjadi bentrok jadwal atau ruangan sudah terpakai pada jam tersebut.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stepper Navigation Footer - No border-t */}
        <div className='pt-2 flex items-center justify-between gap-3 select-none shrink-0'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='md'
            onClick={handleBack}
            disabled={rescheduleMutation.isPending}
            leadingIcon={
              step !== 'date' ? <Icons.arrowLeft className='size-3 stroke-[2.5]' /> : undefined
            }
            className='min-w-[100px] cursor-pointer'
          >
            {step === 'date' ? 'Batal' : 'Kembali'}
          </Button>

          {step !== 'note' ? (
            <Button
              type='button'
              variant='primary'
              shape='pill'
              size='md'
              disabled={!canProceedNext || rescheduleMutation.isPending}
              onClick={handleNext}
              withTrailingCircleIcon={true}
              trailingIcon={<Icons.arrowRight className='size-3 stroke-[2.5]' />}
              className='min-w-[120px] cursor-pointer'
            >
              Lanjut
            </Button>
          ) : (
            <Button
              type='button'
              variant='primary'
              shape='pill'
              size='md'
              disabled={!canProceedNext || rescheduleMutation.isPending}
              onClick={handleFinalSubmit}
              isLoading={rescheduleMutation.isPending}
              withTrailingCircleIcon={true}
              trailingIcon={<Icons.calendar className='size-3 stroke-[2.5]' />}
              className='min-w-[160px] cursor-pointer'
            >
              {rescheduleMutation.isPending ? 'Menyimpan...' : 'Konfirmasi Reschedule'}
            </Button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
