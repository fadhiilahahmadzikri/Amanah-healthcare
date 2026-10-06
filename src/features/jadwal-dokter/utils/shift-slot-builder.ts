import type { DoctorDailySession, TimelineInterval } from '../api/types';
import type {
  OccupancyShift,
  OccupancySlot
} from '@/server/contracts/schedules/doctor-schedules.dto';
import type { SimpleScheduleStatus } from './leave-calculator';
import {
  SCHEDULE_SHIFT,
  ALL_SCHEDULE_SHIFTS,
  SCHEDULE_SHIFT_LABELS,
  SCHEDULE_STATUS,
  normalizeScheduleShift,
  type ScheduleShift,
  type ScheduleStatus
} from '../constants/schedule-shift.constants';

export type HourlySlotStatus = 'buka' | 'terisi' | 'tutup' | 'cuti';

export const SHIFT_CONFIGS = [
  {
    contextId: 'early_morning',
    contextLabel: SCHEDULE_SHIFT_LABELS[SCHEDULE_SHIFT.DINI_HARI],
    startH: 0,
    endH: 6,
    timeRange: '00:00 - 06:00'
  },
  {
    contextId: 'morning',
    contextLabel: SCHEDULE_SHIFT_LABELS[SCHEDULE_SHIFT.PAGI],
    startH: 6,
    endH: 12,
    timeRange: '06:00 - 12:00'
  },
  {
    contextId: 'afternoon',
    contextLabel: SCHEDULE_SHIFT_LABELS[SCHEDULE_SHIFT.SIANG],
    startH: 12,
    endH: 18,
    timeRange: '12:00 - 18:00'
  },
  {
    contextId: 'night',
    contextLabel: SCHEDULE_SHIFT_LABELS[SCHEDULE_SHIFT.MALAM],
    startH: 18,
    endH: 24,
    timeRange: '18:00 - 24:00'
  }
];

export {
  SCHEDULE_SHIFT,
  ALL_SCHEDULE_SHIFTS,
  SCHEDULE_SHIFT_LABELS,
  SCHEDULE_STATUS,
  type ScheduleShift,
  type ScheduleStatus
};

export const CANONICAL_SHIFTS = ALL_SCHEDULE_SHIFTS;
export type CanonicalShift = ScheduleShift;

export const resolveCanonicalShift = normalizeScheduleShift;

export function resolveCanonicalShiftLabel(shift?: CanonicalShift | string | null): string {
  const canonical = resolveCanonicalShift(shift);
  return SCHEDULE_SHIFT_LABELS[canonical] || SCHEDULE_SHIFT_LABELS[SCHEDULE_SHIFT.PAGI];
}

export const UI_VARIANT_CONFIG: Record<
  string,
  {
    cellBg: string;
    border: string;
    text: string;
    dotBg: string;
    timeText: string;
  }
> = {
  neutral_disabled: {
    cellBg: 'bg-muted/10',
    border: 'border-border/40',
    text: 'text-muted-foreground/60',
    dotBg: 'bg-muted-foreground/30',
    timeText: 'text-muted-foreground/60'
  },
  dashed_border: {
    cellBg: 'bg-transparent hover:bg-muted/10',
    border: 'border-dashed border-border/80 hover:border-primary/60',
    text: 'text-muted-foreground',
    dotBg: 'bg-muted-foreground/40',
    timeText: 'text-foreground/80'
  },
  muted_gray: {
    cellBg: 'bg-muted/15 hover:bg-muted/25',
    border: 'border-border/50',
    text: 'text-muted-foreground',
    dotBg: 'bg-muted-foreground/30',
    timeText: 'text-muted-foreground/70'
  },
  success_green: {
    cellBg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
    border: 'border-emerald-500/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dotBg: 'bg-emerald-500',
    timeText: 'text-foreground'
  },
  info_blue: {
    cellBg: 'bg-sky-500/10 hover:bg-sky-500/15',
    border: 'border-sky-500/30',
    text: 'text-sky-700 dark:text-sky-400',
    dotBg: 'bg-sky-500',
    timeText: 'text-foreground'
  },
  sky_badge: {
    cellBg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    text: 'text-sky-700 dark:text-sky-400',
    dotBg: 'bg-sky-500',
    timeText: 'text-muted-foreground'
  },
  danger_red: {
    cellBg: 'bg-rose-500/10 hover:bg-rose-500/15',
    border: 'border-rose-500/30',
    text: 'text-rose-700 dark:text-rose-400',
    dotBg: 'bg-rose-500',
    timeText: 'text-foreground'
  },
  purple_other: {
    cellBg: 'bg-purple-500/10 hover:bg-purple-500/15',
    border: 'border-purple-500/30',
    text: 'text-purple-700 dark:text-purple-400',
    dotBg: 'bg-purple-500',
    timeText: 'text-foreground'
  }
};

export const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    cellBg: string;
    border: string;
    text: string;
    dotBg: string;
  }
> = {
  UNSCHEDULED: {
    label: 'Belum Terjadwal',
    cellBg: 'bg-muted/10 hover:bg-muted/20',
    border: 'border-dashed border-border/70',
    text: 'text-muted-foreground/70',
    dotBg: 'bg-muted-foreground/40'
  },
  AVAILABLE: {
    label: 'Tersedia',
    cellBg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
    border: 'border-emerald-500/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dotBg: 'bg-emerald-500'
  },
  OCCUPIED: {
    label: 'Terisi',
    cellBg: 'bg-sky-500/10 hover:bg-sky-500/15',
    border: 'border-sky-500/30',
    text: 'text-sky-700 dark:text-sky-400',
    dotBg: 'bg-sky-500'
  },
  OCCUPIED_BY_SELF: {
    label: 'Terisi',
    cellBg: 'bg-sky-500/10 hover:bg-sky-500/15',
    border: 'border-sky-500/30',
    text: 'text-sky-700 dark:text-sky-400',
    dotBg: 'bg-sky-500'
  },
  OCCUPIED_BY_OTHER: {
    label: 'Terisi Dokter Lain',
    cellBg: 'bg-purple-500/10 hover:bg-purple-500/15',
    border: 'border-purple-500/30',
    text: 'text-purple-700 dark:text-purple-400',
    dotBg: 'bg-purple-500'
  },
  CLOSED: {
    label: 'Ditutup',
    cellBg: 'bg-rose-500/10 hover:bg-rose-500/15',
    border: 'border-rose-500/30',
    text: 'text-rose-700 dark:text-rose-400',
    dotBg: 'bg-rose-500'
  },
  CLOSED_LEAVE: {
    label: 'Cuti',
    cellBg: 'bg-sky-500/10 hover:bg-sky-500/15',
    border: 'border-sky-500/30',
    text: 'text-sky-700 dark:text-sky-400',
    dotBg: 'bg-sky-500'
  },
  EXPIRED: {
    label: 'Selesai',
    cellBg: 'bg-muted/10 hover:bg-muted/15',
    border: 'border-border/30',
    text: 'text-muted-foreground/60',
    dotBg: 'bg-muted-foreground/30'
  }
};

export function buildShiftsFromTimelineIntervals(
  intervals: TimelineInterval[],
  sessions: DoctorDailySession[] = [],
  dayStatus: SimpleScheduleStatus = 'buka'
): OccupancyShift[] {
  const isDayClosed = dayStatus === 'tutup';
  const isDayCuti = dayStatus === 'cuti';

  return SHIFT_CONFIGS.map((cfg) => {
    const boundaryStartTime = `${String(cfg.startH).padStart(2, '0')}:00`;
    const boundaryEndTime = `${String(cfg.endH).padStart(2, '0')}:00`;

    const shiftIntervals = intervals.filter(
      (it) => it.startTime >= boundaryStartTime && it.startTime < boundaryEndTime
    );

    let availableCount = 0;
    let occupiedCount = 0;
    let closedCount = 0;
    let unscheduledCount = 0;

    const slots: OccupancySlot[] = shiftIntervals.map((it, idx) => {
      const matchingSession = sessions.find(
        (s) =>
          (it.startTime >= s.jam_mulai && it.startTime < s.jam_selesai) ||
          it.startTime === s.jam_mulai
      );

      let availabilityState = it.availabilityState;
      let effectiveStatus = it.effectiveStatus || it.status;
      let isSelectable = it.isSelectable ?? true;
      let closure = it.closure;
      const reschedule = it.reschedule;

      if (isDayCuti) {
        availabilityState = 'CLOSED';
        effectiveStatus = 'CLOSED';
        isSelectable = false;
        closure = {
          category: 'LEAVE',
          reasonCode: 'DOCTOR_ON_LEAVE',
          reasonText: 'Dokter sedang cuti operasional'
        };
      } else if (isDayClosed) {
        availabilityState = 'CLOSED';
        effectiveStatus = 'CLOSED';
        isSelectable = false;
        closure = {
          category: 'OTHER',
          reasonCode: 'DAY_CLOSED',
          reasonText: 'Praktik ditutup pada tanggal ini'
        };
      }

      if (!availabilityState) {
        const rawStatus = (it.status || '').toUpperCase();
        if (it.isOccupied || rawStatus === 'OCCUPIED') {
          availabilityState = 'OCCUPIED';
        } else if (rawStatus === 'OPEN' || rawStatus === 'AVAILABLE') {
          availabilityState = 'AVAILABLE';
        } else if (rawStatus === 'UNSCHEDULED') {
          availabilityState = 'UNSCHEDULED';
        } else {
          availabilityState = 'CLOSED';
        }
      }

      let slotStatus: OccupancySlot['status'] = 'CLOSED';
      let displayLabel = it.displayLabel || 'Tutup';
      let isAvailable = false;

      switch (availabilityState) {
        case 'UNSCHEDULED':
          slotStatus = 'UNSCHEDULED';
          displayLabel = 'Belum Terjadwal';
          isAvailable = false;
          unscheduledCount++;
          break;
        case 'AVAILABLE':
          slotStatus = 'AVAILABLE';
          displayLabel = 'Tersedia';
          isAvailable = true;
          availableCount++;
          break;
        case 'OCCUPIED':
          slotStatus = 'OCCUPIED';
          displayLabel = it.appointmentRef?.patientName
            ? `Terisi: ${it.appointmentRef.patientName}`
            : 'Terisi';
          isAvailable = false;
          occupiedCount++;
          break;
        case 'CLOSED':
        default:
          if (closure?.category === 'LEAVE') {
            slotStatus = 'CLOSED_LEAVE';
            displayLabel = 'Cuti';
          } else {
            slotStatus = 'CLOSED';
            displayLabel = closure?.reasonText || 'Ditutup';
          }
          isAvailable = false;
          closedCount++;
          break;
      }

      return {
        slotIndex: it.slotIndex || idx + 1,
        intervalIndex: it.intervalIndex || idx + 1,
        intervalId: it.intervalId,
        startTime: it.startTime,
        endTime: it.endTime,
        timeRange: it.timeRange || `${it.startTime} - ${it.endTime}`,
        isAvailable,
        status: slotStatus,
        displayLabel,
        temporalState: it.temporalState,
        availabilityState,
        effectiveStatus,
        isSelectable,
        closure,
        reschedule,
        appointmentRef: it.appointmentRef,
        conflictInfo: matchingSession ? { type: 'SELF', sessionId: matchingSession.id } : null
      };
    });

    const scheduledCount = availableCount + occupiedCount + closedCount;
    const activeBookableCount = availableCount + occupiedCount;
    const occupancyPercentage =
      activeBookableCount > 0
        ? Number(((occupiedCount / activeBookableCount) * 100).toFixed(2))
        : 0;
    const coveragePercentage =
      shiftIntervals.length > 0
        ? Number(((scheduledCount / shiftIntervals.length) * 100).toFixed(2))
        : 0;

    const metrics = {
      totalSlots: shiftIntervals.length,
      scheduledSlots: scheduledCount,
      unscheduledSlots: unscheduledCount,
      availableSlots: availableCount,
      occupiedSlots: occupiedCount,
      closedSlots: closedCount,
      activeBookableSlots: activeBookableCount,
      occupancy: {
        occupied: occupiedCount,
        capacity: activeBookableCount,
        percentage: occupancyPercentage
      },
      scheduleCoverage: {
        scheduled: scheduledCount,
        total: shiftIntervals.length,
        percentage: coveragePercentage
      }
    };

    return {
      contextId: cfg.contextId,
      contextLabel: cfg.contextLabel,
      sessionShift: cfg.contextId,
      timeRange: cfg.timeRange,
      boundaryStartTime,
      boundaryEndTime,
      intervalMinutes: 30,
      totalSlots: shiftIntervals.length,
      availableSlotsCount: isDayClosed || isDayCuti ? 0 : availableCount,
      occupiedSlotsCount: isDayClosed || isDayCuti ? 0 : occupiedCount,
      counts: {
        total: shiftIntervals.length,
        unscheduled: unscheduledCount,
        available: availableCount,
        occupied: occupiedCount,
        closed: closedCount,
        scheduled: scheduledCount,
        activeBookable: activeBookableCount,
        past: 0,
        current: 0,
        future: 0
      },
      metrics,
      summary: metrics,
      slots
    };
  });
}

export function normalizeDateParam(date?: string | null): string {
  if (date) {
    const trimmed = date.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    if (trimmed.includes('T')) {
      const isoPart = trimmed.split('T')[0];
      if (isoPart && /^\d{4}-\d{2}-\d{2}$/.test(isoPart)) {
        return isoPart;
      }
    }
    const monthsMap: Record<string, string> = {
      jan: '01',
      januari: '01',
      feb: '02',
      februari: '02',
      mar: '03',
      maret: '03',
      apr: '04',
      april: '04',
      mei: '05',
      jun: '06',
      juni: '06',
      jul: '07',
      juli: '07',
      agu: '08',
      agustus: '08',
      aug: '08',
      sep: '09',
      september: '09',
      okt: '10',
      oktober: '10',
      oct: '10',
      nov: '11',
      november: '11',
      des: '12',
      desember: '12',
      dec: '12'
    };
    const match = trimmed.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (match) {
      const day = match[1]?.padStart(2, '0');
      const monthStr = match[2]?.toLowerCase();
      const month = monthStr ? monthsMap[monthStr] : undefined;
      const year = match[3];
      if (day && month && year) {
        return `${year}-${month}-${day}`;
      }
    }
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
