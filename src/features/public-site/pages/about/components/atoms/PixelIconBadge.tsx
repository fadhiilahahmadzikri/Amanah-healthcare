import type { PixelFeatureIcon } from '../../types';
import Image from 'next/image';
import { cn } from '@/features/public-site/lib/helpers';

type PixelIconBadgeProps = {
  className?: string;
  icon: PixelFeatureIcon;
  size?: number;
};

export function PixelIconBadge({ className, icon, size = 40 }: PixelIconBadgeProps) {
  return (
    <div
      className={cn('relative flex items-center justify-center select-none', className)}
      style={{
        height: size,
        imageRendering: 'pixelated',
        width: size
      }}
    >
      <Image
        alt={icon.alt}
        className='size-full object-contain [image-rendering:pixelated]'
        height={size}
        src={icon.src}
        unoptimized
        width={size}
      />
    </div>
  );
}
