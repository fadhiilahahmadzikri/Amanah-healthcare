import type { SessionDefConfig } from '../api/admin-schedule-configuration.api';

/**
 * Mengonversi string waktu 'HH:mm' atau 'HH:mm:ss' ke menit sejak 00:00.
 */
export function parseTimeToMinutes(timeStr?: string | null): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const h = Number(parts[0]) || 0;
  const m = Number(parts[1]) || 0;
  return h * 60 + m;
}

/**
 * Mengonversi waktu selesai ke menit sejak 00:00,
 * memperlakukan '24:00' atau midnight pergantian hari sebagai 1440 menit.
 */
export function parseTimeEndToMinutes(timeStr?: string | null, startMin = 0): number {
  if (!timeStr) return 0;
  const trimmed = timeStr.trim();
  if (trimmed.startsWith('24:')) {
    return 1440;
  }
  const min = parseTimeToMinutes(trimmed);
  if (min === 0 && startMin >= 12 * 60) {
    return 1440;
  }
  return min;
}

/**
 * Mengonversi menit integer ke string waktu 'HH:mm'.
 */
export function minutesToTimeString(minutes: number): string {
  const bounded = Math.max(0, Math.min(1440, minutes));
  if (bounded === 1440) return '24:00';
  const h = Math.floor(bounded / 60);
  const m = bounded % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Menghitung durasi kotor dalam jam antara dua penanda waktu.
 */
export function calculateShiftDurationHours(startsAt: string, endsAt: string): number {
  const startMin = parseTimeToMinutes(startsAt);
  const endMin = parseTimeEndToMinutes(endsAt, startMin);
  const diff = Math.max(0, endMin - startMin);
  return Number((diff / 60).toFixed(1));
}

export interface ShiftValidationResult {
  isValid: boolean;
  errorMessage: string | null;
  conflictingIds: string[];
}

/**
 * Memvalidasi apakah terdapat tabrakan (overlap) atau inkonsistensi waktu pada shift master.
 *
 * Aturan Bisnis:
 * 1. Setiap shift aktif harus startsAt < endsAt.
 * 2. Dua shift aktif TIDAK BOLEH saling bertabrakan: max(startA, startB) < min(endA, endB).
 * 3. Jeda/Gap operasional klinik (endA <= startB) sepenuhnya SAH dan diizinkan.
 */
export function detectSessionDefsOverlaps(defs: SessionDefConfig[]): ShiftValidationResult {
  const activeDefs = defs
    .filter((d) => d.isActive)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  // 1. Validasi internal masing-masing shift
  for (const def of activeDefs) {
    const startMin = parseTimeToMinutes(def.defaultStartsAt);
    const endMin = parseTimeEndToMinutes(def.defaultEndsAt, startMin);
    const label = def.label || def.code;

    if (startMin >= endMin) {
      return {
        isValid: false,
        errorMessage: `Shift ${label} memiliki jam mulai (${(def.defaultStartsAt || '').slice(0, 5)}) yang sama atau lebih lambat dari jam selesai (${(def.defaultEndsAt || '').slice(0, 5)}).`,
        conflictingIds: [def.id]
      };
    }
  }

  // 2. Validasi tabrakan antar-shift aktif
  for (let i = 0; i < activeDefs.length; i++) {
    for (let j = i + 1; j < activeDefs.length; j++) {
      const a = activeDefs[i];
      const b = activeDefs[j];

      const aStart = parseTimeToMinutes(a.defaultStartsAt);
      const aEnd = parseTimeEndToMinutes(a.defaultEndsAt, aStart);

      const bStart = parseTimeToMinutes(b.defaultStartsAt);
      const bEnd = parseTimeEndToMinutes(b.defaultEndsAt, bStart);

      const overlapStart = Math.max(aStart, bStart);
      const overlapEnd = Math.min(aEnd, bEnd);

      if (overlapStart < overlapEnd) {
        const labelA = a.label || a.code;
        const labelB = b.label || b.code;
        const timeA = `${(a.defaultStartsAt || '').slice(0, 5)} - ${(a.defaultEndsAt || '').slice(0, 5)}`;
        const timeB = `${(b.defaultStartsAt || '').slice(0, 5)} - ${(b.defaultEndsAt || '').slice(0, 5)}`;

        return {
          isValid: false,
          errorMessage: `Shift ${labelA} (${timeA}) bertabrakan dengan Shift ${labelB} (${timeB}). Jam shift operasional tidak boleh saling tumpang tindih.`,
          conflictingIds: [a.id, b.id]
        };
      }
    }
  }

  return { isValid: true, errorMessage: null, conflictingIds: [] };
}

/**
 * Menghitung jeda (gap) dalam menit antara jam selesai shift ini dengan jam mulai shift aktif berikutnya.
 * Mengembalikan null jika berkesinambungan (0 menit) atau terjadi tabrakan.
 */
export function getAdjacentShiftGapMinutes(
  currentDef: SessionDefConfig,
  allDefs: SessionDefConfig[]
): { gapMinutes: number; nextDefLabel: string } | null {
  if (!currentDef.isActive) return null;

  const activeDefs = allDefs
    .filter((d) => d.isActive)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const currentIndex = activeDefs.findIndex((d) => d.id === currentDef.id);
  if (currentIndex === -1 || currentIndex === activeDefs.length - 1) return null;

  const nextDef = activeDefs[currentIndex + 1];
  const currentEndMin = parseTimeEndToMinutes(currentDef.defaultEndsAt);
  const nextStartMin = parseTimeToMinutes(nextDef.defaultStartsAt);

  if (nextStartMin > currentEndMin) {
    return {
      gapMinutes: nextStartMin - currentEndMin,
      nextDefLabel: nextDef.label || nextDef.code
    };
  }

  return null;
}
