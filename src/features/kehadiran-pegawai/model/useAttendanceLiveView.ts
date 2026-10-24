'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAttendanceDashboard } from './useAttendanceDashboard';

export function useAttendanceLiveView() {
  const router = useRouter();
  const dashboard = useAttendanceDashboard();
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    ...dashboard,
    isFullscreen,
    actions: {
      ...dashboard.actions,
      toggleFullscreen: handleToggleFullscreen,
      closePanel: handleClosePanel,
      generateNewToken: dashboard.qrController.rotateQR
    }
  };
}
