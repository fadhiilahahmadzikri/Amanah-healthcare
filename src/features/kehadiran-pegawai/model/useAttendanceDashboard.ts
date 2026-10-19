'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { attendanceQueries } from '../api/queries';
import { attendanceService } from '../api/service';
import { useAttendanceRealtimeSync } from '../hooks/useAttendanceRealtimeSync';
import type { AttendanceFilterParams, AttendanceListResponse } from '../api/types';
import { createDefaultAttendanceFilters } from './attendanceFilters';

interface UseAttendanceDashboardResult {
  data: AttendanceListResponse | undefined;
  params: AttendanceFilterParams;
  isQRVisible: boolean;
  isGenerateQRModalOpen: boolean;
  isManualAttendanceModalOpen: boolean;
  actions: {
    changeFilter: (params: Partial<AttendanceFilterParams>) => void;
    resetFilter: () => void;
    refreshData: () => void;
    rotateQR: () => Promise<void>;
    openGenerateQR: () => void;
    closeGenerateQR: () => void;
    activateQR: () => void;
    hideQR: () => void;
    openManualAttendance: () => void;
    closeManualAttendance: () => void;
  };
}

export function useAttendanceDashboard(): UseAttendanceDashboardResult {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<AttendanceFilterParams>(() =>
    createDefaultAttendanceFilters(8)
  );
  const [isQRVisible, setIsQRVisible] = useState(true);
  const [isGenerateQRModalOpen, setIsGenerateQRModalOpen] = useState(false);
  const [isManualAttendanceModalOpen, setIsManualAttendanceModalOpen] = useState(false);

  const { data, refetch } = useQuery(attendanceQueries.list(params));

  // Authoritative real-time sync with backend WebSocket / RabbitMQ events
  useAttendanceRealtimeSync({ refetch });

  const resetFilter = () => {
    setParams(createDefaultAttendanceFilters(8));
    toast.info('Filter presensi telah direset.');
  };

  const refreshData = () => {
    void refetch();
    toast.success('Data presensi berhasil diperbarui.');
  };

  const rotateQR = async () => {
    try {
      const newConfig = await attendanceService.generateNewQRToken();
      queryClient.setQueryData<AttendanceListResponse>(
        attendanceQueries.list(params).queryKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            qrConfig: newConfig
          };
        }
      );
    } catch {
      // Silent error or fallback
    }
  };

  return {
    data,
    params,
    isQRVisible,
    isGenerateQRModalOpen,
    isManualAttendanceModalOpen,
    actions: {
      changeFilter: (nextParams) => setParams((prev) => ({ ...prev, ...nextParams })),
      resetFilter,
      refreshData,
      rotateQR,
      openGenerateQR: () => setIsGenerateQRModalOpen(true),
      closeGenerateQR: () => setIsGenerateQRModalOpen(false),
      activateQR: () => {
        setIsQRVisible(true);
        toast.success('Terminal presensi QR aktif di dashboard.');
      },
      hideQR: () => {
        setIsQRVisible(false);
        toast.info('Terminal presensi QR disembunyikan.');
      },
      openManualAttendance: () => setIsManualAttendanceModalOpen(true),
      closeManualAttendance: () => setIsManualAttendanceModalOpen(false)
    }
  };
}
