'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';

export type InviteWizardStep = 'email' | 'name' | 'role' | 'position' | 'unit' | 'result';

export interface InviteStaffFormSnapshot {
  email: string;
  fullName: string;
  selectedRoleId: string;
  positionTitle: string;
  selectedPoliklinikId: string;
  selectedUnitId: string;
}

export interface UseInviteStaffStateCycleOptions {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  isEmailValid: boolean;
  selectedRoleId: string;
  isClinical: boolean;
  selectedPoliklinikId: string;
  getCurrentSnapshot: () => InviteStaffFormSnapshot;
  onRestoreSnapshot: (snapshot: InviteStaffFormSnapshot) => void;
}

export interface UseInviteStaffStateCycleResult {
  step: InviteWizardStep;
  setStep: (step: InviteWizardStep) => void;
  isEditingFromConfirmation: boolean;
  isConfirmationStep: boolean;
  isCurrentStepValid: boolean;
  handleJumpToStep: (targetStep: InviteWizardStep) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleCancelEdit: () => void;
  handleConfirm: () => void;
  resetFlow: () => void;
}

export function useInviteStaffStateCycle({
  isOpen,
  onCancel,
  onConfirm,
  isEmailValid,
  selectedRoleId,
  isClinical,
  selectedPoliklinikId,
  getCurrentSnapshot,
  onRestoreSnapshot
}: UseInviteStaffStateCycleOptions): UseInviteStaffStateCycleResult {
  const [step, setStep] = useState<InviteWizardStep>('email');
  const [isEditingFromConfirmation, setIsEditingFromConfirmation] = useState(false);
  const [snapshot, setSnapshot] = useState<InviteStaffFormSnapshot | null>(null);

  const resetFlow = useCallback(() => {
    setStep('email');
    setIsEditingFromConfirmation(false);
    setSnapshot(null);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetFlow();
    }
  }, [isOpen, resetFlow]);

  const isCurrentStepValid = useMemo(() => {
    switch (step) {
      case 'email':
        return isEmailValid;
      case 'name':
        return true;
      case 'role':
        return Boolean(selectedRoleId);
      case 'position':
        return true;
      case 'unit':
        return !isClinical || Boolean(selectedPoliklinikId);
      case 'result':
        return true;
      default:
        return false;
    }
  }, [step, isEmailValid, selectedRoleId, isClinical, selectedPoliklinikId]);

  const handleJumpToStep = useCallback(
    (targetStep: InviteWizardStep) => {
      if (!isEditingFromConfirmation) {
        setSnapshot(getCurrentSnapshot());
      }
      setIsEditingFromConfirmation(true);
      setStep(targetStep);
    },
    [isEditingFromConfirmation, getCurrentSnapshot]
  );

  const handleCancelEdit = useCallback(() => {
    if (snapshot) {
      onRestoreSnapshot(snapshot);
      setSnapshot(null);
    }
    setIsEditingFromConfirmation(false);
    setStep('unit');
  }, [snapshot, onRestoreSnapshot]);

  const handleNext = useCallback(() => {
    if (!isCurrentStepValid) return;

    if (isEditingFromConfirmation) {
      setIsEditingFromConfirmation(false);
      setSnapshot(null);
      setStep('unit');
      return;
    }

    switch (step) {
      case 'email':
        setStep('name');
        break;
      case 'name':
        setStep('role');
        break;
      case 'role':
        setStep('position');
        break;
      case 'position':
        setStep('unit');
        break;
      case 'unit':
        void onConfirm();
        break;
      default:
        break;
    }
  }, [isCurrentStepValid, isEditingFromConfirmation, step, onConfirm]);

  const handleBack = useCallback(() => {
    if (isEditingFromConfirmation) {
      handleCancelEdit();
      return;
    }

    switch (step) {
      case 'email':
        onCancel();
        break;
      case 'name':
        setStep('email');
        break;
      case 'role':
        setStep('name');
        break;
      case 'position':
        setStep('role');
        break;
      case 'unit':
        setStep('position');
        break;
      default:
        break;
    }
  }, [isEditingFromConfirmation, handleCancelEdit, step, onCancel]);

  const handleConfirm = useCallback(() => {
    void onConfirm();
  }, [onConfirm]);

  const isConfirmationStep = step === 'unit';

  return {
    step,
    setStep,
    isEditingFromConfirmation,
    isConfirmationStep,
    isCurrentStepValid,
    handleJumpToStep,
    handleNext,
    handleBack,
    handleCancelEdit,
    handleConfirm,
    resetFlow
  };
}
