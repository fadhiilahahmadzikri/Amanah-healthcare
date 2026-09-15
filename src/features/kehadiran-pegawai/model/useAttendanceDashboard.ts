'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { attendanceQueries } from '../api/queries';
import type { AttendanceFilterParams, AttendanceListResponse } from '../api/types';
import { createDefaultAttendanceFilters } from './attendanceFilters';

type AttendanceDashboardTab = 'summary' | 'operational';

interface UseAttendanceDashboardResult {
  data: AttendanceListResponse | undefined;
  params: AttendanceFilterParams;
  activeTab: AttendanceDashboardTab;
  isQRVisible: boolean;
  isHeaderCollapsed: boolean;
  isGenerateQRModalOpen: boolean;
  isManualAttendanceModalOpen: boolean;
  actions: {
    changeTab: (tab: string) => void;
    changeFilter: (params: Partial<AttendanceFilterParams>) => void;
    resetFilter: () => void;
    refreshData: () => void;
    openGenerateQR: () => void;
    closeGenerateQR: () => void;
    activateQR: () => void;
    hideQR: () => void;
    openManualAttendance: () => void;
    closeManualAttendance: () => void;
    expandHeader: () => void;
    collapseHeader: () => void;
    handleHeaderMouseEnter: () => void;
    handleHeaderMouseLeave: () => void;
  };
}

export function useAttendanceDashboard(): UseAttendanceDashboardResult {
  const [activeTab, setActiveTab] = useState<AttendanceDashboardTab>('summary');
  const [params, setParams] = useState<AttendanceFilterParams>(() =>
    createDefaultAttendanceFilters(8)
  );
  const [isQRVisible, setIsQRVisible] = useState(false);
  const [isGenerateQRModalOpen, setIsGenerateQRModalOpen] = useState(false);
  const [isManualAttendanceModalOpen, setIsManualAttendanceModalOpen] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [isHeaderPinned, setIsHeaderPinned] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data, refetch } = useQuery(attendanceQueries.list(params));

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const clearHoverTimeout = () => {
    if (!hoverTimeoutRef.current) return;
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = null;
  };

  const resetFilter = () => {
    setParams(createDefaultAttendanceFilters(8));
    toast.info('Filter presensi telah direset.');
  };

  const refreshData = () => {
    void refetch();
    toast.success('Data presensi berhasil diperbarui.');
  };

  return {
    data,
    params,
    activeTab,
    isQRVisible,
    isHeaderCollapsed: isQRVisible && !isHeaderHovered && !isHeaderPinned,
    isGenerateQRModalOpen,
    isManualAttendanceModalOpen,
    actions: {
      changeTab: (tab) => setActiveTab(tab as AttendanceDashboardTab),
      changeFilter: (nextParams) => setParams((prev) => ({ ...prev, ...nextParams })),
      resetFilter,
      refreshData,
      openGenerateQR: () => setIsGenerateQRModalOpen(true),
      closeGenerateQR: () => setIsGenerateQRModalOpen(false),
      activateQR: () => {
        setIsQRVisible(true);
        setIsHeaderPinned(false);
        setActiveTab('operational');
        toast.success('Sesi presensi kehadiran dan QR Code berhasil diaktifkan.');
      },
      hideQR: () => {
        setIsQRVisible(false);
        setIsHeaderPinned(false);
        setIsHeaderHovered(false);
        toast.info('Presensi QR code disembunyikan.');
      },
      openManualAttendance: () => setIsManualAttendanceModalOpen(true),
      closeManualAttendance: () => setIsManualAttendanceModalOpen(false),
      expandHeader: () => setIsHeaderPinned(true),
      collapseHeader: () => {
        setIsHeaderPinned(false);
        setIsHeaderHovered(false);
      },
      handleHeaderMouseEnter: () => {
        clearHoverTimeout();
        if (isQRVisible) setIsHeaderHovered(true);
      },
      handleHeaderMouseLeave: () => {
        clearHoverTimeout();
        hoverTimeoutRef.current = setTimeout(() => setIsHeaderHovered(false), 220);
      }
    }
  };
}
