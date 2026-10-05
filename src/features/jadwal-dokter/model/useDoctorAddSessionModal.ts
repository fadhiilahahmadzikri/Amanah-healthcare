'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import {
  SCHEDULE_SHIFT,
  SCHEDULE_SHIFT_LABELS,
  SCHEDULE_STATUS,
  CANONICAL_TO_API_SHIFT,
  resolveShiftFromTime,
  type ScheduleShift
} from '../constants/schedule-shift.constants';
import {
  scheduleSlotAvailabilityQueryOptions,
  clinicRoomsQueryOptions,
  doctorScheduleDetailQueryOptions
} from '../api/queries';
import { useCreateDoctorSessionMutation } from '../api/mutations';
import { useDoctorConflictNavigation } from './useDoctorConflictNavigation';

export type AddSessionStep = 'date' | 'room' | 'slot' | 'confirmation';

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

export function computeSafeEndTime(startTime: string, providedEnd?: string): string {
  if (providedEnd && /^\d{1,2}:\d{2}/.test(providedEnd.trim())) {
    return providedEnd.trim();
  }
  const parts = startTime.split(':');
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(h) && !isNaN(m)) {
      const endTotal = h * 60 + m + 30;
      const endH = Math.floor(endTotal / 60) % 24;
      const endM = endTotal % 60;
      return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    }
  }
  return startTime;
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
  const conflictNav = useDoctorConflictNavigation();

  const defaultDate = useMemo(() => {
    if (targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())) {
      return targetDate.trim();
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, [targetDate]);

  const isDirectSlotMode = Boolean(initialStartTime);
  const [step, setStep] = useState<AddSessionStep>(
    () => initialStep || (initialStartTime ? 'room' : 'date')
  );

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedShift, setSelectedShift] = useState<ScheduleShift>(() => {
    if (initialStartTime) return resolveShiftFromTime(initialStartTime);
    return SCHEDULE_SHIFT.PAGI;
  });
  const [selectedSlot, setSelectedSlot] = useState<{ time: string; endTime: string } | null>(() => {
    if (initialStartTime) {
      return {
        time: initialStartTime,
        endTime: computeSafeEndTime(initialStartTime, initialEndTime)
      };
    }
    return null;
  });
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const doctorStaffId = doctor?.practitioner_id || doctor?.id || '';

  const directSlotStartTime = initialStartTime || selectedSlot?.time;
  const directSlotEndTime =
    initialStartTime && initialEndTime
      ? computeSafeEndTime(initialStartTime, initialEndTime)
      : selectedSlot?.endTime;

  // Query clinic rooms for the chosen date (anti-collision is centralized in slot-availability SSOT)
  const { data: clinicRooms = [], isLoading: isLoadingRooms } = useQuery({
    ...clinicRoomsQueryOptions({
      date: selectedDate || undefined
    }),
    enabled: Boolean(isOpen && selectedDate)
  });

  const rooms = clinicRooms;

  // Fetch doctor detail for up-to-date daily sessions
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

  // Slot availability for chosen room, shift, and date (consistent with Reschedule modal step 3)
  const effectiveShift = selectedShift || SCHEDULE_SHIFT.PAGI;
  const { data: slotAvailability, isLoading: isLoadingSlots } = useQuery({
    ...scheduleSlotAvailabilityQueryOptions({
      date: selectedDate,
      shift: CANONICAL_TO_API_SHIFT[effectiveShift],
      roomId: selectedRoomId,
      staffId: doctorStaffId || undefined
    }),
    enabled: Boolean(isOpen && step === 'slot' && selectedDate && selectedRoomId)
  });

  const availableSlots = useMemo(() => {
    return slotAvailability?.slots || [];
  }, [slotAvailability?.slots]);

  // Reset or initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      const consumed = conflictNav.consumePendingReopen(doctor?.id);
      if (consumed) {
        if (consumed.sourceDate) setSelectedDate(consumed.sourceDate);
        if (consumed.sourceRoomId) setSelectedRoomId(consumed.sourceRoomId);
        if (consumed.sourceSlotStartTime) {
          const canonical = resolveShiftFromTime(consumed.sourceSlotStartTime);
          setSelectedShift(canonical);
          const safeEndTime = computeSafeEndTime(
            consumed.sourceSlotStartTime,
            consumed.sourceSlotEndTime
          );
          setSelectedSlot({ time: consumed.sourceSlotStartTime, endTime: safeEndTime });
        }
        setStep((consumed.initialStep as AddSessionStep) || 'room');
        setIsSubmitting(false);
        return;
      }

      const initialDateValue =
        targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())
          ? targetDate.trim()
          : defaultDate;
      setSelectedDate(initialDateValue);

      if (initialStep) {
        setStep(initialStep);
        if (initialStartTime) {
          const canonical = resolveShiftFromTime(initialStartTime);
          setSelectedShift(canonical);
          const safeEndTime = computeSafeEndTime(initialStartTime, initialEndTime);
          setSelectedSlot({ time: initialStartTime, endTime: safeEndTime });
        }
      } else if (initialStartTime) {
        const canonical = resolveShiftFromTime(initialStartTime);
        setSelectedShift(canonical);
        const safeEndTime = computeSafeEndTime(initialStartTime, initialEndTime);
        setSelectedSlot({ time: initialStartTime, endTime: safeEndTime });
        setStep('room');
      } else {
        setSelectedShift(SCHEDULE_SHIFT.PAGI);
        setSelectedSlot(null);
        setStep('date');
      }

      setIsSubmitting(false);
    }
  }, [
    isOpen,
    targetDate,
    defaultDate,
    initialStartTime,
    initialEndTime,
    initialStep,
    conflictNav,
    doctor?.id
  ]);

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

  const canProceedNext = useMemo(() => {
    if (step === 'date') return Boolean(selectedDate);
    if (step === 'room') {
      const room = rooms.find((r) => r.id === selectedRoomId);
      return Boolean(room);
    }
    if (step === 'slot') return Boolean(selectedSlot);
    if (step === 'confirmation') {
      const room = rooms.find((r) => r.id === selectedRoomId);
      const hasSlot = Boolean(selectedSlot || initialStartTime);
      return (
        Boolean(selectedDate && selectedRoomId && hasSlot && selectedShift) &&
        Boolean(room) &&
        !isSubmitting
      );
    }
    return false;
  }, [
    step,
    selectedDate,
    selectedRoomId,
    selectedSlot,
    initialStartTime,
    selectedShift,
    rooms,
    isSubmitting
  ]);

  const isFirstStep = isDirectSlotMode ? step === 'room' : step === 'date';

  const handleNext = () => {
    if (!canProceedNext) return;
    if (step === 'date') setStep('room');
    else if (step === 'room') {
      if (isDirectSlotMode) {
        if (!selectedSlot && initialStartTime) {
          setSelectedSlot({
            time: initialStartTime,
            endTime: computeSafeEndTime(initialStartTime, initialEndTime)
          });
        }
        setStep('confirmation');
      } else {
        setStep('slot');
      }
    } else if (step === 'slot') {
      setStep('confirmation');
    }
  };

  const handleBack = () => {
    if (step === 'confirmation') {
      if (isDirectSlotMode) {
        setStep('room');
      } else {
        setStep('slot');
      }
      return;
    }
    if (step === 'slot') {
      setStep('room');
      return;
    }
    if (step === 'room') {
      if (isDirectSlotMode) {
        onClose();
      } else {
        setStep('date');
      }
      return;
    }
    if (step === 'date') {
      onClose();
    }
  };

  const handleFinalSubmit = async () => {
    const effectiveSlot =
      selectedSlot ||
      (initialStartTime
        ? {
            time: initialStartTime,
            endTime: computeSafeEndTime(initialStartTime, initialEndTime)
          }
        : null);

    if (
      !doctor ||
      !selectedShift ||
      !effectiveSlot ||
      !selectedRoomId ||
      isSubmitting ||
      createSessionMutation.isPending
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      const sessionName = SCHEDULE_SHIFT_LABELS[selectedShift];

      const payload = {
        schedule_date: selectedDate,
        nama_sesi: sessionName,
        session: selectedShift,
        jam_mulai: effectiveSlot.time,
        jam_selesai: effectiveSlot.endTime,
        startTime: effectiveSlot.time,
        endTime: effectiveSlot.endTime,
        kuota_pasien: 1,
        slot_tersedia: 1,
        capacity: 1,
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
    setSelectedSlot,
    selectedRoomId,
    setSelectedRoomId,
    selectedRoom,
    isSubmitting: isSubmitting || createSessionMutation.isPending,
    rooms,
    isLoadingRooms,
    slotAvailability,
    availableSlots,
    isLoadingSlots,
    canProceedNext,
    isFirstStep,
    isDirectSlotMode,
    effectiveExistingSessions,
    handleNext,
    handleBack,
    handleFinalSubmit
  };
}
