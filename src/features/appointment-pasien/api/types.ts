import {
  APPOINTMENT_STATUS,
  type CanonicalAppointmentStatus
} from '@/constants/appointment-status.constants';

export { APPOINTMENT_STATUS };
export type AppointmentStatus = CanonicalAppointmentStatus;

export type AppointmentAction =
  | 'CHECK_IN'
  | 'CALL'
  | 'START_SERVICE'
  | 'COMPLETE'
  | 'CANCEL'
  | 'RESCHEDULE'
  | 'ASSIGN_DOCTOR'
  | 'ASSIGN_ROOM';

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
  doctorName: string | null;
  doctorSpecialty?: string | null;
  doctorAvatarUrl?: string | null;
  staffId?: string | null;
  doctorId?: string | null;
  poliklinikName: string;
  roomName?: string | null;
  roomLocation?: string | null;
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
  bookingCode?: string | null;
  aheadCount?: number | null;
  etaRange?: string | null;
  session?: string | null;
  sessionName?: string | null;
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

export interface QueueNavigationDoctor {
  id: string;
  name: string;
  specialty?: string | null;
  avatarUrl?: string | null;
  totalAppointments: number;
  activeQueues: number;
  waitingCount: number;
  inServiceCount: number;
  completedCount: number;
}

export interface QueueNavigationUnit {
  id: string;
  code: string;
  name: string;
  queuePrefix?: string | null;
  totalAppointments: number;
  activeQueues: number;
  unassignedCount: number;
  doctors: QueueNavigationDoctor[];
}

export interface QueueNavigationResponse {
  date: string;
  session?: string | null;
  units: QueueNavigationUnit[];
}

export type AppointmentFilters = {
  page?: number;
  limit?: number;
  status?: string | string[];
  poli?: string | string[];
  poliklinikId?: string;
  service?: string | string[];
  serviceName?: string | string[];
  search?: string;
  sort?: string;
  date?: string;
  scheduledDate?: string | number | (string | number)[];
  doctorName?: string | string[];
  doctorId?: string | string[];
  roomName?: string | string[];
  roomId?: string;
  session?: string;
};

export type NormalizedAppointmentFilters = {
  page: number;
  limit: number;
  status?: string[];
  poli?: string[];
  poliklinikId?: string;
  serviceName?: string[];
  search?: string;
  sort?: string;
  date?: string;
  doctorName?: string[];
  doctorId?: string;
  roomName?: string[];
  roomId?: string;
  session?: string;
};

export function normalizeFilters(raw: Partial<AppointmentFilters>): NormalizedAppointmentFilters {
  const page = raw.page && raw.page > 0 ? Number(raw.page) : 1;
  const limit = raw.limit && raw.limit > 0 ? Number(raw.limit) : 10;
  const statusArray = Array.isArray(raw.status)
    ? [...raw.status].filter(Boolean).toSorted()
    : typeof raw.status === 'string' && raw.status.trim()
      ? [raw.status.trim()]
      : undefined;
  const poliArray = Array.isArray(raw.poli)
    ? [...raw.poli].filter(Boolean).toSorted()
    : typeof raw.poli === 'string' && raw.poli.trim()
      ? [raw.poli.trim()]
      : undefined;
  const serviceRaw = raw.serviceName || raw.service;
  const serviceArray = Array.isArray(serviceRaw)
    ? [...serviceRaw].filter(Boolean).toSorted()
    : typeof serviceRaw === 'string' && serviceRaw.trim()
      ? [serviceRaw.trim()]
      : undefined;
  const doctorArray = Array.isArray(raw.doctorName)
    ? [...raw.doctorName].filter(Boolean).toSorted()
    : typeof raw.doctorName === 'string' && raw.doctorName.trim()
      ? [raw.doctorName.trim()]
      : undefined;
  const roomArray = Array.isArray(raw.roomName)
    ? [...raw.roomName].filter(Boolean).toSorted()
    : typeof raw.roomName === 'string' && raw.roomName.trim()
      ? [raw.roomName.trim()]
      : undefined;
  const searchTrimmed = raw.search?.trim() || undefined;
  const sortTrimmed = raw.sort?.trim() || undefined;
  const dateTrimmed = typeof raw.date === 'string' && raw.date.trim() ? raw.date.trim() : undefined;
  const poliklinikIdTrimmed =
    typeof raw.poliklinikId === 'string' && raw.poliklinikId.trim()
      ? raw.poliklinikId.trim()
      : undefined;
  const doctorIdTrimmed = Array.isArray(raw.doctorId)
    ? raw.doctorId.find((id) => Boolean(id && String(id).trim()))?.trim()
    : typeof raw.doctorId === 'string' && raw.doctorId.trim()
      ? raw.doctorId.trim()
      : undefined;
  const roomIdTrimmed =
    typeof raw.roomId === 'string' && raw.roomId.trim() ? raw.roomId.trim() : undefined;
  const sessionTrimmed =
    typeof raw.session === 'string' && raw.session.trim() ? raw.session.trim() : undefined;

  return {
    page,
    limit,
    ...(statusArray && statusArray.length > 0 && { status: statusArray }),
    ...(poliArray && poliArray.length > 0 && { poli: poliArray }),
    ...(poliklinikIdTrimmed && { poliklinikId: poliklinikIdTrimmed }),
    ...(serviceArray && serviceArray.length > 0 && { serviceName: serviceArray }),
    ...(doctorArray && doctorArray.length > 0 && { doctorName: doctorArray }),
    ...(roomArray && roomArray.length > 0 && { roomName: roomArray }),
    ...(dateTrimmed && { date: dateTrimmed }),
    ...(doctorIdTrimmed && { doctorId: doctorIdTrimmed }),
    ...(roomIdTrimmed && { roomId: roomIdTrimmed }),
    ...(sessionTrimmed && { session: sessionTrimmed }),
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
  summary?: AppointmentSummary;
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
  doctorSpecialty?: string;
  doctorAvatarUrl?: string;
  staffId?: string;
  doctorId?: string;
  practitioner?: { staffProfile?: { fullName?: string }; medicalSpecialty?: { name?: string } };
  poliklinikName?: string;
  roomName?: string;
  roomLocation?: string;
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
  scheduledEndTime?: string | null;
  session?: string;
  sessionName?: string | null;
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
  bookingCode?: string | null;
  aheadCount?: number | null;
  etaRange?: string | null;
  [key: string]: unknown;
}

export const DOCTOR_AVAILABILITY = {
  AVAILABLE: 'AVAILABLE',
  SCHEDULE_REQUIRED: 'SCHEDULE_REQUIRED',
} as const;

export type DoctorAvailability =
  (typeof DOCTOR_AVAILABILITY)[keyof typeof DOCTOR_AVAILABILITY];

export interface DoctorCandidateItem {
  id: string;
  name: string;
  specialty: string;
  staffType: string;
  availability: DoctorAvailability;
  existingSessionId: string | null;
  defaultRoomName?: string | null;
  currentQueueCount?: number;
}

export interface DoctorCandidateGroup {
  id: string;
  name: string;
  code?: string | null;
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
  isPreferred?: boolean;
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

export interface ChangeDoctorResponseDto {
  success: boolean;
  message: string;
  data: BackendAppointmentRecord;
}

export interface ChangeRoomResponseDto {
  success: boolean;
  message: string;
  data: BackendAppointmentRecord;
}

export interface RescheduleAppointmentDto {
  session?: string;
  target_session?: string;
  target_session_id?: string;
  newSessionId?: string;
  target_date?: string;
  newDate?: string;
  target_start_time?: string;
  target_end_time?: string;
  reason?: string;
}

export type RescheduleAppointmentPayload = RescheduleAppointmentDto;

export interface RescheduleAppointmentResponseDto {
  success: boolean;
  message?: string;
  timestamp?: string;
  data: BackendAppointmentRecord;
}
