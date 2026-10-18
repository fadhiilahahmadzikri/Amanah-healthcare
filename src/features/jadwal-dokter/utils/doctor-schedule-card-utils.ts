import type { DoctorSchedule } from '../api/types';
import { SCHEDULE_STATUS, type ScheduleStatus } from '../constants/schedule-shift.constants';

export const DOCTOR_CARD_STATUS = {
  OPEN: SCHEDULE_STATUS.OPEN,
  CLOSED: SCHEDULE_STATUS.CLOSED,
  ON_LEAVE: SCHEDULE_STATUS.ON_LEAVE,
  PENDING: SCHEDULE_STATUS.PENDING
} as const;

export type DoctorCardStatus = ScheduleStatus;

export function isSessionClosed(session: { status_sesi?: string | null }): boolean {
  return session.status_sesi === SCHEDULE_STATUS.CLOSED;
}

export function isDoctorPendingVerification(doctor: DoctorSchedule): boolean {
  return (
    doctor.status_dokter === SCHEDULE_STATUS.PENDING ||
    doctor.status_jadwal === SCHEDULE_STATUS.PENDING ||
    doctor.is_accepting_appointments === false
  );
}

export function hasConfiguredDoctorSchedule(doctor: DoctorSchedule): boolean {
  if (doctor.sesi_harian && doctor.sesi_harian.length > 0) {
    return true;
  }
  const scheduleTime = doctor.jadwal_hari_ini?.trim().toLowerCase() ?? '';
  return scheduleTime !== '' && scheduleTime !== '-' && scheduleTime !== 'belum diatur';
}

export function getDoctorCardStatus(doctor: DoctorSchedule): DoctorCardStatus {
  if (isDoctorPendingVerification(doctor)) {
    return DOCTOR_CARD_STATUS.PENDING;
  }

  if (
    doctor.status_dokter === SCHEDULE_STATUS.ON_LEAVE ||
    doctor.status_jadwal === SCHEDULE_STATUS.ON_LEAVE ||
    doctor.is_on_leave
  ) {
    return DOCTOR_CARD_STATUS.ON_LEAVE;
  }

  if (
    doctor.status_dokter === SCHEDULE_STATUS.CLOSED ||
    doctor.status_jadwal === SCHEDULE_STATUS.CLOSED
  ) {
    return DOCTOR_CARD_STATUS.CLOSED;
  }

  if (
    doctor.status_dokter === SCHEDULE_STATUS.OPEN ||
    doctor.status_jadwal === SCHEDULE_STATUS.OPEN
  ) {
    return DOCTOR_CARD_STATUS.OPEN;
  }

  return DOCTOR_CARD_STATUS.CLOSED;
}
