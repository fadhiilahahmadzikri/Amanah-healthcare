'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface QueueClippathToasterProps {
  title?: string;
  onClick?: () => void;
  className?: string;
}

export const QueueClippathToaster = forwardRef<HTMLDivElement, QueueClippathToasterProps>(
  function QueueClippathToaster({ title = 'Antrean berhasil dibuat', onClick, className }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'notch-wrapper absolute top-0 left-0 w-full z-20 pointer-events-auto filter drop-shadow-[0_3px_8px_rgba(15,23,42,0.06)] select-none',
          className
        )}
      >
        <button
          type='button'
          onClick={onClick}
          aria-label={title}
          className='relative w-full h-[38px] flex items-center justify-center gap-2.5 px-3 cursor-pointer border-none bg-transparent outline-none text-decoration-none whitespace-nowrap'
        >
          {/* Exact Full-width Seamless S-curve Notch Tab Background */}
          <svg
            viewBox='0 0 360 118'
            preserveAspectRatio='none'
            className='absolute top-0 left-0 w-full h-[118px] -mt-[80px] pointer-events-none'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M 0,0 L 360,0 L 360,80 L 325,80 C 305,80 295,88 285,100 C 275,112 265,118 245,118 L 115,118 C 95,118 85,112 75,100 C 65,88 55,80 35,80 L 0,80 Z'
              style={{ fill: '#ffffff' }}
              className='transition-colors duration-200'
            />
          </svg>

          {/* Notch Content (Checkmark Badge + Status Text) */}
          <div className='relative z-10 flex items-center justify-center gap-2 pt-0.5'>
            <div
              style={{ backgroundColor: 'var(--success, #00ca72)' }}
              className='size-5 rounded-full flex items-center justify-center shadow-xs shrink-0'
            >
              <svg
                viewBox='0 0 16 16'
                className='size-[11px] stroke-white stroke-[2.8] fill-none'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <polyline points='3.5,8.5 6.5,11.5 12.5,4.5' />
              </svg>
            </div>

            <span className='text-[13px] font-semibold text-slate-600 tracking-[-0.1px] whitespace-nowrap'>
              {title}
            </span>
          </div>
        </button>
      </div>
    );
  }
);

QueueClippathToaster.displayName = 'QueueClippathToaster';
