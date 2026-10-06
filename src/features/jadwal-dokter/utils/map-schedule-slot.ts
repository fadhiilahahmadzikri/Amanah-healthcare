import type { ScheduleSlotAvailabilityItem } from '@/server/contracts/schedules/doctor-schedules.dto';
import type { GridSlotData } from '../components/grid/doctor-grid-slot-item';
import {
  SCHEDULE_SLOT_STATUS,
  SLOT_UI_STATUS,
  SLOT_UI_VARIANT
} from '../constants/schedule-shift.constants';

export function mapScheduleSlotToGridSlot(rawSlot: ScheduleSlotAvailabilityItem): GridSlotData {
  const isPurpleConflict = rawSlot.status === SCHEDULE_SLOT_STATUS.OCCUPIED_BY_OTHER;
  const isAvailable = Boolean(rawSlot.isAvailable);
  const isClickable = isAvailable || isPurpleConflict;

  const uiVariant = isAvailable
    ? SLOT_UI_VARIANT.SUCCESS_GREEN
    : isPurpleConflict
      ? SLOT_UI_VARIANT.PURPLE_OTHER
      : SLOT_UI_VARIANT.NEUTRAL_DISABLED;

  const uiStatus = isAvailable
    ? SLOT_UI_STATUS.AVAILABLE
    : isPurpleConflict
      ? SLOT_UI_STATUS.OCCUPIED_BY_OTHER
      : rawSlot.status || SLOT_UI_STATUS.UNSCHEDULED;

  const displayLabel = rawSlot.displayLabel || (isAvailable ? 'Tersedia' : 'Terisi');

  return {
    slotIndex: rawSlot.slotIndex,
    startTime: rawSlot.time,
    endTime: rawSlot.endTime,
    status: isAvailable
      ? SCHEDULE_SLOT_STATUS.AVAILABLE
      : isPurpleConflict
        ? SCHEDULE_SLOT_STATUS.OCCUPIED_BY_OTHER
        : rawSlot.status || SCHEDULE_SLOT_STATUS.PAST,
    isAvailable,
    displayLabel,
    isClickable,
    uiVariant,
    uiStatus,
    conflictInfo: rawSlot.conflict
      ? {
          type: rawSlot.conflict.type,
          occupantName: rawSlot.conflict.occupantName ?? undefined
        }
      : null
  };
}
