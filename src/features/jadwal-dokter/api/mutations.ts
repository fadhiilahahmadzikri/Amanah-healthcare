import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateDoctorDayStatus,
  updateDoctorSchedule,
  createDoctorSession,
  updateDoctorSession,
  deleteDoctorSession,
  rescheduleDoctorSession,
  updateDoctorDuration,
  cancelAppointment,
  updateAppointmentStatus,
  callPatientAppointment,
  completePatientAppointment,
  updateScheduleDaySettings
} from './service';
import { doctorScheduleKeys } from './queries';
import { toast } from 'sonner';
import type {
  ScheduleDayStatus,
  UpdateDoctorSchedulePayload,
  CreateDoctorSessionPayload,
  UpdateDoctorSessionPayload,
  RescheduleDoctorSessionPayload,
  UpdateDoctorDurationPayload
} from './types';
import type {
  CancelAppointmentPayload,
  UpdateAppointmentStatusPayload,
  ScheduleDaySettingsPayload
} from '@/server/contracts/schedules/doctor-schedules.dto';
import { SCHEDULE_QUERY_KEYS, SCHEDULE_STATUS } from '../constants/schedule-shift.constants';
import type { ApiMessageResponse } from './service';

export function syncAllDoctorSchedules(queryClient: ReturnType<typeof useQueryClient>): void {
  queryClient.removeQueries({ queryKey: ['schedules', 'reschedule-eligibility'] });
  queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all });
  queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEYS.SCHEDULES] });
  queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEYS.PRACTITIONERS] });
  queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEYS.APPOINTMENTS] });
  queryClient.invalidateQueries({ queryKey: ['schedules', 'reference-rooms'] });
  queryClient.invalidateQueries({ queryKey: ['schedules', 'slot-availability'] });
  queryClient.invalidateQueries({ queryKey: ['schedules', 'contexts'] });
}

export function useUpdateDoctorScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDoctorSchedulePayload }) =>
      updateDoctorSchedule(id, payload),
    onSuccess: async (updated) => {
      syncAllDoctorSchedules(queryClient);
      toast.success(
        updated.isOnLeave
          ? `Status ${updated.nama_dokter} diset ke isOnLeave. Slot otomatis ditutup.`
          : `Jadwal ${updated.nama_dokter} berhasil diperbarui.`
      );
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui jadwal dokter';
      toast.error(message);
    }
  });
}

export function useUpdateDoctorDayStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      date,
      status,
      reason
    }: {
      doctorId: string;
      date: string;
      status: ScheduleDayStatus;
      reason?: string;
    }) => updateDoctorDayStatus(doctorId, date, status, reason),
    onSuccess: async (rawResponse: unknown, variables) => {
      syncAllDoctorSchedules(queryClient);

      const response = rawResponse as
        | (ApiMessageResponse & {
            affectedSessionsCount?: number;
            cancelledAppointmentsCount?: number;
            data?: {
              affectedSessionsCount?: number;
              cancelledAppointmentsCount?: number;
            };
          })
        | null
        | undefined;

      const affected = response?.data?.affectedSessionsCount ?? response?.affectedSessionsCount;
      const cancelled =
        response?.data?.cancelledAppointmentsCount ?? response?.cancelledAppointmentsCount;

      const isClosedStatus =
        variables.status === 'CLOSED' ||
        variables.status === 'Tutup' ||
        (typeof variables.status === 'string' && variables.status.toUpperCase() === 'CLOSED');

      if (isClosedStatus) {
        const sessionInfo = affected !== undefined ? ` (${affected} sesi dinonaktifkan)` : '';
        const cancelInfo = cancelled && cancelled > 0 ? `, ${cancelled} antrean dibatalkan` : '';
        toast.success(
          response?.message ||
            `Jadwal tanggal ${variables.date} berhasil ditutup${sessionInfo}${cancelInfo}`
        );
      } else {
        toast.success(
          response?.message ||
            `Jadwal tanggal ${variables.date} berhasil dibuka kembali dan seluruh sesi diaktifkan`
        );
      }
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui status tanggal';
      toast.error(message);
    }
  });
}

export function useCreateDoctorSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doctorId,
      payload
    }: {
      doctorId: string;
      payload: CreateDoctorSessionPayload;
    }) => {
      return await createDoctorSession(doctorId, payload);
    },
    onSuccess: async () => {
      syncAllDoctorSchedules(queryClient);
      toast.success('Sesi praktik baru berhasil ditambahkan');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Gagal menambahkan sesi praktik';
      toast.error(message);
    }
  });
}

export function useUpdateDoctorSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doctorId,
      sessionId,
      payload
    }: {
      doctorId: string;
      sessionId: string;
      payload: UpdateDoctorSessionPayload;
    }) => {
      return await updateDoctorSession(doctorId, sessionId, payload);
    },
    onSuccess: async (_data, variables) => {
      syncAllDoctorSchedules(queryClient);
      if (variables.payload.status === SCHEDULE_STATUS.CLOSED) {
        toast.success('Jadwal sesi berhasil ditutup');
      } else if (variables.payload.status === SCHEDULE_STATUS.OPEN) {
        toast.success('Jadwal sesi berhasil dibuka kembali');
      } else {
        toast.success('Sesi praktik berhasil diperbarui');
      }
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui sesi praktik';
      toast.error(message);
    }
  });
}

export function useDeleteDoctorSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ doctorId, sessionId }: { doctorId: string; sessionId: string }) =>
      deleteDoctorSession(doctorId, sessionId),
    onSuccess: async () => {
      syncAllDoctorSchedules(queryClient);
      toast.success('Sesi praktik berhasil dihapus');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Gagal menghapus sesi praktik';
      toast.error(message);
    }
  });
}

export function useRescheduleDoctorSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doctorId,
      sessionId,
      payload
    }: {
      doctorId: string;
      sessionId: string;
      payload: RescheduleDoctorSessionPayload;
    }) => {
      return await rescheduleDoctorSession(doctorId, sessionId, payload);
    },
    onSuccess: () => {
      syncAllDoctorSchedules(queryClient);
      toast.success('Sesi praktik berhasil di-reschedule');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Gagal me-reschedule sesi praktik';
      toast.error(message);
    }
  });
}

export function useUpdateDoctorDurationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      payload
    }: {
      doctorId: string;
      payload: UpdateDoctorDurationPayload;
    }) => updateDoctorDuration(doctorId, payload),
    onSuccess: async () => {
      syncAllDoctorSchedules(queryClient);
      toast.success('Durasi konsultasi dokter berhasil diperbarui');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui durasi konsultasi';
      toast.error(message);
    }
  });
}

export function useCancelAppointmentMutation(doctorId?: string, sessionId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      payload
    }: {
      appointmentId: string;
      payload: CancelAppointmentPayload;
    }) => cancelAppointment(appointmentId, payload),
    onSuccess: async (response) => {
      if (doctorId && sessionId) {
        await queryClient.invalidateQueries({
          queryKey: doctorScheduleKeys.sessionPatients(doctorId, sessionId)
        });
      }
      syncAllDoctorSchedules(queryClient);
      toast.success(
        response?.message || 'Janji temu berhasil dibatalkan'
      );
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Gagal membatalkan janji temu';
      toast.error(message);
    }
  });
}

export function useUpdateAppointmentStatusMutation(doctorId?: string, sessionId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      payload
    }: {
      appointmentId: string;
      payload: UpdateAppointmentStatusPayload;
    }) => updateAppointmentStatus(appointmentId, payload),
    onSuccess: async () => {
      if (doctorId && sessionId) {
        await queryClient.invalidateQueries({
          queryKey: doctorScheduleKeys.sessionPatients(doctorId, sessionId)
        });
      }
      syncAllDoctorSchedules(queryClient);
      toast.success('Status janji temu berhasil diperbarui');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui status janji temu';
      toast.error(message);
    }
  });
}

export function useCallPatientAppointmentMutation(doctorId?: string, sessionId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => callPatientAppointment(appointmentId),
    onSuccess: async (response) => {
      if (doctorId && sessionId) {
        await queryClient.invalidateQueries({
          queryKey: doctorScheduleKeys.sessionPatients(doctorId, sessionId)
        });
      }
      syncAllDoctorSchedules(queryClient);
      toast.success(response?.message || 'Pasien berhasil dipanggil ke ruang periksa.');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Gagal memanggil pasien';
      toast.error(message);
    }
  });
}

export function useCompletePatientAppointmentMutation(doctorId?: string, sessionId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => completePatientAppointment(appointmentId),
    onSuccess: async (response) => {
      if (doctorId && sessionId) {
        await queryClient.invalidateQueries({
          queryKey: doctorScheduleKeys.sessionPatients(doctorId, sessionId)
        });
      }
      syncAllDoctorSchedules(queryClient);
      toast.success(response?.message || 'Pemeriksaan pasien telah selesai.');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Gagal menyelesaikan pemeriksaan pasien';
      toast.error(message);
    }
  });
}

export function useUpdateScheduleDaySettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ScheduleDaySettingsPayload) => updateScheduleDaySettings(payload),
    onSuccess: async (response) => {
      syncAllDoctorSchedules(queryClient);
      toast.success(response?.message || 'Pengaturan hari berhasil diperbarui');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui pengaturan hari';
      toast.error(message);
    }
  });
}
