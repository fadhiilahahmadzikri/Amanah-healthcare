'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from './service';
import { attendanceKeys } from './queries';
import { toast } from 'sonner';
import type { StaffAttendance, AttendanceStatus } from './types';

export function useUpdateAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<StaffAttendance> }) => {
      return attendanceService.updateStaffAttendance(id, payload);
    },
    onSuccess: (updatedRecord) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success(`Data presensi "${updatedRecord.nama_staf}" berhasil diperbarui.`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal memperbarui data presensi.');
    }
  });
}

export function useDeleteAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return attendanceService.deleteStaffAttendance(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success('Data presensi berhasil dihapus.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal menghapus data presensi.');
    }
  });
}

export function useCreateAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<StaffAttendance, 'id'> & { id?: string }) => {
      return attendanceService.createStaffAttendance(payload);
    },
    onSuccess: (newRecord) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success(`Presensi staf "${newRecord.nama_staf}" berhasil ditambahkan.`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal menambahkan presensi.');
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
      toast.success(
        `Presensi manual berhasil dicatat untuk ${record.nama_staf} (${record.waktu}).`
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal mencatat presensi manual.');
    }
  });
}

export function useUpdateQRConfigMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<import('./types').QRPresenceConfig>) => {
      return attendanceService.updateQRConfig(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal memperbarui konfigurasi QR.');
    }
  });
}
