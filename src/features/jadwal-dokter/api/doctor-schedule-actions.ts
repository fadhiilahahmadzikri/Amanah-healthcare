'use server';

import {
  fetchAdminDoctorSchedules,
  fetchAdminDoctorScheduleDetail,
  updateAdminDoctorSchedule,
  updateAdminDayStatus,
  createAdminDoctorSession,
  fetchClinicalPractitioners,
  fetchAdminDoctorScheduleFilterOptions,
  updateAdminDoctorSession,
  deleteAdminDoctorSession
} from './doctor-schedule-service';
import type {
  UpdateAdminDoctorSchedulePayload,
  UpdateAdminDayStatusPayload,
  CreateAdminDoctorSessionPayload,
  UpdateAdminDoctorSessionPayload
} from '@/server/contracts/schedules/doctor-schedules.dto';
import type { DoctorScheduleDetailParams, DoctorScheduleFilters } from './types';

export async function getDoctorSchedulesAction(filters: DoctorScheduleFilters = {}) {
  return fetchAdminDoctorSchedules(filters);
}

export async function getDoctorScheduleDetailAction(
  id: string,
  params?: DoctorScheduleDetailParams
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

export async function updateDoctorSessionAction(
  id: string,
  sessionId: string,
  payload: UpdateAdminDoctorSessionPayload
) {
  return updateAdminDoctorSession(id, sessionId, payload);
}

export async function deleteDoctorSessionAction(id: string, sessionId: string) {
  return deleteAdminDoctorSession(id, sessionId);
}

export async function getDoctorScheduleFilterOptionsAction() {
  return fetchAdminDoctorScheduleFilterOptions();
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
