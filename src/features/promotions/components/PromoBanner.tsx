'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, X } from 'lucide-react';
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
        <div className='flex flex-1 items-center gap-2.5 overflow-hidden text-xs sm:text-sm font-medium'>
          <span className='inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[11px] font-semibold text-primary-foreground tracking-wide shrink-0'>
            <Sparkles className='size-3' />
            {promo.serviceName ? promo.serviceName : 'Info Layanan'}
          </span>

          <span className='truncate font-semibold text-primary-foreground'>
            {promo.title}
          </span>

          <span className='hidden md:inline-block text-primary-foreground/80 truncate'>
            — {promo.summary}
          </span>
        </div>

        <div className='flex items-center gap-3 shrink-0'>
          {promo.cta ? (
            <Link
              href={promo.cta.href}
              target={promo.cta.href.startsWith('http') ? '_blank' : undefined}
              rel={promo.cta.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className='inline-flex items-center gap-1 rounded-md bg-primary-foreground px-2.5 py-1 text-xs font-semibold text-primary shadow-xs hover:bg-primary-foreground/90 transition-colors'
            >
              <span>{promo.cta.label}</span>
              <ArrowRight className='size-3' />
            </Link>
          ) : null}

          <button
            type='button'
            onClick={() => dismissBanner(promo.id)}
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
