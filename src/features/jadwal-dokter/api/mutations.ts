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

export function useUpdateDoctorScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDoctorSchedulePayload }) =>
      updateDoctorSchedule(id, payload),
    onSuccess: async (updated) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] })
      ]);
      await queryClient.refetchQueries({ queryKey: doctorScheduleKeys.all, type: 'active' });
      toast.success(
        updated.is_cuti
          ? `Status ${updated.nama_dokter} diset ke CUTI. Slot otomatis ditutup.`
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] })
      ]);
      await queryClient.refetchQueries({ queryKey: doctorScheduleKeys.all, type: 'active' });

      const response = rawResponse as
        | {
            message?: string;
            affectedSessionsCount?: number;
            cancelledAppointmentsCount?: number;
            data?: {
              affectedSessionsCount?: number;
              cancelledAppointmentsCount?: number;
            };
          }
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
    mutationFn: ({
      doctorId,
      payload
    }: {
      doctorId: string;
      payload: CreateDoctorSessionPayload;
    }) => createDoctorSession(doctorId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] })
      ]);
      await queryClient.refetchQueries({ queryKey: doctorScheduleKeys.all, type: 'active' });
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
    mutationFn: ({
      doctorId,
      sessionId,
      payload
    }: {
      doctorId: string;
      sessionId: string;
      payload: UpdateDoctorSessionPayload;
    }) => updateDoctorSession(doctorId, sessionId, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] })
      ]);
      await queryClient.refetchQueries({ queryKey: doctorScheduleKeys.all, type: 'active' });

      const rawStatus = (variables.payload.status_sesi || '').toUpperCase();
      if (rawStatus === 'CLOSED' || rawStatus === 'TUTUP') {
        toast.success('Jadwal sesi berhasil ditutup');
      } else if (rawStatus === 'OPEN' || rawStatus === 'BUKA') {
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] })
      ]);
      await queryClient.refetchQueries({ queryKey: doctorScheduleKeys.all, type: 'active' });
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
    mutationFn: ({
      doctorId,
      sessionId,
      payload
    }: {
      doctorId: string;
      sessionId: string;
      payload: RescheduleDoctorSessionPayload;
    }) => rescheduleDoctorSession(doctorId, sessionId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] })
      ]);
      await queryClient.refetchQueries({ queryKey: doctorScheduleKeys.all, type: 'active' });
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] })
      ]);
      await queryClient.refetchQueries({ queryKey: doctorScheduleKeys.all, type: 'active' });
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] })
      ]);
      if (doctorId && sessionId) {
        await queryClient.invalidateQueries({
          queryKey: doctorScheduleKeys.sessionPatients(doctorId, sessionId)
        });
      }
      await queryClient.refetchQueries({ queryKey: doctorScheduleKeys.all, type: 'active' });
      toast.success(
        response?.message || 'Janji temu berhasil dibatalkan dan 1 slot kuota telah dipulihkan'
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] })
      ]);
      if (doctorId && sessionId) {
        await queryClient.invalidateQueries({
          queryKey: doctorScheduleKeys.sessionPatients(doctorId, sessionId)
        });
      }
      await queryClient.refetchQueries({ queryKey: doctorScheduleKeys.all, type: 'active' });
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] })
      ]);
      if (doctorId && sessionId) {
        await queryClient.invalidateQueries({
          queryKey: doctorScheduleKeys.sessionPatients(doctorId, sessionId)
        });
      }
      await queryClient.refetchQueries({ queryKey: doctorScheduleKeys.all, type: 'active' });
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] })
      ]);
      if (doctorId && sessionId) {
        await queryClient.invalidateQueries({
          queryKey: doctorScheduleKeys.sessionPatients(doctorId, sessionId)
        });
      }
      await queryClient.refetchQueries({ queryKey: doctorScheduleKeys.all, type: 'active' });
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] })
      ]);
      await queryClient.refetchQueries({ queryKey: doctorScheduleKeys.all, type: 'active' });
      toast.success(response?.message || 'Pengaturan hari berhasil diperbarui');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui pengaturan hari';
      toast.error(message);
    }
  });
}
