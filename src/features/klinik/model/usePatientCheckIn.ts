'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
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
  isScannerStarting: boolean;
  cameraError: string | null;
  successResult: PerformCheckInSuccessData | null;
  containerId: string;
  actions: {
    setActiveTab: (tab: CheckInTabMode) => void;
    setManualCode: (code: string) => void;
    handleManualSubmit: (e: React.FormEvent) => Promise<void>;
    handleCheckIn: (payload: { token?: string; manualCode?: string }) => Promise<void>;
    handleClose: () => Promise<void>;
    startScanner: () => Promise<void>;
    stopScanner: () => Promise<void>;
  };
}

export function usePatientCheckIn({
  isOpen,
  onClose,
  onCheckInSuccess
}: UsePatientCheckInParams): UsePatientCheckInResult {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CheckInTabMode>('scan');
  const [manualCode, setManualCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScannerStarting, setIsScannerStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<PerformCheckInSuccessData | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningActiveRef = useRef(false);
  const containerId = 'patient-qr-reader-container';

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isScanningActiveRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping html5-qrcode scanner:', err);
      } finally {
        isScanningActiveRef.current = false;
      }
    }
  }, []);

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

        const appointmentId =
          (rawData as { appointmentId?: string; id?: string })?.appointmentId ||
          (rawData as { appointmentId?: string; id?: string })?.id;

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

  const startScanner = useCallback(async () => {
    await stopScanner();
    setCameraError(null);
    setIsScannerStarting(true);

    try {
      const containerElement = document.getElementById(containerId);
      if (!containerElement) {
        setIsScannerStarting(false);
        return;
      }

      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 }
        },
        async (decodedText) => {
          let token = decodedText.trim();
          let parsedManualCode: string | undefined;

          try {
            if (token.startsWith('{') && token.endsWith('}')) {
              const parsed = JSON.parse(token);
              if (parsed.token) token = parsed.token;
              if (parsed.manualCode) parsedManualCode = parsed.manualCode;
            }
          } catch {}


          await stopScanner();
          await handleCheckIn({ token, manualCode: parsedManualCode });
        },
        () => {}
      );

      isScanningActiveRef.current = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Unable to start camera for QR scan:', msg);
      setCameraError(
        'Kamera tidak dapat diakses atau izin ditolak. Silakan gunakan tab Kode Manual.'
      );
    } finally {
      setIsScannerStarting(false);
    }
  }, [handleCheckIn, stopScanner]);

  useEffect(() => {
    if (!isOpen || successResult) {
      stopScanner();
      return;
    }

    if (activeTab === 'scan') {
      const timer = setTimeout(() => {
        startScanner();
      }, 150);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, activeTab, successResult, startScanner, stopScanner]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!clean) {
      toast.error('Masukkan kode manual check-in');
      return;
    }
    await handleCheckIn({ manualCode: clean });
  };

  const handleClose = async () => {
    await stopScanner();
    setManualCode('');
    setSuccessResult(null);
    setCameraError(null);
    onClose();
  };

  return {
    activeTab,
    manualCode,
    isSubmitting,
    isScannerStarting,
    cameraError,
    successResult,
    containerId,
    actions: {
      setActiveTab,
      setManualCode,
      handleManualSubmit,
      handleCheckIn,
      handleClose,
      startScanner,
      stopScanner
    }
  };
}
