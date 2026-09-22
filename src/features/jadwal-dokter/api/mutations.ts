import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateDoctorDayStatus,
  updateDoctorSchedule,
  createDoctorSession
} from './service';
import { doctorScheduleKeys } from './queries';
import { toast } from 'sonner';
import type {
  ScheduleDayStatus,
  UpdateDoctorSchedulePayload,
  CreateDoctorSessionPayload
} from './types';

export function useUpdateDoctorScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDoctorSchedulePayload }) =>
      updateDoctorSchedule(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all });
      toast.success(`Jadwal tanggal ${variables.date} berhasil diubah menjadi ${variables.status}`);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all });
      toast.success('Sesi praktik baru berhasil ditambahkan');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Gagal menambahkan sesi praktik';
      toast.error(message);
    }
  });
}
