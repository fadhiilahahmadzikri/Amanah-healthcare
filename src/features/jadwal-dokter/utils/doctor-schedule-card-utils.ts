import type { DoctorSchedule } from '../api/types';
import { SCHEDULE_STATUS, type ScheduleStatus } from '../constants/schedule-shift.constants';

export const DOCTOR_CARD_STATUS = {
  OPEN: SCHEDULE_STATUS.OPEN,
  CLOSED: SCHEDULE_STATUS.CLOSED,
  ON_LEAVE: SCHEDULE_STATUS.ON_LEAVE,
  PENDING: SCHEDULE_STATUS.PENDING
} as const;

export type DoctorCardStatus = ScheduleStatus;

export function isSessionClosed(session: { sessionStatus?: string | null }): boolean {
  return session.sessionStatus === SCHEDULE_STATUS.CLOSED;
}

export function isDoctorPendingVerification(doctor: DoctorSchedule): boolean {
  return (
    doctor.scheduleStatus === SCHEDULE_STATUS.PENDING || doctor.isAcceptingAppointments === false
  );
}

export function hasConfiguredDoctorSchedule(doctor: DoctorSchedule): boolean {
  if (doctor.dailySessions && doctor.dailySessions.length > 0) {
    return true;
  }
  const scheduleTime = doctor.todaySchedule?.trim().toLowerCase() ?? '';
  return scheduleTime !== '' && scheduleTime !== '-' && scheduleTime !== 'belum diatur';
}

export function getDoctorCardStatus(doctor: DoctorSchedule): DoctorCardStatus {
  if (isDoctorPendingVerification(doctor)) {
    return DOCTOR_CARD_STATUS.PENDING;
  }

  if (doctor.scheduleStatus === SCHEDULE_STATUS.ON_LEAVE) {
    return DOCTOR_CARD_STATUS.ON_LEAVE;
  }

  if (doctor.scheduleStatus === SCHEDULE_STATUS.CLOSED) {
    return DOCTOR_CARD_STATUS.CLOSED;
  }

  if (doctor.scheduleStatus === SCHEDULE_STATUS.OPEN) {
    return DOCTOR_CARD_STATUS.OPEN;
  }

  return DOCTOR_CARD_STATUS.CLOSED;
}
