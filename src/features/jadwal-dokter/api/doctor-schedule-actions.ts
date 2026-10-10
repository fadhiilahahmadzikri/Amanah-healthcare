'use server';

import {
  fetchAdminDoctorSchedules,
  fetchAdminDoctorScheduleDetail,
  updateAdminDoctorSchedule,
  updateAdminDayStatus,
  fetchClinicalPractitioners,
  fetchAdminDoctorScheduleFilterOptions,
  updateAdminDoctorSession,
  updateAdminDayByDate,
  fetchClinicRooms,
  fetchAdminSessionPatients,
  cancelAdminAppointment,
  updateAdminAppointmentStatus,
  fetchScheduleReferenceOptions,
  callPatientAppointment,
  completePatientAppointment,
  updateScheduleDaySettings
} from './doctor-schedule-service';
import type {
  UpdateAdminDoctorSchedulePayload,
  UpdateAdminDayStatusPayload,
  UpdateAdminDayByDatePayload,
  UpdateAdminDoctorSessionPayload,
  CancelAppointmentPayload,
  UpdateAppointmentStatusPayload,
  ScheduleDaySettingsPayload
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

export async function updateDoctorSessionAction(
  id: string,
  sessionId: string,
  payload: UpdateAdminDoctorSessionPayload
) {
  return updateAdminDoctorSession(id, sessionId, payload);
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

export async function updateDoctorDayByDateAction(
  id: string,
  date: string,
  payload: UpdateAdminDayByDatePayload
) {
  return updateAdminDayByDate(id, date, payload);
}

export async function getClinicRoomsAction(params?: {
  date?: string;
  startTime?: string;
  endTime?: string;
}) {
  return fetchClinicRooms(params);
}

export async function getSessionPatientsAction(
  doctorId: string,
  sessionId: string,
  queryFilters?: { status?: string; search?: string; date?: string }
) {
  return fetchAdminSessionPatients(doctorId, sessionId, queryFilters);
}

export async function cancelAppointmentAction(
  appointmentId: string,
  payload: CancelAppointmentPayload
) {
  return cancelAdminAppointment(appointmentId, payload);
}

export async function updateAppointmentStatusAction(
  appointmentId: string,
  payload: UpdateAppointmentStatusPayload
) {
  return updateAdminAppointmentStatus(appointmentId, payload);
}

export async function getScheduleReferenceOptionsAction() {
  return fetchScheduleReferenceOptions();
}

export async function callPatientAppointmentAction(appointmentId: string) {
  return callPatientAppointment(appointmentId);
}

export async function completePatientAppointmentAction(appointmentId: string) {
  return completePatientAppointment(appointmentId);
}

export async function updateScheduleDaySettingsAction(payload: ScheduleDaySettingsPayload) {
  return updateScheduleDaySettings(payload);
}
