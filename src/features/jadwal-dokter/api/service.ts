import {
  getDoctorSchedulesAction,
  getDoctorScheduleDetailAction,
  updateDoctorScheduleAction,
  updateDoctorDayStatusAction,
  createDoctorSessionAction
} from './doctor-schedule-actions';
import type {
  DoctorSchedule,
  DoctorScheduleFilters,
  DoctorScheduleListResponse,
  UpdateDoctorSchedulePayload,
  CreateDoctorSessionPayload,
  ScheduleDayStatus,
  DoctorScheduleDetailParams
} from './types';

export async function getDoctorSchedules(
  filters: DoctorScheduleFilters = {}
): Promise<DoctorScheduleListResponse> {
  try {
    const data = await getDoctorSchedulesAction(filters);
    return {
      doctors: data.doctors,
      total_doctors: data.meta.total_doctors,
      meta: data.meta
    };
  } catch (error) {
    console.error('Failed to fetch doctor schedules from backend:', error);
    return {
      doctors: [],
      total_doctors: 0
    };
  }
}

export async function getDoctorScheduleById(
  id: string,
  params?: DoctorScheduleDetailParams
): Promise<DoctorSchedule | undefined> {
  try {
    const data = await getDoctorScheduleDetailAction(id, params);
    return data as DoctorSchedule;
  } catch (error) {
    console.error(`Failed to fetch doctor schedule detail for id ${id}:`, error);
    return undefined;
  }
}

export async function getDoctorScheduleByName(name: string): Promise<DoctorSchedule | undefined> {
  try {
    const res = await getDoctorSchedules({ search: name, limit: 1 });
    return (
      res.doctors.find((doc) => doc.nama_dokter.toLowerCase() === name.toLowerCase()) ||
      res.doctors[0]
    );
  } catch (error) {
    console.error(`Failed to find doctor schedule for ${name}:`, error);
    return undefined;
  }
}

export async function updateDoctorSchedule(
  id: string,
  payload: UpdateDoctorSchedulePayload
): Promise<DoctorSchedule> {
  const result = await updateDoctorScheduleAction(id, payload);
  return result as DoctorSchedule;
}

export async function updateDoctorDayStatus(
  doctorId: string,
  date: string,
  status: ScheduleDayStatus,
  reason?: string
): Promise<unknown> {
  return updateDoctorDayStatusAction(doctorId, {
    date,
    status,
    reason
  });
}

export async function createDoctorSession(
  doctorId: string,
  payload: CreateDoctorSessionPayload
): Promise<unknown> {
  return createDoctorSessionAction(doctorId, payload);
}

export { isDoctorOnLeaveOnDay, extractDayNumber } from '../utils/leave-calculator';
