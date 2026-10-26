'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from './service';
import { attendanceKeys } from './queries';
import { ATTENDANCE_ACTIONS } from './types';
import { toast } from 'sonner';
import { presentAttendanceModal } from '@/components/feedback/choreographed-modal';

export function useCheckoutAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      staffId,
      notes
    }: {
      staffId: string;
      staffName?: string;
      notes?: string;
    }) => {
      return attendanceService.checkoutStaffAttendance(staffId, notes);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success(
        `Presensi pulang dinas berhasil dicatat untuk ${variables.staffName || 'staf'}.`
      );
    },
    onError: (err: unknown) => {
      const errObj = err as
        | { message?: string; code?: string; problemDetails?: { code?: string } }
        | undefined;
      const errCode = errObj?.code || errObj?.problemDetails?.code;
      if (errCode !== 'EARLY_DEPARTURE_NOTES_REQUIRED') {
        toast.error(errObj?.message || 'Gagal mencatat presensi pulang.');
      }
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
        checkInAt: record.checkInAt,
        checkOutAt: record.checkOutAt,
        status: record.status,
        shift: record.shift,
        action: ATTENDANCE_ACTIONS.MANUAL_CHECK_IN
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
