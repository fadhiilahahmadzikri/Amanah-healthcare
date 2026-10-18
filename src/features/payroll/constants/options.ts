import type { PayrollEntryType, PayrollPeriodStatus, StaffCategory } from '../api/types';

export const CATEGORY_FILTER_OPTIONS: Array<{
  label: string;
  value: 'all' | StaffCategory;
}> = [
  { label: 'Semua Kategori', value: 'all' },
  { label: 'Dokter', value: 'doctor' },
  { label: 'Bidan', value: 'midwife' },
  { label: 'Staf Operasional', value: 'worker' }
];

export const PERIOD_STATUS_CONFIG: Record<
  PayrollPeriodStatus,
  { label: string; badgeVariant: 'warning' | 'primary' | 'success'; className: string }
> = {
  draft: {
    label: 'DRAFT',
    badgeVariant: 'warning',
    className:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/40'
  },
  calculated: {
    label: 'TERKALKULASI',
    badgeVariant: 'primary',
    className: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300/40'
  },
  finalized: {
    label: 'FINAL',
    badgeVariant: 'success',
    className:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/40'
  }
};

export const ENTRY_TYPE_CONFIG: Record<
  PayrollEntryType,
  { label: string; isPositive: boolean; colorClass: string }
> = {
  base_scheduled: {
    label: 'Jam Dinas Pokok',
    isPositive: true,
    colorClass: 'text-foreground'
  },
  leave_deduction: {
    label: 'Potongan Izin / Cuti',
    isPositive: false,
    colorClass: 'text-rose-600 dark:text-rose-400'
  },
  replacement_addition: {
    label: 'Insentif Dinas Pengganti',
    isPositive: true,
    colorClass: 'text-emerald-600 dark:text-emerald-400'
  },
  overtime_addition: {
    label: 'Tambahan Lembur',
    isPositive: true,
    colorClass: 'text-blue-600 dark:text-blue-400'
  }
};
