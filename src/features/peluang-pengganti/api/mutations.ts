import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { replacementKeys } from './query-keys';
import { assignReplacement, cancelReplacement } from './service';
import type { AssignReplacementPayload, CancelReplacementPayload } from './types';

export function useAssignReplacementMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssignReplacementPayload }) =>
      assignReplacement(id, payload),
    onSuccess: (data) => {
      toast.success(
        `Jadwal pengganti berhasil ditugaskan kepada ${data.claimedByName || 'staf terpilih'}.`
      );
      void queryClient.invalidateQueries({ queryKey: replacementKeys.all });
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err?.message || 'Gagal menugaskan staf pengganti');
    }
  });
}

export function useCancelReplacementMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: CancelReplacementPayload }) =>
      cancelReplacement(id, payload),
    onSuccess: () => {
      toast.success('Peluang dinas pengganti berhasil dibatalkan.');
      void queryClient.invalidateQueries({ queryKey: replacementKeys.all });
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err?.message || 'Gagal membatalkan peluang dinas pengganti');
    }
  });
}
