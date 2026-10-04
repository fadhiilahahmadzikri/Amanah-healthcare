import { useMemo } from 'react';
import {
  ALL_SCHEDULE_SHIFTS,
  SCHEDULE_SHIFT_BOUNDARIES,
  SCHEDULE_UNAVAILABLE_REASONS,
  type ScheduleShift,
  type ScheduleUnavailableReason
} from '../constants/schedule-shift.constants';
import {
  isSessionShiftUnavailable,
  parseTimeToMinutes
} from '../utils/schedule-availability-guard';
import type { DoctorDailySession } from '../api/types';

export interface ShiftAvailabilityStatus {
  isUnavailable: boolean;
  reason: ScheduleUnavailableReason | null;
  badgeLabel: string | null;
}

export interface ShiftOccupancyData {
  totalSlots: number;
  availableSlotsCount: number;
  slots?: Array<{ startTime: string; isAvailable: boolean }>;
}

export interface UseScheduleShiftAvailabilityParams {
  selectedDate: string;
  existingSessions?: DoctorDailySession[];
  consultationDuration?: number;
  occupancyByShift?: Partial<Record<ScheduleShift, ShiftOccupancyData>>;
}

export function evaluateShiftAvailability({
  selectedDate,
  existingSessions = [],
  consultationDuration = 30,
  occupancyByShift
}: UseScheduleShiftAvailabilityParams): Record<ScheduleShift, ShiftAvailabilityStatus> {
  const result = {} as Record<ScheduleShift, ShiftAvailabilityStatus>;

  for (const shift of ALL_SCHEDULE_SHIFTS) {
    const shiftBounds = SCHEDULE_SHIFT_BOUNDARIES[shift];
    const shiftStartM = shiftBounds.startHour * 60;
    const shiftEndM = shiftBounds.endHour * 60;
    const totalShiftMinutes = shiftEndM - shiftStartM;

    // Calculate minutes occupied by doctor's existing sessions within this shift boundary
    let occupiedMinutes = 0;
    for (const session of existingSessions) {
      const sStart = parseTimeToMinutes(session.jam_mulai);
      const sEnd = parseTimeToMinutes(session.jam_selesai);
      if (sStart !== null && sEnd !== null) {
        const overlap = Math.max(0, Math.min(sEnd, shiftEndM) - Math.max(sStart, shiftStartM));
        occupiedMinutes += overlap;
      }
    }

    const remainingMinutes = totalShiftMinutes - occupiedMinutes;
    const isCompletelyFull = remainingMinutes < consultationDuration;

    const guard = isSessionShiftUnavailable({
      selectedDate,
      isPastFromBackend: false,
      bounds: {
        startMinutes: shiftStartM,
        endMinutes: shiftEndM,
        defaultStart: shiftBounds.startTime,
        defaultEnd: shiftBounds.endTime
      },
      consultationDuration
    });

    let isUnavailable = guard.unavailable;
    let reason = guard.reason;
    let badgeLabel: string | null = null;

    if (!isUnavailable && isCompletelyFull) {
      isUnavailable = true;
      reason = SCHEDULE_UNAVAILABLE_REASONS.FULL;
    }

    if (isUnavailable) {
      if (
        reason === SCHEDULE_UNAVAILABLE_REASONS.PAST ||
        reason === SCHEDULE_UNAVAILABLE_REASONS.TIME_EXHAUSTED
      ) {
        badgeLabel = 'Sudah Berlalu';
      } else if (reason === SCHEDULE_UNAVAILABLE_REASONS.FULL) {
        badgeLabel = 'Penuh';
      }
    }

    result[shift] = {
      isUnavailable,
      reason,
      badgeLabel
    };
  }

  return result;
}

export function useScheduleShiftAvailability({
  selectedDate,
  existingSessions = [],
  consultationDuration = 30
}: UseScheduleShiftAvailabilityParams): Record<ScheduleShift, ShiftAvailabilityStatus> {
  return useMemo(
    () =>
      evaluateShiftAvailability({
        selectedDate,
        existingSessions,
        consultationDuration
      }),
    [selectedDate, existingSessions, consultationDuration]
  );
}
