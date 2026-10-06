import {
  SCHEDULE_UNAVAILABLE_REASONS,
  type ScheduleUnavailableReason
} from '../constants/schedule-shift.constants';

export interface ShiftBoundary {
  startMinutes: number;
  endMinutes: number;
  defaultStart: string;
  defaultEnd: string;
}

export function parseTimeToMinutes(timeStr?: string | null): number | null {
  if (!timeStr) return null;
  const clean = timeStr.replace(/WIB|AM|PM/gi, '').trim();
  const [hStr, mStr] = clean.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

export interface IsSessionShiftUnavailableParams {
  sessionId?: string;
  selectedDate: Date | string;
  isPastFromBackend?: boolean;
  hasExistingSchedule?: boolean;
  allRoomsOccupied?: boolean;
  occupancy?: {
    totalSlots: number;
    availableSlotsCount: number;
    slots?: Array<{ startTime: string; isAvailable: boolean }>;
  };
  bounds: ShiftBoundary;
  consultationDuration?: number;
  isEditingThisSession?: boolean;
  referenceNow?: Date;
}

export interface AvailabilityGuardResult {
  unavailable: boolean;
  reason: ScheduleUnavailableReason | null;
}

export function isSessionShiftUnavailable({
  sessionId: _sessionId,
  selectedDate,
  isPastFromBackend,
  hasExistingSchedule: _hasExistingSchedule = false,
  allRoomsOccupied = false,
  occupancy,
  bounds,
  consultationDuration = 0,
  isEditingThisSession = false,
  referenceNow
}: IsSessionShiftUnavailableParams): AvailabilityGuardResult {
  const now = referenceNow ?? new Date();

  let selectedYear: number;
  let selectedMonth: number;
  let selectedDay: number;

  if (typeof selectedDate === 'string') {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      selectedYear = parseInt(parts[0], 10);
      selectedMonth = parseInt(parts[1], 10) - 1;
      selectedDay = parseInt(parts[2], 10);
    } else {
      selectedYear = 0;
      selectedMonth = 0;
      selectedDay = 0;
    }
  } else {
    selectedYear = selectedDate.getFullYear();
    selectedMonth = selectedDate.getMonth();
    selectedDay = selectedDate.getDate();
  }

  const targetDateOnly = new Date(selectedYear, selectedMonth, selectedDay);
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const isBeforeToday = targetDateOnly.getTime() < nowDateOnly.getTime();
  const isToday = targetDateOnly.getTime() === nowDateOnly.getTime();

  if (isBeforeToday || isPastFromBackend) {
    return { unavailable: true, reason: SCHEDULE_UNAVAILABLE_REASONS.PAST };
  }

  if (isEditingThisSession) {
    return { unavailable: false, reason: null };
  }

  if (allRoomsOccupied) {
    return { unavailable: true, reason: SCHEDULE_UNAVAILABLE_REASONS.FULL };
  }

  if (isToday) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (currentMinutes >= bounds.endMinutes) {
      return { unavailable: true, reason: SCHEDULE_UNAVAILABLE_REASONS.PAST };
    }

    if (consultationDuration > 0 && bounds.endMinutes - currentMinutes < consultationDuration) {
      return { unavailable: true, reason: SCHEDULE_UNAVAILABLE_REASONS.TIME_EXHAUSTED };
    }
  }

  if (occupancy && occupancy.totalSlots > 0 && occupancy.availableSlotsCount === 0) {
    return { unavailable: true, reason: SCHEDULE_UNAVAILABLE_REASONS.FULL };
  }

  if (isToday && occupancy?.slots && occupancy.slots.length > 0) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const hasFutureAvailable = occupancy.slots.some((s) => {
      const startM = parseTimeToMinutes(s.startTime);
      return startM !== null && startM >= currentMinutes && s.isAvailable;
    });
    if (!hasFutureAvailable) {
      return { unavailable: true, reason: SCHEDULE_UNAVAILABLE_REASONS.FULL };
    }
  }

  return { unavailable: false, reason: null };
}
