import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TypingCursorProps {
  className?: string;
}

export function TypingCursor({ className }: TypingCursorProps) {
  return (
    <span
      aria-hidden='true'
      className={cn(
        'inline-block w-[2.5px] h-[0.85em] bg-primary align-middle ml-1 rounded-xs animate-pulse select-none',
        className
      )}
    />
  );
}
