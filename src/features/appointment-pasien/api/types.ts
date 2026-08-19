import type {
  AdminAppointment,
  AppointmentSummary,
  LiveStatus
} from '@/constants/mock-api-admin-appointments';

export type { AdminAppointment, AppointmentSummary, LiveStatus };

export type AppointmentFilters = {
  page?: number;
  limit?: number;
  status?: string | string[];
  poli?: string | string[];
  search?: string;
  sort?: string;
};

export type AppointmentResponse = {
  success: boolean;
  time: string;
  total_appointments: number;
  offset: number;
  limit: number;
  appointments: AdminAppointment[];
  summary: AppointmentSummary;
};

export type AppointmentDetailResponse = {
  success: boolean;
  appointment: AdminAppointment | null;
  message?: string;
};

export type UpdateStatusPayload = {
  id: number;
  status: LiveStatus;
};
