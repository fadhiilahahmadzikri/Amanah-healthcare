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

/**
 * Formats a Date object into standard Indonesian short date representation (e.g. "17 Ags").
 */
export function formatShortDate(date: Date): string {
  const day = date.getDate();
  const month = SHORT_MONTH_NAMES[date.getMonth()] ?? '';
  return `${day} ${month}`;
}
