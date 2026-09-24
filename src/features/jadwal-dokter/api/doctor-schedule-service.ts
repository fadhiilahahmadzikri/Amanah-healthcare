import 'server-only';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { httpClient } from '@/server/http/http-client';
import { paths } from '@/server/api/paths';
import { getAccessTokenCookie } from '@/server/auth/token-store';
import {
  adminDoctorScheduleListResponseSchema,
  adminDoctorScheduleDetailResponseSchema,
  clinicalPractitionersResponseSchema,
  adminDoctorScheduleFilterOptionsSchema,
  deleteAdminDoctorSessionResponseSchema,
  rescheduleAdminDoctorSessionResponseSchema,
  rescheduleEligibilityResponseSchema,
  updateAdminDayByDateResponseSchema,
  clinicRoomsResponseSchema,
  doctorOccupancyOverviewResponseSchema,
  type ClinicRoom,
  type DoctorOccupancyOverviewResponse,
  type AdminDoctorScheduleListResponse,
  type AdminDoctorScheduleDetailResponse,
  type UpdateAdminDoctorSchedulePayload,
  type UpdateAdminDayStatusPayload,
  type UpdateAdminDayByDatePayload,
  type UpdateAdminDayByDateResponse,
  type CreateAdminDoctorSessionPayload,
  type UpdateAdminDoctorSessionPayload,
  type DeleteAdminDoctorSessionResponse,
  type RescheduleAdminDoctorSessionPayload,
  type RescheduleAdminDoctorSessionResponse,
  type RescheduleEligibilityResponse,
  type UpdateAdminDoctorDurationPayload,
  type AdminDoctorScheduleFilterOptionsResponse,
  type ClinicalPractitionersResponse
} from '@/server/contracts/schedules/doctor-schedules.dto';
import { z } from 'zod';
import type { DoctorScheduleDetailParams, DoctorScheduleFilters } from './types';

export async function resolveActiveToken(): Promise<string | null> {
  let token = await getAccessTokenCookie();

  if (!token) {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session?.session?.token) {
        token = session.session.token;
      }
    } catch {
      // Ignore fallback error
    }
  }

  return token;
}

export async function fetchAdminDoctorSchedules(
  filters: DoctorScheduleFilters = {}
): Promise<AdminDoctorScheduleListResponse['data']> {
  const token = await resolveActiveToken();

  const query: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 6
  };

  if (filters.search) query.search = filters.search;
  if (filters.month && filters.month !== 'ALL') query.month = filters.month;
  if (filters.date) query.date = filters.date;
  if (filters.poli && filters.poli.length > 0) query.poli = filters.poli.join(',');
  if (filters.status && filters.status.length > 0) query.status = filters.status.join(',');

  const response = await httpClient.request(
    paths.doctorSchedules.list(),
    adminDoctorScheduleListResponseSchema,
    {
      method: 'GET',
      query,
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response.data;
}

export async function fetchAdminDoctorScheduleDetail(
  id: string,
  params?: DoctorScheduleDetailParams
): Promise<AdminDoctorScheduleDetailResponse['data']> {
  const token = await resolveActiveToken();

  const query: Record<string, unknown> = {};
  if (params?.month !== undefined) query.month = params.month;
  if (params?.year !== undefined) query.year = params.year;
  if (params?.date !== undefined) query.date = params.date;

  const response = await httpClient.request(
    paths.doctorSchedules.detail(id),
    adminDoctorScheduleDetailResponseSchema,
    {
      method: 'GET',
      query,
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response.data;
}

export async function updateAdminDoctorSchedule(
  id: string,
  payload: UpdateAdminDoctorSchedulePayload
): Promise<AdminDoctorScheduleDetailResponse['data']> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.doctorSchedules.update(id),
    adminDoctorScheduleDetailResponseSchema,
    {
      method: 'PUT',
      body: payload,
      tokenOverride: token
    }
  );

  return response.data;
}

export async function updateAdminDayStatus(
  id: string,
  payload: UpdateAdminDayStatusPayload
): Promise<unknown> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(paths.doctorSchedules.updateDayStatus(id), z.any(), {
    method: 'PATCH',
    body: payload,
    tokenOverride: token
  });

  return response;
}

export async function createAdminDoctorSession(
  id: string,
  payload: CreateAdminDoctorSessionPayload
): Promise<unknown> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(paths.doctorSchedules.createSession(id), z.any(), {
    method: 'POST',
    body: payload,
    tokenOverride: token
  });

  return response;
}

export async function fetchClinicalPractitioners(params?: {
  search?: string;
  specialtyId?: string;
  clinicUnitId?: string;
  date?: string;
  service?: string;
}): Promise<ClinicalPractitionersResponse['data']> {
  const response = await httpClient.request(
    paths.clinicalPractitioners.list(),
    clinicalPractitionersResponseSchema,
    {
      method: 'GET',
      query: params as Record<string, unknown>,
      cache: 'no-store'
    }
  );

  return response.data;
}

export async function fetchAdminDoctorScheduleFilterOptions(): Promise<
  AdminDoctorScheduleFilterOptionsResponse['data']
> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.doctorSchedules.filterOptions(),
    adminDoctorScheduleFilterOptionsSchema,
    {
      method: 'GET',
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response.data;
}

export async function updateAdminDoctorSession(
  id: string,
  sessionId: string,
  payload: UpdateAdminDoctorSessionPayload
): Promise<unknown> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.doctorSchedules.updateSession(id, sessionId),
    z.any(),
    {
      method: 'PATCH',
      body: payload,
      tokenOverride: token
    }
  );

  return response;
}

export async function deleteAdminDoctorSession(
  id: string,
  sessionId: string
): Promise<DeleteAdminDoctorSessionResponse> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.doctorSchedules.deleteSession(id, sessionId),
    deleteAdminDoctorSessionResponseSchema,
    {
      method: 'DELETE',
      tokenOverride: token
    }
  );

  return response;
}

export async function rescheduleAdminDoctorSession(
  id: string,
  sessionId: string,
  payload: RescheduleAdminDoctorSessionPayload
): Promise<RescheduleAdminDoctorSessionResponse> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.doctorSchedules.reschedule(id, sessionId),
    rescheduleAdminDoctorSessionResponseSchema,
    {
      method: 'POST',
      body: payload,
      tokenOverride: token
    }
  );

  return response;
}

export async function checkRescheduleEligibility(
  id: string,
  sessionId: string,
  params: {
    targetDate?: string;
    targetStartTime?: string;
    targetRoomId?: string;
  } = {}
): Promise<RescheduleEligibilityResponse['data']> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.doctorSchedules.rescheduleEligibility(id, sessionId),
    rescheduleEligibilityResponseSchema,
    {
      method: 'GET',
      query: params as Record<string, unknown>,
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response.data;
}

export async function updateAdminDayByDate(
  id: string,
  date: string,
  payload: UpdateAdminDayByDatePayload
): Promise<UpdateAdminDayByDateResponse> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.doctorSchedules.dayByDate(id, date),
    updateAdminDayByDateResponseSchema,
    {
      method: 'PATCH',
      body: payload,
      tokenOverride: token
    }
  );

  return response;
}

export async function updateAdminDoctorDuration(
  id: string,
  payload: UpdateAdminDoctorDurationPayload
): Promise<unknown> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.doctorSchedules.duration(id),
    z.any(),
    {
      method: 'PATCH',
      body: payload,
      tokenOverride: token
    }
  );

  return response;
}

export async function fetchClinicRooms(params?: {
  date?: string;
  startTime?: string;
  endTime?: string;
}): Promise<ClinicRoom[]> {
  const token = await resolveActiveToken();
  try {
    const response = await httpClient.request(
      paths.schedules.referenceRooms(),
      clinicRoomsResponseSchema,
      {
        method: 'GET',
        query: params as Record<string, unknown>,
        tokenOverride: token,
        cache: 'no-store'
      }
    );
    return response;
  } catch (error) {
    console.error('Failed to fetch clinic rooms from backend:', error);
    return [
      { id: 'r-poli-1', code: 'R-POLI-01', name: 'Ruang Poli 1', location: 'Lantai 1, Sayap Barat', isOccupied: false },
      { id: 'r-poli-2', code: 'R-POLI-02', name: 'Ruang Poli 2', location: 'Lantai 1, Sayap Timur', isOccupied: false },
      { id: 'r-kia-1', code: 'R-KIA-01', name: 'Ruang KIA 1', location: 'Lantai 1, Gedung Utama', isOccupied: false },
      { id: 'r-gigi-1', code: 'R-GIGI-01', name: 'Ruang Gigi 1', location: 'Lantai 2', isOccupied: false }
    ];
  }
}

export function generateFallbackSlots(startHour: number, endHour: number, durationMinutes = 30) {
  const slots = [];
  let index = 1;
  const totalMinutes = (endHour - startHour) * 60;
  const totalSlots = Math.floor(totalMinutes / durationMinutes);

  for (let m = 0; m < totalMinutes; m += durationMinutes) {
    const sMinutes = startHour * 60 + m;
    const eMinutes = sMinutes + durationMinutes;

    const sH = Math.floor(sMinutes / 60);
    const sM = sMinutes % 60;
    const eH = Math.floor(eMinutes / 60);
    const eM = eMinutes % 60;

    const startTime = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;
    const endTime = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;

    slots.push({
      slotIndex: index++,
      startTime,
      endTime,
      timeRange: `${startTime} - ${endTime} WIB`,
      isAvailable: false,
      status: 'CLOSED',
      displayLabel: 'Tutup',
      conflictInfo: null
    });
  }

  return { slots, totalSlots };
}

export function generateFallbackOccupancyOverview(
  date: string,
  staffId: string,
  sessions: { jam_mulai: string; jam_selesai: string; nama_sesi?: string; id?: string; status_sesi?: string; slot_tersedia?: number }[] = []
): DoctorOccupancyOverviewResponse {
  const shiftsConfig = [
    { contextId: 'early_morning', contextLabel: 'Dini Hari', startHour: 0, endHour: 6, timeRange: '00:00 - 06:00 WIB' },
    { contextId: 'morning', contextLabel: 'Pagi', startHour: 6, endHour: 12, timeRange: '06:00 - 12:00 WIB' },
    { contextId: 'afternoon', contextLabel: 'Siang / Sore', startHour: 12, endHour: 18, timeRange: '12:00 - 18:00 WIB' },
    { contextId: 'night', contextLabel: 'Malam', startHour: 18, endHour: 24, timeRange: '18:00 - 24:00 WIB' }
  ];

  let totalAllSlots = 0;
  let totalAvailableSlots = 0;
  let totalOccupiedSlots = 0;

  const shifts = shiftsConfig.map((cfg) => {
    const { slots, totalSlots } = generateFallbackSlots(cfg.startHour, cfg.endHour);
    let shiftAvailableCount = 0;
    let shiftOccupiedCount = 0;

    const markedSlots = slots.map((slot) => {
      const matching = sessions.find((sess) => {
        return slot.startTime >= sess.jam_mulai && slot.startTime < sess.jam_selesai;
      });

      if (matching) {
        const rawStatus = (matching.status_sesi || '').toUpperCase();
        let slotStatus: 'AVAILABLE' | 'OCCUPIED_BY_SELF' | 'OCCUPIED_BY_OTHER' | 'CLOSED_LEAVE' | 'CLOSED' = 'OCCUPIED_BY_SELF';
        let displayLabel = `Jadwal Dokter (${matching.nama_sesi || 'Sesi'})`;

        if (rawStatus === 'TUTUP' || rawStatus === 'CLOSED') {
          slotStatus = 'CLOSED';
          displayLabel = 'Tutup';
          shiftOccupiedCount++;
        } else if (rawStatus === 'CUTI' || rawStatus === 'LEAVE') {
          slotStatus = 'CLOSED_LEAVE';
          displayLabel = 'Cuti';
          shiftOccupiedCount++;
        } else if (rawStatus === 'BUKA' || rawStatus === 'OPEN') {
          if ((matching.slot_tersedia ?? 1) > 0) {
            slotStatus = 'AVAILABLE';
            displayLabel = 'Buka';
            shiftAvailableCount++;
          } else {
            slotStatus = 'OCCUPIED_BY_SELF';
            displayLabel = 'Terisi';
            shiftOccupiedCount++;
          }
        } else {
          slotStatus = 'OCCUPIED_BY_SELF';
          displayLabel = 'Terisi';
          shiftOccupiedCount++;
        }

        return {
          ...slot,
          isAvailable: slotStatus === 'AVAILABLE',
          status: slotStatus,
          displayLabel,
          conflictInfo: {
            type: 'SELF',
            sessionId: matching.id
          }
        };
      }

      return slot;
    });

    totalAllSlots += totalSlots;
    totalAvailableSlots += shiftAvailableCount;
    totalOccupiedSlots += shiftOccupiedCount;

    return {
      contextId: cfg.contextId,
      contextLabel: cfg.contextLabel,
      sessionShift: cfg.contextId,
      timeRange: cfg.timeRange,
      boundaryStartTime: `${String(cfg.startHour).padStart(2, '0')}:00`,
      boundaryEndTime: `${String(cfg.endHour).padStart(2, '0')}:00`,
      totalSlots,
      availableSlotsCount: Math.max(0, shiftAvailableCount),
      occupiedSlotsCount: shiftOccupiedCount,
      slots: markedSlots
    };
  });

  return {
    date,
    practitionerId: staffId,
    effectiveConsultationDurationMinutes: 30,
    isCuti: false,
    cutiReason: null,
    roomId: null,
    roomName: null,
    summary: {
      totalShifts: 4,
      totalSlots: totalAllSlots,
      availableSlots: totalAvailableSlots,
      occupiedSlots: totalOccupiedSlots
    },
    shifts
  };
}

export async function fetchDoctorOccupancyOverview(params: {
  date: string;
  staffId: string;
  roomId?: string;
  existingSessions?: { jam_mulai: string; jam_selesai: string; nama_sesi?: string; id?: string; status_sesi?: string; slot_tersedia?: number }[];
}): Promise<DoctorOccupancyOverviewResponse> {
  const token = await resolveActiveToken();
  try {
    const query: Record<string, unknown> = {
      date: params.date,
      staffId: params.staffId
    };
    if (params.roomId) query.roomId = params.roomId;

    const response = await httpClient.request(
      paths.schedules.occupancyOverview(),
      doctorOccupancyOverviewResponseSchema,
      {
        method: 'GET',
        query,
        tokenOverride: token,
        cache: 'no-store'
      }
    );
    return response;
  } catch (error) {
    console.error('Failed to fetch occupancy overview from backend, using discrete SSOT slots:', error);
    return generateFallbackOccupancyOverview(params.date, params.staffId, params.existingSessions);
  }
}
