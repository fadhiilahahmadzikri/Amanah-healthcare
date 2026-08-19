import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDoctorDayStatus, updateDoctorSchedule } from './service';
import { doctorScheduleKeys } from './queries';
import { toast } from 'sonner';
import type { DoctorSchedule, ScheduleDayStatus } from './types';

export function useUpdateDoctorScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<DoctorSchedule> }) =>
      updateDoctorSchedule(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all });
      toast.success(
        updated.is_cuti
          ? `Status ${updated.nama_dokter} diset ke CUTI. Slot otomatis ditutup.`
          : `Jadwal ${updated.nama_dokter} berhasil diperbarui.`
      );
    },
    onError: () => {
      toast.error('Gagal memperbarui jadwal dokter');
    }
  });
}

export function useUpdateDoctorDayStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      day,
      status
    }: {
      doctorId: string;
      day: number;
      status: ScheduleDayStatus;
    }) => updateDoctorDayStatus(doctorId, day, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all });
      toast.success(`Jadwal tanggal ${variables.day} Mei 2026 diubah menjadi ${variables.status}`);
    },
    onError: () => {
      toast.error('Gagal memperbarui status tanggal');
    }
  });
}
