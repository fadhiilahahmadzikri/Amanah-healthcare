import type { DoctorDailySession, TimelineInterval } from '../api/types';
import type {
  OccupancyShift,
  OccupancySlot
} from '@/server/contracts/schedules/doctor-schedules.dto';
import type { SimpleScheduleStatus } from './leave-calculator';

export type HourlySlotStatus = 'buka' | 'terisi' | 'tutup' | 'cuti';

export const SHIFT_CONFIGS = [
  {
    contextId: 'early_morning',
    contextLabel: 'Dini Hari',
    startH: 0,
    endH: 6,
    timeRange: '00:00 - 06:00 WIB'
  },
  {
    contextId: 'morning',
    contextLabel: 'Pagi',
    startH: 6,
    endH: 12,
    timeRange: '06:00 - 12:00 WIB'
  },
  {
    contextId: 'afternoon',
    contextLabel: 'Siang / Sore',
    startH: 12,
    endH: 18,
    timeRange: '12:00 - 18:00 WIB'
  },
  {
    contextId: 'night',
    contextLabel: 'Malam',
    startH: 18,
    endH: 24,
    timeRange: '18:00 - 24:00 WIB'
  }
] as const;

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
  warning_amber: {
    cellBg: 'bg-amber-500/10 hover:bg-amber-500/15',
    border: 'border-amber-500/30',
    text: 'text-amber-700 dark:text-amber-400',
    dotBg: 'bg-amber-500',
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
  // 1. UNSCHEDULED: Abu-abu putus-putus (Belum Terjadwal oleh dokter)
  UNSCHEDULED: {
    label: 'Belum Terjadwal',
    cellBg: 'bg-muted/10 hover:bg-muted/20',
    border: 'border-dashed border-border/70',
    text: 'text-muted-foreground/70',
    dotBg: 'bg-muted-foreground/40'
  },
  // 2. AVAILABLE: Hijau / Emerald (Dibuka & Tersedia untuk booking)
  AVAILABLE: {
    label: 'Tersedia',
    cellBg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
    border: 'border-emerald-500/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dotBg: 'bg-emerald-500'
  },
  // 3. OCCUPIED: Biru / Sky (Terisi Pasien)
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
    label: 'Terisi Lain',
    cellBg: 'bg-amber-500/10 hover:bg-amber-500/15',
    border: 'border-amber-500/30',
    text: 'text-amber-700 dark:text-amber-400',
    dotBg: 'bg-amber-500'
  },
  // 4. CLOSED: Merah Mawar / Rose (Ditutup Rapat/Operasional)
  CLOSED: {
    label: 'Ditutup',
    cellBg: 'bg-rose-500/10 hover:bg-rose-500/15',
    border: 'border-rose-500/30',
    text: 'text-rose-700 dark:text-rose-400',
    dotBg: 'bg-rose-500'
  },
  // 5. CLOSED_LEAVE: Biru Cuti (Cuti Dokter)
  CLOSED_LEAVE: {
    label: 'Cuti',
    cellBg: 'bg-sky-500/10 hover:bg-sky-500/15',
    border: 'border-sky-500/30',
    text: 'text-sky-700 dark:text-sky-400',
    dotBg: 'bg-sky-500'
  },
  // 6. RESCHEDULED: Oranye / Amber (Dijadwalkan Ulang / Reschedule Event)
  RESCHEDULED: {
    label: 'Dijadwalkan Ulang',
    cellBg: 'bg-amber-500/10 hover:bg-amber-500/15',
    border: 'border-amber-500/30',
    text: 'text-amber-700 dark:text-amber-400',
    dotBg: 'bg-amber-500'
  },
  // 7. EXPIRED: Abu-abu Muted / Selesai (Waktu telah terlewati, persis seperti kalender)
  EXPIRED: {
    label: 'Selesai',
    cellBg: 'bg-muted/10 hover:bg-muted/15',
    border: 'border-border/30',
    text: 'text-muted-foreground/60',
    dotBg: 'bg-muted-foreground/30'
  }
};

/**
 * Builds discrete 30-minute shifts directly from backend SSOT timeline_intervals.
 * Endpoint 06 & 10 provides timeline_intervals computed by the backend booking engine.
 */
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

    // Filter intervals strictly belonging to this shift window
    const shiftIntervals = intervals.filter(
      (it) => it.startTime >= boundaryStartTime && it.startTime < boundaryEndTime
    );

    let availableCount = 0;
    let occupiedCount = 0;
    let closedCount = 0;
    let unscheduledCount = 0;

    const slots: OccupancySlot[] = shiftIntervals.map((it, idx) => {
      // Find matching session covering this interval
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

      // If backend availabilityState was not explicitly set, derive canonically
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
        timeRange: it.timeRange || `${it.startTime} - ${it.endTime} WIB`,
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

/**
 * Builds discrete 30-minute shifts from daily sessions when timeline_intervals
 * are not provided (e.g. before detail fetch completes).
 */
export function buildLocalFallbackShifts(
  sessions: DoctorDailySession[] = [],
  dayStatus: SimpleScheduleStatus = 'buka'
): OccupancyShift[] {
  const isDayClosed = dayStatus === 'tutup';
  const isDayCuti = dayStatus === 'cuti';

  return SHIFT_CONFIGS.map((cfg) => {
    const slots: OccupancySlot[] = [];
    const totalMinutes = (cfg.endH - cfg.startH) * 60;
    const duration = 30;
    const totalSlots = Math.floor(totalMinutes / duration);
    let availableCount = 0;
    let occupiedCount = 0;

    let idx = 1;
    for (let m = 0; m < totalMinutes; m += duration) {
      const sMin = cfg.startH * 60 + m;
      const eMin = sMin + duration;
      const sH = Math.floor(sMin / 60);
      const sM = sMin % 60;
      const eH = Math.floor(eMin / 60);
      const eM = eMin % 60;

      const startTime = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;
      const endTime = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;

      const matching = sessions.find((s) => startTime >= s.jam_mulai && startTime < s.jam_selesai);

      if (isDayCuti) {
        slots.push({
          slotIndex: idx++,
          startTime,
          endTime,
          timeRange: `${startTime} - ${endTime} WIB`,
          isAvailable: false,
          status: 'CLOSED_LEAVE',
          displayLabel: 'Cuti',
          availabilityState: 'CLOSED',
          effectiveStatus: 'CLOSED',
          isSelectable: false,
          closure: {
            category: 'LEAVE',
            reasonCode: 'LEAVE',
            reasonText: 'Cuti'
          },
          conflictInfo: matching ? { type: 'SELF', sessionId: matching.id } : null
        });
      } else if (isDayClosed) {
        slots.push({
          slotIndex: idx++,
          startTime,
          endTime,
          timeRange: `${startTime} - ${endTime} WIB`,
          isAvailable: false,
          status: 'CLOSED',
          displayLabel: 'Tutup',
          availabilityState: 'CLOSED',
          effectiveStatus: 'CLOSED',
          isSelectable: false,
          conflictInfo: matching ? { type: 'SELF', sessionId: matching.id } : null
        });
      } else if (matching) {
        const rawStatus = (matching.status_sesi || '').toUpperCase();
        let slotStatus: OccupancySlot['status'] = 'OCCUPIED_BY_SELF';
        let displayLabel = `Jadwal Dokter (${matching.nama_sesi})`;

        if (rawStatus === 'CLOSED' || rawStatus === 'TUTUP') {
          slotStatus = 'CLOSED';
          displayLabel = 'Tutup';
        } else if (rawStatus === 'CUTI') {
          slotStatus = 'CLOSED_LEAVE';
          displayLabel = 'Cuti';
        } else if (rawStatus === 'OPEN' || rawStatus === 'BUKA') {
          if (matching.slot_tersedia > 0) {
            slotStatus = 'AVAILABLE';
            displayLabel = 'Buka';
            availableCount++;
          } else {
            slotStatus = 'OCCUPIED_BY_SELF';
            displayLabel = 'Terisi';
            occupiedCount++;
          }
        } else {
          slotStatus = 'OCCUPIED_BY_SELF';
          displayLabel = 'Terisi';
          occupiedCount++;
        }

        const availabilityState =
          slotStatus === 'AVAILABLE'
            ? 'AVAILABLE'
            : slotStatus === 'OCCUPIED_BY_SELF' || slotStatus === 'OCCUPIED'
              ? 'OCCUPIED'
              : 'CLOSED';

        slots.push({
          slotIndex: idx++,
          startTime,
          endTime,
          timeRange: `${startTime} - ${endTime} WIB`,
          isAvailable: slotStatus === 'AVAILABLE',
          status: slotStatus,
          displayLabel,
          availabilityState,
          effectiveStatus: availabilityState,
          isSelectable: slotStatus === 'AVAILABLE',
          conflictInfo: { type: 'SELF', sessionId: matching.id }
        });
      } else {
        slots.push({
          slotIndex: idx++,
          startTime,
          endTime,
          timeRange: `${startTime} - ${endTime} WIB`,
          isAvailable: false,
          status: 'CLOSED',
          displayLabel: 'Tutup',
          availabilityState: 'UNSCHEDULED',
          effectiveStatus: 'UNSCHEDULED',
          isSelectable: false,
          conflictInfo: null
        });
      }
    }

    const shiftSessions = sessions.filter(
      (s) =>
        s.jam_mulai >= `${String(cfg.startH).padStart(2, '0')}:00` &&
        s.jam_mulai < `${String(cfg.endH).padStart(2, '0')}:00`
    );
    const shiftTotalCapacity = shiftSessions.reduce((acc, s) => acc + (s.kuota_pasien || 1), 0);
    const shiftAvailableSlots =
      isDayClosed || isDayCuti
        ? 0
        : shiftSessions.reduce(
            (acc, s) =>
              acc +
              (s.status_sesi?.toUpperCase() === 'OPEN' || s.status_sesi?.toUpperCase() === 'BUKA'
                ? s.slot_tersedia
                : 0),
            0
          );

    const scheduledSlots = shiftTotalCapacity;
    const occupiedSlots = Math.max(0, shiftTotalCapacity - shiftAvailableSlots);
    const availableSlots = shiftAvailableSlots;
    const closedSlots = isDayClosed || isDayCuti ? totalSlots : 0;
    const unscheduledSlots = Math.max(0, totalSlots - scheduledSlots);
    const activeBookable = availableSlots + occupiedSlots;
    const occupancyPercentage =
      activeBookable > 0 ? Number(((occupiedSlots / activeBookable) * 100).toFixed(2)) : 0;
    const coveragePercentage =
      totalSlots > 0 ? Number(((scheduledSlots / totalSlots) * 100).toFixed(2)) : 0;

    const metrics = {
      totalSlots,
      scheduledSlots,
      unscheduledSlots,
      availableSlots,
      occupiedSlots,
      closedSlots,
      activeBookableSlots: activeBookable,
      occupancy: {
        occupied: occupiedSlots,
        capacity: activeBookable,
        percentage: occupancyPercentage
      },
      scheduleCoverage: {
        scheduled: scheduledSlots,
        total: totalSlots,
        percentage: coveragePercentage
      }
    };

    return {
      contextId: cfg.contextId,
      contextLabel: cfg.contextLabel,
      sessionShift: cfg.contextId,
      timeRange: cfg.timeRange,
      boundaryStartTime: `${String(cfg.startH).padStart(2, '0')}:00`,
      boundaryEndTime: `${String(cfg.endH).padStart(2, '0')}:00`,
      intervalMinutes: 30,
      totalSlots,
      availableSlotsCount: shiftAvailableSlots,
      occupiedSlotsCount: occupiedSlots,
      counts: {
        total: totalSlots,
        unscheduled: unscheduledSlots,
        available: availableSlots,
        occupied: occupiedSlots,
        closed: closedSlots,
        scheduled: scheduledSlots,
        activeBookable,
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

export function buildDiscreteSlots(startHour: number, endHour: number, durationMinutes = 30) {
  const slots: OccupancySlot[] = [];
  let index = 1;
  const totalMinutes = (endHour - startHour) * 60;
  const totalSlots = Math.floor(totalMinutes / durationMinutes);

  for (let m = 0; m < totalMinutes; m += durationMinutes) {
    const sMinutes = startHour * 60 + m;
    const eMinutes = sMinutes + durationMinutes;

    const sH = Math.floor(sMinutes / 60);
    const sM = sMinutes % 60;
    const eH = Math.floor(eMinutes / 60);
    const eM = eMinutes % 60;

    const startTime = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;
    const endTime = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;

    slots.push({
      slotIndex: index++,
      startTime,
      endTime,
      timeRange: `${startTime} - ${endTime} WIB`,
      isAvailable: false,
      status: 'CLOSED',
      displayLabel: 'Tutup',
      availabilityState: 'CLOSED',
      effectiveStatus: 'CLOSED',
      isSelectable: false,
      conflictInfo: null
    });
  }

  return { slots, totalSlots };
}

export function buildOccupancyOverview(
  date: string,
  staffId: string,
  sessions: {
    jam_mulai: string;
    jam_selesai: string;
    nama_sesi?: string;
    id?: string;
    status_sesi?: string;
    slot_tersedia?: number;
    kuota_pasien?: number;
  }[] = []
) {
  const normalizedSessions: DoctorDailySession[] = sessions.map((s) => ({
    id: s.id || `s-${Math.random()}`,
    nama_sesi: s.nama_sesi || 'Sesi',
    jam_mulai: s.jam_mulai,
    jam_selesai: s.jam_selesai,
    kuota_pasien: s.kuota_pasien ?? (s.slot_tersedia || 1),
    slot_tersedia: s.slot_tersedia ?? 0,
    status_sesi: s.status_sesi || 'OPEN'
  }));

  const shifts = buildLocalFallbackShifts(normalizedSessions, 'buka');

  let totalSlots = 0;
  let availableSlots = 0;
  let occupiedSlots = 0;

  for (const shift of shifts) {
    totalSlots += shift.totalSlots;
    availableSlots += shift.availableSlotsCount;
    occupiedSlots += shift.occupiedSlotsCount;
  }

  return {
    date,
    staffId,
    shifts,
    summary: {
      totalSlots,
      availableSlots,
      occupiedSlots
    }
  };
}

/**
 * Normalizes any date string (ISO, YYYY-MM-DD, Indonesian text, or falsy)
 * to a canonical YYYY-MM-DD format required by Backend API contracts.
 */
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
