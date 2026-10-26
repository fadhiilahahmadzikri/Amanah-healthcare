import type { PayrollEntryType, StaffCategory } from '../api/types';

export const PAYROLL_PERIOD_STATUS = {
  DRAFT: 'draft',
  CALCULATED: 'calculated',
  FINALIZED: 'finalized'
} as const;

export type PayrollPeriodStatus =
  (typeof PAYROLL_PERIOD_STATUS)[keyof typeof PAYROLL_PERIOD_STATUS];

export const CALCULATED_PAYROLL_STATUSES = new Set<string>([
  PAYROLL_PERIOD_STATUS.CALCULATED,
  PAYROLL_PERIOD_STATUS.FINALIZED
]);

export function isPayrollCalculatedOrFinalized(status?: string | null): boolean {
  return Boolean(status && CALCULATED_PAYROLL_STATUSES.has(status));
}

export const CATEGORY_FACET_OPTIONS: Array<{
  label: string;
  value: StaffCategory;
}> = [
  { label: 'Dokter', value: 'doctor' },
  { label: 'Bidan', value: 'midwife' },
  { label: 'Staf Operasional', value: 'worker' }
];

export const CATEGORY_FILTER_OPTIONS: Array<{
  label: string;
  value: 'all' | StaffCategory;
}> = [{ label: 'Semua Kategori', value: 'all' }, ...CATEGORY_FACET_OPTIONS];

export const PERIOD_STATUS_CONFIG: Record<
  PayrollPeriodStatus,
  { label: string; badgeVariant: 'warning' | 'primary' | 'success'; className: string }
> = {
  [PAYROLL_PERIOD_STATUS.DRAFT]: {
    label: 'Draf',
    badgeVariant: 'warning',
    className:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/40'
  },
  [PAYROLL_PERIOD_STATUS.CALCULATED]: {
    label: 'Terkalkulasi',
    badgeVariant: 'primary',
    className: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300/40'
  },
  [PAYROLL_PERIOD_STATUS.FINALIZED]: {
    label: 'Ditutup buku',
    badgeVariant: 'success',
    className:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/40'
  }
};

export const STATUS_FACET_OPTIONS: Array<{
  label: string;
  value: PayrollPeriodStatus;
}> = [
  {
    label: PERIOD_STATUS_CONFIG[PAYROLL_PERIOD_STATUS.DRAFT].label,
    value: PAYROLL_PERIOD_STATUS.DRAFT
  },
  {
    label: PERIOD_STATUS_CONFIG[PAYROLL_PERIOD_STATUS.CALCULATED].label,
    value: PAYROLL_PERIOD_STATUS.CALCULATED
  },
  {
    label: PERIOD_STATUS_CONFIG[PAYROLL_PERIOD_STATUS.FINALIZED].label,
    value: PAYROLL_PERIOD_STATUS.FINALIZED
  }
];

export const STATUS_FILTER_OPTIONS: Array<{
  label: string;
  value: 'all' | PayrollPeriodStatus;
}> = [{ label: 'Semua Status', value: 'all' }, ...STATUS_FACET_OPTIONS];

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  roster: 'Jadwal dinas',
  leave_request: 'Izin / Cuti',
  attendance: 'Presensi harian'
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
