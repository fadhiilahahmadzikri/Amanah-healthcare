'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AppointmentStatusDescriptor } from '@/constants/appointment-status.constants';
import { generateCheckInQr } from '../api/service';
import type { AdminAppointment, CheckInQrData } from '../api/types';
import { appointmentKeys } from '../api/queries';

export interface UseAppointmentCheckInQrParams {
  isOpen: boolean;
  appointment: AdminAppointment | null;
  onClose: () => void;
}

export interface UseAppointmentCheckInQrResult {
  qrData: CheckInQrData | null;
  isLoading: boolean;
  isCopied: boolean;
  isExpired: boolean;
  secondsRemaining: number;
  formattedCountdown: string;
  actions: {
    fetchQr: () => Promise<void>;
    handleCopyCode: () => Promise<void>;
    handleClose: () => void;
  };
}

function formatCountdown(totalSec: number): string {
  if (totalSec <= 0) return '00:00';
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function useAppointmentCheckInQr({
  isOpen,
  appointment,
  onClose
}: UseAppointmentCheckInQrParams): UseAppointmentCheckInQrResult {
  const queryClient = useQueryClient();
  const [qrData, setQrData] = useState<CheckInQrData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchQr = useCallback(async () => {
    if (!appointment) return;
    setIsLoading(true);
    try {
      const res = await generateCheckInQr(appointment.id);
      const data: CheckInQrData | null =
        res && typeof res === 'object' && 'data' in res && res.data
          ? res.data
          : res && typeof res === 'object' && 'token' in res
            ? (res as CheckInQrData)
            : null;

      if (data && data.token && data.qrPayload) {
        setQrData(data);
        const deadline = data.appointmentEligibilityDeadline || data.expiresAt;
        if (deadline) {
          const diffMs = new Date(deadline).getTime() - Date.now();
          setSecondsRemaining(Math.max(0, Math.floor(diffMs / 1000)));
        } else if (typeof data.remainingSeconds === 'number') {
          setSecondsRemaining(Math.max(0, data.remainingSeconds));
        } else {
          setSecondsRemaining(0);
        }
      } else {
        const errMsg = (res as { message?: string })?.message || 'Gagal membuat QR Code check-in';
        toast.error(errMsg);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Gagal membuat QR Code: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [appointment]);

  useEffect(() => {
    if (isOpen && appointment) {
      fetchQr();
    } else {
      setQrData(null);
      setSecondsRemaining(0);
    }
  }, [isOpen, appointment, fetchQr]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [secondsRemaining]);

  useEffect(() => {
    if (!isOpen || !appointment) return;

    const handleStatusUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;
      if (!detail) return;

      const targetId = detail.appointmentId || detail.id;
      const isWaitingStatus = AppointmentStatusDescriptor.from(detail.status).isWaiting;

      if (targetId === appointment.id && isWaitingStatus) {
        toast.success(`Check-in berhasil! Pasien ${appointment.patientName} kini dalam antrean.`);
        queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
        onClose();
      }
    };

    window.addEventListener('clinic:appointment_updated', handleStatusUpdate);
    return () => {
      window.removeEventListener('clinic:appointment_updated', handleStatusUpdate);
    };
  }, [isOpen, appointment, onClose, queryClient]);

  const handleCopyCode = async () => {
    if (!qrData?.manualCode) return;
    try {
      await navigator.clipboard.writeText(qrData.manualCode);
      setIsCopied(true);
      toast.success('Kode check-in berhasil disalin ke clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin kode');
    }
  };

  const isExpired = Boolean(qrData && secondsRemaining <= 0);
  const formattedCountdown = formatCountdown(secondsRemaining);

  return {
    qrData,
    isLoading,
    isCopied,
    isExpired,
    secondsRemaining,
    formattedCountdown,
    actions: {
      fetchQr,
      handleCopyCode,
      handleClose: onClose
    }
  };
}
