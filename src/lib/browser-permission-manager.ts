export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface CameraDeviceInfo {
  id: string;
  label: string;
  isBackCamera: boolean;
}

export class BrowserPermissionManager {
  private static instance: BrowserPermissionManager | null = null;
  private cameraPermissionStatus: PermissionState = 'prompt';
  private permissionStatusObj: PermissionStatus | null = null;
  private listeners: Set<(state: PermissionState) => void> = new Set();

  private constructor() {
    this.initPermissionWatcher();
  }

  public static getInstance(): BrowserPermissionManager {
    if (!BrowserPermissionManager.instance) {
      BrowserPermissionManager.instance = new BrowserPermissionManager();
    }
    return BrowserPermissionManager.instance;
  }

  private async initPermissionWatcher(): Promise<void> {
    if (typeof window === 'undefined' || !navigator.permissions?.query) return;
    try {
      this.permissionStatusObj = await navigator.permissions.query({
        name: 'camera' as PermissionName
      });
      this.cameraPermissionStatus = this.permissionStatusObj.state as PermissionState;
      this.permissionStatusObj.onchange = () => {
        if (this.permissionStatusObj) {
          this.cameraPermissionStatus = this.permissionStatusObj.state as PermissionState;
          this.notifyListeners(this.cameraPermissionStatus);
        }
      };
    } catch {
      this.cameraPermissionStatus = 'prompt';
    }
  }

  public subscribe(listener: (state: PermissionState) => void): () => void {
    this.listeners.add(listener);
    listener(this.cameraPermissionStatus);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(state: PermissionState): void {
    this.listeners.forEach((fn) => fn(state));
  }

  public async getCameraPermissionState(): Promise<PermissionState> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return 'unsupported';
    }
    if (navigator.permissions?.query) {
      try {
        const res = await navigator.permissions.query({
          name: 'camera' as PermissionName
        });
        this.cameraPermissionStatus = res.state as PermissionState;
        return this.cameraPermissionStatus;
      } catch {
        return this.cameraPermissionStatus;
      }
    }
    return this.cameraPermissionStatus;
  }

  public async requestCameraPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.cameraPermissionStatus = 'unsupported';
      this.notifyListeners('unsupported');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });
      stream.getTracks().forEach((track) => track.stop());
      this.cameraPermissionStatus = 'granted';
      this.notifyListeners('granted');
      return true;
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.cameraPermissionStatus = 'denied';
      } else {
        this.cameraPermissionStatus = 'prompt';
      }
      this.notifyListeners(this.cameraPermissionStatus);
      return false;
    }
  }

  public async detectAvailableCameras(): Promise<CameraDeviceInfo[]> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return [];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');

      return videoDevices.map((d, index) => {
        const label = d.label || `Kamera ${index + 1}`;
        const isBack = /back|rear|environment|belakang/i.test(label);
        return {
          id: d.deviceId,
          label,
          isBackCamera: isBack
        };
      });
    } catch {
      return [];
    }
  }

  public async resolveOptimalCameraId(): Promise<string | undefined> {
    const cameras = await this.detectAvailableCameras();
    if (cameras.length === 0) return undefined;
    const backCam = cameras.find((c) => c.isBackCamera);
    return backCam ? backCam.id : cameras[0].id;
  }
}

export const browserPermissionManager = BrowserPermissionManager.getInstance();
