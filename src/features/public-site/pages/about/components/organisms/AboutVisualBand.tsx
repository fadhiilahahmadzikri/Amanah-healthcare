import type { AboutVisualBandData } from '../../types';
import Image from 'next/image';
import { cn } from '@/features/public-site/lib/helpers';
import { DirectionalArrowIndicator } from '../atoms/DirectionalArrowIndicator';

type AboutVisualBandProps = {
  className?: string;
  data: AboutVisualBandData;
};

export function AboutVisualBand({ className, data }: AboutVisualBandProps) {
  return (
    <section className={cn('w-full border-b border-line bg-background', className)}>
      <div
        className='
        grid grid-cols-1
        lg:grid-cols-12
      '
      >
        {/* Left Column: ~70% (8/12 cols) with panoramic visual */}
        <div
          className='
            border-b border-line p-3
            sm:p-4
            lg:col-span-8 lg:border-r lg:border-b-0 lg:p-4
          '
        >
          <figure
            className='
            relative h-[180px] w-full overflow-hidden border border-line
            bg-muted/20
            sm:h-[220px]
            lg:h-[230px]
          '
          >
            <Image
              src={data.image.src}
              alt={data.image.alt}
              fill
              sizes='(min-width: 1280px) 860px, (min-width: 1024px) 68vw, 100vw'
              className='object-cover object-center'
            />
          </figure>
        </div>

        {/* Right Column: ~30% (4/12 cols) with vertical downward directional cue */}
        <div
          className='
            flex items-center justify-start p-6
            sm:px-8
            lg:col-span-4 lg:py-0 lg:pl-10
          '
        >
          <DirectionalArrowIndicator />
        </div>
      </div>
    </section>
  );
}
