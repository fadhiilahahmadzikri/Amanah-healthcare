import {
  APPOINTMENT_STATUS_OPTIONS,
  normalizeToAppointmentStatus
} from './appointment-status.dictionary';
import type { AppointmentStatus } from '../api/types';

export { APPOINTMENT_STATUS_OPTIONS };
export const LIVE_STATUS_OPTIONS = APPOINTMENT_STATUS_OPTIONS;

export const POLI_OPTIONS = [
  { label: 'Poli Orthopedi', value: 'Poli Orthopedi' },
  { label: 'Poliklinik Kulit & Kelamin', value: 'Poliklinik Kulit & Kelamin' },
  { label: 'Poli Umum', value: 'Poli Umum' },
  { label: 'Poli THT', value: 'Poli THT' },
  { label: 'Poli Jantung', value: 'Poli Jantung' },
  { label: 'Poli Kandungan', value: 'Poli Kandungan' }
];

export const TERMINAL_STATUSES: AppointmentStatus[] = ['COMPLETED', 'CANCELLED', 'LATE'];

export function isAppointmentTerminal(status?: AppointmentStatus | string | null): boolean {
  const canonical = normalizeToAppointmentStatus(status);
  return canonical === 'COMPLETED' || canonical === 'CANCELLED' || canonical === 'LATE';
}

export function isAppointmentInService(status?: AppointmentStatus | string | null): boolean {
  return normalizeToAppointmentStatus(status) === 'IN_SERVICE';
}

export function isAppointmentWaiting(status?: AppointmentStatus | string | null): boolean {
  return normalizeToAppointmentStatus(status) === 'WAITING';
}
