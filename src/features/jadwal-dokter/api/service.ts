import type { DoctorSchedule, DoctorScheduleFilters, DoctorScheduleListResponse } from './types';

export async function getDoctorSchedules(
  filters: DoctorScheduleFilters = {}
): Promise<DoctorScheduleListResponse> {
  const filteredSchedules = filterDoctorSchedules(doctorScheduleRecords, filters);
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const offset = (page - 1) * limit;

  return {
    doctors: filteredSchedules.slice(offset, offset + limit),
    total_doctors: filteredSchedules.length
  };
}

export async function getDoctorScheduleById(id: string): Promise<DoctorSchedule | undefined> {
  return doctorScheduleRecords.find((doctor) => doctor.id === id);
}

export function getDoctorScheduleByName(name: string): DoctorSchedule | undefined {
  return doctorScheduleRecords.find(
    (doctor) => doctor.nama_dokter.toLowerCase() === name.toLowerCase()
  );
}

export async function updateDoctorSchedule(
  id: string,
  payload: Partial<DoctorSchedule>
): Promise<DoctorSchedule> {
  const index = doctorScheduleRecords.findIndex((doctor) => doctor.id === id);

  if (index === -1) {
    throw new Error('Doctor schedule not found');
  }

  const updatedSchedule = {
    ...doctorScheduleRecords[index],
    ...payload
  };

  doctorScheduleRecords[index] = updatedSchedule;
  return updatedSchedule;
}

export async function updateDoctorDayStatus(
  doctorId: string,
  day: number,
  status: DoctorSchedule['monthly_schedule'][number]['status']
): Promise<DoctorSchedule> {
  const doctor = await getDoctorScheduleById(doctorId);

  if (!doctor) {
    throw new Error('Doctor schedule not found');
  }

  const updatedMonthlySchedule = doctor.monthly_schedule.map((scheduleDay) =>
    scheduleDay.day === day ? { ...scheduleDay, status } : scheduleDay
  );

  return updateDoctorSchedule(doctorId, { monthly_schedule: updatedMonthlySchedule });
}

export function isDoctorOnLeaveOnDay(
  doctor?: DoctorSchedule,
  dayNumber?: number
): { isLeave: boolean; reason?: string } {
  if (!doctor || dayNumber === undefined) return { isLeave: false };

  const monthlyItem = doctor.monthly_schedule?.find((day) => day.day === dayNumber);

  if (monthlyItem?.status === 'Cuti') {
    return { isLeave: true, reason: monthlyItem.notes || doctor.cuti_reason };
  }

  const isDoctorOnLeave = Boolean(
    doctor.is_cuti ||
    doctor.status_dokter === 'Cuti' ||
    doctor.status_jadwal === 'Cuti' ||
    doctor.status_jadwal === 'Cuti / Tutup'
  );

  if (!isDoctorOnLeave) return { isLeave: false };

  if (doctor.cuti_start && doctor.cuti_end) {
    const startDay = Number.parseInt(doctor.cuti_start.split(' ')[0] ?? '', 10);
    const endDay = Number.parseInt(doctor.cuti_end.split(' ')[0] ?? '', 10);

    if (Number.isNaN(startDay) || Number.isNaN(endDay)) {
      return { isLeave: true, reason: doctor.cuti_reason };
    }

    return {
      isLeave: dayNumber >= startDay && dayNumber <= endDay,
      reason: doctor.cuti_reason
    };
  }

  return { isLeave: true, reason: doctor.cuti_reason };
}

const doctorScheduleRecords: DoctorSchedule[] = [];

function filterDoctorSchedules(
  schedules: DoctorSchedule[],
  filters: DoctorScheduleFilters
): DoctorSchedule[] {
  return schedules.filter((doctor) => {
    if (filters.search && !matchesDoctorSearch(doctor, filters.search)) return false;
    if (filters.poli && !matchesAny(filters.poli, [doctor.spesialisasi, doctor.ruang_praktik])) {
      return false;
    }
    if (
      filters.status &&
      !matchesAny(filters.status, [doctor.status_dokter, doctor.status_jadwal])
    ) {
      return false;
    }

    return true;
  });
}

function matchesDoctorSearch(doctor: DoctorSchedule, search: string): boolean {
  const query = search.trim().toLowerCase();

  if (!query) return true;

  return [doctor.nama_dokter, doctor.spesialisasi, doctor.ruang_praktik]
    .join(' ')
    .toLowerCase()
    .includes(query);
}

function matchesAny(filters: string[], values: string[]): boolean {
  return filters.some((filter) =>
    values.some((value) => value.toLowerCase().includes(filter.toLowerCase()))
  );
}
