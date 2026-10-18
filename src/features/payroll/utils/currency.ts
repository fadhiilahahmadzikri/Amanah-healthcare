export function formatCurrency(
  amount: number | string | null | undefined,
  currency = 'IDR',
  locale = 'id-ID'
): string {
  if (amount === null || amount === undefined) return 'Rp 0';
  const numeric = typeof amount === 'string' ? Number(amount) : amount;
  if (isNaN(numeric)) return 'Rp 0';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numeric);
}
