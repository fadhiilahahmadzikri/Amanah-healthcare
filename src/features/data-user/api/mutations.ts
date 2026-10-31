import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userService } from './service';
import { userKeys } from './queries';
import type { UpdateUserPayload } from './types';

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      userService.updateUser(id, payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Data pengguna berhasil diperbarui.');
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Gagal memperbarui data pengguna.');
    }
  });
}

export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      userService.updateUserStatus(id, status),
    onSuccess: (res) => {
      toast.success(res.message || 'Status akun pengguna berhasil diperbarui.');
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Gagal memperbarui status akun pengguna.');
    }
  });
}

export function useBulkUpdateUserStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, status }: { userIds: string[]; status: string }) =>
      userService.bulkUpdateUserStatus(userIds, status),
    onSuccess: (res) => {
      toast.success(
        `Berhasil memperbarui status ${res.affectedCount} pengguna.${res.skippedCount > 0 ? ` (${res.skippedCount} dilewati)` : ''}`
      );
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Gagal memperbarui status pengguna secara massal.');
    }
  });
}

export function usePurgeUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.purgeUser(id),
    onSuccess: (res) => {
      toast.success(
        res.message || 'Akun pengguna dan seluruh datanya telah berhasil dihapus secara permanen.'
      );
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Gagal menghapus pengguna secara sistemik.');
    }
  });
}

export function useBulkPurgeUsersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => userService.bulkPurgeUsers(userIds),
    onSuccess: (res) => {
      toast.success(
        `Berhasil menghapus permanen ${res.successCount} pengguna.${res.failureCount > 0 ? ` (${res.failureCount} gagal/dilewati)` : ''}`
      );
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Gagal menghapus pengguna secara massal.');
    }
  });
}

export function useRestoreExecuteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      format,
      fileContent,
      duplicateStrategy
    }: {
      format: string;
      fileContent: string;
      duplicateStrategy: 'skip' | 'update';
    }) => userService.executeRestore(format, fileContent, duplicateStrategy),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Gagal memulihkan data pengguna.');
    }
  });
}
