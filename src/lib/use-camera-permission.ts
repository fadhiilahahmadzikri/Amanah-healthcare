'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  browserPermissionManager,
  type PermissionState,
  type CameraDeviceInfo
} from './browser-permission-manager';

export interface UseCameraPermissionResult {
  permissionState: PermissionState;
  isGranted: boolean;
  isDenied: boolean;
  requestPermission: () => Promise<boolean>;
  resolveOptimalCameraId: () => Promise<string | undefined>;
  detectCameras: () => Promise<CameraDeviceInfo[]>;
}

export function useCameraPermission(): UseCameraPermissionResult {
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');

  useEffect(() => {
    const unsubscribe = browserPermissionManager.subscribe((state) => {
      setPermissionState(state);
    });
    browserPermissionManager.getCameraPermissionState().then(setPermissionState);
    return () => {
      unsubscribe();
    };
  }, []);

  const requestPermission = useCallback(async () => {
    return browserPermissionManager.requestCameraPermission();
  }, []);

  const resolveOptimalCameraId = useCallback(async () => {
    return browserPermissionManager.resolveOptimalCameraId();
  }, []);

  const detectCameras = useCallback(async () => {
    return browserPermissionManager.detectAvailableCameras();
  }, []);

  return {
    permissionState,
    isGranted: permissionState === 'granted',
    isDenied: permissionState === 'denied',
    requestPermission,
    resolveOptimalCameraId,
    detectCameras
  };
}
