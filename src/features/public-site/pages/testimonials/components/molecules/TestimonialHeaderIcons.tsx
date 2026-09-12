import type { TestimonialPixelIcon } from '../../types';
import { PixelIcon } from '@/features/public-site/components/shared';

type TestimonialHeaderIconsProps = {
  icons: readonly TestimonialPixelIcon[];
};

export function TestimonialHeaderIcons({ icons }: TestimonialHeaderIconsProps) {
  return (
    <div
      data-header-icons
      className='
        mb-3.5 flex items-center justify-center gap-3 select-none
        sm:gap-4
      '
      aria-hidden
    >
      {icons.map((icon) => (
        <div
          key={icon.name}
          data-header-icon
          className='
            inline-flex shrink-0 items-center justify-center
            will-change-transform
          '
        >
          <PixelIcon
            name={icon.name}
            size='responsive'
            svgClassName='size-10 md:size-8 transition-transform duration-300 hover:scale-110'
            title={icon.title}
          />
        </div>
      ))}
    </div>
  );
}
