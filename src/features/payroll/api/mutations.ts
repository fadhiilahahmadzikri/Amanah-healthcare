import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { payrollKeys } from './query-keys';
import {
  calculatePayroll,
  finalizePayrollPeriod,
  reconcileDailyLeave,
  updateAttendanceTiming,
  updateCompensationRates
} from './payroll.api';
import type {
  AttendanceTimingConfig,
  CalculatePayrollPayload,
  UpdateCompensationRatesPayload
} from './types';

export function useCalculatePayrollMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CalculatePayrollPayload) => calculatePayroll(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      toast.success(`Kalkulasi payroll periode "${data.period.periodName}" berhasil diproses.`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal memproses kalkulasi payroll');
    }
  });
}

export function useUpdateCompensationRatesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCompensationRatesPayload) => updateCompensationRates(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.rates() });
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      toast.success('Standar tarif kompensasi berhasil diperbarui.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal memperbarui tarif kompensasi');
    }
  });
}

export function useFinalizePayrollPeriodMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (periodId: string) => finalizePayrollPeriod(periodId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      toast.success(
        `Periode "${data.periodName}" resmi ditutup buku (FINALIZED) dan terkunci permanen.`
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal menutup buku periode payroll');
    }
  });
}

export function useReconcileDailyLeaveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetDate?: string | void) => reconcileDailyLeave(targetDate || undefined),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      toast.success(
        `Rekap cuti harian (${data.targetDate}) berhasil. ${data.processedCount} staf diproses.`
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal memproses rekap cuti harian');
    }
  });
}

export function useUpdateAttendanceTimingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AttendanceTimingConfig) => updateAttendanceTiming(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-policies', 'current'] });
      queryClient.invalidateQueries({ queryKey: payrollKeys.rates() });
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      toast.success('Batas waktu dan pembulatan jam kerja presensi berhasil diperbarui.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal memperbarui batas waktu presensi');
    }
  });
}
