'use client';

import React, { useEffect, useRef } from 'react';
import QRCodeStyling, {
  type DotType,
  type CornerSquareType,
  type CornerDotType,
  type ErrorCorrectionLevel
} from 'qr-code-styling';
import { useQRStyleStore, type QRStyleState } from '../store/qr-style-store';
import { cn } from '@/lib/utils';

export interface ModernStyledQRCodeProps {
  data: string;
  size?: number;
  customStyle?: Partial<QRStyleState>;
  className?: string;
}

export function ModernStyledQRCode({
  data,
  size = 280,
  customStyle,
  className
}: ModernStyledQRCodeProps) {
  const store = useQRStyleStore();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  const dotType = (customStyle?.dotType || store.dotType) as DotType;
  const cornerSquareType = (customStyle?.cornerSquareType ||
    store.cornerSquareType) as CornerSquareType;
  const cornerDotType = (customStyle?.cornerDotType || store.cornerDotType) as CornerDotType;
  const fgColor = customStyle?.fgColor || store.fgColor;
  const bgColor = customStyle?.bgColor || store.bgColor;
  const showCenterLogo =
    customStyle?.showCenterLogo !== undefined ? customStyle.showCenterLogo : store.showCenterLogo;
  const errorCorrection = (customStyle?.errorCorrection ||
    store.errorCorrection) as ErrorCorrectionLevel;

  useEffect(() => {
    if (!containerRef.current) return;

    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling({
        width: size,
        height: size,
        type: 'svg',
        data: data,
        image: showCenterLogo ? '/icon.svg' : undefined,
        dotsOptions: {
          color: fgColor,
          type: dotType
        },
        backgroundOptions: {
          color: bgColor
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 4,
          imageSize: 0.28,
          hideBackgroundDots: true
        },
        cornersSquareOptions: {
          color: fgColor,
          type: cornerSquareType
        },
        cornersDotOptions: {
          color: fgColor,
          type: cornerDotType
        },
        qrOptions: {
          errorCorrectionLevel: errorCorrection
        }
      });

      containerRef.current.innerHTML = '';
      qrCodeRef.current.append(containerRef.current);
    } else {
      qrCodeRef.current.update({
        width: size,
        height: size,
        data: data,
        image: showCenterLogo ? '/icon.svg' : undefined,
        dotsOptions: {
          color: fgColor,
          type: dotType
        },
        backgroundOptions: {
          color: bgColor
        },
        cornersSquareOptions: {
          color: fgColor,
          type: cornerSquareType
        },
        cornersDotOptions: {
          color: fgColor,
          type: cornerDotType
        },
        qrOptions: {
          errorCorrectionLevel: errorCorrection
        }
      });
    }
  }, [
    data,
    size,
    dotType,
    cornerSquareType,
    cornerDotType,
    fgColor,
    bgColor,
    showCenterLogo,
    errorCorrection
  ]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'w-full aspect-square flex items-center justify-center overflow-hidden select-none',
        '[&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:aspect-square',
        '[&>canvas]:w-full [&>canvas]:h-full [&>canvas]:max-w-full [&>canvas]:max-h-full [&>canvas]:aspect-square',
        className
      )}
    />
  );
}
