'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { ServiceImagePicker } from '@/features/clinic-essentials/components/atoms/service-image-picker';
import { cn } from '@/lib/utils';
import type { PromoImageType } from '../../types/promotions.types';

export interface PromotionVisualBentoProps {
  imageType: PromoImageType;
  setImageType: (val: PromoImageType) => void;
  imageValue: string;
  setImageValue: (val: string) => void;
  imageAlt: string;
  setImageAlt: (val: string) => void;
  urlTestStatus: 'idle' | 'testing' | 'valid' | 'invalid';
  onTestUrl: () => void;
  className?: string;
}

export function PromotionVisualBento({
  imageType,
  setImageType,
  imageValue,
  setImageValue,
  imageAlt,
  setImageAlt,
  urlTestStatus,
  onTestUrl,
  className,
}: PromotionVisualBentoProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5 flex flex-col gap-4 shrink-0 shadow-2xs font-sans',
        className
      )}
    >
      {/* Box Header (Tanpa Header Icon) */}
      <div className='flex items-center justify-between pb-2.5 border-b border-border/40'>
        <div>
          <h4 className='text-xs sm:text-sm font-bold text-foreground tracking-tight'>
            Gambar & Visual Promosi
          </h4>
          <p className='text-[11px] text-muted-foreground mt-0.5 font-medium'>
            Rasio 16:9 disarankan untuk keterbacaan optimal di banner dan modal
          </p>
        </div>
      </div>

      {/* Segmented Source Selector (Katalog vs URL) */}
      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={() => setImageType('static')}
          className={cn(
            'flex-1 rounded-xl border py-2 px-3 text-xs font-semibold transition-all cursor-pointer text-center',
            imageType === 'static'
              ? 'border-primary bg-primary/10 text-primary shadow-2xs'
              : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
          )}
        >
          Katalog Gambar Klinik
        </button>
        <button
          type='button'
          onClick={() => setImageType('url')}
          className={cn(
            'flex-1 rounded-xl border py-2 px-3 text-xs font-semibold transition-all cursor-pointer text-center',
            imageType === 'url'
              ? 'border-primary bg-primary/10 text-primary shadow-2xs'
              : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
          )}
        >
          Tautan URL Gambar
        </button>
      </div>

      {/* Mode 1: Katalog Gambar Klinik */}
      {imageType === 'static' ? (
        <div className='flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card/60'>
          <ServiceImagePicker
            value={imageValue}
            onChange={(url) => {
              if (url) {
                setImageValue(url);
                if (!imageAlt) {
                  const baseName = url.split('/').pop()?.replace('.webp', '') || 'Gambar Layanan';
                  setImageAlt(baseName);
                }
              }
            }}
          />
          <div className='min-w-0 flex-1'>
            <p className='text-xs font-semibold text-foreground truncate'>
              {imageValue ? imageValue.split('/').pop() : 'Belum ada gambar terpilih'}
            </p>
            <p className='text-[11px] text-muted-foreground'>
              Klik thumbnail untuk memilih aset visual klinik yang telah dioptimasi
            </p>
          </div>
        </div>
      ) : (
        /* Mode 2: Tautan URL Gambar Publik dengan Uji Muat */
        <div className='space-y-2.5'>
          <div className='flex items-end gap-2.5'>
            <div className='flex-1 min-w-0'>
              <PatientLineInput
                id='promo_image_url'
                label='Tautan URL Gambar *'
                type='url'
                placeholder='https://images.example.com/promo-banner.webp'
                value={imageValue}
                onChange={setImageValue}
                autoComplete='off'
              />
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              shape='pill'
              onClick={onTestUrl}
              disabled={!imageValue.trim() || urlTestStatus === 'testing'}
              className='text-xs font-semibold px-4 h-9 shrink-0 cursor-pointer shadow-2xs'
            >
              {urlTestStatus === 'testing' ? (
                <>
                  <Icons.spinner className='size-3 mr-1.5 animate-spin' />
                  Menguji...
                </>
              ) : (
                'Uji Muat'
              )}
            </Button>
          </div>

          {/* Status Message Di Bawah Uji Muat */}
          {urlTestStatus === 'valid' ? (
            <p className='text-[11px] text-primary font-medium flex items-center gap-1.5'>
              <Icons.check className='size-3.5' /> Gambar valid dan berhasil dimuat ke studio.
            </p>
          ) : urlTestStatus === 'invalid' ? (
            <p className='text-[11px] text-destructive font-medium flex items-center gap-1.5'>
              <Icons.close className='size-3.5' /> Gambar gagal dimuat. Periksa tautan publik Anda.
            </p>
          ) : null}
        </div>
      )}

      {/* Alt Text (PatientLineInput - Tanpa Trailing Icon) */}
      <div className='pt-1'>
        <PatientLineInput
          id='promo_image_alt'
          label='Teks Alternatif Gambar (Alt Text)'
          placeholder='Deskripsi visual singkat untuk aksesibilitas'
          value={imageAlt}
          onChange={setImageAlt}
          autoComplete='off'
        />
      </div>

      {/* Visual Footer (Bento Layer 3: Pinned Footer) */}
      <div className='shrink-0 pt-2.5 mt-auto border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground'>
        <span className='font-medium'>
          Sumber: {imageType === 'static' ? 'Katalog Gambar Klinik' : 'Tautan URL Publik'}
        </span>
        <span className='text-[10px] text-muted-foreground/80 font-mono'>
          Rasio disarankan: 16:9
        </span>
      </div>
    </div>
  );
}
