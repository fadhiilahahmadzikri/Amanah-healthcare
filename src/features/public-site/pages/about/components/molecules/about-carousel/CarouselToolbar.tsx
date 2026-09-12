import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/features/public-site/lib/helpers';

type CarouselToolbarProps = {
  className?: string;
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onSelectSlide: (index: number) => void;
  totalSlides: number;
};

export function CarouselToolbar({
  className,
  currentIndex,
  onNext,
  onPrevious,
  onSelectSlide,
  totalSlides
}: CarouselToolbarProps) {
  return (
    <div
      className={cn(
        `
          relative mt-4 flex w-full items-center justify-between px-4
          md:static md:mt-0 md:block md:p-0
        `,
        className
      )}
    >
      {/*
        Slide Indicators:
        - Mobile (< md): Sits on the bottom-left of the controls row in a theme-respecting pill
        - Desktop (>= md): Floating centered at the bottom edge of the carousel podium
      */}
      <div
        className='
          flex items-center gap-1.5 rounded-full border border-line/70
          bg-card/90 px-3.5 py-1.5 shadow-xs backdrop-blur-md
          dark:border-line/50 dark:bg-card/80
          md:pointer-events-none md:absolute md:inset-x-0 md:bottom-4 md:z-40
          md:mx-auto md:w-fit md:sm:bottom-6
        '
      >
        {Array.from({ length: totalSlides }).map((_, index) => {
          const isActive = index === currentIndex;

          return (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              type='button'
              aria-label={`Go to slide ${index + 1}`}
              className='
                pointer-events-auto flex h-5 shrink-0 cursor-pointer items-center
                justify-center p-0.5 focus:outline-none
              '
              onClick={() => onSelectSlide(index)}
            >
              <span
                className={cn(
                  'block h-1.5 rounded-full transition-all duration-300',
                  isActive
                    ? 'w-7 bg-primary shadow-xs'
                    : 'size-1.5 bg-foreground/35 hover:bg-foreground/75'
                )}
              />
            </button>
          );
        })}
      </div>

      {/*
        Navigation Controls:
        - Mobile (< md): Two circular chevron buttons side-by-side on the right
        - Desktop (>= md): Floating circular chevron buttons at left & right edges
      */}
      <div
        className='
          flex items-center gap-2
          md:pointer-events-none md:absolute md:inset-x-2 md:top-1/2 md:z-40
          md:-translate-y-1/2 md:items-center md:justify-between md:gap-0
          md:sm:inset-x-4 md:md:-inset-x-6
        '
      >
        <button
          type='button'
          aria-label='Previous Slide'
          className='
            group pointer-events-auto flex size-10 cursor-pointer items-center
            justify-center rounded-full border border-line/70 bg-card/90
            text-foreground shadow-xs backdrop-blur-md transition-all
            duration-300
            hover:scale-105 hover:border-primary/40 hover:bg-muted active:scale-95
            sm:size-11
            dark:border-line/50 dark:bg-card/80
            md:size-12
          '
          onClick={onPrevious}
        >
          <ChevronLeft className='size-5 transition-transform group-hover:-translate-x-0.5' />
        </button>

        <button
          type='button'
          aria-label='Next Slide'
          className='
            group pointer-events-auto flex size-10 cursor-pointer items-center
            justify-center rounded-full border border-line/70 bg-card/90
            text-foreground shadow-xs backdrop-blur-md transition-all
            duration-300
            hover:scale-105 hover:border-primary/40 hover:bg-muted active:scale-95
            sm:size-11
            dark:border-line/50 dark:bg-card/80
            md:size-12
          '
          onClick={onNext}
        >
          <ChevronRight className='size-5 transition-transform group-hover:translate-x-0.5' />
        </button>
      </div>
    </div>
  );
}
