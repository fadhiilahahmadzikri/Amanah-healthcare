'use client';

import type {
  PhotosFilterOption,
  RatingSortOption,
  ResponseFilterOption
} from '../../hooks/useReviewsTable';
import { ArrowDownUp, Camera, MessageCircle, RotateCcw, Search, Star, X } from 'lucide-react';
import { Button } from '@/features/public-site/components/ui/button';
import { Input } from '@/features/public-site/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/features/public-site/components/ui/select';
import { cn } from '@/features/public-site/lib/helpers';

type ReviewsToolboxProps = {
  className?: string;
  filteredCount: number;
  isFiltered: boolean;
  onPhotosFilterChange: (option: PhotosFilterOption) => void;
  onRatingSortChange: (option: RatingSortOption) => void;
  onResetFilters: () => void;
  onResponseFilterChange: (option: ResponseFilterOption) => void;
  onSearchChange: (query: string) => void;
  photosFilter: PhotosFilterOption;
  ratingSort: RatingSortOption;
  responseFilter: ResponseFilterOption;
  searchQuery: string;
  totalCount: number;
  visibleCount?: number;
};

export function ReviewsToolbox({
  className,
  filteredCount,
  isFiltered,
  onPhotosFilterChange,
  onRatingSortChange,
  onResetFilters,
  onResponseFilterChange,
  onSearchChange,
  photosFilter,
  ratingSort,
  responseFilter,
  searchQuery,
  totalCount,
  visibleCount
}: ReviewsToolboxProps) {
  return (
    <div className={cn('flex w-full flex-col gap-2.5', className)}>
      {/* Satu Baris Horizontal Penuh: Search di Kiri (flex-1), Tombol Filter di Kanan (shrink-0) */}
      <div className='flex w-full items-center gap-2'>
        {/* Sisi Kiri: Search Bar Fluid mengisi sisa ruang */}
        <div className='relative min-w-0 flex-1'>
          <Search
            aria-hidden='true'
            className='
              pointer-events-none absolute top-1/2 left-3 size-4
              -translate-y-1/2 text-muted-foreground
            '
          />
          <Input
            type='text'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Cari ulasan, nama pasien...'
            className='
              h-10 w-full pr-8 pl-9 text-xs
              sm:text-sm
            '
          />
          {searchQuery && (
            <button
              type='button'
              onClick={() => onSearchChange('')}
              aria-label='Hapus pencarian'
              className='
                absolute top-1/2 right-2.5 inline-flex size-5 -translate-y-1/2
                cursor-pointer items-center justify-center text-muted-foreground
                hover:text-foreground
              '
            >
              <X className='size-3.5' />
            </button>
          )}
        </div>

        {/* Sisi Kanan: Kontrol Filter (Ikon kompak di mobile, label teks di web) */}
        <div
          className='
          flex shrink-0 items-center gap-1.5
          sm:gap-2
        '
        >
          {/* 1. Rating Sorter */}
          <Select
            value={ratingSort}
            onValueChange={(val) => onRatingSortChange(val as RatingSortOption)}
          >
            <SelectTrigger
              aria-label='Urutkan rating'
              title='Urutkan Rating'
              className={cn(
                `
                  relative size-10 shrink-0 cursor-pointer justify-center p-0
                  whitespace-nowrap
                  *:data-[slot=select-icon]:hidden
                  md:h-10 md:w-auto md:min-w-fit md:justify-between md:px-3
                  md:py-2
                  md:*:data-[slot=select-icon]:ml-2
                  md:*:data-[slot=select-icon]:inline-flex
                `,
                ratingSort !== 'default' &&
                  'border-primary bg-primary/10 font-semibold text-primary'
              )}
            >
              <div className='flex items-center gap-2'>
                <ArrowDownUp className='size-4 shrink-0' />
                <span
                  className='
                  hidden
                  md:inline
                '
                >
                  <SelectValue placeholder='Urutkan Rating' />
                </span>
              </div>
              {ratingSort !== 'default' && (
                <span
                  aria-hidden='true'
                  className='
                    absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary
                    md:hidden
                  '
                />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='default'>Urutan Default</SelectItem>
              <SelectItem value='rating-desc'>Rating Tertinggi (5 ★)</SelectItem>
              <SelectItem value='rating-asc'>Rating Terendah</SelectItem>
            </SelectContent>
          </Select>

          {/* 2. Tanggapan Klinik Filter */}
          <Select
            value={responseFilter}
            onValueChange={(val) => onResponseFilterChange(val as ResponseFilterOption)}
          >
            <SelectTrigger
              aria-label='Filter respon klinik'
              title='Tanggapan Klinik'
              className={cn(
                `
                  relative size-10 shrink-0 cursor-pointer justify-center p-0
                  whitespace-nowrap
                  *:data-[slot=select-icon]:hidden
                  md:h-10 md:w-auto md:min-w-fit md:justify-between md:px-3
                  md:py-2
                  md:*:data-[slot=select-icon]:ml-2
                  md:*:data-[slot=select-icon]:inline-flex
                `,
                responseFilter !== 'all' &&
                  'border-primary bg-primary/10 font-semibold text-primary'
              )}
            >
              <div className='flex items-center gap-2'>
                <MessageCircle className='size-4 shrink-0' />
                <span
                  className='
                  hidden
                  md:inline
                '
                >
                  <SelectValue placeholder='Tanggapan Klinik' />
                </span>
              </div>
              {responseFilter !== 'all' && (
                <span
                  aria-hidden='true'
                  className='
                    absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary
                    md:hidden
                  '
                />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Semua Tanggapan</SelectItem>
              <SelectItem value='responded'>Dijawab Klinik</SelectItem>
              <SelectItem value='unresponded'>Belum Dijawab</SelectItem>
            </SelectContent>
          </Select>

          {/* 3. Lampiran Foto Bukti Filter */}
          <Select
            value={photosFilter}
            onValueChange={(val) => onPhotosFilterChange(val as PhotosFilterOption)}
          >
            <SelectTrigger
              aria-label='Filter foto bukti ulasan'
              title='Foto Bukti Ulasan'
              className={cn(
                `
                  relative size-10 shrink-0 cursor-pointer justify-center p-0
                  whitespace-nowrap
                  *:data-[slot=select-icon]:hidden
                  md:h-10 md:w-auto md:min-w-fit md:justify-between md:px-3
                  md:py-2
                  md:*:data-[slot=select-icon]:ml-2
                  md:*:data-[slot=select-icon]:inline-flex
                `,
                photosFilter !== 'all' && 'border-primary bg-primary/10 font-semibold text-primary'
              )}
            >
              <div className='flex items-center gap-2'>
                <Camera className='size-4 shrink-0' />
                <span
                  className='
                  hidden
                  md:inline
                '
                >
                  <SelectValue placeholder='Foto Bukti' />
                </span>
              </div>
              {photosFilter !== 'all' && (
                <span
                  aria-hidden='true'
                  className='
                    absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary
                    md:hidden
                  '
                />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Semua Ulasan</SelectItem>
              <SelectItem value='with-photos'>Ada Foto Bukti</SelectItem>
              <SelectItem value='without-photos'>Tanpa Foto</SelectItem>
            </SelectContent>
          </Select>

          {/* 4. Tombol Reset Filter */}
          {isFiltered && (
            <Button
              type='button'
              variant='outline'
              aria-label='Reset semua filter'
              title='Reset Semua Filter'
              onClick={onResetFilters}
              className='
                size-10 shrink-0 cursor-pointer rounded-none border-line p-0
                text-xs font-medium
                hover:bg-muted
                md:h-10 md:w-auto md:gap-1.5 md:px-3 md:py-2
              '
            >
              <RotateCcw className='size-3.5' />
              <span
                className='
                hidden
                md:inline
              '
              >
                Reset
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Info Status Bar Rata Kiri: Menampilkan Count & Filter Aktif */}
      <div
        className='
        flex flex-wrap items-center justify-between gap-2 px-0.5 text-[11px]
        text-muted-foreground
        sm:text-xs
      '
      >
        {/* Counter ulasan */}
        <div className='flex items-center gap-2'>
          <span>
            Menampilkan{' '}
            <strong className='font-semibold text-foreground'>
              {visibleCount !== undefined && visibleCount < filteredCount
                ? `${visibleCount} dari ${filteredCount}`
                : filteredCount}
            </strong>{' '}
            {visibleCount !== undefined && visibleCount < filteredCount ? '' : 'dari'}{' '}
            {visibleCount !== undefined && visibleCount < filteredCount ? '' : totalCount} ulasan
          </span>
          {isFiltered && (
            <span
              className='
              inline-flex items-center rounded-none bg-primary/10 px-1.5 py-0.5
              text-[10px] font-semibold text-primary
            '
            >
              Filter Aktif
            </span>
          )}
        </div>

        {/* Quick pill tag indicators */}
        <div className='flex flex-wrap items-center gap-1.5'>
          {ratingSort !== 'default' && (
            <span
              className='
              inline-flex items-center gap-1 rounded-none border border-line
              bg-card px-2 py-0.5 text-[10px] text-foreground
            '
            >
              <Star className='size-2.5 fill-amber-500 text-amber-500' />
              {ratingSort === 'rating-desc' ? 'Rating 5→1' : 'Rating 1→5'}
            </span>
          )}
          {responseFilter !== 'all' && (
            <span
              className='
              inline-flex items-center gap-1 rounded-none border border-line
              bg-card px-2 py-0.5 text-[10px] text-foreground
            '
            >
              <MessageCircle className='size-2.5 text-amanah-blue' />
              {responseFilter === 'responded' ? 'Dijawab' : 'Belum Dijawab'}
            </span>
          )}
          {photosFilter !== 'all' && (
            <span
              className='
              inline-flex items-center gap-1 rounded-none border border-line
              bg-card px-2 py-0.5 text-[10px] text-foreground
            '
            >
              <Camera className='size-2.5 text-amanah-mint' />
              {photosFilter === 'with-photos' ? 'Ada Foto' : 'Tanpa Foto'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
