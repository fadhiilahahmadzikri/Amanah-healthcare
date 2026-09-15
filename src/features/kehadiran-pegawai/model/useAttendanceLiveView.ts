'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceKeys, attendanceQueries } from '../api/queries';
import type { AttendanceFilterParams, AttendanceListResponse } from '../api/types';
import { createDefaultAttendanceFilters } from './attendanceFilters';

export interface UseAttendanceLiveViewResult {
  data: AttendanceListResponse | undefined;
  params: AttendanceFilterParams;
  isFullscreen: boolean;
  isManualAttendanceModalOpen: boolean;
  actions: {
    changeFilter: (newParams: Partial<AttendanceFilterParams>) => void;
    resetFilter: () => void;
    refreshData: () => void;
    generateNewToken: () => void;
    toggleFullscreen: () => void;
    closePanel: () => void;
    openManualAttendance: () => void;
    closeManualAttendance: () => void;
  };
}

export function useAttendanceLiveView(): UseAttendanceLiveViewResult {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [params, setParams] = useState<AttendanceFilterParams>(() =>
    createDefaultAttendanceFilters(10)
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isManualAttendanceModalOpen, setIsManualAttendanceModalOpen] = useState(false);
  const { data, refetch } = useQuery(attendanceQueries.list(params));

  const handleFilterChange = (newParams: Partial<AttendanceFilterParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const handleResetFilter = () => {
    setParams(createDefaultAttendanceFilters(10));
  };

  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    void refetch();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
      return;
    }

    document
      .exitFullscreen()
      .then(() => setIsFullscreen(false))
      .catch(() => {});
  };

  const handleClosePanel = () => {
    try {
      if (window.opener) {
        window.close();
      } else {
        router.push('/dashboard/kehadiran-pegawai');
      }
    } catch {
      router.push('/dashboard/kehadiran-pegawai');
    }
  };

  return {
    data,
    params,
    isFullscreen,
    isManualAttendanceModalOpen,
    actions: {
      changeFilter: handleFilterChange,
      resetFilter: handleResetFilter,
      refreshData: handleRefreshData,
      generateNewToken: () => void refetch(),
      toggleFullscreen: handleToggleFullscreen,
      closePanel: handleClosePanel,
      openManualAttendance: () => setIsManualAttendanceModalOpen(true),
      closeManualAttendance: () => setIsManualAttendanceModalOpen(false)
    }
  };
}
