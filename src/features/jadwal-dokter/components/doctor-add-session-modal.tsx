'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Icons } from '@/components/icons';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ALL_SCHEDULE_SHIFTS,
  SCHEDULE_SHIFT,
  SCHEDULE_SHIFT_LABELS,
  SCHEDULE_STATUS,
  SCHEDULE_SHIFT_BOUNDARIES,
  CANONICAL_TO_API_SHIFT,
  DB_STAFF_SHIFT_MAP,
  SCHEDULE_TIME_LABELS,
  SCHEDULE_BUTTON_LABELS,
  SCHEDULE_OCCUPANT_LABELS,
  SCHEDULE_TOAST_MESSAGES,
  type ScheduleShift
} from '../constants/schedule-shift.constants';
import {
  scheduleFormBootstrapQueryOptions,
  scheduleSlotAvailabilityQueryOptions,
  clinicRoomsQueryOptions
} from '../api/queries';
import { createDoctorSession } from '../api/service';
import { syncAllDoctorSchedules } from '../api/mutations';
import {
  isSessionShiftUnavailable,
  parseTimeToMinutes
} from '../utils/schedule-availability-guard';
import { resolveCanonicalShift } from '../utils/shift-slot-builder';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import type { ScheduleFormBootstrapResponse } from '@/server/contracts/schedules/doctor-schedules.dto';

export interface DoctorAddSessionModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionAdded?: (session: DoctorDailySession) => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  targetDate?: string;
  initialStartTime?: string;
}

interface ShiftSlotDraft {
  id: string;
  jamMulai: string;
  jamSelesai: string;
  roomId: string;
  roomName: string;
  poliklinikId: string;
  poliklinikName: string;
  kuotaPasien: number;
}

interface ShiftSlotRowProps {
  date: string;
  shift: ScheduleShift;
  staffId?: string;
  slot: ShiftSlotDraft;
  slotIndex: number;
  rooms: ScheduleFormBootstrapResponse['rooms'];
  canRemove: boolean;
  onUpdate: (updated: Partial<ShiftSlotDraft>) => void;
  onRemove: () => void;
}

function ShiftSlotRow({
  date,
  shift,
  staffId,
  slot,
  slotIndex,
  rooms,
  canRemove,
  onUpdate,
  onRemove
}: ShiftSlotRowProps) {
  const { data: slotAvailability, isLoading: isLoadingSlots } = useQuery({
    ...scheduleSlotAvailabilityQueryOptions({
      date,
      shift: CANONICAL_TO_API_SHIFT[shift],
      roomId: slot.roomId,
      staffId: staffId || undefined
    }),
    enabled: Boolean(date && slot.roomId)
  });

  // Auto-sync jamSelesai if jamMulai is present and matches a slot from availability
  useEffect(() => {
    if (slot.jamMulai && !slot.jamSelesai && slotAvailability?.slots) {
      const matched = slotAvailability.slots.find((s) => s.time === slot.jamMulai);
      if (matched) {
        onUpdate({
          jamSelesai: matched.endTime
        });
      }
    }
  }, [slot.jamMulai, slot.jamSelesai, slotAvailability?.slots, onUpdate]);

  const handleRoomChange = (selectedRoomId: string) => {
    const matchedRoom = rooms.find((r) => r.id === selectedRoomId);
    onUpdate({
      roomId: selectedRoomId,
      roomName: matchedRoom?.name ?? slot.roomName,
      jamMulai: '',
      jamSelesai: ''
    });
  };

  const handleStartTimeChange = (selectedTime: string) => {
    const matchedSlot = slotAvailability?.slots.find((s) => s.time === selectedTime);
    if (matchedSlot) {
      onUpdate({
        jamMulai: matchedSlot.time,
        jamSelesai: matchedSlot.endTime
      });
    }
  };

  return (
    <div className='p-3 rounded-xl border border-border/50 bg-background/60 space-y-2.5 shadow-2xs'>
      <div className='flex items-center justify-between gap-2'>
        <span className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider'>
          Slot {slotIndex + 1}
        </span>
        {canRemove && (
          <button
            type='button'
            onClick={onRemove}
            aria-label='Hapus slot antrean'
            className='p-1 rounded-md text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer'
          >
            <Icons.trash className='size-3.5' />
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-2.5'>
        {/* Ruangan Dropdown (Backend SSOT) */}
        <div>
          <Label className='text-[11px] font-semibold text-foreground/80 block mb-1'>
            Ruang Praktik
          </Label>
          <Select value={slot.roomId || undefined} onValueChange={handleRoomChange}>
            <SelectTrigger className='w-full h-8 text-xs truncate'>
              <SelectValue placeholder={SCHEDULE_TIME_LABELS.SELECT_ROOM} />
            </SelectTrigger>
            <SelectContent className='z-[70]'>
              {rooms.length === 0 ? (
                <div className='flex items-center justify-center gap-2 p-3 text-xs text-muted-foreground font-sans'>
                  {isLoadingSlots ? (
                    <>
                      <Spinner className='size-3.5 text-primary' />
                      <span>Memuat ruangan...</span>
                    </>
                  ) : (
                    <span>Tidak ada ruangan</span>
                  )}
                </div>
              ) : (
                rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id} disabled={room.isOccupied}>
                    {room.name}
                    {room.isOccupied
                      ? ` (Terisi: ${room.occupiedBy ?? SCHEDULE_OCCUPANT_LABELS.OTHER_DOCTOR})`
                      : ''}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Jam Mulai (Pre-Rendered Dropdown SSOT) */}
        <div>
          <Label className='text-[11px] font-semibold text-foreground/80 block mb-1'>
            Jam Mulai
          </Label>
          <Select
            value={
              slotAvailability?.slots?.some((s) => s.time === slot.jamMulai)
                ? slot.jamMulai
                : undefined
            }
            onValueChange={handleStartTimeChange}
            disabled={!slot.roomId}
          >
            <SelectTrigger className='w-full h-8 text-xs font-mono font-semibold'>
              <SelectValue
                placeholder={
                  !slot.roomId
                    ? 'Pilih Ruangan Dulu'
                    : isLoadingSlots
                      ? SCHEDULE_TIME_LABELS.LOADING_SLOTS
                      : SCHEDULE_TIME_LABELS.SELECT_TIME
                }
              >
                {slot.jamMulai ? `${slot.jamMulai} WIB` : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className='max-h-56 z-[70] min-w-[15rem]'>
              {!slot.roomId ? (
                <div className='p-2 text-xs text-muted-foreground text-center font-sans'>
                  Pilih ruangan praktik terlebih dahulu
                </div>
              ) : isLoadingSlots ? (
                <div className='flex items-center justify-center gap-2 p-3 text-xs text-muted-foreground font-sans'>
                  <Spinner className='size-3.5 text-primary' />
                  <span>{SCHEDULE_TIME_LABELS.LOADING_SLOTS}</span>
                </div>
              ) : slotAvailability?.slots && slotAvailability.slots.length > 0 ? (
                slotAvailability.slots.map((s) => {
                  const hasTimeInLabel =
                    Boolean(s.displayLabel) &&
                    (s.displayLabel.includes(s.time) || s.displayLabel.includes(s.endTime));
                  const statusText =
                    s.conflict?.occupantName
                      ? `Terisi: ${s.conflict.occupantName}`
                      : s.displayLabel || (s.isAvailable ? 'Tersedia' : 'Terisi');
                  const label = hasTimeInLabel
                    ? s.displayLabel
                    : `${s.time} - ${s.endTime} WIB (${statusText})`;

                  return (
                    <SelectItem
                      key={s.slotIndex}
                      value={s.time}
                      disabled={!s.isAvailable}
                      className='font-mono text-xs'
                    >
                      {label}
                    </SelectItem>
                  );
                })
              ) : (
                <div className='p-2 text-xs text-muted-foreground text-center font-sans'>
                  Tidak ada slot tersedia
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Jam Selesai (WYSIWYG Otomatis) */}
        <div>
          <Label className='text-[11px] font-semibold text-foreground/80 block mb-1'>
            Jam Selesai
          </Label>
          <div className='w-full h-8 px-2.5 rounded-md border border-border/50 bg-muted/40 text-xs font-mono font-semibold text-foreground flex items-center justify-between select-none'>
            <span>
              {slot.jamSelesai
                ? `${slot.jamSelesai} ${SCHEDULE_TIME_LABELS.TIMEZONE}`
                : SCHEDULE_TIME_LABELS.DASH}
            </span>
            <span className='text-[10px] font-sans font-medium text-muted-foreground'>
              {SCHEDULE_TIME_LABELS.AUTOMATIC}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ScheduleShiftPanelProps {
  shift: ScheduleShift;
  date: string;
  staffId?: string;
  bootstrapShift: ScheduleFormBootstrapResponse['shifts'][number] | undefined;
  defaultRoomId: string;
  rooms: ScheduleFormBootstrapResponse['rooms'];
  consultationDuration: number;
  isActive: boolean;
  slots: ShiftSlotDraft[];
  onToggleActive: (active: boolean) => void;
  onAddSlot: () => void;
  onUpdateSlot: (slotId: string, updated: Partial<ShiftSlotDraft>) => void;
  onRemoveSlot: (slotId: string) => void;
}

function ScheduleShiftPanel({
  shift,
  date,
  staffId,
  bootstrapShift,
  defaultRoomId,
  rooms,
  consultationDuration,
  isActive,
  slots,
  onToggleActive,
  onAddSlot,
  onUpdateSlot,
  onRemoveSlot
}: ScheduleShiftPanelProps) {
  const shiftBounds = SCHEDULE_SHIFT_BOUNDARIES[shift];
  const targetRoomId = defaultRoomId || rooms[0]?.id || '';

  // Dual-Axis Backend Delegation: fetch live slot availability for this shift & room
  const { data: slotAvailability } = useQuery({
    ...scheduleSlotAvailabilityQueryOptions({
      date,
      shift: CANONICAL_TO_API_SHIFT[shift],
      roomId: targetRoomId,
      staffId: staffId || undefined
    }),
    enabled: Boolean(date && targetRoomId)
  });

  const allRoomsOccupied = rooms.length > 0 && rooms.every((r) => r.isOccupied);

  const guard = isSessionShiftUnavailable({
    selectedDate: date,
    isPastFromBackend: bootstrapShift?.isPast,
    hasExistingSchedule: Boolean(bootstrapShift?.existingSchedule),
    allRoomsOccupied,
    occupancy: slotAvailability
      ? {
          totalSlots: slotAvailability.summary?.totalSlots ?? 0,
          availableSlotsCount: slotAvailability.summary?.availableSlots ?? 0,
          slots: slotAvailability.slots.map((s) => ({
            startTime: s.time,
            isAvailable: Boolean(s.isAvailable)
          }))
        }
      : undefined,
    bounds: {
      startMinutes: shiftBounds.startHour * 60,
      endMinutes: shiftBounds.endHour * 60,
      defaultStart: shiftBounds.startTime,
      defaultEnd: shiftBounds.endTime
    },
    consultationDuration,
    isEditingThisSession: false
  });

  const availableCount = slotAvailability?.summary?.availableSlots ?? 0;
  const isExpanded = !guard.unavailable && isActive;

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all p-3.5',
        guard.unavailable
          ? 'bg-muted/30 border-border/40 opacity-70'
          : isExpanded
            ? 'bg-card border-primary/30 shadow-xs'
            : 'bg-card border-border/60 hover:border-border'
      )}
    >
      <div className='flex items-center justify-between gap-3'>
        <button
          type='button'
          disabled={guard.unavailable}
          className={cn(
            'flex-1 min-w-0 text-left bg-transparent border-0 p-0 select-none',
            guard.unavailable ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
          onClick={() => !guard.unavailable && onToggleActive(!isExpanded)}
        >
          <div className='flex items-center gap-2 flex-wrap'>
            <h4 className='text-sm font-bold text-foreground'>
              Sesi {SCHEDULE_SHIFT_LABELS[shift]}
            </h4>

            {guard.unavailable && guard.reason && (
              <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20'>
                • {guard.reason}
              </span>
            )}

            {!guard.unavailable && availableCount > 0 && (
              <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'>
                • {availableCount} tersedia
              </span>
            )}
          </div>

          <p className='text-xs text-muted-foreground mt-0.5 font-medium'>
            {shiftBounds.timeRange}
          </p>
        </button>

        {/* Parent Switch terkunci jika shift unavailable */}
        <Switch
          checked={isExpanded}
          disabled={guard.unavailable}
          onCheckedChange={(checked) => !guard.unavailable && onToggleActive(checked)}
          aria-label={`Aktifkan sesi ${SCHEDULE_SHIFT_LABELS[shift]}`}
        />
      </div>

      {isExpanded && (
        <div className='mt-3.5 space-y-3 pt-3 border-t border-border/40'>
          {slots.map((slot, index) => (
            <ShiftSlotRow
              key={slot.id}
              date={date}
              shift={shift}
              staffId={staffId}
              slot={slot}
              slotIndex={index}
              rooms={rooms}
              canRemove={slots.length > 1}
              onUpdate={(updated) => onUpdateSlot(slot.id, updated)}
              onRemove={() => onRemoveSlot(slot.id)}
            />
          ))}

          <div className='flex justify-end pt-1'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              shape='pill'
              onClick={onAddSlot}
              className='h-7 px-3 text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs'
            >
              <Icons.add className='size-3' />
              <span>{SCHEDULE_BUTTON_LABELS.ADD_MORE_SLOT}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DoctorAddSessionModal({
  doctor,
  isOpen,
  onClose,
  onSessionAdded,
  portalContainerRef,
  targetDate,
  initialStartTime
}: DoctorAddSessionModalProps) {
  const queryClient = useQueryClient();

  const defaultDate = useMemo(() => {
    if (targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())) {
      return targetDate.trim();
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, [targetDate]);

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const doctorStaffId = doctor?.practitioner_id || doctor?.id || '';

  // 1. Fetch Form Bootstrap (SSOT for doctor preferences, active rooms, and shifts)
  const { data: bootstrapData } = useQuery({
    ...scheduleFormBootstrapQueryOptions({
      date: selectedDate,
      staffId: doctorStaffId || undefined
    }),
    enabled: isOpen && Boolean(selectedDate)
  });

  // 2. Fetch Master Clinic Rooms (instant cache fallback to prevent 0-item dropdown)
  const { data: clinicRooms = [] } = useQuery({
    ...clinicRoomsQueryOptions(),
    enabled: isOpen
  });

  // Unified rooms: prefer date-specific bootstrap rooms (which contain live occupancy), fallback to clinic master rooms
  const rooms = useMemo(() => {
    if (bootstrapData?.rooms && bootstrapData.rooms.length > 0) {
      return bootstrapData.rooms;
    }
    return clinicRooms.map((cr) => ({
      id: cr.id,
      name: cr.name,
      isOccupied: cr.isOccupied ?? false,
      occupiedBy: cr.occupiedBy ?? null,
      location: cr.location ?? null,
      floor: cr.floor ?? null
    }));
  }, [bootstrapData?.rooms, clinicRooms]);

  // Form State: 4 Shifts with array of slots
  const [shiftsState, setShiftsState] = useState<
    Record<ScheduleShift, { active: boolean; slots: ShiftSlotDraft[] }>
  >({
    [SCHEDULE_SHIFT.DINI_HARI]: { active: false, slots: [] },
    [SCHEDULE_SHIFT.PAGI]: { active: false, slots: [] },
    [SCHEDULE_SHIFT.SIANG]: { active: false, slots: [] },
    [SCHEDULE_SHIFT.MALAM]: { active: false, slots: [] }
  });

  const createInitialSlot = useCallback(
    (initialTime = ''): ShiftSlotDraft => {
      const doctorRoom = doctor?.ruang_praktik?.trim();
      const matchedDoctorRoom = rooms.find(
        (r) =>
          r.name.toLowerCase() === doctorRoom?.toLowerCase() ||
          r.id.toLowerCase() === doctorRoom?.toLowerCase()
      );

      const defaultRoomId =
        bootstrapData?.doctor?.defaultRoomId ||
        matchedDoctorRoom?.id ||
        (rooms.length > 0 ? rooms[0].id : '');
      const defaultRoomName =
        bootstrapData?.doctor?.defaultRoomName ||
        matchedDoctorRoom?.name ||
        (rooms.length > 0 ? rooms[0].name : '');
      const defaultPoliId = bootstrapData?.doctor?.defaultPoliklinikId ?? '';
      const defaultPoliName = bootstrapData?.doctor?.defaultPoliklinikName ?? '';

      let defaultEndTime = '';
      if (initialTime && /^\d{1,2}:\d{2}/.test(initialTime)) {
        const [h, m] = initialTime.split(':').map(Number);
        const duration = bootstrapData?.doctor?.consultationDurationMinutes || 30;
        const total = h * 60 + m + duration;
        const endH = Math.floor(total / 60) % 24;
        const endM = total % 60;
        defaultEndTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      }

      return {
        id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        jamMulai: initialTime,
        jamSelesai: defaultEndTime,
        roomId: defaultRoomId,
        roomName: defaultRoomName,
        poliklinikId: defaultPoliId,
        poliklinikName: defaultPoliName,
        kuotaPasien: 1
      };
    },
    [bootstrapData, doctor, rooms]
  );

  // Auto-populate roomId on existing draft slots if they were created before rooms finished loading
  useEffect(() => {
    if (rooms.length > 0) {
      setShiftsState((prev) => {
        let changed = false;
        const updated = { ...prev };
        ALL_SCHEDULE_SHIFTS.forEach((shift) => {
          const shiftState = prev[shift];
          if (shiftState.slots.some((s) => !s.roomId)) {
            changed = true;
            const doctorRoom = doctor?.ruang_praktik?.trim();
            const matchedDoctorRoom = rooms.find(
              (r) =>
                r.name.toLowerCase() === doctorRoom?.toLowerCase() ||
                r.id.toLowerCase() === doctorRoom?.toLowerCase()
            );
            const fallbackId =
              bootstrapData?.doctor?.defaultRoomId ||
              matchedDoctorRoom?.id ||
              rooms[0].id;
            const fallbackName =
              bootstrapData?.doctor?.defaultRoomName ||
              matchedDoctorRoom?.name ||
              rooms[0].name;

            updated[shift] = {
              ...shiftState,
              slots: shiftState.slots.map((s) =>
                s.roomId ? s : { ...s, roomId: fallbackId, roomName: fallbackName }
              )
            };
          }
        });
        return changed ? updated : prev;
      });
    }
  }, [rooms, bootstrapData, doctor]);

  // Reset or initialize shifts state on modal open or date change
  useEffect(() => {
    if (isOpen) {
      const initialDateValue =
        targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())
          ? targetDate.trim()
          : defaultDate;
      setSelectedDate(initialDateValue);

      const targetShift = initialStartTime
        ? resolveCanonicalShift(initialStartTime)
        : SCHEDULE_SHIFT.PAGI;

      const initialDraft = createInitialSlot(initialStartTime ?? '');

      setShiftsState({
        [SCHEDULE_SHIFT.DINI_HARI]: {
          active: targetShift === SCHEDULE_SHIFT.DINI_HARI,
          slots: targetShift === SCHEDULE_SHIFT.DINI_HARI ? [initialDraft] : []
        },
        [SCHEDULE_SHIFT.PAGI]: {
          active: targetShift === SCHEDULE_SHIFT.PAGI,
          slots: targetShift === SCHEDULE_SHIFT.PAGI ? [initialDraft] : []
        },
        [SCHEDULE_SHIFT.SIANG]: {
          active: targetShift === SCHEDULE_SHIFT.SIANG,
          slots: targetShift === SCHEDULE_SHIFT.SIANG ? [initialDraft] : []
        },
        [SCHEDULE_SHIFT.MALAM]: {
          active: targetShift === SCHEDULE_SHIFT.MALAM,
          slots: targetShift === SCHEDULE_SHIFT.MALAM ? [initialDraft] : []
        }
      });
    }
  }, [isOpen, targetDate, defaultDate, initialStartTime, createInitialSlot]);

  const handleToggleShiftActive = (shift: ScheduleShift, active: boolean) => {
    setShiftsState((prev) => {
      const currentShiftState = prev[shift];
      const newSlots =
        active && currentShiftState.slots.length === 0
          ? [createInitialSlot()]
          : currentShiftState.slots;

      return {
        ...prev,
        [shift]: {
          active,
          slots: newSlots
        }
      };
    });
  };

  const handleAddSlotToShift = (shift: ScheduleShift) => {
    const currentShiftState = shiftsState[shift];
    const slots = currentShiftState.slots;
    const shiftBounds = SCHEDULE_SHIFT_BOUNDARIES[shift];
    const duration = bootstrapData?.doctor?.consultationDurationMinutes;

    if (slots.length > 0) {
      const lastSlot = slots[slots.length - 1];
      if (!lastSlot.jamMulai) {
        toast.error(SCHEDULE_TOAST_MESSAGES.SELECT_PREVIOUS_SLOT_FIRST);
        return;
      }

      const endMinutes = parseTimeToMinutes(lastSlot.jamSelesai);
      if (
        endMinutes !== null &&
        duration &&
        duration > 0 &&
        endMinutes + duration > shiftBounds.endHour * 60
      ) {
        toast.error(SCHEDULE_TOAST_MESSAGES.SHIFT_TIME_EXHAUSTED);
        return;
      }
    }

    setShiftsState((prev) => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        slots: [...prev[shift].slots, createInitialSlot()]
      }
    }));
  };

  const handleUpdateSlot = (
    shift: ScheduleShift,
    slotId: string,
    updated: Partial<ShiftSlotDraft>
  ) => {
    setShiftsState((prev) => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        slots: prev[shift].slots.map((s) => (s.id === slotId ? { ...s, ...updated } : s))
      }
    }));
  };

  const handleRemoveSlot = (shift: ScheduleShift, slotId: string) => {
    setShiftsState((prev) => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        slots: prev[shift].slots.filter((s) => s.id !== slotId)
      }
    }));
  };

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
    if (!selectedDateObj) return SCHEDULE_TIME_LABELS.CHOOSE_DATE;
    return selectedDateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [selectedDateObj]);

  const activeSlotsList = useMemo(() => {
    const list: Array<{ shift: ScheduleShift; slot: ShiftSlotDraft }> = [];
    ALL_SCHEDULE_SHIFTS.forEach((shift) => {
      const state = shiftsState[shift];
      if (state.active) {
        state.slots.forEach((slot) => {
          list.push({ shift, slot });
        });
      }
    });
    return list;
  }, [shiftsState]);

  const isFormValid = useMemo(() => {
    if (activeSlotsList.length === 0) return false;
    return activeSlotsList.every(
      (item) => item.slot.jamMulai !== '' && item.slot.jamSelesai !== ''
    );
  }, [activeSlotsList]);

  if (!doctor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const duration = bootstrapData?.doctor?.consultationDurationMinutes;
      let lastCreatedSession: DoctorDailySession | undefined;

      for (const item of activeSlotsList) {
        const { shift, slot } = item;
        const sessionName = SCHEDULE_SHIFT_LABELS[shift];

        const startMin = parseTimeToMinutes(slot.jamMulai);
        const endMin = parseTimeToMinutes(slot.jamSelesai);
        const dynamicCapacity =
          startMin !== null && endMin !== null && duration && duration > 0
            ? Math.max(1, Math.round((endMin - startMin) / duration))
            : 1;

        const payload = {
          schedule_date: selectedDate,
          nama_sesi: sessionName,
          session: shift,
          jam_mulai: slot.jamMulai,
          jam_selesai: slot.jamSelesai,
          startTime: slot.jamMulai,
          endTime: slot.jamSelesai,
          kuota_pasien: dynamicCapacity,
          slot_tersedia: dynamicCapacity,
          capacity: dynamicCapacity,
          status: SCHEDULE_STATUS.OPEN,
          status_sesi: SCHEDULE_STATUS.OPEN,
          ruang: slot.roomName,
          roomId: slot.roomId
        };

        await createDoctorSession(doctor.id, payload);

        lastCreatedSession = {
          id: `${doctor.id}-s-${Date.now()}`,
          nama_sesi: sessionName,
          jam_mulai: slot.jamMulai,
          jam_selesai: slot.jamSelesai,
          waktu: `${slot.jamMulai} - ${slot.jamSelesai} ${SCHEDULE_TIME_LABELS.TIMEZONE}`,
          kuota_pasien: dynamicCapacity,
          slot_tersedia: dynamicCapacity,
          status_sesi: SCHEDULE_STATUS.OPEN,
          ruang: slot.roomName
        };
      }

      // Canonical multi-client post-mutation sync
      await syncAllDoctorSchedules(queryClient);

      toast.success(
        SCHEDULE_TOAST_MESSAGES.SESSIONS_ADDED_SUCCESS(
          activeSlotsList.length,
          doctor.nama_dokter
        )
      );

      if (lastCreatedSession) {
        onSessionAdded?.(lastCreatedSession);
      }

      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : SCHEDULE_TOAST_MESSAGES.SESSIONS_ADDED_ERROR;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[580px]'
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-4'>
        {/* Header Identitas & Tanggal */}
        <div className='flex items-center justify-between gap-3 pb-3 border-b border-border/40'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base font-bold text-foreground tracking-tight'>
              Tambah Sesi Praktik Dokter
            </h3>
            <p className='text-xs text-muted-foreground truncate'>
              {doctor.nama_dokter} •{' '}
              {doctor.spesialisasi.toLowerCase().startsWith('poli')
                ? doctor.spesialisasi
                : `Poli ${doctor.spesialisasi}`}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup'
            className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* Tanggal Praktik Selector */}
        <div className='flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-muted/20'>
          <div>
            <Label className='text-xs font-semibold text-foreground/80 block'>
              Tanggal Praktik
            </Label>
            <span className='text-xs font-mono font-medium text-muted-foreground'>
              {formattedDisplayDate}
            </span>
          </div>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type='button'
                variant='outline'
                size='sm'
                shape='pill'
                className='h-8 px-3 text-xs font-medium gap-1.5 shadow-2xs hover:bg-muted/50 cursor-pointer'
              >
                <Icons.calendar className='size-3.5 text-muted-foreground shrink-0' />
                <span>{SCHEDULE_BUTTON_LABELS.CHANGE_DATE}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className='w-auto p-0 z-[70] shadow-xl'
              align='end'
              sideOffset={8}
            >
              <Calendar
                mode='single'
                selected={selectedDateObj}
                onSelect={(d) => {
                  if (d) {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    setSelectedDate(`${y}-${m}-${day}`);
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* 4 Canonical Shift Panels (Zero-Client-Calculation with Observer Guards) */}
        <div className='max-h-[50vh] overflow-y-auto space-y-3 pr-1'>
          {ALL_SCHEDULE_SHIFTS.map((shift) => {
            const shiftState = shiftsState[shift];
            const apiShift = CANONICAL_TO_API_SHIFT[shift];
            const bootstrapShift = bootstrapData?.shifts?.find(
              (s) =>
                s.id === apiShift ||
                s.code === apiShift ||
                DB_STAFF_SHIFT_MAP[s.code] === shift
            );

            return (
              <ScheduleShiftPanel
                key={shift}
                shift={shift}
                date={selectedDate}
                staffId={doctorStaffId}
                bootstrapShift={bootstrapShift}
                defaultRoomId={
                  bootstrapData?.doctor?.defaultRoomId ||
                  (rooms.length > 0 ? rooms[0].id : '')
                }
                rooms={rooms}
                consultationDuration={
                  bootstrapData?.doctor?.consultationDurationMinutes ?? 0
                }
                isActive={shiftState.active}
                slots={shiftState.slots}
                onToggleActive={(active) => handleToggleShiftActive(shift, active)}
                onAddSlot={() => handleAddSlotToShift(shift)}
                onUpdateSlot={(slotId, updated) =>
                  handleUpdateSlot(shift, slotId, updated)
                }
                onRemoveSlot={(slotId) => handleRemoveSlot(shift, slotId)}
              />
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className='pt-2 flex items-center justify-end gap-2.5 border-t border-border/40'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='sm'
            onClick={onClose}
            disabled={isSubmitting}
            className='px-4 font-medium text-xs'
          >
            {SCHEDULE_BUTTON_LABELS.CANCEL}
          </Button>
          <Button
            type='submit'
            variant='default'
            shape='pill'
            size='sm'
            disabled={!isFormValid || isSubmitting}
            className='px-5 font-semibold text-xs'
          >
            {isSubmitting ? (
              <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
            ) : (
              <Icons.check className='mr-1.5 size-3.5' />
            )}
            {SCHEDULE_BUTTON_LABELS.SAVE_SCHEDULE} ({activeSlotsList.length} Sesi)
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
