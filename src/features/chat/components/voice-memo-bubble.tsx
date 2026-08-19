'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface VoiceMemoBubbleProps {
  duration?: string;
  isOutbound?: boolean;
}

export function VoiceMemoBubble({ duration = '0:24', isOutbound = true }: VoiceMemoBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div
      className={cn(
        'rounded-[8px] px-3 py-1.5 flex items-center gap-2 select-none shadow-2xs',
        isOutbound
          ? 'bg-primary text-primary-foreground'
          : 'bg-card border border-border text-foreground'
      )}
    >
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className={cn(
          'size-5 rounded-full flex items-center justify-center transition-transform hover:scale-105',
          isOutbound ? 'bg-white/20 text-white' : 'bg-muted text-foreground'
        )}
      >
        {isPlaying ? (
          <Icons.pause className='size-2.5 fill-current' />
        ) : (
          <Icons.media className='size-2.5 fill-current ml-0.5' />
        )}
      </button>

      {/* Sound Waveform Bars */}
      <div className='flex items-center gap-0.5 h-3.5'>
        {[2, 3, 1.5, 3.5, 2, 3.5, 1.5, 2.5, 3, 2].map((height, i) => (
          <span
            key={i}
            className={cn(
              'w-[2px] rounded-full transition-all duration-300',
              isOutbound ? 'bg-white/90' : 'bg-foreground/70',
              isPlaying ? 'animate-pulse' : ''
            )}
            style={{
              height: `${height * 3}px`,
              animationDelay: `${i * 75}ms`
            }}
          />
        ))}
      </div>

      <span className='text-[10px] font-mono ml-1 opacity-90 tabular-nums'>{duration}</span>
    </div>
  );
}
