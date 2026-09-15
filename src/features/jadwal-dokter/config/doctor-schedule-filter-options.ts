export const POLI_OPTIONS = [
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
  'Dokter Umum'
] as const;

export interface DoctorScheduleStatusOption {
  value: string;
  label: string;
  dotColor: string;
}

export const DOCTOR_SCHEDULE_STATUS_OPTIONS: readonly DoctorScheduleStatusOption[] = [
  { value: 'Buka', label: 'Buka', dotColor: 'bg-emerald-500' },
  { value: 'Penuh', label: 'Penuh', dotColor: 'bg-amber-500' },
  { value: 'Cuti', label: 'Cuti', dotColor: 'bg-sky-500' }
] as const;
