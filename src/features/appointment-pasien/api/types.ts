import {
  APPOINTMENT_STATUS,
  type CanonicalAppointmentStatus
} from '@/constants/appointment-status.constants';

export { APPOINTMENT_STATUS };
export type AppointmentStatus = CanonicalAppointmentStatus;

export type AppointmentAction = 'CHECK_IN' | 'CALL' | 'START_SERVICE' | 'COMPLETE' | 'CANCEL';

export type LiveStatus = AppointmentStatus;

export interface AdminAppointment {
  id: string;
  queueNumber: string;
  patientId: string;
  patientName: string;
  gender: 'Laki-laki' | 'Perempuan';
  phone: string;
  email: string;
  scheduledDate: string;
  scheduledStartTime: string;
  doctorName: string;
  poliklinikName: string;
  layananId?: string | null;
  layananName?: string | null;
  visitType: string;
  complaint: string;
  status: AppointmentStatus;
  allowedActions: AppointmentAction[];
  lastCalledAt: string | null;
  actualStartedAt: string | null;
  actualCompletedAt: string | null;
  estimatedStartAt: string | null;
  estimatedEndAt: string | null;
  checkedInAt?: string | null;
  isAffiliated?: boolean;
  affiliationRelationship?: string | null;
  parentUserId?: string | null;
  parentUserName?: string | null;
  consultationElapsedSeconds?: number | null;
  consultationDurationFormatted?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentSummary {
  total: number;
  booked?: number;
  waiting: number;
  inService: number;
  completed: number;
  cancelled: number;
  late: number;
}

export type AppointmentFilters = {
  page?: number;
  limit?: number;
  status?: string | string[];
  poli?: string | string[];
  service?: string | string[];
  serviceName?: string | string[];
  search?: string;
  sort?: string;
};

export type NormalizedAppointmentFilters = {
  page: number;
  limit: number;
  status?: string[];
  poli?: string[];
  serviceName?: string[];
  search?: string;
  sort?: string;
};

export function normalizeFilters(raw: Partial<AppointmentFilters>): NormalizedAppointmentFilters {
  const page = raw.page && raw.page > 0 ? Number(raw.page) : 1;
  const limit = raw.limit && raw.limit > 0 ? Number(raw.limit) : 10;
  const statusArray = Array.isArray(raw.status)
    ? [...raw.status].filter(Boolean).sort()
    : typeof raw.status === 'string' && raw.status.trim()
      ? [raw.status.trim()]
      : undefined;
  const poliArray = Array.isArray(raw.poli)
    ? [...raw.poli].filter(Boolean).sort()
    : typeof raw.poli === 'string' && raw.poli.trim()
      ? [raw.poli.trim()]
      : undefined;
  const serviceRaw = raw.serviceName || raw.service;
  const serviceArray = Array.isArray(serviceRaw)
    ? [...serviceRaw].filter(Boolean).sort()
    : typeof serviceRaw === 'string' && serviceRaw.trim()
      ? [serviceRaw.trim()]
      : undefined;
  const searchTrimmed = raw.search?.trim() || undefined;
  const sortTrimmed = raw.sort?.trim() || undefined;

  return {
    page,
    limit,
    ...(statusArray && statusArray.length > 0 && { status: statusArray }),
    ...(poliArray && poliArray.length > 0 && { poli: poliArray }),
    ...(serviceArray && serviceArray.length > 0 && { serviceName: serviceArray }),
    ...(searchTrimmed && { search: searchTrimmed }),
    ...(sortTrimmed && { sort: sortTrimmed })
  };
}

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
  id: number | string;
  status: AppointmentStatus;
};

export interface BackendAppointmentRecord {
  id: string | number;
  status?: string;
  patientName?: string;
  patientProfile?: { fullName?: string };
  doctorName?: string;
  practitioner?: { staffProfile?: { fullName?: string } };
  poliklinikName?: string;
  clinicRoom?: { clinicUnit?: { name?: string } };
  layananId?: string;
  layananName?: string;
  clinicService?: { name?: string };
  queueNumber?: string | number;
  queueTickets?: Array<{ queueNumber?: string }>;
  appointmentDate?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  scheduledStartTime?: string;
  session?: string;
  patientId?: string;
  visitType?: string;
  gender?: string;
  phone?: string;
  email?: string;
  complaint?: string;
  allowedActions?: AppointmentAction[];
  lastCalledAt?: string | Date | null;
  actualStartedAt?: string | Date | null;
  actualCompletedAt?: string | Date | null;
  estimatedStartAt?: string | Date | null;
  estimatedEndAt?: string | Date | null;
  checkedInAt?: string | Date | null;
  isAffiliated?: boolean;
  affiliationRelationship?: string | null;
  parentUserId?: string | null;
  parentUserName?: string | null;
  consultationElapsedSeconds?: number | null;
  consultationDurationFormatted?: string | null;
  [key: string]: unknown;
}

export interface DoctorCandidateItem {
  id: string;
  name: string;
  specialty: string;
  staffType: string;
  availability: 'AVAILABLE' | 'SCHEDULE_REQUIRED';
  existingSessionId: string | null;
  defaultRoomName: string | null;
}

export interface DoctorCandidateGroup {
  id: string;
  name: string;
  doctors: DoctorCandidateItem[];
}

export interface DoctorCandidatesResult {
  appointmentId: string;
  currentDoctorId: string | null;
  scheduledDate: string;
  scheduledTime: string;
  groups: DoctorCandidateGroup[];
}

export interface RoomCandidateItem {
  id: string;
  name: string;
  code?: string | null;
  location?: string | null;
  isAvailable: boolean;
  occupantDetails?: {
    practitionerId?: string;
    doctorName?: string;
    bookingCode?: string;
    startTime?: string;
  } | null;
}

export interface ChangeDoctorPayload {
  appointmentId: string;
  doctorId: string;
  closeOldSchedule?: boolean;
  reason?: string;
}

export interface ChangeRoomPayload {
  appointmentId: string;
  roomId: string;
}

export interface CheckInQrData {
  appointmentId?: string;
  patientName?: string;
  queueNumber?: string;
  poliklinikName?: string;
  doctorName?: string;
  scheduledDate?: string;
  token: string;
  manualCode: string;
  qrPayload: string;
  appointmentEligibilityDeadline?: string;
  expiresAt: string;
  remainingSeconds?: number;
}

export type CheckInQrDataDto = CheckInQrData;

export type CheckInQrResponse =
  | CheckInQrData
  | {
      success?: boolean;
      message?: string;
      data: CheckInQrData;
    };

export type CheckInQrResponseDto = CheckInQrResponse;

export interface PerformCheckInPayload {
  token?: string;
  manualCode?: string;
  appointmentId?: string;
}

export type PerformCheckInRequestDto = PerformCheckInPayload;

export interface PerformCheckInSuccessData {
  appointmentId: string;
  status: AppointmentStatus;
  checkedInAt: string;
  queueNumber?: string;
}

export type PerformCheckInSuccessDataDto = PerformCheckInSuccessData;

export type PerformCheckInResponse =
  | PerformCheckInSuccessData
  | {
      id?: string;
      appointmentId?: string;
      status: AppointmentStatus;
      checkedInAt?: string | null;
      queueNumber?: string | number;
      [key: string]: unknown;
    }
  | {
      success?: boolean;
      message?: string;
      data: PerformCheckInSuccessData;
    };

export type PerformCheckInResponseDto = PerformCheckInResponse;
