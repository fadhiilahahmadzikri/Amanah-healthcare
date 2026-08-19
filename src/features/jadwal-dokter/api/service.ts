import {
  fakeDoctorSchedules,
  type DoctorSchedule,
  type ScheduleDayStatus
} from '@/constants/mock-api-doctor-schedules';
import type { DoctorScheduleFilters, DoctorScheduleListResponse } from './types';

export async function getDoctorSchedules(
  filters: DoctorScheduleFilters = {}
): Promise<DoctorScheduleListResponse> {
  // Simulate quick async network delay
  await new Promise((resolve) => setTimeout(resolve, 50));
  return fakeDoctorSchedules.getAll(filters);
}

export async function getDoctorScheduleById(id: string): Promise<DoctorSchedule | undefined> {
  return fakeDoctorSchedules.getById(id);
}

export async function updateDoctorSchedule(
  id: string,
  payload: Partial<DoctorSchedule>
): Promise<DoctorSchedule> {
  return fakeDoctorSchedules.updateSchedule(id, payload);
}

export async function updateDoctorDayStatus(
  doctorId: string,
  day: number,
  status: ScheduleDayStatus
): Promise<DoctorSchedule> {
  return fakeDoctorSchedules.updateDayStatus(doctorId, day, status);
}
