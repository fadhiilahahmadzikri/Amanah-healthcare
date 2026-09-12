'use client';

import { ArrowRight } from 'lucide-react';
import { cn } from '@/features/public-site/lib/helpers';

type MarqueeArrowIndicatorProps = {
  className?: string;
};

export function MarqueeArrowIndicator({ className }: MarqueeArrowIndicatorProps) {
  return (
    <span
      aria-hidden='true'
      className={cn('inline-flex items-center gap-1 text-foreground/50', className)}
    >
      <style>
        {`
        @keyframes marqueeArrowCascade {
          0%, 100% {
            opacity: 0.3;
            transform: translateX(0);
            color: currentColor;
          }
          50% {
            opacity: 1;
            transform: translateX(2px);
            color: var(--color-foreground, #13195c);
          }
        }
      `}
      </style>
      <ArrowRight
        className='size-3.5 stroke-[2.4]'
        style={{ animation: 'marqueeArrowCascade 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite 0s' }}
      />
      <ArrowRight
        className='size-3.5 stroke-[2.4]'
        style={{
          animation: 'marqueeArrowCascade 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.22s'
        }}
      />
      <ArrowRight
        className='size-3.5 stroke-[2.4]'
        style={{
          animation: 'marqueeArrowCascade 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.44s'
        }}
      />
    </span>
  );
}
