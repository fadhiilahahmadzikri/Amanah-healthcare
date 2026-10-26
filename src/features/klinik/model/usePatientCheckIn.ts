'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { performCheckIn } from '@/features/appointment-pasien/api/service';
import type { PerformCheckInSuccessData } from '@/features/appointment-pasien/api/types';
import { klinikKeys } from '../api/query-keys';
import { appointmentKeys } from '@/features/appointment-pasien/api/queries';

export type CheckInTabMode = 'scan' | 'manual';

export interface UsePatientCheckInParams {
  isOpen: boolean;
  onClose: () => void;
  onCheckInSuccess?: (result: PerformCheckInSuccessData) => void;
}

export interface UsePatientCheckInResult {
  activeTab: CheckInTabMode;
  manualCode: string;
  isSubmitting: boolean;
  cameraError: string | null;
  successResult: PerformCheckInSuccessData | null;
  isManualDrawerOpen: boolean;
  actions: {
    setActiveTab: (tab: CheckInTabMode) => void;
    setManualCode: (code: string) => void;
    setIsManualDrawerOpen: (open: boolean) => void;
    handleManualSubmit: (e: React.FormEvent) => Promise<void>;
    handleCheckIn: (payload: { token?: string; manualCode?: string }) => Promise<void>;
    handleScan: (rawDecoded: string) => Promise<void>;
    handleScannerError: (error: string) => void;
    clearCameraError: () => void;
    handleClose: () => void;
  };
}

export function usePatientCheckIn({
  onClose,
  onCheckInSuccess
}: UsePatientCheckInParams): UsePatientCheckInResult {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CheckInTabMode>('scan');
  const [isManualDrawerOpen, setIsManualDrawerOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<PerformCheckInSuccessData | null>(null);

  const handleCheckIn = useCallback(
    async (payload: { token?: string; manualCode?: string }) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const response = await performCheckIn(payload);
        const rawData =
          response && typeof response === 'object' && 'data' in response && response.data
            ? response.data
            : response && typeof response === 'object'
              ? response
              : null;

        const appointmentId = (rawData as { appointmentId?: string })?.appointmentId;

        if (rawData && appointmentId) {
          const successData: PerformCheckInSuccessData = {
            appointmentId,
            status: (rawData as { status: any }).status,
            checkedInAt:
              (rawData as { checkedInAt?: string }).checkedInAt || new Date().toISOString(),
            queueNumber: (rawData as { queueNumber?: string | number }).queueNumber
              ? String((rawData as { queueNumber?: string | number }).queueNumber)
              : undefined
          };
          setSuccessResult(successData);
          toast.success(
            (response as { message?: string })?.message ||
              'Check-in berhasil! Anda telah masuk antrean.'
          );
          await Promise.allSettled([
            queryClient.invalidateQueries({ queryKey: klinikKeys.all }),
            queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
          ]);
          onCheckInSuccess?.(successData);
        } else {
          toast.error((response as { message?: string })?.message || 'Check-in gagal diproses');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Check-in gagal: ${msg}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, onCheckInSuccess, queryClient]
  );

  const handleScan = useCallback(
    async (rawDecoded: string) => {
      let token = rawDecoded.trim();
      let parsedManualCode: string | undefined;

      try {
        if (token.startsWith('{') && token.endsWith('}')) {
          const parsed = JSON.parse(token);
          if (parsed.token) token = parsed.token;
          if (parsed.code) parsedManualCode = parsed.code;
          if (parsed.manualCode) parsedManualCode = parsed.manualCode;
        }
      } catch {}

      await handleCheckIn({ token, manualCode: parsedManualCode });
    },
    [handleCheckIn]
  );

  const handleScannerError = useCallback((error: string) => {
    setCameraError(
      `Kamera tidak dapat diakses (${error}). Pastikan izin kamera aktif pada peramban.`
    );
  }, []);

  const clearCameraError = useCallback(() => {
    setCameraError(null);
  }, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCode
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    if (!clean) {
      toast.error('Masukkan kode manual check-in');
      return;
    }
    await handleCheckIn({ manualCode: clean });
    setIsManualDrawerOpen(false);
  };

  const handleClose = () => {
    setManualCode('');
    setSuccessResult(null);
    setCameraError(null);
    setIsManualDrawerOpen(false);
    onClose();
  };

  return {
    activeTab,
    manualCode,
    isSubmitting,
    cameraError,
    successResult,
    isManualDrawerOpen,
    actions: {
      setActiveTab,
      setManualCode,
      setIsManualDrawerOpen,
      handleManualSubmit,
      handleCheckIn,
      handleScan,
      handleScannerError,
      clearCameraError,
      handleClose
    }
  };
}
