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
      reason: (monthlyItem.notes as string) || (doctor.cuti_reason as string)
    };
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
