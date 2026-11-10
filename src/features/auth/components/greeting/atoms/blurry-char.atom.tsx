import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BlurryCharProps {
  char: string;
  className?: string;
}

export const BlurryChar = React.forwardRef<HTMLSpanElement, BlurryCharProps>(
  ({ char, className }, ref) => {
    const isSpace = char === ' ';
    return (
      <span
        ref={ref}
        className={cn(
          'inline-block will-change-[transform,opacity,filter]',
          isSpace && 'w-[0.28em]',
          className
        )}
      >
        {isSpace ? '\u00A0' : char}
      </span>
    );
  }
);

BlurryChar.displayName = 'BlurryChar';
