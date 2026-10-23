export type ExportType = 'attendance' | 'payroll';

export type ExportFormat = 'pdf' | 'xlsx' | 'csv';

export type ExportJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExportFormatMeta {
  format: ExportFormat;
  label: string;
  shortLabel: string;
  description: string;
  extension: string;
  accentColorClass: {
    bg: string;
    text: string;
    border: string;
    badge: string;
  };
}

export const EXPORT_FORMAT_OPTIONS: ExportFormatMeta[] = [
  {
    format: 'pdf',
    label: 'Dokumen PDF (.pdf)',
    shortLabel: 'PDF',
    description: 'Format dokumen cetak resmi berkop klinik',
    extension: 'pdf',
    accentColorClass: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'hover:border-rose-500/40 focus:border-rose-500/60',
      badge: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
    }
  },
  {
    format: 'xlsx',
    label: 'Spreadsheet Excel (.xlsx)',
    shortLabel: 'Excel',
    description: 'Format tabel Microsoft Excel bersel terstruktur',
    extension: 'xlsx',
    accentColorClass: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-500/40 focus:border-emerald-500/60',
      badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    }
  },
  {
    format: 'csv',
    label: 'Berkas Tabel CSV (.csv)',
    shortLabel: 'CSV',
    description: 'Format berkas data teks koma ringan',
    extension: 'csv',
    accentColorClass: {
      bg: 'bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400',
      text: 'text-sky-600 dark:text-sky-400',
      border: 'hover:border-sky-500/40 focus:border-sky-500/60',
      badge: 'border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400'
    }
  }
];

export interface ExportJob {
  jobId: string;
  status: ExportJobStatus;
  exportType: string;
  format: ExportFormat;
  totalRows: number;
  processedRows: number;
  percent: number;
  phase: string;
  downloadUrl?: string | null;
  errorMessage?: string | null;
  createdAt?: string;
  finishedAt?: string;
}

export interface CheckAvailabilityResponse {
  available: boolean;
  totalRows: number;
}

export interface RequestExportResponse {
  jobId: string;
  status: string;
  statusUrl: string;
  isIdempotentReplay?: boolean;
}

export function mapPhaseText(phase: string): string {
  switch ((phase || '').toUpperCase()) {
    case 'QUEUED':
      return 'Mengantre di antrean server...';
    case 'WRITING':
      return 'Menyusun berkas dokumen data...';
    case 'FINALIZING':
      return 'Menyelesaikan enkripsi dan penyimpanan...';
    case 'DONE':
      return 'Berkas siap diunduh!';
    default:
      return 'Memproses data di server...';
  }
}
