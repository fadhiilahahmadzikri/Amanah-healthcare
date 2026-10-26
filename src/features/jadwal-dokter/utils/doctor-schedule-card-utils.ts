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
    doctor.doctorStatus === SCHEDULE_STATUS.PENDING ||
    doctor.scheduleStatus === SCHEDULE_STATUS.PENDING ||
    doctor.isAcceptingAppointments === false
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

  if (
    doctor.doctorStatus === SCHEDULE_STATUS.ON_LEAVE ||
    doctor.scheduleStatus === SCHEDULE_STATUS.ON_LEAVE ||
    doctor.isOnLeave
  ) {
    return DOCTOR_CARD_STATUS.ON_LEAVE;
  }

  if (
    doctor.doctorStatus === SCHEDULE_STATUS.CLOSED ||
    doctor.scheduleStatus === SCHEDULE_STATUS.CLOSED
  ) {
    return DOCTOR_CARD_STATUS.CLOSED;
  }

  if (
    doctor.doctorStatus === SCHEDULE_STATUS.OPEN ||
    doctor.scheduleStatus === SCHEDULE_STATUS.OPEN
  ) {
    return DOCTOR_CARD_STATUS.OPEN;
  }

  return DOCTOR_CARD_STATUS.CLOSED;
}
