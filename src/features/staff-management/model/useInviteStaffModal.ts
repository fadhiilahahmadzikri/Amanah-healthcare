'use client';

import { useState, useCallback, useEffect, useMemo, useRef, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useInviteStaffUniversalMutation } from '../api/mutations';
import { invitationOptionsQueryOptions } from '../api/queries';
import type { ClinicUnitOption, PolyclinicUnit, RoleOption } from '../api/staff-management.api';
import {
  useInviteStaffStateCycle,
  type InviteWizardStep,
  type InviteStaffFormSnapshot
} from './useInviteStaffStateCycle';

export type { InviteWizardStep } from './useInviteStaffStateCycle';

export interface UseInviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface UseInviteStaffModalResult {
  step: InviteWizardStep;
  setStep: (step: InviteWizardStep) => void;
  isEditingFromConfirmation: boolean;
  isConfirmationStep: boolean;
  isCurrentStepValid: boolean;
  handleJumpToStep: (targetStep: InviteWizardStep) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleCancelEdit: () => void;
  email: string;
  setEmail: (email: string) => void;
  isEmailValid: boolean;
  fullName: string;
  setFullName: (name: string) => void;
  selectedRoleId: string;
  setSelectedRoleId: (roleId: string) => void;
  handleRoleSelect: (roleId: string) => void;
  positionTitle: string;
  setPositionTitle: (title: string) => void;
  selectedPoliklinikId: string;
  setSelectedPoliklinikId: (poliId: string) => void;
  selectedUnitId: string;
  setSelectedUnitId: (unitId: string) => void;
  roles: RoleOption[];
  polyclinics: PolyclinicUnit[];
  clinicUnits: ClinicUnitOption[];
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
  handleSubmit: (e?: FormEvent) => Promise<void>;
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
  const [positionTitle, setPositionTitle] = useState('');
  const [isPositionManuallyEdited, setIsPositionManuallyEdited] = useState(false);
  const [selectedPoliklinikId, setSelectedPoliklinikId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [copied, setCopied] = useState(false);
  const [credentialResult, setCredentialResult] = useState<{
    temporaryPassword: string;
    email: string;
    loginUrl: string;
    roleName: string;
  } | null>(null);

  const setStepRef = useRef<(step: InviteWizardStep) => void>(() => {});

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setFullName('');
      setSelectedRoleId('');
      setPositionTitle('');
      setIsPositionManuallyEdited(false);
      setSelectedPoliklinikId('');
      setSelectedUnitId('');
      setCopied(false);
      setCredentialResult(null);
    }
  }, [isOpen]);

  const { data: optionsData, isLoading: isOptionsLoading } = useQuery({
    ...invitationOptionsQueryOptions(),
    enabled: isOpen
  });

  const roles = useMemo(
    () => (optionsData?.roles || []).filter((r) => !(r as any).isSystem),
    [optionsData?.roles]
  );
  const polyclinics = useMemo(() => optionsData?.polyclinics || [], [optionsData?.polyclinics]);
  const clinicUnits = useMemo(() => optionsData?.clinicUnits || [], [optionsData?.clinicUnits]);

  const effectiveRoleId = selectedRoleId || (roles.length > 0 ? roles[0].id : '');
  const selectedRole = roles.find((r) => r.id === effectiveRoleId);
  const isClinical = selectedRole?.isClinical ?? false;

  useEffect(() => {
    if (selectedRole && !positionTitle && !isPositionManuallyEdited) {
      setPositionTitle(selectedRole.name);
    }
  }, [selectedRole, positionTitle, isPositionManuallyEdited]);

  const handleRoleSelect = useCallback(
    (roleId: string) => {
      setSelectedRoleId(roleId);
      const role = roles.find((r) => r.id === roleId);
      if (role && !isPositionManuallyEdited) {
        setPositionTitle(role.name);
      }
    },
    [roles, isPositionManuallyEdited]
  );

  const handlePositionTitleChange = useCallback((value: string) => {
    setPositionTitle(value);
    setIsPositionManuallyEdited(true);
  }, []);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

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

  const getCurrentSnapshot = useCallback((): InviteStaffFormSnapshot => {
    return {
      email,
      fullName,
      selectedRoleId: effectiveRoleId,
      positionTitle,
      selectedPoliklinikId,
      selectedUnitId
    };
  }, [email, fullName, effectiveRoleId, positionTitle, selectedPoliklinikId, selectedUnitId]);

  const onRestoreSnapshot = useCallback((snapshot: InviteStaffFormSnapshot) => {
    setEmail(snapshot.email);
    setFullName(snapshot.fullName);
    setSelectedRoleId(snapshot.selectedRoleId);
    setPositionTitle(snapshot.positionTitle);
    setSelectedPoliklinikId(snapshot.selectedPoliklinikId);
    setSelectedUnitId(snapshot.selectedUnitId);
  }, []);

  const handleFinish = useCallback(() => {
    setCredentialResult(null);
    setEmail('');
    setFullName('');
    setSelectedRoleId('');
    setPositionTitle('');
    setIsPositionManuallyEdited(false);
    setSelectedPoliklinikId('');
    setSelectedUnitId('');
    setCopied(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
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
          poliklinikId: isClinical ? selectedPoliklinikId : null,
          unitId: isClinical ? selectedPoliklinikId : selectedUnitId || null,
          positionTitle: positionTitle.trim() || selectedRole?.name || undefined
        });

        setCredentialResult({
          email: trimmedEmail,
          temporaryPassword: res.temporaryPassword,
          loginUrl: res.loginUrl,
          roleName: selectedRole?.name || 'Staf Klinik'
        });
        setStepRef.current('result');
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
      selectedUnitId,
      positionTitle,
      inviteMutation,
      selectedRole?.name,
      onSuccess
    ]
  );

  const flow = useInviteStaffStateCycle({
    isOpen,
    onCancel: handleFinish,
    onConfirm: handleSubmit,
    isEmailValid,
    selectedRoleId: effectiveRoleId,
    isClinical,
    selectedPoliklinikId,
    getCurrentSnapshot,
    onRestoreSnapshot
  });

  setStepRef.current = flow.setStep;

  return {
    step: flow.step,
    setStep: flow.setStep,
    isEditingFromConfirmation: flow.isEditingFromConfirmation,
    isConfirmationStep: flow.isConfirmationStep,
    isCurrentStepValid: flow.isCurrentStepValid,
    handleJumpToStep: flow.handleJumpToStep,
    handleNext: flow.handleNext,
    handleBack: flow.handleBack,
    handleCancelEdit: flow.handleCancelEdit,
    email,
    setEmail,
    isEmailValid,
    fullName,
    setFullName,
    selectedRoleId: effectiveRoleId,
    setSelectedRoleId,
    handleRoleSelect,
    positionTitle,
    setPositionTitle: handlePositionTitleChange,
    selectedPoliklinikId,
    setSelectedPoliklinikId,
    selectedUnitId,
    setSelectedUnitId,
    roles,
    polyclinics,
    clinicUnits,
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
