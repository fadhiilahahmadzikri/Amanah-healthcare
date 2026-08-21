'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type QRDotType =
  | 'dots'
  | 'rounded'
  | 'classy'
  | 'classy-rounded'
  | 'square'
  | 'extra-rounded';
export type QRCornerSquareType = 'dot' | 'square' | 'extra-rounded';
export type QRCornerDotType = 'dot' | 'square';
export type QRErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface QRStyleState {
  dotType: QRDotType;
  cornerSquareType: QRCornerSquareType;
  cornerDotType: QRCornerDotType;
  fgColor: string;
  bgColor: string;
  rotationSeconds: number;
  showCenterLogo: boolean;
  errorCorrection: QRErrorCorrection;

  // Actions
  setDotType: (type: QRDotType) => void;
  setCornerSquareType: (type: QRCornerSquareType) => void;
  setCornerDotType: (type: QRCornerDotType) => void;
  setFgColor: (color: string) => void;
  setBgColor: (color: string) => void;
  setRotationSeconds: (seconds: number) => void;
  setShowCenterLogo: (show: boolean) => void;
  setErrorCorrection: (level: QRErrorCorrection) => void;
  resetDefaults: () => void;
}

export const DEFAULT_QR_STYLE = {
  dotType: 'rounded' as QRDotType,
  cornerSquareType: 'extra-rounded' as QRCornerSquareType,
  cornerDotType: 'dot' as QRCornerDotType,
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  rotationSeconds: 30,
  showCenterLogo: true,
  errorCorrection: 'M' as QRErrorCorrection
};

export const useQRStyleStore = create<QRStyleState>()(
  persist(
    (set) => ({
      ...DEFAULT_QR_STYLE,

      setDotType: (dotType) => set({ dotType }),
      setCornerSquareType: (cornerSquareType) => set({ cornerSquareType }),
      setCornerDotType: (cornerDotType) => set({ cornerDotType }),
      setFgColor: (fgColor) => set({ fgColor }),
      setBgColor: (bgColor) => set({ bgColor }),
      setRotationSeconds: (rotationSeconds) => set({ rotationSeconds }),
      setShowCenterLogo: (showCenterLogo) => set({ showCenterLogo }),
      setErrorCorrection: (errorCorrection) => set({ errorCorrection }),
      resetDefaults: () => set({ ...DEFAULT_QR_STYLE })
    }),
    {
      name: 'amanah-qr-style-settings'
    }
  )
);
