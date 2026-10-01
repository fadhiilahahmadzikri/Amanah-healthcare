'use client';

import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { cn } from '@/lib/utils';

export interface DoctorGridCalendarAccordionProps {
  isOpen: boolean;
  formattedTargetDate: string;
  activeYear: number;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
  className?: string;
  duration?: number;
}

export function DoctorGridCalendarAccordion({
  isOpen,
  formattedTargetDate,
  activeYear,
  onSelectDate,
  onClose,
  className,
  duration = 0.28
}: DoctorGridCalendarAccordionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useLayoutEffect(() => {
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
        duration: duration * 0.8,
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
    <div
      ref={containerRef}
      style={{ overflow: 'hidden' }}
      className={cn('w-full border-b border-border/40 bg-muted/10 font-sans', className)}
    >
      <div className='p-3 sm:p-4 w-full'>
        <div className='w-full bg-background rounded-2xl border border-border/60 p-3 sm:p-4 shadow-xs'>
          <CustomCalendar
            value={formattedTargetDate}
            className='w-full'
            minYear={activeYear - 1}
            maxYear={activeYear + 2}
            onChange={(_iso, d) => {
              onSelectDate(d);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
