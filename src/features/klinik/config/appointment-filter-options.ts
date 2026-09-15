import type { AppointmentStatus } from '../api/types';

export const SERVICE_OPTIONS = [
  'Penyakit Dalam',
  'Spesialis Anak',
  'Kebidanan & Kandungan',
  'Dokter Gigi',
  'Ortopedi & Traumatologi',
  'Dermatologi',
  'Jantung & Kardiovaskular',
  'Spesialis Mata',
  'Spesialis THT',
  'Kesehatan Jiwa & Psikiatri',
  'Neurologi / Saraf',
  'Gizi Klinik'
] as const;

export interface StatusFilterOption {
  value: AppointmentStatus;
  label: string;
  dotColor: string;
}

export const STATUS_OPTIONS: readonly StatusFilterOption[] = [
  { value: 'CONFIRMED', label: 'Confirmed', dotColor: 'bg-emerald-500' },
  { value: 'PENDING', label: 'Pending', dotColor: 'bg-amber-500' },
  { value: 'CHECKED_IN', label: 'Checked In', dotColor: 'bg-indigo-500' },
  { value: 'COMPLETED', label: 'Completed', dotColor: 'bg-purple-500' },
  { value: 'CANCELLED', label: 'Cancelled', dotColor: 'bg-rose-500' }
] as const;
