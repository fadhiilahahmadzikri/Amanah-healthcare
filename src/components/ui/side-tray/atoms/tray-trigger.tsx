'use client';

import * as React from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export interface TrayTriggerProps {
  isExpanded: boolean;
  isPinned: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  ariaLabel?: string;
  className?: string;
}

export function TrayTrigger({
  isExpanded,
  isPinned,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ariaLabel = 'Buka panel samping',
  className
}: TrayTriggerProps) {
  const iconRef = React.useRef<SVGSVGElement>(null);

  // Smooth micro-interaction on hover: subtle nudge
  const handleMouseEnter = React.useCallback(() => {
    if (iconRef.current && !isExpanded) {
      gsap.to(iconRef.current, {
        x: -4,
        duration: 0.18,
        repeat: 1,
        yoyo: true,
        ease: 'power2.out'
      });
    }
    onMouseEnter?.();
  }, [isExpanded, onMouseEnter]);

  const handleMouseLeave = React.useCallback(() => {
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        x: 0,
        duration: 0.15,
        ease: 'power2.out'
      });
    }
    onMouseLeave?.();
  }, [onMouseLeave]);

  return (
    <button
      type='button'
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={ariaLabel}
      aria-expanded={isExpanded}
      className={cn(
        'group relative flex items-center justify-center cursor-pointer select-none transition-all duration-200 outline-none',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isExpanded
          ? 'w-7 h-20 rounded-l-xl bg-card border-y border-l border-border/80 shadow-md text-muted-foreground hover:text-primary hover:bg-muted/40 hover:w-8 hover:shadow-lg'
          : 'w-7 h-24 rounded-l-xl bg-card border-y border-l border-border/80 shadow-md text-muted-foreground hover:text-primary hover:bg-muted/40 hover:w-8 hover:shadow-lg',
        className
      )}
      title={isExpanded ? (isPinned ? 'Lepas kunci panel' : 'Tutup panel') : 'Buka panel samping'}
    >
      {isExpanded ? (
        <div className='flex flex-col items-center justify-center gap-1.5'>
          <ChevronsRight
            ref={iconRef}
            className='size-4 text-muted-foreground group-hover:text-primary transition-colors'
          />
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center gap-1.5'>
          <ChevronsLeft
            ref={iconRef}
            className='size-4 text-muted-foreground group-hover:text-primary transition-colors'
          />
          <div className='size-1.5 rounded-full bg-primary/70 animate-pulse' />
        </div>
      )}
    </button>
  );
}
