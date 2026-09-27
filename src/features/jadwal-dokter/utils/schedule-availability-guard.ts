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

/**
 * Parent Switch Observer Guard
 * Standardized with Mobile Flutter & Backend Delegation Specification (CHG-20260925-SCHED-003)
 * Pure function with zero magic strings and zero client guessing.
 */
export function isSessionShiftUnavailable({
  sessionId: _sessionId,
  selectedDate,
  isPastFromBackend,
  hasExistingSchedule = false,
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

  // 1. Shift is in the past by calendar date or backend flag
  if (isBeforeToday || isPastFromBackend) {
    return { unavailable: true, reason: SCHEDULE_UNAVAILABLE_REASONS.PAST };
  }

  // Pengecualian: Mode Edit Jadwal Sendiri (tetap aktif jika bukan tanggal lampau)
  if (isEditingThisSession) {
    return { unavailable: false, reason: null };
  }

  // 1b. Jika dokter sudah memiliki sesi pada shift ini (pada mode tambah)
  if (hasExistingSchedule) {
    return { unavailable: true, reason: SCHEDULE_UNAVAILABLE_REASONS.FULL };
  }

  // 1c. Jika seluruh ruangan praktik sudah terisi penuh
  if (allRoomsOccupied) {
    return { unavailable: true, reason: SCHEDULE_UNAVAILABLE_REASONS.FULL };
  }

  // 2. Sumbu Waktu: Evaluasi pada hari ini
  if (isToday) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 2a. Batas jam shift sudah berakhir hari ini
    if (currentMinutes >= bounds.endMinutes) {
      return { unavailable: true, reason: SCHEDULE_UNAVAILABLE_REASONS.PAST };
    }

    // 2b. Sisa waktu shift kurang dari durasi minimal konsultasi pasien
    if (consultationDuration > 0 && bounds.endMinutes - currentMinutes < consultationDuration) {
      return { unavailable: true, reason: SCHEDULE_UNAVAILABLE_REASONS.TIME_EXHAUSTED };
    }
  }

  // 3. Sumbu Okupansi: Kuota shift penuh di seluruh ruangan (availableSlotsCount == 0)
  if (occupancy && occupancy.totalSlots > 0 && occupancy.availableSlotsCount === 0) {
    return { unavailable: true, reason: SCHEDULE_UNAVAILABLE_REASONS.FULL };
  }

  // 4. Sumbu Okupansi: Seluruh slot masa depan hari ini telah terisi dokter lain / lampau
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
