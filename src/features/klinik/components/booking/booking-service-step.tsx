'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredItems = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return serviceBentoItems;
    return serviceBentoItems.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchComplaint = item.complaints?.some((c) => c.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchComplaint;
    });
  }, [serviceBentoItems, searchQuery]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
            Pilih Layanan Pemeriksaan
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

      {serviceBentoItems.length > 1 && (
        <div className='relative'>
          <Icons.search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none' />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Cari layanan atau keluhan (misal: demam, batuk, pusing, imunisasi)...'
            className='pl-9 pr-9 h-9 text-xs bg-muted/30 focus-visible:bg-background'
          />
          {searchQuery && (
            <button
              type='button'
              onClick={() => setSearchQuery('')}
              className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-1 cursor-pointer'
            >
              <Icons.close className='size-3.5' />
            </button>
          )}
        </div>
      )}

      <div className='pt-1'>
        {serviceBentoItems.length === 0 ? (
          <div className='p-8 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center'>
            <p className='text-xs text-muted-foreground'>Memuat daftar layanan poliklinik...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <ServiceBentoGrid
            items={filteredItems}
            onItemSelect={onSelectServiceItem}
            cardClassName='min-h-[120px] sm:min-h-[135px] md:min-h-[145px]'
          />
        ) : (
          <div className='p-8 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center'>
            <p className='text-xs text-muted-foreground'>
              Tidak ada layanan yang cocok dengan keluhan atau kata kunci &ldquo;{searchQuery}
              &rdquo;.
            </p>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => setSearchQuery('')}
              className='mt-2 text-xs'
            >
              Reset Pencarian
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
