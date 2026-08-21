'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

interface GeminiSparkle3DIconProps {
  className?: string;
  size?: number | string;
  isHovered?: boolean;
  interactive?: boolean;
}

/**
 * High-End 3D Rotating Google Gemini Star Icon
 * Features multi-stop mesh gradients (Red, Gold, Green, Blue) and smooth GSAP 3D hover rotation
 */
export function GeminiSparkle3DIcon({
  className,
  size = 28,
  isHovered = false,
  interactive = true
}: GeminiSparkle3DIconProps) {
  const iconRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  // GSAP 3D interactive rotation when hovered
  React.useEffect(() => {
    if (!iconRef.current || !interactive) return;

    if (isHovered) {
      // 3D Tumble Spin on Hover
      gsap.to(iconRef.current, {
        rotateY: 360,
        rotateX: 14,
        rotateZ: -8,
        scale: 1.15,
        z: 18,
        duration: 0.65,
        ease: 'back.out(1.5)'
      });

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.85,
          scale: 1.4,
          duration: 0.4
        });
      }
    } else {
      // Smooth reset back to resting 3D perspective
      gsap.to(iconRef.current, {
        rotateY: 0,
        rotateX: 0,
        rotateZ: 0,
        scale: 1,
        z: 0,
        duration: 0.5,
        ease: 'power3.out'
      });

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.35,
          scale: 1,
          duration: 0.5
        });
      }
    }
  }, [isHovered, interactive]);

  const handlePointerEnter = () => {
    if (!interactive || !iconRef.current) return;
    gsap.to(iconRef.current, {
      rotateY: '+=360',
      rotateX: 12,
      scale: 1.18,
      duration: 0.7,
      ease: 'back.out(1.6)'
    });
  };

  const handlePointerLeave = () => {
    if (!interactive || !iconRef.current) return;
    gsap.to(iconRef.current, {
      rotateX: 0,
      rotateZ: 0,
      scale: 1,
      duration: 0.5,
      ease: 'power3.out'
    });
  };

  return (
    <div
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      style={{ perspective: 800 }}
      className={cn(
        'relative inline-flex items-center justify-center select-none cursor-pointer',
        className
      )}
    >
      {/* Dynamic Ambient Blur Glow behind Star */}
      <div
        ref={glowRef}
        className='absolute inset-0 rounded-full blur-md opacity-35 transition-all pointer-events-none'
        style={{
          background:
            'radial-gradient(circle, rgba(66,133,244,0.7) 0%, rgba(234,67,53,0.5) 45%, rgba(52,168,83,0.4) 75%, transparent 100%)'
        }}
      />

      {/* 3D Transform Stage */}
      <div
        ref={iconRef}
        style={{ transformStyle: 'preserve-3d' }}
        className='relative flex items-center justify-center will-change-transform drop-shadow-[0_4px_12px_rgba(66,133,244,0.38)]'
      >
        <svg
          viewBox='0 0 48 48'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          style={{ width: size, height: size }}
          className='overflow-visible'
        >
          <defs>
            {/* Primary Base Gemini Gradient */}
            <linearGradient id='geminiBaseMesh' x1='0%' y1='0%' x2='100%' y2='100%'>
              <stop offset='0%' stopColor='#EA4335' />
              <stop offset='28%' stopColor='#FBBC04' />
              <stop offset='65%' stopColor='#34A853' />
              <stop offset='100%' stopColor='#4285F4' />
            </linearGradient>

            {/* Top Red-Orange Light Flare */}
            <radialGradient id='geminiTopRed' cx='50%' cy='10%' r='55%'>
              <stop offset='0%' stopColor='#FF4B3A' stopOpacity='1' />
              <stop offset='60%' stopColor='#EA4335' stopOpacity='0.85' />
              <stop offset='100%' stopColor='transparent' stopOpacity='0' />
            </radialGradient>

            {/* Right Electric Blue Light Flare */}
            <radialGradient id='geminiRightBlue' cx='90%' cy='50%' r='60%'>
              <stop offset='0%' stopColor='#2979FF' stopOpacity='1' />
              <stop offset='55%' stopColor='#4285F4' stopOpacity='0.9' />
              <stop offset='100%' stopColor='transparent' stopOpacity='0' />
            </radialGradient>

            {/* Bottom Emerald Green Light Flare */}
            <radialGradient id='geminiBottomGreen' cx='50%' cy='90%' r='55%'>
              <stop offset='0%' stopColor='#00E676' stopOpacity='1' />
              <stop offset='60%' stopColor='#34A853' stopOpacity='0.85' />
              <stop offset='100%' stopColor='transparent' stopOpacity='0' />
            </radialGradient>

            {/* Left Amber Yellow Light Flare */}
            <radialGradient id='geminiLeftYellow' cx='10%' cy='50%' r='55%'>
              <stop offset='0%' stopColor='#FFD600' stopOpacity='1' />
              <stop offset='60%' stopColor='#FBBC04' stopOpacity='0.85' />
              <stop offset='100%' stopColor='transparent' stopOpacity='0' />
            </radialGradient>

            {/* Specular Center Gloss */}
            <radialGradient id='geminiCenterSpecular' cx='45%' cy='42%' r='40%'>
              <stop offset='0%' stopColor='#FFFFFF' stopOpacity='0.7' />
              <stop offset='40%' stopColor='#FFFFFF' stopOpacity='0.15' />
              <stop offset='100%' stopColor='transparent' stopOpacity='0' />
            </radialGradient>
          </defs>

          {/* 1. Base Astroid 4-Point Star Shell */}
          <path
            d='M 24 2.5 C 24 13.8 14.8 23 3.5 23 C 2.67 23 2 23.67 2 24.5 C 2 25.33 2.67 26 3.5 26 C 14.8 26 24 35.2 24 46.5 C 24 47.33 24.67 48 25.5 48 C 26.33 48 27 47.33 27 46.5 C 27 35.2 36.2 26 47.5 26 C 48.33 26 49 25.33 49 24.5 C 49 23.67 48.33 23 47.5 23 C 36.2 23 27 13.8 27 2.5 C 27 1.67 26.33 1 25.5 1 C 24.67 1 24 1.67 24 2.5 Z'
            fill='url(#geminiBaseMesh)'
          />

          {/* 2. Top Red Highlight Overlay */}
          <path
            d='M 24 2.5 C 24 13.8 14.8 23 3.5 23 C 2.67 23 2 23.67 2 24.5 C 2 25.33 2.67 26 3.5 26 C 14.8 26 24 35.2 24 46.5 C 24 47.33 24.67 48 25.5 48 C 26.33 48 27 47.33 27 46.5 C 27 35.2 36.2 26 47.5 26 C 48.33 26 49 25.33 49 24.5 C 49 23.67 48.33 23 47.5 23 C 36.2 23 27 13.8 27 2.5 C 27 1.67 26.33 1 25.5 1 C 24.67 1 24 1.67 24 2.5 Z'
            fill='url(#geminiTopRed)'
          />

          {/* 3. Right Blue Flare Overlay */}
          <path
            d='M 24 2.5 C 24 13.8 14.8 23 3.5 23 C 2.67 23 2 23.67 2 24.5 C 2 25.33 2.67 26 3.5 26 C 14.8 26 24 35.2 24 46.5 C 24 47.33 24.67 48 25.5 48 C 26.33 48 27 47.33 27 46.5 C 27 35.2 36.2 26 47.5 26 C 48.33 26 49 25.33 49 24.5 C 49 23.67 48.33 23 47.5 23 C 36.2 23 27 13.8 27 2.5 C 27 1.67 26.33 1 25.5 1 C 24.67 1 24 1.67 24 2.5 Z'
            fill='url(#geminiRightBlue)'
          />

          {/* 4. Bottom Green Flare Overlay */}
          <path
            d='M 24 2.5 C 24 13.8 14.8 23 3.5 23 C 2.67 23 2 23.67 2 24.5 C 2 25.33 2.67 26 3.5 26 C 14.8 26 24 35.2 24 46.5 C 24 47.33 24.67 48 25.5 48 C 26.33 48 27 47.33 27 46.5 C 27 35.2 36.2 26 47.5 26 C 48.33 26 49 25.33 49 24.5 C 49 23.67 48.33 23 47.5 23 C 36.2 23 27 13.8 27 2.5 C 27 1.67 26.33 1 25.5 1 C 24.67 1 24 1.67 24 2.5 Z'
            fill='url(#geminiBottomGreen)'
          />

          {/* 5. Left Yellow Flare Overlay */}
          <path
            d='M 24 2.5 C 24 13.8 14.8 23 3.5 23 C 2.67 23 2 23.67 2 24.5 C 2 25.33 2.67 26 3.5 26 C 14.8 26 24 35.2 24 46.5 C 24 47.33 24.67 48 25.5 48 C 26.33 48 27 47.33 27 46.5 C 27 35.2 36.2 26 47.5 26 C 48.33 26 49 25.33 49 24.5 C 49 23.67 48.33 23 47.5 23 C 36.2 23 27 13.8 27 2.5 C 27 1.67 26.33 1 25.5 1 C 24.67 1 24 1.67 24 2.5 Z'
            fill='url(#geminiLeftYellow)'
          />

          {/* 6. Center 3D Specular Sheen */}
          <path
            d='M 24 2.5 C 24 13.8 14.8 23 3.5 23 C 2.67 23 2 23.67 2 24.5 C 2 25.33 2.67 26 3.5 26 C 14.8 26 24 35.2 24 46.5 C 24 47.33 24.67 48 25.5 48 C 26.33 48 27 47.33 27 46.5 C 27 35.2 36.2 26 47.5 26 C 48.33 26 49 25.33 49 24.5 C 49 23.67 48.33 23 47.5 23 C 36.2 23 27 13.8 27 2.5 C 27 1.67 26.33 1 25.5 1 C 24.67 1 24 1.67 24 2.5 Z'
            fill='url(#geminiCenterSpecular)'
          />
        </svg>
      </div>
    </div>
  );
}
