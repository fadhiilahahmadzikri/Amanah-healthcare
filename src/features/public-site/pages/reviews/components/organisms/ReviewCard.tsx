'use client';

import type { HealthcareReview, ReviewImage } from '../../types';
import { ArrowUpRightIcon, ImageIcon, MessageSquareReplyIcon, ThumbsUpIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/features/public-site/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/features/public-site/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/features/public-site/components/ui/dialog';
import { cn } from '@/features/public-site/lib/helpers';
import { ReviewStars } from '../atoms/ReviewStars';
import { ReviewAuthor } from '../molecules/ReviewAuthor';

type ReviewCardProps = {
  className?: string;
  onImageOpen: (image: ReviewImage) => void;
  review: HealthcareReview;
};

export function ReviewCard({ className, onImageOpen, review }: ReviewCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <>
      <Card
        data-review-card
        data-review-id={review.id}
        className={cn(
          `
            flex h-full flex-col overflow-hidden rounded-none border-line bg-card
            shadow-none
          `,
          className
        )}
      >
        <CardHeader className='gap-3 p-4 pb-3'>
          <ReviewAuthor author={review.author} onImageOpen={onImageOpen} />

          <div className='flex items-center justify-between gap-3'>
            <ReviewStars rating={review.rating} />
            <span className='shrink-0 amanah-type-caption text-muted-foreground'>
              {review.relativeDate}
            </span>
          </div>
        </CardHeader>

        <CardContent className='flex flex-1 flex-col gap-3 p-4 pt-0'>
          <CardTitle className='sr-only'>Ulasan dari {review.author.name}</CardTitle>

          <p className='line-clamp-4 amanah-type-small whitespace-pre-line text-foreground'>
            {review.text || 'Pasien memberi rating tanpa menuliskan cerita tambahan.'}
          </p>
        </CardContent>

        <CardFooter
          className='
          mt-auto flex items-center justify-between gap-3 border-t border-line p-3 sm:px-4
        '
        >
          <div className='flex flex-wrap items-center gap-3 text-muted-foreground'>
            <div className='flex items-center gap-1.5 amanah-type-caption'>
              <ThumbsUpIcon aria-hidden className='size-3.5' />
              <span>
                {review.likes}
                <span className='sr-only'> suka</span>
              </span>
            </div>

            {review.photosCount > 0 && (
              <div className='flex items-center gap-1.5 amanah-type-caption font-medium text-foreground'>
                <ImageIcon aria-hidden className='size-3.5 text-muted-foreground' />
                <span>{review.photosCount} foto</span>
              </div>
            )}

            {review.ownerResponse && (
              <div className='flex items-center gap-1.5 amanah-type-caption font-medium text-foreground'>
                <MessageSquareReplyIcon aria-hidden className='size-3.5 text-muted-foreground' />
                <span>1 respons</span>
              </div>
            )}
          </div>

          <button
            type='button'
            onClick={() => setIsDetailOpen(true)}
            className='
              group inline-flex shrink-0 cursor-pointer items-center gap-1
              amanah-type-caption font-semibold text-foreground transition-colors
              hover:text-amanah-blue focus-visible:ring-2
              focus-visible:ring-ring outline-none
            '
            aria-label={`Buka detail ulasan dari ${review.author.name}`}
          >
            <span>Detail</span>
            <ArrowUpRightIcon
              aria-hidden
              className='
                size-3.5 text-muted-foreground transition-all duration-200
                group-hover:-translate-y-0.5 group-hover:translate-x-0.5
                group-hover:text-amanah-blue
              '
            />
          </button>
        </CardFooter>
      </Card>

      {isDetailOpen && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent
            data-lenis-prevent
            className='
              flex max-h-[85vh] w-full max-w-lg flex-col gap-0 overflow-hidden
              rounded-none border-line bg-card p-0 shadow-none
              sm:max-w-xl
            '
          >
            <DialogHeader className='shrink-0 gap-4 border-b border-line p-4 pr-16 text-left sm:text-left'>
              <DialogTitle className='sr-only'>Ulasan dari {review.author.name}</DialogTitle>
              <DialogDescription className='sr-only'>
                Detail ulasan lengkap dari {review.author.name} di Klinik Amanah
              </DialogDescription>

              <ReviewAuthor author={review.author} onImageOpen={onImageOpen} />

              <div className='flex items-center justify-between gap-3'>
                <ReviewStars rating={review.rating} />
                <span className='shrink-0 amanah-type-caption text-muted-foreground'>
                  {review.relativeDate}
                </span>
              </div>
            </DialogHeader>

            <div
              data-lenis-prevent
              className='
                max-h-[60vh] flex-1 min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain p-4
                space-y-4 touch-pan-y
              '
            >
              <p className='amanah-type-small whitespace-pre-line text-foreground'>
                {review.text || 'Pasien memberi rating tanpa menuliskan cerita tambahan.'}
              </p>

              {review.ownerResponse && (
                <div className='border border-line bg-accent p-3'>
                  <div className='mb-2 flex items-center gap-2 text-foreground'>
                    <MessageSquareReplyIcon aria-hidden className='size-4' />
                    <p className='amanah-type-caption font-semibold'>
                      Respons Klinik Amanah · {review.ownerResponse.date}
                    </p>
                  </div>
                  <p className='amanah-type-caption whitespace-pre-line text-muted-foreground'>
                    {review.ownerResponse.text}
                  </p>
                </div>
              )}

              {review.photos.length > 0 && (
                <div className='space-y-2.5 border-t border-line pt-3'>
                  <p className='flex items-center gap-1.5 amanah-type-caption font-semibold text-foreground'>
                    <ImageIcon aria-hidden className='size-3.5 text-muted-foreground' />
                    Foto Ulasan ({review.photosCount})
                  </p>
                  <div
                    className={cn(
                      'grid gap-2.5',
                      review.photos.length === 1
                        ? 'grid-cols-1'
                        : review.photos.length === 2
                          ? 'grid-cols-2'
                          : 'grid-cols-2 sm:grid-cols-3'
                    )}
                  >
                    {review.photos.map((photo) => (
                      <button
                        key={photo.id}
                        type='button'
                        onClick={() => onImageOpen(photo)}
                        className='group relative aspect-4/3 w-full cursor-pointer overflow-hidden border border-line bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        aria-label={`Perbesar ${photo.alt}`}
                      >
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          sizes='(min-width: 640px) 240px, 50vw'
                          className='object-cover transition-transform duration-300 group-hover:scale-105'
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter
              className='
              shrink-0 mt-auto flex flex-row items-center justify-between gap-3 border-t
              border-line p-4
              sm:flex-row sm:justify-between
            '
            >
              <div className='flex items-center gap-1.5 text-muted-foreground'>
                <ThumbsUpIcon aria-hidden className='size-4' />
                <span className='amanah-type-caption'>{review.likes} suka</span>
              </div>

              <DialogClose asChild>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='rounded-none border-line'
                >
                  Tutup
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
