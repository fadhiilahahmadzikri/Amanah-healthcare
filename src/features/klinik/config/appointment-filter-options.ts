import { APPOINTMENT_STATUS, type AppointmentStatus } from '../api/types';

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
  { value: APPOINTMENT_STATUS.BOOKED, label: 'Sudah Buat Janji', dotColor: 'bg-primary' },
  { value: APPOINTMENT_STATUS.WAITING, label: 'Menunggu', dotColor: 'bg-amber-500' },
  { value: APPOINTMENT_STATUS.IN_SERVICE, label: 'Sedang Diperiksa', dotColor: 'bg-sky-500' },
  { value: APPOINTMENT_STATUS.COMPLETED, label: 'Selesai', dotColor: 'bg-emerald-500' },
  { value: APPOINTMENT_STATUS.CANCELLED, label: 'Dibatalkan', dotColor: 'bg-rose-500' },
  { value: APPOINTMENT_STATUS.LATE, label: 'Terlambat', dotColor: 'bg-slate-500' }
] as const;

