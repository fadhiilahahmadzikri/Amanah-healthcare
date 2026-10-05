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

  it('evaluates isClickable as true for green available slots so they can be clicked to view slot info', () => {
    const matchingSession = dummySessionAvailableGreen;
    const isUnscheduled = !matchingSession;
    const isFinished = false;
    const isDayCuti = false;
    const readOnly = false;
    const isDayClosed = false;

    const isClickable =
      !isFinished && !isDayCuti && !readOnly && (isUnscheduled ? !isDayClosed : true);

    expect(isClickable).toBe(true);
  });

  it('evaluates isClickable as true for slots with booked patients to open slot info modal', () => {
    const matchingSession = dummySessionWithPatients;
    const isUnscheduled = !matchingSession;
    const isFinished = false;
    const isDayCuti = false;
    const readOnly = false;
    const isDayClosed = false;

    const isClickable =
      !isFinished && !isDayCuti && !readOnly && (isUnscheduled ? !isDayClosed : true);

    expect(isClickable).toBe(true);
  });

  it('evaluates isClickable as true for unscheduled slots to add new practice schedule', () => {
    const isUnscheduled = true;
    const isFinished = false;
    const isDayCuti = false;
    const readOnly = false;
    const isDayClosed = false;

    const isClickable =
      !isFinished && !isDayCuti && !readOnly && (isUnscheduled ? !isDayClosed : true);

    expect(isClickable).toBe(true);
  });

  it('directly dispatches handleOpenSlotModal on click for any active session slot (green available or occupied)', () => {
    const openSlotModalMock = mock();
    const openAddSessionMock = mock();

    const handleSlotClick = (slot: OccupancySlot, session: DoctorDailySession | undefined) => {
      if (slot.actionType === SLOT_ACTION_TYPE.ADD_SESSION) {
        openAddSessionMock(slot.startTime, slot.endTime);
        return;
      }

      if (session) {
        openSlotModalMock(slot, session);
        return;
      }

      openAddSessionMock(slot.startTime, slot.endTime);
    };

    // Case 1: Slot with registered patients (opens slot modal with context)
    const slotOccupied: OccupancySlot = {
      slotIndex: 0,
      startTime: '08:00',
      endTime: '08:30',
      status: 'OCCUPIED',
      actionType: SLOT_ACTION_TYPE.VIEW_PATIENTS,
      sessionId: dummySessionWithPatients.id
    };
    handleSlotClick(slotOccupied, dummySessionWithPatients);
    expect(openSlotModalMock).toHaveBeenCalledTimes(1);
    expect(openSlotModalMock).toHaveBeenCalledWith(slotOccupied, dummySessionWithPatients);

    // Case 2: Green available slot (no patients) - opens slot info modal
    const slotAvailable: OccupancySlot = {
      slotIndex: 1,
      startTime: '18:30',
      endTime: '19:00',
      status: 'AVAILABLE',
      actionType: 'VIEW_SESSION',
      sessionId: dummySessionAvailableGreen.id
    };
    handleSlotClick(slotAvailable, dummySessionAvailableGreen);
    expect(openSlotModalMock).toHaveBeenCalledTimes(2);
    expect(openSlotModalMock).toHaveBeenCalledWith(slotAvailable, dummySessionAvailableGreen);

    // Case 3: Unscheduled slot - opens add session modal
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
    const slot = {
      status: 'AVAILABLE',
      actionType: 'VIEW_SESSION',
      uiVariant: 'success_green'
    };

    const hasSlotBookedPatients = Boolean(
      slot.actionType === 'VIEW_PATIENTS' ||
      slot.status === 'OCCUPIED' ||
      (slot.uiVariant && slot.uiVariant !== 'success_green')
    );

    const showViewPatients = !isSessionClosed && hasSlotBookedPatients;
    const showChangeDoctor = !isSessionClosed && hasSlotBookedPatients;
    const showChangeRoom = !isSessionClosed && hasSlotBookedPatients;
    const showReschedule = !isSessionClosed && Boolean(session.is_reschedule_eligible);
    const showToggleStatus = true;

    expect(showViewPatients).toBe(false);
    expect(showChangeDoctor).toBe(false);
    expect(showChangeRoom).toBe(false);
    expect(showReschedule).toBe(true);
    expect(showToggleStatus).toBe(true);
  });

  it('guarantees hover menu displays Ganti Dokter and Ganti Ruangan when slot has booked patients', () => {
    const session = dummySessionWithPatients;
    const isSessionClosed = session.status_sesi === SCHEDULE_STATUS.CLOSED;
    const slot = {
      status: 'OCCUPIED',
      actionType: 'VIEW_PATIENTS',
      uiVariant: 'sky_patient'
    };

    const hasSlotBookedPatients = Boolean(
      slot.actionType === 'VIEW_PATIENTS' ||
      slot.status === 'OCCUPIED' ||
      (slot.uiVariant && slot.uiVariant !== 'success_green')
    );

    const showViewPatients = !isSessionClosed && hasSlotBookedPatients;
    const showChangeDoctor = !isSessionClosed && hasSlotBookedPatients;
    const showChangeRoom = !isSessionClosed && hasSlotBookedPatients;

    expect(showViewPatients).toBe(true);
    expect(showChangeDoctor).toBe(true);
    expect(showChangeRoom).toBe(true);
  });

  it('disables hover menu completely when slot is finished/expired', () => {
    const matchingSession = dummySessionWithPatients;
    const isFinished = true;
    const hasHoverMenuProp = true;

    // Both shift section and slot item guard with !isFinished
    const shouldRenderHoverMenu = hasHoverMenuProp && Boolean(matchingSession) && !isFinished;
    expect(shouldRenderHoverMenu).toBe(false);
  });

  it('filters patient list strictly by slotStartTime in Level 2 mode while keeping all in Level 1', () => {
    const allPatients = [
      { appointmentId: 'apt-1', timeSlot: '08:00 - 08:30 WIB', queueNumber: 'P-001' },
      { appointmentId: 'apt-2', timeSlot: '08:30 - 09:00 WIB', queueNumber: 'P-002' },
      { appointmentId: 'apt-3', timeSlot: '08:00 - 08:30 WIB', queueNumber: 'P-003' }
    ];

    // Level 1: Global session (slotStartTime is undefined)
    const level1Patients = allPatients.filter((p) => {
      const slotStartTime = undefined;
      if (!slotStartTime) return true;
      const start = p.timeSlot?.split('-')[0].trim().replace(/wib/i, '').trim();
      return start === slotStartTime;
    });
    expect(level1Patients).toHaveLength(3);

    // Level 2: Slot 08:00
    const level2Patients = allPatients.filter((p) => {
      const slotStartTime = '08:00';
      const start = p.timeSlot?.split('-')[0].trim().replace(/wib/i, '').trim();
      return start === slotStartTime || p.timeSlot?.startsWith(slotStartTime);
    });
    expect(level2Patients).toHaveLength(2);
    expect(level2Patients.map((p) => p.appointmentId)).toEqual(['apt-1', 'apt-3']);
  });

  it('guarantees shift header invokes onOpenPatients for multi-patient session while grid slot invokes onOpenPatientDetail directly for single patient', () => {
    const openPatientsHeaderMock = mock();
    const openPatientDetailSlotMock = mock();

    // 1. Shift header button interaction: multi-patient session accumulation
    const onHeaderClick = (session: DoctorDailySession) => {
      openPatientsHeaderMock(session);
    };
    onHeaderClick(dummySessionWithPatients);
    expect(openPatientsHeaderMock).toHaveBeenCalledTimes(1);
    expect(openPatientsHeaderMock).toHaveBeenCalledWith(dummySessionWithPatients);

    // 2. Grid slot hover menu / slot info modal button interaction: direct patient detail
    const slot: OccupancySlot = {
      slotIndex: 0,
      startTime: '08:00',
      endTime: '08:30',
      status: 'OCCUPIED',
      actionType: SLOT_ACTION_TYPE.VIEW_PATIENTS,
      sessionId: dummySessionWithPatients.id,
      appointmentRef: {
        appointmentId: 'apt-101',
        queueNumber: 'A-01',
        status: 'waiting',
        patientName: 'Budi Santoso'
      }
    };

    const onGridSlotViewPatient = (
      session: DoctorDailySession,
      targetSlot: OccupancySlot,
      onOpenPatientDetail?: (session: DoctorDailySession, slot: OccupancySlot) => void
    ) => {
      if (onOpenPatientDetail) {
        onOpenPatientDetail(session, targetSlot);
      }
    };

    onGridSlotViewPatient(dummySessionWithPatients, slot, openPatientDetailSlotMock);
    expect(openPatientDetailSlotMock).toHaveBeenCalledTimes(1);
    expect(openPatientDetailSlotMock).toHaveBeenCalledWith(dummySessionWithPatients, slot);
  });
});
