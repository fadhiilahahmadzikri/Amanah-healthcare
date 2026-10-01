'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import {
  SCHEDULE_SHIFT,
  SCHEDULE_SHIFT_LABELS,
  SCHEDULE_STATUS,
  CANONICAL_TO_API_SHIFT,
  SCHEDULE_TOAST_MESSAGES,
  type ScheduleShift
} from '../constants/schedule-shift.constants';
import {
  scheduleSlotAvailabilityQueryOptions,
  clinicRoomsQueryOptions,
  doctorScheduleKeys
} from '../api/queries';
import { createDoctorSession } from '../api/service';
import { syncAllDoctorSchedules } from '../api/mutations';
import { resolveCanonicalShift } from '../utils/shift-slot-builder';

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
  const queryClient = useQueryClient();

  const defaultDate = useMemo(() => {
    if (targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())) {
      return targetDate.trim();
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, [targetDate]);

  const isDirectSlotMode = Boolean(initialStartTime);
  const [step, setStep] = useState<AddSessionStep>(isDirectSlotMode ? 'room' : 'date');
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedShift, setSelectedShift] = useState<ScheduleShift | null>(() => {
    if (initialStartTime) return resolveCanonicalShift(initialStartTime);
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

  // 1. Fetch Master Clinic Rooms
  const { data: clinicRooms = [], isLoading: isLoadingRooms } = useQuery({
    ...clinicRoomsQueryOptions(),
    enabled: isOpen
  });

  const rooms = clinicRooms;

  // 2. Auto-populate default room immediately without blocking
  const defaultRoomId = useMemo(() => {
    if (rooms.length === 0) return '';
    const doctorRoom = doctor?.ruang_praktik?.trim().toLowerCase();
    if (doctorRoom) {
      const matched = rooms.find(
        (r) => r.name.toLowerCase() === doctorRoom || r.id.toLowerCase() === doctorRoom
      );
      if (matched) return matched.id;
    }
    return rooms[0]?.id || '';
  }, [rooms, doctor?.ruang_praktik]);

  useEffect(() => {
    if (!selectedRoomId && defaultRoomId) {
      setSelectedRoomId(defaultRoomId);
    }
  }, [selectedRoomId, defaultRoomId]);

  // 4. Fetch slot availability ONLY for wizard slot selection (bypassed in directSlotMode)
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

  // 5. Reset or initialize state on modal open
  useEffect(() => {
    if (isOpen) {
      const initialDateValue =
        targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())
          ? targetDate.trim()
          : defaultDate;
      setSelectedDate(initialDateValue);

      if (initialStartTime) {
        const canonical = resolveCanonicalShift(initialStartTime);
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

  // 6. Match slot automatically when initialStartTime is provided
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

  // Selected date object for formatting
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
    if (step === 'room') return Boolean(selectedRoomId);
    if (step === 'confirmation') return Boolean(selectedSlot && selectedShift) && !isSubmitting;
    return false;
  }, [step, selectedDate, selectedShift, selectedSlot, selectedRoomId, isSubmitting]);

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
    if (!doctor || !selectedShift || !selectedSlot || !selectedRoomId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const sessionName = SCHEDULE_SHIFT_LABELS[selectedShift];

      // Single Source of Truth: 1 slot = 1 patient (capacity: 1)
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

      const res = await createDoctorSession(doctor.id, payload);
      const serverSessionId = (res as { data?: { id?: string } })?.data?.id;

      const createdSession: DoctorDailySession = {
        id: serverSessionId || `${doctor.id}-s-${Date.now()}`,
        nama_sesi: sessionName,
        jam_mulai: selectedSlot.time,
        jam_selesai: selectedSlot.endTime,
        waktu: `${selectedSlot.time} - ${selectedSlot.endTime} WIB`,
        kuota_pasien: 1,
        slot_tersedia: 1,
        status_sesi: SCHEDULE_STATUS.OPEN,
        ruang: selectedRoom?.name || doctor.ruang_praktik || 'Ruang Konsultasi'
      };

      // Optimistically & deterministically update active doctor detail query cache
      queryClient.setQueriesData<DoctorSchedule>(
        { queryKey: [...doctorScheduleKeys.details(), doctor.id] },
        (oldDoctor) => {
          if (!oldDoctor) return oldDoctor;
          const currentSessions = oldDoctor.sesi_harian || [];
          const exists = currentSessions.some(
            (s) => s.id === createdSession.id || s.jam_mulai === createdSession.jam_mulai
          );
          if (exists) return oldDoctor;
          return {
            ...oldDoctor,
            sesi_harian: [...currentSessions, createdSession]
          };
        }
      );

      onSessionAdded?.(createdSession);

      toast.success(
        SCHEDULE_TOAST_MESSAGES.SESSIONS_ADDED_SUCCESS(1, doctor.nama_dokter)
      );

      await syncAllDoctorSchedules(queryClient);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : SCHEDULE_TOAST_MESSAGES.SESSIONS_ADDED_ERROR;
      toast.error(message);
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
    isSubmitting,
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
