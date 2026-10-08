'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRescheduleDoctorSessionMutation } from '../api/mutations';
import {
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
import type { DoctorConflictReturnContext } from './useDoctorConflictNavigation';

export type ReturnDoctorContext = DoctorConflictReturnContext;

export type RescheduleStep = 'date' | 'note';

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
  initialStep
}: UseDoctorRescheduleSessionModalProps) {
  const rescheduleMutation = useRescheduleDoctorSessionMutation();
  const { getShiftBounds } = useScheduleReferenceOptions();

  const [step, setStep] = useState<RescheduleStep>(() => initialStep || 'date');
  const [targetDate, setTargetDate] = useState('');
  const [selectedShift, setSelectedShift] = useState<ScheduleShift>(SCHEDULE_SHIFT.PAGI);
  const [notes, setNotes] = useState('');
  const [rescheduleActiveAppointments, setRescheduleActiveAppointments] = useState(true);
  const [unscheduleSourceSlot, setUnscheduleSourceSlot] = useState(true);

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
      setStep(initialStep || 'date');
      setNotes('');
      setRescheduleActiveAppointments(true);
      setUnscheduleSourceSlot(true);

      const today = getTodayDateParam();
      setTargetDate(initialDate || today);

      const initialShift = resolveShiftFromTime(initialStartTime || effectiveSession.jam_mulai);
      setSelectedShift(initialShift);
    }
  }, [effectiveSession, isOpen, initialDate, initialStartTime, initialStep]);

  const shiftBounds = getShiftBounds(selectedShift);
  const targetStartTime = shiftBounds?.startTime || effectiveSession?.jam_mulai || '08:00';
  const targetEndTime = shiftBounds?.endTime || effectiveSession?.jam_selesai || '12:00';

  const hasTarget = Boolean(targetDate && targetStartTime);
  const { data: eligibilityData } = useQuery({
    ...rescheduleEligibilityQueryOptions(
      doctor?.id || '',
      effectiveSession?.id || '',
      hasTarget
        ? { targetDate, targetStartTime, targetRoomId: effectiveSession?.roomId || effectiveSession?.ruang_id || undefined }
        : undefined
    ),
    enabled: Boolean(isOpen && doctor?.id && effectiveSession?.id && hasTarget),
    placeholderData: (previous) => previous
  });

  const hasActiveAppointments =
    (eligibilityData?.sourceSession?.activeAppointmentsCount ??
      effectiveSession?.pasien_terdaftar ??
      0) > 0;

  const targetRoomName =
    effectiveSession?.ruang || doctor?.ruang_praktik || 'Ruang Praktik';

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

  const canProceedNext = useMemo(() => {
    if (step === 'date') return Boolean(targetDate && selectedShift);
    if (step === 'note') return Boolean(targetDate && selectedShift && !rescheduleMutation.isPending);
    return false;
  }, [step, targetDate, selectedShift, rescheduleMutation.isPending]);

  const handleNext = () => {
    if (step === 'date') setStep('note');
  };

  const handleBack = () => {
    if (step === 'note') setStep('date');
    else if (step === 'date') onClose();
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate || !doctor || !effectiveSession) return;

    const finalReason = notes.trim() ? notes.trim() : undefined;
    const derivedShift = CANONICAL_TO_API_SHIFT[selectedShift] || selectedShift;

    rescheduleMutation.mutate(
      {
        doctorId: doctor.id,
        sessionId: effectiveSession.id,
        payload: {
          targetDate,
          targetStartTime,
          sourceStartTime: initialStartTime || undefined,
          targetShift: derivedShift,
          targetRoomId: effectiveSession.roomId || effectiveSession.ruang_id || undefined,
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

  const stepMeta = useMemo(() => {
    const docName = doctor?.nama_dokter ? `dokter ${doctor.nama_dokter}` : 'dokter';
    switch (step) {
      case 'date':
        return {
          title: 'Pilih Tanggal & Sesi Tujuan',
          subtitle: `Tentukan tanggal baru dan sesi operasional untuk memindahkan jadwal praktik ${docName}.`
        };
      case 'note':
        return {
          title: 'Konfirmasi Pemindahan Jadwal',
          subtitle:
            'Tinjau rincian jadwal baru dan tambahkan catatan alasan perpindahan sesi dokter.'
        };
    }
  }, [step, doctor?.nama_dokter]);

  return {
    step,
    setStep,
    targetDate,
    setTargetDate,
    selectedShift,
    setSelectedShift,
    targetStartTime,
    targetEndTime,
    notes,
    setNotes,
    rescheduleActiveAppointments,
    setRescheduleActiveAppointments,
    unscheduleSourceSlot,
    setUnscheduleSourceSlot,
    effectiveSession,
    isLoadingDetail: detailQuery.isLoading,
    targetRoomName,
    formattedDisplayDate,
    hasActiveAppointments,
    canProceedNext,
    handleNext,
    handleBack,
    handleFinalSubmit,
    stepMeta,
    isSubmitting: rescheduleMutation.isPending,
    isError: rescheduleMutation.isError,
    errorMessage: (rescheduleMutation.error as Error)?.message
  };
}
