'use client';

import type { ServiceCategoryContext } from '../../types';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useRef } from 'react';
import { cn } from '@/features/public-site/lib/helpers';
import { ServiceContextItem } from '../atoms/ServiceContextItem';

type ServiceStickyIndicatorProps = {
  activeContext: ServiceCategoryContext;
  onSelectContext: (context: ServiceCategoryContext) => void;
  className?: string;
};

export function ServiceStickyIndicator({
  activeContext,
  onSelectContext,
  className
}: ServiceStickyIndicatorProps) {
  const isGeneral = activeContext === 'general-practitioner';
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) {
      return;
    }
    const touchEndX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = touchEndX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (deltaX < -40 && isGeneral) {
      onSelectContext('midwifery');
    } else if (deltaX > 40 && !isGeneral) {
      onSelectContext('general-practitioner');
    }
  };

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
            transform: isGeneral ? 'translateX(0%)' : 'translateX(-100%)'
          }}
        >
          <div
            data-testid='mobile-slot-general'
            aria-hidden={!isGeneral}
            className={cn(
              `
                group relative flex w-full shrink-0 items-center justify-between
                text-left transition-colors
              `,
              isGeneral
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
                isGeneral
                  ? `
                    bg-amanah-sky opacity-100
                    dark:bg-white
                  `
                  : `opacity-0`
              )}
            />

            <button
              type='button'
              data-testid='mobile-general-button'
              aria-label='Dokter Umum aktif, pindah ke Pelayanan Bidan'
              aria-current={isGeneral ? 'true' : undefined}
              disabled={!isGeneral}
              onClick={() => onSelectContext('midwifery')}
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
                  Dokter Umum
                </span>
                <span
                  className='
                  truncate text-[11px] font-normal text-primary-foreground/80
                  sm:text-xs
                  dark:text-white/80
                '
                >
                  Pelayanan Dasar
                </span>
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

          <div
            data-testid='mobile-slot-midwifery'
            aria-hidden={isGeneral}
            className={cn(
              `
                group relative flex w-full shrink-0 items-center justify-between
                text-left transition-colors
              `,
              !isGeneral
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
                !isGeneral
                  ? `
                    bg-amanah-sky opacity-100
                    dark:bg-white
                  `
                  : `opacity-0`
              )}
            />

            <button
              type='button'
              data-testid='mobile-midwifery-button'
              aria-label='Pelayanan Bidan aktif, pindah ke Dokter Umum'
              aria-current={!isGeneral ? 'true' : undefined}
              disabled={isGeneral}
              onClick={() => onSelectContext('general-practitioner')}
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
                  Pelayanan Bidan
                </span>
                <span
                  className='
                  truncate text-[11px] font-normal text-primary-foreground/80
                  sm:text-xs
                  dark:text-white/80
                '
                >
                  Kesehatan Ibu & Anak
                </span>
              </div>
              <ArrowLeftIcon
                aria-hidden
                className='
                  size-4 shrink-0 text-primary-foreground/90
                  dark:text-white/90
                '
              />
            </button>
          </div>
        </div>
      </div>

      <div
        className='
        hidden
        lg:flex lg:flex-col lg:divide-y lg:divide-line lg:border-y
        lg:border-line lg:bg-background
      '
      >
        <ServiceContextItem
          label='Dokter Umum'
          sublabel='Pelayanan Dasar'
          isActive={isGeneral}
          onClick={() => onSelectContext('general-practitioner')}
        />
        <ServiceContextItem
          label='Pelayanan Bidan'
          sublabel='Kesehatan Ibu & Anak'
          isActive={!isGeneral}
          onClick={() => onSelectContext('midwifery')}
        />
      </div>
    </nav>
  );
}
