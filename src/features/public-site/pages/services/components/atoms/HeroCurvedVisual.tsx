'use client';

import Image from 'next/image';
import { cn } from '@/features/public-site/lib/helpers';

export type HeroCurvedVisualProps = {
  src?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  children?: React.ReactNode;
};

/**
 * HeroCurvedVisual
 * Renders the hero visual inside a smooth oval clipping path.
 * - Leaves/botanical elements removed for minimalist elegance.
 * - Stretches 100% full height from top to bottom divider.
 * - Flush against the right rail with smooth organic oval curvature on the left.
 */
export function HeroCurvedVisual({
  src,
  alt = 'Klinik Amanah Layanan Kesehatan',
  className,
  priority = true,
  children
}: HeroCurvedVisualProps) {
  return (
    <div className={cn('relative size-full overflow-hidden select-none', className)}>
      {/* Smooth oval clipped visual window */}
      <div
        className='relative size-full overflow-hidden'
        style={{
          clipPath: 'ellipse(80% 90% at 85% 50%)',
          WebkitClipPath: 'ellipse(80% 90% at 85% 50%)'
        }}
      >
        {children ??
          (src && (
            <Image
              src={src}
              alt={alt}
              fill
              priority={priority}
              sizes='(min-width: 1024px) 40vw, (min-width: 768px) 40vw, 100vw'
              className='object-cover object-center'
            />
          ))}
      </div>
    </div>
  );
}
