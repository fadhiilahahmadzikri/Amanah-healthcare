'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface QueueQrPodProps {
  size?: number;
  code?: string;
  className?: string;
  title?: string;
}

export function QueueQrPod({
  size = 78,
  code,
  className,
  title = 'Scan di Loket'
}: QueueQrPodProps) {
  return (
    <div
      title={title}
      style={{ width: size, height: size }}
      className={cn(
        'rounded-2xl bg-white p-1.5 shadow-md border border-slate-100 flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105 select-none',
        className
      )}
    >
      <svg
        className='w-full h-full block text-slate-900'
        viewBox='0 0 100 100'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <rect width='100' height='100' fill='transparent' />
        {/* Top-Left Finder */}
        <rect x='8' y='8' width='28' height='28' rx='3' fill='currentColor' />
        <rect x='14' y='14' width='16' height='16' rx='1.5' fill='white' />
        <rect x='18' y='18' width='8' height='8' rx='1' fill='currentColor' />

        {/* Top-Right Finder */}
        <rect x='64' y='8' width='28' height='28' rx='3' fill='currentColor' />
        <rect x='70' y='14' width='16' height='16' rx='1.5' fill='white' />
        <rect x='74' y='18' width='8' height='8' rx='1' fill='currentColor' />

        {/* Bottom-Left Finder */}
        <rect x='8' y='64' width='28' height='28' rx='3' fill='currentColor' />
        <rect x='14' y='70' width='16' height='16' rx='1.5' fill='white' />
        <rect x='18' y='74' width='8' height='8' rx='1' fill='currentColor' />

        {/* QR Pattern Modules */}
        <g fill='currentColor'>
          <rect x='40' y='8' width='4' height='4' />
          <rect x='48' y='8' width='4' height='4' />
          <rect x='56' y='8' width='4' height='4' />
          <rect x='8' y='40' width='4' height='4' />
          <rect x='8' y='48' width='4' height='4' />
          <rect x='8' y='56' width='4' height='4' />
          <rect x='40' y='16' width='4' height='4' />
          <rect x='52' y='16' width='4' height='4' />
          <rect x='44' y='24' width='4' height='4' />
          <rect x='48' y='24' width='4' height='4' />
          <rect x='40' y='32' width='4' height='4' />
          <rect x='56' y='32' width='4' height='4' />
          <rect x='16' y='40' width='4' height='4' />
          <rect x='24' y='40' width='4' height='4' />
          <rect x='32' y='40' width='4' height='4' />
          <rect x='40' y='40' width='4' height='4' />
          <rect x='48' y='40' width='4' height='4' />
          <rect x='64' y='40' width='4' height='4' />
          <rect x='76' y='40' width='4' height='4' />
          <rect x='84' y='40' width='4' height='4' />
          <rect x='20' y='48' width='4' height='4' />
          <rect x='28' y='48' width='4' height='4' />
          <rect x='36' y='48' width='4' height='4' />
          <rect x='44' y='48' width='4' height='4' />
          <rect x='56' y='48' width='4' height='4' />
          <rect x='68' y='48' width='4' height='4' />
          <rect x='80' y='48' width='4' height='4' />
          <rect x='16' y='56' width='4' height='4' />
          <rect x='24' y='56' width='4' height='4' />
          <rect x='40' y='56' width='4' height='4' />
          <rect x='48' y='56' width='4' height='4' />
          <rect x='60' y='56' width='4' height='4' />
          <rect x='72' y='56' width='4' height='4' />
          <rect x='84' y='56' width='4' height='4' />
          <rect x='40' y='64' width='4' height='4' />
          <rect x='48' y='64' width='4' height='4' />
          <rect x='56' y='64' width='4' height='4' />
          <rect x='64' y='64' width='4' height='4' />
          <rect x='76' y='64' width='4' height='4' />
          <rect x='84' y='64' width='4' height='4' />
          <rect x='44' y='72' width='4' height='4' />
          <rect x='52' y='72' width='4' height='4' />
          <rect x='68' y='72' width='4' height='4' />
          <rect x='72' y='72' width='4' height='4' />
          <rect x='80' y='72' width='4' height='4' />
          <rect x='40' y='80' width='4' height='4' />
          <rect x='56' y='80' width='4' height='4' />
          <rect x='64' y='80' width='4' height='4' />
          <rect x='76' y='80' width='4' height='4' />
          <rect x='88' y='80' width='4' height='4' />
          <rect x='44' y='88' width='4' height='4' />
          <rect x='48' y='88' width='4' height='4' />
          <rect x='60' y='88' width='4' height='4' />
          <rect x='72' y='88' width='4' height='4' />
          <rect x='80' y='88' width='4' height='4' />
        </g>
      </svg>
    </div>
  );
}
