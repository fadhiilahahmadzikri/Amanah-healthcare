'use client';

import type { MarqueeReviewItem } from '../../data/reviewsMarqueeData';
import Image from 'next/image';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/features/public-site/components/ui/avatar';
import { cn } from '@/features/public-site/lib/helpers';
import { ReviewQuoteMark } from '../atoms/ReviewQuoteMark';

type ReviewMarqueeCardProps = {
  className?: string;
  review: MarqueeReviewItem;
};

export function ReviewMarqueeCard({ className, review }: ReviewMarqueeCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <article
      className={cn(
        `
          relative flex h-full w-[290px] shrink-0 flex-col justify-between
          rounded-none border border-line bg-card p-5 text-card-foreground
          transition-colors
          hover:border-foreground/40 hover:bg-accent/30
          min-[380px]:w-[320px]
          sm:w-[360px] sm:p-6
        `,
        className
      )}
    >
      <div>
        {/* Quotation mark */}
        <div className='mb-3.5 sm:mb-4'>
          <ReviewQuoteMark className='size-5 text-amanah-blue/60' />
        </div>

        {/* Review body */}
        <p className='line-clamp-4 text-xs leading-relaxed text-foreground/90 min-[380px]:text-sm sm:line-clamp-3'>
          {review.text}
        </p>
      </div>

      {/* Author footer */}
      <div className='mt-5 flex items-center gap-3 border-t border-line/60 pt-4 sm:mt-6'>
        <Avatar className='size-9 shrink-0 overflow-hidden rounded-none border-0 bg-transparent sm:size-10'>
          <AvatarFallback className='rounded-none text-xs font-semibold text-foreground bg-accent/60'>
            {review.initials}
          </AvatarFallback>
          {review.avatar && !imageError && (
            <Image
              src={review.avatar}
              alt={`Foto profil ${review.name}`}
              fill
              sizes='40px'
              className='object-cover'
              onError={() => setImageError(true)}
            />
          )}
        </Avatar>

        <div className='min-w-0 flex-1'>
          <h4 className='truncate text-xs font-bold text-foreground sm:text-sm'>{review.name}</h4>
          <p className='mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs'>
            {review.badge}
          </p>
        </div>
      </div>
    </article>
  );
}
