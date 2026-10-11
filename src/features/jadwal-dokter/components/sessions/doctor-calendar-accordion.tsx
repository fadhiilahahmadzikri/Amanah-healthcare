'use client';

import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { cn } from '@/lib/utils';

export interface DoctorCalendarAccordionProps {
  isOpen: boolean;
  formattedTargetDate: string;
  activeYear?: number;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
  className?: string;
  duration?: number;
}

export function DoctorCalendarAccordion({
  isOpen,
  formattedTargetDate,
  activeYear: _activeYear,
  onSelectDate,
  onClose,
  className,
  duration = 0.28
}: DoctorCalendarAccordionProps) {
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
        ease: 'power2.in',
        onComplete: () => {
          if (el) el.style.display = 'none';
        }
      });
    }
  }, [isOpen, duration]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'overflow-hidden border-b border-border/40 bg-muted/10 transition-colors',
        className
      )}
      style={{ display: isOpen ? 'block' : 'none' }}
    >
      <div className='p-3 sm:p-4 w-full'>
        <CustomCalendar
          value={formattedTargetDate}
          onChange={(_iso, dateObj) => {
            if (dateObj) {
              onSelectDate(dateObj);
              onClose();
            }
          }}
          className='w-full'
        />
      </div>
    </div>
  );
}
