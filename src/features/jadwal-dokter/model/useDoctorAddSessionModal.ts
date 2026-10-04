'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import {
  SCHEDULE_SHIFT,
  SCHEDULE_SHIFT_LABELS,
  SCHEDULE_STATUS,
  CANONICAL_TO_API_SHIFT,
  SCHEDULE_TOAST_MESSAGES,
  resolveShiftFromTime,
  type ScheduleShift
} from '../constants/schedule-shift.constants';
import {
  scheduleSlotAvailabilityQueryOptions,
  clinicRoomsQueryOptions
} from '../api/queries';
import { useCreateDoctorSessionMutation } from '../api/mutations';

export type AddSessionStep = 'date' | 'session' | 'slot' | 'room' | 'confirmation';

export interface UseDoctorAddSessionModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionAdded?: (session: DoctorDailySession) => void;
  targetDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
}

function computeSafeEndTime(startTime: string, providedEnd?: string): string {
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
  initialEndTime
}: UseDoctorAddSessionModalProps) {
  const createSessionMutation = useCreateDoctorSessionMutation();

  const defaultDate = useMemo(() => {
    if (targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())) {
      return targetDate.trim();
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, [targetDate]);

  const isDirectSlotMode = Boolean(initialStartTime);
  const [step, setStep] = useState<AddSessionStep>(() => (initialStartTime ? 'room' : 'date'));
  const effectiveStep: AddSessionStep =
    Boolean(initialStartTime) && step === 'date' ? 'room' : step;

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedShift, setSelectedShift] = useState<ScheduleShift | null>(() => {
    if (initialStartTime) return resolveShiftFromTime(initialStartTime);
    return null;
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

  const queryStartTime = selectedSlot?.time || initialStartTime;
  const queryEndTime =
    selectedSlot?.endTime ||
    (initialStartTime ? computeSafeEndTime(initialStartTime, initialEndTime) : undefined);

  const { data: clinicRooms = [], isLoading: isLoadingRooms } = useQuery({
    ...clinicRoomsQueryOptions({
      date: selectedDate,
      startTime: queryStartTime,
      endTime: queryEndTime,
      excludePractitionerId: doctorStaffId || undefined
    }),
    enabled: isOpen
  });

  const rooms = clinicRooms;

  const defaultRoomId = useMemo(() => {
    if (rooms.length === 0) return '';
    const doctorRoom = doctor?.ruang_praktik?.trim().toLowerCase();
    if (doctorRoom) {
      const matched = rooms.find(
        (r) =>
          (r.name.toLowerCase() === doctorRoom || r.id.toLowerCase() === doctorRoom) &&
          !r.isOccupied
      );
      if (matched) return matched.id;
    }
    const firstAvailable = rooms.find((r) => !r.isOccupied);
    return firstAvailable?.id || '';
  }, [rooms, doctor?.ruang_praktik]);

  useEffect(() => {
    if (defaultRoomId && (!selectedRoomId || rooms.find((r) => r.id === selectedRoomId)?.isOccupied)) {
      setSelectedRoomId(defaultRoomId);
    }
  }, [selectedRoomId, defaultRoomId, rooms]);

  const effectiveShift = selectedShift || SCHEDULE_SHIFT.PAGI;
  const { data: slotAvailability, isLoading: isLoadingSlots } = useQuery({
    ...scheduleSlotAvailabilityQueryOptions({
      date: selectedDate,
      shift: CANONICAL_TO_API_SHIFT[effectiveShift],
      roomId: selectedRoomId || (rooms[0]?.id ?? ''),
      staffId: doctorStaffId || undefined
    }),
    enabled:
      isOpen &&
      !isDirectSlotMode &&
      step === 'slot' &&
      Boolean(selectedDate && (selectedRoomId || rooms[0]?.id))
  });

  useEffect(() => {
    if (isOpen) {
      const initialDateValue =
        targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())
          ? targetDate.trim()
          : defaultDate;
      setSelectedDate(initialDateValue);

      if (initialStartTime) {
        const canonical = resolveShiftFromTime(initialStartTime);
        setSelectedShift(canonical);
        const safeEndTime = computeSafeEndTime(initialStartTime, initialEndTime);
        setSelectedSlot({ time: initialStartTime, endTime: safeEndTime });
        setStep('room');
      } else {
        setSelectedShift(null);
        setSelectedSlot(null);
        setStep('date');
      }

      setIsSubmitting(false);
    }
  }, [isOpen, targetDate, defaultDate, initialStartTime, initialEndTime]);

  useEffect(() => {
    if (initialStartTime) {
      if (slotAvailability?.slots) {
        const matched = slotAvailability.slots.find((s) => s.time === initialStartTime);
        if (matched) {
          setSelectedSlot({ time: matched.time, endTime: matched.endTime });
          return;
        }
      }
      setSelectedSlot((prev) => {
        if (prev?.time === initialStartTime) return prev;
        return {
          time: initialStartTime,
          endTime: computeSafeEndTime(initialStartTime, initialEndTime)
        };
      });
    }
  }, [initialStartTime, initialEndTime, slotAvailability?.slots]);

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
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [selectedDateObj]);

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  const canProceedNext = useMemo(() => {
    if (step === 'date') return Boolean(selectedDate);
    if (step === 'session') return Boolean(selectedShift);
    if (step === 'slot') return Boolean(selectedSlot);
    if (step === 'room') {
      const room = rooms.find((r) => r.id === selectedRoomId);
      return Boolean(room && !room.isOccupied);
    }
    if (step === 'confirmation') return Boolean(selectedSlot && selectedShift) && !isSubmitting;
    return false;
  }, [step, selectedDate, selectedShift, selectedSlot, selectedRoomId, rooms, isSubmitting]);

  const isFirstStep = isDirectSlotMode ? step === 'room' : step === 'date';

  const handleNext = () => {
    if (!canProceedNext) return;
    if (step === 'date') setStep('session');
    else if (step === 'session') setStep('slot');
    else if (step === 'slot') setStep('room');
    else if (step === 'room') setStep('confirmation');
  };

  const handleBack = () => {
    if (step === 'confirmation') {
      setStep('room');
      return;
    }
    if (step === 'room') {
      if (isDirectSlotMode) {
        onClose();
      } else {
        setStep('slot');
      }
      return;
    }
    if (step === 'slot') {
      setStep('session');
      return;
    }
    if (step === 'session') {
      setStep('date');
      return;
    }
    if (step === 'date') {
      onClose();
    }
  };

  const handleFinalSubmit = async () => {
    if (!doctor || !selectedShift || !selectedSlot || !selectedRoomId || isSubmitting || createSessionMutation.isPending) return;

    try {
      setIsSubmitting(true);
      const sessionName = SCHEDULE_SHIFT_LABELS[selectedShift];

      const payload = {
        schedule_date: selectedDate,
        nama_sesi: sessionName,
        session: selectedShift,
        jam_mulai: selectedSlot.time,
        jam_selesai: selectedSlot.endTime,
        startTime: selectedSlot.time,
        endTime: selectedSlot.endTime,
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
    step: effectiveStep,
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
    isLoadingSlots,
    canProceedNext,
    isFirstStep,
    isDirectSlotMode,
    handleNext,
    handleBack,
    handleFinalSubmit
  };
}
