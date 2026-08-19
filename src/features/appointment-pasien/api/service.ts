import { fakeAdminAppointments } from '@/constants/mock-api-admin-appointments';
import type {
  AppointmentFilters,
  AppointmentResponse,
  AppointmentSummary,
  AppointmentDetailResponse,
  LiveStatus
} from './types';

export async function getAdminAppointments(
  filters: AppointmentFilters
): Promise<AppointmentResponse> {
  return fakeAdminAppointments.getAppointments(filters);
}

export async function getAdminAppointmentSummary(): Promise<AppointmentSummary> {
  return fakeAdminAppointments.getSummary();
}

export async function getAdminAppointmentById(id: number): Promise<AppointmentDetailResponse> {
  return fakeAdminAppointments.getAppointmentById(id);
}

export async function updateAdminLiveStatus(id: number, status: LiveStatus) {
  return fakeAdminAppointments.updateLiveStatus(id, status);
}

export async function deleteAdminAppointment(id: number) {
  return fakeAdminAppointments.deleteAppointment(id);
}
