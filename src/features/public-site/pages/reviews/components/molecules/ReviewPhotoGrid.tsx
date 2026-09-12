'use client';

import type { ReviewImage } from '../../types';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/features/public-site/components/ui/accordion';
import { cn } from '@/features/public-site/lib/helpers';

type ReviewPhotoGridProps = {
  className?: string;
  onImageOpen: (image: ReviewImage) => void;
  photos: ReviewImage[];
  photosCount: number;
};

type ReviewPhotoButtonProps = {
  onImageOpen: (image: ReviewImage) => void;
  photo: ReviewImage;
};

function ReviewPhotoButton({ onImageOpen, photo }: ReviewPhotoButtonProps) {
  const handlePhotoOpen = () => {
    onImageOpen(photo);
  };

  return (
    <button
      type='button'
      onClick={handlePhotoOpen}
      className='
        relative h-14 w-20 overflow-hidden border border-line bg-muted
        outline-none
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        sm:h-16 sm:w-24
      '
      aria-label={`Perbesar ${photo.alt}`}
    >
      <Image src={photo.src} alt={photo.alt} fill sizes='96px' className='object-cover' />
    </button>
  );
}

export function ReviewPhotoGrid({
  className,
  onImageOpen,
  photos,
  photosCount
}: ReviewPhotoGridProps) {
  if (photosCount <= 0 && photos.length === 0) {
    return null;
  }

  return (
    <Accordion
      type='single'
      collapsible
      className={cn('border-t border-b-0 border-line bg-background', className)}
    >
      <AccordionItem value='review-photos' className='border-b-0'>
        <AccordionTrigger
          className='
            flex h-10 min-h-0 items-center justify-between rounded-none px-4 py-0
            [font-size:var(--amanah-type-small)]
            leading-none font-semibold text-foreground
            hover:no-underline
            [&>svg]:size-3.5 [&>svg]:translate-y-0
          '
        >
          <span className='flex items-center gap-2'>
            <ImageIcon aria-hidden className='size-3.5 shrink-0' />
            <span>Lihat foto ({photosCount})</span>
          </span>
        </AccordionTrigger>

        <AccordionContent className='px-4 pb-3'>
          {photos.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {photos.map((photo) => (
                <ReviewPhotoButton key={photo.id} photo={photo} onImageOpen={onImageOpen} />
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
