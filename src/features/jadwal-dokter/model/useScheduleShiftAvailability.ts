import { useMemo } from 'react';
import {
  ALL_SCHEDULE_SHIFTS,
  SCHEDULE_SHIFT_BOUNDARIES,
  SCHEDULE_UNAVAILABLE_REASONS,
  type ScheduleShift,
  type ScheduleUnavailableReason
} from '../constants/schedule-shift.constants';
import { isSessionShiftUnavailable } from '../utils/schedule-availability-guard';
import { resolveCanonicalShift } from '../utils/shift-slot-builder';
import type { DoctorDailySession } from '../api/types';

export interface ShiftAvailabilityStatus {
  isUnavailable: boolean;
  reason: ScheduleUnavailableReason | null;
  badgeLabel: string | null;
}

export interface UseScheduleShiftAvailabilityParams {
  selectedDate: string;
  existingSessions?: DoctorDailySession[];
  consultationDuration?: number;
}

export function evaluateShiftAvailability({
  selectedDate,
  existingSessions = [],
  consultationDuration = 30
}: UseScheduleShiftAvailabilityParams): Record<ScheduleShift, ShiftAvailabilityStatus> {
  const result = {} as Record<ScheduleShift, ShiftAvailabilityStatus>;

  for (const shift of ALL_SCHEDULE_SHIFTS) {
    const shiftBounds = SCHEDULE_SHIFT_BOUNDARIES[shift];
    const hasExisting = existingSessions.some((s) => {
      const canonical = resolveCanonicalShift(s.nama_sesi || s.jam_mulai);
      return canonical === shift;
    });

    const guard = isSessionShiftUnavailable({
      selectedDate,
      isPastFromBackend: false,
      hasExistingSchedule: hasExisting,
      bounds: {
        startMinutes: shiftBounds.startHour * 60,
        endMinutes: shiftBounds.endHour * 60,
        defaultStart: shiftBounds.startTime,
        defaultEnd: shiftBounds.endTime
      },
      consultationDuration
    });

    let badgeLabel: string | null = null;
    if (guard.unavailable) {
      if (hasExisting) {
        badgeLabel = 'Sudah Ada Jadwal';
      } else if (
        guard.reason === SCHEDULE_UNAVAILABLE_REASONS.PAST ||
        guard.reason === SCHEDULE_UNAVAILABLE_REASONS.TIME_EXHAUSTED
      ) {
        badgeLabel = 'Sudah Berlalu';
      } else if (guard.reason === SCHEDULE_UNAVAILABLE_REASONS.FULL) {
        badgeLabel = 'Penuh';
      }
    }

    result[shift] = {
      isUnavailable: guard.unavailable,
      reason: guard.reason,
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
