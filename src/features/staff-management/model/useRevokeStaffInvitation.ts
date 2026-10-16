'use client';

import { useState, useCallback } from 'react';
import { useRevokeInvitationMutation } from '../api/mutations';

export interface UseRevokeStaffInvitationResult {
  invitationToRevoke: { id: string; email: string } | null;
  isRevokeDialogOpen: boolean;
  isRevoking: boolean;
  requestRevoke: (id: string, email: string) => void;
  cancelRevoke: () => void;
  confirmRevoke: () => Promise<void>;
}

export function useRevokeStaffInvitation(): UseRevokeStaffInvitationResult {
  const [invitationToRevoke, setInvitationToRevoke] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const revokeMutation = useRevokeInvitationMutation();

  const requestRevoke = useCallback((id: string, email: string) => {
    setInvitationToRevoke({ id, email });
  }, []);

  const cancelRevoke = useCallback(() => {
    setInvitationToRevoke(null);
  }, []);

  const confirmRevoke = useCallback(async () => {
    if (!invitationToRevoke) return;
    try {
      await revokeMutation.mutateAsync({
        id: invitationToRevoke.id,
        email: invitationToRevoke.email
      });
      setInvitationToRevoke(null);
    } catch {
      // Handled by mutation onError toast
    }
  }, [invitationToRevoke, revokeMutation]);

  return {
    invitationToRevoke,
    isRevokeDialogOpen: Boolean(invitationToRevoke),
    isRevoking: revokeMutation.isPending,
    requestRevoke,
    cancelRevoke,
    confirmRevoke
  };
}
