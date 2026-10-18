import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { leaveManagementKeys } from './query-keys';
import {
  calculatePayroll,
  reviewLeave,
  updateCompensationRate,
  updateLeavePolicy
} from './service';
import type { LeavePolicyItem } from './types';

export function useReviewLeaveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      approvalNotes
    }: {
      id: string;
      status: 'approved' | 'rejected';
      approvalNotes?: string;
    }) => reviewLeave(id, status, approvalNotes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveManagementKeys.all });
      queryClient.invalidateQueries({
        queryKey: leaveManagementKeys.replacements()
      });
      toast.success(
        variables.status === 'approved'
          ? 'Pengajuan cuti berhasil disetujui. Jadwal dinas pengganti telah dibuka.'
          : 'Pengajuan cuti telah ditolak.'
      );
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal memperbarui status cuti');
    }
  });
}

export function useUpdateLeavePolicyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<LeavePolicyItem>) => updateLeavePolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: leaveManagementKeys.policies()
      });
      toast.success('Kebijakan cuti berhasil diperbarui');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal menyimpan kebijakan cuti');
    }
  });
}

export function useUpdateCompensationRateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      category,
      hourlyRate,
      overtimeHourlyRate
    }: {
      category: string;
      hourlyRate: number;
      overtimeHourlyRate: number;
    }) => updateCompensationRate(category, hourlyRate, overtimeHourlyRate),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: leaveManagementKeys.compensationRates()
      });
      toast.success('Standar tarif kompensasi berhasil diperbarui');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal menyimpan tarif kompensasi');
    }
  });
}

export function useCalculatePayrollMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      periodStart,
      periodEnd,
      periodName
    }: {
      periodStart: string;
      periodEnd: string;
      periodName: string;
    }) => calculatePayroll(periodStart, periodEnd, periodName),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: leaveManagementKeys.payrollPeriods()
      });
      toast.success('Kalkulasi payroll periode berhasil dihitung');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal menghitung payroll periode');
    }
  });
}
