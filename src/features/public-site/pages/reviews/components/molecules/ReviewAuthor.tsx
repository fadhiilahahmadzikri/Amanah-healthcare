'use client';

import type { HealthcareReviewAuthor, ReviewImage } from '../../types';
import { ExternalLinkIcon } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/features/public-site/components/ui/avatar';
import { cn } from '@/features/public-site/lib/helpers';

type ReviewAuthorProps = {
  author: HealthcareReviewAuthor;
  className?: string;
  onImageOpen: (image: ReviewImage) => void;
};

export function ReviewAuthor({ author, className, onImageOpen }: ReviewAuthorProps) {
  const handleAvatarOpen = () => {
    onImageOpen(author.avatar);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className='flex min-w-0 items-center gap-3'>
        <button
          type='button'
          onClick={handleAvatarOpen}
          className='
            shrink-0 rounded-full outline-none
            focus-visible:ring-2 focus-visible:ring-ring
            focus-visible:ring-offset-2
          '
          aria-label={`Perbesar foto profil ${author.name}`}
        >
          <Avatar className='size-10 border border-line bg-background'>
            <AvatarFallback className='font-semibold text-foreground'>
              {author.initials}
            </AvatarFallback>
            <Image
              src={author.avatar.src}
              alt={author.avatar.alt}
              fill
              sizes='40px'
              className='object-cover'
            />
          </Avatar>
        </button>

        <div className='min-w-0 flex-1'>
          <p className='truncate amanah-type-small font-semibold text-foreground'>{author.name}</p>
          <p
            className='
            mt-0.5 line-clamp-1 amanah-type-caption text-muted-foreground
          '
          >
            {author.badge ?? 'Reviewer Google Maps'}
          </p>
        </div>
      </div>

      <a
        href={author.url}
        target='_blank'
        rel='noreferrer'
        className='
          inline-flex items-center gap-1 self-start amanah-type-caption
          font-semibold text-amanah-blue underline-offset-4 transition-colors
          hover:text-foreground hover:underline
        '
      >
        Lihat di Google Maps
        <ExternalLinkIcon aria-hidden className='size-3' />
      </a>
    </div>
  );
}
