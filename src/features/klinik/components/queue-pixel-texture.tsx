'use client';

import React from 'react';
import { PixelTexture, PixelTextureProps } from '@/components/ui/pixel-texture';

export interface QueuePixelTextureProps extends Partial<PixelTextureProps> {
  className?: string;
  height?: number | string;
  opacity?: number;
}

export function QueuePixelTexture({
  className,
  height = 34,
  opacity = 0.55,
  colorMode = 'theme',
  maskVariant = 'fade-top',
  invertMask = false,
  ...rest
}: QueuePixelTextureProps) {
  return (
    <div
      style={{ height }}
      className='absolute bottom-0 left-0 right-0 pointer-events-none z-1 select-none overflow-hidden'
    >
      <PixelTexture
        colorMode={colorMode}
        maskVariant={maskVariant}
        invertMask={invertMask}
        opacity={opacity}
        height='100%'
        className={className}
        {...rest}
      />
    </div>
  );
}
