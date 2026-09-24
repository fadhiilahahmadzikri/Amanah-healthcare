import type { DoctorSchedule } from '../api/types';

export function isDoctorOnLeaveOnDay(
  doctor?: DoctorSchedule,
  dayNumber?: number
): { isLeave: boolean; reason?: string } {
  if (!doctor || dayNumber === undefined) return { isLeave: false };

  const monthlyItem = doctor.monthly_schedule?.find((day) => day.day === dayNumber);

  if (monthlyItem?.status === 'Cuti') {
    return {
      isLeave: true,
      reason: (monthlyItem.notes as string) || (doctor.cuti_reason as string) || 'Cuti Dokter'
    };
  }

  const notes = (monthlyItem?.notes || '').toLowerCase();
  if (notes.includes('cuti') || notes.includes('leave')) {
    return {
      isLeave: true,
      reason: (monthlyItem?.notes as string) || (doctor.cuti_reason as string) || 'Cuti Dokter'
    };
  }

  // If monthly_schedule explicitly marks this day as non-leave (e.g. Buka),
  // and the doctor is globally on leave but has a specific date range,
  // ensure the day respects the bounded date range.
  if (monthlyItem && monthlyItem.status === 'Buka') {
    if (doctor.cuti_start && doctor.cuti_end) {
      const startDay = extractDayNumber(doctor.cuti_start);
      const endDay = extractDayNumber(doctor.cuti_end);
      if (startDay !== null && endDay !== null) {
        return {
          isLeave: dayNumber >= startDay && dayNumber <= endDay,
          reason: (doctor.cuti_reason as string) || 'Cuti Dokter'
        };
      }
    }
    return { isLeave: false };
  }

  const isDoctorOnLeave = Boolean(
    doctor.is_cuti ||
    doctor.status_dokter === 'Cuti' ||
    doctor.status_jadwal === 'Cuti' ||
    doctor.status_jadwal === 'Cuti / Tutup'
  );

  if (!isDoctorOnLeave) return { isLeave: false };

  if (doctor.cuti_start && doctor.cuti_end) {
    const startDay = extractDayNumber(doctor.cuti_start);
    const endDay = extractDayNumber(doctor.cuti_end);

    if (startDay !== null && endDay !== null) {
      return {
        isLeave: dayNumber >= startDay && dayNumber <= endDay,
        reason: (doctor.cuti_reason as string) || undefined
      };
    }
  }

  return { isLeave: true, reason: (doctor.cuti_reason as string) || undefined };
}

export function extractDayNumber(dateStr: string): number | null {
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    const day = Number.parseInt(parts[2] ?? '', 10);
    return Number.isNaN(day) ? null : day;
  }
  const day = Number.parseInt(dateStr.split(' ')[0] ?? '', 10);
  return Number.isNaN(day) ? null : day;
}

export type SimpleScheduleStatus = 'buka' | 'cuti' | 'tutup';

export function resolveDayStatus(
  dayNumber: number,
  doctor?: DoctorSchedule
): SimpleScheduleStatus {
  if (!doctor) return 'tutup';

  // 1. Cek leave status via upstream helper
  const leaveInfo = isDoctorOnLeaveOnDay(doctor, dayNumber);
  if (leaveInfo.isLeave) return 'cuti';

  // 2. Cek konfigurasi eksplisit pada monthly_schedule dari backend SSOT
  const monthlyItem = doctor.monthly_schedule?.find((d) => d.day === dayNumber);
  if (monthlyItem) {
    const raw = (monthlyItem.status || '').toLowerCase().trim();
    if (raw === 'cuti') return 'cuti';
    if (raw === 'tutup') return 'tutup';
    if (raw === 'buka' || raw === 'terisi' || raw === 'penuh') return 'buka';
    return 'tutup';
  }

  // 3. Jika hari tidak memiliki jadwal pada data backend, status mutlak Tutup (tanpa fallback Buka)
  return 'tutup';
}

