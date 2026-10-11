'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import type { BookedPatientItem } from '@/server/contracts/schedules/doctor-schedules.dto';
import type { SessionContext } from '@/features/klinik/components/appointment-card';
import { BookedPatientOuterCard } from '../booked-patient-outer-card';

export interface DoctorSessionPatientCarouselProps {
  patients: BookedPatientItem[];
  isLoading?: boolean;
  onSelectPatient: (patient: BookedPatientItem) => void;
  sessionContext?: SessionContext;
  className?: string;
}

/**
 * Responsive Horizontal Carousel for Doctor Session Patients
 * Renders uniform BookedPatientOuterCard items with horizontal scroll snapping,
 * theme-respecting hover gradient walls, and floating navigation controls.
 */
export function DoctorSessionPatientCarousel({
  patients,
  isLoading = false,
  onSelectPatient,
  sessionContext,
  className
}: DoctorSessionPatientCarouselProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  React.useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, patients.length, isLoading]);

  const scrollTo = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = 300;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div
      className={cn(
        'group/carousel relative w-full font-sans select-none overflow-hidden',
        className
      )}
    >
      {/* Floating Left Gradient Wall & Scroll Trigger (Hover-Activated) */}
      {canScrollLeft && !isLoading && patients.length > 0 && (
        <div className='absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-card via-card/75 to-transparent flex items-center justify-start pl-1 pointer-events-none transition-opacity duration-200'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            shape='pill'
            aria-label='Geser kiri'
            onClick={() => scrollTo('left')}
            className='size-8 rounded-full shadow-md bg-card/90 hover:bg-card border-border/80 text-foreground backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 pointer-events-auto cursor-pointer active:scale-95'
          >
            <Icons.chevronLeft className='size-4' />
          </Button>
        </div>
      )}

      {/* Floating Right Gradient Wall & Scroll Trigger (Hover-Activated) */}
      {canScrollRight && !isLoading && patients.length > 0 && (
        <div className='absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-card via-card/75 to-transparent flex items-center justify-end pr-1 pointer-events-none transition-opacity duration-200'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            shape='pill'
            aria-label='Geser kanan'
            onClick={() => scrollTo('right')}
            className='size-8 rounded-full shadow-md bg-card/90 hover:bg-card border-border/80 text-foreground backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 pointer-events-auto cursor-pointer active:scale-95'
          >
            <Icons.chevronRight className='size-4' />
          </Button>
        </div>
      )}

      {/* Carousel Track */}
      {isLoading ? (
        <div className='flex gap-3 overflow-hidden py-1 px-1'>
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className='w-[280px] sm:w-[300px] h-[190px] shrink-0 rounded-2xl bg-muted/20 animate-pulse border border-border/40 p-4 space-y-3'
            >
              <div className='h-4 bg-muted/60 rounded w-1/2' />
              <div className='h-5 bg-muted/80 rounded w-3/4' />
              <div className='h-3 bg-muted/50 rounded w-full' />
              <div className='h-3 bg-muted/50 rounded w-2/3' />
            </div>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState
          title='Belum ada pasien terdaftar'
          description='Belum ada pasien yang di-assign ke dokter dan ruangan pada sesi ini.'
          className='min-h-[160px] py-4 bg-muted/5 border-dashed border-border/50 rounded-2xl'
          animationClassName='w-28 h-28 sm:w-32 sm:h-32'
        />
      ) : (
        <div
          ref={containerRef}
          className='flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-1 px-1'
        >
          {patients.map((patient) => (
            <div
              key={patient.appointmentId}
              className='w-[280px] sm:w-[300px] shrink-0 snap-start flex flex-col'
            >
              <BookedPatientOuterCard
                patient={patient}
                sessionContext={sessionContext}
                onSelect={onSelectPatient}
                className='h-full shadow-2xs hover:shadow-sm'
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
