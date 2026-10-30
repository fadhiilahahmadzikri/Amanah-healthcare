import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  type BulkReplaceRosterPayload,
  type InviteStaffUniversalPayload,
  type StaffMember,
  staffManagementApi
} from './staff-management.api';
import { staffManagementKeys } from './query-keys';

export function syncAllStaffQueries(queryClient: ReturnType<typeof useQueryClient>): void {
  queryClient.invalidateQueries({ queryKey: staffManagementKeys.all });
  queryClient.invalidateQueries({ queryKey: ['schedules'] });
  queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] });
  queryClient.invalidateQueries({ queryKey: ['admin-schedule-configuration'] });
}

export function useInviteStaffUniversalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteStaffUniversalPayload) =>
      staffManagementApi.inviteStaffUniversal(payload),
    onSuccess: (_data, variables) => {
      syncAllStaffQueries(queryClient);
      toast.success(
        `Undangan staf berhasil dikirim ke ${variables.email}! Kredensial sementara telah dibuat.`
      );
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim undangan staf.';
      toast.error(msg);
    }
  });
}

export function useRevokeInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; email?: string }) => staffManagementApi.revokeInvitation(id),
    onSuccess: (_data, variables) => {
      syncAllStaffQueries(queryClient);
      toast.success(`Undangan untuk ${variables.email || 'staf'} berhasil dibatalkan.`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal membatalkan undangan.';
      toast.error(msg);
    }
  });
}

export function useUpdateStaffProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<StaffMember> }) =>
      staffManagementApi.updateStaff(id, payload),
    onSuccess: (updatedStaff) => {
      syncAllStaffQueries(queryClient);
      toast.success(`Data staf ${updatedStaff.fullName} berhasil diperbarui.`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui data staf.';
      toast.error(msg);
    }
  });
}

export function useUpdateStaffRosterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, payload }: { staffId: string; payload: BulkReplaceRosterPayload }) =>
      staffManagementApi.updateStaffRoster(staffId, payload),
    onSuccess: (_data, variables) => {
      syncAllStaffQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: staffManagementKeys.roster(variables.staffId) });
      toast.success('Jadwal shift roster staf berhasil disimpan!');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan roster staf.';
      toast.error(msg);
    }
  });
}

export function useResetStaffRosterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => staffManagementApi.resetStaffRoster(staffId),
    onSuccess: (_data, staffId) => {
      syncAllStaffQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: staffManagementKeys.roster(staffId) });
      toast.success('Roster staf berhasil dikembalikan ke template master mingguan klinik.');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal mereset roster staf.';
      toast.error(msg);
    }
  });
}
