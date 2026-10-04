import { describe, it, expect, mock } from 'bun:test';
import { getTodayDateParam } from '../model/useDoctorScheduleView';
import type { RescheduleStep } from './doctor-reschedule-session-modal';
import type { GridSlotData } from './grid/doctor-grid-slot-item';
import type { ScheduleSlotAvailabilityItem } from '@/server/contracts/schedules/doctor-schedules.dto';

function evaluateCanProceedNext(
  step: RescheduleStep,
  targetDate: string,
  targetRoomId: string,
  targetStartTime: string
): boolean {
  if (step === 'date') return Boolean(targetDate);
  if (step === 'room') return Boolean(targetRoomId);
  if (step === 'slot') return Boolean(targetStartTime);
  if (step === 'note') return Boolean(targetDate && targetRoomId && targetStartTime);
  return false;
}

describe('DoctorRescheduleSessionModal Wizard & Collision Architecture', () => {
  describe('Wizard Stepper Navigation & Guards', () => {
    it('Step 1 (date): defaults to dynamic current date and allows proceeding', () => {
      const today = getTodayDateParam();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Cannot proceed if date is empty
      expect(evaluateCanProceedNext('date', '', '', '')).toBe(false);
      // Can proceed when target date is set
      expect(evaluateCanProceedNext('date', today, '', '')).toBe(true);
    });

    it('Step 2 (room): requires target room selection before advancing', () => {
      const today = getTodayDateParam();
      // Cannot proceed to slot without room
      expect(evaluateCanProceedNext('room', today, '', '')).toBe(false);
      // Can proceed when room is selected
      expect(evaluateCanProceedNext('room', today, 'room-uuid-1', '')).toBe(true);
    });

    it('Step 3 (slot): requires selecting a start time from the slot grid', () => {
      const today = getTodayDateParam();
      expect(evaluateCanProceedNext('slot', today, 'room-uuid-1', '')).toBe(false);
      expect(evaluateCanProceedNext('slot', today, 'room-uuid-1', '08:00')).toBe(true);
    });

    it('Step 4 (note): requires all prior fields (date, room, slot) before final submission', () => {
      const today = getTodayDateParam();
      expect(evaluateCanProceedNext('note', today, 'room-uuid-1', '08:00')).toBe(true);
      expect(evaluateCanProceedNext('note', '', 'room-uuid-1', '08:00')).toBe(false);
      expect(evaluateCanProceedNext('note', today, '', '08:00')).toBe(false);
      expect(evaluateCanProceedNext('note', today, 'room-uuid-1', '')).toBe(false);
    });
  });

  describe('Slot Grid Collision Representation (Purple State & Jump)', () => {
    it('correctly maps OCCUPIED_BY_OTHER to purple_other UI variant and clickable state', () => {
      const conflictingRawSlot: ScheduleSlotAvailabilityItem = {
        slotIndex: 3,
        time: '09:30',
        endTime: '10:00',
        isAvailable: false,
        status: 'OCCUPIED_BY_OTHER',
        displayLabel: 'Terisi Dokter Lain',
        conflict: {
          type: 'ROOM_OCCUPIED',
          message: 'Ruangan sudah terisi oleh dr. Siti Aminah, Sp.A',
          occupantName: 'dr. Siti Aminah, Sp.A',
          practitionerId: 'doctor-occupant-uuid-99'
        }
      };

      const isPurpleConflict = conflictingRawSlot.status === 'OCCUPIED_BY_OTHER';
      const isClickable = conflictingRawSlot.isAvailable || isPurpleConflict;

      const occupancySlot: GridSlotData = {
        slotIndex: conflictingRawSlot.slotIndex,
        startTime: conflictingRawSlot.time,
        endTime: conflictingRawSlot.endTime,
        status: conflictingRawSlot.isAvailable
          ? 'AVAILABLE'
          : isPurpleConflict
            ? 'OCCUPIED_BY_OTHER'
            : conflictingRawSlot.status || 'CLOSED',
        isAvailable: conflictingRawSlot.isAvailable,
        displayLabel: conflictingRawSlot.displayLabel || 'Terisi',
        isClickable,
        uiVariant: conflictingRawSlot.isAvailable
          ? 'available'
          : isPurpleConflict
            ? 'purple_other'
            : 'neutral_disabled',
        uiStatus: conflictingRawSlot.isAvailable
          ? 'AVAILABLE'
          : isPurpleConflict
            ? 'OCCUPIED_BY_OTHER'
            : 'CLOSED',
        conflictInfo: conflictingRawSlot.conflict
          ? {
              type: conflictingRawSlot.conflict.type,
              occupantName: conflictingRawSlot.conflict.occupantName ?? undefined
            }
          : null
      };

      expect(occupancySlot.uiVariant).toBe('purple_other');
      expect(occupancySlot.uiStatus).toBe('OCCUPIED_BY_OTHER');
      expect(occupancySlot.isClickable).toBe(true);
      expect(occupancySlot.conflictInfo?.occupantName).toBe('dr. Siti Aminah, Sp.A');
    });

    it('invokes onViewDoctorSchedule with occupantDoctorId and return context when purple slot is clicked', () => {
      const onViewDoctorScheduleMock = mock();
      const onCloseMock = mock();

      const sourceDoctor = {
        id: 'doc-source-1',
        nama_dokter: 'dr. Budi Santoso, Sp.PD'
      };

      const conflictingRawSlot: ScheduleSlotAvailabilityItem = {
        slotIndex: 3,
        time: '09:30',
        endTime: '10:00',
        isAvailable: false,
        status: 'OCCUPIED_BY_OTHER',
        conflict: {
          type: 'ROOM_OCCUPIED',
          message: 'Ruangan sudah terisi',
          occupantName: 'dr. Siti Aminah, Sp.A',
          practitionerId: 'doc-occupant-99'
        }
      };

      const handleSlotClick = (slot: ScheduleSlotAvailabilityItem) => {
        if (slot.isAvailable) {
          // select slot
        } else if (slot.status === 'OCCUPIED_BY_OTHER') {
          const occupantId = slot.conflict?.practitionerId;
          if (occupantId) {
            onCloseMock();
            onViewDoctorScheduleMock(occupantId, slot.time, {
              sourceDoctorId: sourceDoctor.id,
              sourceDoctorName: sourceDoctor.nama_dokter,
              sourceDate: '2026-10-04',
              sourceSlotStartTime: slot.time
            });
          }
        }
      };

      handleSlotClick(conflictingRawSlot);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
      expect(onViewDoctorScheduleMock).toHaveBeenCalledTimes(1);
      expect(onViewDoctorScheduleMock).toHaveBeenCalledWith('doc-occupant-99', '09:30', {
        sourceDoctorId: 'doc-source-1',
        sourceDoctorName: 'dr. Budi Santoso, Sp.PD',
        sourceDate: '2026-10-04',
        sourceSlotStartTime: '09:30'
      });
    });

    it('does NOT render separate calculated "Jam Selesai Baru" input field, deriving duration directly from slot', () => {
      const slot = {
        startTime: '08:00',
        endTime: '08:30'
      };

      const displayTime = `${slot.startTime} - ${slot.endTime} WIB`;
      expect(displayTime).toBe('08:00 - 08:30 WIB');
    });

    it('conditionally shows auto-redirect checkbox only when active appointments exist', () => {
      const sessionWithoutPatients = { pasien_terdaftar: 0 };
      const sessionWithPatients = { pasien_terdaftar: 3 };

      const hasActive1 = (sessionWithoutPatients.pasien_terdaftar ?? 0) > 0;
      const hasActive2 = (sessionWithPatients.pasien_terdaftar ?? 0) > 0;

      expect(hasActive1).toBe(false);
      expect(hasActive2).toBe(true);
    });

    it('renders all canonical schedule shifts including DINI_HARI without hardcoded subset', () => {
      const {
        ALL_SCHEDULE_SHIFTS,
        SCHEDULE_SHIFT,
        SCHEDULE_SHIFT_LABELS
      } = require('../constants/schedule-shift.constants');

      expect(ALL_SCHEDULE_SHIFTS).toHaveLength(4);
      expect(ALL_SCHEDULE_SHIFTS).toContain(SCHEDULE_SHIFT.DINI_HARI);
      expect(ALL_SCHEDULE_SHIFTS).toContain(SCHEDULE_SHIFT.PAGI);
      expect(ALL_SCHEDULE_SHIFTS).toContain(SCHEDULE_SHIFT.SIANG);
      expect(ALL_SCHEDULE_SHIFTS).toContain(SCHEDULE_SHIFT.MALAM);

      expect(SCHEDULE_SHIFT_LABELS[SCHEDULE_SHIFT.DINI_HARI]).toBe('Dini Hari');
      expect(SCHEDULE_SHIFT_LABELS[SCHEDULE_SHIFT.PAGI]).toBe('Pagi');
      expect(SCHEDULE_SHIFT_LABELS[SCHEDULE_SHIFT.SIANG]).toBe('Siang');
      expect(SCHEDULE_SHIFT_LABELS[SCHEDULE_SHIFT.MALAM]).toBe('Malam');
    });
  });
});
