import type { AssetImage } from '@/features/public-site/components/shared/types';
import Image from 'next/image';
import { cn } from '@/features/public-site/lib/helpers';

type EditorialInsetFrameProps = {
  className?: string;
  image: AssetImage;
  priority?: boolean;
};

export function EditorialInsetFrame({
  className,
  image,
  priority = false
}: EditorialInsetFrameProps) {
  return (
    <figure
      data-editorial-frame
      className={cn(
        `
          flex w-full items-center justify-center p-6 will-change-transform
          sm:p-10
          lg:p-14
        `,
        className
      )}
    >
      <div
        data-editorial-image
        className='
          relative aspect-4/3 w-full max-w-[480px] overflow-hidden border
          border-line bg-muted/20 will-change-transform
          sm:aspect-16/11
        '
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          sizes='(min-width: 1280px) 480px, (min-width: 1024px) 40vw, (min-width: 640px) 80vw, 100vw'
          className='object-cover object-center'
        />
      </div>
    </figure>
  );
}
