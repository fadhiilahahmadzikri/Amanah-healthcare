'use client';

import React, { useState, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface AttendanceDigitalClockProps {
  className?: string;
  showIcon?: boolean;
}

export function AttendanceDigitalClock({
  className,
  showIcon = true
}: AttendanceDigitalClockProps) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' WIB'
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2.5 h-8 rounded-md bg-muted/40 border border-border/70 text-xs font-mono font-bold text-foreground shadow-2xs select-none shrink-0',
        className
      )}
    >
      {showIcon && <Icons.clock className='size-3.5 text-primary shrink-0' />}
      <span className='tabular-nums tracking-wide'>{currentTime || '08:00:00 WIB'}</span>
    </div>
  );
}
