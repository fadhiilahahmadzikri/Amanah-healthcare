/**
 * Single Source of Truth (SSOT) untuk utilitas pemformatan tanggal & waktu klinik.
 *
 * Menghormati konfigurasi klinik (`clinic_setting`), bebas dependensi rapuh,
 * dan mencegah pergeseran timezone (timezone drift) pada string kalender YYYY-MM-DD.
 */

export type ClinicDateFormatStyle = 'human_full' | 'human_medium' | 'human_short' | 'iso';

export type ClinicTimeFormatStyle = '24h' | '12h';

export interface FormatClinicDateOptions {
  style?: ClinicDateFormatStyle;
  locale?: string;
}

export interface FormatClinicTimeOptions {
  style?: ClinicTimeFormatStyle;
  withSuffix?: boolean;
  suffix?: string;
  locale?: string;
  includeSeconds?: boolean;
}

export interface FormatClinicDateTimeOptions {
  dateStyle?: ClinicDateFormatStyle;
  timeStyle?: ClinicTimeFormatStyle;
  separator?: string;
  withSuffix?: boolean;
  suffix?: string;
  locale?: string;
}

const DEFAULT_LOCALE = 'id-ID';
const DEFAULT_DATE_STYLE: ClinicDateFormatStyle = 'human_full';
const DEFAULT_TIME_STYLE: ClinicTimeFormatStyle = '24h';

let activeClinicLocale: string = DEFAULT_LOCALE;
let activeClinicDateStyle: ClinicDateFormatStyle = DEFAULT_DATE_STYLE;
let activeClinicTimeStyle: ClinicTimeFormatStyle = DEFAULT_TIME_STYLE;

export function configureClinicDateTime(config: {
  dateFormatStyle?: ClinicDateFormatStyle;
  timeFormatStyle?: ClinicTimeFormatStyle;
  locale?: string;
}) {
  if (config.dateFormatStyle) activeClinicDateStyle = config.dateFormatStyle;
  if (config.timeFormatStyle) activeClinicTimeStyle = config.timeFormatStyle;
  if (config.locale) activeClinicLocale = config.locale;
}

/**
 * Parsing input tanggal menjadi komponen UTC murni tanpa terpengaruh pergeseran jam lokal.
 */
function parseDateParts(input: string | Date | number | null | undefined): {
  year: number;
  month: number; // 1-12
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  dateObj: Date;
} | null {
  if (input === null || input === undefined || input === '') {
    return null;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    // Format YYYY-MM-DD murni
    const pureDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (pureDateMatch) {
      const year = parseInt(pureDateMatch[1], 10);
      const month = parseInt(pureDateMatch[2], 10);
      const day = parseInt(pureDateMatch[3], 10);
      const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      return { year, month, day, hours: 0, minutes: 0, seconds: 0, dateObj };
    }

    // Format ISO string atau timestamp lainnya
    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) {
      return null;
    }
    return {
      year: parsed.getFullYear(),
      month: parsed.getMonth() + 1,
      day: parsed.getDate(),
      hours: parsed.getHours(),
      minutes: parsed.getMinutes(),
      seconds: parsed.getSeconds(),
      dateObj: parsed
    };
  }

  const parsed = input instanceof Date ? input : new Date(input);
  if (isNaN(parsed.getTime())) {
    return null;
  }

  return {
    year: parsed.getFullYear(),
    month: parsed.getMonth() + 1,
    day: parsed.getDate(),
    hours: parsed.getHours(),
    minutes: parsed.getMinutes(),
    seconds: parsed.getSeconds(),
    dateObj: parsed
  };
}

/**
 * Memformat tanggal sesuai gaya konfigurasi klinik (SSOT).
 */
export function formatClinicDate(
  date: string | Date | number | null | undefined,
  options?: FormatClinicDateOptions
): string {
  if (!date) return '-';

  const parts = parseDateParts(date);
  if (!parts) {
    return typeof date === 'string' ? date : '-';
  }

  const style = options?.style ?? activeClinicDateStyle;
  const locale = options?.locale ?? activeClinicLocale;

  if (style === 'iso') {
    const y = parts.year;
    const m = String(parts.month).padStart(2, '0');
    const d = String(parts.day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  if (style === 'human_short') {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(parts.dateObj);
  }

  if (style === 'human_medium') {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(parts.dateObj);
  }

  // human_full (default)
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(parts.dateObj);
}

/**
 * Memformat waktu (jam & menit) sesuai format 24 jam / 12 jam klinik.
 */
export function formatClinicTime(
  date: string | Date | number | null | undefined,
  options?: FormatClinicTimeOptions
): string {
  if (!date) return '-';

  // Jika input adalah string waktu murni HH:MM atau HH:MM:SS
  if (typeof date === 'string') {
    const timeMatch = date.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (timeMatch) {
      const h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const s = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      const style = options?.style ?? activeClinicTimeStyle;
      const suffix = options?.suffix ?? (options?.withSuffix ? ' WIB' : '');
      const secStr = options?.includeSeconds ? `:${String(s).padStart(2, '0')}` : '';

      if (style === '12h') {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')}${secStr} ${period}`;
      }

      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}${secStr}${suffix}`;
    }
  }

  const parts = parseDateParts(date);
  if (!parts) return typeof date === 'string' ? date : '-';

  const style = options?.style ?? activeClinicTimeStyle;
  const suffix = options?.suffix ?? (options?.withSuffix ? ' WIB' : '');
  const secStr = options?.includeSeconds ? `:${String(parts.seconds).padStart(2, '0')}` : '';

  if (style === '12h') {
    const period = parts.hours >= 12 ? 'PM' : 'AM';
    const displayH = parts.hours % 12 === 0 ? 12 : parts.hours % 12;
    return `${String(displayH).padStart(2, '0')}:${String(parts.minutes).padStart(2, '0')}${secStr} ${period}`;
  }

  return `${String(parts.hours).padStart(2, '0')}:${String(parts.minutes).padStart(2, '0')}${secStr}${suffix}`;
}

/**
 * Memformat tanggal dan waktu secara terpadu.
 */
export function formatClinicDateTime(
  date: string | Date | number | null | undefined,
  options?: FormatClinicDateTimeOptions
): string {
  if (!date) return '-';

  const dateStr = formatClinicDate(date, {
    style: options?.dateStyle,
    locale: options?.locale
  });

  const timeStr = formatClinicTime(date, {
    style: options?.timeStyle,
    withSuffix: options?.withSuffix,
    suffix: options?.suffix,
    locale: options?.locale
  });

  const separator = options?.separator ?? ', ';
  return `${dateStr}${separator}${timeStr}`;
}

/**
 * Mengembalikan string tanggal hari ini (YYYY-MM-DD) sesuai konvensi SSOT klinik.
 */
export function getClinicTodayDateString(): string {
  return formatClinicDate(new Date(), { style: 'iso' });
}

export interface ClinicDateTokens {
  day: string;
  monthShort: string;
  monthUpper: string;
  monthFull: string;
  weekday: string;
  year: string;
}

/**
 * Menguraikan tanggal menjadi komponen terstruktur (hari, bulan, tahun, hari dalam minggu)
 * dengan garansi bebas timezone drift dan mengikuti locale aktif klinik (SSOT).
 */
export function getClinicDateTokens(
  date: string | Date | number | null | undefined,
  locale = activeClinicLocale
): ClinicDateTokens | null {
  const parts = parseDateParts(date);
  if (!parts) return null;

  const day = String(parts.day);
  const year = String(parts.year);

  const monthShort = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(
    parts.dateObj
  );
  const monthUpper = monthShort.toUpperCase().replace('.', '');
  const monthFull = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(
    parts.dateObj
  );
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(
    parts.dateObj
  );

  return { day, monthShort, monthUpper, monthFull, weekday, year };
}
