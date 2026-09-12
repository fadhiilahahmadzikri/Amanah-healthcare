'use client';

import { ArrowDown } from 'lucide-react';
import { cn } from '@/features/public-site/lib/helpers';

type DirectionalArrowIndicatorProps = {
  className?: string;
};

export function DirectionalArrowIndicator({ className }: DirectionalArrowIndicatorProps) {
  return (
    <div
      aria-hidden='true'
      className={cn('flex flex-col items-center gap-2.5 text-foreground/35', className)}
    >
      <style>
        {`
        @keyframes arrowGameGlow {
          0%, 100% {
            opacity: 0.25;
            color: currentColor;
            transform: translateY(0);
            filter: drop-shadow(0 0 0 transparent);
          }
          50% {
            opacity: 1;
            color: var(--color-amanah-blue, #3171de);
            transform: translateY(3px);
            filter: drop-shadow(0 0 8px var(--color-amanah-blue, #3171de));
          }
        }
      `}
      </style>
      <ArrowDown
        className='size-4 stroke-[2.2]'
        style={{ animation: 'arrowGameGlow 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite 0s' }}
      />
      <ArrowDown
        className='size-4 stroke-[2.2]'
        style={{ animation: 'arrowGameGlow 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.24s' }}
      />
      <ArrowDown
        className='size-4 stroke-[2.2]'
        style={{ animation: 'arrowGameGlow 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.48s' }}
      />
    </div>
  );
}
