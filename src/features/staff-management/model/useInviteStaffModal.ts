'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useInviteStaffMutation } from '../api/mutations';

export interface UseInviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface UseInviteStaffModalResult {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  credentialResult: {
    temporaryPassword: string;
    email: string;
  } | null;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleFinish: () => void;
}

export function useInviteStaffModal({
  onClose,
  onSuccess
}: UseInviteStaffModalProps): UseInviteStaffModalResult {
  const [email, setEmail] = useState('');
  const [credentialResult, setCredentialResult] = useState<{
    temporaryPassword: string;
    email: string;
  } | null>(null);

  const inviteMutation = useInviteStaffMutation();

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail) {
        toast.error('Harap masukkan alamat email staf.');
        return;
      }

      try {
        const res = await inviteMutation.mutateAsync({
          email: trimmedEmail,
          roleCode: 'staff_worker'
        });

        setCredentialResult({
          email: trimmedEmail,
          temporaryPassword: res.temporaryPassword
        });
        onSuccess?.();
      } catch {
        // Handled by mutation onError toast
      }
    },
    [email, inviteMutation, onSuccess]
  );

  const handleFinish = useCallback(() => {
    setCredentialResult(null);
    setEmail('');
    onClose();
  }, [onClose]);

  return {
    email,
    setEmail,
    isLoading: inviteMutation.isPending,
    credentialResult,
    handleSubmit,
    handleFinish
  };
}
