/**
 * Pure presentation utilities for formatting attendance timestamps, elapsed durations,
 * and late arrival metrics into natural, localized Indonesian units.
 *
 * Rules:
 * - Presentation only: consumes authoritative ISO timestamps from backend.
 * - Zero speculative fallbacks, zero fabricated data.
 */

export interface WorkDurationOptions {
  checkInAt?: string | null;
  checkOutAt?: string | null;
  validatedHours?: number | null;
}

/**
 * Formats elapsed work duration into natural localized Indonesian units.
 * Examples:
 * - No checkOutAt => "Sedang berdinas"
 * - 25 seconds => "25 detik"
 * - 15 minutes => "15 menit"
 * - 1 hour 20 minutes => "1 jam 20 menit"
 * - 7 hours => "7 jam"
 */
export function formatWorkDuration(options: WorkDurationOptions): string {
  const { checkInAt, checkOutAt, validatedHours } = options;

  if (!checkOutAt && checkInAt) {
    return 'Sedang berdinas';
  }

  if (checkInAt && checkOutAt) {
    const startMs = new Date(checkInAt).getTime();
    const endMs = new Date(checkOutAt).getTime();
    if (!Number.isNaN(startMs) && !Number.isNaN(endMs) && endMs >= startMs) {
      const diffSec = Math.floor((endMs - startMs) / 1000);
      if (diffSec < 60) {
        return `${Math.max(1, diffSec)} detik`;
      }
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) {
        const remSec = diffSec % 60;
        return remSec > 0 ? `${diffMin} menit ${remSec} detik` : `${diffMin} menit`;
      }
      const hours = Math.floor(diffMin / 60);
      const remMin = diffMin % 60;
      return remMin > 0 ? `${hours} jam ${remMin} menit` : `${hours} jam`;
    }
  }

  if (validatedHours !== undefined && validatedHours !== null && validatedHours > 0) {
    if (validatedHours < 1) {
      const min = Math.round(validatedHours * 60);
      return `${Math.max(1, min)} menit`;
    }
    const h = Math.floor(validatedHours);
    const m = Math.round((validatedHours - h) * 60);
    return m > 0 ? `${h} jam ${m} menit` : `${h} jam`;
  }

  return checkOutAt ? '-' : 'Sedang berdinas';
}

/**
 * Formats an ISO timestamp string into second-precision Indonesian clinic time: "HH:mm:ss WIB".
 */
export function formatPresenceTimestamp(
  dateStr?: string | null,
  includeSeconds = true
): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';
    return `${d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {})
    })} WIB`;
  } catch {
    return '-';
  }
}

/**
 * Formats late arrival minutes into a localized warning string.
 * Example: 15 => "Terlambat 15 menit", 75 => "Terlambat 1 jam 15 menit"
 */
export function formatLateMinutes(minutes?: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) {
    return `Terlambat ${minutes} menit`;
  }
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return remMin > 0 ? `Terlambat ${hours} jam ${remMin} menit` : `Terlambat ${hours} jam`;
}
