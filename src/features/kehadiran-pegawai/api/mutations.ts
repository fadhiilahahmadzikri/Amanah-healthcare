'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from './service';
import { attendanceKeys } from './queries';
import { toast } from 'sonner';
import { presentAttendanceModal } from '@/components/feedback/choreographed-modal';

export function useCheckoutAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ staffId }: { staffId: string; staffName?: string }) => {
      return attendanceService.checkoutStaffAttendance(staffId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success(
        `Presensi pulang dinas berhasil dicatat untuk ${variables.staffName || 'staf'}.`
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal mencatat presensi pulang.');
    }
  });
}

export function useRecordManualAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ staffIdOrCode, waktu }: { staffIdOrCode: string; waktu?: string }) => {
      return attendanceService.recordManualAttendance(staffIdOrCode, waktu);
    },
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      presentAttendanceModal({
        id: record.id,
        nama_staf: record.nama_staf,
        avatar: record.avatar,
        kategori: record.kategori,
        waktu_presensi: record.waktu_presensi,
        waktu: record.waktu,
        status: record.status,
        shift: record.shift,
        action: 'manual_check_in'
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal mencatat presensi manual.');
    }
  });
}

export function useUpdateQRConfigMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload?: Partial<import('./types').QRPresenceConfig>) => {
      return attendanceService.updateQRConfig(payload || {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success('Token QR presensi berhasil dirotasi.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal memperbarui konfigurasi QR.');
    }
  });
}
