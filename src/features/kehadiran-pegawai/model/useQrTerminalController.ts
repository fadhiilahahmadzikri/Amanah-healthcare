'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { attendanceService } from '../api/service';
import { attendanceKeys } from '../api/queries';
import type { AttendanceListResponse, AttendanceFilterParams } from '../api/types';

interface UseQrTerminalControllerProps {
  params: AttendanceFilterParams;
}

export function useQrTerminalController({ params }: UseQrTerminalControllerProps) {
  const queryClient = useQueryClient();
  const [isQRVisible, setIsQRVisible] = useState(true);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const toggleQR = useCallback((isMobile = false) => {
    if (isMobile) {
      setIsMobileModalOpen((prev) => !prev);
    } else {
      setIsQRVisible((prev) => !prev);
    }
  }, []);

  const openQR = useCallback((isMobile = false) => {
    if (isMobile) {
      setIsMobileModalOpen(true);
    } else {
      setIsQRVisible(true);
    }
  }, []);

  const closeQR = useCallback((isMobile = false) => {
    if (isMobile) {
      setIsMobileModalOpen(false);
    } else {
      setIsQRVisible(false);
    }
  }, []);

  const rotateQR = useCallback(async () => {
    const currentData = queryClient.getQueryData<AttendanceListResponse>(
      attendanceKeys.list(params)
    );
    if (currentData?.qrConfig && !currentData.qrConfig.isActive) {
      toast.info(
        'Sesi operasional sedang inaktif. Silakan periksa atau aktifkan sesi terlebih dahulu.'
      );
      return;
    }

    try {
      const newConfig = await attendanceService.generateNewQRToken();
      queryClient.setQueryData<AttendanceListResponse>(attendanceKeys.list(params), (old) => {
        if (!old) return old;
        return {
          ...old,
          qrConfig: newConfig
        };
      });
      toast.info('QR Code presensi diperbarui.');
    } catch {
      toast.error('Gagal memperbarui token QR presensi.');
    }
  }, [queryClient, params]);

  return {
    isQRVisible,
    isMobileModalOpen,
    toggleQR,
    openQR,
    closeQR,
    rotateQR
  };
}
