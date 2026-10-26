'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AppointmentStatusDescriptor } from '@/constants/appointment-status.constants';
import type { AdminAppointment, CheckInQrData } from '../api/types';
import { appointmentKeys } from '../api/queries';
import { checkInQrQueryOptions } from '../api/queries';

import { isAppointmentTerminal } from '../constants/options';

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
  isAlreadyCheckedIn: boolean;
  isMissingAssignment: boolean;
  secondsRemaining: number;
  formattedCountdown: string;
  formattedDeadline: string;
  actions: {
    fetchQr: () => Promise<void>;
    handleCopyCode: () => Promise<void>;
    handleClose: () => void;
  };
}

function formatDeadlineDateTime(isoString?: string | null): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '';
    return (
      new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta'
      }).format(d) + ' WIB'
    );
  } catch {
    return '';
  }
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
  const [isCopied, setIsCopied] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isTerminal = isAppointmentTerminal(appointment?.status);
  const isBooked = appointment?.status === 'BOOKED';
  const hasDoctorAndRoom = Boolean(appointment?.doctorName && appointment?.roomName);
  const isMissingAssignment = Boolean(isBooked && !hasDoctorAndRoom);
  const isAlreadyCheckedIn = Boolean(
    appointment && !isBooked && !appointment.capabilities.canCheckIn
  );

  const isQueryEnabled = Boolean(
    isOpen && appointment?.id && !isAlreadyCheckedIn && !isMissingAssignment && !isTerminal
  );

  const {
    data: queryResult,
    isLoading,
    refetch
  } = useQuery(
    checkInQrQueryOptions(appointment?.id ? String(appointment.id) : '', isQueryEnabled)
  );

  const qrData: CheckInQrData | null = (() => {
    if (!queryResult) return null;
    if (typeof queryResult === 'object' && 'data' in queryResult && queryResult.data) {
      return queryResult.data as CheckInQrData;
    }
    if (typeof queryResult === 'object' && 'token' in queryResult) {
      return queryResult as CheckInQrData;
    }
    return null;
  })();

  useEffect(() => {
    if (qrData && typeof qrData.remainingSeconds === 'number') {
      // Respect Backend SSOT: gunakan remainingSeconds langsung dari server backend
      setSecondsRemaining(Math.max(0, qrData.remainingSeconds));
    } else {
      setSecondsRemaining(0);
    }
  }, [qrData]);

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

  // Only close if appointment was BOOKED when modal opened and now transitions to WAITING
  useEffect(() => {
    if (!isOpen || !appointment) return;
    if (appointment.status !== 'BOOKED') return;

    const handleStatusUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;
      if (!detail) return;

      const targetId = (detail as { appointmentId?: string })?.appointmentId;
      const isWaitingStatus = AppointmentStatusDescriptor.from(detail.status).isWaiting;

      if (targetId && String(targetId) === String(appointment.id) && isWaitingStatus) {
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
  const formattedDeadline = formatDeadlineDateTime(qrData?.expiresAt);

  const fetchQr = async () => {
    await refetch();
  };

  return {
    qrData,
    isLoading,
    isCopied,
    isExpired,
    isAlreadyCheckedIn,
    isMissingAssignment,
    secondsRemaining,
    formattedCountdown,
    formattedDeadline,
    actions: {
      fetchQr,
      handleCopyCode,
      handleClose: onClose
    }
  };
}
