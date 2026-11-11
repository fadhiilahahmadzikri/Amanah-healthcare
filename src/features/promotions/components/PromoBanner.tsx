'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePromotions } from '../context/PromotionsContext';

interface PromoBannerProps {
  className?: string;
}

export function PromoBanner({ className }: PromoBannerProps) {
  const { activeBannerPromo, dismissBanner } = usePromotions();

  if (!activeBannerPromo) {
    return null;
  }

  const promo = activeBannerPromo;

  return (
    <aside
      role='region'
      aria-label='Pengumuman Klinik'
      className={cn(
        'sticky top-0 z-40 w-full border-b border-primary/20 bg-primary text-primary-foreground shadow-xs transition-all duration-200',
        className
      )}
    >
      <div className='mx-auto flex min-h-[42px] max-w-[1300px] items-center justify-between gap-3 px-4 py-2 sm:px-6'>
        <Link
          href={`/promosi/${promo.id}`}
          className='flex flex-1 items-center gap-2.5 overflow-hidden text-xs sm:text-sm font-medium hover:opacity-95 transition-opacity'
        >
          <span className='truncate font-semibold text-primary-foreground'>
            {promo.title}
          </span>

          <span className='hidden md:inline-block text-primary-foreground/80 truncate'>
            — {promo.summary}
          </span>
        </Link>

        <div className='flex items-center gap-3 shrink-0'>
          <Link
            href={`/promosi/${promo.id}`}
            className='inline-flex items-center gap-1 rounded-md bg-primary-foreground px-2.5 py-1 text-xs font-semibold text-primary shadow-xs hover:bg-primary-foreground/90 transition-colors'
          >
            <span>{promo.cta?.label || 'Pelajari'}</span>
            <ArrowRight className='size-3' />
          </Link>

          <button
            type='button'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dismissBanner(promo.id);
            }}
            aria-label='Tutup pengumuman'
            className='inline-flex size-6 items-center justify-center rounded-full text-primary-foreground/80 hover:bg-primary-foreground/20 hover:text-primary-foreground transition-colors cursor-pointer'
          >
            <X className='size-3.5' />
          </button>
        </div>
      </div>
    </aside>
  );
}
