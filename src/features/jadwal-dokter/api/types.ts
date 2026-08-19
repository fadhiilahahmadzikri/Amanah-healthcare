import type {
  DoctorSchedule,
  MonthlyScheduleDay,
  ScheduleDayStatus
} from '@/constants/mock-api-doctor-schedules';

export type { DoctorSchedule, MonthlyScheduleDay, ScheduleDayStatus };

export interface DoctorScheduleFilters {
  page?: number;
  limit?: number;
  search?: string;
  poli?: string[];
  status?: string[];
  sort?: string;
}

export interface DoctorScheduleListResponse {
  doctors: DoctorSchedule[];
  total_doctors: number;
}
