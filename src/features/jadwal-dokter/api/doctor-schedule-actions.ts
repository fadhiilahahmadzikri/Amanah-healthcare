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
  deleteAdminDoctorSession,
  rescheduleAdminDoctorSession,
  checkRescheduleEligibility,
  updateAdminDayByDate,
  updateAdminDoctorDuration,
  fetchClinicRooms,
  fetchDoctorOccupancyOverview,
  fetchAdminSessionPatients,
  cancelAdminAppointment,
  updateAdminAppointmentStatus,
  fetchScheduleProjection,
  fetchScheduleReferenceOptions,
  fetchScheduleContexts,
  callPatientAppointment,
  completePatientAppointment,
  updateScheduleDaySettings,
  fetchScheduleFormBootstrap,
  fetchScheduleSlotAvailability
} from './doctor-schedule-service';
import type {
  UpdateAdminDoctorSchedulePayload,
  UpdateAdminDayStatusPayload,
  UpdateAdminDayByDatePayload,
  CreateAdminDoctorSessionPayload,
  UpdateAdminDoctorSessionPayload,
  RescheduleAdminDoctorSessionPayload,
  UpdateAdminDoctorDurationPayload,
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

export async function rescheduleDoctorSessionAction(
  id: string,
  sessionId: string,
  payload: RescheduleAdminDoctorSessionPayload
) {
  return rescheduleAdminDoctorSession(id, sessionId, payload);
}

export async function getRescheduleEligibilityAction(
  id: string,
  sessionId: string,
  params?: {
    targetDate?: string;
    targetStartTime?: string;
    targetRoomId?: string;
  }
) {
  return checkRescheduleEligibility(id, sessionId, params);
}

export async function updateDoctorDayByDateAction(
  id: string,
  date: string,
  payload: UpdateAdminDayByDatePayload
) {
  return updateAdminDayByDate(id, date, payload);
}

export async function updateDoctorDurationAction(
  id: string,
  payload: UpdateAdminDoctorDurationPayload
) {
  return updateAdminDoctorDuration(id, payload);
}

export async function getClinicRoomsAction(params?: {
  date?: string;
  startTime?: string;
  endTime?: string;
}) {
  return fetchClinicRooms(params);
}

export async function getDoctorOccupancyOverviewAction(params: {
  date: string;
  staffId: string;
  roomId?: string;
  existingSessions?: {
    jam_mulai: string;
    jam_selesai: string;
    nama_sesi?: string;
    id?: string;
    status_sesi?: string;
    slot_tersedia?: number;
  }[];
}) {
  return fetchDoctorOccupancyOverview(params);
}

export async function getSessionPatientsAction(
  doctorId: string,
  sessionId: string,
  queryFilters?: { status?: string; search?: string }
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

export async function getScheduleProjectionAction(params: {
  scheduleContextId?: string;
  startTime?: string;
  endTime?: string;
  practitionerId?: string;
  shift?: string;
  date?: string;
  slotsCount?: number;
  fillShift?: boolean;
}) {
  return fetchScheduleProjection(params);
}

export async function getScheduleReferenceOptionsAction() {
  return fetchScheduleReferenceOptions();
}

export async function getScheduleContextsAction(date?: string) {
  return fetchScheduleContexts(date);
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

export async function getScheduleFormBootstrapAction(params: {
  date: string;
  scheduleId?: string;
  staffId?: string;
}) {
  return fetchScheduleFormBootstrap(params);
}

export async function getScheduleSlotAvailabilityAction(params: {
  date: string;
  shift: string;
  roomId: string;
  scheduleId?: string;
  staffId?: string;
}) {
  return fetchScheduleSlotAvailability(params);
}

