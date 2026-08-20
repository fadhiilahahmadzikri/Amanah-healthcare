import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from './service';
import { attendanceKeys } from './queries';
import { toast } from 'sonner';
import type { AttendanceStatus, QRPresenceConfig } from './types';

export function useRecordManualAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffIdOrCode, waktu }: { staffIdOrCode: string; waktu?: string }) =>
      attendanceService.recordManualAttendance(staffIdOrCode, waktu),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success(
        `Presensi ${updated.nama_staf} (${updated.id_staf}) berhasil dicatat (Hadir - ${updated.waktu}).`
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Gagal memproses presensi manual.');
    }
  });
}

export function useUpdateAttendanceStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, waktu }: { id: string; status: AttendanceStatus; waktu?: string }) =>
      attendanceService.updateAttendanceStatus(id, status, waktu),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success(
        `Status presensi ${updated.nama_staf} berhasil diubah menjadi ${updated.status}.`
      );
    },
    onError: (err) => {
      toast.error('Gagal memperbarui status presensi.');
      console.error(err);
    }
  });
}

export function useGenerateQRTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (context?: string) => attendanceService.generateNewQRToken(context),
    onSuccess: (newConfig) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success(`Kode QR presensi diperbarui: ${newConfig.qr_code_identifier}`);
    },
    onError: () => {
      toast.error('Gagal memperbarui kode QR presensi.');
    }
  });
}

export function useUpdateQRConfigMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<QRPresenceConfig>) => attendanceService.updateQRConfig(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success('Konfigurasi QR shift presensi berhasil disimpan.');
    },
    onError: () => {
      toast.error('Gagal menyimpan konfigurasi QR shift.');
    }
  });
}
