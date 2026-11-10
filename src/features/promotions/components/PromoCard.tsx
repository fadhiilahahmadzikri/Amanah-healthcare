'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PublicPromotion } from '../types/promotions.types';
import { PromoImage } from './PromoImage';

interface PromoCardProps {
  promo: PublicPromotion;
  className?: string;
  isCompact?: boolean;
}

export function PromoCard({ promo, className, isCompact = false }: PromoCardProps) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/40',
        className
      )}
    >
      {/* Visual Image Header */}
      <div className='relative w-full overflow-hidden bg-muted'>
        <PromoImage
          src={promo.image.src}
          alt={promo.image.alt || promo.title}
          fallbackTitle={promo.title}
          fallbackSummary={promo.summary}
          aspectRatio='video'
          className='transition-transform duration-500 group-hover:scale-102'
        />

        {/* Linked Service Badge */}
        {promo.serviceName ? (
          <div className='absolute top-3 left-3 z-10'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-primary/95 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-xs'>
              <Sparkles className='size-3' />
              {promo.serviceName}
            </span>
          </div>
        ) : null}
      </div>

      {/* Content Details */}
      <div className={cn('flex flex-1 flex-col justify-between p-5', isCompact && 'p-4 gap-2')}>
        <div className='flex flex-col gap-2'>
          <h3 className={cn('text-base sm:text-lg font-bold tracking-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors', isCompact && 'text-sm')}>
            {promo.title}
          </h3>

          <p className={cn('text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed', isCompact && 'text-xs line-clamp-2')}>
            {promo.summary}
          </p>
        </div>

        {/* CTA Footer */}
        {promo.cta ? (
          <div className='mt-4 pt-3 border-t border-border/50 flex items-center justify-between'>
            <Link
              href={promo.cta.href}
              target={promo.cta.href.startsWith('http') ? '_blank' : undefined}
              rel={promo.cta.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className='inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors'
            >
              <span>{promo.cta.label}</span>
              <ArrowRight className='size-3.5 transition-transform group-hover:translate-x-0.5' />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
