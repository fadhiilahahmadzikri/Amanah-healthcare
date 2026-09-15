import type { AppointmentFilterState } from './appointmentViewModel';

const FULL_MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
] as const;

const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Ags',
  'Sep',
  'Okt',
  'Nov',
  'Des'
] as const;

export interface MonthOption {
  value: string;
  label: string;
}

export interface BuildMonthOptionsConfig {
  pastMonths?: number;
  futureMonths?: number;
}

/**
 * Pure rule to determine if any appointment filter is currently active.
 */
export function isAppointmentFilterActive(filters: AppointmentFilterState): boolean {
  return (
    Boolean(filters.searchQuery.trim()) ||
    (filters.monthFilter !== 'ALL' && Boolean(filters.monthFilter)) ||
    Boolean(filters.dateFilter) ||
    filters.selectedServices.length > 0 ||
    filters.selectedStatuses.length > 0
  );
}

/**
 * Dynamically builds a list of month options relative to a reference date.
 * Avoids hardcoded year/month values and dynamically rolls forward across years.
 */
export function buildMonthOptions(
  baseDate: Date = new Date(),
  config: BuildMonthOptionsConfig = {}
): MonthOption[] {
  const pastMonths = config.pastMonths ?? 1;
  const futureMonths = config.futureMonths ?? 2;

  const results: MonthOption[] = [{ value: 'ALL', label: 'Semua Bulan' }];

  const currentYear = baseDate.getFullYear();
  const currentMonth = baseDate.getMonth();

  for (let offset = -pastMonths; offset <= futureMonths; offset++) {
    const targetDate = new Date(currentYear, currentMonth + offset, 1);
    const targetMonthIndex = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    const shortMonth = SHORT_MONTH_NAMES[targetMonthIndex];
    const fullMonth = FULL_MONTH_NAMES[targetMonthIndex];

    results.push({
      value: `${shortMonth} ${targetYear}`,
      label: `${fullMonth} ${targetYear}`
    });
  }

  return results;
}
