'use client';

import * as React from 'react';
import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { normalizeImageUrl } from '../lib/image';

interface PromoImageProps {
  src?: string | null;
  alt?: string;
  fallbackTitle?: string;
  fallbackSummary?: string;
  className?: string;
  aspectRatio?: 'video' | 'wide' | 'square';
  priority?: boolean;
}

export function PromoImage({
  src,
  alt = 'Promosi Layanan Klinik',
  fallbackTitle,
  fallbackSummary,
  className,
  aspectRatio = 'video',
  priority = false,
}: PromoImageProps) {
  const [hasError, setHasError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const normalizedSrc = React.useMemo(() => {
    if (!src) return '';
    return normalizeImageUrl(src);
  }, [src]);

  // Reset error state if src changes
  React.useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [normalizedSrc]);

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'wide'
        ? 'aspect-[21/9]'
        : 'aspect-square';

  // If no source or image loading failed: Render graceful text-only visual
  if (!normalizedSrc || hasError) {
    return (
      <div
        className={cn(
          'relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50 p-6 text-center text-primary-foreground shadow-inner',
          aspectClass,
          className
        )}
      >
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none' />
        <div className='relative z-10 flex flex-col items-center gap-2 max-w-md px-4'>
          <div className='flex size-10 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur-xs'>
            <Tag className='size-5 text-primary-foreground' />
          </div>
          {fallbackTitle ? (
            <h4 className='text-lg font-bold tracking-tight text-primary-foreground line-clamp-2'>
              {fallbackTitle}
            </h4>
          ) : (
            <h4 className='text-base font-semibold tracking-tight text-primary-foreground/90'>
              Amanah Healthcare
            </h4>
          )}
          {fallbackSummary ? (
            <p className='text-xs text-primary-foreground/80 line-clamp-2'>
              {fallbackSummary}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-muted/40',
        aspectClass,
        className
      )}
    >
      {/* Skeleton while loading */}
      {!isLoaded ? (
        <div className='absolute inset-0 animate-pulse bg-muted/60' />
      ) : null}

      {/* Actual image with referrerpolicy and async decoding */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={normalizedSrc}
        alt={alt}
        referrerPolicy='no-referrer'
        loading={priority ? 'eager' : 'lazy'}
        decoding='async'
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          'size-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}
