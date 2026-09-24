import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateDoctorDayStatus,
  updateDoctorSchedule,
  createDoctorSession,
  updateDoctorSession,
  deleteDoctorSession,
  rescheduleDoctorSession,
  updateDoctorDuration
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

      const response = rawResponse as {
        message?: string;
        affectedSessionsCount?: number;
        cancelledAppointmentsCount?: number;
        data?: {
          affectedSessionsCount?: number;
          cancelledAppointmentsCount?: number;
        };
      } | null | undefined;

      const affected = response?.data?.affectedSessionsCount ?? response?.affectedSessionsCount;
      const cancelled = response?.data?.cancelledAppointmentsCount ?? response?.cancelledAppointmentsCount;

      if (variables.status === 'Tutup') {
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] })
      ]);
      await queryClient.refetchQueries({ queryKey: doctorScheduleKeys.all, type: 'active' });
      toast.success('Sesi praktik berhasil diperbarui');
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
    mutationFn: ({
      doctorId,
      sessionId
    }: {
      doctorId: string;
      sessionId: string;
    }) => deleteDoctorSession(doctorId, sessionId),
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
