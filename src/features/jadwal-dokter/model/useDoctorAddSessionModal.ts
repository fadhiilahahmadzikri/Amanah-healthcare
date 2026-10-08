'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import {
  SCHEDULE_SHIFT,
  SCHEDULE_SHIFT_LABELS,
  SCHEDULE_STATUS,
  resolveShiftFromTime,
  type ScheduleShift
} from '../constants/schedule-shift.constants';
import {
  clinicRoomsQueryOptions,
  doctorScheduleDetailQueryOptions
} from '../api/queries';
import { useCreateDoctorSessionMutation } from '../api/mutations';
import { useScheduleReferenceOptions } from '../hooks/useScheduleReferenceOptions';
import { DEFAULT_FALLBACK_CAPACITY } from '@/features/klinik/constants/queue-load.constants';

export type AddSessionStep = 'date' | 'session' | 'room' | 'confirmation';

export interface UseDoctorAddSessionModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionAdded?: (session: DoctorDailySession) => void;
  targetDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialStep?: AddSessionStep;
}

export function useDoctorAddSessionModal({
  doctor,
  isOpen,
  onClose,
  onSessionAdded,
  targetDate,
  initialStartTime,
  initialEndTime,
  initialStep
}: UseDoctorAddSessionModalProps) {
  const createSessionMutation = useCreateDoctorSessionMutation();
  const { shifts: refShifts, getShiftBounds } = useScheduleReferenceOptions();

  const defaultDate = useMemo(() => {
    if (targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())) {
      return targetDate.trim();
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, [targetDate]);

  const [step, setStep] = useState<AddSessionStep>(() => initialStep || 'date');
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedShift, setSelectedShift] = useState<ScheduleShift>(() => {
    if (initialStartTime) return resolveShiftFromTime(initialStartTime);
    return SCHEDULE_SHIFT.PAGI;
  });
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clinic rooms query
  const { data: clinicRooms = [], isLoading: isLoadingRooms } = useQuery({
    ...clinicRoomsQueryOptions({
      date: selectedDate || undefined
    }),
    enabled: Boolean(isOpen && selectedDate)
  });

  const rooms = clinicRooms;

  // Doctor detail query
  const detailQuery = useQuery({
    ...doctorScheduleDetailQueryOptions(doctor?.id || '', {
      date: selectedDate
    }),
    enabled: Boolean(isOpen && doctor?.id && selectedDate)
  });

  const effectiveExistingSessions = useMemo(() => {
    return detailQuery.data?.sesi_harian || doctor?.sesi_harian || [];
  }, [detailQuery.data?.sesi_harian, doctor?.sesi_harian]);

  // Default room selection matching doctor's assigned room
  const defaultRoomId = useMemo(() => {
    if (rooms.length === 0) return '';
    const doctorRoom = (doctor?.ruang_praktik ?? '').trim().toLowerCase();
    if (doctorRoom) {
      const matched = rooms.find(
        (r) =>
          r.name.toLowerCase() === doctorRoom ||
          r.id.toLowerCase() === doctorRoom ||
          r.name.toLowerCase().startsWith(doctorRoom) ||
          doctorRoom.startsWith(r.name.toLowerCase())
      );
      if (matched) return matched.id;
    }
    return rooms[0]?.id || '';
  }, [rooms, doctor?.ruang_praktik]);

  useEffect(() => {
    if (defaultRoomId && !selectedRoomId) {
      setSelectedRoomId(defaultRoomId);
    }
  }, [selectedRoomId, defaultRoomId]);

  useEffect(() => {
    if (isOpen) {
      const initialDateValue =
        targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())
          ? targetDate.trim()
          : defaultDate;
      setSelectedDate(initialDateValue);

      if (initialStartTime) {
        setSelectedShift(resolveShiftFromTime(initialStartTime));
      } else {
        setSelectedShift(SCHEDULE_SHIFT.PAGI);
      }

      setStep(initialStep || 'date');
      setIsSubmitting(false);
    }
  }, [isOpen, targetDate, defaultDate, initialStartTime, initialStep]);

  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return undefined;
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return undefined;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return undefined;
    return new Date(y, m - 1, d);
  }, [selectedDate]);

  const formattedDisplayDate = useMemo(() => {
    if (!selectedDateObj) return 'Pilih Tanggal';
    return selectedDateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [selectedDateObj]);

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  const shiftBounds = getShiftBounds(selectedShift);
  const selectedSlot = useMemo(() => {
    return {
      time: shiftBounds?.startTime || '08:00',
      endTime: shiftBounds?.endTime || '12:00'
    };
  }, [shiftBounds]);

  const canProceedNext = useMemo(() => {
    if (step === 'date') return Boolean(selectedDate);
    if (step === 'session') return Boolean(selectedShift);
    if (step === 'room') return Boolean(selectedRoomId);
    if (step === 'confirmation') {
      return Boolean(selectedDate && selectedShift && selectedRoomId && !isSubmitting);
    }
    return false;
  }, [step, selectedDate, selectedShift, selectedRoomId, isSubmitting]);

  const isFirstStep = step === 'date';

  const handleNext = () => {
    if (!canProceedNext) return;
    if (step === 'date') setStep('session');
    else if (step === 'session') setStep('room');
    else if (step === 'room') setStep('confirmation');
  };

  const handleBack = () => {
    if (step === 'confirmation') setStep('room');
    else if (step === 'room') setStep('session');
    else if (step === 'session') setStep('date');
    else if (step === 'date') onClose();
  };

  const handleFinalSubmit = async () => {
    if (!doctor || !selectedShift || !selectedRoomId || isSubmitting || createSessionMutation.isPending) {
      return;
    }

    try {
      setIsSubmitting(true);
      const sessionName = SCHEDULE_SHIFT_LABELS[selectedShift];
      const startTime = selectedSlot.time;
      const endTime = selectedSlot.endTime;

      const payload = {
        schedule_date: selectedDate,
        nama_sesi: sessionName,
        session: selectedShift,
        jam_mulai: startTime,
        jam_selesai: endTime,
        startTime,
        endTime,
        kuota_pasien: DEFAULT_FALLBACK_CAPACITY,
        slot_tersedia: DEFAULT_FALLBACK_CAPACITY,
        capacity: DEFAULT_FALLBACK_CAPACITY,
        status: SCHEDULE_STATUS.OPEN,
        status_sesi: SCHEDULE_STATUS.OPEN,
        ruang: selectedRoom?.name || doctor.ruang_praktik || 'Ruang Konsultasi',
        roomId: selectedRoomId
      };

      await createSessionMutation.mutateAsync({
        doctorId: doctor.id,
        payload
      });

      onSessionAdded?.(undefined as any);
      onClose();
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    selectedDate,
    setSelectedDate,
    selectedDateObj,
    formattedDisplayDate,
    selectedShift,
    setSelectedShift,
    selectedSlot,
    selectedRoomId,
    setSelectedRoomId,
    selectedRoom,
    isSubmitting: isSubmitting || createSessionMutation.isPending,
    rooms,
    isLoadingRooms,
    canProceedNext,
    isFirstStep,
    effectiveExistingSessions,
    handleNext,
    handleBack,
    handleFinalSubmit
  };
}
