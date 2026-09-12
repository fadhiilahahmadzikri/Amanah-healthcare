'use client';

import type { CSSProperties } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { cn } from '@/features/public-site/lib/helpers';
import { ViewportLine } from './ViewportLine';

gsap.registerPlugin(ScrollTrigger);

type TechnicalDividerProps = {
  className?: string;
};

const stripeDividerStyle = {
  backgroundImage: `
    repeating-linear-gradient(
      135deg,
      var(--line) 0 1.5px,
      transparent 1.5px 8px
    )
  `
} satisfies CSSProperties;

export function TechnicalDivider({ className }: TechnicalDividerProps) {
  const dividerRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!stripeRef.current || !dividerRef.current) {
        return;
      }

      gsap.to(stripeRef.current, {
        backgroundPositionX: '120px',
        ease: 'none',
        scrollTrigger: {
          trigger: dividerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5
        }
      });
    },
    { scope: dividerRef }
  );

  return (
    <div ref={dividerRef} aria-hidden className={cn('relative h-8 overflow-visible', className)}>
      <span
        ref={stripeRef}
        className='
          absolute top-px bottom-px left-1/2 w-screen -translate-x-1/2
        '
        style={stripeDividerStyle}
      />
      <ViewportLine position='top' />
      <ViewportLine position='bottom' />
    </div>
  );
}
