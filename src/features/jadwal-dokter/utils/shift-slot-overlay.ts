import type {
  OccupancyShift,
  OccupancySlot
} from '@/server/contracts/schedules/doctor-schedules.dto';
import type { DoctorDailySession } from '../api/types';
import {
  SCHEDULE_STATUS,
  AVAILABILITY_STATE,
  EFFECTIVE_SLOT_STATUS,
  SLOT_UI_STATUS,
  SLOT_UI_VARIANT,
  SLOT_ACTION_TYPE
} from '../constants/schedule-shift.constants';

/**
 * Pure, deterministic utility that reconciles doctor shifts with active sessions.
 * Guarantees that any session present in sesi_harian is immediately reflected in the slots,
 * preventing race conditions or intermittent uncolored slots while backend queries refetch.
 */
export function overlaySessionsOnShifts(
  shifts: OccupancyShift[],
  sessions: DoctorDailySession[] = [],
  dayStatus?: string
): OccupancyShift[] {
  if (!shifts || shifts.length === 0 || !sessions || sessions.length === 0) {
    return shifts;
  }

  const isDayClosed = dayStatus === 'tutup' || dayStatus === 'CLOSED';
  const isDayCuti = dayStatus === 'cuti' || dayStatus === 'CUTI';

  return shifts.map((shift) => {
    let hasModifiedSlot = false;

    const updatedSlots: OccupancySlot[] = shift.slots.map((slot) => {
      // Find matching session covering this slot
      const matchingSession = sessions.find((s) => {
        if (!s.jam_mulai || !s.jam_selesai) return false;
        return (
          (slot.startTime >= s.jam_mulai && slot.startTime < s.jam_selesai) ||
          slot.startTime === s.jam_mulai
        );
      });

      if (!matchingSession) {
        return slot;
      }

      // If slot is already configured and not UNSCHEDULED / ADD_SESSION, keep unless session is closed
      const isUnscheduled =
        slot.status === AVAILABILITY_STATE.UNSCHEDULED ||
        slot.availabilityState === AVAILABILITY_STATE.UNSCHEDULED ||
        slot.actionType === SLOT_ACTION_TYPE.ADD_SESSION;

      if (!isUnscheduled && slot.sessionId === matchingSession.id) {
        return slot;
      }

      hasModifiedSlot = true;

      const isSessionClosed =
        isDayClosed ||
        matchingSession.status_sesi === SCHEDULE_STATUS.CLOSED ||
        matchingSession.status_sesi === 'CLOSED' ||
        matchingSession.status_sesi === 'Tutup';

      const isSessionOccupied =
        !isSessionClosed &&
        (matchingSession.kuota_pasien ?? 1) > (matchingSession.slot_tersedia ?? 1);

      if (isDayCuti) {
        return {
          ...slot,
          status: SLOT_UI_STATUS.CLOSED_LEAVE,
          effectiveStatus: EFFECTIVE_SLOT_STATUS.CLOSED,
          availabilityState: AVAILABILITY_STATE.CLOSED,
          uiStatus: SLOT_UI_STATUS.CLOSED_LEAVE,
          uiLabel: 'Cuti',
          uiVariant: SLOT_UI_VARIANT.SKY_BADGE,
          actionType: SLOT_ACTION_TYPE.NONE,
          isClickable: false,
          isSelectable: false,
          sessionId: matchingSession.id,
          sessionLabel: matchingSession.nama_sesi,
          room: matchingSession.ruang
        };
      }

      if (isSessionClosed) {
        return {
          ...slot,
          status: EFFECTIVE_SLOT_STATUS.CLOSED,
          effectiveStatus: EFFECTIVE_SLOT_STATUS.CLOSED,
          availabilityState: AVAILABILITY_STATE.CLOSED,
          uiStatus: SLOT_UI_STATUS.CLOSED_CLINIC,
          uiLabel: 'Ditutup',
          uiVariant: SLOT_UI_VARIANT.DANGER_RED,
          actionType: SLOT_ACTION_TYPE.VIEW_SESSION,
          isClickable: true,
          isSelectable: false,
          sessionId: matchingSession.id,
          sessionLabel: matchingSession.nama_sesi,
          room: matchingSession.ruang
        };
      }

      if (isSessionOccupied) {
        return {
          ...slot,
          status: EFFECTIVE_SLOT_STATUS.OCCUPIED,
          effectiveStatus: EFFECTIVE_SLOT_STATUS.OCCUPIED,
          availabilityState: AVAILABILITY_STATE.OCCUPIED,
          uiStatus: SLOT_UI_STATUS.OCCUPIED,
          uiLabel: 'Terisi',
          uiVariant: SLOT_UI_VARIANT.INFO_BLUE,
          actionType: SLOT_ACTION_TYPE.VIEW_PATIENTS,
          isClickable: true,
          isSelectable: true,
          sessionId: matchingSession.id,
          sessionLabel: matchingSession.nama_sesi,
          room: matchingSession.ruang,
          capacity: matchingSession.kuota_pasien ?? 1,
          availableSlots: matchingSession.slot_tersedia ?? 0,
          occupiedSlots:
            (matchingSession.kuota_pasien ?? 1) - (matchingSession.slot_tersedia ?? 0)
        };
      }

      return {
        ...slot,
        status: EFFECTIVE_SLOT_STATUS.AVAILABLE,
        effectiveStatus: EFFECTIVE_SLOT_STATUS.AVAILABLE,
        availabilityState: AVAILABILITY_STATE.AVAILABLE,
        uiStatus: SLOT_UI_STATUS.AVAILABLE,
        uiLabel: 'Tersedia',
        uiVariant: SLOT_UI_VARIANT.SUCCESS_GREEN,
        actionType: SLOT_ACTION_TYPE.VIEW_SESSION,
        isClickable: true,
        isSelectable: true,
        sessionId: matchingSession.id,
        sessionLabel: matchingSession.nama_sesi,
        room: matchingSession.ruang,
        capacity: matchingSession.kuota_pasien ?? 1,
        availableSlots: matchingSession.slot_tersedia ?? 1,
        occupiedSlots: 0
      };
    });

    if (!hasModifiedSlot) {
      return shift;
    }

    // Recompute metrics when slots are overlaid
    let scheduledSlots = 0;
    let unscheduledSlots = 0;
    let availableSlots = 0;
    let occupiedSlots = 0;
    let closedSlots = 0;

    for (const s of updatedSlots) {
      if (
        s.status === AVAILABILITY_STATE.UNSCHEDULED ||
        s.availabilityState === AVAILABILITY_STATE.UNSCHEDULED
      ) {
        unscheduledSlots++;
      } else {
        scheduledSlots++;
        if (
          s.status === AVAILABILITY_STATE.AVAILABLE ||
          s.effectiveStatus === EFFECTIVE_SLOT_STATUS.AVAILABLE
        ) {
          availableSlots++;
        } else if (
          s.status === AVAILABILITY_STATE.OCCUPIED ||
          s.effectiveStatus === EFFECTIVE_SLOT_STATUS.OCCUPIED
        ) {
          occupiedSlots++;
        } else if (
          s.status === EFFECTIVE_SLOT_STATUS.CLOSED ||
          s.status === SLOT_UI_STATUS.CLOSED_LEAVE ||
          s.effectiveStatus === EFFECTIVE_SLOT_STATUS.CLOSED
        ) {
          closedSlots++;
        }
      }
    }

    const totalSlots = updatedSlots.length;
    const activeBookableSlots = availableSlots + occupiedSlots;
    const coveragePercentage =
      totalSlots > 0 ? Number(((scheduledSlots / totalSlots) * 100).toFixed(1)) : 0;
    const occupancyPercentage =
      activeBookableSlots > 0
        ? Number(((occupiedSlots / activeBookableSlots) * 100).toFixed(1))
        : 0;

    return {
      ...shift,
      slots: updatedSlots,
      metrics: {
        totalSlots,
        scheduledSlots,
        unscheduledSlots,
        availableSlots,
        occupiedSlots,
        closedSlots,
        activeBookableSlots,
        scheduleCoverage: {
          scheduled: scheduledSlots,
          total: totalSlots,
          percentage: coveragePercentage,
          displayText: `Alokasi Praktik: ${scheduledSlots}/${totalSlots} Slot (${coveragePercentage}%)`
        },
        occupancy: {
          occupied: occupiedSlots,
          capacity: activeBookableSlots,
          percentage: occupancyPercentage,
          displayText: `Keterisian Kuota: ${occupiedSlots}/${activeBookableSlots} Pasien (${occupancyPercentage}%)`
        }
      },
      availableSlotsCount: availableSlots,
      occupiedSlotsCount: occupiedSlots
    };
  });
}
