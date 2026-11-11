'use client';

import { useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors/app-error';
import { performCheckIn } from '@/features/appointment-pasien/api/service';
import type { PerformCheckInSuccessData } from '@/features/appointment-pasien/api/types';
import { klinikKeys } from '../api/query-keys';
import { appointmentKeys } from '@/features/appointment-pasien/api/queries';
import type { CheckInResultPayload, CheckInOutcomeType } from '../components/patient-check-in-result-drawer';

export type CheckInTabMode = 'scan' | 'manual';

const CHECK_IN_OUTCOMES: Record<string, { type: CheckInOutcomeType; title: string }> = {
  INVALID_CHECK_IN_CODE: { type: 'invalid_code', title: 'Kode Check-In Tidak Valid' },
  INVALID_CHECK_IN_QR: { type: 'invalid_qr', title: 'Kode Barcode / QR Tidak Valid' },
  CHECK_IN_ALREADY_USED: { type: 'already_checked_in', title: 'Sudah Pernah Digunakan' },
  CHECK_IN_EXPIRED: { type: 'out_of_window', title: 'Kredensial Kedaluwarsa' },
  CHECK_IN_WINDOW_TOO_EARLY: { type: 'out_of_window', title: 'Waktu Check-In Belum Dibuka' },
  CHECK_IN_WINDOW_EXPIRED: { type: 'out_of_window', title: 'Waktu Check-In Telah Berakhir' },
  CHECK_IN_NOT_TODAY: { type: 'out_of_window', title: 'Bukan Hari Layanan' },
  CHECK_IN_FORBIDDEN: { type: 'forbidden', title: 'Akses Ditolak' }
};

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
  isResultDrawerOpen: boolean;
  isScannerPaused: boolean;
  resultPayload: CheckInResultPayload | null;
  actions: {
    setActiveTab: (tab: CheckInTabMode) => void;
    setManualCode: (code: string) => void;
    setIsManualDrawerOpen: (open: boolean) => void;
    handleManualSubmit: (e: React.FormEvent) => Promise<void>;
    handleCheckIn: (payload: { token?: string; manualCode?: string; method?: 'qr' | 'manual' }) => Promise<void>;
    handleScan: (rawDecoded: string) => Promise<void>;
    handleScannerError: (error: string) => void;
    clearCameraError: () => void;
    resumeScanning: () => void;
    openManualInput: () => void;
    closeResultDrawer: () => void;
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
  const [isResultDrawerOpen, setIsResultDrawerOpen] = useState(false);
  const [resultPayload, setResultPayload] = useState<CheckInResultPayload | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<PerformCheckInSuccessData | null>(null);

  const isCooldownRef = useRef(false);

  const handleCheckIn = useCallback(
    async (payload: { token?: string; manualCode?: string; method?: 'qr' | 'manual' }) => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        const appointment = await performCheckIn(payload);

        setSuccessResult(appointment);
        setResultPayload({
          type: 'success',
          title: 'Check-In Berhasil!',
          message: 'Nomor antrean Anda telah aktif. Silakan menunggu panggilan di ruang tunggu.',
          queueNumber: appointment.queueNumber ? String(appointment.queueNumber) : undefined,
          actionLabel: 'Lihat Antrean Saya'
        });
        setIsResultDrawerOpen(true);

        await Promise.allSettled([
          queryClient.invalidateQueries({ queryKey: klinikKeys.all }),
          queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
        ]);
        onCheckInSuccess?.(appointment);
      } catch (err: unknown) {
        const rawMsg = err instanceof Error ? err.message : String(err);
        const errorCode = err instanceof AppError ? String(err.code) : '';
        const isManual = payload.method === 'manual';

        const outcome = CHECK_IN_OUTCOMES[errorCode] ?? {
          type: isManual ? 'invalid_code' : 'invalid_qr',
          title: isManual ? 'Kode Check-In Tidak Valid' : 'Kode Barcode / QR Tidak Valid'
        };

        setResultPayload({
          type: outcome.type,
          title: outcome.title,
          message: rawMsg
        });
        setIsResultDrawerOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, onCheckInSuccess, queryClient]
  );

  const handleScan = useCallback(
    async (rawDecoded: string) => {
      // Deterministic gate: Do not scan if submitting, drawer open, or in cooldown
      if (isSubmitting || isResultDrawerOpen || isManualDrawerOpen || isCooldownRef.current) {
        return;
      }

      const trimmed = rawDecoded.trim();

      // 1. JSON payload from QR generator
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed) as { token?: string; code?: string };
          const tokenValue = parsed.token || parsed.code || trimmed;
          await handleCheckIn({ token: tokenValue, method: 'qr' });
          return;
        } catch {
          // If JSON parsing fails, continue to raw payload below
        }
      }

      // 2. Raw token UUID or scanned code: Always send as QR scan
      await handleCheckIn({ token: trimmed, method: 'qr' });
    },
    [isSubmitting, isResultDrawerOpen, isManualDrawerOpen, handleCheckIn]
  );

  const resumeScanning = useCallback(() => {
    setIsResultDrawerOpen(false);
    setResultPayload(null);

    // Apply brief cooldown (350ms) to prevent instantaneous re-trigger before camera repositions
    isCooldownRef.current = true;
    setTimeout(() => {
      isCooldownRef.current = false;
    }, 350);
  }, []);

  const openManualInput = useCallback(() => {
    setIsResultDrawerOpen(false);
    setResultPayload(null);
    setIsManualDrawerOpen(true);
  }, []);

  const closeResultDrawer = useCallback(() => {
    if (resultPayload?.type === 'success') {
      setIsResultDrawerOpen(false);
      setResultPayload(null);
      setManualCode('');
      setSuccessResult(null);
      onClose();
    } else {
      resumeScanning();
    }
  }, [resultPayload?.type, onClose, resumeScanning]);

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
      setResultPayload({
        type: 'invalid_code',
        title: 'Kode Tidak Lengkap',
        message: 'Silakan masukkan 6 digit kode check-in yang tertera pada layar admin klinik.',
        actionLabel: 'Masukkan Ulang Kode',
        secondaryActionLabel: 'Pindai Kode QR'
      });
      setIsResultDrawerOpen(true);
      return;
    }

    setIsManualDrawerOpen(false);
    await handleCheckIn({ manualCode: clean, method: 'manual' });
  };

  const handleClose = useCallback(() => {
    setManualCode('');
    setSuccessResult(null);
    setCameraError(null);
    setIsManualDrawerOpen(false);
    setIsResultDrawerOpen(false);
    setResultPayload(null);
    onClose();
  }, [onClose]);

  return {
    activeTab,
    manualCode,
    isSubmitting,
    cameraError,
    successResult,
    isManualDrawerOpen,
    isResultDrawerOpen,
    isScannerPaused: isResultDrawerOpen || isSubmitting || isManualDrawerOpen,
    resultPayload,
    actions: {
      setActiveTab,
      setManualCode,
      setIsManualDrawerOpen,
      handleManualSubmit,
      handleCheckIn,
      handleScan,
      handleScannerError,
      clearCameraError,
      resumeScanning,
      openManualInput,
      closeResultDrawer,
      handleClose
    }
  };
}
