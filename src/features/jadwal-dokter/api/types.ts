export type {
  ClinicRoom,
  ClinicRoomOccupantDetails,
  ClosureMetadata
} from '@/server/contracts/schedules/doctor-schedules.dto';
import { STAFF_TYPES, type StaffType } from '@/constants/staff-types.constant';
export { STAFF_TYPES, type StaffType };

export {
  SHIFT_OPERATIONAL_STATUS,
  SHIFT_OPERATIONAL_LABELS
} from '../constants/schedule-shift.constants';

export type { ShiftOperationalStatus } from '../constants/schedule-shift.constants';

import type { UpdateAdminDoctorSessionPayload } from '@/server/contracts/schedules/doctor-schedules.dto';

export type ScheduleDayStatus = 'OPEN' | 'CLOSED' | 'ON_LEAVE' | 'PENDING';
export type SessionStatus = 'OPEN' | 'CLOSED' | 'ON_LEAVE' | 'PENDING';

export interface DoctorDailySession {
  id: string;
  sessionName: string;
  startTime: string;
  endTime: string;
  timeRange?: string;
  bookedPatients?: number;
  sessionStatus: SessionStatus;
  closureReason?: string | null;
  roomName?: string;
  roomId?: string | null;
  isRescheduleEligible?: boolean;
  rescheduleIneligibilityReason?: string | null;
  date?: string;
}

export interface MonthlyScheduleDay {
  day: number;
  date: string;
  status: ScheduleDayStatus;
  notes?: string | null;
}

export interface DoctorCardPatientPreview {
  id: string;
  patientId: string;
  name: string;
  initials: string;
  avatarUrl?: string | null;
}

export interface DoctorSchedule {
  id: string;
  practitionerId?: string;
  staffProfileId?: string | null;
  staffId?: string | null;
  staffCode?: string | null;
  staffType?: StaffType;
  fullName: string;
  specialty: string;
  doctorStatus: 'OPEN' | 'CLOSED' | 'ON_LEAVE' | 'PENDING' | string;
  email?: string | null;
  phone?: string | null;
  practiceRoom: string;
  practiceDate?: string;
  avatar?: string;
  todaySchedule: string;
  upcomingSchedule?: string;
  scheduleStatus: 'OPEN' | 'CLOSED' | 'ON_LEAVE' | 'PENDING' | string;
  scheduleMonth?: string;
  monthlySchedule?: MonthlyScheduleDay[];
  dailySessions?: DoctorDailySession[];
  isOnLeave?: boolean;
  leaveReason?: string | null;
  leaveStart?: string | null;
  leaveEnd?: string | null;
  leaveType?: string | null;
  substituteDoctorName?: string | null;
  replacementStatus?: string | null;
  totalPatients?: number;
  patientPreviews?: DoctorCardPatientPreview[];
  isAcceptingAppointments?: boolean;
  createdAt?: string | null;
}

export interface DoctorScheduleFilters {
  page?: number;
  limit?: number;
  search?: string;
  poli?: string[];
  session?: string[];
  status?: string[];
  month?: string;
  date?: string;
  sort?: string;
}

export interface DoctorScheduleDetailParams {
  month?: string;
  year?: number;
  date?: string;
}

export interface DoctorScheduleListResponse {
  doctors: DoctorSchedule[];
  totalDoctors: number;
  meta?: {
    page: number;
    limit: number;
    totalDoctors: number;
    totalPages: number;
  };
}

export interface UpdateDoctorSchedulePayload {
  isOnLeave?: boolean;
  leaveReason?: string | null;
  leaveStart?: string | null;
  leaveEnd?: string | null;
  doctorStatus?: string;
  scheduleStatus?: string;
  todaySchedule?: string;
  practiceRoom?: string;
  roomId?: string;
  date?: string;
  monthlySchedule?: MonthlyScheduleDay[];
  dailySessions?: DoctorDailySession[];
}

export type UpdateDoctorSessionPayload = UpdateAdminDoctorSessionPayload;

export interface UpdateDoctorDayByDatePayload {
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

export interface ClinicUnitOption {
  id: string;
  name: string;
  code?: string | null;
}

export interface MedicalSpecialtyOption {
  id: string;
  name: string;
  code?: string | null;
}

export interface ScheduleStatusOption {
  id: string;
  label: string;
}

export interface ScheduleSessionOption {
  id: string;
  code: string;
  name: string;
  label: string;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface DoctorScheduleFilterOptions {
  poliklinik: ClinicUnitOption[];
  spesialisasi: MedicalSpecialtyOption[];
  statuses: ScheduleStatusOption[];
  sessions?: ScheduleSessionOption[];
}
