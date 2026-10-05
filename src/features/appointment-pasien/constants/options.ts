export const LIVE_STATUS_OPTIONS = [
  { label: 'Sudah Buat Janji', value: 'SUDAH BUAT JANJI' },
  { label: 'Sudah Datang', value: 'SUDAH DATANG' },
  { label: 'Menunggu', value: 'MENUNGGU' },
  { label: 'Sedang Periksa', value: 'SEDANG PERIKSA' },
  { label: 'Selesai', value: 'SELESAI' },
  { label: 'Tidak Ada Dokter', value: 'TIDAK ADA DOKTER' }
];

export const POLI_OPTIONS = [
  { label: 'Poli Orthopedi', value: 'Poli Orthopedi' },
  { label: 'Poliklinik Kulit & Kelamin', value: 'Poliklinik Kulit & Kelamin' },
  { label: 'Poli Umum', value: 'Poli Umum' },
  { label: 'Poli THT', value: 'Poli THT' },
  { label: 'Poli Jantung', value: 'Poli Jantung' },
  { label: 'Poli Kandungan', value: 'Poli Kandungan' }
];

export const TERMINAL_LIVE_STATUSES = ['SELESAI', 'TIDAK ADA DOKTER'] as const;

export function normalizeStatusString(status: string | null | undefined): string {
  if (!status) return '';
  return status.trim().toUpperCase().replace(/_/g, ' ');
}

export function isAppointmentTerminal(status: string | null | undefined): boolean {
  const normalized = normalizeStatusString(status);
  return (
    normalized === 'SELESAI' ||
    normalized === 'COMPLETED' ||
    normalized === 'BATAL' ||
    normalized === 'CANCELLED' ||
    normalized === 'TIDAK ADA DOKTER' ||
    normalized === 'NO SHOW' ||
    normalized === 'TIDAK HADIR'
  );
}

export function isAppointmentInService(status: string | null | undefined): boolean {
  const normalized = normalizeStatusString(status);
  return (
    normalized === 'SEDANG PERIKSA' ||
    normalized === 'SEDANG DIPERIKSA' ||
    normalized === 'IN SERVICE' ||
    normalized === 'SEDANG DILAYANI'
  );
}

export function isAppointmentWaiting(status: string | null | undefined): boolean {
  const normalized = normalizeStatusString(status);
  return (
    normalized === 'MENUNGGU' ||
    normalized === 'WAITING' ||
    normalized === 'SUDAH BUAT JANJI' ||
    normalized === 'BOOKED' ||
    normalized === 'BOOK' ||
    normalized === 'PENDING' ||
    normalized === 'SUDAH DATANG' ||
    normalized === 'CHECKED IN'
  );
}

