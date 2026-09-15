'use client';

import * as React from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export interface QuestionnaireAccordionPrimitiveProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export function QuestionnaireAccordionPrimitive({
  isOpen,
  children,
  className,
  duration = 0.26
}: QuestionnaireAccordionPrimitiveProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isInitialMount = React.useRef(true);

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (isOpen) {
        gsap.set(el, { height: 'auto', opacity: 1, display: 'block' });
      } else {
        gsap.set(el, { height: 0, opacity: 0, display: 'none' });
      }
      return;
    }

    gsap.killTweensOf(el);

    if (isOpen) {
      el.style.display = 'block';
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          duration,
          ease: 'power2.out',
          clearProps: 'height'
        }
      );
    } else {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: duration * 0.85,
        ease: 'power2.inOut',
        onComplete: () => {
          if (el) {
            el.style.display = 'none';
          }
        }
      });
    }
  }, [isOpen, duration]);

  return (
    <div ref={containerRef} style={{ overflow: 'hidden' }} className={cn('w-full', className)}>
      <div className='py-2'>{children}</div>
    </div>
  );
}
