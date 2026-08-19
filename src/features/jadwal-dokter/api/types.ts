import type {
  DoctorSchedule,
  MonthlyScheduleDay,
  ScheduleDayStatus,
  DoctorDailySession,
  SessionStatus
} from '@/constants/mock-api-doctor-schedules';

export type {
  DoctorSchedule,
  MonthlyScheduleDay,
  ScheduleDayStatus,
  DoctorDailySession,
  SessionStatus
};

export interface DoctorScheduleFilters {
  page?: number;
  limit?: number;
  search?: string;
  poli?: string[];
  status?: string[];
  month?: string;
  date?: string;
  sort?: string;
}

export interface DoctorScheduleListResponse {
  doctors: DoctorSchedule[];
  total_doctors: number;
}
