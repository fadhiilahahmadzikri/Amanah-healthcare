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

  if (doctor.status_dokter === SCHEDULE_STATUS.CLOSED || doctor.status_jadwal === SCHEDULE_STATUS.CLOSED) {
    return DOCTOR_CARD_STATUS.CLOSED;
  }

  if (doctor.status_dokter === SCHEDULE_STATUS.OPEN || doctor.status_jadwal === SCHEDULE_STATUS.OPEN) {
    return DOCTOR_CARD_STATUS.OPEN;
  }

  return DOCTOR_CARD_STATUS.CLOSED;
}

export function parseDateToIso(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const MONTHS: Record<string, string> = {
    jan: '01',
    feb: '02',
    mar: '03',
    apr: '04',
    mei: '05',
    may: '05',
    jun: '06',
    jul: '07',
    agu: '08',
    aug: '08',
    sep: '09',
    okt: '10',
    oct: '10',
    nov: '11',
    des: '12',
    dec: '12'
  };
  const match = dateStr.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const monthKey = match[2].toLowerCase().slice(0, 3);
    const month = MONTHS[monthKey] || '01';
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  return undefined;
}
