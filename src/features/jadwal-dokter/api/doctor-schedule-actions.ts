'use server';

import {
  fetchAdminDoctorSchedules,
  fetchAdminDoctorScheduleDetail,
  updateAdminDoctorSchedule,
  updateAdminDayStatus,
  createAdminDoctorSession,
  fetchClinicalPractitioners
} from './doctor-schedule-service';
import type {
  UpdateAdminDoctorSchedulePayload,
  UpdateAdminDayStatusPayload,
  CreateAdminDoctorSessionPayload
} from '@/server/contracts/schedules/doctor-schedules.dto';
import type { DoctorScheduleFilters } from './types';

export async function getDoctorSchedulesAction(filters: DoctorScheduleFilters = {}) {
  return fetchAdminDoctorSchedules(filters);
}

export async function getDoctorScheduleDetailAction(
  id: string,
  params?: { month?: number; year?: number }
) {
  return fetchAdminDoctorScheduleDetail(id, params);
}

export async function updateDoctorScheduleAction(
  id: string,
  payload: UpdateAdminDoctorSchedulePayload
) {
  return updateAdminDoctorSchedule(id, payload);
}

export async function updateDoctorDayStatusAction(
  id: string,
  payload: UpdateAdminDayStatusPayload
) {
  return updateAdminDayStatus(id, payload);
}

export async function createDoctorSessionAction(
  id: string,
  payload: CreateAdminDoctorSessionPayload
) {
  return createAdminDoctorSession(id, payload);
}

export async function getClinicalPractitionersAction(params?: {
  search?: string;
  specialtyId?: string;
  clinicUnitId?: string;
  date?: string;
  service?: string;
}) {
  return fetchClinicalPractitioners(params);
}
