'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryStates } from 'nuqs';
import { useRescheduleDoctorSessionMutation } from '../api/mutations';
import {
  clinicRoomsQueryOptions,
  scheduleSlotAvailabilityQueryOptions,
  rescheduleEligibilityQueryOptions,
  doctorScheduleDetailQueryOptions
} from '../api/queries';
import {
  SCHEDULE_SHIFT,
  CANONICAL_TO_API_SHIFT,
  resolveShiftFromTime,
  type ScheduleShift
} from '../constants/schedule-shift.constants';
import { useScheduleReferenceOptions } from '../hooks/useScheduleReferenceOptions';
import { getTodayDateParam } from './useDoctorScheduleView';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import { DOCTOR_DIALOG_TYPE, WIZARD_STEP } from '../constants/doctor-dialog.constants';
import {
  useDoctorConflictNavigation,
  type DoctorConflictReturnContext
} from './useDoctorConflictNavigation';

export type RescheduleStep = 'date' | 'room' | 'slot' | 'note';
export type ReturnDoctorContext = DoctorConflictReturnContext;

export interface UseDoctorRescheduleSessionModalProps {
  doctor: DoctorSchedule | null;
  session?: DoctorDailySession | null;
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialStartTime?: string;
  initialStep?: RescheduleStep;
  onViewDoctorSchedule?: (
    doctorId: string,
    targetSlotTime?: string,
    returnContext?: ReturnDoctorContext
  ) => void;
}

export function useDoctorRescheduleSessionModal({
  doctor,
  session,
  isOpen,
  onClose,
  initialDate,
  initialStartTime,
  initialStep,
  onViewDoctorSchedule
}: UseDoctorRescheduleSessionModalProps) {
  const conflictNav = useDoctorConflictNavigation();
  const rescheduleMutation = useRescheduleDoctorSessionMutation();
  const { getShiftBounds } = useScheduleReferenceOptions();

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

  const detailQuery = useQuery({
    ...doctorScheduleDetailQueryOptions(doctor?.id || '', {
      date: initialDate || getTodayDateParam()
    }),
    enabled: Boolean(isOpen && doctor?.id && !session)
  });

  const effectiveSession =
    session || doctor?.sesi_harian?.[0] || detailQuery.data?.sesi_harian?.[0] || null;

  useEffect(() => {
    if (effectiveSession && isOpen) {
      const consumed = conflictNav.consumePendingReopen(doctor?.id);
      if (consumed) {
        if (consumed.sourceDate) setTargetDate(consumed.sourceDate);
        if (consumed.sourceRoomId) setTargetRoomId(consumed.sourceRoomId);
        if (consumed.sourceSlotStartTime) {
          setTargetStartTime(consumed.sourceSlotStartTime);
          const canonical = resolveShiftFromTime(consumed.sourceSlotStartTime);
          setSelectedShift(canonical);
        }
        if (consumed.sourceSlotEndTime) {
          setTargetEndTime(consumed.sourceSlotEndTime);
        }
        setStep((consumed.initialStep as RescheduleStep) || 'room');
        setNotes('');
        setRescheduleActiveAppointments(true);
        setUnscheduleSourceSlot(true);
        return;
      }

      setStep(initialStep || 'date');
      setNotes('');
      setRescheduleActiveAppointments(true);
      setUnscheduleSourceSlot(true);
      setTargetStartTime(initialStartTime || '');
      setTargetEndTime('');

      const today = getTodayDateParam();
      setTargetDate(initialDate || today);

      const initialShift = resolveShiftFromTime(initialStartTime || effectiveSession.jam_mulai);
      setSelectedShift(initialShift);
    }
  }, [effectiveSession, isOpen, initialDate, initialStartTime, initialStep]);

  const doctorStaffId = doctor?.practitioner_id || doctor?.id || '';

  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
    ...clinicRoomsQueryOptions({
      date: targetDate || undefined,
      excludePractitionerId: doctorStaffId || undefined
    }),
    enabled: Boolean(isOpen && targetDate)
  });

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

  const availableSlots = useMemo(() => {
    return slotAvailability?.slots || [];
  }, [slotAvailability?.slots]);

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
        initialStep: step === 'slot' ? WIZARD_STEP.SLOT : WIZARD_STEP.ROOM
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
      conflictNav,
      initialStartTime,
      step,
      targetStartTime
    ]
  );

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

  const shiftBounds = getShiftBounds(selectedShift);
  const shiftTimeRange =
    shiftBounds?.timeRange ||
    (shiftBounds ? `${shiftBounds.startTime} - ${shiftBounds.endTime}` : '');

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
          subtitle: `Pilih jam praktik dokter pada rentang ${shiftTimeRange}.`
        };
      case 'note':
        return {
          title: 'Konfirmasi Pemindahan Jadwal',
          subtitle:
            'Tinjau rincian jadwal baru dan tambahkan catatan alasan perpindahan sesi dokter.'
        };
    }
  }, [step, doctor?.nama_dokter, shiftTimeRange]);

  return {
    step,
    setStep,
    targetDate,
    setTargetDate,
    targetRoomId,
    setTargetRoomId,
    selectedShift,
    setSelectedShift,
    targetStartTime,
    setTargetStartTime,
    targetEndTime,
    setTargetEndTime,
    notes,
    setNotes,
    rescheduleActiveAppointments,
    setRescheduleActiveAppointments,
    unscheduleSourceSlot,
    setUnscheduleSourceSlot,
    effectiveSession,
    isLoadingDetail: detailQuery.isLoading,
    rooms,
    isLoadingRooms,
    availableSlots,
    isLoadingSlots,
    targetRoom,
    targetEndTimeCalculated,
    formattedDisplayDate,
    hasActiveAppointments,
    canProceedNext,
    handleNext,
    handleBack,
    handleFinalSubmit,
    stepMeta,
    handleViewOccupantDoctorSchedule,
    isSubmitting: rescheduleMutation.isPending,
    isError: rescheduleMutation.isError,
    errorMessage: (rescheduleMutation.error as Error)?.message
  };
}
