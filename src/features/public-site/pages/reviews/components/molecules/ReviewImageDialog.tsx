'use client';

import type { ReviewImage } from '../../types';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/features/public-site/components/ui/dialog';

type ReviewImageDialogProps = {
  image: ReviewImage | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function ReviewImageDialog({ image, isOpen, onOpenChange }: ReviewImageDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className='
          max-h-[calc(100vh-2rem)] gap-0 overflow-hidden p-0
          sm:max-w-[min(960px,calc(100vw-2rem))]
        '
      >
        <DialogHeader className='border-b border-line px-5 py-4 pr-16 text-left'>
          <DialogTitle className='amanah-type-card-title'>
            {image?.title ?? 'Foto ulasan'}
          </DialogTitle>
          <DialogDescription>
            {image?.caption ?? 'Dokumentasi dari ulasan Google Maps'}
          </DialogDescription>
        </DialogHeader>

        {image && (
          <div
            className='
            relative h-[min(72vh,720px)] w-full bg-surface
            sm:h-[min(74vh,760px)]
          '
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes='(min-width: 1024px) 900px, 94vw'
              className='object-contain'
              priority
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
