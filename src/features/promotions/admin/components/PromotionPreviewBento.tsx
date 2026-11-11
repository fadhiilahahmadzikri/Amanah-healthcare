'use client';

import * as React from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import type { PromoImageType, PublicPromotion } from '../../types/promotions.types';
import { PromoImage } from '../../components/PromoImage';
import { PromoBanner } from '../../components/PromoBanner';
import { PromoCard } from '../../components/PromoCard';
import { PromotionsProvider } from '../../context/PromotionsContext';

export interface PromotionPreviewBentoProps {
  imageType: PromoImageType;
  imageValue: string;
  imageAlt: string;
  urlTestStatus: 'idle' | 'testing' | 'valid' | 'invalid';
  previewPromotion: PublicPromotion;
  onRetryTest?: () => void;
  className?: string;
}

export function PromotionPreviewBento({
  imageType,
  imageValue,
  imageAlt,
  urlTestStatus,
  previewPromotion,
  onRetryTest,
  className,
}: PromotionPreviewBentoProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [previewTab, setPreviewTab] = React.useState<'image' | 'banner' | 'card'>('image');

  // GSAP subtle morph transition whenever status or active tab switches
  React.useEffect(() => {
    if (containerRef.current) {
      gsap.killTweensOf(containerRef.current);
      gsap.fromTo(
        containerRef.current,
        { opacity: 0.7, y: 3 },
        { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
      );
    }
  }, [urlTestStatus, previewTab, imageType]);

  const hasValidStaticImage = imageType === 'static' && Boolean(imageValue.trim());
  const hasValidUrlImage = imageType === 'url' && urlTestStatus === 'valid' && Boolean(imageValue.trim());
  const isImageAvailable = hasValidStaticImage || hasValidUrlImage;

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5 flex flex-col min-h-[220px] sm:min-h-[240px] flex-1 min-h-0 overflow-hidden shadow-2xs font-sans',
        className
      )}
    >
      {/* Studio Header (Tanpa Header Icon) */}
      <div className='flex items-center justify-between pb-3 border-b border-border/40 shrink-0'>
        <div>
          <h4 className='text-xs sm:text-sm font-bold text-foreground tracking-tight'>
            Studio Pratinjau
          </h4>
          <p className='text-[11px] text-muted-foreground mt-0.5 font-medium'>
            {imageType === 'url' ? 'Pratinjau tautan URL gambar' : 'Pratinjau katalog gambar klinik'}
          </p>
        </div>

        {/* View Mode Tabs (Image Only vs Banner vs Card) */}
        {isImageAvailable ? (
          <div className='flex items-center rounded-lg border border-border/60 bg-background/60 p-0.5'>
            <button
              type='button'
              onClick={() => setPreviewTab('image')}
              className={cn(
                'rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer',
                previewTab === 'image'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Gambar
            </button>
            <button
              type='button'
              onClick={() => setPreviewTab('banner')}
              className={cn(
                'rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer',
                previewTab === 'banner'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Banner
            </button>
            <button
              type='button'
              onClick={() => setPreviewTab('card')}
              className={cn(
                'rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer',
                previewTab === 'card'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Kartu
            </button>
          </div>
        ) : null}
      </div>

      {/* Preview Content Area (Bento Layer 2: Main Content) */}
      <div
        ref={containerRef}
        className='flex-1 min-h-0 py-2.5 flex flex-col items-center justify-start sm:justify-center overflow-y-auto w-full relative scrollbar-thin'
      >
        {imageType === 'url' && urlTestStatus === 'testing' ? (
          <div className='flex flex-col items-center justify-center p-8 text-center text-muted-foreground my-auto'>
            <Icons.spinner className='size-6 animate-spin text-primary mb-2' />
            <p className='text-xs font-medium text-foreground'>Memverifikasi tautan gambar...</p>
            <p className='text-[11px] text-muted-foreground mt-0.5'>
              Memeriksa aksesibilitas dan format gambar
            </p>
          </div>
        ) : imageType === 'url' && urlTestStatus === 'invalid' ? (
          <EmptyState
            animated={true}
            title='Gambar Gagal Dimuat'
            description='Tautan gambar tidak dapat diakses atau bukan format gambar publik yang valid. Pastikan URL diawali dengan https://'
            className='min-h-[190px] p-4 sm:p-5 bg-destructive/5 border-destructive/20 text-destructive my-auto'
            action={
              onRetryTest ? (
                <button
                  type='button'
                  onClick={onRetryTest}
                  className='text-xs font-semibold underline text-foreground hover:text-primary transition-colors cursor-pointer'
                >
                  Coba Uji Muat Ulang
                </button>
              ) : undefined
            }
          />
        ) : imageType === 'url' && urlTestStatus === 'idle' && !hasValidUrlImage ? (
          <EmptyState
            animated={true}
            title='Pratinjau Belum Tersedia'
            description='Masukkan tautan URL gambar publik di atas, lalu klik tombol Uji Muat untuk memverifikasi pratinjau visual.'
            className='min-h-[190px] p-4 sm:p-5 bg-card/40 my-auto'
          />
        ) : !isImageAvailable ? (
          <EmptyState
            animated={true}
            title='Belum Ada Gambar Terpilih'
            description='Pilih gambar dari katalog klinik atau masukkan tautan URL gambar publik.'
            className='min-h-[190px] p-4 sm:p-5 bg-card/40 my-auto'
          />
        ) : previewTab === 'image' ? (
          /* 1. Direct Image View (16:9 Aspect Ratio) */
          <div className='flex flex-col items-center justify-center w-full my-auto py-1'>
            <div className='relative w-full max-w-md max-h-[210px] sm:max-h-[250px] aspect-video rounded-xl overflow-hidden border border-border/60 bg-background shadow-xs flex items-center justify-center'>
              <PromoImage
                src={imageValue}
                alt={imageAlt || previewPromotion.title}
                fallbackTitle={previewPromotion.title}
                fallbackSummary={previewPromotion.summary}
                aspectRatio='video'
                className='size-full object-cover'
              />
              <div className='absolute bottom-2 left-2 right-2 rounded-lg bg-black/60 backdrop-blur-xs px-2.5 py-1.5 flex items-center justify-between text-white text-[11px]'>
                <span className='truncate font-medium'>{imageAlt || previewPromotion.title}</span>
                <span className='shrink-0 text-[10px] text-white/80 font-mono'>16:9</span>
              </div>
            </div>
          </div>
        ) : previewTab === 'banner' ? (
          /* 2. Banner Live View */
          <div className='flex flex-col justify-center w-full my-auto py-1'>
            <PromotionsProvider initialData={[previewPromotion]}>
              <div className='overflow-hidden rounded-xl border border-border/60 shadow-xs w-full'>
                <PromoBanner />
              </div>
            </PromotionsProvider>
          </div>
        ) : (
          /* 3. Promo Card Live View */
          <div className='flex flex-col items-center justify-center w-full my-auto py-1'>
            <div className='w-full max-w-sm max-h-[280px] overflow-y-auto scrollbar-thin'>
              <PromoCard promo={previewPromotion} isCompact />
            </div>
          </div>
        )}
      </div>

      {/* Studio Footer (Bento Layer 3: Pinned Footer) */}
      <div className='shrink-0 pt-2.5 mt-auto border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground w-full'>
        <div className='flex items-center gap-1.5 font-medium min-w-0'>
          <span
            className={cn(
              'size-1.5 shrink-0 rounded-full',
              isImageAvailable ? 'bg-emerald-500' : 'bg-muted-foreground/50'
            )}
          />
          <span className='truncate'>
            {isImageAvailable ? 'Pratinjau visual siap' : 'Menunggu pemilihan gambar'}
          </span>
        </div>
        <span className='shrink-0 font-mono text-[10px] bg-muted/60 px-2 py-0.5 rounded-md'>
          Rasio 16:9 • {previewTab.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
