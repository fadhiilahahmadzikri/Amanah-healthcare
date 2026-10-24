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
  transparentBackground?: boolean;
}

export const ModernStyledQRCode = React.memo(function ModernStyledQRCode({
  data,
  size = 280,
  customStyle,
  className,
  transparentBackground = true
}: ModernStyledQRCodeProps) {
  const store = useQRStyleStore();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  const dotType = (customStyle?.dotType || store.dotType) as DotType;
  const cornerSquareType = (customStyle?.cornerSquareType ||
    store.cornerSquareType) as CornerSquareType;
  const cornerDotType = (customStyle?.cornerDotType || store.cornerDotType) as CornerDotType;

  // Background is transparent by default (melepaskan background putih kaku)
  const effectiveBgColor = transparentBackground
    ? 'transparent'
    : customStyle?.bgColor || 'transparent';

  // Foreground defaults to currentColor to adopt active theme accent
  const rawFgColor = customStyle?.fgColor || store.fgColor;
  const effectiveFgColor =
    !rawFgColor || rawFgColor === '#0f172a' || rawFgColor === 'currentColor'
      ? 'currentColor'
      : rawFgColor;

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
        margin: 0,
        image: showCenterLogo ? '/logo-symbol-only.svg' : undefined,
        dotsOptions: {
          color: effectiveFgColor,
          type: dotType
        },
        backgroundOptions: {
          color: effectiveBgColor
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 3,
          imageSize: 0.28,
          hideBackgroundDots: true
        },
        cornersSquareOptions: {
          color: effectiveFgColor,
          type: cornerSquareType
        },
        cornersDotOptions: {
          color: effectiveFgColor,
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
        margin: 0,
        image: showCenterLogo ? '/logo-symbol-only.svg' : undefined,
        dotsOptions: {
          color: effectiveFgColor,
          type: dotType
        },
        backgroundOptions: {
          color: effectiveBgColor
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 3,
          imageSize: 0.28,
          hideBackgroundDots: true
        },
        cornersSquareOptions: {
          color: effectiveFgColor,
          type: cornerSquareType
        },
        cornersDotOptions: {
          color: effectiveFgColor,
          type: cornerDotType
        },
        qrOptions: {
          errorCorrectionLevel: errorCorrection
        }
      });
    }

    // Ensure generated SVG is responsive, transparent, and adopts theme accent
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.display = 'block';

      // Remove or make transparent any background rectangle
      if (transparentBackground || effectiveBgColor === 'transparent') {
        const firstRect = svg.querySelector('rect');
        if (firstRect) {
          firstRect.setAttribute('fill', 'transparent');
          firstRect.style.fill = 'transparent';
        }
      }

      // If effectiveFgColor is currentColor, ensure all dots and corners use currentColor
      if (effectiveFgColor === 'currentColor') {
        const paths = svg.querySelectorAll('path');
        paths.forEach((p) => {
          const fill = p.getAttribute('fill');
          if (fill && fill !== 'transparent' && fill !== 'none') {
            p.setAttribute('fill', 'currentColor');
          }
        });
        const rects = svg.querySelectorAll('rect');
        rects.forEach((r, idx) => {
          if (idx > 0) {
            const fill = r.getAttribute('fill');
            if (fill && fill !== 'transparent' && fill !== 'none') {
              r.setAttribute('fill', 'currentColor');
            }
          }
        });
      }
    }
  }, [
    data,
    size,
    dotType,
    cornerSquareType,
    cornerDotType,
    effectiveFgColor,
    effectiveBgColor,
    showCenterLogo,
    errorCorrection,
    transparentBackground
  ]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'w-full aspect-square flex items-center justify-center overflow-hidden select-none text-foreground',
        '[&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:aspect-square [&>svg]:block',
        '[&>canvas]:w-full [&>canvas]:h-full [&>canvas]:max-w-full [&>canvas]:max-h-full [&>canvas]:aspect-square',
        '[&>svg_image]:brightness-0 dark:[&>svg_image]:brightness-100',
        className
      )}
    />
  );
});
