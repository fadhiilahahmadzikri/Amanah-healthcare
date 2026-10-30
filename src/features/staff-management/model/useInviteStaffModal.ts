'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useInviteStaffUniversalMutation } from '../api/mutations';
import { invitationOptionsQueryOptions } from '../api/queries';
import type { PolyclinicUnit, RoleOption } from '../api/staff-management.api';

export interface UseInviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface UseInviteStaffModalResult {
  email: string;
  setEmail: (email: string) => void;
  fullName: string;
  setFullName: (name: string) => void;
  selectedRoleId: string;
  setSelectedRoleId: (roleId: string) => void;
  selectedPoliklinikId: string;
  setSelectedPoliklinikId: (poliId: string) => void;
  roles: RoleOption[];
  polyclinics: PolyclinicUnit[];
  selectedRole?: RoleOption;
  isClinical: boolean;
  isLoading: boolean;
  isOptionsLoading: boolean;
  credentialResult: {
    temporaryPassword: string;
    email: string;
    loginUrl: string;
    roleName: string;
  } | null;
  copied: boolean;
  copyCredentials: () => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleFinish: () => void;
}

export function useInviteStaffModal({
  isOpen,
  onClose,
  onSuccess
}: UseInviteStaffModalProps): UseInviteStaffModalResult {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedPoliklinikId, setSelectedPoliklinikId] = useState('');
  const [copied, setCopied] = useState(false);
  const [credentialResult, setCredentialResult] = useState<{
    temporaryPassword: string;
    email: string;
    loginUrl: string;
    roleName: string;
  } | null>(null);

  const { data: optionsData, isLoading: isOptionsLoading } = useQuery({
    ...invitationOptionsQueryOptions(),
    enabled: isOpen
  });

  const roles = optionsData?.roles || [];
  const polyclinics = optionsData?.polyclinics || [];

  const effectiveRoleId = selectedRoleId || (roles.length > 0 ? roles[0].id : '');
  const selectedRole = roles.find((r) => r.id === effectiveRoleId);
  const isClinical = selectedRole?.isClinical ?? false;

  const inviteMutation = useInviteStaffUniversalMutation();

  const copyCredentials = useCallback(() => {
    if (!credentialResult) return;
    const text = `Email: ${credentialResult.email}\nPassword Sementara: ${credentialResult.temporaryPassword}\nLogin: ${credentialResult.loginUrl}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Kredensial berhasil disalin ke clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [credentialResult]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail) {
        toast.error('Harap masukkan alamat email calon staf.');
        return;
      }

      if (!effectiveRoleId) {
        toast.error('Harap pilih peran staf.');
        return;
      }

      if (isClinical && !selectedPoliklinikId) {
        toast.error('Harap pilih unit poliklinik untuk peran praktisi klinis.');
        return;
      }

      try {
        const res = await inviteMutation.mutateAsync({
          email: trimmedEmail,
          fullName: fullName.trim() || undefined,
          roleId: effectiveRoleId,
          poliklinikId: isClinical ? selectedPoliklinikId : null
        });

        setCredentialResult({
          email: trimmedEmail,
          temporaryPassword: res.temporaryPassword,
          loginUrl: res.loginUrl,
          roleName: selectedRole?.name || 'Staf Klinik'
        });
        onSuccess?.();
      } catch {
        // Handled by mutation onError toast
      }
    },
    [
      email,
      fullName,
      effectiveRoleId,
      isClinical,
      selectedPoliklinikId,
      inviteMutation,
      selectedRole?.name,
      onSuccess
    ]
  );

  const handleFinish = useCallback(() => {
    setCredentialResult(null);
    setEmail('');
    setFullName('');
    setSelectedRoleId('');
    setSelectedPoliklinikId('');
    setCopied(false);
    onClose();
  }, [onClose]);

  return {
    email,
    setEmail,
    fullName,
    setFullName,
    selectedRoleId: effectiveRoleId,
    setSelectedRoleId,
    selectedPoliklinikId,
    setSelectedPoliklinikId,
    roles,
    polyclinics,
    selectedRole,
    isClinical,
    isLoading: inviteMutation.isPending,
    isOptionsLoading,
    credentialResult,
    copied,
    copyCredentials,
    handleSubmit,
    handleFinish
  };
}
