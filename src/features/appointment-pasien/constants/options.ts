import {
  AppointmentStatusDescriptor,
  APPOINTMENT_STATUS
} from '@/constants/appointment-status.constants';
import {
  APPOINTMENT_STATUS_OPTIONS
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

export const TERMINAL_STATUSES: AppointmentStatus[] = [
  APPOINTMENT_STATUS.COMPLETED,
  APPOINTMENT_STATUS.CANCELLED,
  APPOINTMENT_STATUS.LATE
];

export function isAppointmentTerminal(status?: AppointmentStatus | string | null): boolean {
  return AppointmentStatusDescriptor.from(status).isTerminal;
}

export function isAppointmentInService(status?: AppointmentStatus | string | null): boolean {
  return AppointmentStatusDescriptor.from(status).isInService;
}

export function isAppointmentWaiting(status?: AppointmentStatus | string | null): boolean {
  return AppointmentStatusDescriptor.from(status).isWaiting;
}
