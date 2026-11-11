'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { usePromotions } from '../context/PromotionsContext';
import { PromoImage } from './PromoImage';

interface PromoModalProps {
  excludePaths?: string[];
}

const DEFAULT_EXCLUDE_PATHS = ['/booking', '/login', '/auth', '/admin'];

export function PromoModal({
  excludePaths = DEFAULT_EXCLUDE_PATHS,
}: PromoModalProps) {
  const pathname = usePathname();
  const { activeModalPromo, dismissModal } = usePromotions();
  const [isOpen, setIsOpen] = React.useState(false);

  // Check if current route is excluded
  const isExcludedRoute = React.useMemo(() => {
    if (!pathname) return false;
    return excludePaths.some((prefix) => pathname.startsWith(prefix));
  }, [pathname, excludePaths]);

  // Handle delay timer
  React.useEffect(() => {
    if (!activeModalPromo || isExcludedRoute) {
      setIsOpen(false);
      return;
    }

    const delayMs = Math.max(0, (activeModalPromo.modal?.delaySec ?? 1) * 1000);
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [activeModalPromo, isExcludedRoute]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      dismissModal();
    }
  };

  if (!activeModalPromo || isExcludedRoute) {
    return null;
  }

  const promo = activeModalPromo;
  const isImageOnly = promo.modal?.mode === 'image_only';

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        {/* Backdrop overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />

        {/* Modal content */}
        <DialogPrimitive.Content
          className={cn(
            'fixed top-[50%] left-[50%] z-50 grid w-full',
            isImageOnly
              ? 'max-w-[calc(100%-2rem)] sm:max-w-md md:max-w-lg bg-transparent border-0 shadow-none'
              : 'max-w-[calc(100%-2rem)] sm:max-w-md md:max-w-lg border border-border bg-card shadow-2xl',
            'translate-x-[-50%] translate-y-[-50%] gap-0 overflow-hidden rounded-2xl duration-200',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
        >
          {isImageOnly ? (
            <div className='relative w-full overflow-hidden rounded-2xl shadow-2xl group'>
              <DialogPrimitive.Title className='sr-only'>
                {promo.title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className='sr-only'>
                {promo.summary}
              </DialogPrimitive.Description>

              <Link
                href={`/promosi/${promo.id}`}
                onClick={() => handleOpenChange(false)}
                className='block cursor-pointer focus:outline-hidden'
              >
                <PromoImage
                  src={promo.image.src}
                  alt={promo.image.alt || promo.title}
                  fallbackTitle={promo.title}
                  fallbackSummary={promo.summary}
                  aspectRatio='auto'
                  priority
                  className='w-full max-h-[80vh] object-contain rounded-2xl transition-transform duration-300 group-hover:scale-101'
                />
              </Link>

              {/* Close Button X */}
              <DialogPrimitive.Close
                aria-label='Tutup'
                className='absolute top-3 right-3 z-20 flex size-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-105 active:scale-95 shadow-md cursor-pointer'
              >
                <X className='size-5' />
              </DialogPrimitive.Close>
            </div>
          ) : (
            <>
              {/* Existing Card Layout (Cleaned of pills) */}
              <div className='relative w-full overflow-hidden bg-muted'>
                <PromoImage
                  src={promo.image.src}
                  alt={promo.image.alt || promo.title}
                  fallbackTitle={promo.title}
                  fallbackSummary={promo.summary}
                  aspectRatio='video'
                  priority
                  className='rounded-none'
                />

                <DialogPrimitive.Close
                  aria-label='Tutup'
                  className='absolute top-3 right-3 z-20 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs transition-all hover:bg-black/70 hover:scale-105 active:scale-95 cursor-pointer'
                >
                  <X className='size-4' />
                </DialogPrimitive.Close>
              </div>

              <div className='flex flex-col gap-3 p-5 sm:p-6'>
                <DialogPrimitive.Title className='text-lg sm:text-xl font-bold tracking-tight text-foreground'>
                  {promo.title}
                </DialogPrimitive.Title>

                <DialogPrimitive.Description className='text-sm text-muted-foreground leading-relaxed'>
                  {promo.summary}
                </DialogPrimitive.Description>

                {promo.body ? (
                  <p className='text-xs text-foreground/80 leading-relaxed whitespace-pre-line border-t border-border/50 pt-2'>
                    {promo.body}
                  </p>
                ) : null}

                {promo.terms ? (
                  <p className='text-[11px] text-muted-foreground/75 italic whitespace-pre-line'>
                    * {promo.terms}
                  </p>
                ) : null}

                <div className='mt-2 flex items-center justify-end gap-2.5 pt-2'>
                  <button
                    type='button'
                    onClick={() => handleOpenChange(false)}
                    className='px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
                  >
                    Nanti Saja
                  </button>

                  <Link
                    href={`/promosi/${promo.id}`}
                    onClick={() => handleOpenChange(false)}
                    className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-98 transition-all'
                  >
                    <span>{promo.cta?.label || 'Pelajari Selengkapnya'}</span>
                    <ArrowRight className='size-4' />
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
