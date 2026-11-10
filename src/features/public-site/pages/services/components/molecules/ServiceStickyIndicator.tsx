'use client';

import { ArrowRightIcon } from 'lucide-react';
import { useRef } from 'react';
import { cn } from '@/features/public-site/lib/helpers';
import { ServiceContextItem } from '../atoms/ServiceContextItem';

export type ServiceStickyIndicatorItem = {
  id: string;
  label: string;
  sublabel?: string;
};

type ServiceStickyIndicatorProps = {
  items: ServiceStickyIndicatorItem[];
  activeContext: string;
  onSelectContext: (contextId: string) => void;
  className?: string;
};

export function ServiceStickyIndicator({
  items,
  activeContext,
  onSelectContext,
  className
}: ServiceStickyIndicatorProps) {
  const currentIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeContext)
  );
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || items.length <= 1) {
      return;
    }
    const touchEndX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = touchEndX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (deltaX < -40) {
      const nextIndex = (currentIndex + 1) % items.length;
      onSelectContext(items[nextIndex].id);
    } else if (deltaX > 40) {
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      onSelectContext(items[prevIndex].id);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label='Konteks Layanan' className={cn('w-full', className)}>
      <div
        data-testid='mobile-slot-shell'
        className='
          relative w-full overflow-hidden border-y border-line bg-background
          shadow-xs select-none
          lg:hidden
        '
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          data-testid='mobile-slot-track'
          className='
            flex w-full transition-transform duration-500
            ease-[cubic-bezier(0.2,1,0.3,1)]
          '
          style={{
            transform: `translateX(-${currentIndex * 100}%)`
          }}
        >
          {items.map((item, idx) => {
            const isItemActive = idx === currentIndex;
            const nextItem = items[(idx + 1) % items.length];

            return (
              <div
                key={item.id}
                data-testid={`mobile-slot-${item.id}`}
                aria-hidden={!isItemActive}
                className={cn(
                  `
                    group relative flex w-full shrink-0 items-center justify-between
                    text-left transition-colors
                  `,
                  isItemActive
                    ? `
                      bg-primary text-primary-foreground shadow-xs
                      dark:bg-amanah-blue dark:text-white
                    `
                    : 'bg-background text-muted-foreground'
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    `
                      pointer-events-none absolute inset-x-0 bottom-0 h-0.5
                      transition-opacity duration-300
                    `,
                    isItemActive
                      ? `
                        bg-amanah-sky opacity-100
                        dark:bg-white
                      `
                      : 'opacity-0'
                  )}
                />

                <button
                  type='button'
                  data-testid={`mobile-btn-${item.id}`}
                  aria-label={`${item.label} aktif, pindah ke ${nextItem.label}`}
                  aria-current={isItemActive ? 'true' : undefined}
                  disabled={!isItemActive}
                  onClick={() => onSelectContext(nextItem.id)}
                  className='
                    flex w-full min-w-0 cursor-pointer items-center justify-between
                    gap-3 px-4 py-3 text-left
                    disabled:pointer-events-none
                    sm:px-5 sm:py-3.5
                  '
                >
                  <div className='flex min-w-0 flex-col'>
                    <span
                      className='
                      truncate text-xs font-semibold
                      sm:text-sm
                    '
                    >
                      {item.label}
                    </span>
                    {item.sublabel && (
                      <span
                        className='
                          truncate text-[11px] font-normal text-primary-foreground/80
                          sm:text-xs
                          dark:text-white/80
                        '
                      >
                        {item.sublabel}
                      </span>
                    )}
                  </div>
                  <ArrowRightIcon
                    aria-hidden
                    className='
                      size-4 shrink-0 text-primary-foreground/90
                      dark:text-white/90
                    '
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className='
        hidden
        lg:flex lg:flex-col lg:divide-y lg:divide-line lg:border-y
        lg:border-line lg:bg-background
      '
      >
        {items.map((item) => (
          <ServiceContextItem
            key={item.id}
            label={item.label}
            sublabel={item.sublabel}
            isActive={activeContext === item.id}
            onClick={() => onSelectContext(item.id)}
          />
        ))}
      </div>
    </nav>
  );
}
