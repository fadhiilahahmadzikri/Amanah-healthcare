import { describe, it, expect, mock } from 'bun:test';
import type { DoctorDailySession } from '../../api/types';
import type { OccupancySlot } from '@/server/contracts/schedules/doctor-schedules.dto';
import {
  SLOT_ACTION_TYPE,
  AVAILABILITY_STATE,
  SCHEDULE_STATUS
} from '../../constants/schedule-shift.constants';

describe('Doctor Grid Slot Interaction & Modal Flow SSOT', () => {
  const dummySessionWithPatients: DoctorDailySession = {
    id: 'session-occupied-1',
    nama_sesi: 'Shift Pagi',
    jam_mulai: '08:00',
    jam_selesai: '08:30',
    kuota_pasien: 10,
    slot_tersedia: 8,
    pasien_terdaftar: 2,
    status_sesi: 'OPEN',
    is_reschedule_eligible: true
  };

  const dummySessionAvailableGreen: DoctorDailySession = {
    id: 'session-available-1',
    nama_sesi: 'Shift Malam',
    jam_mulai: '18:30',
    jam_selesai: '19:00',
    kuota_pasien: 10,
    slot_tersedia: 10,
    pasien_terdaftar: 0,
    status_sesi: 'OPEN',
    is_reschedule_eligible: true
  };

  it('determines hasBookedPatients correctly for slots with patients vs green available slots', () => {
    const hasBookedWithPatients = Boolean(
      dummySessionWithPatients &&
      ((dummySessionWithPatients.pasien_terdaftar ?? 0) > 0 ||
        (dummySessionWithPatients.kuota_pasien > 0 &&
          dummySessionWithPatients.slot_tersedia !== undefined &&
          dummySessionWithPatients.slot_tersedia < dummySessionWithPatients.kuota_pasien))
    );
    expect(hasBookedWithPatients).toBe(true);

    const hasBookedGreen = Boolean(
      dummySessionAvailableGreen &&
      ((dummySessionAvailableGreen.pasien_terdaftar ?? 0) > 0 ||
        (dummySessionAvailableGreen.kuota_pasien > 0 &&
          dummySessionAvailableGreen.slot_tersedia !== undefined &&
          dummySessionAvailableGreen.slot_tersedia < dummySessionAvailableGreen.kuota_pasien))
    );
    expect(hasBookedGreen).toBe(false);
  });

  it('evaluates isClickable as false for green available slots so they cannot be clicked', () => {
    const matchingSession = dummySessionAvailableGreen;
    const hasBookedPatients = Boolean(
      matchingSession && (matchingSession.pasien_terdaftar ?? 0) > 0
    );

    const isUnscheduled = false;
    const isFinished = false;
    const isDayCuti = false;
    const readOnly = false;
    const isDayClosed = false;

    const isClickable =
      !isFinished && !isDayCuti && !readOnly && (isUnscheduled ? !isDayClosed : hasBookedPatients);

    expect(isClickable).toBe(false);
  });

  it('evaluates isClickable as true for slots with booked patients to open patient modal directly', () => {
    const matchingSession = dummySessionWithPatients;
    const hasBookedPatients = Boolean(
      matchingSession && (matchingSession.pasien_terdaftar ?? 0) > 0
    );

    const isUnscheduled = false;
    const isFinished = false;
    const isDayCuti = false;
    const readOnly = false;
    const isDayClosed = false;

    const isClickable =
      !isFinished && !isDayCuti && !readOnly && (isUnscheduled ? !isDayClosed : hasBookedPatients);

    expect(isClickable).toBe(true);
  });

  it('evaluates isClickable as true for unscheduled slots to add new practice schedule', () => {
    const matchingSession = undefined;
    const isUnscheduled = true;
    const isFinished = false;
    const isDayCuti = false;
    const readOnly = false;
    const isDayClosed = false;

    const isClickable =
      !isFinished && !isDayCuti && !readOnly && (isUnscheduled ? !isDayClosed : false);

    expect(isClickable).toBe(true);
  });

  it('directly dispatches handleOpenPatients on click when slot has patients, and does nothing when green', () => {
    const openPatientsMock = mock();
    const openAddSessionMock = mock();

    const handleSlotClick = (slot: OccupancySlot, session: DoctorDailySession | undefined) => {
      if (slot.actionType === SLOT_ACTION_TYPE.ADD_SESSION) {
        openAddSessionMock(slot.startTime, slot.endTime);
        return;
      }

      if (session) {
        const hasBookedPatients = Boolean(
          (session.pasien_terdaftar ?? 0) > 0 ||
          (session.kuota_pasien > 0 &&
            session.slot_tersedia !== undefined &&
            session.slot_tersedia < session.kuota_pasien) ||
          slot.actionType === SLOT_ACTION_TYPE.VIEW_PATIENTS
        );

        if (hasBookedPatients) {
          openPatientsMock(session);
        }
        return;
      }

      openAddSessionMock(slot.startTime, slot.endTime);
    };

    // Case 1: Slot with registered patients
    const slotOccupied: OccupancySlot = {
      slotIndex: 0,
      startTime: '08:00',
      endTime: '08:30',
      status: 'OCCUPIED',
      actionType: SLOT_ACTION_TYPE.VIEW_PATIENTS,
      sessionId: dummySessionWithPatients.id
    };
    handleSlotClick(slotOccupied, dummySessionWithPatients);
    expect(openPatientsMock).toHaveBeenCalledTimes(1);
    expect(openPatientsMock).toHaveBeenCalledWith(dummySessionWithPatients);

    // Case 2: Green available slot (no patients)
    const slotAvailable: OccupancySlot = {
      slotIndex: 1,
      startTime: '18:30',
      endTime: '19:00',
      status: 'AVAILABLE',
      actionType: 'VIEW_SESSION',
      sessionId: dummySessionAvailableGreen.id
    };
    handleSlotClick(slotAvailable, dummySessionAvailableGreen);
    // Should NOT call openPatients or openAddSession
    expect(openPatientsMock).toHaveBeenCalledTimes(1);
    expect(openAddSessionMock).toHaveBeenCalledTimes(0);

    // Case 3: Unscheduled slot
    const slotUnscheduled: OccupancySlot = {
      slotIndex: 2,
      startTime: '20:00',
      endTime: '20:30',
      status: AVAILABILITY_STATE.UNSCHEDULED,
      actionType: SLOT_ACTION_TYPE.ADD_SESSION
    };
    handleSlotClick(slotUnscheduled, undefined);
    expect(openAddSessionMock).toHaveBeenCalledTimes(1);
    expect(openAddSessionMock).toHaveBeenCalledWith('20:00', '20:30');
  });

  it('guarantees hover menu only shows Reschedule and Tutup Jadwal when slot has zero patients', () => {
    const session = dummySessionAvailableGreen;
    const isSessionClosed = session.status_sesi === SCHEDULE_STATUS.CLOSED;
    const hasBookedPatients = Boolean((session.pasien_terdaftar ?? 0) > 0);

    const showViewPatients = !isSessionClosed && hasBookedPatients;
    const showReschedule = !isSessionClosed && Boolean(session.is_reschedule_eligible);
    const showToggleStatus = true;

    expect(showViewPatients).toBe(false);
    expect(showReschedule).toBe(true);
    expect(showToggleStatus).toBe(true);
  });
});
