import type { DoctorSchedule } from '../api/types';
import { SCHEDULE_STATUS } from '../constants/schedule-shift.constants';

export const DOCTOR_CARD_STATUS = {
  OPEN: 'Buka',
  CLOSED: 'Tutup'
} as const;

export type DoctorCardStatus = 'Buka' | 'Tutup' | null;

export function isSessionClosed(session: { status_sesi?: string | null }): boolean {
  return session.status_sesi === SCHEDULE_STATUS.CLOSED;
}

export function hasConfiguredDoctorSchedule(doctor: DoctorSchedule): boolean {
  if (doctor.sesi_harian && doctor.sesi_harian.length > 0) {
    return true;
  }
  const scheduleTime = doctor.jadwal_hari_ini?.trim().toLowerCase() ?? '';
  return scheduleTime !== '' && scheduleTime !== '-' && scheduleTime !== 'belum diatur';
}

export function getDoctorCardStatus(doctor: DoctorSchedule): DoctorCardStatus {
  if (doctor.is_on_leave) {
    return DOCTOR_CARD_STATUS.CLOSED;
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
