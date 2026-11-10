import { PromoStatus } from '../types/promotions.types';

export function getPromoStatus(
  promo: {
    isPublished: boolean;
    startsAt?: string | null;
    endsAt?: string | null;
    deletedAt?: string | null;
  },
  now = new Date(),
): PromoStatus {
  if (promo.deletedAt) return 'archived';
  if (!promo.isPublished) return 'draft';

  const nowIso = now.toISOString();
  if (promo.startsAt && nowIso < promo.startsAt) return 'scheduled';
  if (promo.endsAt && nowIso >= promo.endsAt) return 'expired';

  return 'live';
}

const WIB_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: 'Asia/Jakarta',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

const WIB_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: 'Asia/Jakarta',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export function formatWibDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', WIB_OPTIONS).format(d) + ' WIB';
  } catch {
    return dateStr;
  }
}

export function formatWibDateTime(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', WIB_TIME_OPTIONS).format(d) + ' WIB';
  } catch {
    return dateStr;
  }
}

export function formatWibPeriod(
  startsAt?: string | null,
  endsAt?: string | null,
): string {
  if (!startsAt && !endsAt) {
    return 'Tanpa batas waktu (Selalu Tayang)';
  }

  const startFormatted = startsAt ? formatWibDate(startsAt) : 'Sekarang';
  const endFormatted = endsAt ? formatWibDate(endsAt) : 'Seterusnya';

  return `${startFormatted} – ${endFormatted}`;
}

export const formatSchedulePeriod = formatWibPeriod;

