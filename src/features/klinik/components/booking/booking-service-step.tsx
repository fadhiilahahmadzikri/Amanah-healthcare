'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ServiceBentoGrid } from '@/features/public-site/pages/services/components/organisms/ServiceBentoGrid';
import type { ServiceCardItem } from '@/features/public-site/pages/services/types';

export interface BookingServiceStepProps {
  serviceBentoItems: ServiceCardItem[];
  onSelectServiceItem: (item: ServiceCardItem) => void;
  onBackToCategory: () => void;
}

export function BookingServiceStep({
  serviceBentoItems,
  onSelectServiceItem,
  onBackToCategory
}: BookingServiceStepProps) {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
            Pilih Layanan Pemeriksaan 🩺
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Pilih layanan medis yang sesuai dengan kebutuhan Anda.
          </p>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={onBackToCategory}
          className='text-xs gap-1 cursor-pointer'
        >
          <Icons.arrowLeft className='size-3.5' />
          <span>Kategori</span>
        </Button>
      </div>

      <div className='pt-1'>
        {serviceBentoItems.length > 0 ? (
          <ServiceBentoGrid
            items={serviceBentoItems}
            onItemSelect={onSelectServiceItem}
            cardClassName='min-h-[120px] sm:min-h-[135px] md:min-h-[145px]'
          />
        ) : (
          <div className='p-8 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center'>
            <p className='text-xs text-muted-foreground'>
              Memuat daftar layanan poliklinik...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
