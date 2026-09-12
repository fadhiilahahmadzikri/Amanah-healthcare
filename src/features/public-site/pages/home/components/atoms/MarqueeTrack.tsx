'use client';

import type { ReactNode } from 'react';
import { cn } from '@/features/public-site/lib/helpers';

type MarqueeTrackProps = {
  children: ReactNode;
  className?: string;
  direction?: 'left' | 'right';
  durationSeconds?: number;
  gapClassName?: string;
  pauseOnHover?: boolean;
  repeat?: number;
};

export function MarqueeTrack({
  children,
  className,
  direction = 'left',
  durationSeconds = 50,
  gapClassName = 'gap-4 sm:gap-6',
  pauseOnHover = true,
  repeat = 4
}: MarqueeTrackProps) {
  const isLeft = direction === 'left';
  const animationName = isLeft ? 'amanahMarqueeLeft' : 'amanahMarqueeRight';

  return (
    <div className={cn('group flex w-full overflow-hidden select-none', className)}>
      {/* Single animated container holding all repeated tracks to prevent any compositor/timing drift */}
      <div
        className={cn(
          'flex shrink-0 items-stretch will-change-transform',
          pauseOnHover &&
            `
            group-hover:[animation-play-state:paused]
            group-hover/marquee-section:[animation-play-state:paused]
          `,
          'motion-reduce:[animation-play-state:paused]'
        )}
        style={{
          animation: `${animationName} ${durationSeconds}s linear infinite`
        }}
      >
        {Array.from({ length: repeat }).map((_, index) => (
          <div
            key={index}
            aria-hidden={index > 0 ? true : undefined}
            className={cn('flex shrink-0 items-stretch py-1 pr-4 sm:pr-6', gapClassName)}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
