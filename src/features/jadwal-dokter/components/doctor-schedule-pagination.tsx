'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

export interface DoctorSchedulePaginationProps extends React.ComponentProps<'div'> {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function DoctorSchedulePagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 12, 18, 24, 30],
  className,
  ...props
}: DoctorSchedulePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const canPrevious = currentPage > 1;
  const canNext = currentPage < pageCount;

  return (
    <div
      className={cn(
        'flex w-full flex-wrap items-center justify-between gap-2 border-t border-border/50 bg-background/80 dark:bg-card/80 px-4 py-3 shadow-md backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 dark:supports-[backdrop-filter]:bg-card/70 select-none sm:gap-6 transition-all',
        className
      )}
      {...props}
    >
      {/* Total Items Info */}
      <div className='text-xs sm:text-sm whitespace-nowrap text-muted-foreground pl-1'>
        <span className='font-semibold text-foreground'>{totalItems}</span> dokter terdaftar
      </div>

      {/* Pagination Controls */}
      <div className='flex items-center gap-2 sm:gap-6 lg:gap-8'>
        {/* Page Size Selector */}
        <div className='hidden items-center space-x-2 sm:flex'>
          <p className='text-xs font-medium whitespace-nowrap text-muted-foreground'>
            Kartu per halaman
          </p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
              onPageChange(1);
            }}
          >
            <SelectTrigger className='h-8 w-16 text-xs bg-background/80 shadow-2xs border-border/70 text-foreground [&[data-size]]:h-8'>
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side='top'>
              {pageSizeOptions.map((opt) => (
                <SelectItem key={opt} value={`${opt}`} className='text-xs'>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Page of Total */}
        <div className='flex items-center justify-center text-xs font-medium whitespace-nowrap text-foreground'>
          Halaman <span className='font-semibold text-foreground mx-1'>{currentPage}</span> dari{' '}
          {pageCount}
        </div>

        {/* Page Navigation Buttons */}
        <div className='flex items-center space-x-1'>
          {/* First Page */}
          <Button
            type='button'
            aria-label='Ke halaman pertama'
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex shadow-2xs border-border/70 text-foreground bg-background/60 hover:bg-background'
            onClick={() => onPageChange(1)}
            disabled={!canPrevious}
          >
            <Icons.chevronsLeft className='size-3.5' />
          </Button>

          {/* Previous Page */}
          <Button
            type='button'
            aria-label='Ke halaman sebelumnya'
            variant='outline'
            size='icon'
            className='size-8 shadow-2xs border-border/70 text-foreground bg-background/60 hover:bg-background'
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canPrevious}
          >
            <Icons.chevronLeft className='size-3.5' />
          </Button>

          {/* Next Page */}
          <Button
            type='button'
            aria-label='Ke halaman berikutnya'
            variant='outline'
            size='icon'
            className='size-8 shadow-2xs border-border/70 text-foreground bg-background/60 hover:bg-background'
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canNext}
          >
            <Icons.chevronRight className='size-3.5' />
          </Button>

          {/* Last Page */}
          <Button
            type='button'
            aria-label='Ke halaman terakhir'
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex shadow-2xs border-border/70 text-foreground bg-background/60 hover:bg-background'
            onClick={() => onPageChange(pageCount)}
            disabled={!canNext}
          >
            <Icons.chevronsRight className='size-3.5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
