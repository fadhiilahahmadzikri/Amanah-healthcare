import {
  getDoctorSchedulesAction,
  getDoctorScheduleDetailAction,
  updateDoctorScheduleAction,
  updateDoctorDayStatusAction,
  createDoctorSessionAction,
  updateDoctorSessionAction,
  deleteDoctorSessionAction,
  getDoctorScheduleFilterOptionsAction,
  rescheduleDoctorSessionAction,
  getRescheduleEligibilityAction,
  updateDoctorDayByDateAction,
  updateDoctorDurationAction,
  getClinicRoomsAction,
  getDoctorOccupancyOverviewAction
} from './doctor-schedule-actions';
import type {
  ClinicRoom,
  DoctorOccupancyOverviewResponse
} from '@/server/contracts/schedules/doctor-schedules.dto';
import type {
  DoctorSchedule,
  DoctorScheduleFilters,
  DoctorScheduleListResponse,
  UpdateDoctorSchedulePayload,
  CreateDoctorSessionPayload,
  UpdateDoctorSessionPayload,
  DeleteDoctorSessionResponse,
  DoctorScheduleFilterOptions,
  ScheduleDayStatus,
  DoctorScheduleDetailParams,
  RescheduleDoctorSessionPayload,
  RescheduleEligibilityData,
  UpdateDoctorDayByDatePayload,
  UpdateDoctorDurationPayload
} from './types';

export async function getDoctorSchedules(
  filters: DoctorScheduleFilters = {}
): Promise<DoctorScheduleListResponse> {
  try {
    const data = await getDoctorSchedulesAction(filters);
    return {
      doctors: data.doctors,
      total_doctors: data.meta.total_doctors,
      meta: data.meta
    };
  } catch (error) {
    console.error('Failed to fetch doctor schedules from backend:', error);
    return {
      doctors: [],
      total_doctors: 0
    };
  }
}

export async function getDoctorScheduleById(
  id: string,
  params?: DoctorScheduleDetailParams
): Promise<DoctorSchedule | undefined> {
  try {
    const data = await getDoctorScheduleDetailAction(id, params);
    return data as DoctorSchedule;
  } catch (error) {
    console.error(`Failed to fetch doctor schedule detail for id ${id}:`, error);
    return undefined;
  }
}

export async function getDoctorScheduleByName(name: string): Promise<DoctorSchedule | undefined> {
  try {
    const res = await getDoctorSchedules({ search: name, limit: 1 });
    return (
      res.doctors.find((doc) => doc.nama_dokter.toLowerCase() === name.toLowerCase()) ||
      res.doctors[0]
    );
  } catch (error) {
    console.error(`Failed to find doctor schedule for ${name}:`, error);
    return undefined;
  }
}

export async function updateDoctorSchedule(
  id: string,
  payload: UpdateDoctorSchedulePayload
): Promise<DoctorSchedule> {
  const result = await updateDoctorScheduleAction(id, payload);
  return result as DoctorSchedule;
}

export async function updateDoctorDayStatus(
  doctorId: string,
  date: string,
  status: ScheduleDayStatus,
  reason?: string
): Promise<unknown> {
  try {
    return await updateDoctorDayByDateAction(doctorId, date, {
      status,
      notes: reason
    });
  } catch {
    return updateDoctorDayStatusAction(doctorId, {
      date,
      status,
      reason
    });
  }
}

export async function updateDoctorDayByDate(
  id: string,
  date: string,
  payload: UpdateDoctorDayByDatePayload
): Promise<unknown> {
  return updateDoctorDayByDateAction(id, date, payload);
}

export async function createDoctorSession(
  doctorId: string,
  payload: CreateDoctorSessionPayload
): Promise<unknown> {
  return createDoctorSessionAction(doctorId, payload);
}

export async function updateDoctorSession(
  doctorId: string,
  sessionId: string,
  payload: UpdateDoctorSessionPayload
): Promise<unknown> {
  return updateDoctorSessionAction(doctorId, sessionId, payload);
}

export async function deleteDoctorSession(
  doctorId: string,
  sessionId: string
): Promise<DeleteDoctorSessionResponse> {
  return deleteDoctorSessionAction(doctorId, sessionId);
}

export async function rescheduleDoctorSession(
  id: string,
  sessionId: string,
  payload: RescheduleDoctorSessionPayload
) {
  return rescheduleDoctorSessionAction(id, sessionId, payload);
}

export async function checkRescheduleEligibility(
  id: string,
  sessionId: string,
  params?: {
    targetDate?: string;
    targetStartTime?: string;
    targetRoomId?: string;
  }
): Promise<RescheduleEligibilityData> {
  return getRescheduleEligibilityAction(id, sessionId, params);
}

export async function updateDoctorDuration(
  id: string,
  payload: UpdateDoctorDurationPayload
) {
  return updateDoctorDurationAction(id, payload);
}

export async function getDoctorScheduleFilterOptions(): Promise<DoctorScheduleFilterOptions> {
  try {
    const data = await getDoctorScheduleFilterOptionsAction();
    return data;
  } catch (error) {
    console.error('Failed to fetch doctor schedule filter options:', error);
    return {
      poliklinik: [],
      spesialisasi: [],
      statuses: [
        { id: 'buka', label: 'Buka' },
        { id: 'terisi', label: 'Terisi' },
        { id: 'tutup', label: 'Tutup' }
      ]
    };
  }
}

export async function getClinicRooms(params?: {
  date?: string;
  startTime?: string;
  endTime?: string;
}): Promise<ClinicRoom[]> {
  try {
    return await getClinicRoomsAction(params);
  } catch (error) {
    console.error('Failed to fetch clinic rooms:', error);
    return [];
  }
}

export async function getDoctorOccupancyOverview(params: {
  date: string;
  staffId: string;
  roomId?: string;
  existingSessions?: { jam_mulai: string; jam_selesai: string; nama_sesi?: string; id?: string; status_sesi?: string; slot_tersedia?: number }[];
}): Promise<DoctorOccupancyOverviewResponse> {
  return getDoctorOccupancyOverviewAction(params);
}

export { isDoctorOnLeaveOnDay, extractDayNumber } from '../utils/leave-calculator';

