'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientFetch } from '@/lib/client-fetch';
import {
  bulkAssignDoctor,
  bulkAssignRoom,
  bulkCancelAppointments,
  bulkRescheduleAppointments
} from '../api/service';
import { appointmentKeys } from '../api/query-keys';
import type {
  BulkAssignDoctorPayload,
  BulkAssignRoomPayload,
  BulkCancelAppointmentsPayload,
  BulkRescheduleAppointmentsPayload
} from '../api/types';

export interface DoctorOption {
  id: string;
  name: string;
  specialty?: string | null;
}

export interface RoomOption {
  id: string;
  name: string;
  location?: string | null;
}

export interface SessionOption {
  id: string;
  code: string;
  name: string;
  startsAt?: string | null;
  endsAt?: string | null;
}

interface UseBulkAppointmentOperationsOptions {
  onClearSelection?: () => void;
  onSuccess?: () => void;
}

export function useBulkAppointmentOperations(options: UseBulkAppointmentOperationsOptions = {}) {
  const queryClient = useQueryClient();
  const { onClearSelection, onSuccess } = options;

  // Master Data: Active Practitioners (SSOT via backend relation)
  const doctorsQuery = useQuery({
    queryKey: ['clinical', 'practitioners', 'bulk-options'],
    queryFn: async (): Promise<DoctorOption[]> => {
      const res = await clientFetch<{
        success?: boolean;
        data?: Array<{ id: string; name: string; specialty?: string }>;
      }>('/api/v1/clinical/practitioners');
      const list = Array.isArray(res) ? res : res?.data || [];
      return list.map((d) => ({
        id: d.id,
        name: d.name,
        specialty: d.specialty || null
      }));
    },
    staleTime: 5 * 60 * 1000
  });

  // Master Data: Active Clinic Rooms (SSOT via backend relation)
  const roomsQuery = useQuery({
    queryKey: ['schedules', 'reference', 'rooms', 'bulk-options'],
    queryFn: async (): Promise<RoomOption[]> => {
      const res = await clientFetch<
        Array<{ id: string; name: string; location?: string }> | {
          data?: Array<{ id: string; name: string; location?: string }>;
        }
      >('/api/v1/schedules/reference/rooms');
      const list = Array.isArray(res)
        ? res
        : (res as { data?: Array<{ id: string; name: string; location?: string }> })?.data || [];
      return list.map((r) => ({
        id: r.id,
        name: r.name,
        location: r.location || null
      }));
    },
    staleTime: 5 * 60 * 1000
  });

  // Master Data: Clinic Sessions (SSOT via backend relation)
  const sessionsQuery = useQuery({
    queryKey: ['schedules', 'reference', 'sessions', 'bulk-options'],
    queryFn: async (): Promise<SessionOption[]> => {
      const res = await clientFetch<
        Array<{ id: string; code: string; name?: string; defaultStartsAt?: string; defaultEndsAt?: string }> | {
          data?: Array<{ id: string; code: string; name?: string; defaultStartsAt?: string; defaultEndsAt?: string }>;
        }
      >('/api/v1/schedules/reference/sessions');
      const list = Array.isArray(res)
        ? res
        : (res as { data?: Array<{ id: string; code: string; name?: string; defaultStartsAt?: string; defaultEndsAt?: string }> })?.data || [];
      return list.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name || s.code,
        startsAt: s.defaultStartsAt || null,
        endsAt: s.defaultEndsAt || null
      }));
    },
    staleTime: 5 * 60 * 1000
  });

  const invalidateQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] }),
      queryClient.invalidateQueries({ queryKey: ['queue-timeline'] })
    ]);
  };

  const assignDoctorMutation = useMutation({
    mutationFn: (payload: BulkAssignDoctorPayload) => bulkAssignDoctor(payload),
    onSuccess: async (res) => {
      await invalidateQueries();
      const { succeededCount, failedCount, errors } = res.data;
      if (failedCount === 0) {
        toast.success(`Berhasil menugaskan ${succeededCount} antrean ke dokter.`);
      } else {
        toast.warning(
          `Selesai: ${succeededCount} berhasil, ${failedCount} gagal. (${errors[0]?.message || 'Ada antrean yang tidak dapat dialihkan'})`
        );
      }
      onClearSelection?.();
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Gagal melakukan penugasan dokter massal.');
    }
  });

  const assignRoomMutation = useMutation({
    mutationFn: (payload: BulkAssignRoomPayload) => bulkAssignRoom(payload),
    onSuccess: async (res) => {
      await invalidateQueries();
      const { succeededCount, failedCount, errors } = res.data;
      if (failedCount === 0) {
        toast.success(`Berhasil menugaskan ${succeededCount} antrean ke ruangan.`);
      } else {
        toast.warning(
          `Selesai: ${succeededCount} berhasil, ${failedCount} gagal. (${errors[0]?.message || 'Ada antrean yang tidak dapat dialihkan'})`
        );
      }
      onClearSelection?.();
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Gagal melakukan penugasan ruangan massal.');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (payload: BulkCancelAppointmentsPayload) => bulkCancelAppointments(payload),
    onSuccess: async (res) => {
      await invalidateQueries();
      const { succeededCount, failedCount, errors } = res.data;
      if (failedCount === 0) {
        toast.success(`Berhasil membatalkan ${succeededCount} antrean.`);
      } else {
        toast.warning(
          `Selesai: ${succeededCount} dibatalkan, ${failedCount} gagal. (${errors[0]?.message || 'Ada antrean yang tidak dapat dibatalkan'})`
        );
      }
      onClearSelection?.();
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Gagal melakukan pembatalan massal.');
    }
  });

  const rescheduleMutation = useMutation({
    mutationFn: (payload: BulkRescheduleAppointmentsPayload) =>
      bulkRescheduleAppointments(payload),
    onSuccess: async (res) => {
      await invalidateQueries();
      const { succeededCount, failedCount, errors } = res.data;
      if (failedCount === 0) {
        toast.success(`Berhasil menjadwalkan ulang ${succeededCount} antrean.`);
      } else {
        toast.warning(
          `Selesai: ${succeededCount} dijadwalkan ulang, ${failedCount} gagal. (${errors[0]?.message || 'Ada antrean yang tidak dapat dipindahkan'})`
        );
      }
      onClearSelection?.();
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Gagal melakukan penjadwalan ulang massal.');
    }
  });

  return {
    doctors: doctorsQuery.data || [],
    rooms: roomsQuery.data || [],
    sessions: sessionsQuery.data || [],
    isLoadingOptions:
      doctorsQuery.isLoading || roomsQuery.isLoading || sessionsQuery.isLoading,
    assignDoctor: assignDoctorMutation.mutateAsync,
    isAssigningDoctor: assignDoctorMutation.isPending,
    assignRoom: assignRoomMutation.mutateAsync,
    isAssigningRoom: assignRoomMutation.isPending,
    cancelAppointments: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    rescheduleAppointments: rescheduleMutation.mutateAsync,
    isRescheduling: rescheduleMutation.isPending
  };
}
