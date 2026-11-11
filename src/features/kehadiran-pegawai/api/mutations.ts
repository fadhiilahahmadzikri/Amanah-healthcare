'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from './service';
import { attendanceKeys } from './queries';
import { ATTENDANCE_ACTIONS } from './types';
import { RECONCILE_DECISION } from '../constants/attendance-status.constants';
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success('Presensi pulang berhasil dicatat.');
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
        roleName: record.roleName,
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

export function useReconcileOvertimeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: import('./types').ReconcileOvertimePayload) => {
      return attendanceService.reconcileOvertime(payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      if (res.decision === RECONCILE_DECISION.APPROVED_OVERTIME) {
        toast.success(
          `Rekonsiliasi lembur berhasil disetujui (${res.overtimeHours} jam). Terhubung ke rekap payroll.`
        );
      } else {
        toast.success(
          'Rekonsiliasi selesai: Presensi disesuaikan ke jam shift standar tanpa penambahan lembur.'
        );
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal melakukan rekonsiliasi lembur.');
    }
  });
}
