'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Plasma3DLogoProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  className?: string;
  isHovered?: boolean;
}

export function Plasma3DLogo({ size, width, height, className }: Plasma3DLogoProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (customElements.get('plasma-scene')) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="plasma-scene.runtime.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      if (customElements.get('plasma-scene')) {
        setIsLoaded(true);
      }
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/assets/plasma/plasma-scene.runtime.js';
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);
  }, []);

  const w = width ?? size;
  const h = height ?? size;

  const styleObj: React.CSSProperties = {
    ...(w !== undefined ? { width: typeof w === 'number' ? `${w}px` : w } : {}),
    ...(h !== undefined ? { height: typeof h === 'number' ? `${h}px` : h } : {})
  };

  return (
    <div
      style={styleObj}
      className={cn(
        'relative flex items-center justify-center select-none shrink-0 pointer-events-auto overflow-visible',
        className
      )}
    >
      {/* Ambient Radial Bloom Light that bleeds naturally into the parent wrapper */}
      <div className='absolute inset-[-15%] rounded-full bg-gradient-to-tr from-cyan-400/20 via-purple-500/20 to-pink-500/20 blur-2xl pointer-events-none opacity-80' />

      {isLoaded ? (
        React.createElement('plasma-scene', {
          background: 'transparent',
          src: '/assets/plasma/scene.json',
          style: {
            width: '100%',
            height: '100%',
            display: 'block',
            background: 'transparent',
            overflow: 'visible'
          }
        })
      ) : (
        <div className='size-full animate-pulse bg-primary/10 rounded-full' />
      )}
    </div>
  );
}
